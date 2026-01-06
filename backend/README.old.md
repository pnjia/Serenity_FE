# Serenity Auth API

Express.js backend that mirrors the mobile app's authentication flow using JWT, Google OAuth2 verification, and file-based persistence via `src/data/users.json`.

## Setup

1. Copy `.env.example` → `.env` and fill values:

```bash
PORT=4000
JWT_SECRET=super_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000` (or custom `PORT`).

## Endpoints

| Method | Path                    | Description                                                       |
| ------ | ----------------------- | ----------------------------------------------------------------- |
| `POST` | `/auth/register`        | Register local account (`name`, `email`, `password`)              |
| `POST` | `/auth/login`           | Login with email/password                                         |
| `POST` | `/auth/google/register` | Register via Google ID token                                      |
| `POST` | `/auth/google/login`    | Login via Google ID token                                         |
| `GET`  | `/auth/me`              | Get current user profile (requires `Authorization: Bearer <JWT>`) |

### Request Details

#### Register

```json
POST /auth/register
{
  "name": "Serenity User",
  "email": "user@example.com",
  "password": "secret123"
}
```

#### Login

```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "secret123"
}
```

#### Google Register/Login

```json
POST /auth/google/register
{
  "idToken": "GOOGLE_ID_TOKEN"
}
```

Same payload for `/auth/google/login`. Tokens are verified using the configured `GOOGLE_CLIENT_ID`.

#### Profile

```
GET /auth/me
Authorization: Bearer <jwt>
```

## Error Handling

- Validation errors return `422` with detailed messages.
- Auth failures return `401` or `403` depending on context.
- All other issues flow through the centralized `errorHandler` middleware.

## File Storage

User records are stored in `src/data/users.json`. This keeps the API lightweight but should be replaced with a database like Postgres or MongoDB for production.
