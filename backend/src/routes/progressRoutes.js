import { Router } from "express";
import {
  getUserProgress,
  incrementGamesPlayed,
  updateStreak,
} from "../controllers/progressController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get user progress
router.get("/", getUserProgress);

// Update streak
router.post("/streak", updateStreak);

// Increment games played
router.post("/games", incrementGamesPlayed);

export default router;
