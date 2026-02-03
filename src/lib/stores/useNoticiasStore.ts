"use client";

import { create } from "zustand";
import { useEffect, useCallback } from "react";
import { devtools } from "zustand/middleware";
import {
  criarNoticia,
  atualizarNoticia,
  deletarNoticia,
  getNoticiaById,
  getNews,
  getNewsStats,
  getNewsCategories,
  toggleStatus,
  toggleDestaque,
  type CreateNoticiaInput,
  type UpdateNoticiaInput,
  type NoticiaComAutor,
  type NoticiaLista,
  type ApiResponse,
  type ListNoticiasInput,
  type NewsStats,
} from "@/app/actions/news/noticias";

// ==================== TIPOS ====================
export type SortBy =
  | "recent"
  | "oldest"
  | "popular"
  | "destaque"
  | "titulo"
  | "data_publicacao"
  | "created_at"
  | "views";
export type StatusFilter = "all" | "rascunho" | "publicado" | "arquivado";
export type DestaqueFilter = "all" | "destaque" | "normal";
export type TipoMediaFilter = "all" | "imagem" | "video";

export interface NoticiasFiltros {
  search: string;
  categoria: string;
  status: StatusFilter;
  destaque: DestaqueFilter;
  tipo_media: TipoMediaFilter;
  sortBy: SortBy;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Estado para edição
interface EdicaoState {
  noticiaEditando: NoticiaComAutor | null;
  formDataEdit: UpdateNoticiaInput;
  editando: boolean;
  salvando: boolean;
  errorEdicao: string | null;
  hasUnsavedChanges: boolean;
  mediaFile: File | null;
  mediaType: "image" | "video" | null;
}

// Estado para criação
interface CriacaoState {
  formDataCriacao: CreateNoticiaInput;
  criando: boolean;
  errorCriacao: string | null;
  hasUnsavedChangesCriacao: boolean;
}

interface NoticiasState extends EdicaoState, CriacaoState {
  // Estados principais
  noticias: NoticiaLista[];
  noticiaDetalhe: NoticiaComAutor | null;
  loading: boolean;
  loadingDetalhe: boolean;
  loadingStats: boolean;
  error: string | null;
  filters: NoticiasFiltros;
  pagination: Pagination;
  stats: NewsStats;
  categories: Array<{ value: string; label: string }>;

  // Estados para site público
  noticiasRelacionadas: NoticiaLista[];
  totalCount: number;

  // Propriedades para filtros (compatibilidade com site público)
  filtros: {
    searchTerm: string;
    categoria: string;
    sortBy: SortBy;
    itemsPerPage: number;
    currentPage: number;
  };

  // ============ AÇÕES PRINCIPAIS ============
  setFilters: (filters: Partial<NoticiasFiltros>) => void;
  setSearch: (search: string) => void;
  setCategoria: (categoria: string) => void;
  setStatus: (status: StatusFilter) => void;
  setDestaque: (destaque: DestaqueFilter) => void;
  setTipoMedia: (tipo_media: TipoMediaFilter) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearFilters: () => void;

  // Ações para site público
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  setNoticiasRelacionadas: (noticias: NoticiaLista[]) => void;

