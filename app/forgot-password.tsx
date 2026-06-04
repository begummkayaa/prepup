import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

import { forgotPasswordRequest } from '@/lib/auth-api';

const ACCENT = '#B298FF';
const INPUT_BG = '#05070D';
const BORDER_SUB = 'rgba(148, 163, 184, 0.2)';

export default function ForgotPasswordScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSend = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      setError('Geçerli bir e-posta gir.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await forgotPasswordRequest(trimmed);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız.');
    } finally {
      setBusy(false);
    }
  }, [email]);

  const goToReset = useCallback(() => {
    router.push({ pathname: '/reset-password', params: { email: email.trim().toLowerCase() } });
  }, [email, router]);

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
              <Text style={styles.topTitle}>Şifremi Unuttum</Text>
              <View style={styles.topSpacer} />
            </View>

            <View style={styles.iconWrap}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={28} color="#C4B5FD" />
              </View>
            </View>

            {!sent ? (
              <>
                <Text style={styles.heading}>Şifre Sıfırlama</Text>
                <Text style={styles.sub}>
                  Kayıtlı e-posta adresini gir; sana 6 haneli bir doğrulama kodu gönderelim.
                </Text>

                <Text style={styles.label}>E-POSTA ADRESİ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Kayıtlı e-posta adresin"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable
                  onPress={() => void onSend()}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    (pressed || busy) && styles.primaryBtnPressed,
                  ]}>
                  {busy
                    ? <ActivityIndicator color="#0B0E14" />
                    : <Text style={styles.primaryBtnText}>Kod Gönder</Text>
                  }
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.heading}>Kod Gönderildi!</Text>
                <Text style={styles.sub}>
                  <Text style={{ color: ACCENT }}>{email}</Text>
                  {' '}adresine 6 haneli doğrulama kodu gönderildi.{'\n\n'}
                  (E-posta servisi yapılandırılmamışsa kodu backend konsolundan alabilirsin.)
                </Text>

                <Pressable
                  onPress={goToReset}
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}>
                  <Text style={styles.primaryBtnText}>Kodu Gir →</Text>
                </Pressable>

                <Pressable onPress={() => setSent(false)} style={styles.retryWrap}>
                  <Text style={styles.retryText}>Farklı e-posta dene</Text>
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
  sub: { color: '#94A3B8', fontSize: 15, lineHeight: 24, marginBottom: 28 },

  label: { color: '#94A3B8', fontSize: 11, fontWeight: '700', letterSpacing: 1.6, marginBottom: 8 },
  input: {
    backgroundColor: INPUT_BG, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SUB,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    color: '#E2E8F0', fontSize: 16, fontWeight: '600',
  },

  errorText: { color: '#FB7185', fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 4 },

  primaryBtn: {
    marginTop: 20, backgroundColor: ACCENT, borderRadius: 28,
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnPressed: { opacity: 0.88 },
  primaryBtnText: { color: '#0B0E14', fontSize: 16, fontWeight: '800' },

  retryWrap: { marginTop: 16, alignSelf: 'center', paddingVertical: 8 },
  retryText: { color: ACCENT, fontSize: 14, fontWeight: '600' },
});
