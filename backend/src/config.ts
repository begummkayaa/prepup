/**
 * Tüm runtime ayarları tek yerden; Docker / .env ile değiştirilebilir.
 */
function boolFromEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export type AppConfig = {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  trustProxy: boolean;
  corsOrigins: string[];
  jwtSecret: string;
  jwtExpiresIn: string;
};

export function loadConfig(): AppConfig {
  const apiPrefix = (process.env.API_PREFIX ?? '/api').replace(/\/$/, '') || '/api';
  const corsRaw = process.env.CORS_ORIGINS ?? '*';
  const corsOrigins =
    corsRaw.trim() === '*'
      ? ['*']
      : corsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  let jwtSecret = (process.env.JWT_SECRET ?? '').trim();
  if (!jwtSecret && nodeEnv === 'production') {
    throw new Error('JWT_SECRET ortam değişkeni production için zorunludur.');
  }
  if (!jwtSecret) {
    jwtSecret = 'prepup-dev-insecure-jwt-secret';
  }

  return {
    nodeEnv,
    port: Number.parseInt(process.env.PORT ?? '3000', 10) || 3000,
    apiPrefix,
    trustProxy: boolFromEnv(process.env.TRUST_PROXY, false),
    corsOrigins,
    jwtSecret,
    jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '7d').trim() || '7d',
  };
}
