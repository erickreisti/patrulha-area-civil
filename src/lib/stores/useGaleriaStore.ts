"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

// --- IMPORTS DAS ACTIONS ---
import {
  getCategoriasAdmin,
  getCategoriaPorSlug,
  createCategoria,
  toggleCategoriaStatus,
  deleteCategoria,
  getPublicCategorias,
} from "@/app/actions/gallery/categorias";

import {
  getItensAdmin,
  createItem,
  toggleItemStatus,
  toggleItemDestaque,
  deleteItem,
  getPublicItens,
} from "@/app/actions/gallery/itens";

import { getGaleriaStats } from "@/app/actions/gallery/stats";

// --- TIPOS ---
import type {
  Categoria,
  Item,
  GaleriaStats,
  CreateCategoriaInput,
  TipoCategoriaFilter,
  TipoItemFilter,
  StatusFilter,
  DestaqueFilter,
  ListItensSchema,
} from "@/app/actions/gallery/types";
import { z } from "zod";

// ============================================
// TIPOS AUXILIARES
// ============================================

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationData;
}

// Tipagem forçada para funções de toggle
type ToggleFunction = (id: string) => Promise<ActionResponse<void>>;

// ============================================
// STATE DO STORE
// ============================================

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

  // --- Filtros Admin ---
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

  // --- Filtros Públicos ---
  filtrosPublicos: {
    categoriaSlug: string | "all";
    page: number;
    limit: number;
  };

  // --- Paginações ---
  paginationCategorias: PaginationData;
  paginationItens: PaginationData;
  paginationPublica: PaginationData;

  // --- Actions ---
  fetchCategoriasAdmin: () => Promise<void>;
  fetchCategoriasPublicas: () => Promise<void>;
  fetchCategoriaPorSlug: (slug: string) => Promise<void>;
  criarCategoria: (
    data: CreateCategoriaInput,
  ) => Promise<{ success: boolean; error?: string }>;
  alternarStatusCategoria: (
    id: string,
    current: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  deletarCategoria: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;

  fetchItensAdmin: () => Promise<void>;
  fetchItensPublicos: () => Promise<void>;
  criarItem: (data: FormData) => Promise<{ success: boolean; error?: string }>;
  deletarItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  alternarStatusItem: (
    id: string,
    current: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  alternarDestaqueItem: (
    id: string,
    current: boolean,
  ) => Promise<{ success: boolean; error?: string }>;

  fetchStats: () => Promise<void>;

  // --- Setters ---
  setFiltrosCategorias: (
    filtros: Partial<GaleriaStore["filtrosCategorias"]>,
  ) => void;
  setFiltrosItens: (filtros: Partial<GaleriaStore["filtrosItens"]>) => void;
  setFiltrosPublicos: (
    filtros: Partial<GaleriaStore["filtrosPublicos"]>,
  ) => void;
  setPaginationCategorias: (pagination: Partial<PaginationData>) => void;
  setPaginationItens: (pagination: Partial<PaginationData>) => void;
  setPaginationPublica: (pagination: Partial<PaginationData>) => void;

  // --- Utils ---
  clearErrorCategorias: () => void;
  clearErrorItens: () => void;
  resetFiltrosCategorias: () => void;
  resetFiltrosItens: () => void;
}

const initialPagination: PaginationData = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
};

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
  filtrosPublicos: { categoriaSlug: "all", page: 1, limit: 12 },
  paginationCategorias: { ...initialPagination },
  paginationItens: { ...initialPagination },
  paginationPublica: { ...initialPagination },
};

