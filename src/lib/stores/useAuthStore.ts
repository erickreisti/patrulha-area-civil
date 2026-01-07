"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Profile } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasAdminSession: boolean;

  initialize: () => Promise<void>;
  loginWithServerAction: (matricula: string) => Promise<{
    success: boolean;
    data?: { user: User; profile: Profile };
    error?: string;
  }>;
  setAuthData: (data: { user: User | null; profile: Profile | null }) => void;
  setProfile: (profile: Profile) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<{ success: boolean; error?: string }>;

  verifyAdminAccess: (adminPassword: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  checkAdminSession: () => Promise<boolean>;
  clearAdminSession: () => void;
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
          console.log("🔍 [AuthStore] Inicializando store...");

          // ✅ 1. VERIFICAR COOKIES ADMIN PRIMEIRO (ANTES DE QUALQUER LIMPEZA)
          const hasActiveAdminSession = await get().checkAdminSession();
          console.log("🔍 [AuthStore] Cookies admin:", hasActiveAdminSession);

          // ✅ 2. VERIFICAR SESSÃO SUPABASE
          const {
            data: { session },
          } = await supabase.auth.getSession();

          console.log("🔍 [AuthStore] Sessão Supabase:", {
            hasSession: !!session?.user,
            userId: session?.user?.id,
          });

          // ✅ CASO A: TEM SESSÃO SUPABASE
          if (session?.user) {
            console.log("✅ [AuthStore] Sessão Supabase encontrada");

            // ✅ 3. BUSCAR PERFIL NO BANCO
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              console.error(
                "❌ [AuthStore] Erro ao buscar perfil:",
                profileError
              );

              // Se erro mas tem cookies admin, manter estado atual
              if (hasActiveAdminSession) {
                console.log(
                  "⚠️ [AuthStore] Erro no perfil, mas tem cookies admin - mantendo estado"
                );
                const currentState = get();
                set({
                  user: currentState.user || session.user,
                  isAuthenticated: true,
                  isLoading: false,
                  hasAdminSession: hasActiveAdminSession,
                });
                return;
              }

              // Sem cookies admin, limpar tudo
              set({
                user: session.user,
                profile: null,
                isAuthenticated: true,
                isAdmin: false,
                hasAdminSession: false,
                isLoading: false,
              });
              return;
            }

            if (!profile) {
              console.error("❌ [AuthStore] Perfil não encontrado");

              if (hasActiveAdminSession) {
                console.log(
                  "⚠️ [AuthStore] Perfil não encontrado, mas tem cookies admin"
                );
                const currentState = get();
                set({
                  user: currentState.user || session.user,
                  isAuthenticated: true,
                  isLoading: false,
                  hasAdminSession: hasActiveAdminSession,
                });
                return;
              }

              set({
                user: session.user,
                profile: null,
                isAuthenticated: true,
                isAdmin: false,
                hasAdminSession: false,
                isLoading: false,
              });
              return;
            }

            console.log("✅ [AuthStore] Perfil carregado:", {
              id: profile.id,
              email: profile.email,
              role: profile.role,
              status: profile.status,
            });

            // ✅ 4. ATUALIZAR ESTADO COMPLETO
            set({
              user: session.user,
              profile,
              isAuthenticated: true,
              isAdmin: profile.role === "admin",
              hasAdminSession: hasActiveAdminSession,
              isLoading: false,
            });

            console.log("✅ [AuthStore] Estado final:", {
              isAdmin: profile.role === "admin",
              hasAdminSession: hasActiveAdminSession,
            });
          }
          // ✅ CASO B: NÃO TEM SESSÃO SUPABASE MAS TEM COOKIES ADMIN
          else if (hasActiveAdminSession) {
            console.log(
              "⚠️ [AuthStore] Sem sessão Supabase, mas TEM cookies admin"
            );

            const currentState = get();

            // Se já tem estado armazenado, manter ele
            if (currentState.user && currentState.profile) {
              console.log("🔍 [AuthStore] Mantendo estado com cookies admin");
              set({
                isLoading: false,
                // Manter todo o resto do estado
              });
              return;
            }

            // Se não tem estado, tentar recuperar do localStorage
            console.log(
              "⚠️ [AuthStore] Cookies admin sem estado - mantendo vazio"
            );
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isAdmin: false,
              hasAdminSession: hasActiveAdminSession, // IMPORTANTE: manter true!
              isLoading: false,
            });
          }
          // ✅ CASO C: NÃO TEM NADA
          else {
            console.log("🔍 [AuthStore] Nenhuma sessão encontrada");
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

          // Em caso de erro, manter estado atual se possível
          const currentState = get();
          const hasActiveAdminSession = await get().checkAdminSession();

          set({
            isLoading: false,
            hasAdminSession: hasActiveAdminSession,
            // Manter o resto do estado se existir
            user: currentState.user || null,
            profile: currentState.profile || null,
            isAuthenticated: currentState.isAuthenticated || false,
            isAdmin: currentState.isAdmin || false,
          });
        }
      },

      loginWithServerAction: async (matricula: string) => {
        try {
          set({ isLoading: true });

          console.log(
            "🔍 [AuthStore] Chamando Server Action com matrícula:",
            matricula
          );

          const formData = new FormData();
          formData.append("matricula", matricula);

          const authModule = await import("@/app/actions/auth/auth");
          const result = await authModule.login(formData);

          console.log("🔍 [AuthStore] Resultado da Server Action:", result);

          if (result.success && "data" in result && result.data) {
            const profileData = result.data.user;

            // Verificar se tem sessão admin
            const hasActiveAdminSession = await get().checkAdminSession();

            set({
              user: result.data.session.user,
              profile: profileData,
              isAuthenticated: true,
              isAdmin: profileData.role === "admin",
              hasAdminSession: hasActiveAdminSession,
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

      setAuthData: (data) => {
        set({
          user: data.user,
          profile: data.profile,
          isAuthenticated: !!data.user,
          isAdmin: data.profile?.role === "admin",
          hasAdminSession: false,
        });
      },

      setProfile: (profile) => {
        set((state) => ({
          ...state,
          profile,
          isAdmin: profile.role === "admin",
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),

      logout: async () => {
        try {
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
          console.error("Logout error:", error);

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

          console.log(
            "🔍 [AuthStore] Verificando acesso admin para:",
            profile.email
          );

          if (!profile.admin_secret_hash || !profile.admin_secret_salt) {
            return {
              success: false,
              error:
                "Senha administrativa não configurada. Configure primeiro no seu perfil.",
            };
          }

          const authModule = await import("@/app/actions/auth/auth");
          const result = await authModule.authenticateAdminSession(
            user.id,
            user.email || "",
            adminPassword
          );

          console.log("🔍 [AuthStore] Resultado da server action:", result);

          if (result.success) {
            set({ hasAdminSession: true });

            get().setProfile({
              ...profile,
              admin_last_auth: new Date().toISOString(),
            });

            console.log("✅ [AuthStore] Autenticação admin bem-sucedida");
            return {
              success: true,
              message:
                result.message || "Autenticação administrativa bem-sucedida!",
            };
          } else {
            return {
              success: false,
              error: result.error || "Erro na autenticação administrativa",
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

      checkAdminSession: async () => {
        try {
          if (typeof document === "undefined") return false;

          const cookies = document.cookie.split("; ");
          const adminCookie = cookies.find((cookie) =>
            cookie.startsWith("is_admin=")
          );

          if (!adminCookie) return false;

          const value = adminCookie.split("=")[1];
          const hasSession = value === "true";

          if (!hasSession) return false;

          // ✅ VERIFICAR SE NÃO ESTÁ EXPIRADO
          const adminSessionCookie = cookies.find((cookie) =>
            cookie.startsWith("admin_session=")
          );

          if (adminSessionCookie) {
            try {
              const sessionValue = adminSessionCookie.split("=")[1];
              const sessionData = JSON.parse(decodeURIComponent(sessionValue));

              if (sessionData.expiresAt) {
                const expiresAt = new Date(sessionData.expiresAt);
                if (expiresAt < new Date()) {
                  console.log("❌ [AuthStore] Sessão admin expirada");
                  get().clearAdminSession();
                  return false;
                }
              }
            } catch {
              return false;
            }
          }

          console.log("🔍 [AuthStore] checkAdminSession:", hasSession);
          return hasSession;
        } catch (error) {
          console.error("❌ [AuthStore] Erro ao verificar cookies:", error);
          return false;
        }
      },

      clearAdminSession: () => {
        set({
          hasAdminSession: false,
        });
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
