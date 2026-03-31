import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>Profil ayarlari ve hesap detaylari bu alanda yer alacak.</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1, padding: 20 },
  card: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    padding: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
  },
});