export const useGaleriaStore = create<GaleriaStore>((set, get) => ({
  ...initialState,

  // --- Actions Categorias ---
  fetchCategoriasAdmin: async () => {
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
        set({
          categorias: res.data,
          paginationCategorias: res.pagination
            ? { ...res.pagination }
            : { ...initialPagination },
          loadingCategorias: false,
        });
      } else {
        throw new Error(res.error || "Erro ao buscar categorias");
      }
    } catch (error) {
      set({
        errorCategorias:
          error instanceof Error ? error.message : "Erro desconhecido",
        loadingCategorias: false,
      });
    }
  },

  fetchCategoriasPublicas: async () => {
    set({ loadingCategorias: true, errorCategorias: null });
    try {
      const res = await getPublicCategorias();
      if (res.success && res.data) {
        set({ categorias: res.data, loadingCategorias: false });
      } else {
        throw new Error(res.error || "Erro ao buscar categorias públicas");
      }
    } catch (error) {
      set({
        errorCategorias:
          error instanceof Error ? error.message : "Erro desconhecido",
        loadingCategorias: false,
      });
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
    } catch (error) {
      set({
        errorCategorias:
          error instanceof Error ? error.message : "Erro desconhecido",
        loadingCategorias: false,
      });
    }
  },

  criarCategoria: async (data: CreateCategoriaInput) => {
    set({ loadingCategorias: true, errorCategorias: null });
    try {
      const res = await createCategoria(data);
      if (res.success) {
        await get().fetchCategoriasAdmin();
        return { success: true };
      }
      throw new Error(res.error || "Erro ao criar categoria");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorCategorias: msg, loadingCategorias: false });
      return { success: false, error: msg };
    }
  },

  alternarStatusCategoria: async (id: string, current: boolean) => {
    set({ loadingCategorias: true });
    try {
      const res = await toggleCategoriaStatus(id, !current);
      if (res.success) {
        await get().fetchCategoriasAdmin();
        set({ loadingCategorias: false });
        return { success: true };
      }
      throw new Error(res.error);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorCategorias: msg, loadingCategorias: false });
      return { success: false, error: msg };
    }
  },

  deletarCategoria: async (id: string) => {
    try {
      const res = await deleteCategoria(id);
      if (res.success) {
        await get().fetchCategoriasAdmin();
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  },

  // --- Actions Itens ---
  fetchItensAdmin: async () => {
    set({ loadingItens: true, errorItens: null });
    try {
      const { filtrosItens } = get();
      const filters: Partial<z.infer<typeof ListItensSchema>> = {
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
      };

      const res = await getItensAdmin(filters);

      if (res.success && res.data) {
        set({
          itens: res.data,
          paginationItens: res.pagination
            ? { ...res.pagination }
            : { ...initialPagination },
          loadingItens: false,
        });
      } else {
        throw new Error(res.error || "Erro ao buscar itens");
      }
    } catch (error) {
      set({
        errorItens:
          error instanceof Error ? error.message : "Erro desconhecido",
        loadingItens: false,
      });
    }
  },

  fetchItensPublicos: async () => {
    set({ loadingItens: true, errorItens: null });
    try {
      const { filtrosPublicos } = get();

      const slug =
        filtrosPublicos.categoriaSlug !== "all"
          ? filtrosPublicos.categoriaSlug
          : undefined;

      // Definição explícita do tipo para evitar 'any'
      type PublicItensParams = {
        page: number;
        limit: number;
        slug?: string;
      };

      const params: PublicItensParams = {
        page: filtrosPublicos.page,
        limit: filtrosPublicos.limit,
        slug: slug,
      };

      // @ts-expect-error - Ajuste temporário até a Action ser atualizada para aceitar objeto
      const res = (await getPublicItens(params)) as ActionResponse<Item[]>;

      if (res.success && res.data) {
        set({
          itens: res.data,
          paginationPublica: res.pagination
            ? { ...res.pagination }
            : { ...initialPagination },
          loadingItens: false,
        });
      } else {
        throw new Error(res.error || "Erro ao buscar itens públicos");
      }
    } catch (error) {
      set({
        errorItens:
          error instanceof Error ? error.message : "Erro desconhecido",
        loadingItens: false,
      });
    }
  },

  criarItem: async (data: FormData) => {
    set({ loadingItens: true, errorItens: null });
    try {
      const res = await createItem(data);
      if (res.success) {
        await get().fetchItensAdmin();
        return { success: true };
      }
      throw new Error(res.error);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorItens: msg, loadingItens: false });
      return { success: false, error: msg };
    }
  },

  alternarStatusItem: async (id: string, current: boolean) => {
    try {
      const safeToggle = toggleItemStatus as unknown as ToggleFunction;
      const res = await safeToggle(id);
      if (res.success) {
        set((state) => ({
          itens: state.itens.map((i) =>
            i.id === id ? { ...i, status: !current } : i,
          ),
        }));
        return { success: true };
      }
      throw new Error(res.error || "Erro ao alternar status");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorItens: msg });
      return { success: false, error: msg };
    }
  },

  alternarDestaqueItem: async (id: string, current: boolean) => {
    try {
      const safeToggle = toggleItemDestaque as unknown as ToggleFunction;
      const res = await safeToggle(id);
      if (res.success) {
        set((state) => ({
          itens: state.itens.map((i) =>
            i.id === id ? { ...i, destaque: !current } : i,
          ),
        }));
        return { success: true };
      }
      throw new Error(res.error || "Erro ao alternar destaque");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      set({ errorItens: msg });
      return { success: false, error: msg };
    }
  },

  deletarItem: async (id: string) => {
    try {
      const res = await deleteItem(id);
      if (res.success) {
        await get().fetchItensAdmin();
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro",
      };
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
    } catch (error) {
      console.error(error);
      set({ loadingStats: false });
    }
  },

  // --- Setters ---
  setFiltrosCategorias: (filtros) =>
    set((state) => ({
      filtrosCategorias: {
        ...state.filtrosCategorias,
        ...filtros,
        page: filtros.page !== undefined ? filtros.page : 1,
      },
    })),
  setFiltrosItens: (filtros) =>
    set((state) => ({
      filtrosItens: {
        ...state.filtrosItens,
        ...filtros,
        page: filtros.page !== undefined ? filtros.page : 1,
      },
    })),
  setFiltrosPublicos: (filtros) =>
    set((state) => ({
      filtrosPublicos: { ...state.filtrosPublicos, ...filtros },
    })),
  setPaginationCategorias: (pagination) =>
    set((state) => ({
      filtrosCategorias: { ...state.filtrosCategorias, ...pagination },
      paginationCategorias: { ...state.paginationCategorias, ...pagination },
    })),
  setPaginationItens: (pagination) =>
    set((state) => ({
      filtrosItens: { ...state.filtrosItens, ...pagination },
      paginationItens: { ...state.paginationItens, ...pagination },
    })),
  setPaginationPublica: (pagination) =>
    set((state) => ({
      paginationPublica: { ...state.paginationPublica, ...pagination },
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

export function useCategoriasAdmin() {
  return useGaleriaStore(
    useShallow((state) => ({
      categorias: state.categorias,
      loading: state.loadingCategorias,
      error: state.errorCategorias,
      filtros: state.filtrosCategorias,
      pagination: state.paginationCategorias,
      setPagination: state.setPaginationCategorias,
      fetchCategorias: state.fetchCategoriasAdmin,
      setFiltros: state.setFiltrosCategorias,
      resetFiltros: state.resetFiltrosCategorias,
      createCategoria: state.criarCategoria,
      toggleStatus: state.alternarStatusCategoria,
      deleteCategoria: state.deletarCategoria,
    })),
  );
}

export function useItensAdmin() {
  return useGaleriaStore(
    useShallow((state) => ({
      itens: state.itens,
      categorias: state.categorias,
      loading: state.loadingItens,
      error: state.errorItens,
      filtros: state.filtrosItens,
      pagination: state.paginationItens,
      setPagination: state.setPaginationItens,
      resetFiltros: state.resetFiltrosItens,
      fetchItens: state.fetchItensAdmin,
      fetchCategorias: state.fetchCategoriasAdmin,
      setFiltros: state.setFiltrosItens,
      clearError: state.clearErrorItens,
      createItem: state.criarItem,
      deleteItem: state.deletarItem,
      toggleStatus: state.alternarStatusItem,
      toggleDestaque: state.alternarDestaqueItem,
    })),
  );
}

export function useGaleriaPublica() {
  return useGaleriaStore(
    useShallow((state) => ({
      categorias: state.categorias,
      itens: state.itens,
      loading: state.loadingItens || state.loadingCategorias,
      error: state.errorItens || state.errorCategorias,
      filtros: state.filtrosPublicos,
      pagination: state.paginationPublica,
      setPagination: state.setPaginationPublica,
      fetchCategorias: state.fetchCategoriasPublicas,
      fetchItens: state.fetchItensPublicos,
      setFiltros: state.setFiltrosPublicos,
    })),
  );
}

export function useGaleriaDetalhe() {
  return useGaleriaStore(
    useShallow((state) => ({
      categoria: state.categoriaSelecionada,
      itens: state.itens,
      loading: state.loadingItens || state.loadingCategorias,
      error: state.errorItens || state.errorCategorias,
      pagination: state.paginationPublica,
      fetchCategoria: state.fetchCategoriaPorSlug,
      fetchItens: state.fetchItensPublicos,
      setFiltros: state.setFiltrosPublicos,
      setPagination: state.setPaginationPublica,
      clearError: () => {
        state.clearErrorItens();
        state.clearErrorCategorias();
      },
    })),
  );
}

export function useGaleriaStats() {
  return useGaleriaStore(
    useShallow((state) => ({
      stats: state.stats,
      loading: state.loadingStats,
      fetchStats: state.fetchStats,
    })),
  );
}
