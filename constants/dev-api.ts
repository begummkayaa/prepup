import { Platform } from 'react-native';

/**
 * Geliştirme (Expo Go, Android/iOS): Manifest/.env bazen cihazda görünmez; bu adres önceliklidir.
 * Web’de boş bırakılır (localhost / .env kullanılır).
 * IP’yi ipconfig ile güncelle veya USB + `npm run adb:reverse-api` ile `http://127.0.0.1:3001` yaz.
 */
export const DEV_API_BASE_URL =
  __DEV__ && Platform.OS !== 'web'
    ? (typeof process.env.EXPO_PUBLIC_API_URL === 'string' ? process.env.EXPO_PUBLIC_API_URL.trim() : '')
    : '';
