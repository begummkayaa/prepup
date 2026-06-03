import { getApiUrl } from '@/lib/api-config';
import { getStoredToken } from '@/lib/auth-token';

export type HistoryListItem = {
  id: string;
  type: 'interview' | 'cv';
  title: string;
  dateLabel: string;
  rightLabel: string;
  icon: 'chatbubble' | 'document-text';
  createdAt: string;
};

export type InterviewDetailPayload = {
  kind: 'interview';
  id: string;
  title: string;
  dateLabel: string;
  score: number;
  overallFeedback: string;
  questions: Array<{
    question: string;
    answer: string;
    feedback: string;
  }>;
  tips: string[];
};

export type CvDetailPayload = {
  kind: 'cv';
  id: string;
  title: string;
  dateLabel: string;
  matchPercent: number;
  scoreSummary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
};

export type ReportDetailPayload = InterviewDetailPayload | CvDetailPayload;

async function authGet<T>(path: string): Promise<T> {
  const token = await getStoredToken();
  const res = await fetch(getApiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
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

export async function fetchHistory(): Promise<HistoryListItem[]> {
  const data = await authGet<{ items: HistoryListItem[] }>('/v1/history');
  return Array.isArray(data.items) ? data.items : [];
}

export async function fetchHistoryDetail(
  type: 'interview' | 'cv',
  id: string,
): Promise<ReportDetailPayload> {
  return authGet<ReportDetailPayload>(`/v1/history/${type}/${id}`);
}
