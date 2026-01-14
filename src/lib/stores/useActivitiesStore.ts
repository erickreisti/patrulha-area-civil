// src/lib/stores/useActivitiesStore.ts - VERSÃO FINAL COMPLETA
"use client";

import { create } from "zustand";

// Tipos importados das server actions
import type { ActivityWithUser } from "@/app/actions/admin/activities";

interface ActivitiesStore {
  // Estado
  activities: ActivityWithUser[];
  loading: boolean;
  error: string | null;

  // Filtros
  filters: {
    search: string;
    action_type: string;
    date_range: string;
  };

  // Paginação
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Ações
  fetchActivities: () => Promise<void>;
  setFilters: (filters: Partial<ActivitiesStore["filters"]>) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

// Criação do store
export const useActivitiesStore = create<ActivitiesStore>((set, get) => ({
  // Estado inicial
  activities: [],
  loading: false,
  error: null,

  filters: {
    search: "",
    action_type: "all",
    date_range: "all",
  },

  pagination: {
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  },

  // Buscar atividades usando server action
  fetchActivities: async () => {
    try {
      console.log("🔄 [useActivitiesStore] Buscando atividades...");
      set({ loading: true, error: null });

      const { filters, pagination } = get();

      // Importar server action dinamicamente
      const { getAllActivities } = await import(
        "@/app/actions/admin/activities"
      );

      // Chamar server action com filtros
      const result = await getAllActivities(
        {
          search: filters.search || undefined,
          action_type:
            filters.action_type !== "all" ? filters.action_type : undefined,
          date_range:
            filters.date_range !== "all" ? filters.date_range : undefined,
        },
        {
          page: pagination.page,
          limit: pagination.limit,
        }
      );

      if (result.success && result.data) {
        console.log(
          `✅ [useActivitiesStore] ${result.data.length} atividades carregadas`
        );

        set({
          activities: result.data,
          pagination: {
            ...pagination,
            total: result.pagination?.total || 0,
            totalPages: result.pagination?.totalPages || 1,
          },
          loading: false,
        });
      } else {
        throw new Error(result.error || "Erro ao buscar atividades");
      }
    } catch (error) {
      console.error("❌ [useActivitiesStore] Erro:", error);

      set({
        error: error instanceof Error ? error.message : "Erro desconhecido",
        loading: false,
        activities: [],
      });
    }
  },

  // Atualizar filtros
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }, // Resetar página
    }));

    // Buscar atividades com novos filtros
    get().fetchActivities();
  },

  // Atualizar página
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));

    // Buscar atividades da nova página
    get().fetchActivities();
  },

  // Limpar erro
  clearError: () => {
    set({ error: null });
  },
}));

// Hook simplificado para uso nos componentes
export function useActivitiesList() {
  const {
    activities,
    loading,
    error,
    filters,
    pagination,
    fetchActivities,
    setFilters,
    setPage,
    clearError,
  } = useActivitiesStore();

  return {
    activities,
    loading,
    error,
    filters,
    pagination,
    fetchActivities,
    setFilters,
    setPage,
    clearError,
  };
}
