import { Router } from "express";
import {
  googleLogin,
  googleRegister,
  login,
  me,
  register,
  validators,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post("/register", validateRequest(validators.registerSchema), register);
router.post("/login", validateRequest(validators.loginSchema), login);
router.post(
  "/google/register",
  validateRequest(validators.googleSchema),
  googleRegister
);
router.post(
  "/google/login",
  validateRequest(validators.googleSchema),
  googleLogin
);
router.get("/me", requireAuth, me);

export default router;
