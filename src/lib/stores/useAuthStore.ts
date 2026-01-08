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
  checkAdminSession: () => boolean; // 🔥 MUDANÇA: Agora é síncrono
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

            // 2. Verificar cookies admin (agora síncrono)
            const hasAdminCookies = get().checkAdminSession();

            set({
              user: session.user,
              profile: profile || null,
              isAuthenticated: true,
              isAdmin: profile?.role === "admin",
              hasAdminSession: hasAdminCookies,
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

            // Verificar cookies admin após login
            const hasAdminCookies = get().checkAdminSession();

            set({
              user: result.data.session.user,
              profile: profileData,
              isAuthenticated: true,
              isAdmin: profileData.role === "admin",
              hasAdminSession: hasAdminCookies,
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
            const hasAdminCookies = get().checkAdminSession();

            set({
              hasAdminSession: hasAdminCookies,
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

      // 🔥 MUDANÇA CRÍTICA: Agora é função síncrona
      checkAdminSession: () => {
        try {
          if (typeof document === "undefined") return false;

          const cookies = document.cookie.split("; ");

          console.log("🍪 [AuthStore] Verificando cookies...");

          // Verificar ambos os cookies
          const adminCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("is_admin=")
          );
          const sessionCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("admin_session=")
          );

          console.log("🍪 [AuthStore] Cookies encontrados:", {
            adminCookie: adminCookie || "não encontrado",
            sessionCookie: sessionCookie || "não encontrado",
          });

          if (!adminCookie || !sessionCookie) {
            console.log("❌ [AuthStore] Cookies admin não encontrados");
            return false;
          }

          // Verificar valor
          const adminValue = adminCookie.split("=")[1];
          if (adminValue !== "true") {
            console.log("❌ [AuthStore] Cookie is_admin não é true");
            return false;
          }

          // Verificar sessão
          try {
            const sessionValue = decodeURIComponent(
              sessionCookie.split("=")[1]
            );
            const sessionData = JSON.parse(sessionValue);

            console.log("📅 [AuthStore] Dados da sessão:", {
              expiresAt: sessionData.expiresAt,
              now: new Date().toISOString(),
            });

            if (sessionData.expiresAt) {
              const expiresAt = new Date(sessionData.expiresAt);
              if (expiresAt < new Date()) {
                console.log("❌ [AuthStore] Sessão admin expirada");
                get().clearAdminSession();
                return false;
              }
            }
          } catch (error) {
            console.log("❌ [AuthStore] Cookie admin_session inválido:", error);
            return false;
          }

          console.log("✅ [AuthStore] Sessão admin válida");
          return true;
        } catch (error) {
          console.error("❌ [AuthStore] Erro ao verificar cookies:", error);
          return false;
        }
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
