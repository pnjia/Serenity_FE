import { z } from "zod";
import {
  getProfileById,
  loginGoogleUser,
  loginLocalUser,
  registerGoogleUser,
  registerLocalUser,
} from "../services/authService.js";

const passwordSchema = z
  .string({ required_error: "Password wajib diisi" })
  .min(6, "Password minimal 6 karakter");

const emailSchema = z
  .string({ required_error: "Email wajib diisi" })
  .email("Format email tidak valid");

const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Nama wajib diisi" })
      .min(3, "Nama minimal 3 karakter"),
    email: emailSchema,
    password: passwordSchema,
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

const googleSchema = z.object({
  body: z.object({
    idToken: z
      .string({ required_error: "Token Google wajib diisi" })
      .min(10, "Token Google tidak valid"),
  }),
});

export const validators = {
  registerSchema,
  loginSchema,
  googleSchema,
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.validated.body;
    const result = await registerLocalUser({ name, email, password });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validated.body;
    const result = await loginLocalUser({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const googleRegister = async (req, res, next) => {
  try {
    const { idToken } = req.validated.body;
    const result = await registerGoogleUser({ idToken });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.validated.body;
    const result = await loginGoogleUser({ idToken });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const profile = await getProfileById(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};
