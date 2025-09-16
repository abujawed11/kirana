// src/features/auth/api.ts
import type {
  SellerSignupPayload,
  SellerLoginPayload,
  AuthUser,
  ApiResponse,
} from "@/types/auth";
import { api } from "@/api/client";

export function signupSeller(payload: SellerSignupPayload) {
  return api.post<ApiResponse<{ user: AuthUser }>>("/auth/seller/signup", payload);
}

export function loginSeller(payload: SellerLoginPayload) {
  return api.post<ApiResponse<{ user: AuthUser }>>("/auth/seller/login", payload);
}
