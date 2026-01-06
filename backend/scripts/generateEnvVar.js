#!/usr/bin/env node

/**
 * Script to generate minified service account JSON for Vercel environment variable
 * Usage: node scripts/generateEnvVar.js
 */

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

  // Minify JSON (remove whitespace)
  const minified = JSON.stringify(serviceAccount);

  console.log("\n✅ Service Account JSON berhasil di-minify!\n");
  console.log("📋 Copy value berikut untuk Vercel Environment Variable:\n");
  console.log("Variable Name: FIREBASE_SERVICE_ACCOUNT");
  console.log("\nVariable Value:");
  console.log("─".repeat(80));
  console.log(minified);
  console.log("─".repeat(80));
  console.log("\n⚠️  Jangan share value ini ke public!\n");
  console.log("📌 Langkah selanjutnya:");
  console.log("1. Buka Vercel Dashboard → Settings → Environment Variables");
  console.log(
    "2. Tambahkan variable baru dengan name: FIREBASE_SERVICE_ACCOUNT"
  );
  console.log("3. Paste value di atas");
  console.log("4. Pilih environment: Production, Preview, Development");
  console.log("5. Save dan Redeploy\n");
} catch (error) {
  console.error("\n❌ Error:", error.message);
  console.error(
    "\n💡 Pastikan file serviceAccountKey.json ada di folder backend/\n"
  );
  process.exit(1);
}
