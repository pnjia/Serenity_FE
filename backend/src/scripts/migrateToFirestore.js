import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { UserStore } from "../data/firestoreUserStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration script to move users from users.json to Firestore
 * Run once with: node src/scripts/migrateToFirestore.js
 */
async function migrate() {
  try {
    console.log("Starting migration from users.json to Firestore...");

    const usersPath = path.join(__dirname, "../data/users.json");
    const rawData = readFileSync(usersPath, "utf-8");
    const users = JSON.parse(rawData);

    if (!Array.isArray(users) || users.length === 0) {
      console.log("No users found to migrate.");
      return;
    }

    console.log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
      try {
        // Check if user already exists
        const existing = await UserStore.findByEmail(user.email);
        if (existing) {
          console.log(`⏭️  Skipping ${user.email} - already exists`);
          continue;
        }

        await UserStore.create(user);
        console.log(`✅ Migrated: ${user.email}`);
      } catch (error) {
        console.error(`❌ Error migrating ${user.email}:`, error.message);
      }
    }

    console.log("\n✨ Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrate();
