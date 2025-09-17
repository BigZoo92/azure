import { createContext, useContext } from "react";

export type User = {
  id: string;
  name: string;
  email?: string;
  provider: "local" | "github";
};

type AuthState = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthCtx = createContext<AuthState | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
