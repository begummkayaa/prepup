import { Router } from 'express';
import type { RouteModule } from '../../types/module.js';
import { authRouter } from '../auth/auth.routes.js';
import { databaseRouter } from '../database/database.routes.js';
import { healthRouter } from '../health/health.routes.js';
import { systemRouter } from '../system/system.routes.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    message: 'PrepUp API v1',
    endpoints: ['/v1/auth/register', '/v1/auth/login', '/v1/auth/me', '/v1/system/info', '/v1/health', '/v1/database/status'],
  });
});

router.use('/auth', authRouter);
router.use('/health', healthRouter);
router.use('/system', systemRouter);
router.use('/database', databaseRouter);

export const v1Module: RouteModule = {
  basePath: '/v1',
  router,
};
