import { GoogleGenerativeAI } from '@google/generative-ai';
import { Router } from 'express';

import type { CvAnalysisAiReport } from './cv-analysis-types.js';

export const cvRouter = Router();

/**
 * Ücretsiz Gemini kotası (429) çok kolay doluyor. Aynı anda birden fazla analiz isteği
 * gelirse kota daha da hızlı tükeniyor. Bu yüzden endpoint'i tek kuyruğa alıyoruz.
 * (Basit, process-içi kuyruk: tek instance için yeterli.)
 */
let analyzeQueue: Promise<void> = Promise.resolve();
/** Son 429 sonrası yeni istekleri hemen reddet (kullanıcı tekrar tekrar basmasın). */
let quotaBlockedUntilMs = 0;
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000;

async function enqueueAnalyze<T>(fn: () => Promise<T>): Promise<T> {
  const run = analyzeQueue.then(fn);
  analyzeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function blockQuotaForCooldown(): void {
  quotaBlockedUntilMs = Date.now() + QUOTA_COOLDOWN_MS;
}

function quotaCooldownRemainingSeconds(): number {
  const remaining = quotaBlockedUntilMs - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

function extractJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const candidate = fence ? fence[1].trim() : trimmed;
  const parsed = JSON.parse(candidate) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Model çıktısı geçerli bir nesne değil.');
  }
  return parsed as Record<string, unknown>;
}

function coerceReport(parsed: Record<string, unknown>): CvAnalysisAiReport {
  const scoreRaw = parsed.compatibilityScore;
  const score = typeof scoreRaw === 'number' ? scoreRaw : Number(scoreRaw);
  const compatibilityScore = Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 70;

  const scoreSummary =
    typeof parsed.scoreSummary === 'string' && parsed.scoreSummary.trim()
      ? parsed.scoreSummary.trim()
      : 'Özgeçmişin hedef pozisyon ve sektörle uyumu değerlendirildi.';

  const asStringList = (key: string): string[] => {
    const v = parsed[key];
    if (!Array.isArray(v)) {
      return [];
    }
    return v.map((x) => String(x).trim()).filter(Boolean);
  };

  const strengths = asStringList('strengths');
  const gaps = asStringList('gaps');
  const suggestions = asStringList('suggestions');

  return {
    compatibilityScore,
    scoreSummary,
    strengths: strengths.length ? strengths : ['CV içeriği genel olarak okunabilir ve düzenli.'],
    gaps: gaps.length ? gaps : ['Analiz için daha ayrıntılı alanlar modele iletilemedi; CV metnini güçlendirin.'],
    suggestions: suggestions.length
      ? suggestions
      : ['Ölçülebilir başarılar ve sayılar ekleyerek etkinizi vurgulayın.'],
  };
}

function isQuotaOrRateLimit(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  return (
    lower.includes('429') ||
    lower.includes('quota') ||
    lower.includes('resource exhausted') ||
    lower.includes('too many requests') ||
    lower.includes('rate limit')
  );
}

type RetryInfoErrorDetail = { '@type'?: string; retryDelay?: string };
function parseRetryDelaySeconds(err: unknown): number | null {
  // @google/generative-ai hatasında genelde { status, errorDetails:[{RetryInfo:{retryDelay:"48s"}}] } gibi alanlar oluyor.
  const anyErr = err as { errorDetails?: unknown } | null | undefined;
  const details = Array.isArray(anyErr?.errorDetails) ? (anyErr?.errorDetails as unknown[]) : [];
  for (const d of details) {
    const detail = d as RetryInfoErrorDetail;
    if (detail && typeof detail.retryDelay === 'string') {
      const m = detail.retryDelay.trim().match(/^(\d+)(?:\.\d+)?s$/i);
      if (m) {
        const sec = Number(m[1]);
        return Number.isFinite(sec) && sec > 0 ? sec : null;
      }
    }
  }
  return null;
}

