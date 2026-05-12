import { getPrisma } from './prisma.js';

export type DbCheckResult = {
  configured: boolean;
  ok: boolean;
  latencyMs?: number;
  /** Yalnızca development’ta dolu olabilir */
  detail?: string;
};

export async function checkDatabase(): Promise<DbCheckResult> {
  const prisma = getPrisma();
  if (!prisma) {
    return { configured: false, ok: false };
  }

  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { configured: true, ok: true, latencyMs: Date.now() - started };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      ok: false,
      latencyMs: Date.now() - started,
      detail: process.env.NODE_ENV === 'development' ? detail : undefined,
    };
  }
}
