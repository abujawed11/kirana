// src/types/auth.ts
export type SellerRole = "seller";

export interface SellerSignupPayload {
  name: string;
  email: string;
  phone: string; // E.164 or 10-digit (you validate)
  password: string;
}

export interface SellerLoginPayload {
  phoneOrEmail: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: SellerRole;
  token: string; // JWT
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorShape {
  success: false;
  error: string;
  code?: string | number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorShape;
