import { getApiUrl } from '@/lib/api-config';
import type { CvAnalysisAiReport } from '@/lib/cv-analysis-types';
import { normalizeCvAnalysisReport } from '@/lib/cv-analysis-types';

type AnalyzeResponseBody = {
  report?: CvAnalysisAiReport;
  error?: string;
  retryAfterSeconds?: number;
};

export async function requestCvAnalysis(payload: {
  pdfBase64: string;
  targetRole: string;
  sector: string;
  fileName?: string;
}): Promise<CvAnalysisAiReport> {
  const controller = new AbortController();
  // Kuyruk + Gemini cevabı toplamda bazen 70s'i geçebiliyor.
  const timeoutMs = 120_000;
  const t = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(getApiUrl('/v1/cv/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (e) {
    const aborted = e instanceof Error && (e.name === 'AbortError' || e.message.toLowerCase().includes('aborted'));
    if (aborted) {
      throw new Error(`Analiz isteği zaman aşımına uğradı (${Math.round(timeoutMs / 1000)}s). Lütfen tekrar dene.`);
    }
    throw e instanceof Error ? e : new Error('Analiz başlatılamadı.');
  } finally {
    clearTimeout(t);
  }

  let body: AnalyzeResponseBody = {};
  try {
    body = (await res.json()) as AnalyzeResponseBody;
  } catch {
    body = {};
  }

  if (!res.ok) {
    const base = body.error ?? `Sunucu hatası (${res.status})`;
    throw new Error(base);
  }

  return normalizeCvAnalysisReport(body.report);
}
