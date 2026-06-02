import { getApiUrl } from '@/lib/api-config';

export type InterviewMessage = {
  role: 'user' | 'model';
  content: string;
};

export type NextQuestionResult = {
  question: string;
  questionNumber: number;
  isLast: boolean;
};

export type InterviewSummary = {
  score: number;
  overallFeedback: string;
  questionAnalysis: Array<{
    question: string;
    answer: string;
    feedback: string;
  }>;
  tips: string[];
};

const TIMEOUT_MS = 60_000;

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(getApiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    const isAbort =
      e instanceof Error &&
      (e.name === 'AbortError' || e.message.toLowerCase().includes('aborted'));
    if (isAbort) throw new Error('İstek zaman aşımına uğradı. Tekrar dene.');
    throw e instanceof Error ? e : new Error('Bağlantı hatası.');
  } finally {
    clearTimeout(t);
  }
  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error((data.error as string | undefined) ?? `Sunucu hatası (${res.status})`);
  }
  return data as T;
}

export async function fetchNextQuestion(payload: {
  targetRole: string;
  sector?: string;
  history: InterviewMessage[];
  questionNumber: number;
  totalQuestions?: number;
}): Promise<NextQuestionResult> {
  const r = await postJson<{ question?: string; questionNumber?: number; isLast?: boolean }>(
    '/v1/interview/next-question',
    payload,
  );
  return {
    question: typeof r.question === 'string' && r.question ? r.question : '...',
    questionNumber:
      typeof r.questionNumber === 'number' ? r.questionNumber : payload.questionNumber,
    isLast: r.isLast === true,
  };
}

export async function fetchInterviewSummary(payload: {
  targetRole: string;
  sector?: string;
  history: InterviewMessage[];
}): Promise<InterviewSummary> {
  const r = await postJson<{
    score?: unknown;
    overallFeedback?: unknown;
    questionAnalysis?: unknown;
    tips?: unknown;
  }>('/v1/interview/summary', payload);

  const score =
    typeof r.score === 'number' ? Math.min(100, Math.max(0, Math.round(r.score))) : 70;
  const overallFeedback =
    typeof r.overallFeedback === 'string' && r.overallFeedback.trim()
      ? r.overallFeedback.trim()
      : 'Mülakat başarıyla tamamlandı.';
  const tips = Array.isArray(r.tips)
    ? (r.tips as unknown[]).map(t => String(t).trim()).filter(Boolean)
    : [];
  const questionAnalysis = Array.isArray(r.questionAnalysis)
    ? (r.questionAnalysis as unknown[])
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

  return { score, overallFeedback, questionAnalysis, tips };
}

export function normalizeSummary(raw: unknown): InterviewSummary {
  if (!raw || typeof raw !== 'object') {
    return {
      score: 70,
      overallFeedback: 'Mülakat tamamlandı.',
      questionAnalysis: [],
      tips: [],
    };
  }
  const r = raw as Record<string, unknown>;
  const score =
    typeof r.score === 'number' ? Math.min(100, Math.max(0, Math.round(r.score))) : 70;
  const overallFeedback =
    typeof r.overallFeedback === 'string' ? r.overallFeedback : 'Mülakat tamamlandı.';
  const tips = Array.isArray(r.tips)
    ? (r.tips as unknown[]).map(t => String(t)).filter(Boolean)
    : [];
  const questionAnalysis = Array.isArray(r.questionAnalysis)
    ? (r.questionAnalysis as unknown[])
        .map(q => {
          const o = q as Record<string, unknown>;
          return {
            question: typeof o.question === 'string' ? o.question : '',
            answer: typeof o.answer === 'string' ? o.answer : '',
            feedback: typeof o.feedback === 'string' ? o.feedback : '',
          };
        })
        .filter(q => q.question)
    : [];
  return { score, overallFeedback, questionAnalysis, tips };
}