function quotaRetryAfterSeconds(err: unknown): number {
  const fromApi = parseRetryDelaySeconds(err);
  return fromApi ?? Math.ceil(QUOTA_COOLDOWN_MS / 1000);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let t: NodeJS.Timeout | undefined;
  const timeout = new Promise<T>((_resolve, reject) => {
    t = setTimeout(() => reject(new Error(`${label} timeout (${Math.round(ms / 1000)}s)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (t) clearTimeout(t);
  });
}


function formatCvAnalyzeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (
    lower.includes('fetch failed') ||
    lower.includes('econnrefused') ||
    lower.includes('econnreset') ||
    lower.includes('enotfound') ||
    lower.includes('network') ||
    lower.includes('socket')
  ) {
    return (
      'Google Gemini API\'ye bağlanılamadı (ağ/DNS/firewall).\n' +
        '• Bilgisayarda tarayıcıdan https://generativelanguage.googleapis.com adresine erişilebildiğini kontrol edin.\n' +
        '• VPN ve agresif antivirüsü geçici kapatın; iş yerinde proxy varsa çıkış izni gerekebilir.\n' +
        '• `.env` içinde GEMINI_MODEL=gemini-2.0-flash veya gemini-1.5-flash deneyin; backend\'i yeniden başlatın.'
    );
  }

  if (lower.includes('api key') || lower.includes('permission_denied') || lower.includes('403')) {
    return 'Gemini API anahtarı geçersiz veya bu API için yetkisiz. AI Studio\'dan yeni anahtar oluşturup GEMINI_API_KEY güncelleyin.';
  }

  if (lower.includes('429') || lower.includes('quota') || lower.includes('resource exhausted')) {
    return (
      'Gemini API kotası doldu (429). Bu bir bağlantı/zaman aşımı hatası değil.\n\n' +
      'Ne yapabilirsin:\n' +
      '• Şimdilik tekrar deneme — her deneme kotayı daha da tüketir.\n' +
      '• Google AI Studio’dan yeni bir GEMINI_API_KEY oluşturup `.env` dosyasına yaz; backend’i yeniden başlat.\n' +
      '• Günlük ücretsiz kota sıfırlandıysa (genelde gece yarısı Pasifik saati) tekrar dene.\n' +
      '• Kalıcı çözüm: AI Studio / Cloud’da faturalandırmayı aç.\n' +
      '• Kota tablosu: https://ai.google.dev/gemini-api/docs/rate-limits'
    );
  }

  if (lower.includes('timeout') || lower.includes('zaman aşımı')) {
    return (
      'Gemini yanıtı çok uzun sürdü (timeout).\n\n' +
      'Ne yapabilirsin:\n' +
      '• PDF daha küçük/az sayfalı bir dosya ile dene.\n' +
      '• 1–2 dakika sonra tekrar dene (kota/yoğunluk anlık etkileyebilir).'
    );
  }

  if (lower.includes('404') || lower.includes('not found')) {
    return (
      `Bu model adı API anahtarın için kullanılamıyor olabilir (404).\n` +
        `Google AI Studio'da üretilen anahtar için sıklıkla şunlar çalışır: gemini-2.0-flash, gemini-1.5-flash.\n` +
        `.env içinde GEMINI_MODEL=gemini-2.0-flash yapıp backend'i yeniden başlatın.\nTeknik: ${raw}`
    );
  }

  return raw.length > 280 ? `${raw.slice(0, 277)}…` : raw;
}

function geminiModelCandidates(): string[] {
  /** AI Studio API key ile gemini-1.5-pro sıklıkla 404 döner; pro için Vertex gerekir. */
  const preferred = (process.env.GEMINI_MODEL ?? 'gemini-2.5-flash').trim() || 'gemini-2.5-flash';
  const fallbacks = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  const ordered = [preferred, ...fallbacks.filter((m) => m !== preferred)];
  return [...new Set(ordered)];
}

function shouldRetryWithAnotherGeminiModel(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  return (
    lower.includes('fetch failed') ||
    lower.includes('econnrefused') ||
    lower.includes('econnreset') ||
    lower.includes('enotfound') ||
    lower.includes('socket') ||
    lower.includes('network') ||
    lower.includes('404') ||
    lower.includes('not found') ||
    lower.includes('was not found')
  );
}

cvRouter.post('/analyze', async (req, res) => {
  const startedAt = Date.now();
  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim();
  if (!apiKey) {
    res.status(503).json({ error: 'GEMINI_API_KEY tanımlı değil. backend/.env dosyasına ekleyin.' });
    return;
  }

  const candidates = geminiModelCandidates();

  const pdfBase64 =
    typeof req.body?.pdfBase64 === 'string' ? req.body.pdfBase64.replace(/\s/g, '') : '';
  const targetRole =
    typeof req.body?.targetRole === 'string' ? req.body.targetRole.trim().slice(0, 200) : '';
  const sector = typeof req.body?.sector === 'string' ? req.body.sector.trim().slice(0, 200) : '';

  if (!pdfBase64 || pdfBase64.length < 80) {
    res.status(400).json({ error: 'Geçerli bir PDF (base64) gönderilmedi.' });
    return;
  }
  if (!targetRole || !sector) {
    res.status(400).json({ error: 'Hedef pozisyon ve sektör zorunludur.' });
    return;
  }

  const cooldownSec = quotaCooldownRemainingSeconds();
  if (cooldownSec > 0) {
    const message =
      formatCvAnalyzeError(new Error('429 quota')) +
      `\n\nSon deneme kotaya takıldı. ${cooldownSec}s boyunca yeni istek kabul edilmiyor.`;
    res.setHeader('Retry-After', String(cooldownSec));
    res.status(429).json({ error: message, retryAfterSeconds: cooldownSec });
    return;
  }

  console.info(`[cv/analyze] request received (pdfBase64=${pdfBase64.length} chars)`);

  const prompt = `Sen kariyer ve işe alım konusunda uzmansın. Ekteki dosya bir özgeçmiş (PDF).

Bağlam:
- Hedef pozisyon: ${targetRole}
- Sektör: ${sector}

Görev: CV'yi bu hedefe göre değerlendir. Çıktıyı yalnızca geçerli bir JSON nesnesi olarak ver (markdown veya kod çiti kullanma). Şema:
{
  "compatibilityScore": <0 ile 100 arası tam sayı, pozisyon uyumu>,
  "scoreSummary": "<Türkçe, 1-2 cümle, profesyonel ton>",
  "strengths": ["<madde>", "..."] ,
  "gaps": ["<eksik veya zayıf alan>", "..."] ,
  "suggestions": ["<iyileştirme önerisi>", "..."]
}

Kurallar:
- strengths, gaps ve suggestions dizilerinin her biri en az 2, en fazla 6 madde içersin.
- Madde başlığı kullanma; doğrudan net ifadeler yaz.
- Türkçe yaz.`;

  await enqueueAnalyze(async () => {
    try {
      const queuedForMs = Date.now() - startedAt;
      if (queuedForMs > 50) {
        console.info(`[cv/analyze] dequeued after ${queuedForMs}ms`);
      }
    const genAI = new GoogleGenerativeAI(apiKey);
    const attempted: string[] = [];
    let lastErr: unknown;

    const parts = [
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      },
      { text: prompt },
    ];

    async function generateContentForModel(modelId: string) {
      const model = genAI.getGenerativeModel({ model: modelId });
      return await withTimeout(model.generateContent(parts), 60_000, `Gemini(${modelId})`);
    }

    for (let i = 0; i < candidates.length; i++) {
      const mid = candidates[i];
      attempted.push(mid);
      try {
        const result = await generateContentForModel(mid);

        const text = result.response.text();
        const parsed = extractJsonObject(text);
        const report = coerceReport(parsed);
        res.json({ report });
        console.info(`[cv/analyze] success model=${mid} in ${Date.now() - startedAt}ms`);
        return;
      } catch (e) {
        lastErr = e;

        if (isQuotaOrRateLimit(e)) {
          blockQuotaForCooldown();
          const retryAfterSeconds = quotaRetryAfterSeconds(e);
          const message = formatCvAnalyzeError(e);
          console.warn(`[cv/analyze] quota hit model=${mid} retryAfter=${retryAfterSeconds}s`);
          res.setHeader('Retry-After', String(retryAfterSeconds));
          res.status(429).json({
            error: message,
            retryAfterSeconds,
          });
          return;
        }

        const canRetry = shouldRetryWithAnotherGeminiModel(e) && i < candidates.length - 1;
        console.warn(`[cv/analyze] model=${mid} failed (retry=${canRetry})`, e);
        if (!canRetry) {
          break;
        }
      }
    }

    const detail =
      attempted.length > 1 ? `\n\nDenenen modeller: ${attempted.join(' → ')}` : '';
    const message =
      lastErr !== undefined ? formatCvAnalyzeError(lastErr) + detail : 'Analiz başarısız.' + detail;
    console.error('[cv/analyze] all models failed', lastErr);
    res.status(502).json({ error: message });
    } catch (err) {
      const message = formatCvAnalyzeError(err);
      console.error('[cv/analyze]', err);
      res.status(502).json({ error: message });
    }
  });
});
