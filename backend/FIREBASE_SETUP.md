# Firebase Setup Guide

## Prerequisites

- Firebase project created at https://console.firebase.google.com/
- Project ID: `beginner-project-4f054`

## Configuration

### 1. Firebase Admin SDK Setup

For **production** environment, you need to:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file and save it as `serviceAccountKey.json` in the backend root
4. **Add to .gitignore**: Make sure `serviceAccountKey.json` is in `.gitignore`

Then update `src/config/firebase.js`:

```javascript
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync(path.join(__dirname, "../../serviceAccountKey.json"), "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "beginner-project-4f054",
});
```

### 2. Development Setup (Current)

Currently configured for development using Application Default Credentials (ADC):

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set default project
firebase use beginner-project-4f054

# Set application default credentials
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
```

### 3. Firestore Database Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Allow read if authenticated
      allow read: if request.auth != null;
      // Allow create/update only by the user themselves or admin
      allow create, update: if request.auth != null;
      // Prevent deletion for safety
      allow delete: if false;
    }

    // Game scores collection
    match /game_scores/{scoreId} {
      allow read, write: if request.auth != null;
    }

    // User progress collection
    match /user_progress/{progressId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Firestore Indexes

Create composite indexes if needed:

- Go to Firebase Console → Firestore Database → Indexes
- Add indexes for frequently queried fields

### 5. Environment Variables

Update your `.env` file:

```env
# Firebase
FIREBASE_PROJECT_ID=beginner-project-4f054
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Existing vars...
PORT=4000
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
```

## Migration from JSON to Firestore

To migrate existing users from `users.json` to Firestore:

```javascript
// Run this script once: src/scripts/migrateToFirestore.js
import { readFileSync } from "fs";
import { UserStore } from "./data/firestoreUserStore.js";

const users = JSON.parse(readFileSync("./src/data/users.json", "utf-8"));

for (const user of users) {
  await UserStore.create(user);
  console.log(`Migrated user: ${user.email}`);
}

console.log("Migration complete!");
```

Run with:

```bash
node src/scripts/migrateToFirestore.js
```

## Collections Structure

### Users Collection (`users`)

```javascript
{
  id: "uuid",
  name: "User Name",
  email: "user@example.com",
  passwordHash: "hashed_password", // for local auth
  provider: "local" | "google",
  picture: "url", // for Google auth
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

### Game Scores Collection (`game_scores`)

```javascript
{
  userId: "user_id",
  gameType: "pola-warna" | "mengorganisir" | "logika-zen" | "ritme-suara",
  score: 100,
  level: 5,
  timestamp: "ISO timestamp"
}
```

### User Progress Collection (`user_progress`)

```javascript
{
  userId: "user_id",
  streak: 7,
  totalGamesPlayed: 25,
  achievements: [],
  lastPlayedAt: "ISO timestamp"
}
```

## Testing

Test the Firestore connection:

```bash
# Start the server
npm run dev

# Test registration
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Check Firestore Console to see the new user
```

## Troubleshooting

### Error: "Could not load the default credentials"

- Make sure you've run `firebase login`
- Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Or use service account key file

### Error: "Missing or insufficient permissions"

- Check Firestore security rules
- Make sure the service account has proper permissions

### Error: "The caller does not have permission"

- Enable Firestore API in Google Cloud Console
- Check IAM permissions for the service account

## Additional Features

### Enable Firebase Storage (for profile pictures)

```javascript
import { getStorage } from "firebase-admin/storage";

export const bucket = getStorage().bucket();
```

### Enable Firebase Authentication (optional)

```javascript
import { getAuth } from "firebase-admin/auth";

export const firebaseAuth = getAuth();
```
