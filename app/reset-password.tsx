import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resetPasswordRequest } from '@/lib/auth-api';

const ACCENT = '#B298FF';
const INPUT_BG = '#05070D';
const BORDER_SUB = 'rgba(148, 163, 184, 0.2)';

export default function ResetPasswordScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const emailParam = params.email ?? '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = useCallback(async () => {
    if (code.trim().length !== 6) {
      setError('6 haneli kodu eksiksiz gir.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Yeni şifre en az 8 karakter olmalı.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await resetPasswordRequest(emailParam, code.trim(), newPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız.');
    } finally {
      setBusy(false);
    }
  }, [code, newPassword, confirmPassword, emailParam]);

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.gradient}>
      <SafeAreaView style={[styles.safe, isWeb && styles.safeWeb]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                hitSlop={12}>
                <Ionicons name="chevron-back" size={22} color="#C4B5FD" />
              </Pressable>
              <Text style={styles.topTitle}>Yeni Şifre Belirle</Text>
              <View style={styles.topSpacer} />
            </View>

            <View style={styles.iconWrap}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={done ? 'checkmark-circle-outline' : 'lock-closed-outline'}
                  size={28}
                  color="#C4B5FD"
                />
              </View>
            </View>

            {!done ? (
              <>
                <Text style={styles.heading}>Şifreni Sıfırla</Text>
                {emailParam ? (
                  <Text style={styles.sub}>
                    <Text style={{ color: ACCENT }}>{emailParam}</Text>
                    {' '}adresine gönderilen 6 haneli kodu gir.
                  </Text>
                ) : (
                  <Text style={styles.sub}>E-postana gönderilen 6 haneli kodu gir.</Text>
                )}

                <Text style={styles.label}>DOĞRULAMA KODU</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="000000"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={(t) => { setCode(t.replace(/\D/g, '')); setError(''); }}
                />

                <Text style={[styles.label, styles.labelGap]}>YENİ ŞİFRE</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="En az 8 karakter"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={(t) => { setNewPassword(t); setError(''); }}
                  />
                  <Pressable onPress={() => setShowNew((v) => !v)} style={styles.eyeBtn}>
                    <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748B" />
                  </Pressable>
                </View>

                <Text style={[styles.label, styles.labelGap]}>ŞİFRE TEKRARI</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Şifreyi tekrar gir"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                  />
                  <Pressable onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748B" />
                  </Pressable>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable
                  onPress={() => void onSubmit()}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    (pressed || busy) && styles.primaryBtnPressed,
                  ]}>
                  {busy
                    ? <ActivityIndicator color="#0B0E14" />
                    : <Text style={styles.primaryBtnText}>Şifremi Güncelle</Text>
                  }
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.heading}>Şifren Güncellendi!</Text>
                <Text style={styles.sub}>
                  Yeni şifrenle giriş yapabilirsin.
                </Text>
                <Pressable
                  onPress={() => router.replace('/sign-in')}
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}>
                  <Text style={styles.primaryBtnText}>Giriş Yap</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  safeWeb: { maxWidth: 480, alignSelf: 'center', width: '100%' },
  scrollContent: { flexGrow: 1, paddingBottom: 48 },
  scrollContentWeb: { flexGrow: 1, paddingBottom: 64 },

  topBar: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  topSpacer: { width: 40 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  iconBtnPressed: { opacity: 0.75 },

  iconWrap: { marginTop: 28, marginBottom: 8, alignItems: 'center' },
  iconCircle: {
    width: 72, height: 72, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.10)',
    borderWidth: 1, borderColor: 'rgba(196, 181, 253, 0.22)',
  },

  heading: { color: '#F8FAFC', fontSize: 24, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  sub: { color: '#94A3B8', fontSize: 15, lineHeight: 24, marginBottom: 24 },

  label: { color: '#94A3B8', fontSize: 11, fontWeight: '700', letterSpacing: 1.6, marginBottom: 8 },
  labelGap: { marginTop: 16 },

  input: {
    backgroundColor: INPUT_BG, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SUB,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    color: '#E2E8F0', fontSize: 16, fontWeight: '600',
  },
  codeInput: {
    fontSize: 28, fontWeight: '800', letterSpacing: 10, textAlign: 'center',
  },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: INPUT_BG, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SUB,
  },
  inputFlex: {
    flex: 1, paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    color: '#E2E8F0', fontSize: 16, fontWeight: '600',
  },
  eyeBtn: { paddingHorizontal: 14 },

  errorText: { color: '#FB7185', fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 4 },

  primaryBtn: {
    marginTop: 24, backgroundColor: ACCENT, borderRadius: 28,
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnPressed: { opacity: 0.88 },
  primaryBtnText: { color: '#0B0E14', fontSize: 16, fontWeight: '800' },
});
