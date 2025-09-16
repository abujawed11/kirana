// src/features/auth/api.ts
import type {
  SellerSignupPayload,
  SellerLoginPayload,
  AuthUser,
  ApiResponse,
  VerifyOtpPayload,
  ResendOtpPayload,
} from "@/types/auth";
import { api } from "@/api/client";

export function signupSeller(payload: SellerSignupPayload) {
  return api.post<ApiResponse<{ user: AuthUser }>>("/auth/seller/signup", payload);
}

export function loginSeller(payload: SellerLoginPayload) {
  return api.post<ApiResponse<{ user: AuthUser }>>("/auth/seller/login", payload);
}

// NEW: verify OTP
export function verifySellerOtp(payload: VerifyOtpPayload) {
  return api.post<ApiResponse<{ user: AuthUser }>>("/auth/seller/verify-otp", payload);
}

// NEW: resend OTP
export function resendSellerOtp(payload: ResendOtpPayload) {
  return api.post<ApiResponse<{ sentTo: string; channel: string }>>("/auth/seller/resend-otp", payload);
}
