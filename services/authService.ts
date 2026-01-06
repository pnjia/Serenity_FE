import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type AuthProvider = "local" | "google";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  createdAt: string;
  picture?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

const CURRENT_USER_KEY = "@serenity/currentUser";
const AUTH_TOKEN_KEY = "@serenity/authToken";

const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const fallback = Platform.select({
    android: "http://10.0.2.2:4000",
    ios: "http://localhost:4000",
    default: "http://localhost:4000",
  });

  const target = envUrl && envUrl.length > 0 ? envUrl : fallback;
  if (!target) {
    throw new Error("API base URL tidak ditemukan.");
  }

  return target.endsWith("/") ? target.slice(0, -1) : target;
};

const API_BASE_URL = resolveBaseUrl();

const parseJson = async (response: Response) => {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload as { error?: string; message?: string } | null)?.error ||
      (payload as { message?: string } | null)?.message ||
      "Terjadi kesalahan pada server.";
    throw new Error(message);
  }

  return payload;
};

const request = async (path: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    return parseJson(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Tidak dapat terhubung ke server.";
    throw new Error(
      `${message}. Pastikan backend Serenity berjalan dan dapat dijangkau.`
    );
  }
};

const persistSession = async ({ user, token }: AuthResponse) => {
  await AsyncStorage.multiSet([
    [CURRENT_USER_KEY, JSON.stringify(user)],
    [AUTH_TOKEN_KEY, token],
  ]);
  return user;
};

const getStoredToken = () => AsyncStorage.getItem(AUTH_TOKEN_KEY);

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const logoutUser = async () => {
  await AsyncStorage.multiRemove([CURRENT_USER_KEY, AUTH_TOKEN_KEY]);
};

export const registerUser = async (payload: RegisterPayload) => {
  const result = (await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;

  return persistSession(result);
};

export const loginUser = async (email: string, password: string) => {
  const result = (await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })) as AuthResponse;

  return persistSession(result);
};

const authorizedRequest = async (path: string, options: RequestInit = {}) => {
  const token = await getStoredToken();
  if (!token) {
    throw new Error("Sesi tidak ditemukan. Silakan login ulang.");
  }

  return request(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchProfile = async (): Promise<AuthUser | null> => {
  try {
    const profile = (await authorizedRequest("/auth/me")) as AuthUser;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    return profile;
  } catch (error) {
    if (error instanceof Error && /token/i.test(error.message)) {
      await logoutUser();
    }
    throw error;
  }
};

export const ensureSession = async () => {
  const token = await getStoredToken();
  if (!token) {
    return null;
  }

  try {
    return await fetchProfile();
  } catch {
    await logoutUser();
    return null;
  }
};

export const authenticateWithGoogle = async (
  idToken: string,
  intent: "login" | "register" = "login"
) => {
  const endpoint =
    intent === "register" ? "/auth/google/register" : "/auth/google/login";

  console.log(`[authService] Calling ${endpoint}...`);

  try {
    const result = (await request(endpoint, {
      method: "POST",
      body: JSON.stringify({ idToken }),
    })) as AuthResponse;

    console.log(
      "[authService] Authentication successful, persisting session..."
    );
    return persistSession(result);
  } catch (error) {
    console.error(`[authService] ${endpoint} failed:`, error);
    throw error;
  }
};
