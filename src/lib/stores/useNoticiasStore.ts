import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  NoticiaLista,
  NoticiaComAutor,
  NewsStats,
} from "@/app/actions/news/noticias";

// Re-exportar tipos das actions para uso nos componentes
export type {
  NoticiaLista,
  NoticiaComAutor,
  NewsStats,
  ApiResponse,
} from "@/app/actions/news/noticias";

// Tipos do store
export type SortBy = "recent" | "oldest" | "destaque" | "popular";

interface NoticiasFiltros {
  searchTerm: string;
  categoria: string;
  sortBy: SortBy;
  itemsPerPage: number;
  currentPage: number;
}

interface NoticiasState {
  // Estado
  noticias: NoticiaLista[];
  noticiaDetalhe: NoticiaComAutor | null;
  noticiasRelacionadas: NoticiaLista[];
  categoriasDisponiveis: Array<{ value: string; label: string }>;
  stats: NewsStats;

  // Estados de loading
  loadingLista: boolean;
  loadingDetalhe: boolean;
  loadingRelacionadas: boolean;

  // Filtros
  filtros: NoticiasFiltros;
  totalCount: number;

  // Ações
  setSearchTerm: (term: string) => void;
  setCategoria: (categoria: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setCurrentPage: (currentPage: number) => void;
  clearFilters: () => void;

  // Data setters
  setNoticias: (noticias: NoticiaLista[]) => void;
  setNoticiaDetalhe: (noticia: NoticiaComAutor | null) => void;
  setNoticiasRelacionadas: (noticias: NoticiaLista[]) => void;
  setCategoriasDisponiveis: (
    categorias: Array<{ value: string; label: string }>
  ) => void;
  setStats: (stats: NewsStats) => void;
  setTotalCount: (count: number) => void;

  // Loading setters
  setLoadingLista: (loading: boolean) => void;
  setLoadingDetalhe: (loading: boolean) => void;
  setLoadingRelacionadas: (loading: boolean) => void;

  // Funções de limpeza
  clearNoticiaDetalhe: () => void;
  clearNoticiasRelacionadas: () => void;
}

// Apenas os valores iniciais (sem as funções)
const initialValues: {
  noticias: NoticiaLista[];
  noticiaDetalhe: NoticiaComAutor | null;
  noticiasRelacionadas: NoticiaLista[];
  categoriasDisponiveis: Array<{ value: string; label: string }>;
  stats: NewsStats;
  loadingLista: boolean;
  loadingDetalhe: boolean;
  loadingRelacionadas: boolean;
  filtros: NoticiasFiltros;
  totalCount: number;
} = {
  noticias: [],
  noticiaDetalhe: null,
  noticiasRelacionadas: [],
  categoriasDisponiveis: [{ value: "all", label: "Todas categorias" }],
  stats: {
    total: 0,
    published: 0,
    recent: 0,
    featured: 0,
    canViewStats: false,
  },
  loadingLista: true,
  loadingDetalhe: false,
  loadingRelacionadas: false,
  filtros: {
    searchTerm: "",
    categoria: "all",
    sortBy: "recent",
    itemsPerPage: 8,
    currentPage: 1,
  },
  totalCount: 0,
};

export const useNoticiasStore = create<NoticiasState>()(
  persist(
    (set) => ({
      ...initialValues,

      // Setters de filtros
      setSearchTerm: (searchTerm) =>
        set((state) => ({
          filtros: { ...state.filtros, searchTerm, currentPage: 1 },
        })),

      setCategoria: (categoria) =>
        set((state) => ({
          filtros: { ...state.filtros, categoria, currentPage: 1 },
        })),

      setSortBy: (sortBy) =>
        set((state) => ({
          filtros: { ...state.filtros, sortBy, currentPage: 1 },
        })),

      setItemsPerPage: (itemsPerPage) =>
        set((state) => ({
          filtros: { ...state.filtros, itemsPerPage, currentPage: 1 },
        })),

      setCurrentPage: (currentPage) =>
        set((state) => ({
          filtros: { ...state.filtros, currentPage },
        })),

      clearFilters: () =>
        set({
          filtros: initialValues.filtros,
        }),

      // Setters de dados
      setNoticias: (noticias) => set({ noticias }),

      setNoticiaDetalhe: (noticiaDetalhe) => set({ noticiaDetalhe }),

      setNoticiasRelacionadas: (noticiasRelacionadas) =>
        set({ noticiasRelacionadas }),

      setCategoriasDisponiveis: (categoriasDisponiveis) =>
        set({ categoriasDisponiveis }),

      setStats: (stats) => set({ stats }),

      setTotalCount: (totalCount) => set({ totalCount }),

      // Setters de loading
      setLoadingLista: (loadingLista) => set({ loadingLista }),

      setLoadingDetalhe: (loadingDetalhe) => set({ loadingDetalhe }),

      setLoadingRelacionadas: (loadingRelacionadas) =>
        set({ loadingRelacionadas }),

      // Funções de limpeza
      clearNoticiaDetalhe: () => set({ noticiaDetalhe: null }),

      clearNoticiasRelacionadas: () => set({ noticiasRelacionadas: [] }),
    }),
    {
      name: "noticias-storage",
      partialize: (state) => ({
        filtros: state.filtros,
        stats: state.stats,
      }),
    }
  )
);
