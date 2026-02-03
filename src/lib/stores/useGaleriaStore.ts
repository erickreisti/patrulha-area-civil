"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

// Imports das Server Actions
import {
  getCategoriasAdmin,
  getCategoriaPorSlug,
  getItensAdmin,
  createCategoria,
  toggleCategoriaStatus,
  createItem,
  toggleItemStatus,
  toggleItemDestaque,
  getGaleriaStats,
} from "@/app/actions/gallery";

import type {
  Categoria,
  Item,
  GaleriaStats,
  CreateCategoriaInput,
  TipoCategoriaFilter,
  TipoItemFilter,
  StatusFilter,
  DestaqueFilter,
} from "@/app/actions/gallery/types";

// ============================================
// TIPOS DO ESTADO
// ============================================

interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

interface GaleriaStore {
  // --- Estado de Dados ---
  categorias: Categoria[];
  categoriaSelecionada: Categoria | null;
  itens: Item[];
  itemSelecionado: Item | null;
  stats: GaleriaStats | null;

  // --- Estado de Loading/Erro ---
  loadingCategorias: boolean;
  errorCategorias: string | null;
  loadingItens: boolean;
  errorItens: string | null;
  loadingStats: boolean;

  // --- Filtros ---
  filtrosCategorias: {
    search: string;
    tipo: TipoCategoriaFilter;
    status: StatusFilter;
    page: number;
    limit: number;
  };

  filtrosItens: {
    search: string;
    categoria_id: string | "all";
    tipo: TipoItemFilter;
    status: StatusFilter;
    destaque: DestaqueFilter;
    page: number;
    limit: number;
  };

  // --- Actions (Categorias) ---
  fetchCategorias: () => Promise<void>;
  fetchCategoriaPorSlug: (slug: string) => Promise<void>;
  criarCategoria: (
    data: CreateCategoriaInput,
  ) => Promise<{ success: boolean; error?: string }>;
  alternarStatusCategoria: (
    id: string,
    current: boolean,
  ) => Promise<{ success: boolean; error?: string }>;

  // --- Actions (Itens) ---
  fetchItens: () => Promise<void>;
  criarItem: (data: FormData) => Promise<{ success: boolean; error?: string }>;
  alternarStatusItem: (
    id: string,
    current: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  alternarDestaqueItem: (
    id: string,
    current: boolean,
  ) => Promise<{ success: boolean; error?: string }>;

  // --- Actions (Gerais) ---
  fetchStats: () => Promise<void>;

  // --- Setters de Filtro ---
  setFiltrosCategorias: (
    filtros: Partial<GaleriaStore["filtrosCategorias"]>,
  ) => void;
  setFiltrosItens: (filtros: Partial<GaleriaStore["filtrosItens"]>) => void;
  setPaginationCategorias: (pagination: Partial<PaginationState>) => void;
  setPaginationItens: (pagination: Partial<PaginationState>) => void;

  // --- Utils ---
  clearErrorCategorias: () => void;
  clearErrorItens: () => void;
  resetFiltrosCategorias: () => void;
  resetFiltrosItens: () => void;
}

const initialState = {
  categorias: [],
  categoriaSelecionada: null,
  itens: [],
  itemSelecionado: null,
  stats: null,

  loadingCategorias: false,
  errorCategorias: null,
  loadingItens: false,
  errorItens: null,
  loadingStats: false,

  filtrosCategorias: {
    search: "",
    tipo: "all" as TipoCategoriaFilter,
    status: "all" as StatusFilter,
    page: 1,
    limit: 12,
  },

  filtrosItens: {
    search: "",
    categoria_id: "all",
    tipo: "all" as TipoItemFilter,
    status: "all" as StatusFilter,
    destaque: "all" as DestaqueFilter,
    page: 1,
    limit: 12,
  },
};

// ============================================
// CREATE STORE
// ============================================

export const useGaleriaStore = create<GaleriaStore>((set, get) => ({
  ...initialState,

  // --- Actions Categorias ---
  fetchCategorias: async () => {
    set({ loadingCategorias: true, errorCategorias: null });
    try {
      const { filtrosCategorias } = get();
      const res = await getCategoriasAdmin({
        search: filtrosCategorias.search,
        tipo:
          filtrosCategorias.tipo !== "all" ? filtrosCategorias.tipo : undefined,
        status:
          filtrosCategorias.status !== "all"
            ? filtrosCategorias.status
            : undefined,
        page: filtrosCategorias.page,
        limit: filtrosCategorias.limit,
      });

      if (res.success && res.data) {
        set({ categorias: res.data, loadingCategorias: false });
      } else {
        throw new Error(res.error || "Erro ao buscar categorias");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorCategorias: message, loadingCategorias: false });
    }
  },

  fetchCategoriaPorSlug: async (slug: string) => {
    set({ loadingCategorias: true, errorCategorias: null });
    try {
      const res = await getCategoriaPorSlug(slug);
      if (res.success && res.data) {
        set({ categoriaSelecionada: res.data, loadingCategorias: false });
      } else {
        throw new Error(res.error || "Categoria não encontrada");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorCategorias: message, loadingCategorias: false });
    }
  },

  criarCategoria: async (data: CreateCategoriaInput) => {
    set({ loadingCategorias: true, errorCategorias: null });
    try {
      const res = await createCategoria(data);
      if (res.success) {
        await get().fetchCategorias();
        return { success: true };
      } else {
        throw new Error(res.error || "Erro ao criar categoria");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorCategorias: message, loadingCategorias: false });
      return { success: false, error: message };
    }
  },

