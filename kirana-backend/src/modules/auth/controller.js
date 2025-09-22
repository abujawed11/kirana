import {
  startSellerSignupOtp,
  completeSellerSignupWithOtp,
  resendSellerSignupOtp,
  loginSellerService, // ✅ NEW
} from "./service.js";



export async function sellerLogin(req, res) {
  try {
    const { phoneOrEmail, password } = req.body ?? {};
    if (!phoneOrEmail || !password) {
      return res.status(400).json({ success: false, error: "Phone/email and password are required" });
    }

    const result = await loginSellerService({ identifier: String(phoneOrEmail).trim(), password: String(password) });
    if (!result.success) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }

    // return token + minimal user profile
    return res.status(200).json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (e) {
    console.error("sellerLogin error:", e);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export async function sellerSignup(req, res) {
  try {
    const { name, email, phone, password } = req.body ?? {};

    // Frontend expects email & phone to be required (align with your UI rules)
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ success: false, error: "Enter full name" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({ success: false, error: "Enter a valid email" });
    }
    const digits = String(phone || "").replace(/\D/g, "");
    // India: 10 digits, starts 6-9. Adjust if needed.
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return res.status(400).json({ success: false, error: "Enter a valid mobile number" });
    }
    if (!password || String(password).length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(String(password))) {
      return res.status(400).json({
        success: false,
        error: "Password must be 8+ chars with uppercase, lowercase, and a number",
      });
    }

    const result = await startSellerSignupOtp({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: digits,
      password: String(password),
    });

    if (!result.success) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent. Please verify to complete signup.",
      data: { channel: result.channel, sentTo: result.sentTo, expiresInSec: result.expiresInSec },
    });
  } catch (e) {
    console.error("sellerSignup error:", e);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export async function verifySellerOtp(req, res) {
  try {
    const { email, phone, code } = req.body ?? {};
    if (!code || String(code).replace(/\D/g, "").length !== 6) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }
    if (!email && !phone) {
      return res.status(400).json({ success: false, error: "Email or phone required" });
    }

    const result = await completeSellerSignupWithOtp({ email, phone, code: String(code) });
    if (!result.success) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }

    // ✅ Do NOT log in; frontend should navigate to Login
    return res.status(200).json({
      success: true,
      message: "Verification successful. You can now log in.",
      data: { user_id: result.user_id },
    });
  } catch (e) {
    console.error("verifySellerOtp error:", e);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export async function resendSellerOtp(req, res) {
  try {
    const { email, phone } = req.body ?? {};
    if (!email && !phone) {
      return res.status(400).json({ success: false, error: "Email or phone required" });
    }
    const result = await resendSellerSignupOtp({ email, phone });
    if (!result.success) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }
    return res.status(200).json({
      success: true,
      message: "OTP resent.",
      data: { channel: result.channel, sentTo: result.sentTo, expiresInSec: result.expiresInSec },
    });
  } catch (e) {
    console.error("resendSellerOtp error:", e);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
