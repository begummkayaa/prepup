import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';

const router = Router();

function packageVersion(): string {
  try {
    const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
    const raw = readFileSync(join(root, 'package.json'), 'utf8');
    const pkg = JSON.parse(raw) as { version?: string };
    return pkg.version ?? '0.1.0';
  } catch {
    return '0.1.0';
  }
}

router.get('/info', (_req, res) => {
  res.json({
    name: '@prepup/api',
    version: packageVersion(),
    env: process.env.NODE_ENV ?? 'development',
  });
});

export { router as systemRouter };