  // Ações - CRUD
  fetchNoticias: () => Promise<void>;
  fetchNoticiaDetalhe: (idOrSlug: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  criarNovaNoticia: (
    data: CreateNoticiaInput,
  ) => Promise<ApiResponse<NoticiaComAutor>>;
  atualizarNoticia: (
    id: string,
    data: UpdateNoticiaInput,
  ) => Promise<ApiResponse<NoticiaComAutor>>;
  excluirNoticia: (id: string) => Promise<ApiResponse<void>>;
  alternarStatus: (
    id: string,
    currentStatus: "rascunho" | "publicado" | "arquivado",
  ) => Promise<ApiResponse<void>>;
  alternarDestaque: (
    id: string,
    currentDestaque: boolean,
  ) => Promise<ApiResponse<void>>;

  // ============ AÇÕES PARA EDIÇÃO ============
  iniciarEdicao: (idOrSlug: string) => Promise<void>;
  cancelarEdicao: () => void;
  setCampoEdicao: <K extends keyof UpdateNoticiaInput>(
    campo: K,
    valor: UpdateNoticiaInput[K],
  ) => void;
  setMediaEdicao: (arquivo: File | null, tipo: "image" | "video") => void;
  setHasUnsavedChangesEdicao: (hasChanges: boolean) => void;
  validarFormEdicao: () => string[];
  salvarEdicao: () => Promise<ApiResponse<NoticiaComAutor>>;

  // ============ AÇÕES PARA CRIAÇÃO ============
  setCampoCriacao: <K extends keyof CreateNoticiaInput>(
    campo: K,
    valor: CreateNoticiaInput[K],
  ) => void;
  setHasUnsavedChangesCriacao: (hasChanges: boolean) => void;
  resetarFormCriacao: () => void;
  validarFormCriacao: () => string[];
  gerarSlug: (titulo: string) => string;
}

// Estado inicial
const initialFilters: NoticiasFiltros = {
  search: "",
  categoria: "all",
  status: "all",
  destaque: "all",
  tipo_media: "all",
  sortBy: "recent",
  sortOrder: "desc",
  page: 1,
  limit: 20,
};

const initialPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

const initialStats: NewsStats = {
  total: 0,
  published: 0,
  recent: 0,
  featured: 0,
  rascunho: 0,
  arquivado: 0,
  videos: 0,
  imagens: 0,
  canViewStats: true,
};

const initialFormDataEdit: UpdateNoticiaInput = {
  titulo: "",
  slug: "",
  conteudo: "",
  resumo: "",
  media_url: "",
  video_url: "",
  thumbnail_url: "",
  tipo_media: "imagem",
  duracao_video: null,
  categoria: "",
  destaque: false,
  data_publicacao: "",
  status: "rascunho",
};

const initialFormDataCriacao: CreateNoticiaInput = {
  titulo: "",
  slug: "",
  conteudo: "",
  resumo: "",
  media_url: "",
  video_url: "",
  thumbnail_url: "",
  tipo_media: "imagem",
  duracao_video: null,
  categoria: "Operações",
  destaque: false,
  data_publicacao: new Date().toISOString().split("T")[0],
  status: "rascunho",
};

// ============ STORE PRINCIPAL ============
export const useNoticiasStore = create<NoticiasState>()(
  devtools((set, get) => ({
    // ============ ESTADOS INICIAIS ============
    noticias: [],
    noticiaDetalhe: null,
    loading: false,
    loadingDetalhe: false,
    loadingStats: false,
    error: null,
    filters: initialFilters,
    pagination: initialPagination,
    stats: initialStats,
    categories: [],
    noticiasRelacionadas: [],
    totalCount: 0,
    filtros: {
      searchTerm: "",
      categoria: "all",
      sortBy: "recent",
      itemsPerPage: 10,
      currentPage: 1,
    },

    // Estados para edição
    noticiaEditando: null,
    formDataEdit: initialFormDataEdit,
    editando: false,
    salvando: false,
    errorEdicao: null,
    hasUnsavedChanges: false,
    mediaFile: null,
    mediaType: null,

    // Estados para criação
    formDataCriacao: initialFormDataCriacao,
    criando: false,
    errorCriacao: null,
    hasUnsavedChangesCriacao: false,

    // ============ FILTROS ============
    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters, page: 1 },
        filtros: {
          ...state.filtros,
          searchTerm: newFilters.search || state.filtros.searchTerm,
          categoria: newFilters.categoria || state.filtros.categoria,
          sortBy: newFilters.sortBy || state.filtros.sortBy,
          currentPage: 1,
        },
      }));
    },

    setSearch: (search) =>
      set((state) => ({
        filters: { ...state.filters, search, page: 1 },
        filtros: { ...state.filtros, searchTerm: search, currentPage: 1 },
      })),

    setCategoria: (categoria) =>
      set((state) => ({
        filters: { ...state.filters, categoria, page: 1 },
        filtros: { ...state.filtros, categoria, currentPage: 1 },
      })),

    setStatus: (status) =>
      set((state) => ({ filters: { ...state.filters, status, page: 1 } })),

    setDestaque: (destaque) =>
      set((state) => ({ filters: { ...state.filters, destaque, page: 1 } })),

    setTipoMedia: (tipo_media) =>
      set((state) => ({ filters: { ...state.filters, tipo_media, page: 1 } })),

