import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { AppConfig } from './config.js';
import { getRouteModules } from './routes/registry.js';

export function createApp(config: AppConfig) {
  const app = express();

  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(express.json({ limit: '25mb' }));

  // Debug: /api istekleri telefondan geliyor mu, ne kadar sürüyor gör.
  app.use((req, res, next) => {
    if (!req.path.startsWith(config.apiPrefix)) {
      next();
      return;
    }
    const startedAt = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - startedAt;
      // eslint-disable-next-line no-console
      console.info(`[api] ${req.method} ${req.path} -> ${res.statusCode} (${ms}ms)`);
    });
    next();
  });

  const corsOptions: cors.CorsOptions =
    config.corsOrigins.includes('*') || config.corsOrigins.length === 0
      ? { origin: true }
      : { origin: config.corsOrigins };

  app.use(cors(corsOptions));

  app.get('/', (_req, res) => {
    res.json({
      service: 'prepup-api',
      api: config.apiPrefix,
    });
  });

  const api = express.Router();
  for (const mod of getRouteModules()) {
    api.use(mod.basePath, mod.router);
  }
  app.use(config.apiPrefix, api);

  return app;
}
