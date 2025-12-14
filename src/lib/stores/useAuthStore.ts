import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";
import {
  type UserRole,
  type UserStatus,
  normalizeUserStatus,
} from "@/lib/types/shared"; // ← Import corrigido

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
  avatar_url?: string;
  matricula?: string;
  graduacao?: string;
}

interface AuthState {
  // Estado
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  // Métodos
  initialize: () => Promise<void>;
  login: (matricula: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;

  // Computed
  isAuthenticated: boolean;
  isAdmin: boolean;
  isActive: boolean;
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

      // Computed properties
      get isAuthenticated() {
        const state = get();
        return !!(
          state.session &&
          state.user &&
          state.user.status === "active"
        );
      },

      get isAdmin() {
        return get().user?.role === "admin";
      },

      get isActive() {
        return get().user?.status === "active";
      },

      // Métodos
      initialize: async () => {
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
            // Tentar fazer logout se perfil não existe
            await supabase.auth.signOut();
            set({
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              error: "Perfil não encontrado",
            });
            return;
          }

          // 3. Verificar se profile tem role
          if (!profile.role) {
            throw new Error("Perfil sem role definida");
          }

          // 4. Criar usuário unificado
          const user: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            role: profile.role,
            status: normalizeUserStatus(profile.status), // ← Usando função compartilhada
            full_name: profile.full_name || undefined,
            avatar_url: profile.avatar_url || undefined,
            graduacao: profile.graduacao || undefined,
            matricula: profile.matricula || undefined,
          };

          set({
            user,
            session,
            profile,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro desconhecido";
          console.error("Erro na inicialização:", error);
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: message,
          });
        }
      },

      login: async (matricula: string) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();

          // 1. Buscar perfil pela matrícula
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("matricula", matricula.replace(/\D/g, ""))
            .single();

          if (profileError || !profile) {
            throw new Error("Matrícula não encontrada");
          }

          // 2. Verificar status
          if (!profile.status) {
            throw new Error(
              "Conta inativa. Entre em contato com o administrador."
            );
          }

          // 3. Fazer login
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email: profile.email,
              password:
                process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure",
            });

          if (authError) throw authError;

          // 4. Atualizar estado
          const user: AuthUser = {
            id: authData.user.id,
            email: authData.user.email!,
            role: profile.role,
            status: normalizeUserStatus(profile.status), // ← Usando função compartilhada
            full_name: profile.full_name || undefined,
            avatar_url: profile.avatar_url || undefined,
            graduacao: profile.graduacao || undefined,
            matricula: profile.matricula || undefined,
          };

          set({
            user,
            session: authData.session,
            profile,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro no login";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          const supabase = createClient();
          await supabase.auth.signOut();

          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro no logout";
          set({ error: message, isLoading: false });
        }
      },

      refresh: async () => {
        await get().initialize();
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
      }),
    }
  )
);
