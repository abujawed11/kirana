// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "@/types/auth";

const STORAGE_USER_KEY = "@auth:user";
const STORAGE_TOKEN_KEY = "@auth:token";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setSession: (user: AuthUser, token?: string | null) => Promise<void>;
  clearSession: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [u, t] = await Promise.all([
          AsyncStorage.getItem(STORAGE_USER_KEY),
          AsyncStorage.getItem(STORAGE_TOKEN_KEY),
        ]);
        const parsed = u ? (JSON.parse(u) as AuthUser) : null;
        setUser(parsed);
        setToken(t);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setSession = async (nextUser: AuthUser, nextToken?: string | null) => {
    setUser(nextUser);
    if (typeof nextToken === "string") setToken(nextToken);
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
    if (typeof nextToken === "string") {
      await AsyncStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
    }
  };

  const clearSession = async () => {
    setUser(null);
    setToken(null);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_USER_KEY),
      AsyncStorage.removeItem(STORAGE_TOKEN_KEY),
    ]);
  };

  const refresh = async () => {
    const [u, t] = await Promise.all([
      AsyncStorage.getItem(STORAGE_USER_KEY),
      AsyncStorage.getItem(STORAGE_TOKEN_KEY),
    ]);
    const parsed = u ? (JSON.parse(u) as AuthUser) : null;
    setUser(parsed);
    setToken(t);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, setSession, clearSession, refresh }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
