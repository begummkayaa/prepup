import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const isWeb = Platform.OS === 'web';

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView style={[styles.safeArea, isWeb && styles.safeAreaWeb]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={15} color="#C4B5FD" />
              </View>
              <View>
                <Text style={styles.welcomeText}>Hoş geldin,</Text>
                <Text style={[styles.nameText, isWeb && styles.nameTextWeb]}>Begüm Kaya</Text>
              </View>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={[styles.titlePrimary, isWeb && styles.titlePrimaryWeb]}>Hazırlan ve</Text>
            <Text style={[styles.titleAccent, isWeb && styles.titleAccentWeb]}>Yüksel.</Text>
            <Text style={[styles.subtitleText, isWeb && styles.subtitleTextWeb]}>
              Kariyer yolculuğunu yapay zeka ile optimize et ve zirveye odaklan.
            </Text>
          </View>

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
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageBackground: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  safeAreaWeb: {
    paddingTop: 84,
    paddingHorizontal: 18,
  },
  scrollContent: {
    paddingBottom: 56,
  },
  scrollContentWeb: {
    paddingBottom: 28,
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
  nameTextWeb: {
    fontSize: 14,
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
  titlePrimaryWeb: {
    fontSize: 34,
    lineHeight: 38,
  },
  titleAccent: {
    color: '#C4B5FD',
    fontSize: 54,
    lineHeight: 56,
    fontWeight: '700',
  },
  titleAccentWeb: {
    fontSize: 34,
    lineHeight: 38,
  },
  subtitleText: {
    marginTop: 12,
    color: '#7D8CA6',
    fontSize: 13,
    lineHeight: 21,
    maxWidth: 300,
  },
  subtitleTextWeb: {
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 380,
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
