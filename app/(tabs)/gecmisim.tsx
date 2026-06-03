import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserProfile } from '@/contexts/user-profile-context';
import { fetchHistory, type HistoryListItem } from '@/lib/history-api';

type HistoryFilter = 'all' | 'cv' | 'interview';

export default function GecmisimScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile, isAuthenticated } = useUserProfile();
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');
  const [items, setItems] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await fetchHistory();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Geçmiş alınamadı.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadHistory();
  }, [loadHistory]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((item) => item.type === activeFilter);
  }, [activeFilter, items]);

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView style={[styles.safeArea, isWeb && styles.safeAreaWeb]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C4B5FD"
              colors={['#C4B5FD']}
            />
          }>
          <View style={styles.content}>

            <Text style={styles.pageTitle}>Geçmişim</Text>

            <View style={styles.filtersRow}>
              {(['all', 'cv', 'interview'] as HistoryFilter[]).map((f) => {
                const label = f === 'all' ? 'Tümü' : f === 'cv' ? 'CV\nAnalizleri' : 'Mülakatlar';
                const active = activeFilter === f;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setActiveFilter(f)}
                    style={({ hovered, pressed }) => [
                      styles.filterPill,
                      active && styles.filterPillActive,
                      isWeb && hovered && styles.hover,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {loading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#C4B5FD" />
                <Text style={styles.stateText}>Geçmiş yükleniyor…</Text>
              </View>
            ) : error ? (
              <View style={styles.centerState}>
                <Ionicons name="alert-circle-outline" size={40} color="#F87171" />
                <Text style={[styles.stateText, { color: '#F87171' }]}>{error}</Text>
                <Pressable
                  onPress={() => { setLoading(true); void loadHistory(); }}
                  style={styles.retryBtn}>
                  <Text style={styles.retryText}>Tekrar Dene</Text>
                </Pressable>
              </View>
            ) : filteredItems.length === 0 ? (
              <View style={styles.centerState}>
                <Ionicons name="time-outline" size={48} color="#334155" />
                <Text style={styles.stateText}>
                  {activeFilter === 'all'
                    ? 'Henüz geçmiş kaydın yok.\nMülakat veya CV analizi tamamla!'
                    : activeFilter === 'cv'
                    ? 'Henüz CV analizi yapılmamış.'
                    : 'Henüz mülakat tamamlanmamış.'}
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {filteredItems.map((item, idx) => {
                  const showAccent = idx % 2 === 0;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() =>
                        router.push({
                          pathname: '/report-detail',
                          params: { id: item.id, type: item.type },
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
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageBackground: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  safeAreaWeb: { paddingHorizontal: 18, paddingTop: 60 },
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

  pageTitle: { marginTop: 22, color: '#F8FAFC', fontSize: 32, fontWeight: '800' },

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

  centerState: {
    marginTop: 60,
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
  },
  stateText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(196, 181, 253, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.3)',
  },
  retryText: { color: '#C4B5FD', fontSize: 14, fontWeight: '700' },

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
