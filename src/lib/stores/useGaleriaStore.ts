"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getCategoriasGaleria,
  getCategoriaPorSlug,
  getItensPorCategoria,
  getEstatisticasGaleria,
  getCategoriasDestaque,
  type ApiResponse,
  type CategoriaComItens,
  type ItemGaleria,
  type EstatisticasGaleria,
  type TipoCategoriaFilter,
} from "@/app/actions/gallery/galeria";

// Tipos baseados nas actions
type SortType = "recent" | "oldest" | "name" | "destaque" | "popular";

interface GalleryFiltersCategorias {
  searchTerm: string;
  tipo: TipoCategoriaFilter;
  sortBy: SortType;
  currentPage: number;
  itemsPerPage: number;
  total: number;
}

interface GalleryFiltersItens {
  searchTerm: string;
  sortBy: SortType;
  destaque: boolean | null;
  currentPage: number;
  itemsPerPage: number;
  total: number;
}

interface GaleriaStore {
  // Estado das categorias
  categorias: CategoriaComItens[];
  loadingCategorias: boolean;
  errorCategorias: string | null;

  // Estado dos itens
  itens: ItemGaleria[];
  loadingItens: boolean;
  errorItens: string | null;
  categoriaAtual: CategoriaComItens | null;

  // Filtros
  filtrosCategorias: GalleryFiltersCategorias;
  filtrosItens: GalleryFiltersItens;

  // Estatísticas
  stats: EstatisticasGaleria | null;

  // Categorias em destaque
  categoriasDestaque: CategoriaComItens[];
  loadingDestaque: boolean;
  errorDestaque: string | null;

  // ==================== ACTIONS ====================

  // Categorias
  fetchCategorias: () => Promise<void>;
  fetchCategoriaPorSlug: (slug: string) => Promise<CategoriaComItens | null>;
  fetchEstatisticas: () => Promise<void>;
  fetchCategoriasDestaque: (limit?: number) => Promise<void>;

  // Itens
  fetchItensPorCategoria: (categoriaId: string) => Promise<void>;

  // Setters Categorias
  setSearchTermCategorias: (term: string) => void;
  setTipoCategorias: (tipo: TipoCategoriaFilter) => void;
  setSortByCategorias: (sortBy: SortType) => void;
  setCurrentPageCategorias: (page: number) => void;
  setItemsPerPageCategorias: (itemsPerPage: number) => void;

  // Setters Itens
  setSearchTermItens: (term: string) => void;
  setSortByItens: (sortBy: SortType) => void;
  setDestaqueItens: (destaque: boolean | null) => void;
  setCurrentPageItens: (page: number) => void;
  setItemsPerPageItens: (itemsPerPage: number) => void;

  // Reset
  resetFiltrosCategorias: () => void;
  resetFiltrosItens: () => void;
  clearItens: () => void;
  clearAll: () => void;
}

// Estado inicial
const filtrosIniciaisCategorias: GalleryFiltersCategorias = {
  searchTerm: "",
  tipo: "all",
  sortBy: "recent",
  currentPage: 1,
  itemsPerPage: 12,
  total: 0,
};

const filtrosIniciaisItens: GalleryFiltersItens = {
  searchTerm: "",
  sortBy: "destaque",
  destaque: null,
  currentPage: 1,
  itemsPerPage: 12,
  total: 0,
};

const initialState = {
  categorias: [],
  loadingCategorias: false,
  errorCategorias: null,

  itens: [],
  loadingItens: false,
  errorItens: null,
  categoriaAtual: null,

  categoriasDestaque: [],
  loadingDestaque: false,
  errorDestaque: null,

  filtrosCategorias: { ...filtrosIniciaisCategorias },
  filtrosItens: { ...filtrosIniciaisItens },

  stats: null,
};

