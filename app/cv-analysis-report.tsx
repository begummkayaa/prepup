import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/navigation/back-header';
import { BottomNavBar } from '@/components/navigation/bottom-nav-bar';
import { useUserProfile } from '@/contexts/user-profile-context';

function BulletItem({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: color }]} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

export default function CvAnalysisReportScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();
  const params = useLocalSearchParams<{ targetRole?: string }>();
  const targetRole = typeof params.targetRole === 'string' ? params.targetRole : 'Yazılım Geliştirici';

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView style={[styles.safeArea, isWeb && styles.safeAreaWeb]} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
          showsVerticalScrollIndicator={false}>
          <BackHeader />
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={15} color="#C4B5FD" />
            </View>
            <View>
              <Text style={styles.welcomeText}>HOŞ GELDİN,</Text>
              <Text style={styles.nameText}>{profile.fullName}</Text>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>CV Analiz Raporu</Text>
            <Text style={styles.subtitle}>{targetRole} Pozisyonu İçin</Text>
          </View>

          <LinearGradient colors={['#BFA5FF', '#A78BFA']} style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreValue}>%82</Text>
              <Text style={styles.scoreLabel}>Uyumluluk{'\n'}Skoru</Text>
            </View>
            <Text style={styles.scoreDescription}>
              Özgeçmişin hedeflediğin pozisyonla büyük oranda örtüşüyor.
            </Text>
          </LinearGradient>

          <View style={styles.infoCard}>
            <View style={styles.infoTitleRow}>
              <MaterialIcons name="verified" size={18} color="#4ADE80" />
              <Text style={styles.infoTitle}>Güçlü Yönlerin</Text>
            </View>
            <BulletItem text="Teknik projelerdeki derinlik" color="#4ADE80" />
            <BulletItem text="Kullanılan teknolojilerin güncelliği" color="#4ADE80" />
          </View>

          <View style={[styles.infoCard, styles.warningCard]}>
            <View style={styles.infoTitleRow}>
              <MaterialIcons name="error" size={18} color="#FB923C" />
              <Text style={styles.infoTitle}>Eksik Alanlar</Text>
            </View>
            <BulletItem text="Birim test (Unit Testing) tecrübesi eksikliği" color="#FB923C" />
            <BulletItem text="Cloud servisleri bilgisi" color="#FB923C" />
          </View>

          <View style={styles.suggestionCard}>
            <View style={styles.infoTitleRow}>
              <Ionicons name="bulb" size={17} color="#C4B5FD" />
              <Text style={styles.infoTitle}>İyileştirme Önerileri</Text>
            </View>

            <View style={styles.suggestionItem}>
              <Text style={styles.suggestionIndex}>01</Text>
              <Text style={styles.suggestionText}>Projelerinde kullandığın teknolojileri daha spesifik belirt.</Text>
            </View>
            <View style={styles.suggestionItem}>
              <Text style={styles.suggestionIndex}>02</Text>
              <Text style={styles.suggestionText}>Sertifikalarını daha görünür kıl.</Text>
            </View>
          </View>

          <Pressable style={styles.actionButton} onPress={() => router.push('/interview-simulation')}>
            <Text style={styles.actionButtonText}>MÜLAKAT SİMÜLASYONUNA GEÇ</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      <BottomNavBar variant="floating" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageBackground: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  safeAreaWeb: {
    paddingHorizontal: 18,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  scrollContentWeb: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  headerRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    letterSpacing: 1.2,
  },
  nameText: {
    color: '#E5E7EB',
    fontSize: 35,
    fontWeight: '700',
  },
  titleBlock: {
    marginTop: 18,
    marginBottom: 16,
  },
  title: {
    color: '#E2E8F0',
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: '#A8B3CC',
    fontSize: 15,
    fontWeight: '500',
  },
  scoreCard: {
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreValue: {
    color: '#0F172A',
    fontSize: 56,
    lineHeight: 62,
    fontWeight: '800',
  },
  scoreLabel: {
    color: '#0F172A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  scoreDescription: {
    marginTop: 14,
    color: 'rgba(15, 23, 42, 0.8)',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 420,
  },
  infoCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#15274A',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.3)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  warningCard: {
    borderColor: 'rgba(251, 146, 60, 0.32)',
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    color: '#E2E8F0',
    fontSize: 30,
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 3,
  },
  bulletDot: {
    marginTop: 9,
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  bulletText: {
    flex: 1,
    color: '#C8D1E1',
    fontSize: 20,
    lineHeight: 28,
  },
  suggestionCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#030712',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
  },
  suggestionItem: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#0D1B3A',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  suggestionIndex: {
    color: '#64748B',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
  },
  suggestionText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '500',
  },
  actionButton: {
    marginTop: 18,
    height: 66,
    borderRadius: 16,
    backgroundColor: '#BFA5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
});
