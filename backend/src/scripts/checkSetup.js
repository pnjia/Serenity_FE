#!/usr/bin/env node

/**
 * Setup checker for Serenity Backend
 * Verifies that all required configuration is in place
 */

import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 Checking Serenity Backend Setup...\n");

let errors = 0;
let warnings = 0;

// Check 1: .env file
console.log("1️⃣  Checking .env file...");
const envPath = path.join(__dirname, "../../.env");
if (existsSync(envPath)) {
  console.log("   ✅ .env file exists");

  const envContent = readFileSync(envPath, "utf-8");
  const requiredVars = ["PORT", "JWT_SECRET", "GOOGLE_CLIENT_ID"];

  requiredVars.forEach((varName) => {
    if (envContent.includes(varName)) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing`);
      errors++;
    }
  });
} else {
  console.log("   ❌ .env file not found");
  console.log("   💡 Copy .env.example to .env and fill in the values");
  errors++;
}

// Check 2: Service Account Key
console.log("\n2️⃣  Checking Firebase service account key...");
const serviceAccountPath = path.join(__dirname, "../../serviceAccountKey.json");
if (existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, "utf-8")
    );

    if (serviceAccount.type === "service_account") {
      console.log("   ✅ Service account key is valid");
      console.log(`   ✅ Project: ${serviceAccount.project_id}`);
    } else {
      console.log("   ❌ Invalid service account key format");
      errors++;
    }
  } catch (error) {
    console.log("   ❌ Service account key is corrupted");
    errors++;
  }
} else {
  console.log("   ⚠️  Service account key not found");
  console.log("   💡 Download from Firebase Console:");
  console.log(
    "   https://console.firebase.google.com/project/beginner-project-4f054/settings/serviceaccounts/adminsdk"
  );
  console.log("   💡 The backend will work with limited access");
  warnings++;
}

// Check 3: Node modules
console.log("\n3️⃣  Checking dependencies...");
const nodeModulesPath = path.join(__dirname, "../../node_modules");
if (existsSync(nodeModulesPath)) {
  console.log("   ✅ node_modules exists");

  // Check for critical packages
  const criticalPackages = [
    "express",
    "firebase-admin",
    "jsonwebtoken",
    "bcryptjs",
  ];

  criticalPackages.forEach((pkg) => {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (existsSync(pkgPath)) {
      console.log(`   ✅ ${pkg} installed`);
    } else {
      console.log(`   ❌ ${pkg} not installed`);
      errors++;
    }
  });
} else {
  console.log("   ❌ node_modules not found");
  console.log("   💡 Run: npm install");
  errors++;
}

// Check 4: Firebase config
console.log("\n4️⃣  Checking Firebase configuration...");
const firebaseConfigPath = path.join(__dirname, "../config/firebase.js");
if (existsSync(firebaseConfigPath)) {
  console.log("   ✅ Firebase config file exists");
} else {
  console.log("   ❌ Firebase config file not found");
  errors++;
}

// Summary
console.log("\n" + "=".repeat(50));
if (errors === 0 && warnings === 0) {
  console.log("✅ All checks passed! Backend is ready to run.");
  console.log("\n🚀 Start the server with: npm run dev");
} else {
  if (errors > 0) {
    console.log(`❌ Found ${errors} error(s) that need to be fixed`);
  }
  if (warnings > 0) {
    console.log(
      `⚠️  Found ${warnings} warning(s) - backend will work with limited functionality`
    );
  }
  console.log("\n📖 See QUICKSTART.md for setup instructions");
}
console.log("=".repeat(50));

process.exit(errors > 0 ? 1 : 0);