export const useGaleriaStore = create<GaleriaStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==================== ACTIONS IMPLEMENTATION ====================

      fetchCategorias: async () => {
        set({ loadingCategorias: true, errorCategorias: null });

        try {
          const state = get();
          const { searchTerm, tipo, sortBy, currentPage, itemsPerPage } =
            state.filtrosCategorias;

          const result: ApiResponse<CategoriaComItens[]> =
            await getCategoriasGaleria({
              tipo: tipo !== "all" ? tipo : undefined,
              search: searchTerm,
              sortBy,
              limit: itemsPerPage,
              page: currentPage,
            });

          if (!result.success) {
            throw new Error(result.error || "Erro ao buscar categorias");
          }

          set({
            categorias: result.data || [],
            loadingCategorias: false,
            filtrosCategorias: {
              ...state.filtrosCategorias,
              total: result.pagination?.total || 0,
            },
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erro ao carregar categorias";
          set({
            errorCategorias: errorMessage,
            loadingCategorias: false,
          });
        }
      },

      fetchCategoriaPorSlug: async (
        slug: string
      ): Promise<CategoriaComItens | null> => {
        try {
          set({ loadingItens: true, errorItens: null });

          const result: ApiResponse<CategoriaComItens> =
            await getCategoriaPorSlug(slug);

          if (!result.success) {
            set({ errorItens: result.error || "Categoria não encontrada" });
            return null;
          }

          const categoria = result.data;
          if (!categoria) {
            set({ errorItens: "Categoria não encontrada" });
            return null;
          }

          set({
            categoriaAtual: categoria,
            errorItens: null,
            loadingItens: false,
          });

          return categoria;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro ao buscar categoria";
          set({
            errorItens: errorMessage,
            loadingItens: false,
          });
          return null;
        }
      },

      fetchEstatisticas: async (): Promise<void> => {
        try {
          const result: ApiResponse<EstatisticasGaleria> =
            await getEstatisticasGaleria();

          if (result.success && result.data) {
            set({ stats: result.data });
          }
        } catch (error) {
          console.error("Erro ao buscar estatísticas:", error);
        }
      },

      fetchCategoriasDestaque: async (limit: number = 3): Promise<void> => {
        set({ loadingDestaque: true, errorDestaque: null });

        try {
          const result: ApiResponse<CategoriaComItens[]> =
            await getCategoriasDestaque(limit);

          if (!result.success) {
            throw new Error(
              result.error || "Erro ao buscar categorias em destaque"
            );
          }

          set({
            categoriasDestaque: result.data || [],
            loadingDestaque: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erro ao carregar destaques";
          set({
            errorDestaque: errorMessage,
            loadingDestaque: false,
          });
        }
      },

      fetchItensPorCategoria: async (categoriaId: string) => {
        set({ loadingItens: true, errorItens: null });

        try {
          const state = get();
          const { searchTerm, sortBy, destaque, currentPage, itemsPerPage } =
            state.filtrosItens;

          const result: ApiResponse<ItemGaleria[]> = await getItensPorCategoria(
            categoriaId,
            {
              search: searchTerm,
              sortBy,
              destaque,
              limit: itemsPerPage,
              page: currentPage,
            }
          );

          if (!result.success) {
            throw new Error(result.error || "Erro ao buscar itens");
          }

          set({
            itens: result.data || [],
            loadingItens: false,
            filtrosItens: {
              ...state.filtrosItens,
              total: result.pagination?.total || 0,
            },
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro ao carregar itens";
          set({
            errorItens: errorMessage,
            loadingItens: false,
          });
        }
      },

      // ==================== SETTERS ====================

      setSearchTermCategorias: (term: string) => {
        set((state) => ({
          filtrosCategorias: {
            ...state.filtrosCategorias,
            searchTerm: term,
            currentPage: 1,
          },
        }));
      },

      setTipoCategorias: (tipo: TipoCategoriaFilter) => {
        set((state) => ({
          filtrosCategorias: {
            ...state.filtrosCategorias,
            tipo,
            currentPage: 1,
          },
        }));
      },

      setSortByCategorias: (sortBy: SortType) => {
        set((state) => ({
          filtrosCategorias: {
            ...state.filtrosCategorias,
            sortBy,
            currentPage: 1,
          },
        }));
      },

      setCurrentPageCategorias: (page: number) => {
        set((state) => ({
          filtrosCategorias: {
            ...state.filtrosCategorias,
            currentPage: page,
          },
        }));
      },

      setItemsPerPageCategorias: (itemsPerPage: number) => {
        set((state) => ({
          filtrosCategorias: {
            ...state.filtrosCategorias,
            itemsPerPage,
            currentPage: 1,
          },
        }));
      },

      setSearchTermItens: (term: string) => {
        set((state) => ({
          filtrosItens: {
            ...state.filtrosItens,
            searchTerm: term,
            currentPage: 1,
          },
        }));
      },

      setSortByItens: (sortBy: SortType) => {
        set((state) => ({
          filtrosItens: {
            ...state.filtrosItens,
            sortBy,
            currentPage: 1,
          },
        }));
      },

      setDestaqueItens: (destaque: boolean | null) => {
        set((state) => ({
          filtrosItens: {
            ...state.filtrosItens,
            destaque,
            currentPage: 1,
          },
        }));
      },

      setCurrentPageItens: (page: number) => {
        set((state) => ({
          filtrosItens: {
            ...state.filtrosItens,
            currentPage: page,
          },
        }));
      },

      setItemsPerPageItens: (itemsPerPage: number) => {
        set((state) => ({
          filtrosItens: {
            ...state.filtrosItens,
            itemsPerPage,
            currentPage: 1,
          },
        }));
      },

      // ==================== RESET ====================

      resetFiltrosCategorias: () => {
        set({
          filtrosCategorias: { ...filtrosIniciaisCategorias },
        });
      },

      resetFiltrosItens: () => {
        set({
          filtrosItens: { ...filtrosIniciaisItens },
        });
      },

      clearItens: () => {
        set({
          itens: [],
          categoriaAtual: null,
          loadingItens: false,
          errorItens: null,
          filtrosItens: { ...filtrosIniciaisItens },
        });
      },

      clearAll: () => {
        set(initialState);
      },
    }),
    {
      name: "galeria-store",
      partialize: (state) => ({
        filtrosCategorias: state.filtrosCategorias,
        filtrosItens: state.filtrosItens,
      }),
    }
  )
);
