import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useUserProfile } from '@/contexts/user-profile-context';

/**
 * `/` ile `/(tabs)` Expo Router’da aynı pathname birleşimine düşebiliyor;
 * bu yüzden çıkışta `replace('/')` sekme ana sayfasına gidiyordu.
 * Gerçek e-posta/şifre ekranı `/sign-in`.
 */
export default function Index() {
  const { isLoading, isAuthenticated } = useUserProfile();

  if (isLoading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color="#B298FF" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/sign-in" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#0B0E14',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