    setSortBy: (sortBy) =>
      set((state) => ({
        filters: { ...state.filters, sortBy, page: 1 },
        filtros: { ...state.filtros, sortBy, currentPage: 1 },
      })),

    setSortOrder: (sortOrder) =>
      set((state) => ({ filters: { ...state.filters, sortOrder, page: 1 } })),

    setPage: (page) =>
      set((state) => ({
        filters: { ...state.filters, page },
        filtros: { ...state.filtros, currentPage: page },
      })),

    setLimit: (limit) =>
      set((state) => ({
        filters: { ...state.filters, limit, page: 1 },
        filtros: { ...state.filtros, itemsPerPage: limit, currentPage: 1 },
      })),

    clearFilters: () => {
      set({
        filters: initialFilters,
        filtros: {
          searchTerm: "",
          categoria: "all",
          sortBy: "recent",
          itemsPerPage: 10,
          currentPage: 1,
        },
      });
    },

    // ============ AÇÕES SITE PÚBLICO ============
    setSearchTerm: (searchTerm) =>
      set((state) => ({
        filters: { ...state.filters, search: searchTerm, page: 1 },
        filtros: { ...state.filtros, searchTerm, currentPage: 1 },
      })),

    setCurrentPage: (currentPage) =>
      set((state) => ({
        filters: { ...state.filters, page: currentPage },
        filtros: { ...state.filtros, currentPage },
      })),

    setItemsPerPage: (itemsPerPage) =>
      set((state) => ({
        filters: { ...state.filters, limit: itemsPerPage, page: 1 },
        filtros: { ...state.filtros, itemsPerPage, currentPage: 1 },
      })),

    setNoticiasRelacionadas: (noticiasRelacionadas) =>
      set({ noticiasRelacionadas }),

