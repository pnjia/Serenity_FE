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

export type GameType =
  | "pola-warna"
  | "mengorganisir"
  | "logika-zen"
  | "ritme-suara";

export interface GameScore {
  id: string;
  userId: string;
  gameType: GameType;
  score: number;
  level: number;
  timestamp: string;
}

export interface UserProgress {
  userId: string;
  streak: number;
  totalGamesPlayed: number;
  achievements: string[];
  lastPlayedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveScorePayload {
  gameType: GameType;
  score: number;
  level: number;
}

/**
 * Save a game score
 */
export const saveGameScore = async (
  payload: SaveScorePayload
): Promise<{ message: string; score: GameScore }> => {
  return request("/game/scores", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * Get user's scores (optionally filtered by game type)
 */
export const getUserScores = async (
  gameType?: GameType
): Promise<{ scores: GameScore[] }> => {
  const query = gameType ? `?gameType=${gameType}` : "";
  return request(`/game/scores${query}`);
};

/**
 * Get user's best score for a specific game
 */
export const getBestScore = async (
  gameType: GameType
): Promise<{ bestScore: GameScore | null }> => {
  return request(`/game/scores/best/${gameType}`);
};

/**
 * Get leaderboard for a specific game
 */
export const getLeaderboard = async (
  gameType: GameType,
  limit: number = 10
): Promise<{ leaderboard: GameScore[] }> => {
  return request(`/game/leaderboard/${gameType}?limit=${limit}`);
};

/**
 * Get user progress (streak, total games, achievements)
 */
export const getUserProgress = async (): Promise<{
  progress: UserProgress;
}> => {
  return request("/game/progress");
};
