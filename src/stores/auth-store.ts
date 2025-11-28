import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { persist } from "zustand/middleware";

// Interfaces
interface UserProfile {
  id: string;
  matricula: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  graduacao?: string;
  validade_certificacao?: string;
  tipo_sanguineo?: string;
  status: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;

  initializeAuth: () => Promise<void>;
  setAuth: (user: AuthUser, profile: UserProfile) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAdmin: false,
      loading: true,
      initialized: false,

      initializeAuth: async () => {
        const { initialized } = get();
        if (initialized) return;

        set({ loading: true });

        try {
          const supabase = createClient();
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          if (error) {
            console.log("ℹ️ Nenhuma sessão ativa (comportamento normal)");
            set({
              user: null,
              profile: null,
              isAdmin: false,
              loading: false,
              initialized: true,
            });
            return;
          }

          if (user && user.email) {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profileError) {
              console.error("❌ Erro ao buscar perfil:", profileError);
              set({
                user: null,
                profile: null,
                isAdmin: false,
                loading: false,
                initialized: true,
              });
              return;
            }

            if (profile) {
              set({
                user: { id: user.id, email: user.email },
                profile,
                isAdmin: profile.role?.toLowerCase().trim() === "admin",
                loading: false,
                initialized: true,
              });
              return;
            }
          }

          set({
            user: null,
            profile: null,
            isAdmin: false,
            loading: false,
            initialized: true,
          });
        } catch (error) {
          console.error("❌ Erro inesperado no auth:", error);
          set({
            user: null,
            profile: null,
            isAdmin: false,
            loading: false,
            initialized: true,
          });
        }
      },

      setAuth: (user: AuthUser, profile: UserProfile) => {
        set({
          user,
          profile,
          isAdmin: profile.role?.toLowerCase().trim() === "admin",
          loading: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          profile: null,
          isAdmin: false,
          loading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const supabase = createClient();
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          if (profile) {
            set({
              profile,
              isAdmin: profile.role?.toLowerCase().trim() === "admin",
            });
          }
        } catch (error) {
          console.error("❌ Erro ao atualizar perfil:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
