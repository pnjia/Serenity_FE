import { Router } from "express";
import {
  completeQuest,
  getUserQuests,
  updateQuestProgress,
} from "../controllers/questController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get user quests
router.get("/", getUserQuests);

// Update quest progress
router.post("/progress", updateQuestProgress);

// Complete a quest
router.post("/:questId/complete", completeQuest);

export default router;
