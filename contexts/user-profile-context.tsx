import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type UserProfile = {
  fullName: string;
  firstName: string;
  email: string;
};

type UserProfileContextValue = {
  profile: UserProfile;
  isLoading: boolean;
};

const FALLBACK_PROFILE: UserProfile = {
  fullName: 'Kullanıcı',
  firstName: 'Kullanıcı',
  email: '',
};

const PROFILE_KEYS = [
  'prepup:user',
  'prepup_user',
  'userProfile',
  'profile',
  'auth_user',
  'user',
  'userName',
  'fullName',
];

const UserProfileContext = createContext<UserProfileContextValue>({
  profile: FALLBACK_PROFILE,
  isLoading: true,
});

function toUserProfile(rawName: string, email = ''): UserProfile {
  const trimmed = rawName.trim();
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

function parseStoredProfile(rawValue: string): UserProfile | null {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const email = extractEmail(parsed);
      const name = extractName(parsed);
      if (name) {
        return toUserProfile(name, email);
      }
      if (email) {
        return { ...FALLBACK_PROFILE, email };
      }
      return null;
    }

    const nameFromJson = extractName(parsed);
    const emailFromJson = extractEmail(parsed);
    if (nameFromJson) {
      return toUserProfile(nameFromJson, emailFromJson);
    }
    if (emailFromJson) {
      return { ...FALLBACK_PROFILE, email: emailFromJson };
    }
  } catch {
    const nameOnly = extractName(trimmed);
    if (nameOnly) {
      return toUserProfile(nameOnly, '');
    }
  }

  return null;
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

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function loadUserProfile(): Promise<UserProfile> {
  for (const key of PROFILE_KEYS) {
    const item = await safeGetItem(key);
    if (!item) {
      continue;
    }

    const parsed = parseStoredProfile(item);
    if (parsed) {
      return parsed;
    }
  }

  return FALLBACK_PROFILE;
}

export function UserProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<UserProfile>(FALLBACK_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const loadedProfile = await loadUserProfile();
        if (active) {
          setProfile(loadedProfile);
        }
      } catch {
        if (active) {
          setProfile(FALLBACK_PROFILE);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      profile,
      isLoading,
    }),
    [profile, isLoading]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
