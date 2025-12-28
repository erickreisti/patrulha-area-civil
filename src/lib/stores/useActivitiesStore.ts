"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  getRecentActivitiesForDashboard,
  getActivitiesStats,
  createSystemActivity,
  type ActivityWithUser,
  type CreateActivityData,
} from "@/app/actions/admin/activities";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/app/actions/admin/dashboard/dashboard";

export interface ActivityStats {
  total: number;
  topTypes: Array<{ type: string; count: number }>;
  timeframe: string;
}

interface ActivitiesStoreState {
  // Dados
  recentActivities: ActivityWithUser[];
  stats: ActivityStats | null;
  dashboardStats: DashboardStats | null;

  // Estado
  loadingRecent: boolean;
  loadingStats: boolean;
  loadingDashboard: boolean;
  error: string | null;
  realtimeConnected: boolean;

  // Canal Real-time
  realtimeChannel: RealtimeChannel | null;

  // Ações
  fetchRecentActivities: () => Promise<void>;
  fetchStats: (timeframe?: "day" | "week" | "month") => Promise<void>;
  fetchDashboardStats: () => Promise<DashboardStats | null>;
  createActivity: (data: CreateActivityData) => Promise<void>;

  // Real-time Actions
  setupRealtime: () => Promise<boolean>;
  cleanupRealtime: () => Promise<void>;
}

// Estado inicial
const initialState: Omit<
  ActivitiesStoreState,
  | "fetchRecentActivities"
  | "fetchStats"
  | "fetchDashboardStats"
  | "createActivity"
  | "setupRealtime"
  | "cleanupRealtime"
> = {
  recentActivities: [],
  stats: null,
  dashboardStats: null,
  loadingRecent: false,
  loadingStats: false,
  loadingDashboard: false,
  error: null,
  realtimeConnected: false,
  realtimeChannel: null,
};

