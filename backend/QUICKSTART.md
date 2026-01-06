# 🔥 Quick Firebase Setup Guide

## Step 1: Download Service Account Key

1. **Go to Firebase Console:**

   ```
   https://console.firebase.google.com/project/beginner-project-4f054/settings/serviceaccounts/adminsdk
   ```

2. **Click "Generate New Private Key"**

   - A JSON file will be downloaded

3. **Rename and Move the file:**

   ```bash
   # Rename the downloaded file to serviceAccountKey.json
   mv ~/Downloads/beginner-project-xxxxx.json ./serviceAccountKey.json
   ```

4. **Verify the file is in the correct location:**
   ```bash
   ls -la serviceAccountKey.json
   ```
   Should be in the `backend/` root directory

## Step 2: Enable Firestore Database

1. Go to: https://console.firebase.google.com/project/beginner-project-4f054/firestore
2. Click "Create Database"
3. Choose "Start in **test mode**" (for development)
4. Select a location (e.g., `us-central`)
5. Click "Enable"

## Step 3: Set Firestore Security Rules

1. Go to Firestore → Rules tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - authenticated users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
    }

    // Game scores - authenticated users can write, everyone can read
    match /game_scores/{scoreId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // User progress - users can only access their own progress
    match /user_progress/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

## Step 4: Start the Server

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

You should see:

```
✓ Service account key loaded successfully
✓ Firebase Admin initialized with service account (full access)
Server running on http://localhost:4000
```

## Step 5: Test the Connection

```bash
# Test registration
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

Then check Firebase Console → Firestore to see the new user!

## Troubleshooting

### Error: "Service account key not found"

- Make sure `serviceAccountKey.json` is in the `backend/` directory (same level as `package.json`)
- Check the filename is exactly `serviceAccountKey.json`

### Error: "PERMISSION_DENIED"

- Make sure Firestore is enabled in Firebase Console
- Check that security rules are published

### Error: "Could not load default credentials"

- This means the service account key is not loaded properly
- Verify the JSON file is valid (not corrupted)
- Check file permissions: `chmod 600 serviceAccountKey.json`

## Security Checklist

- ✅ `serviceAccountKey.json` is in `.gitignore`
- ✅ Never commit the service account key to Git
- ✅ Use test mode rules for development only
- ✅ Update security rules for production
- ✅ Use environment variables for sensitive data

## Next Steps

1. ✅ Test authentication endpoints
2. ✅ Test game score endpoints
3. ✅ Connect frontend to backend
4. ✅ Test end-to-end flow

Need help? Check the full guide: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