    // ============ FETCH NOTÍCIAS ============
    fetchNoticias: async () => {
      set({ loading: true, error: null });
      try {
        const { filters } = get();

        const params: ListNoticiasInput = {
          search: filters.search || undefined,
          categoria:
            filters.categoria === "all" ? undefined : filters.categoria,
          status: filters.status === "all" ? undefined : filters.status,
          destaque:
            filters.destaque === "all"
              ? undefined
              : filters.destaque === "destaque",
          tipo_media:
            filters.tipo_media === "all" ? undefined : filters.tipo_media,
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        };

        const result = await getNews(params);

        if (result.success && result.data) {
          set({
            noticias: result.data,
            totalCount: result.pagination?.total || 0,
            pagination: {
              page: result.pagination?.page || 1,
              limit: result.pagination?.limit || 20,
              total: result.pagination?.total || 0,
              totalPages: result.pagination?.totalPages || 0,
            },
            loading: false,
          });
        } else {
          set({
            error: result.error || "Erro ao carregar notícias",
            loading: false,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
        set({
          error: error instanceof Error ? error.message : "Erro desconhecido",
          loading: false,
        });
      }
    },

    // ============ FETCH DETALHE ============
    fetchNoticiaDetalhe: async (idOrSlug: string) => {
      set({ loadingDetalhe: true, error: null });
      try {
        const result = await getNoticiaById(idOrSlug);

        if (result.success && result.data) {
          set({
            noticiaDetalhe: result.data,
            loadingDetalhe: false,
          });
        } else {
          set({
            error: result.error || "Notícia não encontrada",
            loadingDetalhe: false,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar detalhe:", error);
        set({
          error: error instanceof Error ? error.message : "Erro desconhecido",
          loadingDetalhe: false,
        });
      }
    },

    // ============ FETCH STATS ============
    fetchStats: async () => {
      set({ loadingStats: true });
      try {
        const result = await getNewsStats();

        if (result.success && result.data) {
          set({
            stats: result.data,
            loadingStats: false,
          });
        } else {
          set({
            loadingStats: false,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        set({ loadingStats: false });
      }
    },

    // ============ FETCH CATEGORIAS (OTIMIZADO) ============
    fetchCategories: async () => {
      try {
        const defaultCategories = [
          { value: "all", label: "Todas categorias" },
          { value: "Operações", label: "Operações" },
          { value: "Eventos", label: "Eventos" },
          { value: "Treinamento", label: "Treinamento" },
        ];

        const result = await getNewsCategories();

        if (result.success && result.data && result.data.length > 0) {
          set({
            categories: [
              { value: "all", label: "Todas categorias" },
              ...result.data,
            ],
          });
        } else {
          console.warn("Backend retornou categorias vazias, usando padrão.");
          set({ categories: defaultCategories });
        }
      } catch (error) {
        console.error("Erro crítico ao buscar categorias no store:", error);
        set({
          categories: [
            { value: "all", label: "Todas categorias" },
            { value: "Operações", label: "Operações" },
            { value: "Eventos", label: "Eventos" },
          ],
        });
      }
    },

    // ============ CRUD OPERATIONS ============
    criarNovaNoticia: async (data: CreateNoticiaInput) => {
      try {
        set({ error: null });
        const result = await criarNoticia(data);

        if (result.success) {
          get().fetchNoticias();
          get().fetchStats();
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao criar notícia";
        set({ error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    atualizarNoticia: async (id: string, data: UpdateNoticiaInput) => {
      try {
        set({ error: null });
        const result = await atualizarNoticia(id, data);

        if (result.success) {
          if (get().noticiaDetalhe?.id === id) {
            set({ noticiaDetalhe: result.data || null });
          }
          if (get().noticiaEditando?.id === id) {
            set({ noticiaEditando: result.data || null });
          }
          get().fetchNoticias();
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao atualizar notícia";
        set({ error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    excluirNoticia: async (id: string) => {
      try {
        set({ error: null });
        const result = await deletarNoticia(id);

        if (result.success) {
          set((state) => ({
            noticias: state.noticias.filter((n) => n.id !== id),
          }));
          get().fetchStats();
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao excluir notícia";
        set({ error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    alternarStatus: async (
      id: string,
      currentStatus: "rascunho" | "publicado" | "arquivado",
    ) => {
      try {
        const result = await toggleStatus(id, currentStatus);

        if (result.success) {
          get().fetchNoticias();
          get().fetchStats();
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao alterar status";
        return { success: false, error: errorMessage };
      }
    },

    alternarDestaque: async (id: string, currentDestaque: boolean) => {
      try {
        const result = await toggleDestaque(id, currentDestaque);

        if (result.success) {
          get().fetchNoticias();
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao alterar destaque";
        return { success: false, error: errorMessage };
      }
    },

    // ============ AÇÕES PARA EDIÇÃO ============
    iniciarEdicao: async (idOrSlug: string) => {
      set({ editando: true, errorEdicao: null });
      try {
        await get().fetchNoticiaDetalhe(idOrSlug);
        const noticia = get().noticiaDetalhe;

        if (noticia) {
          set({
            noticiaEditando: noticia,
            formDataEdit: {
              titulo: noticia.titulo || "",
              slug: noticia.slug || "",
              conteudo: noticia.conteudo || "",
              resumo: noticia.resumo || "",
              media_url: noticia.media_url || "",
              video_url: noticia.video_url || "",
              thumbnail_url: noticia.thumbnail_url || "",
              tipo_media: noticia.tipo_media || "imagem",
              duracao_video: noticia.duracao_video || null,
              categoria: noticia.categoria || "",
              destaque: noticia.destaque || false,
              data_publicacao: noticia.data_publicacao || "",
              status: noticia.status || "rascunho",
            },
            hasUnsavedChanges: false,
            mediaFile: null,
            mediaType: null,
          });
        } else {
          set({ errorEdicao: "Notícia não encontrada" });
        }
      } catch (error) {
        console.error("Erro ao iniciar edição:", error);
        set({
          errorEdicao:
            error instanceof Error ? error.message : "Erro desconhecido",
        });
      } finally {
        set({ editando: false });
      }
    },

    cancelarEdicao: () => {
      set({
        noticiaEditando: null,
        formDataEdit: initialFormDataEdit,
        hasUnsavedChanges: false,
        mediaFile: null,
        mediaType: null,
        errorEdicao: null,
      });
    },

    setCampoEdicao: (campo, valor) => {
      set((state) => ({
        formDataEdit: { ...state.formDataEdit, [campo]: valor },
        hasUnsavedChanges: true,
      }));

      if (campo === "titulo" && typeof valor === "string") {
        const slug = get().gerarSlug(valor);
        set((state) => ({
          formDataEdit: { ...state.formDataEdit, slug },
        }));
      }
    },

    setMediaEdicao: (arquivo, tipo) => {
      set({
        mediaFile: arquivo,
        mediaType: tipo,
        hasUnsavedChanges: true,
      });

      if (tipo === "image") {
        get().setCampoEdicao("tipo_media", "imagem");
        get().setCampoEdicao("video_url", "");
      } else {
        get().setCampoEdicao("tipo_media", "video");
        get().setCampoEdicao("media_url", "");
      }
    },

    setHasUnsavedChangesEdicao: (hasChanges) => {
      set({ hasUnsavedChanges: hasChanges });
    },

    validarFormEdicao: () => {
      const { formDataEdit } = get();
      const errors: string[] = [];

      if (!formDataEdit.titulo?.trim()) errors.push("Título é obrigatório");
      if (formDataEdit.titulo && formDataEdit.titulo.length < 3)
        errors.push("Título deve ter pelo menos 3 caracteres");
      if (!formDataEdit.slug?.trim()) errors.push("Slug é obrigatório");
      if (
        formDataEdit.slug &&
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formDataEdit.slug)
      ) {
        errors.push(
          "Slug deve conter apenas letras minúsculas, números e hífens",
        );
      }
      if (!formDataEdit.conteudo?.trim()) errors.push("Conteúdo é obrigatório");
      if (formDataEdit.conteudo && formDataEdit.conteudo.length < 10)
        errors.push("Conteúdo deve ter pelo menos 10 caracteres");
      if (!formDataEdit.resumo?.trim()) errors.push("Resumo é obrigatório");
      if (formDataEdit.resumo && formDataEdit.resumo.length < 10)
        errors.push("Resumo deve ter pelo menos 10 caracteres");

      return errors;
    },

    salvarEdicao: async () => {
      const { noticiaEditando, formDataEdit } = get();

      if (!noticiaEditando) {
        return { success: false, error: "Nenhuma notícia em edição" };
      }

      set({ salvando: true, errorEdicao: null });

      try {
        const errors = get().validarFormEdicao();
        if (errors.length > 0) {
          set({ salvando: false });
          return {
            success: false,
            error: `Erros de validação: ${errors.join(", ")}`,
          };
        }

        const result = await get().atualizarNoticia(
          noticiaEditando.id,
          formDataEdit,
        );

        if (result.success) {
          set({
            salvando: false,
            hasUnsavedChanges: false,
            mediaFile: null,
            mediaType: null,
          });

          get().iniciarEdicao(noticiaEditando.id);
        } else {
          set({ salvando: false });
        }

        return result;
      } catch (error) {
        console.error("Erro ao salvar edição:", error);
        set({
          salvando: false,
          errorEdicao:
            error instanceof Error ? error.message : "Erro ao salvar",
        });

        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao salvar",
        };
      }
    },

    // ============ AÇÕES PARA CRIAÇÃO ============
    setCampoCriacao: (campo, valor) => {
      set((state) => ({
        formDataCriacao: { ...state.formDataCriacao, [campo]: valor },
        hasUnsavedChangesCriacao: true,
      }));

      if (campo === "titulo" && typeof valor === "string") {
        const slug = get().gerarSlug(valor);
        set((state) => ({
          formDataCriacao: { ...state.formDataCriacao, slug },
        }));
      }
    },

    setHasUnsavedChangesCriacao: (hasChanges) => {
      set({ hasUnsavedChangesCriacao: hasChanges });
    },

    resetarFormCriacao: () => {
      set({
        formDataCriacao: initialFormDataCriacao,
        errorCriacao: null,
        hasUnsavedChangesCriacao: false,
      });
    },

    validarFormCriacao: () => {
      const { formDataCriacao } = get();
      const errors: string[] = [];

      if (!formDataCriacao.titulo.trim()) errors.push("Título é obrigatório");
      if (formDataCriacao.titulo.length < 3)
        errors.push("Título deve ter pelo menos 3 caracteres");
      if (!formDataCriacao.slug.trim()) errors.push("Slug é obrigatório");
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formDataCriacao.slug)) {
        errors.push(
          "Slug deve conter apenas letras minúsculas, números e hífens",
        );
      }
      if (!formDataCriacao.conteudo.trim())
        errors.push("Conteúdo é obrigatório");
      if (formDataCriacao.conteudo.length < 10)
        errors.push("Conteúdo deve ter pelo menos 10 caracteres");
      if (!formDataCriacao.resumo?.trim()) errors.push("Resumo é obrigatório");
      if ((formDataCriacao.resumo?.length || 0) < 10)
        errors.push("Resumo deve ter pelo menos 10 caracteres");

      return errors;
    },

    gerarSlug: (titulo: string) => {
      return titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
        .substring(0, 100);
    },
  })),
);

// ==================== HOOKS PÚBLICOS ====================

export function useNoticias() {
  const store = useNoticiasStore();
  // Solução para o warning: extrair a função e colocá-la na dependência
  const { fetchCategories, categories } = store;

  useEffect(() => {
    // Só busca se a lista estiver vazia para evitar calls desnecessários
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [fetchCategories, categories.length]);

  return store;
}

// Hook para site público (mais leve e focado em leitura)
export function useNoticiasBasico() {
  const store = useNoticiasStore();
  const { fetchCategories, categories } = store;

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [fetchCategories, categories.length]);

  return {
    noticias: store.noticias,
    loading: store.loading,
    filtros: store.filtros,
    totalCount: store.totalCount,
    categoriasDisponiveis: store.categories,
    stats: store.stats,
    setFiltros: (filters: Partial<NoticiasFiltros>) =>
      store.setFilters(filters),
    setSearchTerm: store.setSearchTerm,
    setCategoria: (categoria: string) => store.setCategoria(categoria),
    setSortBy: (sortBy: SortBy) => store.setSortBy(sortBy),
    setItemsPerPage: store.setItemsPerPage,
    setCurrentPage: store.setCurrentPage,
    clearFilters: store.clearFilters,
    fetchNoticias: store.fetchNoticias,
    fetchStats: store.fetchStats,
  };
}

// Hook para criação (focado em formulário)
export function useNoticiaCriacao() {
  const store = useNoticiasStore(); // Correção: executar o hook

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value, type } = e.target;

      let newValue: string | boolean | number;
      if (type === "checkbox") {
        newValue = (e.target as HTMLInputElement).checked;
      } else if (type === "number") {
        newValue = Number(value);
      } else {
        newValue = value;
      }

      store.setCampoCriacao(name as keyof CreateNoticiaInput, newValue);
    },
    [store],
  );

  const handleSubmit = useCallback(async () => {
    const { formDataCriacao, criarNovaNoticia, validarFormCriacao } = store;
    const errors = validarFormCriacao();

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return await criarNovaNoticia(formDataCriacao);
  }, [store]);

  return {
    formData: store.formDataCriacao,
    criando: store.criando,
    error: store.errorCriacao,
    hasUnsavedChanges: store.hasUnsavedChangesCriacao,
    setFormData: (data: Partial<CreateNoticiaInput>) => {
      Object.entries(data).forEach(([key, value]) => {
        store.setCampoCriacao(key as keyof CreateNoticiaInput, value);
      });
    },
    handleInputChange,
    handleSubmit,
    validarForm: store.validarFormCriacao,
    gerarSlug: store.gerarSlug,
    resetarForm: store.resetarFormCriacao,
  };
}

// Hook para edição (focado em formulário de edição)
export function useNoticiaEdicao(idOrSlug?: string) {
  const store = useNoticiasStore();
  const { iniciarEdicao } = store;

  useEffect(() => {
    if (idOrSlug) {
      iniciarEdicao(idOrSlug);
    }
  }, [idOrSlug, iniciarEdicao]); // Adicionado dependência correta

  return {
    noticia: store.noticiaEditando,
    carregando: store.editando,
    salvando: store.salvando,
    error: store.errorEdicao,
    formData: store.formDataEdit,
    hasUnsavedChanges: store.hasUnsavedChanges,
    mediaFile: store.mediaFile,
    mediaType: store.mediaType,
    setCampo: store.setCampoEdicao,
    setMedia: store.setMediaEdicao,
    setHasUnsavedChanges: store.setHasUnsavedChangesEdicao,
    validarForm: store.validarFormEdicao,
    salvar: store.salvarEdicao,
    cancelar: store.cancelarEdicao,
  };
}

// Exportar tipos
export type { NoticiaLista, NoticiaComAutor, NewsStats };
