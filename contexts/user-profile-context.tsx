import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchAuthMe, loginRequest, registerRequest } from '@/lib/auth-api';

export type UserProfile = {
  fullName: string;
  firstName: string;
  email: string;
};

export type UserProfileContextValue = {
  profile: UserProfile;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const FALLBACK_PROFILE: UserProfile = {
  fullName: 'Kullanıcı',
  firstName: 'Kullanıcı',
  email: '',
};

const ACCESS_TOKEN_KEY = 'prepup:accessToken';

const LEGACY_KEYS = ['prepup_user', 'userProfile', 'profile', 'auth_user', 'user', 'userName', 'fullName'];

const UserProfileContext = createContext<UserProfileContextValue>({
  profile: FALLBACK_PROFILE,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

function toUserProfile(fullNameRaw: string, email = ''): UserProfile {
  const trimmed = fullNameRaw.trim();
  if (!trimmed) {
    return { ...FALLBACK_PROFILE, email };
  }
  const [firstToken] = trimmed.split(/\s+/);
  return {
    fullName: trimmed,
    firstName: firstToken || FALLBACK_PROFILE.firstName,
    email,
  };
}

async function persistSession(accessToken: string, userJson: string) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  await AsyncStorage.setItem('prepup:user', userJson);
}

async function clearSessionStorage() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem('prepup:user');
  await Promise.all(LEGACY_KEYS.map((key) => AsyncStorage.removeItem(key)));
}

function extractEmail(value: unknown): string {
  if (typeof value === 'string' && value.includes('@')) {
    return value.trim();
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '';
  }
  const record = value as Record<string, unknown>;
  for (const key of ['email', 'mail', 'eMail', 'userEmail']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

function extractName(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() ? value : null;
  }
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const candidateKeys = ['fullName', 'name', 'displayName', 'userName', 'username', 'firstName'];
  for (const key of candidateKeys) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }
  return null;
}

function parseStoredProfile(rawValue: string): UserProfile | null {
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const email = extractEmail(parsed);
      const name = extractName(parsed);
      if (name) return toUserProfile(name, email);
      if (email) return { ...FALLBACK_PROFILE, email };
      return null;
    }

    const nameFromJson = extractName(parsed);
    const emailFromJson = extractEmail(parsed);
    if (nameFromJson) return toUserProfile(nameFromJson, emailFromJson);
    if (emailFromJson) return { ...FALLBACK_PROFILE, email: emailFromJson };
  } catch {
    const nameOnly = extractName(trimmed);
    if (nameOnly) return toUserProfile(nameOnly, '');
  }

  return null;
}

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function loadLegacyProfileFallback(): Promise<UserProfile> {
  for (const key of LEGACY_KEYS) {
    const item = await safeGetItem(key);
    if (!item) continue;
    const parsed = parseStoredProfile(item);
    if (parsed) return parsed;
  }
  return FALLBACK_PROFILE;
}

export function UserProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<UserProfile>(FALLBACK_PROFILE);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const saved = await safeGetItem(ACCESS_TOKEN_KEY);
        if (!active) return;

        if (saved) {
          const me = await fetchAuthMe(saved);
          if (!active) return;
          if (me) {
            setToken(saved);
            await AsyncStorage.setItem(
              'prepup:user',
              JSON.stringify({ fullName: me.fullName, email: me.email, id: me.id })
            );
            setProfile(toUserProfile(me.fullName, me.email));
          } else {
            await clearSessionStorage();
            setToken(null);
            setProfile(await loadLegacyProfileFallback());
          }
        } else {
          const rawUser = await safeGetItem('prepup:user');
          if (!active) return;
          if (rawUser) {
            const p = parseStoredProfile(rawUser);
            if (p) setProfile(p);
            else setProfile(await loadLegacyProfileFallback());
          } else {
            setProfile(await loadLegacyProfileFallback());
          }
        }
      } catch {
        if (active) {
          setProfile(FALLBACK_PROFILE);
          setToken(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await loginRequest(email, password);
    await persistSession(accessToken, JSON.stringify({ fullName: user.fullName, email: user.email, id: user.id }));
    setToken(accessToken);
    setProfile(toUserProfile(user.fullName, user.email));
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    const { accessToken, user } = await registerRequest(fullName.trim(), email, password);
    await persistSession(accessToken, JSON.stringify({ fullName: user.fullName, email: user.email, id: user.id }));
    setToken(accessToken);
    setProfile(toUserProfile(user.fullName, user.email));
  }, []);

  const signOut = useCallback(async () => {
    await clearSessionStorage();
    setToken(null);
    setProfile(FALLBACK_PROFILE);
  }, []);

  const value = useMemo<UserProfileContextValue>(
    () => ({
      profile,
      isLoading,
      isAuthenticated: Boolean(token),
      signIn,
      signUp,
      signOut,
    }),
    [profile, isLoading, token, signIn, signUp, signOut]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
