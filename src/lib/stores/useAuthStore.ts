"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { checkAdminSession } from "@/app/actions/auth/auth";

interface AuthResponse {
  success: boolean;
  error?: string;
  data?: { session: Session; user: Profile };
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasAdminSession: boolean;

  initialize: () => Promise<void>;
  loginWithServerAction: (matricula: string) => Promise<AuthResponse>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  verifyAdminAccess: (
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  checkAdminSession: () => boolean;
  clearAdminSession: () => void;
  setProfile: (profile: Profile) => void;
}

const supabase = createClient();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      hasAdminSession: false,

      initialize: async () => {
        try {
          set({ isLoading: true });
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            const adminCheck = await checkAdminSession();

            set({
              user: session.user,
              profile: profile || null,
              isAuthenticated: true,
              isAdmin: profile?.role === "admin",
              hasAdminSession: adminCheck.hasSession,
              isLoading: false,
            });
          } else {
            const adminCheck = await checkAdminSession();
            if (adminCheck.success && adminCheck.hasSession) {
              set({ hasAdminSession: true, isLoading: false });
            } else {
              set({
                user: null,
                profile: null,
                isAuthenticated: false,
                isAdmin: false,
                hasAdminSession: false,
                isLoading: false,
              });
            }
          }
        } catch {
          set({ isLoading: false });
        }
      },

      loginWithServerAction: async (matricula) => {
        set({ isLoading: true });
        const authModule = await import("@/app/actions/auth/auth");
        const formData = new FormData();
        formData.append("matricula", matricula);

        const res = await authModule.login(formData);

        if (res.success && res.data) {
          await supabase.auth.setSession({
            access_token: res.data.session.access_token,
            refresh_token: res.data.session.refresh_token,
          });
          await get().initialize();
        } else {
          set({ isLoading: false });
        }

        return {
          success: res.success,
          error: res.error,
          data: res.data
            ? { session: res.data.session, user: res.data.user }
            : undefined,
        };
      },

      logout: async () => {
        const authModule = await import("@/app/actions/auth/auth");
        await authModule.logout();
        await supabase.auth.signOut();
        get().clearAdminSession(); // Também aciona o cooldown do admin se necessário

        // Cooldown do login principal
        if (typeof window !== "undefined") {
          const cooldownTime = Date.now() + 30000;
          localStorage.setItem("login_cooldown", cooldownTime.toString());
        }

        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isAdmin: false,
          hasAdminSession: false,
          isLoading: false,
        });
        return { success: true };
      },

      verifyAdminAccess: async (password) => {
        const { user } = get();
        if (!user?.email) return { success: false, error: "Sem usuário" };

        const authModule = await import("@/app/actions/auth/auth");
        const res = await authModule.authenticateAdminSession(
          user.id,
          user.email,
          password,
        );

        if (res.success) set({ hasAdminSession: true });
        return res;
      },

      checkAdminSession: () => get().hasAdminSession,

      clearAdminSession: () => {
        if (typeof window !== "undefined") {
          // Limpa cookies de sessão
          document.cookie =
            "is_admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          // Define cooldown de 30s específico para ADMIN
          const cooldownTime = Date.now() + 30000;
          localStorage.setItem("admin_cooldown", cooldownTime.toString());
        }
        set({ hasAdminSession: false });
      },

      setProfile: (p) => set({ profile: p, isAdmin: p.role === "admin" }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);
