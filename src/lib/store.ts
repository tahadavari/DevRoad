"use client";

import { create } from "zustand";
import type { UserSession } from "@/types";

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  setUser: (user: UserSession | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    set({ user: null });
    fetch("/api/auth/logout", { method: "POST" });
  },
}));
