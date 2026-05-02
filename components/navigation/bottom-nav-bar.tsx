import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAV_ITEMS = [
  // Use explicit tab-group routes so navigation works
  // reliably even when called from stack screens.
  { label: 'ANA SAYFA', icon: 'home-outline', iconFocused: 'home', href: '/(tabs)' },
  { label: 'GEÇMİŞİM', icon: 'time-outline', iconFocused: 'time', href: '/(tabs)/gecmisim' },
  { label: 'PROFİL', icon: 'person-outline', iconFocused: 'person', href: '/(tabs)/profile' },
] as const;

export type BottomNavBarVariant = 'floating' | 'docked';

type BottomNavBarProps = {
  /** Stack/modal gibi overflow kesen ekranlarda `docked` kullan (absolute kesilir). */
  variant?: BottomNavBarVariant;
};

export function BottomNavBar({ variant = 'floating' }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isWeb = Platform.OS === 'web';

  const bar = (
    <View style={styles.bar}>
      {NAV_ITEMS.map((item) => {
        const isFocused =
          pathname === item.href ||
          (item.href === '/' && (pathname === '/' || pathname === '/index'));
        const color = isFocused ? '#C4B5FD' : '#64748B';
        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable style={styles.item}>
              <Ionicons name={isFocused ? item.iconFocused : item.icon} size={20} color={color} />
              <Text style={[styles.label, isFocused && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );

  if (variant === 'docked') {
    return (
      <View
        style={[
          styles.dockedOuter,
          { paddingBottom: Math.max(insets.bottom, 12), paddingTop: 10 },
        ]}>
        {bar}
      </View>
    );
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.floatingOuter,
        !isWeb && { bottom: Math.max(insets.bottom, 10) + 14 },
        isWeb && styles.floatingOuterWeb,
      ]}>
      {bar}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingOuter: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999,
    elevation: 999,
  },
  floatingOuterWeb: {
    bottom: 24,
  },
  dockedOuter: {
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    flexShrink: 0,
    zIndex: 999,
    elevation: 999,
  },
  bar: {
    height: 66,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 999,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#C4B5FD',
  },
});
