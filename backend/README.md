# Serenity Backend API

Backend API untuk aplikasi Serenity dengan autentikasi JWT, Google OAuth, dan Firebase Firestore.

## 🚀 Features

- ✅ JWT Authentication
- ✅ Local registration/login (email/password)
- ✅ Google OAuth integration
- ✅ Firebase Firestore database
- ✅ Game scores & leaderboard system
- ✅ User progress tracking (streak, achievements)
- ✅ RESTful API endpoints

## 📋 Prerequisites

- Node.js >= 18
- Firebase project
- Google OAuth credentials

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

**Important:** Follow the [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) guide for detailed Firebase configuration.

Quick setup:

1. Create Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Download service account key (Project Settings → Service Accounts → Generate New Private Key)
4. Save it as `serviceAccountKey.json` in the backend root directory
5. Add `serviceAccountKey.json` to `.gitignore` (already configured)

### 3. Environment Variables

Create a `.env` file:

```bash
# Server
PORT=4000

# JWT Secret (change to a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth Client ID (for token verification)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Firebase
FIREBASE_PROJECT_ID=beginner-project-4f054
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

### 4. Start the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API will be available at `http://localhost:4000`.

## 📚 API Documentation

### Authentication Endpoints

#### POST `/auth/register`

Register a new user with email and password.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "local",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### POST `/auth/login`

Login with email and password.

#### POST `/auth/google/register` & `/auth/google/login`

Google OAuth authentication.

#### GET `/auth/me`

Get current user profile (requires authentication).

### Game Endpoints

All game endpoints require authentication (Bearer token).

#### POST `/game/scores`

Save a game score.

**Request:**

```json
{
  "gameType": "pola-warna",
  "score": 150,
  "level": 5
}
```

Game types: `pola-warna`, `mengorganisir`, `logika-zen`, `ritme-suara`

#### GET `/game/scores?gameType=pola-warna`

Get user's scores (optionally filter by game type).

#### GET `/game/scores/best/:gameType`

Get user's best score for a specific game.

#### GET `/game/leaderboard/:gameType?limit=10`

Get leaderboard for a specific game.

#### GET `/game/progress`

Get user's progress (streak, total games played, achievements).

## 🗄️ Database Structure

### Firestore Collections

- **users**: User accounts (local & Google OAuth)
- **game_scores**: Individual game scores
- **user_progress**: Streak, total games, achievements

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed schema.

## 🔄 Migration from JSON to Firestore

If you have existing users in `users.json`:

```bash
node src/scripts/migrateToFirestore.js
```

## 🧪 Testing

### Manual Testing with cURL

Register:

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

Save Score:

```bash
curl -X POST http://localhost:4000/game/scores \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gameType":"pola-warna","score":150,"level":5}'
```

## 🔒 Security Notes

- Never commit `.env` or `serviceAccountKey.json`
- Use strong JWT secrets in production
- Set up proper Firestore security rules
- Enable HTTPS in production
- Rate limit authentication endpoints

## 📝 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── controllers/
│   │   ├── authController.js    # Auth endpoints
│   │   └── gameController.js    # Game endpoints
│   ├── data/
│   │   ├── firestoreUserStore.js # Firestore user operations
│   │   └── gameStore.js         # Game scores & progress
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorHandler.js      # Error handling
│   │   └── validateRequest.js   # Input validation
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   └── gameRoutes.js        # Game routes
│   ├── services/
│   │   └── authService.js       # Business logic
│   ├── utils/
│   │   ├── jwt.js               # JWT utilities
│   │   ├── password.js          # Password hashing
│   │   └── googleVerifier.js    # Google token verification
│   ├── scripts/
│   │   └── migrateToFirestore.js # Migration script
│   └── index.js                 # Entry point
├── .env                         # Environment variables
├── serviceAccountKey.json       # Firebase credentials (not in git)
├── FIREBASE_SETUP.md            # Firebase setup guide
└── README.md
```

## 📄 License

MIT
