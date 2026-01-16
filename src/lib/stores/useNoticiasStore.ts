"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { useState, useEffect, useRef } from "react";
import type {
  NoticiaLista,
  NoticiaComAutor,
  NewsStats,
  ApiResponse,
  ListNoticiasInput,
  CreateNoticiaInput,
  UpdateNoticiaInput,
} from "@/app/actions/news/noticias";

// Re-exportar tipos
export type {
  NoticiaLista,
  NoticiaComAutor,
  NewsStats,
  ApiResponse,
  CreateNoticiaInput,
  UpdateNoticiaInput,
} from "@/app/actions/news/noticias";

// Tipos do store
export type SortBy = "data_publicacao" | "created_at" | "views" | "titulo";
export type NoticiaStatus = "rascunho" | "publicado" | "arquivado";

interface NoticiasFiltros {
  searchTerm: string;
  categoria: string;
  sortBy: SortBy;
  sortOrder: "asc" | "desc";
  itemsPerPage: number;
  currentPage: number;
  status: NoticiaStatus | "all";
  destaque: "all" | "destaque" | "normal";
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
  loadingStats: boolean;
  saving: boolean;
  error: string | null;

  // Filtros e paginação
  filtros: NoticiasFiltros;
  totalCount: number;

  // Ações
  // Setters de filtros
  setSearchTerm: (term: string) => void;
  setCategoria: (categoria: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setCurrentPage: (currentPage: number) => void;
  setStatus: (status: NoticiaStatus | "all") => void;
  setDestaque: (destaque: "all" | "destaque" | "normal") => void;
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
  setLoadingStats: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;

  // Funções de limpeza
  clearNoticiaDetalhe: () => void;
  clearNoticiasRelacionadas: () => void;

  // Ações de API
  fetchNoticias: (filters?: Partial<ListNoticiasInput>) => Promise<void>;
  fetchNoticiaDetalhe: (idOrSlug: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchCategorias: () => Promise<void>;

  // Ações de CRUD
  criarNoticia: (
    data: CreateNoticiaInput
  ) => Promise<ApiResponse<NoticiaComAutor>>;
  atualizarNoticia: (
    id: string,
    data: Partial<UpdateNoticiaInput>
  ) => Promise<ApiResponse<NoticiaComAutor>>;
  deletarNoticia: (id: string) => Promise<ApiResponse<void>>;
  toggleStatus: (
    id: string,
    currentStatus: NoticiaStatus
  ) => Promise<ApiResponse<void>>;
  toggleDestaque: (
    id: string,
    currentDestaque: boolean
  ) => Promise<ApiResponse<void>>;
}

// Valores iniciais
const initialValues = {
  noticias: [],
  noticiaDetalhe: null,
  noticiasRelacionadas: [],
  categoriasDisponiveis: [{ value: "all", label: "Todas categorias" }],
  stats: {
    total: 0,
    published: 0,
    recent: 0,
    featured: 0,
    rascunho: 0,
    arquivado: 0,
    canViewStats: false,
  },

  loadingLista: false,
  loadingDetalhe: false,
  loadingRelacionadas: false,
  loadingStats: false,
  saving: false,
  error: null,

  filtros: {
    searchTerm: "",
    categoria: "all",
    sortBy: "data_publicacao" as SortBy,
    sortOrder: "desc" as "asc" | "desc",
    itemsPerPage: 20,
    currentPage: 1,
    status: "all" as NoticiaStatus | "all",
    destaque: "all" as "all" | "destaque" | "normal",
  },
  totalCount: 0,
};

// Criação do store
export const useNoticiasStore = create<NoticiasState>()(
  persist(
    (set, get) => ({
      ...initialValues,

      // Setters de filtros
      setSearchTerm: (searchTerm: string) =>
        set((state) => ({
          filtros: { ...state.filtros, searchTerm, currentPage: 1 },
        })),

      setCategoria: (categoria: string) =>
        set((state) => ({
          filtros: { ...state.filtros, categoria, currentPage: 1 },
        })),

      setSortBy: (sortBy: SortBy) =>
        set((state) => ({
          filtros: { ...state.filtros, sortBy, currentPage: 1 },
        })),

      setSortOrder: (sortOrder: "asc" | "desc") =>
        set((state) => ({
          filtros: { ...state.filtros, sortOrder, currentPage: 1 },
        })),

      setItemsPerPage: (itemsPerPage: number) =>
        set((state) => ({
          filtros: { ...state.filtros, itemsPerPage, currentPage: 1 },
        })),

      setCurrentPage: (currentPage: number) =>
        set((state) => ({
          filtros: { ...state.filtros, currentPage },
        })),

      setStatus: (status: NoticiaStatus | "all") =>
        set((state) => ({
          filtros: { ...state.filtros, status, currentPage: 1 },
        })),

      setDestaque: (destaque: "all" | "destaque" | "normal") =>
        set((state) => ({
          filtros: { ...state.filtros, destaque, currentPage: 1 },
        })),

      clearFilters: () =>
        set({
          filtros: initialValues.filtros,
        }),

      // Setters de dados
      setNoticias: (noticias: NoticiaLista[]) => set({ noticias }),

      setNoticiaDetalhe: (noticiaDetalhe: NoticiaComAutor | null) =>
        set({ noticiaDetalhe }),

      setNoticiasRelacionadas: (noticiasRelacionadas: NoticiaLista[]) =>
        set({ noticiasRelacionadas }),

      setCategoriasDisponiveis: (
        categoriasDisponiveis: Array<{ value: string; label: string }>
      ) => set({ categoriasDisponiveis }),

      setStats: (stats: NewsStats) => set({ stats }),

      setTotalCount: (totalCount: number) => set({ totalCount }),

      // Setters de loading
      setLoadingLista: (loadingLista: boolean) => set({ loadingLista }),

      setLoadingDetalhe: (loadingDetalhe: boolean) => set({ loadingDetalhe }),

      setLoadingRelacionadas: (loadingRelacionadas: boolean) =>
        set({ loadingRelacionadas }),

      setLoadingStats: (loadingStats: boolean) => set({ loadingStats }),

      setSaving: (saving: boolean) => set({ saving }),

      setError: (error: string | null) => set({ error }),

      // Funções de limpeza
      clearNoticiaDetalhe: () => set({ noticiaDetalhe: null }),

      clearNoticiasRelacionadas: () => set({ noticiasRelacionadas: [] }),

      // Ações de API
      fetchNoticias: async (filters?: Partial<ListNoticiasInput>) => {
        try {
          set({ loadingLista: true, error: null });

          // Importar dinamicamente para evitar problemas de SSR
          const { getNews } = await import("@/app/actions/news/noticias");

          const { filtros } = get();
          const mergedFilters = { ...filtros, ...filters };

          const result = await getNews(mergedFilters);

          if (result.success) {
            set({
              noticias: result.data || [],
              totalCount: result.pagination?.total || 0,
              loadingLista: false,
            });
          } else {
            throw new Error(result.error || "Erro ao buscar notícias");
          }
        } catch (error) {
          console.error("❌ Erro no fetchNoticias:", error);
          set({
            error: error instanceof Error ? error.message : "Erro desconhecido",
            loadingLista: false,
          });
        }
      },

      fetchNoticiaDetalhe: async (idOrSlug: string) => {
        try {
          set({ loadingDetalhe: true, error: null });

          const { getNoticiaById } = await import(
            "@/app/actions/news/noticias"
          );

          const result = await getNoticiaById(idOrSlug);

          if (result.success && result.data) {
            set({ noticiaDetalhe: result.data, loadingDetalhe: false });
          } else {
            throw new Error(result.error || "Notícia não encontrada");
          }
        } catch (error) {
          console.error("❌ Erro no fetchNoticiaDetalhe:", error);
          set({
            error:
              error instanceof Error ? error.message : "Erro ao buscar notícia",
            loadingDetalhe: false,
          });
        }
      },

      fetchStats: async () => {
        try {
          set({ loadingStats: true, error: null });

          const { getNewsStats } = await import("@/app/actions/news/noticias");

          const result = await getNewsStats();

          if (result.success) {
            set({
              stats: result.data || initialValues.stats,
              loadingStats: false,
            });
          } else {
            throw new Error(result.error || "Erro ao buscar estatísticas");
          }
        } catch (error) {
          console.error("❌ Erro no fetchStats:", error);
          set({ loadingStats: false });
        }
      },

      fetchCategorias: async () => {
        try {
          const { getCategoriasNoticias } = await import(
            "@/app/actions/news/noticias"
          );

          const result = await getCategoriasNoticias();

          if (result.success) {
            set({
              categoriasDisponiveis:
                result.data || initialValues.categoriasDisponiveis,
            });
          }
        } catch (error) {
          console.error("❌ Erro no fetchCategorias:", error);
        }
      },

      // Ações de CRUD
      criarNoticia: async (
        data: CreateNoticiaInput
      ): Promise<ApiResponse<NoticiaComAutor>> => {
        try {
          set({ saving: true, error: null });

          const { criarNoticia: criarNoticiaAction } = await import(
            "@/app/actions/news/noticias"
          );

          const result = await criarNoticiaAction(data);

          if (result.success) {
            set({ saving: false });
            // Recarregar notícias
            await get().fetchNoticias();
            await get().fetchStats();
          } else {
            throw new Error(result.error || "Erro ao criar notícia");
          }

          return result;
        } catch (error) {
          console.error("❌ Erro no criarNoticia:", error);
          set({
            error:
              error instanceof Error ? error.message : "Erro ao criar notícia",
            saving: false,
          });

          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Erro ao criar notícia",
          };
        }
      },

      atualizarNoticia: async (
        id: string,
        data: Partial<UpdateNoticiaInput>
      ): Promise<ApiResponse<NoticiaComAutor>> => {
        try {
          set({ saving: true, error: null });

          const { atualizarNoticia: atualizarNoticiaAction } = await import(
            "@/app/actions/news/noticias"
          );

          const result = await atualizarNoticiaAction(id, data);

          if (result.success) {
            set({ saving: false });
            // Atualizar notícia na lista se existir
            const { noticias } = get();
            const updatedNoticias = noticias.map((noticia) =>
              noticia.id === id ? { ...noticia, ...data } : noticia
            );
            set({ noticias: updatedNoticias });
          } else {
            throw new Error(result.error || "Erro ao atualizar notícia");
          }

          return result;
        } catch (error) {
          console.error("❌ Erro no atualizarNoticia:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Erro ao atualizar notícia",
            saving: false,
          });

          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Erro ao atualizar notícia",
          };
        }
      },

      deletarNoticia: async (id: string): Promise<ApiResponse<void>> => {
        try {
          set({ saving: true, error: null });

          const { deletarNoticia: deletarNoticiaAction } = await import(
            "@/app/actions/news/noticias"
          );

          const result = await deletarNoticiaAction(id);

          if (result.success) {
            set({ saving: false });
            // Remover notícia da lista
            const { noticias } = get();
            const filteredNoticias = noticias.filter(
              (noticia) => noticia.id !== id
            );
            set({ noticias: filteredNoticias });
            // Recarregar estatísticas
            await get().fetchStats();
          } else {
            throw new Error(result.error || "Erro ao excluir notícia");
          }

          return result;
        } catch (error) {
          console.error("❌ Erro no deletarNoticia:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Erro ao excluir notícia",
            saving: false,
          });

          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Erro ao excluir notícia",
          };
        }
      },

