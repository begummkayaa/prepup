import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useUserProfile } from '@/contexts/user-profile-context';

const PURPLE = '#A78BFA';

export function InterviewPreparationHome() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();

  const [targetRole, setTargetRole] = useState('');
  const [sector, setSector] = useState('');

  const goSimulation = () => {
    router.push({
      pathname: '/interview-simulation',
      params: {
        targetRole: targetRole.trim() || 'Yazılım Geliştirici',
        sector: sector.trim(),
      },
    });
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
            <Ionicons name="briefcase-outline" size={22} color="#C4B5FD" />
          </View>
        </View>
        <Text style={styles.cardKicker}>MÜLAKAT AYARLARI</Text>

        <Text style={styles.inputLabel}>HEDEF POZİSYON</Text>
        <TextInput
          value={targetRole}
          onChangeText={setTargetRole}
          placeholder="Örn: Yazılım Geliştirici"
          placeholderTextColor="#475569"
          style={styles.textInput}
        />

        <Text style={[styles.inputLabel, { marginTop: 14 }]}>SEKTÖR</Text>
        <TextInput
          value={sector}
          onChangeText={setSector}
          placeholder="Örn: Teknoloji"
          placeholderTextColor="#475569"
          style={styles.textInput}
        />

      </View>

      <Pressable
        onPress={goSimulation}
        style={({ pressed, hovered }) => [
          styles.confirmBtn,
          isWeb && hovered && styles.confirmBtnHover,
          pressed && styles.confirmBtnPressed,
        ]}>
        <Ionicons name="play" size={16} color="#1E1B4B" />
        <Text style={styles.confirmBtnText}>Mülakatı Başlat</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 2,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
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
  nameText: { color: PURPLE, fontSize: 17, fontWeight: '700' },
  nameTextWeb: { fontSize: 14 },
  pageTitle: { marginTop: 20, color: '#F8FAFC', fontSize: 28, fontWeight: '800', letterSpacing: 0.2 },
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
    marginBottom: 14,
  },
  inputLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '500',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PURPLE,
    borderRadius: 22,
    paddingVertical: 16,
    marginTop: 34,
  },
  confirmBtnHover: { opacity: 0.95 },
  confirmBtnPressed: { opacity: 0.88 },
  confirmBtnText: { color: '#1E1B4B', fontSize: 15, fontWeight: '800' },

});
