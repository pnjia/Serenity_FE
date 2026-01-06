import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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

const request = async (path: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Terjadi kesalahan");
    }

    return data;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Tidak dapat terhubung ke server.";
    throw new Error(message);
  }
};

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: number;
  createdAt: string;
  completedAt?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  streak: number;
  totalGamesPlayed: number;
  achievements: string[];
  lastPlayedAt: string | null;
  lastStreakDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const getUserQuests = async (): Promise<Quest[]> => {
  return await request("/quests");
};

export const getUserProgress = async (): Promise<UserProgress> => {
  return await request("/progress");
};

export const updateStreak = async (): Promise<UserProgress> => {
  return await request("/progress/streak", {
    method: "POST",
  });
};

export const updateQuestProgress = async (
  activityType: string,
  value?: number
): Promise<Quest[]> => {
  return await request("/quests/progress", {
    method: "POST",
    body: JSON.stringify({ activityType, value }),
  });
};
