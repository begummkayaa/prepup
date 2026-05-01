import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type SimulationHeaderProps = {
  userName: string;
  targetRole: string;
};

export function SimulationHeader({ userName, targetRole }: SimulationHeaderProps) {
  return (
    <View>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={15} color="#C4B5FD" />
        </View>
        <View>
          <Text style={styles.welcomeText}>Hoş geldin,</Text>
          <Text style={styles.nameText}>{userName}</Text>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Mülakat Simülasyonu</Text>
        <View style={styles.targetRow}>
          <Text style={styles.targetDot}>•</Text>
          <Text style={styles.targetText}>Hedef Pozisyon: {targetRole}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  titleBlock: {
    marginTop: 28,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 49,
    lineHeight: 53,
    fontWeight: '700',
  },
  targetRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetDot: {
    color: '#A78BFA',
    fontSize: 20,
    lineHeight: 20,
  },
  targetText: {
    color: '#B8C2D9',
    fontSize: 15,
    fontWeight: '500',
  },
});
