import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { InterviewAccessProvider } from '@/contexts/interview-access-context';
import { UserProfileProvider } from '@/contexts/user-profile-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  /** İlk yüklemede `/` (giriş); deep link sonra ana sekme yapısı. */
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <UserProfileProvider>
      <InterviewAccessProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cv-analysis" options={{ headerShown: false }} />
          <Stack.Screen name="cv-analysis-report" options={{ headerShown: false }} />
          <Stack.Screen name="report-detail" options={{ headerShown: false }} />
          <Stack.Screen name="interview-preparation" options={{ headerShown: false }} />
          <Stack.Screen name="interview-summary" options={{ headerShown: false }} />
          <Stack.Screen name="personal-info" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </InterviewAccessProvider>
    </UserProfileProvider>
  );
}