  alternarStatusCategoria: async (id: string, current: boolean) => {
    set({ loadingCategorias: true });
    try {
      const res = await toggleCategoriaStatus(id, !current);
      if (res.success) {
        await get().fetchCategorias();
        set({ loadingCategorias: false });
        return { success: true };
      } else {
        throw new Error(res.error);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorCategorias: message, loadingCategorias: false });
      return { success: false, error: message };
    }
  },

  // --- Actions Itens ---
  fetchItens: async () => {
    set({ loadingItens: true, errorItens: null });
    try {
      const { filtrosItens } = get();
      const res = await getItensAdmin({
        search: filtrosItens.search,
        categoria_id:
          filtrosItens.categoria_id !== "all"
            ? filtrosItens.categoria_id
            : undefined,
        tipo: filtrosItens.tipo !== "all" ? filtrosItens.tipo : undefined,
        status: filtrosItens.status !== "all" ? filtrosItens.status : undefined,
        destaque:
          filtrosItens.destaque !== "all" ? filtrosItens.destaque : undefined,
        page: filtrosItens.page,
        limit: filtrosItens.limit,
      });

      if (res.success && res.data) {
        set({ itens: res.data, loadingItens: false });
      } else {
        throw new Error(res.error || "Erro ao buscar itens");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorItens: message, loadingItens: false });
    }
  },

  criarItem: async (data: FormData) => {
    set({ loadingItens: true, errorItens: null });
    try {
      const res = await createItem(data);
      if (res.success) {
        await get().fetchItens();
        return { success: true };
      } else {
        throw new Error(res.error);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorItens: message, loadingItens: false });
      return { success: false, error: message };
    }
  },

  alternarStatusItem: async (id: string, current: boolean) => {
    try {
      const res = await toggleItemStatus(id, !current);
      if (res.success) {
        await get().fetchItens();
        return { success: true };
      } else {
        throw new Error(res.error);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorItens: message });
      return { success: false, error: message };
    }
  },

  alternarDestaqueItem: async (id: string, current: boolean) => {
    try {
      const res = await toggleItemDestaque(id, !current);
      if (res.success) {
        await get().fetchItens();
        return { success: true };
      } else {
        throw new Error(res.error);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorItens: message });
      return { success: false, error: message };
    }
  },

  fetchStats: async () => {
    set({ loadingStats: true });
    try {
      const res = await getGaleriaStats();
      if (res.success && res.data) {
        set({ stats: res.data, loadingStats: false });
      } else {
        set({ loadingStats: false });
      }
    } catch (error: unknown) {
      console.error(error);
      set({ loadingStats: false });
    }
  },

  // --- Setters ---
  setFiltrosCategorias: (filtros) =>
    set((state) => ({
      filtrosCategorias: { ...state.filtrosCategorias, ...filtros },
    })),

  setFiltrosItens: (filtros) =>
    set((state) => ({ filtrosItens: { ...state.filtrosItens, ...filtros } })),

  setPaginationCategorias: (pagination) =>
    set((state) => ({
      filtrosCategorias: { ...state.filtrosCategorias, ...pagination },
    })),

  setPaginationItens: (pagination) =>
    set((state) => ({
      filtrosItens: { ...state.filtrosItens, ...pagination },
    })),

  // --- Utils ---
  clearErrorCategorias: () => set({ errorCategorias: null }),
  clearErrorItens: () => set({ errorItens: null }),
  resetFiltrosCategorias: () =>
    set({ filtrosCategorias: initialState.filtrosCategorias }),
  resetFiltrosItens: () => set({ filtrosItens: initialState.filtrosItens }),
}));

// ============================================
// HOOKS EXPORTADOS
// ============================================

export function useCategoriasList() {
  const store = useGaleriaStore(
    useShallow((state) => ({
      categorias: state.categorias,
      loading: state.loadingCategorias,
      error: state.errorCategorias,
      filtros: state.filtrosCategorias,
      fetchCategorias: state.fetchCategorias,
      setFiltros: state.setFiltrosCategorias,
      resetFiltros: state.resetFiltrosCategorias,
      setPagination: state.setPaginationCategorias,
      pagination: {
        page: state.filtrosCategorias.page,
        limit: state.filtrosCategorias.limit,
        total: state.stats?.total_categorias || state.categorias.length,
        totalPages: 1,
      },
    })),
  );
  return store;
}

export function useCategoriaSelecionada() {
  const store = useGaleriaStore(
    useShallow((state) => ({
      categoria: state.categoriaSelecionada,
      loading: state.loadingCategorias,
      error: state.errorCategorias,
      fetchCategoriaPorSlug: state.fetchCategoriaPorSlug,
      clearError: state.clearErrorCategorias,
    })),
  );
  return store;
}

export function useItensList() {
  const store = useGaleriaStore(
    useShallow((state) => ({
      itens: state.itens,
      loading: state.loadingItens,
      error: state.errorItens,
      filtros: state.filtrosItens,
      fetchItens: state.fetchItens,
      setFiltros: state.setFiltrosItens,
      clearError: state.clearErrorItens,
      setPagination: state.setPaginationItens,
      pagination: {
        page: state.filtrosItens.page,
        limit: state.filtrosItens.limit,
        total: state.stats?.total_itens || state.itens.length,
        totalPages: 1,
      },
    })),
  );
  return store;
}

export function useGaleriaStats() {
  const store = useGaleriaStore(
    useShallow((state) => ({
      stats: state.stats,
      loading: state.loadingStats,
      fetchStats: state.fetchStats,
    })),
  );
  return store;
}
