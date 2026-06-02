/** Gemini analiz çıktısı (sunucu doğrulayıp döner). */
export type CvAnalysisAiReport = {
  compatibilityScore: number;
  scoreSummary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
};

export const DEFAULT_CV_ANALYSIS_REPORT: CvAnalysisAiReport = {
  compatibilityScore: 82,
  scoreSummary: 'Özgeçmişin hedeflediğin pozisyonla büyük oranda örtüşüyor.',
  strengths: ['Teknik projelerdeki derinlik', 'Kullanılan teknolojilerin güncelliği'],
  gaps: ['Birim test (Unit Testing) tecrübesi eksikliği', 'Cloud servisleri bilgisi'],
  suggestions: [
    'Projelerinde kullandığın teknolojileri daha spesifik belirt.',
    'Sertifikalarını daha görünür kıl.',
  ],
};

export function normalizeCvAnalysisReport(raw: Partial<CvAnalysisAiReport> | null | undefined): CvAnalysisAiReport {
  const fallback = DEFAULT_CV_ANALYSIS_REPORT;
  const score = Number(raw?.compatibilityScore);
  const compatibilityScore =
    Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : fallback.compatibilityScore;

  const scoreSummary =
    typeof raw?.scoreSummary === 'string' && raw.scoreSummary.trim() ? raw.scoreSummary.trim() : fallback.scoreSummary;

  const strengths = sanitizeStringArray(raw?.strengths, fallback.strengths);
  const gaps = sanitizeStringArray(raw?.gaps, fallback.gaps);
  const suggestions = sanitizeStringArray(raw?.suggestions, fallback.suggestions);

  return { compatibilityScore, scoreSummary, strengths, gaps, suggestions };
}

function sanitizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }
  const cleaned = value.map((x) => String(x).trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : fallback;
}
