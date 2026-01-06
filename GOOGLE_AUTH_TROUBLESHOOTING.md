# Google OAuth Setup Guide

## Masalah yang Mungkin Terjadi

Jika setelah memilih akun Google aplikasi "diam saja" dan tidak mengarahkan kemana-mana, kemungkinan masalahnya adalah:

### 1. **Client ID Configuration**

Pastikan Anda menggunakan Client ID yang **BENAR** untuk setiap platform:

#### Untuk Android:

- Gunakan **Android OAuth Client ID** (bukan Web Client ID)
- Format: `xxx.apps.googleusercontent.com`
- Dapatkan dari Google Cloud Console → Credentials → OAuth 2.0 Client IDs → Android

#### Untuk iOS:

- Gunakan **iOS OAuth Client ID** (bukan Web Client ID)
- Format: `xxx.apps.googleusercontent.com`
- Dapatkan dari Google Cloud Console → Credentials → OAuth 2.0 Client IDs → iOS

#### Untuk Web:

- Gunakan **Web OAuth Client ID**
- Format: `xxx.apps.googleusercontent.com`
- Dapatkan dari Google Cloud Console → Credentials → OAuth 2.0 Client IDs → Web application

### 2. **Backend Configuration**

Backend harus menggunakan **Web Client ID** yang sama dengan frontend web:

```env
# backend/.env
GOOGLE_CLIENT_ID=<Your-Web-Client-ID>.apps.googleusercontent.com
```

### 3. **SHA-1 Certificate (Khusus Android)**

Untuk Android, Anda **HARUS** menambahkan SHA-1 fingerprint ke Google Cloud Console:

```bash
# Development (Debug)
cd android
./gradlew signingReport

# Atau dengan keytool
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy SHA-1 fingerprint dan tambahkan ke:
Google Cloud Console → Credentials → OAuth 2.0 Client IDs → Android → Add fingerprint

### 4. **Authorized Redirect URIs**

Pastikan redirect URI sudah ditambahkan di Google Cloud Console:

Untuk Web Client ID, tambahkan:

- `http://localhost:4000/auth/google/callback`
- `http://127.0.0.1:4000/auth/google/callback`

## Langkah-langkah Perbaikan

### Step 1: Buat Client ID yang Benar di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Pilih project Anda
3. Navigation menu → APIs & Services → Credentials
4. Klik "Create Credentials" → "OAuth 2.0 Client ID"

#### Buat 3 Client IDs:

**A. Android Client ID**

- Application type: Android
- Package name: `com.pnjia.serenity` (atau sesuai app.json)
- SHA-1 certificate fingerprint: (dari langkah signingReport di atas)

**B. iOS Client ID**

- Application type: iOS
- Bundle ID: `com.pnjia.serenity` (atau sesuai app.json)

**C. Web Client ID** (untuk backend verification)

- Application type: Web application
- Authorized redirect URIs:
  - `http://localhost:4000/auth/google/callback`
  - `http://127.0.0.1:4000/auth/google/callback`

### Step 2: Update Environment Variables

**Frontend (/.env)**

```env
EXPO_PUBLIC_API_URL=http://localhost:4000

# PENTING: Gunakan Client ID yang BERBEDA untuk setiap platform
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<Android-Client-ID>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<iOS-Client-ID>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Web-Client-ID>.apps.googleusercontent.com

EXPO_PUBLIC_GOOGLE_REDIRECT_URL=http://127.0.0.1:4000/auth/google/callback
EXPO_PUBLIC_USE_EXPO_AUTH_PROXY=false
EXPO_PUBLIC_APP_SCHEME=serenity
```

**Backend (/backend/.env)**

```env
PORT=4000
JWT_SECRET=super_secret_jwt_key

# PENTING: Gunakan Web Client ID yang SAMA dengan EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
GOOGLE_CLIENT_ID=<Web-Client-ID>.apps.googleusercontent.com
```

### Step 3: Restart Aplikasi

```bash
# Stop semua proses
# Ctrl+C di semua terminal yang menjalankan npm/expo

# Restart backend
cd backend
npm start

# Restart frontend (di terminal lain)
cd ..
npx expo start -c  # -c untuk clear cache
```

### Step 4: Test di Device/Emulator yang Benar

**Untuk Android:**

- Gunakan Android emulator atau device
- Pastikan SHA-1 sudah ditambahkan

**Untuk iOS:**

- Gunakan iOS simulator atau device
- Bundle ID harus match dengan Google Console

**Untuk Web:**

- Buka di browser: `http://localhost:8081`

## Debug Mode

Aplikasi sekarang memiliki logging yang lebih detail. Cek console log untuk melihat error:

```
[Google Login] Starting Google authentication...
[useGoogleAuth] Prompting for Google authentication...
[useGoogleAuth] Result type: success
[useGoogleAuth] Successfully got ID token
[Google Login] Got ID token, authenticating with backend...
[authService] Calling /auth/google/login...
[authService] Authentication successful, persisting session...
[Google Login] Authentication successful, redirecting...
```

Jika ada error, akan muncul di log dengan detail lengkap.

## Common Errors

### "Token Google tidak valid"

- Backend tidak bisa verify token
- Pastikan `GOOGLE_CLIENT_ID` di backend sama dengan Web Client ID
- Pastikan idToken yang dikirim valid

### "Akun Google belum terdaftar"

- User belum register dengan Google
- Arahkan user untuk register dulu
- Atau ubah flow agar auto-register

### "Login Google dibatalkan"

- User menutup popup/dialog Google
- Ini normal, biarkan user coba lagi

### Aplikasi "diam saja" setelah pilih akun

- Client ID salah untuk platform yang digunakan
- SHA-1 belum ditambahkan (Android)
- Bundle ID tidak match (iOS)
- Check console log untuk error detail

## Alternative: Auto-Register on Login

Jika ingin user yang belum register bisa langsung login, ubah backend:

```javascript
// backend/src/services/authService.js
export const loginGoogleUser = async ({ idToken }) => {
  const profile = await verifyGoogleToken(idToken);
  const normalizedEmail = normalizeEmail(profile.email);
  let user = await UserStore.findByEmail(normalizedEmail);

  // Auto-register jika belum ada
  if (!user) {
    const newUser = {
      id: randomUUID(),
      name: profile.name,
      email: normalizedEmail,
      passwordHash: null,
      provider: "google",
      picture: profile.picture,
      createdAt: new Date().toISOString(),
    };
    await UserStore.create(newUser);
    user = newUser;
  } else if (user.provider !== "google") {
    throw new Error("Email sudah terdaftar dengan provider lain.");
  }

  return buildAuthResponse(user);
};
```
