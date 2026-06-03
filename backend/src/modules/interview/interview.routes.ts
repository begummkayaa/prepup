import { GoogleGenerativeAI } from '@google/generative-ai';
import { Router } from 'express';

import { optionalAuth } from '../../middleware/auth.js';
import { getPrisma } from '../../db/prisma.js';

export const interviewRouter = Router();

let quotaBlockedUntilMs = 0;
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000;

function blockQuota(): void {
  quotaBlockedUntilMs = Date.now() + QUOTA_COOLDOWN_MS;
}

function quotaCooldownRemaining(): number {
  const r = quotaBlockedUntilMs - Date.now();
  return r > 0 ? Math.ceil(r / 1000) : 0;
}

function geminiModelId(): string {
  return (process.env.GEMINI_MODEL ?? 'gemini-2.5-flash').trim() || 'gemini-2.5-flash';
}

function geminiModelCandidates(): string[] {
  const preferred = geminiModelId();
  const fallbacks = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  const ordered = [preferred, ...fallbacks.filter((m) => m !== preferred)];
  return [...new Set(ordered)];
}

function shouldTryNextModel(err: unknown): boolean {
  const s = err instanceof Error ? err.message : String(err);
  const l = s.toLowerCase();
  return (
    l.includes('503') ||
    l.includes('service unavailable') ||
    l.includes('high demand') ||
    l.includes('404') ||
    l.includes('not found') ||
    l.includes('fetch failed') ||
    l.includes('econnrefused')
  );
}

