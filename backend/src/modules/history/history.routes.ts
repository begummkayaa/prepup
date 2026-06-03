import { Router } from 'express';

import { getPrisma } from '../../db/prisma.js';
import { requireAuth } from '../../middleware/auth.js';

export const historyRouter = Router();

function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** GET /v1/history — kullanıcının tüm geçmişini döner (mülakat + CV, tarihe göre azalan) */
historyRouter.get('/', requireAuth, async (req, res) => {
  const userId = req.authUserId!;

  try {
    const db = getPrisma();
    if (!db) {
      res.status(503).json({ error: 'Veritabanı bağlantısı yok.' });
      return;
    }
    const [interviews, cvAnalyses] = await Promise.all([
      db.interviewSession.findMany({
        where: { userId },
        select: { id: true, role: true, score: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      db.cvAnalysis.findMany({
        where: { userId },
        select: { id: true, targetRole: true, compatibilityScore: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const interviewItems = interviews.map((s) => ({
      id: s.id,
      type: 'interview' as const,
      title: `${s.role} Mülakatı`,
      dateLabel: formatDate(s.createdAt),
      rightLabel: `${s.score}/100`,
      icon: 'chatbubble' as const,
      createdAt: s.createdAt.toISOString(),
    }));

    const cvItems = cvAnalyses.map((a) => ({
      id: a.id,
      type: 'cv' as const,
      title: `${a.targetRole} CV Analizi`,
      dateLabel: formatDate(a.createdAt),
      rightLabel: `%${a.compatibilityScore} Uyumluluk`,
      icon: 'document-text' as const,
      createdAt: a.createdAt.toISOString(),
    }));

    const items = [...interviewItems, ...cvItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    res.json({ items });
  } catch (e) {
    console.error('[history] liste alınamadı', e);
    res.status(500).json({ error: 'Geçmiş alınamadı.' });
  }
});

/** GET /v1/history/interview/:id — mülakat detayı */
historyRouter.get('/interview/:id', requireAuth, async (req, res) => {
  const userId = req.authUserId!;
  const { id } = req.params;

  try {
    const db = getPrisma();
    if (!db) {
      res.status(503).json({ error: 'Veritabanı bağlantısı yok.' });
      return;
    }
    const session = await db.interviewSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      res.status(404).json({ error: 'Rapor bulunamadı.' });
      return;
    }

    res.json({
      kind: 'interview',
      id: session.id,
      title: `${session.role} Mülakatı`,
      dateLabel: formatDate(session.createdAt),
      score: session.score,
      overallFeedback: session.overallFeedback,
      questions: session.questions,
      tips: session.tips,
    });
  } catch (e) {
    console.error('[history/interview] detay alınamadı', e);
    res.status(500).json({ error: 'Rapor alınamadı.' });
  }
});

/** GET /v1/history/cv/:id — CV analiz detayı */
historyRouter.get('/cv/:id', requireAuth, async (req, res) => {
  const userId = req.authUserId!;
  const { id } = req.params;

  try {
    const db = getPrisma();
    if (!db) {
      res.status(503).json({ error: 'Veritabanı bağlantısı yok.' });
      return;
    }
    const analysis = await db.cvAnalysis.findFirst({
      where: { id, userId },
    });

    if (!analysis) {
      res.status(404).json({ error: 'Rapor bulunamadı.' });
      return;
    }

    res.json({
      kind: 'cv',
      id: analysis.id,
      title: `${analysis.targetRole} CV Analizi`,
      dateLabel: formatDate(analysis.createdAt),
      matchPercent: analysis.compatibilityScore,
      scoreSummary: analysis.scoreSummary,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      suggestions: analysis.suggestions,
    });
  } catch (e) {
    console.error('[history/cv] detay alınamadı', e);
    res.status(500).json({ error: 'Rapor alınamadı.' });
  }
});
