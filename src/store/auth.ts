import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_admin?: boolean;
  is_superuser?: boolean;
  created_at: string;
  is_platform_blocked?: boolean;
  platform_message?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  isDevPreview: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; full_name?: string }) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  enterDevPreview: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      isDevPreview: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
        });
        await get().fetchMe();
      },

      loginWithGoogle: async (credential) => {
        const { data } = await api.post("/auth/google", { credential });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
        });
        await get().fetchMe();
      },

      register: async (formData) => {
        const { data } = await api.post("/auth/register", formData);
        set({ user: data });
      },

      resendVerification: async (email) => {
        await api.post("/auth/resend-verification", { email });
      },

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      enterDevPreview: () => {
        if (process.env.NODE_ENV !== "development") return;
        set({
          user: {
            id: "local-preview",
            email: "preview@mathiis.local",
            username: "esther",
            full_name: "Esther",
            avatar_url: null,
            is_verified: true,
            is_admin: true,
            is_superuser: false,
            created_at: new Date().toISOString(),
          },
          accessToken: null,
          refreshToken: null,
          isAuthenticated: true,
          isDevPreview: true,
        });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isDevPreview ? false : state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
