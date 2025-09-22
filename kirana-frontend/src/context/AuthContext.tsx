// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import type { AuthUser } from "@/types/auth";

const STORAGE_USER_KEY = "auth_user";
const STORAGE_TOKEN_KEY = "auth_token";
const STORAGE_REFRESH_TOKEN_KEY = "auth_refresh_token";
const STORAGE_TOKEN_EXPIRY_KEY = "auth_token_expiry";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, token: string, refreshToken?: string) => Promise<void>;
  clearSession: () => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  checkTokenExpiry: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint (we'll implement this)
      if (token) {
        try {
          await fetch(`${process.env.EXPO_PUBLIC_API_URL || "http://10.20.2.78:5000"}/auth/logout`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Error calling logout endpoint:", error);
        }
      }

      // Clear all stored data
      setUser(null);
      setToken(null);
      setRefreshToken(null);

      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_USER_KEY).catch(() => {}),
        SecureStore.deleteItemAsync(STORAGE_TOKEN_KEY).catch(() => {}),
        SecureStore.deleteItemAsync(STORAGE_REFRESH_TOKEN_KEY).catch(() => {}),
        SecureStore.deleteItemAsync(STORAGE_TOKEN_EXPIRY_KEY).catch(() => {}),
      ]);

      // Navigate to login
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [token, router]);

  // Auto-logout on token expiry check
  const checkTokenExpiry = useCallback(async (): Promise<boolean> => {
    try {
      const tokenExpiryStr = await SecureStore.getItemAsync(STORAGE_TOKEN_EXPIRY_KEY);
      if (!tokenExpiryStr) return false;

      const tokenExpiry = new Date(tokenExpiryStr);
      const now = new Date();

      if (now >= tokenExpiry) {
        // Token expired, auto logout
        await logout();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return false;
    }
  }, [logout]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [u, t, rt] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_USER_KEY),
          SecureStore.getItemAsync(STORAGE_TOKEN_KEY),
          SecureStore.getItemAsync(STORAGE_REFRESH_TOKEN_KEY),
        ]);

        if (u && t) {
          const parsedUser = JSON.parse(u) as AuthUser;
          setUser(parsedUser);
          setToken(t);
          setRefreshToken(rt);

          // Check if token is expired
          const isExpired = await checkTokenExpiry();
          if (isExpired) {
            return; // logout() was called, no need to continue
          }
        }
      } catch (error) {
        console.error("Error loading stored auth data:", error);
        // Clear corrupted data
        await logout();
      } finally {
        setLoading(false);
      }
    })();
  }, [checkTokenExpiry, logout]);

  const setSession = async (nextUser: AuthUser, nextToken: string, nextRefreshToken?: string) => {
    try {
      setUser(nextUser);
      setToken(nextToken);
      if (nextRefreshToken) {
        setRefreshToken(nextRefreshToken);
      }

      // Calculate token expiry (30 days for mobile apps)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await Promise.all([
        SecureStore.setItemAsync(STORAGE_USER_KEY, JSON.stringify(nextUser)),
        SecureStore.setItemAsync(STORAGE_TOKEN_KEY, nextToken),
        SecureStore.setItemAsync(STORAGE_TOKEN_EXPIRY_KEY, expiryDate.toISOString()),
        ...(nextRefreshToken ? [SecureStore.setItemAsync(STORAGE_REFRESH_TOKEN_KEY, nextRefreshToken)] : []),
      ]);
    } catch (error) {
      console.error("Error setting session:", error);
      throw error;
    }
  };

  const clearSession = async () => {
    await logout();
  };

  const refresh = async () => {
    try {
      const [u, t, rt] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_USER_KEY),
        SecureStore.getItemAsync(STORAGE_TOKEN_KEY),
        SecureStore.getItemAsync(STORAGE_REFRESH_TOKEN_KEY),
      ]);

      if (u && t) {
        const parsedUser = JSON.parse(u) as AuthUser;
        setUser(parsedUser);
        setToken(t);
        setRefreshToken(rt);

        // Check token expiry after refresh
        await checkTokenExpiry();
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      await logout();
    }
  };

  const isAuthenticated = Boolean(user && token);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      refreshToken,
      loading,
      isAuthenticated,
      setSession,
      clearSession,
      refresh,
      logout,
      checkTokenExpiry
    }),
    [user, token, refreshToken, loading, isAuthenticated, setSession, clearSession, refresh, logout, checkTokenExpiry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
