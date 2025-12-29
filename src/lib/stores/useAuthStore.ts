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
  adminSession: {
    isAuthenticated: boolean;
    authenticatedAt: string | null;
  };

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
  setAdminSession: (authenticated: boolean) => void;
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
      adminSession: {
        isAuthenticated: false,
        authenticatedAt: null,
      },

      initialize: async () => {
        try {
          set({ isLoading: true });
          console.log("🔍 [AuthStore] Inicializando store...");

          // 1. Verificar sessão
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session?.user) {
            console.log("🔍 [AuthStore] Nenhuma sessão encontrada");
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isAdmin: false,
              isLoading: false,
            });
            return;
          }

          console.log("✅ [AuthStore] Sessão encontrada:", {
            userId: session.user.id,
            userEmail: session.user.email,
          });

          // 2. Definir usuário imediatamente
          set({
            user: session.user,
            isAuthenticated: true,
          });

          // 3. Buscar perfil
          console.log(
            "🔍 [AuthStore] Buscando perfil para ID:",
            session.user.id
          );

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

            // Tentar buscar como admin (se tiver cache)
            const currentState = get();
            if (currentState.profile) {
              console.log("🔍 [AuthStore] Usando perfil do cache");
              set({
                profile: currentState.profile,
                isAdmin: currentState.profile.role === "admin",
                isLoading: false,
              });
              return;
            }

            set({
              profile: null,
              isAdmin: false,
              isLoading: false,
            });
            return;
          }

          if (!profile) {
            console.error("❌ [AuthStore] Perfil não encontrado no banco");
            set({
              profile: null,
              isAdmin: false,
              isLoading: false,
            });
            return;
          }

          console.log("✅ [AuthStore] Perfil carregado:", {
            id: profile.id,
            email: profile.email,
            status: profile.status,
            role: profile.role,
            full_name: profile.full_name,
            matricula: profile.matricula,
            admin_2fa_enabled: profile.admin_2fa_enabled,
          });

          // 4. Atualizar estado completo
          set({
            profile,
            isAdmin: profile.role === "admin",
            isLoading: false,
          });
        } catch (error) {
          console.error("❌ [AuthStore] Erro na inicialização:", error);
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
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

          // ✅ ATUALIZADO: Agora usa o arquivo único
          const authModule = await import("@/app/actions/auth/auth");
          const result = await authModule.login(formData);

          console.log("🔍 [AuthStore] Resultado da Server Action:", result);

          if (result.success && "data" in result && result.data) {
            const profileData = result.data.user;

            // Atualizar estado local
            set({
              user: result.data.session.user,
              profile: profileData,
              isAuthenticated: true,
              isAdmin: profileData.role === "admin",
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

          // ✅ ATUALIZADO: Chama o logout do arquivo único
          const authModule = await import("@/app/actions/auth/auth");
          const result = await authModule.logout();

          // Limpar estado local mesmo se der erro no server
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isAdmin: false,
          });

          return result.success ? { success: true } : result;
        } catch (error) {
          console.error("Logout error:", error);

          // Limpar estado local mesmo com erro
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isAdmin: false,
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

          // Verificar se o admin tem senha configurada
          if (!profile.admin_secret_hash || !profile.admin_secret_salt) {
            return {
              success: false,
              error:
                "Senha administrativa não configurada. Configure primeiro no seu perfil.",
            };
          }

          // ✅ ATUALIZADO: Agora usa o arquivo único
          const authModule = await import("@/app/actions/auth/auth");
          const result = await authModule.authenticateAdminSession(
            user.id,
            user.email || "",
            adminPassword
          );

          console.log("🔍 [AuthStore] Resultado da server action:", result);

          if (result.success) {
            // Atualizar estado local
            get().setAdminSession(true);

            // Atualizar último acesso no perfil local
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

      setAdminSession: (authenticated) => {
        set({
          adminSession: {
            isAuthenticated: authenticated,
            authenticatedAt: authenticated ? new Date().toISOString() : null,
          },
        });
      },

      clearAdminSession: () => {
        set({
          adminSession: {
            isAuthenticated: false,
            authenticatedAt: null,
          },
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
        adminSession: state.adminSession,
      }),
    }
  )
);
