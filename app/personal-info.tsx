import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserProfile } from '@/contexts/user-profile-context';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function PersonalInfoScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile, isLoading } = useUserProfile();

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

              <Text style={styles.topTitle}>Kişisel Bilgiler</Text>

              <View style={styles.topRightSpacer} />
            </View>

            <View style={styles.card}>
              {isLoading ? (
                <Text style={styles.muted}>Yükleniyor…</Text>
              ) : (
                <>
                  <InfoRow label="Ad Soyad" value={profile.fullName} />
                  <View style={styles.separator} />
                  <InfoRow label="Mail" value={profile.email.trim() ? profile.email : '—'} />
                </>
              )}
            </View>
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

  card: {
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    padding: 16,
  },
  infoRow: { gap: 6 },
  infoLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  infoValue: { color: '#E2E8F0', fontSize: 16, fontWeight: '800' },
  separator: { height: 1, backgroundColor: 'rgba(148, 163, 184, 0.14)', marginVertical: 16 },
  muted: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
});
