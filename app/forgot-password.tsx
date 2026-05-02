import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserProfile } from '@/contexts/user-profile-context';

export default function ForgotPasswordScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();
  const emailHint = profile.email.trim();

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.background}>
      <SafeAreaView style={[styles.safeArea, isWeb && styles.safeAreaWeb]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed, hovered }) => [
                  styles.iconBtn,
                  pressed && styles.iconBtnPressed,
                  isWeb && hovered && styles.iconBtnHover,
                ]}
                hitSlop={12}>
                <Ionicons name="chevron-back" size={22} color="#C4B5FD" />
              </Pressable>

              <Text style={styles.topTitle}>Şifremi Unuttum</Text>

              <View style={styles.topRightSpacer} />
            </View>

            <View style={styles.iconWrap}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={28} color="#C4B5FD" />
              </View>
            </View>

            <Text style={styles.body}>
              Şifreni sıfırlamak için giriş ekranındaki bağlantıyı kullan; kayıtlı e-postana sıfırlama
              bildirimi gider.
            </Text>

            {emailHint ? (
              <View style={styles.hintCard}>
                <Text style={styles.hintLabel}>Kayıtlı adres</Text>
                <Text style={styles.hintValue}>{emailHint}</Text>
              </View>
            ) : (
              <Text style={styles.muted}>
                Kayıtlı e-posta bilgin yoksa destek üzerinden hesabını doğrulatabilirsin.
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  safeAreaWeb: { paddingHorizontal: 18 },
  scrollContent: { paddingBottom: 140 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center' },

  topBar: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  iconBtnHover: { borderColor: 'rgba(196, 181, 253, 0.35)', backgroundColor: 'rgba(15, 23, 42, 0.7)' },
  iconBtnPressed: { opacity: 0.75 },
  topRightSpacer: { width: 40, height: 40 },

  iconWrap: { marginTop: 24, alignItems: 'center' },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.22)',
  },

  body: {
    marginTop: 22,
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 24,
  },
  muted: {
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
  },

  hintCard: {
    marginTop: 20,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    padding: 16,
    gap: 6,
  },
  hintLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  hintValue: { color: '#E2E8F0', fontSize: 16, fontWeight: '800' },
});