      toggleStatus: async (
        id: string,
        currentStatus: NoticiaStatus
      ): Promise<ApiResponse<void>> => {
        try {
          set({ saving: true, error: null });

          const { publicarNoticia, arquivarNoticia } = await import(
            "@/app/actions/news/noticias"
          );

          let result: ApiResponse<void>;
          if (currentStatus === "rascunho") {
            result = await publicarNoticia(id);
          } else if (currentStatus === "publicado") {
            result = await arquivarNoticia(id);
          } else {
            result = await publicarNoticia(id);
          }

          if (result.success) {
            set({ saving: false });
            // Recarregar notícias
            await get().fetchNoticias();
            await get().fetchStats();
          } else {
            throw new Error(result.error || "Erro ao alterar status");
          }

          return result;
        } catch (error) {
          console.error("❌ Erro no toggleStatus:", error);
          set({
            error:
              error instanceof Error ? error.message : "Erro ao alterar status",
            saving: false,
          });

          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Erro ao alterar status",
          };
        }
      },

      toggleDestaque: async (
        id: string,
        currentDestaque: boolean
      ): Promise<ApiResponse<void>> => {
        try {
          set({ saving: true, error: null });

          const { toggleDestaque: toggleDestaqueAction } = await import(
            "@/app/actions/news/noticias"
          );

          const result = await toggleDestaqueAction(id, currentDestaque);

          if (result.success) {
            set({ saving: false });
            // Atualizar notícia na lista
            const { noticias } = get();
            const updatedNoticias = noticias.map((noticia) =>
              noticia.id === id
                ? { ...noticia, destaque: !currentDestaque }
                : noticia
            );
            set({ noticias: updatedNoticias });
          } else {
            throw new Error(result.error || "Erro ao alterar destaque");
          }

          return result;
        } catch (error) {
          console.error("❌ Erro no toggleDestaque:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Erro ao alterar destaque",
            saving: false,
          });

          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Erro ao alterar destaque",
          };
        }
      },
    }),
    {
      name: "noticias-storage",
      partialize: (state) => ({
        filtros: state.filtros,
        stats: state.stats,
        categoriasDisponiveis: state.categoriasDisponiveis,
      }),
    }
  )
);

