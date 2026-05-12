import { Router } from 'express';
import { checkDatabase } from '../../db/check.js';

const router = Router();

router.get('/status', async (_req, res) => {
  const result = await checkDatabase();

  if (!result.configured) {
    res.status(200).json({
      configured: false,
      ok: true,
      message: 'DATABASE_URL tanımlı değil; bağlantı testi atlandı',
    });
    return;
  }

  const payload = {
    configured: true,
    ok: result.ok,
    latencyMs: result.latencyMs,
    ...(result.detail ? { detail: result.detail } : {}),
  };

  res.status(result.ok ? 200 : 503).json(payload);
});

export { router as databaseRouter };
