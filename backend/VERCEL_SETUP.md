# Setup Backend di Vercel

## Langkah-langkah Deploy ke Vercel

### 1. Persiapan Environment Variables

Buka file `serviceAccountKey.json` Anda, lalu copy seluruh isinya (format JSON).

### 2. Setup di Vercel Dashboard

1. Buka project Anda di [Vercel Dashboard](https://vercel.com)
2. Klik **Settings** → **Environment Variables**
3. Tambahkan variable berikut:

**Variable Name:** `FIREBASE_SERVICE_ACCOUNT`

**Value:** Paste seluruh isi dari `serviceAccountKey.json` (harus dalam satu baris atau minified)

Contoh format value:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

4. Pilih environment: **Production**, **Preview**, dan **Development**
5. Klik **Save**

### 3. Tambahkan Environment Variables Lainnya (jika ada)

Jika Anda memiliki variable lain di `.env`, tambahkan juga:

- `JWT_SECRET`
- `PORT` (opsional, Vercel akan otomatis set)
- Variable lainnya yang diperlukan

### 4. Redeploy

Setelah menambahkan environment variables:

1. Kembali ke tab **Deployments**
2. Klik **Redeploy** pada deployment terakhir
3. Atau push perubahan baru ke repository

### 5. Verifikasi

Setelah deployment selesai:

1. Buka URL Vercel Anda: `https://serenity-fe-tau.vercel.app`
2. Cek logs untuk memastikan Firebase initialized dengan benar
3. Test endpoint API Anda

## Tips

- **Jangan commit** `serviceAccountKey.json` ke Git
- Pastikan `.gitignore` sudah include `serviceAccountKey.json`
- Jika ada perubahan di service account, update environment variable di Vercel
- Untuk debugging, cek **Function Logs** di Vercel Dashboard

## Troubleshooting

### Error: "Could not load the default credentials"

- Pastikan `FIREBASE_SERVICE_ACCOUNT` sudah di-set di Vercel
- Pastikan format JSON valid (tidak ada newline yang merusak)
- Pastikan environment variable di-apply ke environment yang benar

### Error: "Invalid JSON"

- Copy ulang isi `serviceAccountKey.json`
- Pastikan tidak ada karakter aneh atau newline yang merusak
- Bisa gunakan JSON minifier online untuk memastikan format correct

### Firebase initialization gagal

- Cek apakah service account memiliki permission yang cukup di Firebase Console
- Pastikan project ID benar
- Cek Function Logs di Vercel untuk error detail
