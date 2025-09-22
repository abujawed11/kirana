import { Router } from "express";
import { sellerSignup, verifySellerOtp, resendSellerOtp, sellerLogin  } from "./controller.js";

const router = Router();

// 1) start signup -> generate & send OTP (don't create user yet)
router.post("/seller/signup", sellerSignup);

// 2) verify OTP -> create user, return success (no auto-login)
router.post("/seller/verify-otp", verifySellerOtp);

// 3) resend OTP
router.post("/seller/resend-otp", resendSellerOtp);


// ✅ NEW
router.post("/seller/login", sellerLogin);

export default router;
