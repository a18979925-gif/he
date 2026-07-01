/**
 * authStore.ts — Global auth state (localStorage-backed)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  username: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  teams: any[];
  setAuth: (token: string, user: AuthUser) => void;
  setTeams: (teams: any[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      teams: [],
      setAuth: (token, user) => set({ token, user }),
      setTeams: (teams) => set({ teams }),
      logout: () => set({ token: null, user: null, teams: [] }),
    }),
    { name: "codescope-auth" }
  )
);

// HTTP helper with auth header
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}
