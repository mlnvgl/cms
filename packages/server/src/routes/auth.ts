import { Router } from "express";
import { login, me } from "../controllers/auth.js";

export const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.get("/me", me);
