import express from "express";
import {
sendOtp,
verifyOtp,
resendOtp
} from "../controllers/otpController.js";

const otpRouter = express.Router();

otpRouter.post("/send-otp", sendOtp);
otpRouter.post("/verify-otp", verifyOtp);
otpRouter.post("/resend-otp", resendOtp);

export default otpRouter;
