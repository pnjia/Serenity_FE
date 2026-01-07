import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHbCVATp6soZEdV47StUz-LeosBm0TFH4",
  authDomain: "beginner-project-4f054.firebaseapp.com",
  projectId: "beginner-project-4f054",
  storageBucket: "beginner-project-4f054.firebasestorage.app",
  messagingSenderId: "516610028",
  appId: "1:516610028:web:a76c992c3ab507033312c9",
};

// Initialize Firebase Admin SDK with service account
if (!admin.apps.length) {
  try {
    let serviceAccount;

    // Try to load from environment variable first (for Vercel/production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log("✓ Service account loaded from environment variable");
      } catch (error) {
        console.error(
          "❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:",
          error.message
        );
        throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT format");
      }
    }

    // Fallback to local file (for development)
    if (!serviceAccount) {
      try {
        const serviceAccountPath = path.join(
          __dirname,
          "../../serviceAccountKey.json"
        );
        serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
        console.log("✓ Service account key loaded from file");
      } catch (error) {
        console.error("❌ Service account key not found");
        throw new Error(
          "Firebase credentials not found. Please set FIREBASE_SERVICE_ACCOUNT environment variable or add serviceAccountKey.json"
        );
      }
    }

    // Initialize with service account (full access)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
    console.log(
      "✓ Firebase Admin initialized with service account (full access)"
    );
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
    throw error;
  }
}

export const db = admin.firestore();
export const auth = admin.auth();

// Collections
export const COLLECTIONS = {
  USERS: "users",
  GAME_SCORES: "game_scores",
  USER_PROGRESS: "user_progress",
  USER_QUESTS: "user_quests",
};

export default admin;
