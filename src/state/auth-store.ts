"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthAccount = {
  email: string;
  name?: string;
  passwordHash: string;
};

type AuthUser = {
  email: string;
  name?: string;
};

type AuthState = {
  user: AuthUser | null;
  accounts: AuthAccount[];
};

type AuthResult = {
  ok: boolean;
  error?: string;
};

type AuthActions = {
  signup: (account: AuthAccount) => AuthResult;
  loginWithPassword: (email: string, passwordHash: string) => AuthResult;
  logout: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: [],
      signup: (account) => {
        const accounts = get().accounts ?? [];
        const existing = accounts.find(
          (a) => a.email.toLowerCase() === account.email.toLowerCase(),
        );
        if (existing) {
          return { ok: false, error: "An account already exists for this email" };
        }
        const nextAccounts = [...accounts, account];
        set({
          accounts: nextAccounts,
          user: { email: account.email, name: account.name },
        });
        return { ok: true };
      },
      loginWithPassword: (email, passwordHash) => {
        const accounts = get().accounts ?? [];
        const account = accounts.find(
          (a) => a.email.toLowerCase() === email.toLowerCase(),
        );
        if (!account || account.passwordHash !== passwordHash) {
          return { ok: false, error: "Invalid email or password" };
        }
        set({ user: { email: account.email, name: account.name } });
        return { ok: true };
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "finvx-auth",
    },
  ),
);
