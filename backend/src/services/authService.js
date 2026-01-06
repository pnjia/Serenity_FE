import { randomUUID } from "crypto";
import { UserStore } from "../data/firestoreUserStore.js";
import { verifyGoogleToken } from "../utils/googleVerifier.js";
import { signToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

const buildAuthResponse = (user) => ({
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    createdAt: user.createdAt,
  },
  token: signToken({ id: user.id, email: user.email }),
});

export const registerLocalUser = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await UserStore.findByEmail(normalizedEmail);
  if (existing) {
    throw new Error("Email sudah terdaftar.");
  }

  const hashed = await hashPassword(password);
  const newUser = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashed,
    provider: "local",
    createdAt: new Date().toISOString(),
  };

  await UserStore.create(newUser);
  return buildAuthResponse(newUser);
};

export const loginLocalUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await UserStore.findByEmail(normalizedEmail);
  if (!user || user.provider !== "local") {
    throw new Error("Email atau password salah.");
  }

  const match = await verifyPassword(password, user.passwordHash);
  if (!match) {
    throw new Error("Email atau password salah.");
  }

  return buildAuthResponse(user);
};

export const registerGoogleUser = async ({ idToken }) => {
  console.log("[authService] Starting Google registration...");
  const profile = await verifyGoogleToken(idToken);

  if (!profile.emailVerified) {
    throw new Error("Email Google belum terverifikasi.");
  }

  const normalizedEmail = normalizeEmail(profile.email);
  const existing = await UserStore.findByEmail(normalizedEmail);
  if (existing) {
    throw new Error("Email sudah terdaftar. Silakan login menggunakan Google.");
  }

  const newUser = {
    id: randomUUID(),
    name: profile.name,
    email: normalizedEmail,
    passwordHash: null,
    provider: "google",
    picture: profile.picture,
    createdAt: new Date().toISOString(),
  };

  await UserStore.create(newUser);
  console.log(
    "[authService] Google user registered successfully:",
    newUser.email
  );
  return buildAuthResponse(newUser);
};

export const loginGoogleUser = async ({ idToken }) => {
  console.log("[authService] Starting Google login...");
  const profile = await verifyGoogleToken(idToken);
  const normalizedEmail = normalizeEmail(profile.email);
  let user = await UserStore.findByEmail(normalizedEmail);

  // Auto-register if user doesn't exist
  if (!user) {
    console.log("[authService] User not found, auto-registering...");
    const newUser = {
      id: randomUUID(),
      name: profile.name,
      email: normalizedEmail,
      passwordHash: null,
      provider: "google",
      picture: profile.picture,
      createdAt: new Date().toISOString(),
    };
    await UserStore.create(newUser);
    user = newUser;
    console.log(
      "[authService] Google user auto-registered successfully:",
      user.email
    );
  } else if (user.provider !== "google") {
    throw new Error(
      "Email sudah terdaftar dengan provider lain. Silakan gunakan email/password untuk login."
    );
  } else {
    console.log(
      "[authService] Google user logged in successfully:",
      user.email
    );
  }

  return buildAuthResponse(user);
};

export const getProfileById = async (userId) => {
  const users = await UserStore.getAll();
  const user = users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error("Pengguna tidak ditemukan");
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    createdAt: user.createdAt,
    picture: user.picture,
  };
};