// Hook para uso nos componentes
export function useNoticias() {
  const {
    noticias,
    noticiaDetalhe,
    noticiasRelacionadas,
    categoriasDisponiveis,
    stats,
    loadingLista,
    loadingDetalhe,
    loadingRelacionadas,
    loadingStats,
    saving,
    error,
    filtros,
    totalCount,

    // Setters
    setSearchTerm,
    setCategoria,
    setSortBy,
    setSortOrder,
    setItemsPerPage,
    setCurrentPage,
    setStatus,
    setDestaque,
    clearFilters,

    // Data setters
    setNoticias,
    setNoticiaDetalhe,
    setNoticiasRelacionadas,
    setCategoriasDisponiveis,
    setStats,
    setTotalCount,

    // Loading setters
    setLoadingLista,
    setLoadingDetalhe,
    setLoadingRelacionadas,
    setLoadingStats,
    setSaving,
    setError,

    // Funções de limpeza
    clearNoticiaDetalhe,
    clearNoticiasRelacionadas,

    // Ações de API
    fetchNoticias,
    fetchNoticiaDetalhe,
    fetchStats,
    fetchCategorias,

    // Ações de CRUD
    criarNoticia,
    atualizarNoticia,
    deletarNoticia,
    toggleStatus,
    toggleDestaque,
  } = useNoticiasStore(
    useShallow((state) => ({
      noticias: state.noticias,
      noticiaDetalhe: state.noticiaDetalhe,
      noticiasRelacionadas: state.noticiasRelacionadas,
      categoriasDisponiveis: state.categoriasDisponiveis,
      stats: state.stats,
      loadingLista: state.loadingLista,
      loadingDetalhe: state.loadingDetalhe,
      loadingRelacionadas: state.loadingRelacionadas,
      loadingStats: state.loadingStats,
      saving: state.saving,
      error: state.error,
      filtros: state.filtros,
      totalCount: state.totalCount,

      // Setters
      setSearchTerm: state.setSearchTerm,
      setCategoria: state.setCategoria,
      setSortBy: state.setSortBy,
      setSortOrder: state.setSortOrder,
      setItemsPerPage: state.setItemsPerPage,
      setCurrentPage: state.setCurrentPage,
      setStatus: state.setStatus,
      setDestaque: state.setDestaque,
      clearFilters: state.clearFilters,

      // Data setters
      setNoticias: state.setNoticias,
      setNoticiaDetalhe: state.setNoticiaDetalhe,
      setNoticiasRelacionadas: state.setNoticiasRelacionadas,
      setCategoriasDisponiveis: state.setCategoriasDisponiveis,
      setStats: state.setStats,
      setTotalCount: state.setTotalCount,

      // Loading setters
      setLoadingLista: state.setLoadingLista,
      setLoadingDetalhe: state.setLoadingDetalhe,
      setLoadingRelacionadas: state.setLoadingRelacionadas,
      setLoadingStats: state.setLoadingStats,
      setSaving: state.setSaving,
      setError: state.setError,

      // Funções de limpeza
      clearNoticiaDetalhe: state.clearNoticiaDetalhe,
      clearNoticiasRelacionadas: state.clearNoticiasRelacionadas,

      // Ações de API
      fetchNoticias: state.fetchNoticias,
      fetchNoticiaDetalhe: state.fetchNoticiaDetalhe,
      fetchStats: state.fetchStats,
      fetchCategorias: state.fetchCategorias,

      // Ações de CRUD
      criarNoticia: state.criarNoticia,
      atualizarNoticia: state.atualizarNoticia,
      deletarNoticia: state.deletarNoticia,
      toggleStatus: state.toggleStatus,
      toggleDestaque: state.toggleDestaque,
    }))
  );

  // Calcular notícias paginadas
  const startIndex = (filtros.currentPage - 1) * filtros.itemsPerPage;
  const paginatedNoticias = noticias.slice(
    startIndex,
    startIndex + filtros.itemsPerPage
  );

  // Calcular total de páginas
  const totalPages = Math.ceil(totalCount / filtros.itemsPerPage);

  // Funções utilitárias
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: NoticiaStatus) => {
    switch (status) {
      case "publicado":
        return "bg-green-500 text-white";
      case "rascunho":
        return "bg-yellow-500 text-white";
      case "arquivado":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: NoticiaStatus) => {
    switch (status) {
      case "publicado":
        return "PUBLICADO";
      case "rascunho":
        return "RASCUNHO";
      case "arquivado":
        return "ARQUIVADO";
      default:
        return "DESCONHECIDO";
    }
  };

  return {
    // Dados
    noticias,
    noticiaDetalhe,
    noticiasRelacionadas,
    categoriasDisponiveis,
    stats,

    // Estados
    loadingLista,
    loadingDetalhe,
    loadingRelacionadas,
    loadingStats,
    saving,
    error,

    // Filtros e paginação
    filtros,
    totalCount,
    paginatedNoticias,
    totalPages,
    startIndex,

    // Setters
    setSearchTerm,
    setCategoria,
    setSortBy,
    setSortOrder,
    setItemsPerPage,
    setCurrentPage,
    setStatus,
    setDestaque,
    clearFilters,

    // Data setters
    setNoticias,
    setNoticiaDetalhe,
    setNoticiasRelacionadas,
    setCategoriasDisponiveis,
    setStats,
    setTotalCount,

    // Loading setters
    setLoadingLista,
    setLoadingDetalhe,
    setLoadingRelacionadas,
    setLoadingStats,
    setSaving,
    setError,

    // Funções de limpeza
    clearNoticiaDetalhe,
    clearNoticiasRelacionadas,

    // Ações de API
    fetchNoticias,
    fetchNoticiaDetalhe,
    fetchStats,
    fetchCategorias,

    // Ações de CRUD
    criarNoticia,
    atualizarNoticia,
    deletarNoticia,
    toggleStatus,
    toggleDestaque,

    // Utilitários
    formatDate,
    getStatusColor,
    getStatusText,
  };
}

