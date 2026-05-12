import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useUserProfile } from '@/contexts/user-profile-context';

function normalizedPath(pathname: string | undefined): string {
  const p = (pathname ?? '').trim();
  if (!p || p === '/') return '/';
  return p.replace(/\/$/, '') || '/';
}

/** Oturum yokken sekme veya korumalı stack ekranlarından çıkar → giriş `/sign-in` (`/` ile sekmeler karışmasın) */
export function AuthRedirectToLogin() {
  const { isAuthenticated, isLoading } = useUserProfile();
  const pathname = usePathname();
  const segments = useSegments();
  const nav = useRouter();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    if (segments[0] === '(tabs)') {
      nav.replace('/sign-in');
      return;
    }

    const path = normalizedPath(pathname);
    const isPublic =
      path === '/' ||
      path === '/index' ||
      path === '/sign-in' ||
      path === '/register' ||
      path === '/forgot-password';

    if (!isPublic) {
      nav.replace('/sign-in');
    }
  }, [isAuthenticated, isLoading, nav, pathname, segments]);

  return null;
}
