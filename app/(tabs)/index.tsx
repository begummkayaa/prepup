import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserProfile } from '@/contexts/user-profile-context';

const isWeb = Platform.OS === 'web';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useUserProfile();

  const openInterviewFlow = () => {
    router.push('/interview-preparation');
  };

  if (isWeb) {
    return (
      <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
        <ScrollView
          contentContainerStyle={styles.webScrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.webPage}>
            {/* Sol — hero */}
            <View style={styles.webHero}>
              <View style={styles.webBadge}>
                <View style={styles.webBadgeDot} />
                <Text style={styles.webBadgeText}>Yapay Zeka Destekli Kariyer Asistanı</Text>
              </View>

              <Text style={styles.webTitle}>
                Hazırlan{'\n'}ve{' '}
                <Text style={styles.webTitleAccent}>Yüksel.</Text>
              </Text>

              <Text style={styles.webSubtitle}>
                Kariyer yolculuğunu yapay zeka ile optimize et.{'\n'}
                CV analizi ve mülakat simülasyonu ile bir adım öne geç.
              </Text>

              <View style={styles.webGreetRow}>
                <View style={styles.webAvatar}>
                  <Ionicons name="person" size={14} color="#C4B5FD" />
                </View>
                <View>
                  <Text style={styles.webGreetLabel}>HOŞ GELDİN</Text>
                  <Text style={styles.webGreetName}>{profile.fullName}</Text>
                </View>
              </View>

              <View style={styles.webStats}>
                <View style={styles.webStatItem}>
                  <Text style={styles.webStatNum}>2</Text>
                  <Text style={styles.webStatLabel}>Özellik</Text>
                </View>
                <View style={styles.webStatDivider} />
                <View style={styles.webStatItem}>
                  <Text style={styles.webStatNum}>AI</Text>
                  <Text style={styles.webStatLabel}>Destekli</Text>
                </View>
                <View style={styles.webStatDivider} />
                <View style={styles.webStatItem}>
                  <Text style={styles.webStatNum}>∞</Text>
                  <Text style={styles.webStatLabel}>Pratik</Text>
                </View>
              </View>
            </View>

            {/* Sağ — kartlar */}
            <View style={styles.webCards}>
              <Pressable
                onPress={() => router.push('/cv-analysis')}
                style={({ hovered }) => [styles.webCard, styles.webCardPrimary, hovered && styles.webCardHover]}>
                <LinearGradient colors={['#A78BFA', '#7C3AED']} style={styles.webCardGradient}>
                  <View style={styles.webCardTop}>
                    <View style={styles.webCardIcon}>
                      <Ionicons name="document-text-outline" size={22} color="#EEE9FF" />
                    </View>
                    <View style={styles.webCardArrow}>
                      <Feather name="arrow-up-right" size={16} color="#F5F3FF" />
                    </View>
                  </View>
                  <Text style={styles.webCardTitle}>CV Analizi</Text>
                  <Text style={styles.webCardDesc}>
                    {"PDF'ini yükle, hedef pozisyona göre uyumluluk analizi al."}
                  </Text>
                  <View style={styles.webCardTag}>
                    <Text style={styles.webCardTagText}>YAPAY ZEKA DESTEKLİ GERİ BİLDİRİM</Text>
                  </View>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={openInterviewFlow}
                style={({ hovered }) => [styles.webCard, styles.webCardSecondary, hovered && styles.webCardSecondaryHover]}>
                <View style={styles.webCardTop}>
                  <View style={[styles.webCardIcon, styles.webCardIconDark]}>
                    <Ionicons name="chatbox-ellipses-outline" size={22} color="#C4B5FD" />
                  </View>
                  <View style={[styles.webCardArrow, styles.webCardArrowDark]}>
                    <Feather name="arrow-up-right" size={16} color="#CBD5E1" />
                  </View>
                </View>
                <Text style={[styles.webCardTitle, { color: '#F8FAFC' }]}>Mülakat Simülasyonu</Text>
                <Text style={[styles.webCardDesc, { color: '#94A3B8' }]}>
                  Gerçek zamanlı AI mülakat pratiği yap. Her pozisyon için uyarlanır.
                </Text>
                <View style={[styles.webCardTag, styles.webCardTagDark]}>
                  <Text style={[styles.webCardTagText, { color: '#64748B' }]}>GERÇEK ZAMANLI PRATİK MODU</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── Mobil layout (değiştirilmedi) ──────────────────────────────
  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={15} color="#C4B5FD" />
              </View>
              <View>
                <Text style={styles.welcomeText}>Hoş geldin,</Text>
                <Text style={styles.nameText}>{profile.fullName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.titlePrimary}>Hazırlan ve</Text>
            <Text style={styles.titleAccent}>Yüksel.</Text>
            <Text style={styles.subtitleText}>
              Kariyer yolculuğunu yapay zeka ile optimize et ve zirveye odaklan.
            </Text>
          </View>

          <Pressable onPress={() => router.push('/cv-analysis')}>
            <LinearGradient colors={['#A78BFA', '#8B5CF6']} style={styles.primaryCard}>
              <View style={styles.cardIconsRow}>
                <View style={styles.primaryIconWrap}>
                  <Ionicons name="document-text-outline" size={20} color="#EEE9FF" />
                </View>
                <View style={styles.actionIconWrap}>
                  <Feather name="arrow-up-right" size={16} color="#F5F3FF" />
                </View>
              </View>
              <Text style={styles.primaryCardTitle}>CV Yükle ve Analiz Et</Text>
              <Text style={styles.primaryCardSubtitle}>YAPAY ZEKA DESTEKLİ GERİ BİLDİRİM</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={openInterviewFlow}>
            <View style={styles.secondaryCard}>
              <View style={styles.cardIconsRow}>
                <View style={styles.secondaryIconWrap}>
                  <Ionicons name="chatbox-ellipses-outline" size={20} color="#C4B5FD" />
                </View>
                <View style={styles.actionIconWrapDark}>
                  <Feather name="arrow-up-right" size={16} color="#CBD5E1" />
                </View>
              </View>
              <Text style={styles.secondaryCardTitle}>Mülakat Simülasyonu Başlat</Text>
              <Text style={styles.secondaryCardSubtitle}>GERÇEK ZAMANLI PRATİK MODU</Text>
            </View>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageBackground: { flex: 1 },

  // ── Web ───────────────────────────────────────────────────────
  webScrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    minHeight: '100%',
  },
  webPage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 48,
    paddingVertical: 60,
    gap: 64,
  },
  webHero: {
    flex: 1,
    gap: 0,
  },
  webBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(196, 181, 253, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 28,
  },
  webBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#86EFAC',
  },
  webBadgeText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  webTitle: {
    color: '#F1F5F9',
    fontSize: 64,
    lineHeight: 70,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 20,
  },
  webTitleAccent: {
    color: '#C4B5FD',
  },
  webSubtitle: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    maxWidth: 400,
    marginBottom: 36,
  },
  webGreetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 36,
  },
  webAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(196, 181, 253, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webGreetLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  webGreetName: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '700',
  },
  webStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  webStatItem: {
    alignItems: 'center',
    gap: 2,
  },
  webStatNum: {
    color: '#C4B5FD',
    fontSize: 22,
    fontWeight: '800',
  },
  webStatLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  webStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },

  webCards: {
    width: 380,
    gap: 16,
  },
  webCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  webCardPrimary: {
    borderColor: 'rgba(196, 181, 253, 0.2)',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },
  webCardHover: {
    shadowOpacity: 0.45,
    transform: [{ translateY: -2 }],
  },
  webCardGradient: {
    padding: 28,
  },
  webCardSecondary: {
    backgroundColor: '#111827',
    borderColor: 'rgba(148, 163, 184, 0.1)',
    padding: 28,
  },
  webCardSecondaryHover: {
    borderColor: 'rgba(196, 181, 253, 0.2)',
    transform: [{ translateY: -2 }],
  },
  webCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  webCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCardIconDark: {
    backgroundColor: 'rgba(196, 181, 253, 0.12)',
  },
  webCardArrow: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCardArrowDark: {
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  webCardTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  webCardDesc: {
    color: 'rgba(15, 23, 42, 0.75)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  webCardTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  webCardTagDark: {
    backgroundColor: 'rgba(148, 163, 184, 0.06)',
  },
  webCardTagText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // ── Mobil (değiştirilmedi) ────────────────────────────────────
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  scrollContent: {
    paddingBottom: 56,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
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
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  nameText: {
    color: '#A78BFA',
    fontSize: 17,
    fontWeight: '600',
  },
  titleBlock: {
    marginTop: 24,
    gap: 0,
  },
  titlePrimary: {
    color: '#F1F5F9',
    fontSize: 54,
    lineHeight: 56,
    fontWeight: '700',
  },
  titleAccent: {
    color: '#C4B5FD',
    fontSize: 54,
    lineHeight: 56,
    fontWeight: '700',
  },
  subtitleText: {
    marginTop: 12,
    color: '#7D8CA6',
    fontSize: 13,
    lineHeight: 21,
    maxWidth: 300,
  },
  primaryCard: {
    marginTop: 28,
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 24,
    minHeight: 188,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  cardIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.17)',
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  primaryCardTitle: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    maxWidth: 280,
  },
  primaryCardSubtitle: {
    marginTop: 10,
    color: '#F5F3FF',
    fontSize: 13,
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  secondaryCard: {
    marginTop: 16,
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 24,
    minHeight: 180,
    backgroundColor: '#18243A',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  secondaryIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.18)',
  },
  secondaryCardTitle: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 33,
    lineHeight: 37,
    fontWeight: '700',
    maxWidth: 300,
  },
  secondaryCardSubtitle: {
    marginTop: 10,
    color: '#CBD5E1',
    fontSize: 13,
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  actionIconWrapDark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.24)',
  },
});
