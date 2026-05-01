import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserProfile } from '@/contexts/user-profile-context';

export default function ProfileScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();

  const roleLabel = useMemo(() => 'YAZILIM GELİŞTİRİCİ', []);

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

              <Text style={styles.topTitle}>Profil</Text>

              <View style={styles.topRightSpacer} />
            </View>

            <View style={styles.hero}>
              <View style={styles.avatarOuter}>
                <View style={styles.avatarRing} />
                <View style={styles.avatarInner}>
                  <Ionicons name="person" size={34} color="#C4B5FD" />
                </View>
                <View style={styles.statusDot} />
              </View>

              <Text style={styles.name}>{profile.fullName}</Text>
              <Text style={styles.role}>{roleLabel}</Text>
            </View>

            <View style={styles.cards}>
              <Pressable
                onPress={() => {}}
                style={({ pressed, hovered }) => [
                  styles.card,
                  isWeb && hovered && styles.cardHover,
                  pressed && styles.cardPressed,
                ]}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="person" size={18} color="#C4B5FD" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Kişisel Bilgiler</Text>
                    <Text style={styles.cardSubtitle}>Hesap ve kimlik detayları</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
              </Pressable>

              <View style={[styles.card, styles.cardTall]}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="document-text" size={18} color="#C4B5FD" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Özgeçmişim (PDF)</Text>
                  </View>
                </View>

                <View style={styles.pdfRow}>
                  <Text style={styles.pdfName} numberOfLines={1}>
                    begum-kaya-cv.pdf
                  </Text>
                  <Pressable
                    onPress={() => {}}
                    style={({ pressed, hovered }) => [
                      styles.pdfDownloadBtn,
                      pressed && styles.pdfDownloadPressed,
                      isWeb && hovered && styles.pdfDownloadHover,
                    ]}
                    hitSlop={10}>
                    <Ionicons name="download-outline" size={18} color="#C4B5FD" />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() => {}}
                style={({ pressed, hovered }) => [
                  styles.card,
                  isWeb && hovered && styles.cardHover,
                  pressed && styles.cardPressed,
                ]}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="settings" size={18} color="#C4B5FD" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Uygulama Ayarları</Text>
                    <Text style={styles.cardSubtitle}>Tercihler ve bildirimler</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
              </Pressable>

              <Pressable
                onPress={() => {}}
                style={({ pressed, hovered }) => [
                  styles.card,
                  isWeb && hovered && styles.cardHover,
                  pressed && styles.cardPressed,
                ]}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="help-circle" size={18} color="#C4B5FD" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Yardım ve Destek</Text>
                    <Text style={styles.cardSubtitle}>Sıkça sorulan sorular</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => {}}
              style={({ pressed, hovered }) => [
                styles.logoutBtn,
                pressed && styles.logoutPressed,
                isWeb && hovered && styles.logoutHover,
              ]}>
              <Text style={styles.logoutText}>OTURUMU KAPAT</Text>
            </Pressable>
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

  hero: { marginTop: 18, alignItems: 'center', paddingVertical: 16 },
  avatarOuter: { width: 140, height: 140, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(196, 181, 253, 0.22)',
  },
  avatarInner: {
    width: 92,
    height: 92,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  statusDot: {
    position: 'absolute',
    right: 34,
    bottom: 32,
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#FB7185',
    borderWidth: 2,
    borderColor: '#0B0F2A',
  },

  name: { marginTop: 8, color: '#F8FAFC', fontSize: 30, fontWeight: '800', letterSpacing: 0.2 },
  role: { marginTop: 6, color: 'rgba(148, 163, 184, 0.9)', fontSize: 12, fontWeight: '800', letterSpacing: 1.8 },

  cards: { marginTop: 18, gap: 14 },
  card: {
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHover: { borderColor: 'rgba(196, 181, 253, 0.30)', backgroundColor: 'rgba(15, 23, 42, 0.62)' },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
  cardTall: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(148, 163, 184, 0.10)' },
  cardText: { flex: 1 },
  cardTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '800' },
  cardSubtitle: { marginTop: 3, color: '#94A3B8', fontSize: 12, fontWeight: '600' },

  pdfRow: {
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  pdfName: { color: 'rgba(226, 232, 240, 0.85)', fontSize: 13, fontWeight: '700', flex: 1 },
  pdfDownloadBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.22)',
  },
  pdfDownloadHover: { borderColor: 'rgba(196, 181, 253, 0.45)', backgroundColor: 'rgba(167, 139, 250, 0.16)' },
  pdfDownloadPressed: { opacity: 0.75 },

  logoutBtn: {
    marginTop: 20,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.4)',
    backgroundColor: 'rgba(2, 6, 23, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutHover: { borderColor: 'rgba(251, 113, 133, 0.7)', backgroundColor: 'rgba(2, 6, 23, 0.35)' },
  logoutPressed: { opacity: 0.8 },
  logoutText: { color: '#FB7185', fontSize: 12, fontWeight: '900', letterSpacing: 2.2 },
});