// Hook para criação de notícias
export function useNoticiaCreate() {
  const [formData, setFormData] = useState({
    titulo: "",
    slug: "",
    conteudo: "",
    resumo: "",
    imagem: null as string | null,
    categoria: "Operações",
    destaque: false,
    data_publicacao: new Date().toISOString().split("T")[0],
    status: "rascunho" as NoticiaStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { saving, criarNoticia } = useNoticias();

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .substring(0, 100);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Gerar slug automaticamente se mudar o título
    if (name === "titulo") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = "Título deve ter pelo menos 3 caracteres";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug é obrigatório";
    } else if (formData.slug.length < 3) {
      newErrors.slug = "Slug deve ter pelo menos 3 caracteres";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug =
        "Slug deve conter apenas letras minúsculas, números e hífens";
    }

    if (!formData.resumo.trim()) {
      newErrors.resumo = "Resumo é obrigatório";
    } else if (formData.resumo.length < 10) {
      newErrors.resumo = "Resumo deve ter pelo menos 10 caracteres";
    }

    if (!formData.conteudo.trim()) {
      newErrors.conteudo = "Conteúdo é obrigatório";
    } else if (formData.conteudo.length < 10) {
      newErrors.conteudo = "Conteúdo deve ter pelo menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<ApiResponse<NoticiaComAutor>> => {
    if (!validateForm()) {
      return {
        success: false,
        error: "Erros de validação no formulário",
      };
    }

    return await criarNoticia(formData);
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      slug: "",
      conteudo: "",
      resumo: "",
      imagem: null,
      categoria: "Operações",
      destaque: false,
      data_publicacao: new Date().toISOString().split("T")[0],
      status: "rascunho",
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    saving,
    setFormData,
    handleInputChange,
    validateForm,
    handleSubmit,
    resetForm,
    generateSlug,
  };
}

// Hook para edição de notícias
export function useNoticiaEdit(noticiaId: string) {
  const [formData, setFormData] = useState<Partial<UpdateNoticiaInput>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isInitialLoad = useRef(true);

  const {
    noticiaDetalhe,
    loadingDetalhe,
    saving,
    fetchNoticiaDetalhe,
    atualizarNoticia,
  } = useNoticias();

  // Carregar notícia
  useEffect(() => {
    if (noticiaId) {
      fetchNoticiaDetalhe(noticiaId);
    }
  }, [noticiaId, fetchNoticiaDetalhe]);

  // Inicializar formData quando noticiaDetalhe for carregado (com delay para evitar cascading renders)
  useEffect(() => {
    if (noticiaDetalhe && isInitialLoad.current) {
      isInitialLoad.current = false;

      // Usar setTimeout para evitar cascading renders
      const timer = setTimeout(() => {
        setFormData({
          titulo: noticiaDetalhe.titulo,
          slug: noticiaDetalhe.slug,
          conteudo: noticiaDetalhe.conteudo,
          resumo: noticiaDetalhe.resumo || "",
          imagem: noticiaDetalhe.imagem,
          categoria: noticiaDetalhe.categoria || "Operações",
          destaque: noticiaDetalhe.destaque,
          data_publicacao: noticiaDetalhe.data_publicacao,
          status: noticiaDetalhe.status,
        });
        setHasUnsavedChanges(false);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [noticiaDetalhe]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasUnsavedChanges(true);

    // Gerar slug automaticamente se mudar o título
    if (name === "titulo") {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
          .substring(0, 100),
      }));
    }

    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo?.trim()) {
      newErrors.titulo = "Título é obrigatório";
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = "Título deve ter pelo menos 3 caracteres";
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = "Slug é obrigatório";
    } else if (formData.slug.length < 3) {
      newErrors.slug = "Slug deve ter pelo menos 3 caracteres";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug =
        "Slug deve conter apenas letras minúsculas, números e hífens";
    }

    if (!formData.resumo?.trim()) {
      newErrors.resumo = "Resumo é obrigatório";
    } else if (formData.resumo.length < 10) {
      newErrors.resumo = "Resumo deve ter pelo menos 10 caracteres";
    }

    if (!formData.conteudo?.trim()) {
      newErrors.conteudo = "Conteúdo é obrigatório";
    } else if (formData.conteudo.length < 10) {
      newErrors.conteudo = "Conteúdo deve ter pelo menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<ApiResponse<NoticiaComAutor>> => {
    if (!validateForm()) {
      return {
        success: false,
        error: "Erros de validação no formulário",
      };
    }

    return await atualizarNoticia(noticiaId, formData);
  };

  return {
    noticiaDetalhe,
    loading: loadingDetalhe,
    saving,
    formData,
    errors,
    hasUnsavedChanges,
    setFormData,
    handleInputChange,
    validateForm,
    handleSubmit,
    setHasUnsavedChanges,
  };
}
