import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
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

const BG = '#0B0E14';
const ACCENT = '#B298FF';
const ACCENT_BTN_TEXT = '#0B0E14';
const INPUT_BG = '#05070D';
const MUTED = '#94A3B8';
const BORDER_SUB = 'rgba(148, 163, 184, 0.2)';
const LABEL = '#94A3B8';

export default function RegisterScreen() {
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const onRegister = useCallback(() => {
    if (!fullName.trim()) {
      setError('Tam isim gerekli.');
      return;
    }
    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      setError('Geçerli bir e-posta gir.');
      return;
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.');
      return;
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setError('');
    router.replace('/(tabs)');
  }, [fullName, email, password, confirm, router]);

  return (
    <LinearGradient colors={['#020617', BG]} style={styles.gradient}>
      <SafeAreaView style={[styles.safe, isWeb && styles.safeWeb]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.inner}>
              <View style={styles.logoRow}>
                <Ionicons name="document-text" size={22} color={ACCENT} />
                <Text style={styles.logoText}>PrepUp</Text>
              </View>

              <Text style={styles.title}>
                <Text style={styles.titleLight}>{`PrepUp'a `}</Text>
                <Text style={styles.titleAccent}>Hoş Geldin!</Text>
              </Text>
              <Text style={styles.subtitle}>Kariyer yolculuğuna bugün başla.</Text>

              <View style={styles.form}>
                <Text style={styles.label}>TAM İSİM</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Begüm Kaya"
                  placeholderTextColor="#64748B"
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={(t) => {
                    setFullName(t);
                    setError('');
                  }}
                />

                <Text style={[styles.label, styles.labelGap]}>E-POSTA ADRESİ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: b.kaya@example.com"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError('');
                  }}
                />

                <Text style={[styles.label, styles.labelGap]}>ŞİFRE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 8 karakter"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setError('');
                  }}
                />

                <Text style={[styles.label, styles.labelGap]}>ŞİFREYİ ONAYLA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Şifreni tekrarla"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                  value={confirm}
                  onChangeText={(t) => {
                    setConfirm(t);
                    setError('');
                  }}
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable
                  onPress={onRegister}
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}>
                  <Text style={styles.primaryBtnText}>Kayıt Ol</Text>
                </Pressable>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.footerMuted}>Zaten üye misin? </Text>
                <Pressable onPress={() => router.replace('/')} hitSlop={8}>
                  <Text style={styles.footerLink}>Şimdi Giriş Yap.</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  safeWeb: { maxWidth: 480, alignSelf: 'center', width: '100%' },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingTop: 8,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
    marginTop: 8,
  },
  logoText: {
    color: ACCENT,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 10,
  },
  titleLight: { color: '#F8FAFC' },
  titleAccent: { color: ACCENT },
  subtitle: {
    color: MUTED,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 24,
  },
  form: { width: '100%' },
  label: {
    color: LABEL,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  labelGap: { marginTop: 12 },
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_SUB,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FB7185',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: ACCENT,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnPressed: { opacity: 0.88 },
  primaryBtnText: {
    color: ACCENT_BTN_TEXT,
    fontSize: 16,
    fontWeight: '800',
  },
  footerRow: {
    marginTop: 'auto',
    paddingTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerMuted: {
    color: MUTED,
    fontSize: 15,
    fontWeight: '500',
  },
  footerLink: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: '800',
  },
});
