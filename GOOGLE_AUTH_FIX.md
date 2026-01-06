# Perbaikan Google Auth - Quick Guide

## ✅ Yang Sudah Diperbaiki

### 1. **Auto-Register pada Login**

Sekarang user **tidak perlu register terlebih dahulu**. Saat login dengan Google:

- Jika akun belum ada → otomatis didaftarkan
- Jika akun sudah ada → langsung login
- Jika email sudah digunakan provider lain → tampilkan error

### 2. **Logging & Debugging**

Ditambahkan console.log di setiap tahap:

- Frontend: Login/Register flow
- Backend: Token verification & user creation
- Akan membantu debugging jika ada masalah

### 3. **Error Handling yang Lebih Baik**

- Error ditampilkan di UI (tidak hanya Alert)
- Error message lebih spesifik dan informatif
- Console log menunjukkan di mana error terjadi

## 🔍 Cara Testing

### Step 1: Check Console Log

Buka developer console dan lihat log saat melakukan Google Auth:

```
[Google Login] Starting Google authentication...
[useGoogleAuth] Prompting for Google authentication...
[useGoogleAuth] Result type: success
[useGoogleAuth] Successfully got ID token
[Google Login] Got ID token, authenticating with backend...
[authService] Calling /auth/google/login...
[googleVerifier] Verifying Google token...
[googleVerifier] Token verified successfully for: user@gmail.com
[authService] User not found, auto-registering...
[authService] Google user auto-registered successfully: user@gmail.com
[authService] Authentication successful, persisting session...
[Google Login] Authentication successful, redirecting...
```

### Step 2: Jika Ada Error

Cek console log untuk melihat di tahap mana error terjadi:

**"Token Google tidak valid"**

- Masalah: Backend tidak bisa verify token
- Solusi: Pastikan `GOOGLE_CLIENT_ID` di backend/.env benar

**"Tidak dapat mengambil token Google"**

- Masalah: Frontend gagal mendapat token dari Google
- Solusi:
  - Cek Client ID untuk platform (Android/iOS/Web)
  - Untuk Android: Tambahkan SHA-1 fingerprint

**Aplikasi "diam saja" tanpa error**

- Masalah: Kemungkinan Client ID salah untuk platform
- Solusi: Lihat panduan lengkap di `GOOGLE_AUTH_TROUBLESHOOTING.md`

## 🚀 Quick Setup (Jika Belum Berfungsi)

### 1. Dapatkan SHA-1 (Untuk Android)

```bash
./get-sha1.sh
```

Copy SHA-1 dan tambahkan ke Google Cloud Console → Android OAuth Client

### 2. Verifikasi Environment Variables

**Frontend (.env)**

```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<Android-ID>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<iOS-ID>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Web-ID>.apps.googleusercontent.com
```

**Backend (backend/.env)**

```env
GOOGLE_CLIENT_ID=<Web-ID>.apps.googleusercontent.com
```

⚠️ **PENTING**: Web Client ID harus sama di frontend dan backend!

### 3. Restart Aplikasi

```bash
# Stop semua proses (Ctrl+C)

# Backend
cd backend && npm start

# Frontend (terminal baru)
npx expo start -c
```

## 📱 Testing di Platform Berbeda

### Android

- Gunakan Android emulator atau device
- **Wajib**: SHA-1 fingerprint sudah ditambahkan
- Package name: `com.pnjia.serenity`

### iOS

- Gunakan iOS simulator atau device
- Bundle ID: `com.pnjia.serenity`

### Web

- Buka: `http://localhost:8081`
- Browser modern (Chrome/Firefox/Safari)

## 💡 Tips Debugging

1. **Cek console log** - semua tahap akan terlog
2. **Lihat network tab** - cek apakah request ke `/auth/google/login` berhasil
3. **Test backend langsung** - gunakan Postman/curl untuk test endpoint
4. **Cek Google Cloud Console** - pastikan semua credentials benar

## 📞 Jika Masih Bermasalah

Baca panduan lengkap: `GOOGLE_AUTH_TROUBLESHOOTING.md`

File tersebut berisi:

- Penjelasan detail setiap masalah
- Cara setup Client ID yang benar
- Common errors dan solusinya
- Alternative solutions
