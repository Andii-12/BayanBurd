"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  clientId: string | null;
  avatar?: string;
};

export type AuthClient = {
  _id: string;
  companyName: string;
  registrationNumber: string;
  address?: string;
  contactName: string;
  email: string;
  phone: string;
};

type Ctx = {
  user: AuthUser | null;
  client: AuthClient | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [client, setClient] = useState<AuthClient | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await api<{ user: AuthUser; client: AuthClient | null }>("/api/auth/me");
      setUser(data.user);
      setClient(data.client);
    } catch {
      setUser(null);
      setClient(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      client,
      loading,
      async login(email, password) {
        const data = await api<{ user: AuthUser; client: AuthClient | null; accessToken: string }>(
          "/api/auth/login",
          { method: "POST", body: JSON.stringify({ email, password }) }
        );
        localStorage.setItem("accessToken", data.accessToken);
        setUser(data.user);
        setClient(data.client);
        return data.user;
      },
      async logout() {
        await api("/api/auth/logout", { method: "POST" }).catch(() => null);
        localStorage.removeItem("accessToken");
        setUser(null);
        setClient(null);
      },
      refresh,
    }),
    [user, client, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth");
  return ctx;
}

export function isStaff(role?: string) {
  return ["ADMIN", "SUPER_ADMIN", "ENGINEER", "SALES", "SUPPORT"].includes(role || "");
}
