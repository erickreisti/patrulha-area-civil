// src/lib/stores/useAuthStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Profile } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";

interface AuthState {
  // Estado principal
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Admin
  isAdmin: boolean;
  hasAdminSession: boolean;

  // Ações
  initialize: () => Promise<void>;
  loginWithServerAction: (matricula: string) => Promise<{
    success: boolean;
    data?: { user: User; profile: Profile };
    error?: string;
  }>;
  logout: () => Promise<{ success: boolean; error?: string }>;

  // Admin específico
  verifyAdminAccess: (adminPassword: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  checkAdminSession: () => boolean;
  clearAdminSession: () => void;

  // Utilitários
  setProfile: (profile: Profile) => void;
  clearError: () => void;
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

          // 1. Verificar sessão Supabase
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            // 2. Verificar sessão admin via API
            const authModule = await import("@/app/actions/auth/auth");
            const sessionCheck = await authModule.verifyAdminSession();

            set({
              user: session.user,
              profile: profile || null,
              isAuthenticated: true,
              isAdmin: profile?.role === "admin",
              hasAdminSession: sessionCheck.success,
              isLoading: false,
            });
          } else {
            // Sem sessão Supabase
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isAdmin: false,
              hasAdminSession: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("❌ [AuthStore] Erro na inicialização:", error);
          set({
            isLoading: false,
            isAuthenticated: false,
            hasAdminSession: false,
          });
        }
      },

      loginWithServerAction: async (matricula: string) => {
        try {
          set({ isLoading: true });

          const formData = new FormData();
          formData.append("matricula", matricula);

          const authModule = await import("@/app/actions/auth/auth");
          const result = await authModule.login(formData);

          if (result.success && "data" in result && result.data) {
            const profileData = result.data.user;

            // Verificar sessão admin após login
            const sessionCheck = await authModule.verifyAdminSession();

            set({
              user: result.data.session.user,
              profile: profileData,
              isAuthenticated: true,
              isAdmin: profileData.role === "admin",
              hasAdminSession: sessionCheck.success,
              isLoading: false,
            });

            return {
              success: true,
              data: {
                user: result.data.session.user,
                profile: profileData,
              },
            };
          } else {
            set({ isLoading: false });

            const errorMessage =
              "error" in result ? result.error : "Erro no login";

            return {
              success: false,
              error: errorMessage,
            };
          }
        } catch (error) {
          console.error("❌ [AuthStore] Erro no login:", error);
          set({ isLoading: false });
          return {
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          };
        }
      },

      logout: async () => {
        try {
          // Limpar cookies admin primeiro
          get().clearAdminSession();

          const authModule = await import("@/app/actions/auth/auth");
          const result = await authModule.logout();

          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isAdmin: false,
            hasAdminSession: false,
          });

          return result.success ? { success: true } : result;
        } catch (error) {
          console.error("❌ [AuthStore] Erro no logout:", error);

          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isAdmin: false,
            hasAdminSession: false,
          });

          return {
            success: false,
            error: "Erro ao fazer logout",
          };
        }
      },

      verifyAdminAccess: async (adminPassword: string) => {
        try {
          const { user, profile } = get();

          if (!user || !profile) {
            return {
              success: false,
              error: "Usuário não autenticado",
            };
          }

          if (profile.role !== "admin") {
            return {
              success: false,
              error: "Usuário não possui permissões de administrador",
            };
          }

          const authModule = await import("@/app/actions/auth/auth");
          const result = await authModule.authenticateAdminSession(
            user.id,
            user.email || "",
            adminPassword
          );

          if (result.success && "message" in result) {
            // Atualizar estado com nova sessão
            set({
              hasAdminSession: true,
            });

            // Atualizar último auth no perfil
            if (profile) {
              get().setProfile({
                ...profile,
                admin_last_auth: new Date().toISOString(),
              });
            }

            return {
              success: true,
              message:
                result.message || "Autenticação administrativa bem-sucedida!",
            };
          } else {
            const errorMessage =
              "error" in result
                ? result.error
                : "Erro na autenticação administrativa";
            return {
              success: false,
              error: errorMessage,
            };
          }
        } catch (error) {
          console.error("❌ [AuthStore] Erro em verifyAdminAccess:", error);
          return {
            success: false,
            error: "Erro na autenticação administrativa",
          };
        }
      },

      checkAdminSession: () => {
        // Esta função agora é apenas para UI/estado
        const state = get();
        return state.hasAdminSession;
      },

      clearAdminSession: () => {
        try {
          if (typeof document === "undefined") return;

          // Limpar cookies com path explícito
          document.cookie =
            "is_admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          // Atualizar estado
          set({ hasAdminSession: false });
        } catch (error) {
          console.error("❌ [AuthStore] Erro ao limpar cookies:", error);
        }
      },

      setProfile: (newProfile) => {
        set((state) => ({
          ...state,
          profile: newProfile,
          isAdmin: newProfile.role === "admin",
        }));
      },

      clearError: () => {
        // Limpar qualquer erro do estado se necessário
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        hasAdminSession: state.hasAdminSession,
      }),
    }
  )
);
