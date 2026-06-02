import { getApiUrl } from '@/lib/api-config';

const FETCH_TIMEOUT_MS = 22_000;

function mapNetworkError(err: unknown, requestUrl: string): Error {
  const isAbort =
    (typeof DOMException !== 'undefined' &&
      err instanceof DOMException &&
      err.name === 'AbortError') ||
    (err instanceof Error && err.name === 'AbortError');
  if (isAbort) {
    return new Error(
      `Bağlantı zaman aşımı (${FETCH_TIMEOUT_MS / 1000}s).\nAdres: ${requestUrl}\n` +
        'PC’de backend çalışıyor mu (`backend` klasöründe `npm run dev`)? PostgreSQL açık mı?\n' +
        'Telefon ile bilgisayar aynı Wi‑Fi’da mı? `.env` içindeki EXPO_PUBLIC_API_URL bilgisayarının güncel IPv4 adresi mi?\n' +
        'USB ile bağlıysan: `npm run adb:reverse-api` sonra `.env` içinde `EXPO_PUBLIC_API_URL=http://127.0.0.1:3001` kullan.'
    );
  }

  const isNetworkFailure =
    (err instanceof TypeError && String(err.message).toLowerCase().includes('network')) ||
    (err instanceof Error && /network request failed/i.test(err.message));
  if (isNetworkFailure) {
    const hint =
      'Bilgisayarda backend çalışıyor mu (backend: npm run dev)? `.env` içindeki EXPO_PUBLIC_API_URL, ipconfig IPv4 ile aynı mı (port 3001)? Güvenlik duvarında TCP 3001 açık mı? VPN kapat. USB: npm run adb:reverse-api, sonra EXPO_PUBLIC_API_URL=http://127.0.0.1:3001';
    return new Error(`Sunucuya ulaşılamıyor.\nİstek: ${requestUrl}\n${hint}`);
  }
  return err instanceof Error ? err : new Error('İstek başarısız.');
}

async function fetchApi(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (e) {
    throw mapNetworkError(e, input);
  } finally {
    clearTimeout(timer);
  }
}

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
  try {
    const data = (await res.json()) as Record<string, unknown>;
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function errMessage(data: Record<string, unknown>): string {
  const e = data.error;
  if (typeof e === 'string' && e.trim()) {
    return e;
  }
  return 'İşlem başarısız.';
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const res = await fetchApi(getApiUrl('/v1/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(errMessage(data));
  }
  const accessToken = data.accessToken;
  const user = data.user;
  if (typeof accessToken !== 'string' || !user || typeof user !== 'object') {
    throw new Error('Sunucudan beklenmeyen yanıt.');
  }
  const u = user as Record<string, unknown>;
  if (typeof u.id !== 'string' || typeof u.email !== 'string' || typeof u.fullName !== 'string') {
    throw new Error('Sunucudan beklenmeyen yanıt.');
  }
  return { accessToken, user: { id: u.id, email: u.email, fullName: u.fullName } };
}

export async function registerRequest(
  fullName: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetchApi(getApiUrl('/v1/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(errMessage(data));
  }
  const accessToken = data.accessToken;
  const user = data.user;
  if (typeof accessToken !== 'string' || !user || typeof user !== 'object') {
    throw new Error('Sunucudan beklenmeyen yanıt.');
  }
  const u = user as Record<string, unknown>;
  if (typeof u.id !== 'string' || typeof u.email !== 'string' || typeof u.fullName !== 'string') {
    throw new Error('Sunucudan beklenmeyen yanıt.');
  }
  return { accessToken, user: { id: u.id, email: u.email, fullName: u.fullName } };
}

export async function fetchAuthMe(accessToken: string): Promise<AuthUser | null> {
  const res = await fetchApi(getApiUrl('/v1/auth/me'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await parseJsonSafe(res);
  const user = data.user;
  if (!user || typeof user !== 'object') return null;
  const u = user as Record<string, unknown>;
  if (typeof u.id !== 'string' || typeof u.email !== 'string' || typeof u.fullName !== 'string') {
    return null;
  }
  return { id: u.id, email: u.email, fullName: u.fullName };
}
