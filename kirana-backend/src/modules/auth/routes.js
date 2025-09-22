import { Router } from "express";
import { sellerSignup, verifySellerOtp, resendSellerOtp, sellerLogin, logout, refreshToken } from "./controller.js";
import { authenticateToken } from "../../middleware/auth.js";
import { authLimiter, loginLimiter, otpLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// Public routes (no auth required)
router.post("/seller/signup", authLimiter, sellerSignup);
router.post("/seller/verify-otp", authLimiter, verifySellerOtp);
router.post("/seller/resend-otp", otpLimiter, resendSellerOtp);
router.post("/seller/login", loginLimiter, sellerLogin);
router.post("/refresh", authLimiter, refreshToken);

// Protected routes (auth required)
router.post("/logout", authenticateToken, logout);

export default router;
