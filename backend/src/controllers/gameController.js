import { z } from "zod";
import { GameScoreStore, UserProgressStore } from "../data/gameStore.js";
import { QuestStore } from "../data/questStore.js";

const gameTypes = ["pola-warna", "mengorganisir", "logika-zen", "ritme-suara"];

const saveScoreSchema = z.object({
  body: z.object({
    gameType: z.enum(gameTypes, {
      errorMap: () => ({ message: "Tipe game tidak valid" }),
    }),
    score: z.number().min(0, "Score tidak boleh negatif"),
    level: z.number().min(1, "Level harus minimal 1"),
  }),
});

export const validators = {
  saveScoreSchema,
};

/**
 * Save a game score
 */
export const saveScore = async (req, res, next) => {
  try {
    const { gameType, score, level } = req.validated.body;
    const userId = req.user.id;

    // Save the score
    const scoreData = {
      userId,
      gameType,
      score,
      level,
    };

    const savedScore = await GameScoreStore.create(scoreData);

    // Update user progress
    await UserProgressStore.incrementGamesPlayed(userId);
    await UserProgressStore.updateStreak(userId);

    // Update quest progress
    try {
      await QuestStore.updateQuestProgress(userId, "game_played", 1);
      await QuestStore.updateQuestProgress(userId, "score_added", score);
      await QuestStore.updateQuestProgress(userId, "level_reached", level);
    } catch (questError) {
      console.error("Failed to update quest progress:", questError);
      // Don't fail the request if quest update fails
    }

    res.status(201).json({
      message: "Score berhasil disimpan",
      score: savedScore,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's scores
 */
export const getUserScores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { gameType } = req.query;

    let scores;
    if (gameType) {
      scores = await GameScoreStore.getByUserAndGame(userId, gameType);
    } else {
      scores = await GameScoreStore.getByUserId(userId);
    }

    res.json({ scores });
  } catch (error) {
    next(error);
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const { gameType } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (!gameTypes.includes(gameType)) {
      return res.status(400).json({ error: "Tipe game tidak valid" });
    }

    const leaderboard = await GameScoreStore.getLeaderboard(gameType, limit);

    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's best score
 */
export const getBestScore = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { gameType } = req.params;

    if (!gameTypes.includes(gameType)) {
      return res.status(400).json({ error: "Tipe game tidak valid" });
    }

    const bestScore = await GameScoreStore.getBestScore(userId, gameType);

    res.json({ bestScore });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user progress
 */
export const getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgressStore.getOrCreate(userId);

    res.json({ progress });
  } catch (error) {
    next(error);
  }
};