export const useActivitiesStore = create<ActivitiesStoreState>((set, get) => ({
  ...initialState,

  // ATUALIZADO: Usar getDashboardStats em vez de getDashboardData
  fetchDashboardStats: async () => {
    set({ loadingDashboard: true, error: null });

    try {
      console.log("🔍 [ActivitiesStore] Buscando dados do dashboard...");
      const result = await getDashboardStats();

      if (result.success && result.stats) {
        console.log(
          "✅ [ActivitiesStore] Dados do dashboard carregados com sucesso"
        );

        set({
          dashboardStats: result.stats,
          loadingDashboard: false,
        });

        return result.stats;
      } else {
        console.warn(
          "⚠️ [ActivitiesStore] Erro ao buscar dados do dashboard:",
          result.error
        );

        set({
          loadingDashboard: false,
          error: result.error || "Não foi possível carregar dados do dashboard",
        });

        return null;
      }
    } catch (error) {
      console.error(
        "❌ [ActivitiesStore] Erro ao buscar dados do dashboard:",
        error
      );

      set({
        loadingDashboard: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar dados do dashboard",
      });

      return null;
    }
  },

  // ATIVIDADES RECENTES PARA DASHBOARD
  fetchRecentActivities: async () => {
    set({ loadingRecent: true, error: null });

    try {
      console.log("🔍 [ActivitiesStore] Buscando atividades recentes...");
      const result = await getRecentActivitiesForDashboard();

      if (result.success) {
        console.log(
          `✅ [ActivitiesStore] ${result.data.length} atividades carregadas`
        );
        set({
          recentActivities: result.data,
          loadingRecent: false,
        });
      } else {
        console.warn(
          "⚠️ [ActivitiesStore] Erro ao buscar atividades:",
          result.error
        );
        // Não lançar erro, apenas mostrar lista vazia
        set({
          recentActivities: [],
          loadingRecent: false,
          error: result.error || "Não foi possível carregar atividades",
        });
      }
    } catch (error) {
      console.error(
        "❌ [ActivitiesStore] Erro ao buscar atividades recentes:",
        error
      );
      set({
        loadingRecent: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar atividades recentes",
      });
    }
  },

  // ESTATÍSTICAS DE ATIVIDADES
  fetchStats: async (timeframe = "week") => {
    set({ loadingStats: true, error: null });

    try {
      console.log("🔍 [ActivitiesStore] Buscando estatísticas...");
      const result = await getActivitiesStats(timeframe);

      if (result.success) {
        console.log(
          `✅ [ActivitiesStore] Estatísticas carregadas: ${result.data.total} atividades`
        );
        set({
          stats: result.data,
          loadingStats: false,
        });
      } else {
        console.warn(
          "⚠️ [ActivitiesStore] Erro ao buscar estatísticas:",
          result.error
        );
        // Não lançar erro, apenas definir estatísticas vazias
        set({
          stats: {
            total: 0,
            topTypes: [],
            timeframe,
          },
          loadingStats: false,
          error: result.error || "Não foi possível carregar estatísticas",
        });
      }
    } catch (error) {
      console.error("❌ [ActivitiesStore] Erro ao buscar estatísticas:", error);
      set({
        loadingStats: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar estatísticas",
      });
    }
  },

  // CRIAR NOVA ATIVIDADE
  createActivity: async (data: CreateActivityData) => {
    set({ error: null });

    try {
      console.log("🔍 [ActivitiesStore] Criando atividade...");
      const result = await createSystemActivity(data);

      if (!result.success) {
        console.warn(
          "⚠️ [ActivitiesStore] Erro ao criar atividade:",
          result.error
        );
        throw new Error(result.error || "Erro ao criar atividade");
      }

      console.log("✅ [ActivitiesStore] Atividade criada com sucesso");

      // Atualizar estatísticas (não aguardar erro)
      get()
        .fetchStats()
        .catch((error) => {
          console.warn(
            "⚠️ [ActivitiesStore] Erro ao atualizar estatísticas:",
            error
          );
        });

      // Atualizar atividades recentes (não aguardar erro)
      get()
        .fetchRecentActivities()
        .catch((error) => {
          console.warn(
            "⚠️ [ActivitiesStore] Erro ao atualizar atividades:",
            error
          );
        });
    } catch (error) {
      console.error("❌ [ActivitiesStore] Erro ao criar atividade:", error);
      set({
        error:
          error instanceof Error ? error.message : "Erro ao criar atividade",
      });
    }
  },

  // CONFIGURAR CONEXÃO REAL-TIME
  setupRealtime: async () => {
    try {
      console.log("🔍 [ActivitiesStore] Configurando real-time...");

      // Limpar canal existente
      await get().cleanupRealtime();

      const supabase = createClient();

      // Verificar se usuário está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn(
          "⚠️ [ActivitiesStore] Usuário não autenticado para real-time"
        );
        set({ realtimeConnected: false });
        return false;
      }

      console.log(`🔍 [ActivitiesStore] Usuário autenticado: ${user.id}`);

      // Verificar se é admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !profile ||
        profile.role !== "admin" ||
        !profile.status
      ) {
        console.warn(
          "⚠️ [ActivitiesStore] Usuário não tem permissão para real-time"
        );
        set({ realtimeConnected: false });
        return false;
      }

      console.log(
        "✅ [ActivitiesStore] Usuário é admin, configurando canal real-time..."
      );

      // Criar canal real-time
      const channel = supabase
        .channel("system-activities-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "system_activities",
          },
          async () => {
            console.log(
              "🔔 [ActivitiesStore] Nova atividade recebida via real-time"
            );

            // Atualizar atividades recentes (não aguardar erro)
            get()
              .fetchRecentActivities()
              .catch((error) => {
                console.warn(
                  "⚠️ [ActivitiesStore] Erro ao atualizar atividades via real-time:",
                  error
                );
              });

            // Atualizar estatísticas (não aguardar erro)
            get()
              .fetchStats()
              .catch((error) => {
                console.warn(
                  "⚠️ [ActivitiesStore] Erro ao atualizar estatísticas via real-time:",
                  error
                );
              });
          }
        )
        .subscribe((status) => {
          console.log(
            `📡 [ActivitiesStore] Status do canal real-time: ${status}`
          );
          set({
            realtimeConnected: status === "SUBSCRIBED",
          });

          if (status === "SUBSCRIBED") {
            console.log(
              "✅ [ActivitiesStore] Canal real-time conectado com sucesso"
            );
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ [ActivitiesStore] Erro no canal real-time");
          }
        });

      set({ realtimeChannel: channel });
      return true;
    } catch (error) {
      console.error(
        "❌ [ActivitiesStore] Erro ao configurar real-time:",
        error
      );
      set({
        realtimeConnected: false,
        error: "Erro na conexão real-time",
      });
      return false;
    }
  },

  // LIMPAR CONEXÃO REAL-TIME
  cleanupRealtime: async () => {
    const { realtimeChannel } = get();

    if (realtimeChannel) {
      try {
        console.log("🔍 [ActivitiesStore] Removendo canal real-time...");
        const supabase = createClient();
        await supabase.removeChannel(realtimeChannel);
        console.log(
          "✅ [ActivitiesStore] Canal real-time removido com sucesso"
        );
      } catch (error) {
        console.error(
          "❌ [ActivitiesStore] Erro ao remover canal real-time:",
          error
        );
      }
    }

    set({
      realtimeChannel: null,
      realtimeConnected: false,
    });
  },
}));

// Hook personalizado para Dashboard - ATUALIZADO
export const useDashboardActivities = () => {
  const {
    recentActivities,
    loadingRecent,
    fetchRecentActivities,
    stats,
    loadingStats,
    fetchStats,
    dashboardStats,
    loadingDashboard,
    fetchDashboardStats,
    error,
    setupRealtime,
    cleanupRealtime,
    realtimeConnected,
  } = useActivitiesStore();

  return {
    recentActivities,
    loadingRecent,
    fetchRecentActivities,
    stats,
    loadingStats,
    fetchStats,
    dashboardStats,
    loadingDashboard,
    fetchDashboardStats,
    error,
    setupRealtime,
    cleanupRealtime,
    realtimeConnected,
  };
};
