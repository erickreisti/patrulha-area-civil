"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";
import { login as serverLogin } from "@/app/actions/auth/login";
import { logout as serverLogout } from "@/app/actions/auth/logout";

type AuthUser = Profile;

interface AuthState {
  // Estado
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  isAuthenticated: boolean;
  isAdmin: boolean;
  isActive: boolean;

  // Métodos
  initialize: () => Promise<void>;
  login: (matricula: string) => Promise<{
    success: boolean;
    error?: string;
    data?: {
      user: AuthUser;
      session: Session;
    };
  }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      isAdmin: false,
      isActive: false,

      // Métodos
      initialize: async () => {
        // Se já está carregando, não faz nada
        if (get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();

          // 1. Obter sessão atual
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) throw sessionError;

          if (!session?.user) {
            set({
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              isAuthenticated: false,
              isAdmin: false,
              isActive: false,
            });
            return;
          }

          // 2. Buscar perfil
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.warn("Erro ao buscar perfil:", profileError);
            await supabase.auth.signOut();
            set({
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              error: "Perfil não encontrado",
              isAuthenticated: false,
              isAdmin: false,
              isActive: false,
            });
            return;
          }

          set({
            user: profile,
            session,
            profile,
            isLoading: false,
            error: null,
            isAuthenticated: true,
            isAdmin: profile.role === "admin",
            isActive: profile.status === true,
          });
        } catch (error) {
          console.error("Erro na inicialização:", error);
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
            isAuthenticated: false,
            isAdmin: false,
            isActive: false,
          });
        }
      },

      login: async (matricula: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log("🔍 [AuthStore] Chamando Server Action login...");

          // Chamar a Server Action
          const formData = new FormData();
          formData.append("matricula", matricula);

          const result = await serverLogin(formData);

          // Verificar se deu erro
          if (!result.success) {
            const errorMsg = result.error || "Erro no login";
            set({
              isLoading: false,
              error: errorMsg,
              isAuthenticated: false,
              isAdmin: false,
              isActive: false,
            });
            return { success: false, error: errorMsg };
          }

          const { session: sessionData, user: userData } = result.data;

          // Atualizar estado
          set({
            user: userData,
            session: sessionData,
            profile: userData,
            isLoading: false,
            error: null,
            isAuthenticated: true,
            isAdmin: userData.role === "admin",
            isActive: userData.status === true,
          });

          return {
            success: true,
            data: {
              user: userData,
              session: sessionData,
            },
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro no login";
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            isActive: false,
          });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          console.log("🔍 [AuthStore] Iniciando logout...");

          // 2. Limpar estado local em UMA única chamada
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
            isAdmin: false,
            isActive: false,
          });

          // 3. Limpar localStorage manualmente (APÓS setState)
          if (typeof window !== "undefined") {
            // Primeiro limpa o storage do zustand
            localStorage.removeItem("auth-storage");

            // Depois limpa cookies Supabase
            document.cookie.split(";").forEach((c) => {
              const cookie = c.trim();
              if (
                cookie.startsWith("sb-") ||
                cookie.startsWith("supabase-auth")
              ) {
                document.cookie = cookie.replace(
                  /=.*/,
                  `=;expires=${new Date().toUTCString()};path=/`
                );
              }
            });
          }

          // 4. Chamar Server Action de logout (assíncrono, não esperar)
          serverLogout()
            .then((result) => {
              if (!result.success) {
                console.warn(
                  "🔍 [AuthStore] Server action logout falhou:",
                  result.error
                );
              }
            })
            .catch((error) => {
              console.warn(
                "🔍 [AuthStore] Erro na Server Action logout:",
                error
              );
            });

          console.log("🔍 [AuthStore] Logout bem-sucedido (estado limpo)");
          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro no logout";
          console.error("🔍 [AuthStore] Erro no logout:", error);

          // Mesmo com erro, garantir que o estado está limpo
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: message,
            isAuthenticated: false,
            isAdmin: false,
            isActive: false,
          });
          return { success: false, error: message };
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Recalcular propriedades computadas
            state.isAuthenticated = !!state.session && !!state.user;
            state.isAdmin = state.user?.role === "admin";
            state.isActive = state.user?.status === true;
          }
        };
      },
    }
  )
);
