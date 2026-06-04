# 🚀 PrepUp — Yapay Zeka Destekli Kariyer Asistanı

PrepUp, iş arayanların kariyer hazırlığını güçlendirmek için geliştirilmiş bir mobil ve web uygulamasıdır. CV analizinden mülakat simülasyonuna kadar tüm süreci yapay zeka ile destekler.

---

## ✨ Özellikler

- 📄 **CV Analizi** — CV yükle, hedef rol ve sektör seç; Gemini AI ile uyumluluk skoru, güçlü yönler, eksikler ve öneriler al
- 💬 **Mülakat Simülasyonu** — Seçtiğin role özel AI destekli mülakat soruları, cevaplarına anlık geri bildirim ve detaylı performans raporu
- 📜 **Geçmiş** — Tüm CV analizleri ve mülakat oturumlarını tek yerden gör, filtrele, detaylarına ulaş
- 🔒 **Şifre Sıfırlama** — E-posta ile 6 haneli kod gönderimi (nodemailer)
- 📱 **Web + Mobil** — Android, iOS ve tarayıcıda çalışır

---

## 🛠️ Teknoloji Yığını

### 🎨 Frontend

| | |
|---|---|
| 🏗️ Framework | React Native 0.81 + Expo 54 |
| 🗺️ Routing | Expo Router (dosya tabanlı) |
| 📘 Dil | TypeScript |
| 💅 UI | expo-linear-gradient, @expo/vector-icons, react-native-reanimated |
| 💾 Depolama | AsyncStorage (oturum/token) |
| 🌐 Platform | 🤖 Android · 🍏 iOS · 💻 Web (react-native-web) |

### ⚙️ Backend

| | |
|---|---|
| 🟢 Sunucu | Node.js 20+ · Express 4 |
| 📘 Dil | TypeScript (tsx ile geliştirme) |
| 🐘 Veritabanı | PostgreSQL + Prisma 6 |
| 🤖 Yapay Zeka | Google Gemini (`gemini-2.5-flash`) |
| 🔐 Auth | bcryptjs · jsonwebtoken |
| 📧 E-posta | nodemailer |
| 🛡️ Güvenlik | helmet · cors |

---

## 📥 Kurulum

### 📋 Gereksinimler
- Node.js 20+
- PostgreSQL
- Google Gemini API anahtarı

### 1. 📂 Depoyu klonla

```bash
git clone [https://github.com/kullanici-adi/prepup.git](https://github.com/kullanici-adi/prepup.git)
cd prepup

---

### 2. ⚙️ Ortam değişkenlerini ayarla

```bash
copy .env.example .env
```

`.env` dosyasını düzenle:

```env
EXPO_PUBLIC_API_URL=http://<bilgisayar-ipv4>:3001   # Gerçek telefon için
GEMINI_API_KEY=...
DATABASE_URL=postgresql://prepup:prepup@localhost:5432/prepup

# İsteğe bağlı — SMTP yoksa kod konsola yazdırılır
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=...
# SMTP_PASS=...
```

### 3. 🚀 Backend

```bash
cd backend
npm install
npm run db:migrate   # Prisma migration
npm run dev          # http://localhost:3001
```

### 4. 📱 Frontend

```bash
# Proje kökünde
npm install
npx expo start
```

Expo uygulamasını aç:
- **🌐 Tarayıcı:** `w` tuşuna bas
- **📱 Telefon:** QR kodu oku (Expo Go) — bilgisayar ve telefon aynı Wi-Fi'da olmalı
- **🔌 Android USB:** `npm run adb:reverse-api` sonra `EXPO_PUBLIC_API_URL=http://127.0.0.1:3001`

---

## 📁 Proje Yapısı

```
prepup/
├── app/                        # Expo Router ekranları
│   ├── (tabs)/                 # Alt sekmeler (Ana Sayfa, Geçmişim, Profil)
│   ├── sign-in.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   ├── cv-analysis.tsx
│   ├── cv-analysis-report.tsx
│   ├── interview-preparation.tsx
│   ├── interview-summary.tsx
│   └── report-detail.tsx
├── components/                 # Yeniden kullanılabilir bileşenler
├── contexts/                   # React context (oturum, mülakat erişimi)
├── lib/                        # API istemcileri, yardımcı fonksiyonlar
├── backend/
│   ├── prisma/                 # Şema ve migration'lar
│   └── src/
│       ├── modules/            # auth, cv, interview, history route'ları
│       └── lib/                # Şifre, token, e-posta yardımcıları
└── .env                        # Ortam değişkenleri (git'e eklenmez)
```

---

## 🌐 API Uç Noktaları

| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| POST | `/api/v1/auth/register` | Kayıt |
| POST | `/api/v1/auth/login` | Giriş |
| GET | `/api/v1/auth/me` | Oturum bilgisi |
| POST | `/api/v1/auth/forgot-password` | Sıfırlama kodu gönder |
| POST | `/api/v1/auth/reset-password` | Yeni şifre belirle |
| POST | `/api/v1/cv/analyze` | CV analizi |
| POST | `/api/v1/interview/next-question` | Sonraki mülakat sorusu |
| POST | `/api/v1/interview/summary` | Mülakat özeti |
| GET | `/api/v1/history` | Geçmiş listesi |

---

## 📄 Lisans

MIT
