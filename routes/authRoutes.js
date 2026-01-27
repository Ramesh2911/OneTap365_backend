import express from "express";
import {
register,
serviceProviderRegister,
login,
logout,
updateProviderStatus
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
authRoutes.post(
  "/service-provider-register",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "addar_front", maxCount: 1 },
    { name: "addar_back", maxCount: 1 },
    { name: "pan_img", maxCount: 1 },
    { name: "resume_doc", maxCount: 1 },
  ]),
  serviceProviderRegister
);
authRoutes.post("/login", login);
authRoutes.post("/logout", verifyToken, logout);
authRoutes.put("/status-update", verifyToken, updateProviderStatus);

export default authRoutes;
