import { QuestStore } from "../data/questStore.js";

export const getUserQuests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const quests = await QuestStore.getUserQuests(userId);
    res.json(quests);
  } catch (error) {
    next(error);
  }
};

export const updateQuestProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { activityType, value } = req.body;

    if (!activityType) {
      return res.status(400).json({ error: "Activity type is required" });
    }

    const results = await QuestStore.updateQuestProgress(
      userId,
      activityType,
      value || 1
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const completeQuest = async (req, res, next) => {
  try {
    const { questId } = req.params;
    const result = await QuestStore.completeQuest(questId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
