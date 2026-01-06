import { COLLECTIONS, db } from "../config/firebase.js";

/**
 * Game Score Store for Firestore
 */
export const GameScoreStore = {
  /**
   * Save a game score
   */
  async create(scoreData) {
    try {
      const docRef = await db.collection(COLLECTIONS.GAME_SCORES).add({
        ...scoreData,
        timestamp: new Date().toISOString(),
      });

      return {
        id: docRef.id,
        ...scoreData,
      };
    } catch (error) {
      console.error("Error creating game score:", error);
      throw error;
    }
  },

  /**
   * Get all scores for a user
   */
  async getByUserId(userId) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.GAME_SCORES)
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting scores by user:", error);
      throw error;
    }
  },

  /**
   * Get scores for a specific game
   */
  async getByUserAndGame(userId, gameType) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.GAME_SCORES)
        .where("userId", "==", userId)
        .where("gameType", "==", gameType)
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting scores by game:", error);
      throw error;
    }
  },

  /**
   * Get high scores (leaderboard)
   */
  async getLeaderboard(gameType, limit = 10) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.GAME_SCORES)
        .where("gameType", "==", gameType)
        .orderBy("score", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      throw error;
    }
  },

  /**
   * Get user's best score for a game
   */
  async getBestScore(userId, gameType) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.GAME_SCORES)
        .where("userId", "==", userId)
        .where("gameType", "==", gameType)
        .orderBy("score", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error getting best score:", error);
      throw error;
    }
  },
};

/**
 * User Progress Store for Firestore
 */
export const UserProgressStore = {
  /**
   * Get or create user progress
   */
  async getOrCreate(userId) {
    try {
      const doc = await db
        .collection(COLLECTIONS.USER_PROGRESS)
        .doc(userId)
        .get();

      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }

      // Create default progress
      const defaultProgress = {
        userId,
        streak: 0,
        totalGamesPlayed: 0,
        achievements: [],
        lastPlayedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db
        .collection(COLLECTIONS.USER_PROGRESS)
        .doc(userId)
        .set(defaultProgress);

      return {
        id: userId,
        ...defaultProgress,
      };
    } catch (error) {
      console.error("Error getting user progress:", error);
      throw error;
    }
  },

  /**
   * Update user progress
   */
  async update(userId, updates) {
    try {
      const docRef = db.collection(COLLECTIONS.USER_PROGRESS).doc(userId);

      await docRef.set(
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const doc = await docRef.get();
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error updating user progress:", error);
      throw error;
    }
  },

  /**
   * Increment game count
   */
  async incrementGamesPlayed(userId) {
    try {
      const progress = await this.getOrCreate(userId);

      return await this.update(userId, {
        totalGamesPlayed: progress.totalGamesPlayed + 1,
        lastPlayedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error incrementing games played:", error);
      throw error;
    }
  },

  /**
   * Update streak
   */
  async updateStreak(userId) {
    try {
      const progress = await this.getOrCreate(userId);
      const now = new Date();
      const lastPlayed = progress.lastPlayedAt
        ? new Date(progress.lastPlayedAt)
        : null;

      let newStreak = progress.streak || 0;
      let lastStreakDate = progress.lastStreakDate
        ? new Date(progress.lastStreakDate)
        : null;

      // Get start of today in UTC
      const todayStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );
      const lastStreakStart = lastStreakDate
        ? new Date(
            Date.UTC(
              lastStreakDate.getUTCFullYear(),
              lastStreakDate.getUTCMonth(),
              lastStreakDate.getUTCDate()
            )
          )
        : null;

      if (!lastStreakStart) {
        // First time playing
        newStreak = 1;
      } else {
        const daysDiff = Math.floor(
          (todayStart - lastStreakStart) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          // Same day, keep streak (don't increment)
          newStreak = progress.streak || 1;
        } else if (daysDiff === 1) {
          // Next day, increment streak
          newStreak = (progress.streak || 0) + 1;
        } else if (daysDiff > 1) {
          // Streak broken, reset to 1
          newStreak = 1;
        }
      }

      return await this.update(userId, {
        streak: newStreak,
        lastPlayedAt: now.toISOString(),
        lastStreakDate: todayStart.toISOString(),
      });
    } catch (error) {
      console.error("Error updating streak:", error);
      throw error;
    }
  },

  /**
   * Add achievement
   */
  async addAchievement(userId, achievement) {
    try {
      const progress = await this.getOrCreate(userId);

      if (!progress.achievements.includes(achievement)) {
        return await this.update(userId, {
          achievements: [...progress.achievements, achievement],
        });
      }

      return progress;
    } catch (error) {
      console.error("Error adding achievement:", error);
      throw error;
    }
  },
};
