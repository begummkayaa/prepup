import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useUserProfile } from '@/contexts/user-profile-context';

type WebNavBarProps = Partial<BottomTabBarProps>;

const NAV_ITEMS = [
  { label: 'Ana Sayfa', href: '/(tabs)' as const },
  { label: 'Geçmişim', href: '/(tabs)/gecmisim' as const },
  { label: 'Profil', href: '/(tabs)/profile' as const },
];

export function WebNavBar(_props: WebNavBarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useUserProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const userSectionRef = useRef<View>(null);

  // Rota değişince menüyü kapat
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Dışarı tıklanınca menüyü kapat
  useEffect(() => {
    if (!menuOpen) return;

    const handleDocClick = () => {
      setMenuOpen(false);
    };

    // setTimeout 0: chip'in onPress'i bitmeden listener eklenmesini önler
    const id = setTimeout(() => {
      (document as Document).addEventListener('click', handleDocClick);
    }, 0);

    return () => {
      clearTimeout(id);
      (document as Document).removeEventListener('click', handleDocClick);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    try {
      await signOut();
    } finally {
      router.replace('/sign-in');
    }
  };

  const handleChipPress = (e: any) => {
    // Kendi tıklamasının document listener'ı tetiklemesini engelle
    if (e?.stopPropagation) e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleDropdownPress = (e: any) => {
    if (e?.stopPropagation) e.stopPropagation();
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={['#080E1F', '#0B1226']} style={styles.bar}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Ionicons name="document-text" size={22} color="#C4B5FD" />
          <Text style={styles.logoText}>
            Prep<Text style={styles.logoAccent}>Up</Text>
          </Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Nav links */}
        <View style={styles.navLinks}>
          {NAV_ITEMS.map((item) => {
            const isFocused =
              pathname === item.href ||
              (item.href === '/(tabs)' && (pathname === '/(tabs)' || pathname === '/'));
            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable
                  style={({ hovered }) => [
                    styles.navItem,
                    isFocused && styles.navItemActive,
                    hovered && !isFocused && styles.navItemHover,
                  ]}>
                  <Text style={[styles.navLabel, isFocused && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              </Link>
            );
          })}
        </View>

        {/* User chip + dropdown */}
        <View ref={userSectionRef} style={styles.userSection}>
          <Pressable
            onPress={handleChipPress}
            style={({ hovered }) => [styles.userChip, hovered && styles.userChipHover]}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={13} color="#C4B5FD" />
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {profile.fullName}
            </Text>
            <Ionicons
              name={menuOpen ? 'chevron-up' : 'chevron-down'}
              size={13}
              color="#64748B"
            />
          </Pressable>

          {menuOpen && (
            <View style={styles.dropdown}>
              <Pressable
                onPress={(e: any) => { handleDropdownPress(e); handleSignOut(); }}
                style={({ hovered }) => [styles.dropdownItem, hovered && styles.dropdownItemHover]}>
                <Ionicons name="log-out-outline" size={15} color="#F87171" />
                <Text style={styles.dropdownItemText}>Oturumu Kapat</Text>
              </Pressable>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },

  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
  },
  logoText: {
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  logoAccent: { color: '#C4B5FD' },

  spacer: { flex: 1 },

  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginRight: 24,
  },
  navItem: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  navItemActive: { backgroundColor: 'rgba(196, 181, 253, 0.1)' },
  navItemHover: { backgroundColor: 'rgba(148, 163, 184, 0.07)' },
  navLabel: { color: '#F1F5F9', fontSize: 13, fontWeight: '600' },
  navLabelActive: { color: '#F1F5F9' },

  /* User */
  userSection: {
    position: 'relative',
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(196, 181, 253, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  userChipHover: { backgroundColor: 'rgba(196, 181, 253, 0.14)' },
  userAvatar: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(196, 181, 253, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 140,
  },

  /* Dropdown */
  dropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    minWidth: 180,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    zIndex: 1100,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dropdownItemHover: { backgroundColor: 'rgba(248, 113, 113, 0.08)' },
  dropdownItemText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '600',
  },

});
