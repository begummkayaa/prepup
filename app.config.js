const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Expo Node config
const appJson = require('./app.json');

const apiBaseUrl =
  (process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.trim()) ||
  (appJson.expo.extra && appJson.expo.extra.apiBaseUrl) ||
  'http://localhost:3000';

/** @type {import('expo/config').ExpoConfig} */
const expo = {
  ...appJson.expo,
  ios: {
    ...appJson.expo.ios,
    infoPlist: {
      ...(appJson.expo.ios && appJson.expo.ios.infoPlist),
      NSAppTransportSecurity: {
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    ...appJson.expo.android,
    // HTTP ile yerel API (https yok); aksi halde Android isteği sessizce düşebilir
    usesCleartextTraffic: true,
  },
  extra: {
    ...appJson.expo.extra,
    apiBaseUrl,
  },
};

module.exports = { expo };
