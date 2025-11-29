import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { persist } from "zustand/middleware";
import { AuthUser, UserProfile } from "@/types";

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
            console.log("ℹ️ Nenhuma sessão ativa");
            set({
              user: null,
              profile: null,
              isAdmin: false,
              loading: false,
              initialized: true,
            });
            return;
          }

          if (user?.email) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

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
          console.error("❌ Erro no auth:", error);
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
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

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
