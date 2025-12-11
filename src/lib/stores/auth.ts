import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { UserRole, UserStatus } from "@/lib/config";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
  avatar_url?: string;
  graduacao?: string;
  matricula?: string;
}

interface AuthState {
  // Estado
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Métodos
  initialize: () => Promise<void>;
  login: (matricula: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ success: boolean; error?: string }>;
  updateUserStatus: (
    userId: string,
    status: UserStatus
  ) => Promise<{ success: boolean; error?: string }>;

  // Computed (como propriedades)
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isActive: () => boolean;
}

// Função segura para converter status
function getNormalizedStatus(status: Profile["status"]): UserStatus {
  // Usar uma abordagem diferente: converter para string primeiro
  const statusStr = String(status).toLowerCase().trim();

  // Mapeamento
  const statusMap: Record<string, UserStatus> = {
    true: "active",
    "1": "active",
    active: "active",
    ativo: "active",
    yes: "active",
    sim: "active",
    false: "inactive",
    "0": "inactive",
    inactive: "inactive",
    inativo: "inactive",
    no: "inactive",
    não: "inactive",
    suspended: "suspended",
    suspenso: "suspended",
    suspensa: "suspended",
    pending: "pending",
    pendente: "pending",
  };

  // Verificar no mapa
  if (statusStr in statusMap) {
    return statusMap[statusStr];
  }

  // Verificar booleanos diretamente
  if (status === true) return "active";
  if (status === false) return "inactive";

  return "inactive";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Métodos computados
      isAuthenticated: () => {
        const { session, user } = get();
        return !!(session && user && user.status === "active");
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin";
      },

      isActive: () => {
        const { user } = get();
        return user?.status === "active";
      },

      // Inicializar store
      initialize: async () => {
        // Evitar múltiplas inicializações simultâneas
        if (get().isInitialized && get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();

          // 1. Verificar sessão atual
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Erro na sessão:", sessionError);
            throw sessionError;
          }

          // 2. Se não houver sessão, limpar estado
          if (!session?.user) {
            set({
              user: null,
              session: null,
              profile: null,
              isInitialized: true,
              error: null,
            });
            return;
          }

          // 3. Buscar perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          // 4. Se erro ao buscar perfil, verificar se é erro de permissão
          if (profileError) {
            console.warn("Erro ao buscar perfil:", profileError);

            // Tentar fallback para perfil mínimo via RLS
            const { data: minimalProfile, error: minimalError } = await supabase
              .from("profiles")
              .select("id, email, role, status, matricula")
              .eq("id", session.user.id)
              .single();

            if (minimalError) {
              console.error(
                "Não foi possível obter perfil mínimo:",
                minimalError
              );

              // Se não consegue nem o perfil mínimo, forçar logout
              await supabase.auth.signOut();
              set({
                user: null,
                session: null,
                profile: null,
                isInitialized: true,
                error: "Sem permissão para acessar perfil",
              });
              return;
            }

            // Criar usuário com dados mínimos
            const userStatus = getNormalizedStatus(minimalProfile.status);
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email!,
              role: minimalProfile.role as UserRole,
              status: userStatus,
              full_name: session.user.user_metadata?.full_name || undefined,
              matricula: minimalProfile.matricula || undefined,
            };

            set({
              user: authUser,
              session,
              profile: minimalProfile as Profile,
              isInitialized: true,
            });
            return;
          }

          // 5. Se conseguiu o perfil completo, criar usuário unificado
          const userStatus = getNormalizedStatus(profile.status);
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            role: profile.role as UserRole,
            status: userStatus,
            full_name: profile.full_name || undefined,
            avatar_url: profile.avatar_url || undefined,
            graduacao: profile.graduacao || undefined,
            matricula: profile.matricula || undefined,
          };

          set({
            user: authUser,
            session,
            profile,
            isInitialized: true,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erro ao inicializar autenticação";
          console.error("Erro ao inicializar auth:", error);
          set({
            error: errorMessage,
            isInitialized: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Login unificado
      login: async (matricula: string) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();

          // 1. Buscar perfil pela matrícula
          const response = await fetch("/api/auth/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matricula }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Erro ao buscar perfil");
          }

          const { data: profileData, security } = await response.json();

          // 2. Verificar se o perfil está ativo
          const userStatus = getNormalizedStatus(profileData.status);
          if (userStatus !== "active") {
            throw new Error(
              `Conta ${userStatus}. Entre em contato com o administrador.`
            );
          }

          // 3. Fazer login com Supabase
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email: profileData.email,
              password: security.default_password,
            });

          if (authError) throw authError;

          // 4. Criar usuário unificado
          const authUser: AuthUser = {
            id: authData.user.id,
            email: authData.user.email!,
            role: profileData.role,
            status: userStatus,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            graduacao: profileData.graduacao,
            matricula: profileData.matricula,
          };

          set({
            user: authUser,
            session: authData.session,
            profile: profileData,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro no login";
          console.error("Erro no login:", error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });

        try {
          const supabase = createClient();
          await supabase.auth.signOut();

          set({
            user: null,
            session: null,
            profile: null,
            error: null,
            isInitialized: true,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro no logout";
          console.error("Erro no logout:", error);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Atualizar sessão
      refreshSession: async () => {
        try {
          const supabase = createClient();
          const {
            data: { session },
            error,
          } = await supabase.auth.refreshSession();

          if (error) {
            console.warn("Erro ao atualizar sessão:", error);
            // Se erro de sessão expirada, fazer logout
            if (
              error.message.includes("expired") ||
              error.message.includes("invalid")
            ) {
              await get().logout();
            }
            return;
          }

          if (session) {
            set({ session });
            // Se sessão mudou, re-inicializar
            if (session.user.id !== get().user?.id) {
              await get().initialize();
            }
          }
        } catch (error) {
          console.error("Erro ao atualizar sessão:", error);
        }
      },

      // Atualizar perfil
      updateProfile: async (updates: Partial<Profile>) => {
        set({ isLoading: true });

        try {
          const supabase = createClient();
          const { user } = get();

          if (!user) throw new Error("Usuário não autenticado");

          const { data: updatedProfile, error } = await supabase
            .from("profiles")
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .single();

          if (error) throw error;

          // Atualizar estado
          const userStatus = getNormalizedStatus(updatedProfile.status);

          set({
            profile: updatedProfile,
            user: {
              ...user,
              status: userStatus,
              full_name: updatedProfile.full_name || user.full_name,
              avatar_url: updatedProfile.avatar_url || user.avatar_url,
              graduacao: updatedProfile.graduacao || user.graduacao,
              matricula: updatedProfile.matricula || user.matricula,
            },
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro ao atualizar perfil";
          console.error("Erro ao atualizar perfil:", error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      // Atualizar status do usuário (apenas admin)
      updateUserStatus: async (userId: string, status: UserStatus) => {
        set({ isLoading: true });

        try {
          const supabase = createClient();
          const { user } = get();

          if (!user || user.role !== "admin") {
            throw new Error("Apenas administradores podem alterar status");
          }

          // Converter status para boolean para o banco
          const statusBoolean = status === "active";

          const { data: updatedProfile, error } = await supabase
            .from("profiles")
            .update({
              status: statusBoolean,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select()
            .single();

          if (error) throw error;

          // Se for o próprio usuário, atualizar estado local
          if (userId === user.id) {
            const userStatus = getNormalizedStatus(updatedProfile.status);
            set({
              user: { ...user, status: userStatus },
              profile: updatedProfile,
            });
          }

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro ao atualizar status";
          console.error("Erro ao atualizar status:", error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
      }),
    }
  )
);
