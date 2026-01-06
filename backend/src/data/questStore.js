import { COLLECTIONS, db } from "../config/firebase.js";

/**
 * Quest Store for Firestore
 */
export const QuestStore = {
  /**
   * Get user quests or create default ones
   */
  async getUserQuests(userId) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.USER_QUESTS)
        .where("userId", "==", userId)
        .where("completed", "==", false)
        .get();

      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      // Create default quests
      const defaultQuests = [
        {
          userId,
          title: "Mainkan game pertama kali",
          description: "Selesaikan satu permainan apapun",
          type: "play_games",
          target: 1,
          progress: 0,
          completed: false,
          reward: 100,
          createdAt: new Date().toISOString(),
        },
        {
          userId,
          title: "Main 3 game berbeda",
          description: "Coba mainkan 3 jenis game yang berbeda",
          type: "play_different_games",
          target: 3,
          progress: 0,
          completed: false,
          reward: 200,
          createdAt: new Date().toISOString(),
        },
        {
          userId,
          title: "Raih skor 100",
          description: "Dapatkan total skor 100 poin",
          type: "reach_score",
          target: 100,
          progress: 0,
          completed: false,
          reward: 150,
          createdAt: new Date().toISOString(),
        },
      ];

      const questRefs = await Promise.all(
        defaultQuests.map((quest) =>
          db.collection(COLLECTIONS.USER_QUESTS).add(quest)
        )
      );

      return defaultQuests.map((quest, index) => ({
        id: questRefs[index].id,
        ...quest,
      }));
    } catch (error) {
      console.error("Error getting user quests:", error);
      throw error;
    }
  },

  /**
   * Update quest progress
   */
  async updateProgress(questId, progress) {
    try {
      const docRef = db.collection(COLLECTIONS.USER_QUESTS).doc(questId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error("Quest tidak ditemukan");
      }

      const questData = doc.data();
      const newProgress = Math.min(progress, questData.target);
      const completed = newProgress >= questData.target;

      await docRef.update({
        progress: newProgress,
        completed: completed,
        completedAt: completed ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      });

      return {
        id: doc.id,
        ...questData,
        progress: newProgress,
        completed,
      };
    } catch (error) {
      console.error("Error updating quest progress:", error);
      throw error;
    }
  },

  /**
   * Complete a quest
   */
  async completeQuest(questId) {
    try {
      const docRef = db.collection(COLLECTIONS.USER_QUESTS).doc(questId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error("Quest tidak ditemukan");
      }

      await docRef.update({
        completed: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        id: doc.id,
        ...doc.data(),
        completed: true,
      };
    } catch (error) {
      console.error("Error completing quest:", error);
      throw error;
    }
  },

  /**
   * Generate new quests for user
   */
  async generateNewQuests(userId) {
    try {
      // Get completed quests count to determine next quest level
      const completedSnapshot = await db
        .collection(COLLECTIONS.USER_QUESTS)
        .where("userId", "==", userId)
        .where("completed", "==", true)
        .get();

      const completedCount = completedSnapshot.size;
      const level = Math.floor(completedCount / 3) + 1;

      const newQuests = [
        {
          userId,
          title: `Mainkan ${level * 2} game`,
          description: `Selesaikan ${level * 2} permainan apapun`,
          type: "play_games",
          target: level * 2,
          progress: 0,
          completed: false,
          reward: 100 * level,
          createdAt: new Date().toISOString(),
        },
        {
          userId,
          title: `Capai Level ${level * 3}`,
          description: `Capai level ${level * 3} di salah satu game`,
          type: "reach_level",
          target: level * 3,
          progress: 0,
          completed: false,
          reward: 150 * level,
          createdAt: new Date().toISOString(),
        },
        {
          userId,
          title: `Raih ${level * 200} poin`,
          description: `Dapatkan total skor ${level * 200} poin`,
          type: "reach_score",
          target: level * 200,
          progress: 0,
          completed: false,
          reward: 200 * level,
          createdAt: new Date().toISOString(),
        },
      ];

      const questRefs = await Promise.all(
        newQuests.map((quest) =>
          db.collection(COLLECTIONS.USER_QUESTS).add(quest)
        )
      );

      return newQuests.map((quest, index) => ({
        id: questRefs[index].id,
        ...quest,
      }));
    } catch (error) {
      console.error("Error generating new quests:", error);
      throw error;
    }
  },

  /**
   * Update quest progress based on game activity
   */
  async updateQuestProgress(userId, activityType, value) {
    try {
      const quests = await this.getUserQuests(userId);

      const updates = [];

      for (const quest of quests) {
        if (quest.completed) continue;

        let shouldUpdate = false;
        let newProgress = quest.progress;

        switch (activityType) {
          case "game_played":
            if (quest.type === "play_games") {
              newProgress = quest.progress + 1;
              shouldUpdate = true;
            }
            break;
          case "score_added":
            if (quest.type === "reach_score") {
              newProgress = quest.progress + value;
              shouldUpdate = true;
            }
            break;
          case "level_reached":
            if (quest.type === "reach_level") {
              newProgress = Math.max(quest.progress, value);
              shouldUpdate = true;
            }
            break;
        }

        if (shouldUpdate) {
          updates.push(this.updateProgress(quest.id, newProgress));
        }
      }

      const results = await Promise.all(updates);

      // Check if all quests are completed
      const allCompleted = results.every((r) => r.completed);

      if (allCompleted && results.length > 0) {
        // Generate new quests
        await this.generateNewQuests(userId);
      }

      return results;
    } catch (error) {
      console.error("Error updating quest progress:", error);
      throw error;
    }
  },
};
