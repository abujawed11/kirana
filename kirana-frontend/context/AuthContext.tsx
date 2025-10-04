import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";

type User = { id: number; name: string; email?: string; phone?: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  login: (token: string, user?: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync("kirana_token");
        const u = await SecureStore.getItemAsync("kirana_user");
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (t: string, u?: User) => {
    setToken(t);
    await SecureStore.setItemAsync("kirana_token", t);
    if (u) {
      setUser(u);
      await SecureStore.setItemAsync("kirana_user", JSON.stringify(u));
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync("kirana_token");
    await SecureStore.deleteItemAsync("kirana_user");
  };

  const value = useMemo(() => ({ user, token, loading, login, logout, setUser }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
