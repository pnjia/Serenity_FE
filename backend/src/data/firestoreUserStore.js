import { COLLECTIONS, db } from "../config/firebase.js";

export const FirestoreUserStore = {
  /**
   * Get all users
   */
  async getAll() {
    try {
      const snapshot = await db.collection(COLLECTIONS.USERS).get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.USERS)
        .where("email", "==", email)
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
      console.error("Error finding user by email:", error);
      throw error;
    }
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    try {
      const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  },

  /**
   * Create new user
   */
  async create(user) {
    try {
      // If user has an id, use it as document ID
      if (user.id) {
        const docRef = db.collection(COLLECTIONS.USERS).doc(user.id);
        await docRef.set({
          ...user,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return {
          id: user.id,
          ...user,
        };
      }

      // Otherwise, let Firestore generate an ID
      const docRef = await db.collection(COLLECTIONS.USERS).add({
        ...user,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        id: docRef.id,
        ...user,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Update existing user
   */
  async update(user) {
    try {
      if (!user.id) {
        throw new Error("User ID is required for update");
      }

      const docRef = db.collection(COLLECTIONS.USERS).doc(user.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error("Pengguna tidak ditemukan untuk pembaruan");
      }

      await docRef.update({
        ...user,
        updatedAt: new Date().toISOString(),
      });

      return {
        id: user.id,
        ...user,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  /**
   * Delete user
   */
  async delete(id) {
    try {
      await db.collection(COLLECTIONS.USERS).doc(id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};

// You can switch between FileStore and FirestoreUserStore
// by changing the export
export const UserStore = FirestoreUserStore;
