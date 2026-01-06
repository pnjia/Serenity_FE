import { UserProgressStore } from "../data/gameStore.js";

export const getUserProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgressStore.getOrCreate(userId);
    res.json(progress);
  } catch (error) {
    next(error);
  }
};

export const updateStreak = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgressStore.updateStreak(userId);
    res.json(progress);
  } catch (error) {
    next(error);
  }
};

export const incrementGamesPlayed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgressStore.incrementGamesPlayed(userId);
    res.json(progress);
  } catch (error) {
    next(error);
  }
};