function isQuotaError(err: unknown): boolean {
  const s = err instanceof Error ? err.message : String(err);
  const l = s.toLowerCase();
  return (
    l.includes('429') ||
    l.includes('quota') ||
    l.includes('resource exhausted') ||
    l.includes('too many requests')
  );
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: NodeJS.Timeout | undefined;
  const timeout = new Promise<T>((_r, reject) => {
    t = setTimeout(() => reject(new Error(`Gemini yanıtı zaman aşımına uğradı (${Math.round(ms / 1000)}s)`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => {
    if (t) clearTimeout(t);
  });
}

function extractJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const candidate = fence ? fence[1].trim() : trimmed;
  const parsed = JSON.parse(candidate) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Model çıktısı geçerli JSON değil.');
  }
  return parsed as Record<string, unknown>;
}

type ConvMessage = { role: 'user' | 'model'; content: string };

function formatHistory(history: ConvMessage[]): string {
  return history
    .map(m => `${m.role === 'model' ? 'Mülakat yapan' : 'Aday'}: ${m.content}`)
    .join('\n\n');
}

/** POST /v1/interview/next-question */
interviewRouter.post('/next-question', async (req, res) => {
  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim();
  if (!apiKey) {
    res.status(503).json({ error: 'GEMINI_API_KEY tanımlı değil.' });
    return;
  }

  const cooldown = quotaCooldownRemaining();
  if (cooldown > 0) {
    res.status(429).json({ error: `Gemini kotası doldu. ${cooldown}s sonra tekrar dene.`, retryAfterSeconds: cooldown });
    return;
  }

  const targetRole =
    typeof req.body?.targetRole === 'string' ? req.body.targetRole.trim().slice(0, 200) : '';
  const sector =
    typeof req.body?.sector === 'string' ? req.body.sector.trim().slice(0, 200) : '';
  const history: ConvMessage[] = Array.isArray(req.body?.history)
    ? (req.body.history as unknown[]).filter(
        (m): m is ConvMessage =>
          m !== null &&
          typeof m === 'object' &&
          (m as ConvMessage).role === 'user' || (m as ConvMessage).role === 'model'
      )
    : [];
  const questionNumber =
    typeof req.body?.questionNumber === 'number' && Number.isFinite(req.body.questionNumber)
      ? req.body.questionNumber
      : 1;
  const totalQuestions =
    typeof req.body?.totalQuestions === 'number' && Number.isFinite(req.body.totalQuestions)
      ? req.body.totalQuestions
      : 5;

  if (!targetRole) {
    res.status(400).json({ error: 'targetRole zorunludur.' });
    return;
  }

  const contextLine = sector
    ? `${targetRole} pozisyonu için, ${sector} sektöründe`
    : `${targetRole} pozisyonu için`;

  const isLast = questionNumber > totalQuestions;

  let prompt: string;
  if (isLast) {
    prompt = `Sen deneyimli bir İnsan Kaynakları uzmanısın. ${contextLine} Türkçe mülakat yapıyordun.

${history.length > 0 ? `Mülakat konuşması:\n${formatHistory(history)}\n\n` : ''}${totalQuestions} soruluk mülakat tamamlandı. Adaya içten teşekkür eden ve gösterdiği çabayı öven, kısa ve samimi bir kapanış mesajı yaz. Sadece kapanış mesajını yaz, başka bir şey ekleme.`;
  } else {
    prompt = `Sen deneyimli bir İnsan Kaynakları uzmanısın. ${contextLine} Türkçe mülakat yapıyorsun.

Toplam ${totalQuestions} soru sorulacak. Şu an ${questionNumber}. soruyu soruyorsun.${history.length > 0 ? `\n\nŞimdiye kadarki konuşma:\n${formatHistory(history)}` : ''}

Şimdi ${questionNumber}. mülakat sorusunu sor. Sadece soruyu yaz, numara veya ek açıklama ekleme. Türkçe yaz.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidates = geminiModelCandidates();
    let lastErr: unknown;

    for (let i = 0; i < candidates.length; i++) {
      const mid = candidates[i];
      try {
        const model = genAI.getGenerativeModel({ model: mid });
        const result = await withTimeout(model.generateContent(prompt), 30_000);
        const question = result.response.text().trim();
        res.json({ question, questionNumber, isLast });
        console.info(`[interview/next-question] q=${questionNumber}/${totalQuestions} isLast=${isLast} model=${mid}`);
        return;
      } catch (e) {
        lastErr = e;
        if (isQuotaError(e)) {
          blockQuota();
          res.status(429).json({ error: 'Gemini API kotası doldu. 5 dakika sonra tekrar dene.' });
          return;
        }
        if (shouldTryNextModel(e) && i < candidates.length - 1) {
          console.warn(`[interview/next-question] model=${mid} başarısız, sonraki deneniyor...`);
          continue;
        }
        break;
      }
    }

    console.error('[interview/next-question]', lastErr);
    res.status(502).json({ error: 'Soru alınamadı. Tekrar dene.' });
  } catch (e) {
    if (isQuotaError(e)) {
      blockQuota();
      res.status(429).json({ error: 'Gemini API kotası doldu. 5 dakika sonra tekrar dene.' });
      return;
    }
    console.error('[interview/next-question]', e);
    res.status(502).json({ error: 'Soru alınamadı. Tekrar dene.' });
  }
});

/** POST /v1/interview/summary */
interviewRouter.post('/summary', optionalAuth, async (req, res) => {
  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim();
  if (!apiKey) {
    res.status(503).json({ error: 'GEMINI_API_KEY tanımlı değil.' });
    return;
  }

  const cooldown = quotaCooldownRemaining();
  if (cooldown > 0) {
    res.status(429).json({ error: `Gemini kotası doldu. ${cooldown}s sonra tekrar dene.`, retryAfterSeconds: cooldown });
    return;
  }

  const targetRole =
    typeof req.body?.targetRole === 'string' ? req.body.targetRole.trim().slice(0, 200) : '';
  const sector =
    typeof req.body?.sector === 'string' ? req.body.sector.trim().slice(0, 200) : '';
  const history: ConvMessage[] = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!targetRole) {
    res.status(400).json({ error: 'targetRole zorunludur.' });
    return;
  }
  if (history.length < 2) {
    res.status(400).json({ error: 'Özet için en az bir soru-cevap gerekli.' });
    return;
  }

  const contextLine = sector
    ? `${targetRole} pozisyonu, ${sector} sektörü`
    : `${targetRole} pozisyonu`;

  const prompt = `Sen deneyimli bir İnsan Kaynakları uzmanısın. Aşağıdaki mülakat konuşmasını objektif olarak değerlendir.

Pozisyon: ${contextLine}

Mülakat konuşması:
${formatHistory(history)}

Değerlendirmeyi YALNIZCA geçerli bir JSON nesnesi olarak ver, başka hiçbir metin yazma:
{
  "score": <0-100 tam sayı, genel mülakat başarısı>,
  "overallFeedback": "<Türkçe, 2-3 cümle genel değerlendirme>",
  "questionAnalysis": [
    {
      "question": "<soru metni>",
      "answer": "<adayın cevabının kısa özeti, 1-2 cümle>",
      "feedback": "<bu cevap için kısa ve yapıcı Türkçe geri bildirim>"
    }
  ],
  "tips": ["<iyileştirme önerisi>", "<iyileştirme önerisi>"]
}

Kurallar: tips dizisi 2-4 madde, questionAnalysis her soru için bir kayıt içermeli, Türkçe yaz.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidates = geminiModelCandidates();
    let text = '';
    let lastErr: unknown;

    for (let i = 0; i < candidates.length; i++) {
      const mid = candidates[i];
      try {
        const model = genAI.getGenerativeModel({ model: mid });
        const result = await withTimeout(model.generateContent(prompt), 60_000);
        text = result.response.text().trim();
        break;
      } catch (e) {
        lastErr = e;
        if (isQuotaError(e)) {
          blockQuota();
          res.status(429).json({ error: 'Gemini API kotası doldu. 5 dakika sonra tekrar dene.' });
          return;
        }
        if (shouldTryNextModel(e) && i < candidates.length - 1) {
          console.warn(`[interview/summary] model=${mid} başarısız, sonraki deneniyor...`);
          continue;
        }
        throw lastErr;
      }
    }

    if (!text) throw lastErr ?? new Error('Boş yanıt');

    const parsed = extractJsonObject(text);

    const score =
      typeof parsed.score === 'number'
        ? Math.min(100, Math.max(0, Math.round(parsed.score)))
        : 70;
    const overallFeedback =
      typeof parsed.overallFeedback === 'string' && parsed.overallFeedback.trim()
        ? parsed.overallFeedback.trim()
        : 'Mülakat başarıyla tamamlandı.';
    const tips = Array.isArray(parsed.tips)
      ? (parsed.tips as unknown[]).map(t => String(t).trim()).filter(Boolean)
      : [];
    const questionAnalysis = Array.isArray(parsed.questionAnalysis)
      ? (parsed.questionAnalysis as unknown[])
          .map(q => {
            const o = q as Record<string, unknown>;
            return {
              question: typeof o.question === 'string' ? o.question.trim() : '',
              answer: typeof o.answer === 'string' ? o.answer.trim() : '',
              feedback: typeof o.feedback === 'string' ? o.feedback.trim() : '',
            };
          })
          .filter(q => q.question)
      : [];

    res.json({ score, overallFeedback, questionAnalysis, tips });
    console.info(`[interview/summary] score=${score} questions=${questionAnalysis.length}`);

    if (req.authUserId) {
      const db = getPrisma();
      if (db) {
        db.interviewSession.create({
          data: {
            userId: req.authUserId,
            role: targetRole,
            sector,
            score,
            overallFeedback,
            questions: questionAnalysis as object[],
            tips,
          },
        }).catch((e: unknown) => console.warn('[interview/summary] kayıt başarısız', e));
      }
    }
  } catch (e) {
    if (isQuotaError(e)) {
      blockQuota();
      res.status(429).json({ error: 'Gemini API kotası doldu. 5 dakika sonra tekrar dene.' });
      return;
    }
    console.error('[interview/summary]', e);
    res.status(502).json({ error: 'Özet oluşturulamadı. Tekrar dene.' });
  }
});
