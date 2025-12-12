# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Connect to the Serenity backend

1. Jalankan backend terlebih dahulu.

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Siapkan file `.env` di folder `backend` dengan nilai berikut:

   ```env
   PORT=4000
   JWT_SECRET=super-secret-key
   GOOGLE_CLIENT_ID=<Google OAuth client ID untuk backend>
   ```

3. Buat file `.env` di root project Expo untuk menghubungkan aplikasi ke API dan Google OAuth:

   ```env
   EXPO_PUBLIC_API_URL=http://10.0.2.2:4000 # ganti dengan IP lokal saat testing di device fisik
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<Client ID Android>
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<Client ID iOS>
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Client ID Web>
   # Opsional: jika menggunakan Expo Go
   EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=<Client ID Expo>
   ```

4. Setelah backend berjalan dan variabel lingkungan terpasang, jalankan aplikasi Expo seperti biasa (`npx expo start`).

> Pastikan perangkat/emulator dapat mengakses alamat `EXPO_PUBLIC_API_URL`. Untuk emulator Android gunakan `http://10.0.2.2:<port>`, sedangkan iOS simulator/Expo Go bisa memakai IP lokal mesin Anda.
