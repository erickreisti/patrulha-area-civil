"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

// Interface para debug info - simplificada para compatibilidade
interface DebugInfo {
  step?: string;
  error?: string;
  code?: string;
  userId?: string;
  matricula?: string;
  timestamp?: string;
  hashExpected?: string;
  hashReceived?: string;
  hashLengthExpected?: number;
  hashLengthReceived?: number;
  testWithPac2026?: boolean;
  not_admin?: string;
  inactive?: boolean;
  "2fa_disabled"?: boolean;
  hash_salt_missing?: {
    hasHash: boolean;
    hasSalt: boolean;
  };
  password_mismatch?: {
    hashExpected: string;
    hashReceived: string;
    hashLengthExpected: number;
    hashLengthReceived: number;
    testWithPac2026: boolean;
  };
  zod_error?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
  unexpected_error?: string;
  fetch_profile?: string;
  profile_not_found?: string;
  success?: string;
  [key: string]: unknown;
}

// Interface para retorno da server action
interface AdminAuthResult {
  success: boolean;
  error?: string;
  message?: string;
  details?: {
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  };
  debug?: DebugInfo;
}

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminAuthenticated: boolean;
  adminSessionExpires: Date | null;

  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;

  login: (matricula: string) => Promise<{
    success: boolean;
    error?: string;
    data?: {
      user: Profile;
      session: Session;
    };
  }>;

  logout: () => Promise<{
    success: boolean;
    error?: string;
  }>;

  initialize: () => Promise<void>;

  verifyAdminAccess: (adminPassword: string) => Promise<AdminAuthResult>;

  clearAdminAuth: () => void;
  checkAdminAuthExpired: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      adminAuthenticated: false,
      adminSessionExpires: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) =>
        set({
          profile,
          isAdmin: profile?.role === "admin" && profile?.status === true,
        }),
      setSession: (session) => set({ session }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),

      login: async (matricula) => {
        set({ isLoading: true });

        try {
          console.log(
            "🔍 [AuthStore] Iniciando login com matrícula:",
            matricula
          );

          const formData = new FormData();
          formData.append("matricula", matricula);

          const loginModule = await import("@/app/actions/auth/login");
          const result = await loginModule.login(formData);

          console.log("🔍 [AuthStore] Resultado do login:", result);

          if (result.success && result.data) {
            set({
              user: result.data.session?.user || null,
              profile: result.data.user,
              session: result.data.session || null,
              isAuthenticated: true,
              isAdmin:
                result.data.user?.role === "admin" &&
                result.data.user?.status === true,
              isLoading: false,
            });
          } else {
            set({
              isLoading: false,
              isAuthenticated: false,
            });
          }

          return result;
        } catch (error) {
          console.error("❌ [AuthStore] Erro no login:", error);
          set({ isLoading: false });

          return {
            success: false,
            error: "Erro na comunicação com o servidor",
          };
        }
      },

      logout: async () => {
        try {
          console.log("🔍 [AuthStore] Iniciando logout");

          const logoutModule = await import("@/app/actions/auth/logout");
          const result = await logoutModule.logout();

          console.log("🔍 [AuthStore] Resultado do logout:", result);

          if (result.success) {
            set({
              user: null,
              profile: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
              isAdmin: false,
              adminAuthenticated: false,
              adminSessionExpires: null,
            });
          }

          return result;
        } catch (error) {
          console.error("❌ [AuthStore] Erro no logout:", error);

          set({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            adminAuthenticated: false,
            adminSessionExpires: null,
          });

          return {
            success: false,
            error: "Erro ao fazer logout",
          };
        }
      },

      initialize: async () => {
        set({ isLoading: true });

        try {
          const { createBrowserClient } = await import("@supabase/ssr");

          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
              },
            }
          );

          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("❌ [AuthStore] Erro ao obter sessão:", error);
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          if (session?.user) {
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
              set({ isLoading: false, isAuthenticated: false });
              return;
            }

            set({
              user: session.user,
              profile,
              session,
              isAuthenticated: true,
              isAdmin: profile?.role === "admin" && profile?.status === true,
              isLoading: false,
            });

            // Verificar se sessão admin expirou
            if (profile?.role === "admin") {
              const store = get();
              if (store.adminAuthenticated && store.adminSessionExpires) {
                const isExpired =
                  new Date() > new Date(store.adminSessionExpires);
                if (isExpired) {
                  set({
                    adminAuthenticated: false,
                    adminSessionExpires: null,
                  });
                }
              }
            }
          } else {
            set({
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error("❌ [AuthStore] Erro na inicialização:", error);
          set({
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      verifyAdminAccess: async (adminPassword: string) => {
        set({ isLoading: true });

        try {
          console.log("🔍 [AuthStore] Verificando acesso admin...");

          const { profile } = get();

          // Validar se o perfil existe
          if (!profile) {
            console.error("❌ [AuthStore] Perfil não encontrado");
            return {
              success: false,
              error: "Perfil não encontrado. Faça login novamente.",
            } as AdminAuthResult;
          }

          if (profile.role !== "admin" || !profile.status) {
            console.error("❌ [AuthStore] Usuário não é admin ou está inativo");
            return {
              success: false,
              error: "Acesso administrativo não autorizado",
            } as AdminAuthResult;
          }

          console.log("🔍 [AuthStore] Passando para server action...");

          // Chamar server action diretamente com o userId
          const formData = new FormData();
          formData.append("adminPassword", adminPassword);
          formData.append("userId", profile.id);
          formData.append("userEmail", profile.email || "");

          const adminAuthModule = await import(
            "@/app/actions/auth/admin/admin-auth"
          );
          const result = await adminAuthModule.verifyAdminPassword(formData);

          console.log("🔍 [AuthStore] Resultado da verificação:", result);

          if (result.success) {
            const expires = new Date();
            expires.setMinutes(expires.getMinutes() + 15);

            set({
              adminAuthenticated: true,
              adminSessionExpires: expires,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

          // Garantir que o resultado está no formato correto
          return {
            success: result.success,
            error: result.error,
            message: result.message,
            details: result.details,
            debug: result.debug as DebugInfo,
          } as AdminAuthResult;
        } catch (error) {
          console.error("❌ [AuthStore] Erro na verificação admin:", error);
          set({ isLoading: false });

          return {
            success: false,
            error: "Erro na autenticação administrativa",
            debug: { error: String(error) } as DebugInfo,
          } as AdminAuthResult;
        }
      },

      clearAdminAuth: () => {
        set({
          adminAuthenticated: false,
          adminSessionExpires: null,
        });
      },

      checkAdminAuthExpired: () => {
        const { adminSessionExpires } = get();

        if (!adminSessionExpires) {
          return true;
        }

        const now = new Date();
        const expires = new Date(adminSessionExpires);

        return now > expires;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        adminAuthenticated: state.adminAuthenticated,
        adminSessionExpires: state.adminSessionExpires?.toISOString(),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.adminSessionExpires) {
          state.adminSessionExpires = new Date(state.adminSessionExpires);
        }
      },
    }
  )
);
