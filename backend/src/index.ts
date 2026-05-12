import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

import { createApp } from './app.js';
import { loadConfig } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');

/** Önce repo kökü .env (Expo ile paylaşılan), sonra backend/.env ile override. */
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(backendRoot, '.env') });

const config = loadConfig();
const app = createApp(config);

/** 0.0.0.0: telefon / LAN’dan gelen istekleri de kabul et (yalnızca localhost değil) */
app.listen(config.port, '0.0.0.0', () => {
  console.info(`prepup-api listening on 0.0.0.0:${config.port} (${config.nodeEnv})`);
});
