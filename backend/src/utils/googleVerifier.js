import { OAuth2Client } from "google-auth-library";
import { config } from "../config.js";

const client = config.googleClientId
  ? new OAuth2Client(config.googleClientId)
  : null;

export const verifyGoogleToken = async (idToken) => {
  if (!client) {
    throw new Error(
      "Google Client ID belum dikonfigurasi. Setel GOOGLE_CLIENT_ID di file .env."
    );
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Token Google tidak valid");
  }

  return {
    email: payload.email,
    name: payload.name || payload.given_name || "Pengguna Google",
    picture: payload.picture,
    emailVerified: payload.email_verified,
  };
};
