import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByPhone,
  findUserByEmail,
  insertOtpCode,
  findActiveOtpForSignup,
  markOtpUsed,
  incrementOtpAttempts,
  resendableOtpForSignup,
  insertUserFromPayload, // creates the user row after OTP success
  findUserByEmailOrPhone,
  findUserById, // ✅ NEW
} from "./repository.js";
import { sendOtpSms, sendOtpEmail } from "./sms_email.js";

const OTP_TTL_SEC = 120; // 2 minutes
const MAX_ATTEMPTS = 5;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me";


export async function loginSellerService({ identifier, password }) {
  // identifier can be email or phone
  const user = await findUserByEmailOrPhone(identifier);
  if (!user) return { success: false, status: 404, error: "Account not found" };
  if (user.role !== "seller") return { success: false, status: 403, error: "Not a seller account" };
  if (!user.is_active) return { success: false, status: 403, error: "Account is inactive" };

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return { success: false, status: 401, error: "Invalid credentials" };

  // Generate access token (30 days for mobile)
  const accessToken = jwt.sign(
    { sub: user.user_id, role: user.role, type: 'access' },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

  // Generate refresh token (90 days)
  const refreshToken = jwt.sign(
    { sub: user.user_id, role: user.role, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: "90d" }
  );

  return {
    success: true,
    token: accessToken,
    refreshToken: refreshToken,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
}

export async function refreshTokenService({ refreshToken }) {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      return { success: false, status: 401, error: "Invalid token type" };
    }

    // Check if user still exists and is active
    const user = await findUserById(decoded.sub);
    if (!user || !user.is_active) {
      return { success: false, status: 401, error: "User not found or inactive" };
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { sub: user.user_id, role: user.role, type: 'access' },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Optionally generate new refresh token (rotate refresh tokens)
    const newRefreshToken = jwt.sign(
      { sub: user.user_id, role: user.role, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: "90d" }
    );

    return {
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { success: false, status: 401, error: "Refresh token expired" };
    }
    return { success: false, status: 401, error: "Invalid refresh token" };
  }
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

export async function startSellerSignupOtp({ name, email, phone, password }) {
  // Duplicate checks up-front
  if (await findUserByPhone(phone)) {
    return { success: false, status: 409, error: "Phone already registered" };
  }
  if (email && (await findUserByEmail(email))) {
    return { success: false, status: 409, error: "Email already registered" };
  }

  const password_hash = await bcrypt.hash(password, 10);
  const otp = generateOtp();

  const payload = {
    name,
    email,
    phone,
    password_hash,
    role: "seller",
  };

  // Prefer SMS for India; if you want email OTP too, choose channel conditionally
  const channel = "sms";
  const sentTo = phone;

  await insertOtpCode({
    phone,
    email,
    code: otp,
    purpose: "signup",
    channel,
    payload_json: payload,
    ttlSec: OTP_TTL_SEC,
    maxAttempts: MAX_ATTEMPTS,
  });

  // Send OTP via your provider (stubbed)
  if (channel === "sms") {
    await sendOtpSms(phone, otp);
  } else {
    await sendOtpEmail(email, otp);
  }

  return { success: true, channel, sentTo, expiresInSec: OTP_TTL_SEC };
}

export async function completeSellerSignupWithOtp({ email, phone, code }) {
  const rec = await findActiveOtpForSignup({ email, phone });
  if (!rec) {
    return { success: false, status: 400, error: "No active OTP. Please resend." };
  }
  if (rec.attempts >= rec.max_attempts) {
    return { success: false, status: 429, error: "Too many attempts. Please resend OTP." };
  }
  if (new Date(rec.expires_at) < new Date()) {
    return { success: false, status: 400, error: "OTP expired. Please resend." };
  }

  if (rec.code !== code) {
    await incrementOtpAttempts(rec.id);
    return { success: false, status: 400, error: "Incorrect OTP" };
  }

  // Correct OTP → create user from payload
  const payload = rec.payload_json; // stored when OTP was created
  if (!payload || !payload.phone || !payload.password_hash || !payload.name) {
    return { success: false, status: 500, error: "Invalid OTP payload" };
  }

  // Ensure no race duplicates (edge case if email/phone registered after OTP issued)
  if (await findUserByPhone(payload.phone)) {
    await markOtpUsed(rec.id);
    return { success: true, user_id: (await findUserByPhone(payload.phone)).user_id };
  }
  if (payload.email && (await findUserByEmail(payload.email))) {
    await markOtpUsed(rec.id);
    return { success: false, status: 409, error: "Email already registered" };
  }

  const user_id = await insertUserFromPayload(payload);
  await markOtpUsed(rec.id);

  return { success: true, user_id };
}

export async function resendSellerSignupOtp({ email, phone }) {
  const rec = await resendableOtpForSignup({ email, phone });
  const otp = generateOtp();

  const channel = rec?.email ? "email" : "sms";
  const sentTo = rec?.email ?? phone;

  await insertOtpCode({
    phone,
    email,
    code: otp,
    purpose: "signup",
    channel,
    payload_json: rec?.payload_json ?? null, // carry forward if available
    ttlSec: OTP_TTL_SEC,
    maxAttempts: MAX_ATTEMPTS,
  });

  if (channel === "sms") {
    await sendOtpSms(phone, otp);
  } else if (email) {
    await sendOtpEmail(email, otp);
  }

  return { success: true, channel, sentTo, expiresInSec: OTP_TTL_SEC };
}
