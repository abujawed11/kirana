// src/features/auth/api.ts
import type {
  SellerSignupPayload,
  SellerLoginPayload,
  AuthUser,
  ApiResponse,
  VerifyOtpPayload,
  ResendOtpPayload,
} from "@/types/auth";
import { publicApi, api } from "@/api/client";

export function signupSeller(payload: SellerSignupPayload) {
  return publicApi.post<ApiResponse<{ user: AuthUser }>>("/auth/seller/signup", payload);
}

export function loginSeller(payload: SellerLoginPayload) {
  return publicApi.post<ApiResponse<{ user: AuthUser; token: string; refreshToken?: string }>>("/auth/seller/login", payload);
}

// NEW: verify OTP
export function verifySellerOtp(payload: VerifyOtpPayload) {
  return publicApi.post<ApiResponse<{ user: AuthUser }>>("/auth/seller/verify-otp", payload);
}

// NEW: resend OTP
export function resendSellerOtp(payload: ResendOtpPayload) {
  return publicApi.post<ApiResponse<{ sentTo: string; channel: string }>>("/auth/seller/resend-otp", payload);
}

// NEW: logout
export function logoutSeller() {
  return api.post<ApiResponse<{}>>("/auth/logout");
}

// NEW: refresh token
export function refreshToken(refreshToken: string) {
  return publicApi.post<ApiResponse<{ token: string; refreshToken?: string }>>("/auth/refresh", { refreshToken });
}
