# Changelog - Serenity App Updates

## Tanggal: 6 Januari 2026

### Perbaikan Bug

#### 1. ✅ Pop-up Left Arrow pada Website

- **Status**: Sudah ada implementasi `handleBackPress` dengan `Alert.alert` di semua game
- **Catatan**: Alert mungkin tidak terlihat jelas di web, tapi sudah berfungsi di mobile

#### 2. ✅ Logika Level Counter pada Pola & Warna

- **Masalah**: Template literal tidak diformat dengan benar, menampilkan "Lanjut ke Level ${level + 1}"
- **Solusi**: Diperbaiki dengan menggunakan variabel `nextLevel` dan template literal yang benar
- **File**: `app/games/pola-warna.tsx`

### Fitur Baru

#### 3. ✅ Quest System

- **Backend**:

  - Dibuat `questStore.js` untuk mengelola quest di Firestore
  - Dibuat `questController.js` dan `questRoutes.js`
  - Ditambahkan collection `USER_QUESTS` di Firebase
  - Quest otomatis generate baru setelah semua quest selesai
  - Quest progress terupdate otomatis saat bermain game

- **Frontend**:
  - Dibuat `questService.ts` untuk komunikasi dengan backend
  - Diupdate `app/(tabs)/quests.tsx` dengan UI quest list lengkap
  - Menampilkan progress bar untuk setiap quest
  - Menampilkan reward XP untuk setiap quest
  - Quest types: `play_games`, `reach_score`, `reach_level`, `play_different_games`

#### 4. ✅ Day Streak System

- **Backend**:

  - Diperbaiki logika `updateStreak` di `gameStore.js`
  - Menggunakan UTC date untuk konsistensi timezone
  - Streak increment hanya sekali per hari
  - Streak reset jika tidak bermain > 1 hari
  - Menambahkan field `lastStreakDate` untuk tracking

- **Frontend**:
  - Diupdate `app/(tabs)/profile.tsx` untuk menampilkan streak
  - Menampilkan stat cards: Day Streak dan Games Played
  - Auto-update streak setiap kali buka profile
  - Terintegrasi dengan `questService.ts`

#### 5. ✅ Database & API Updates

- **Collections Baru**:

  - `user_quests`: Menyimpan quest per user
  - Updated `user_progress`: Menambahkan `lastStreakDate` field

- **Endpoints Baru**:

  - `GET /quests` - Mendapatkan quest user
  - `POST /quests/progress` - Update progress quest
  - `POST /quests/:questId/complete` - Complete quest
  - `GET /progress` - Mendapatkan user progress
  - `POST /progress/streak` - Update streak
  - `POST /progress/games` - Increment games played

- **Integrasi**:
  - `saveScore` di gameController otomatis update quest progress
  - Quest progress terupdate berdasarkan activity type

### Files Changed

#### Backend

- `backend/src/config/firebase.js` - Added USER_QUESTS collection
- `backend/src/data/questStore.js` - New file
- `backend/src/data/gameStore.js` - Updated streak logic
- `backend/src/controllers/questController.js` - New file
- `backend/src/controllers/progressController.js` - New file
- `backend/src/controllers/gameController.js` - Added quest integration
- `backend/src/routes/questRoutes.js` - New file
- `backend/src/routes/progressRoutes.js` - New file
- `backend/src/app.js` - Added new routes

#### Frontend

- `app/games/pola-warna.tsx` - Fixed level counter bug
- `app/(tabs)/quests.tsx` - Complete quest UI implementation
- `app/(tabs)/profile.tsx` - Added streak display
- `services/questService.ts` - New file

### Cara Testing

1. **Start Backend**:

   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend**:

   ```bash
   cd ..
   npx expo start
   ```

3. **Test Quest System**:

   - Login ke aplikasi
   - Buka tab "Quests" untuk melihat quest aktif
   - Mainkan game untuk update progress quest
   - Quest baru akan muncul setelah semua quest selesai

4. **Test Streak System**:
   - Login ke aplikasi
   - Buka tab "Profile" untuk melihat streak
   - Streak akan increment jika login di hari berikutnya
   - Streak reset jika tidak login lebih dari 1 hari

### Notes

- Quest progress akan otomatis terupdate saat bermain game
- Streak hanya increment sekali per hari (UTC timezone)
- Semua data tersimpan di Firebase Firestore
- Error handling sudah diimplementasikan di semua endpoint
