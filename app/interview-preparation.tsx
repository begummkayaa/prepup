import { LinearGradient } from 'expo-linear-gradient';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InterviewPreparationHome } from '@/components/home/interview-preparation-home';
import { BottomNavBar } from '@/components/navigation/bottom-nav-bar';
import { BackHeader } from '@/components/navigation/back-header';

/**
 * En az bir mülakat özeti görülmüş kullanıcı: ana sayfadaki karttan buraya düşer;
 * seçim / CV doğrulama sonrası tekrar sohbete gider.
 */
export default function InterviewPreparationScreen() {
  const isWeb = Platform.OS === 'web';

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.background}>
      <SafeAreaView style={[styles.safe, isWeb && styles.safeWeb]} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, isWeb && styles.scrollWeb]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <BackHeader />
          <InterviewPreparationHome />
        </ScrollView>
        <BottomNavBar variant="docked" />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  safeWeb: {
    paddingTop: 8,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  scroll: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  scrollWeb: {
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
});
