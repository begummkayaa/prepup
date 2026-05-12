import { Router } from 'express';
import { checkDatabase } from '../../db/check.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'prepup-api',
    timestamp: new Date().toISOString(),
  });
});

router.get('/live', (_req, res) => {
  res.status(200).send('ok');
});

router.get('/ready', async (_req, res) => {
  const db = await checkDatabase();
  if (!db.configured) {
    res.status(200).json({ ready: true, database: 'not_configured' });
    return;
  }
  if (!db.ok) {
    res.status(503).json({ ready: false, database: 'unavailable' });
    return;
  }
  res.status(200).json({ ready: true, database: 'ok', latencyMs: db.latencyMs });
});

export { router as healthRouter };
