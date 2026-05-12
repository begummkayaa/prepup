import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { DEV_API_BASE_URL } from '@/constants/dev-api';

const API_PREFIX = '/api';

function stripTrailingSlash(s: string): string {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

/** Yalnızca Android emülatörde: bilgisayardaki localhost → 10.0.2.2 */
function adjustBaseUrlForDev(base: string): string {
  if (!__DEV__ || Platform.OS !== 'android') return base;
  if (Constants.isDevice !== false) return base;
  if (base.includes('localhost')) {
    return base.replace('localhost', '10.0.2.2');
  }
  if (base.includes('127.0.0.1')) {
    return base.replace('127.0.0.1', '10.0.2.2');
  }
  return base;
}

type Manifest2ForApi = {
  extra?: {
    expoClient?: {
      extra?: { apiBaseUrl?: unknown };
    };
  };
};

function readExtraFromManifests(): string {
  const ex = Constants.expoConfig?.extra as { apiBaseUrl?: unknown } | undefined;
  if (typeof ex?.apiBaseUrl === 'string' && ex.apiBaseUrl.trim()) {
    return ex.apiBaseUrl.trim();
  }

  const m2 = Constants.manifest2 as (Manifest2ForApi | null);
  const nested = m2?.extra?.expoClient?.extra;
  if (typeof nested?.apiBaseUrl === 'string' && nested.apiBaseUrl.trim()) {
    return nested.apiBaseUrl.trim();
  }

  const m = Constants.manifest as ({ extra?: { apiBaseUrl?: unknown } } | null);
  if (typeof m?.extra?.apiBaseUrl === 'string' && m.extra.apiBaseUrl.trim()) {
    return m.extra.apiBaseUrl.trim();
  }

  return '';
}

export function getApiBaseUrl(): string {
  const fromDevFile = typeof DEV_API_BASE_URL === 'string' ? DEV_API_BASE_URL.trim() : '';
  const fromExtra = readExtraFromManifests();
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_API_URL === 'string' ? process.env.EXPO_PUBLIC_API_URL.trim() : '';

  const raw = fromDevFile || fromExtra || fromEnv || 'http://localhost:3000';
  return stripTrailingSlash(adjustBaseUrlForDev(raw));
}

export function getApiUrl(path: string): string {
  const base = stripTrailingSlash(getApiBaseUrl());
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${API_PREFIX}${p}`;
}
