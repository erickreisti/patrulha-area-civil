"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js"; // Adicionado Session
import type { Profile } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { checkAdminSession } from "@/app/actions/auth/auth";

// ... (Interface AuthResponse mantida igual)
interface AuthResponse {
  success: boolean;
  error?: string;
  // Ajustamos o tipo da session aqui para ser explícito
  data?: { session: Session; user: Profile };
}

interface AuthState {
  // ... (propriedades mantidas iguais)
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

          // 1. Tenta pegar sessão do cliente (LocalStorage/Cookie)
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // ... (Lógica existente mantida)
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            const adminCheck = await checkAdminSession();

            console.log("🔍 [AuthStore] Admin Check Result:", adminCheck);

            set({
              user: session.user,
              profile: profile || null,
              isAuthenticated: true,
              isAdmin: profile?.role === "admin",
              hasAdminSession: adminCheck.hasSession,
              isLoading: false,
            });
          } else {
            // SE a sessão do supabase falhar, tentamos validar via Server Action (Backup)
            // Isso evita o logout indevido se o cookie existir mas o cliente estiver desincronizado
            const adminCheck = await checkAdminSession();

            if (adminCheck.success && adminCheck.hasSession) {
              // Se o servidor diz que temos sessão, não fazemos logout forçado
              // Apenas marcamos adminSession (o usuário pode precisar de F5 para pegar o user data completo)
              console.log(
                "⚠️ [AuthStore] Sessão válida no servidor, mas cliente desincronizado. Mantendo sessão.",
              );
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
        } catch (error) {
          console.error("❌ [AuthStore] Erro init:", error);
          set({ isLoading: false });
        }
      },

      loginWithServerAction: async (matricula) => {
        set({ isLoading: true });
        const authModule = await import("@/app/actions/auth/auth");
        const formData = new FormData();
        formData.append("matricula", matricula);

        // Chama o Login no Servidor
        const res = await authModule.login(formData);

        // ✅ CORREÇÃO CRÍTICA AQUI:
        if (res.success && res.data) {
          // Sincroniza o Cliente Supabase com os tokens recebidos do Servidor
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: res.data.session.access_token,
            refresh_token: res.data.session.refresh_token,
          });

          if (sessionError) {
            console.error(
              "❌ Erro ao sincronizar sessão no cliente:",
              sessionError,
            );
          }

          // Agora chamamos initialize, que vai encontrar a sessão válida
          await get().initialize();
        } else {
          set({ isLoading: false });
        }

        // Retornamos um objeto compatível com AuthResponse
        return {
          success: res.success,
          error: res.error,
          data: res.data
            ? { session: res.data.session, user: res.data.user }
            : undefined,
        };
      },

      // ... (Restante das funções logout, verifyAdminAccess, etc. mantidas iguais)
      logout: async () => {
        const authModule = await import("@/app/actions/auth/auth");
        await authModule.logout();
        await supabase.auth.signOut(); // Garante logout no cliente também
        get().clearAdminSession();
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
        if (!user?.email) return { success: false, error: "Sem user" };

        const authModule = await import("@/app/actions/auth/auth");
        const res = await authModule.authenticateAdminSession(
          user.id,
          user.email,
          password,
        );

        if (res.success) {
          set({ hasAdminSession: true });
        }
        return res;
      },

      checkAdminSession: () => get().hasAdminSession,

      clearAdminSession: () => {
        if (typeof document !== "undefined") {
          document.cookie =
            "is_admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
