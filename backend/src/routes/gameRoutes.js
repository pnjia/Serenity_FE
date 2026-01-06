import express from "express";
import {
  getBestScore,
  getLeaderboard,
  getProgress,
  getUserScores,
  saveScore,
  validators,
} from "../controllers/gameController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

// All game routes require authentication
router.use(requireAuth);

// Save a game score
router.post("/scores", validateRequest(validators.saveScoreSchema), saveScore);

// Get user's scores (optionally filtered by gameType)
router.get("/scores", getUserScores);

// Get user's best score for a specific game
router.get("/scores/best/:gameType", getBestScore);

// Get leaderboard for a specific game
router.get("/leaderboard/:gameType", getLeaderboard);

// Get user progress (streak, total games, etc)
router.get("/progress", getProgress);

export default router;
