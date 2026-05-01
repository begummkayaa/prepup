import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type UserProfile = {
  fullName: string;
  firstName: string;
};

type UserProfileContextValue = {
  profile: UserProfile;
  isLoading: boolean;
};

const FALLBACK_PROFILE: UserProfile = {
  fullName: 'Kullanıcı',
  firstName: 'Kullanıcı',
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

function toUserProfile(rawName: string): UserProfile {
  const trimmed = rawName.trim();
  if (!trimmed) {
    return FALLBACK_PROFILE;
  }

  const [firstToken] = trimmed.split(/\s+/);
  return {
    fullName: trimmed,
    firstName: firstToken || FALLBACK_PROFILE.firstName,
  };
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

function parseStoredValue(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return extractName(parsed);
  } catch {
    return extractName(trimmed);
  }
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

    const parsedName = parseStoredValue(item);
    if (parsedName) {
      return toUserProfile(parsedName);
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
