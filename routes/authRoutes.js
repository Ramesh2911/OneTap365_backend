import express from "express";
import 
{ 
  register,
  login
 } from "../controllers/authController.js";
import { upload } from "../middleware/upload.js";

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

export default authRoutes;
