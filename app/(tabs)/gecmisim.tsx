import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserProfile } from '@/contexts/user-profile-context';

type HistoryType = 'all' | 'cv' | 'interview';

type HistoryItem = {
  id: string;
  type: Exclude<HistoryType, 'all'>;
  title: string;
  dateLabel: string;
  rightLabel: string;
  icon: 'chatbubble' | 'document-text';
};

const ITEMS: HistoryItem[] = [
  {
    id: 'interview-1',
    type: 'interview',
    title: 'Yazılım Geliştirici\nMülakatı',
    dateLabel: '14 Mart 2024',
    rightLabel: '85/100',
    icon: 'chatbubble',
  },
  {
    id: 'cv-1',
    type: 'cv',
    title: 'Yazılım\nMühendisi\nCV Analizi',
    dateLabel: '12 Mart 2024',
    rightLabel: '%82 Uyumluluk',
    icon: 'document-text',
  },
  {
    id: 'interview-2',
    type: 'interview',
    title: 'Ürün Yönetimi\nMülakatı',
    dateLabel: '8 Mart 2024',
    rightLabel: '72/100',
    icon: 'chatbubble',
  },
  {
    id: 'cv-2',
    type: 'cv',
    title: 'Veri Analisti\nCV\nİncelemesi',
    dateLabel: '5 Mart 2024',
    rightLabel: '%91 Uyumluluk',
    icon: 'document-text',
  },
];

export default function GecmisimScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();
  const [activeFilter, setActiveFilter] = useState<HistoryType>('all');

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return ITEMS;
    }
    return ITEMS.filter((item) => item.type === activeFilter);
  }, [activeFilter]);

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView style={[styles.safeArea, isWeb && styles.safeAreaWeb]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={15} color="#C4B5FD" />
              </View>
              <View>
                <Text style={styles.welcomeText}>Hoş geldin,</Text>
                <Text style={styles.nameText}>{profile.fullName}</Text>
              </View>
            </View>

            <Text style={styles.pageTitle}>Geçmişim</Text>

            <View style={styles.filtersRow}>
              <Pressable
                onPress={() => setActiveFilter('all')}
                style={({ hovered, pressed }) => [
                  styles.filterPill,
                  activeFilter === 'all' && styles.filterPillActive,
                  isWeb && hovered && styles.hover,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>Tümü</Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveFilter('cv')}
                style={({ hovered, pressed }) => [
                  styles.filterPill,
                  activeFilter === 'cv' && styles.filterPillActive,
                  isWeb && hovered && styles.hover,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.filterText, activeFilter === 'cv' && styles.filterTextActive]}>
                  CV{'\n'}Analizleri
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveFilter('interview')}
                style={({ hovered, pressed }) => [
                  styles.filterPill,
                  activeFilter === 'interview' && styles.filterPillActive,
                  isWeb && hovered && styles.hover,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.filterText, activeFilter === 'interview' && styles.filterTextActive]}>
                  Mülakatlar
                </Text>
              </Pressable>
            </View>

            <View style={styles.list}>
              {filteredItems.map((item, idx) => {
                const showAccent = idx === 0 || idx === 2;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      router.push({
                        pathname: '/report-detail',
                        params: { id: item.id },
                      })
                    }
                    style={({ hovered, pressed }) => [
                      styles.itemCard,
                      showAccent && styles.itemCardAccent,
                      isWeb && hovered && styles.itemCardHover,
                      pressed && styles.pressed,
                    ]}>
                    {showAccent ? <View style={styles.accentStrip} /> : null}
                    <View style={styles.itemInner}>
                      <View style={styles.itemLeft}>
                        <View style={styles.itemIconWrap}>
                          <Ionicons name={item.icon} size={18} color="#C4B5FD" />
                        </View>
                        <View style={styles.itemTextCol}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <Text style={styles.itemDate}>{item.dateLabel}</Text>
                        </View>
                      </View>

                      <View style={styles.itemRight}>
                        <Text style={styles.itemRightText}>{item.rightLabel}</Text>
                        <Ionicons name="chevron-forward" size={18} color="#64748B" />
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageBackground: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  safeAreaWeb: { paddingHorizontal: 18 },
  scrollContent: { paddingBottom: 140 },
  content: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
  },

  headerRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.26)',
  },
  welcomeText: {
    color: '#8B97B1',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  nameText: { color: '#A78BFA', fontSize: 17, fontWeight: '600' },

  pageTitle: { marginTop: 22, color: '#F8FAFC', fontSize: 44, fontWeight: '800' },

  filtersRow: { marginTop: 18, flexDirection: 'row', gap: 12 },
  filterPill: {
    flex: 1,
    minHeight: 56,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterPillActive: {
    backgroundColor: '#C4B5FD',
    borderColor: 'rgba(196, 181, 253, 0.75)',
  },
  filterText: { color: '#C8D1E1', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  filterTextActive: { color: '#0F172A' },

  list: { marginTop: 18, gap: 14 },
  itemCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    overflow: 'hidden',
  },
  itemCardHover: {
    borderColor: 'rgba(196, 181, 253, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
  },
  itemCardAccent: {
    borderColor: 'rgba(196, 181, 253, 0.22)',
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#C4B5FD',
  },
  itemInner: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextCol: { flex: 1 },
  itemTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '800', lineHeight: 20 },
  itemDate: { marginTop: 6, color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemRightText: { color: '#C4B5FD', fontSize: 16, fontWeight: '900' },

  hover: {
    borderColor: 'rgba(196, 181, 253, 0.45)',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
