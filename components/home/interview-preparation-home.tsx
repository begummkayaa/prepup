import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useUserProfile } from '@/contexts/user-profile-context';

const PURPLE = '#A78BFA';

/** Daha önce mülakat simülasyonu tamamlamış kullanıcılar için ara ekran (ana sayfadaki karta bağlı). */
export function InterviewPreparationHome() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();

  const goSimulation = () => {
    router.push('/interview-simulation');
  };

  const goNewFlow = () => {
    router.push('/cv-analysis');
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={15} color="#C4B5FD" />
          </View>
          <View>
            <Text style={styles.welcomeText}>Hoş geldin,</Text>
            <Text style={[styles.nameText, isWeb && styles.nameTextWeb]}>{profile.fullName}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.pageTitle, isWeb && styles.pageTitleWeb]}>Mülakat Hazırlığı</Text>
      <Text style={[styles.pageSubtitle, isWeb && styles.pageSubtitleWeb]}>
        Yapay zeka ile kariyerini bir üst seviyeye taşı.
      </Text>

      <View style={styles.currentCvCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.docIconWrap}>
            <Ionicons name="document-text-outline" size={22} color="#C4B5FD" />
          </View>
        </View>
        <Text style={styles.cardKicker}>MEVCUT ÖZGEÇMİŞ</Text>
        <Text style={styles.cardDesc}>
          Son yüklediğin CV ile devam et:{' '}
          <Text style={styles.cardDescBold}>Yazılım Geliştirici.pdf</Text>
        </Text>
        <Pressable
          onPress={goSimulation}
          style={({ pressed, hovered }) => [
            styles.confirmBtn,
            isWeb && hovered && styles.confirmBtnHover,
            pressed && styles.confirmBtnPressed,
          ]}>
          <Ionicons name="play" size={16} color="#1E1B4B" style={styles.playIcon} />
          <Text style={styles.confirmBtnText}>Onayla ve Başlat</Text>
        </Pressable>
      </View>

      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>VEYA</Text>
        <View style={styles.orLine} />
      </View>

      <Pressable
        onPress={goNewFlow}
        style={({ pressed, hovered }) => [
          styles.dashedCard,
          isWeb && hovered && styles.dashedCardHover,
          pressed && styles.dashedCardPressed,
        ]}>
        <View style={styles.plusCircle}>
          <Ionicons name="add" size={26} color={PURPLE} />
        </View>
        <Text style={styles.dashedTitle}>Farklı bir pozisyon veya CV ile yeni mülakat başlat</Text>
      </Pressable>

      <Pressable
        onPress={goSimulation}
        style={({ pressed, hovered }) => [
          styles.primaryCta,
          isWeb && hovered && styles.primaryCtaHover,
          pressed && styles.primaryCtaPressed,
        ]}>
        <LinearGradient colors={['#A78BFA', '#8B5CF6']} style={styles.primaryCtaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.primaryCtaText}>Mülakatı Başlat</Text>
          <Feather name="arrow-right" size={20} color="#F8FAFC" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
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
    color: PURPLE,
    fontSize: 17,
    fontWeight: '700',
  },
  nameTextWeb: { fontSize: 14 },
  pageTitle: {
    marginTop: 20,
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  pageTitleWeb: { fontSize: 24 },
  pageSubtitle: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    maxWidth: 340,
  },
  pageSubtitleWeb: { fontSize: 13, maxWidth: 400 },
  currentCvCard: {
    marginTop: 22,
    borderRadius: 22,
    padding: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  cardTopRow: { flexDirection: 'row', marginBottom: 10 },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
  },
  cardKicker: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  cardDesc: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardDescBold: { color: '#F1F5F9', fontWeight: '800' },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PURPLE,
    borderRadius: 22,
    paddingVertical: 14,
  },
  confirmBtnHover: { opacity: 0.95 },
  confirmBtnPressed: { opacity: 0.88 },
  playIcon: { marginRight: -2 },
  confirmBtnText: {
    color: '#1E1B4B',
    fontSize: 15,
    fontWeight: '800',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
  },
  orText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  dashedCard: {
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(167, 139, 250, 0.35)',
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
  },
  dashedCardHover: {
    borderColor: 'rgba(167, 139, 250, 0.55)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  dashedCardPressed: { opacity: 0.9 },
  plusCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dashedTitle: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  primaryCta: {
    marginTop: 24,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  primaryCtaHover: { opacity: 0.95 },
  primaryCtaPressed: { opacity: 0.9 },
  primaryCtaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryCtaText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
