import { UserStore } from "../data/firestoreUserStore.js";
import { verifyToken } from "../utils/jwt.js";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  const [, token] = authHeader.split(" ");
  if (!token) {
    return res.status(401).json({ error: "Format token tidak valid" });
  }

  try {
    const decoded = verifyToken(token);

    // Verify user still exists in database
    const user = await UserStore.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Pengguna tidak ditemukan" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Token tidak valid atau kedaluwarsa" });
  }
};
