import express from "express";
import {
register,
login,
logout
} from "../controllers/authController.js";
import { upload } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.js";

const authRoutes = express.Router();

authRoutes.post(
  "/register",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "addar_front", maxCount: 1 },
    { name: "addar_back", maxCount: 1 },
  ]),
  register
);
authRoutes.post("/login", login);
authRoutes.post("/logout", verifyToken, logout);

export default authRoutes;
