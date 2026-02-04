// src/lib/stores/useNoticiasStore.ts

"use client";

import { create } from "zustand";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  criarNoticia,
  atualizarNoticia,
  deletarNoticia,
  getNoticiaById,
  getNews,
  getPublicNews,
  getNewsStats,
  getNewsCategories,
  toggleStatus,
  toggleDestaque,
  type CreateNoticiaInput,
  type UpdateNoticiaInput,
  type NoticiaComAutor,
  type NoticiaLista,
  type ListNoticiasInput,
  type NewsStats,
} from "@/app/actions/news/noticias";

// ==================== CONSTANTES E TIPOS ====================

export const NOTICIA_STATUS = {
  RASCUNHO: "rascunho",
  PUBLICADO: "publicado",
  ARQUIVADO: "arquivado",
} as const;

export const TIPOS_MEDIA = {
  IMAGEM: "imagem",
  VIDEO: "video",
} as const;

export type SortBy = "recent" | "oldest" | "popular" | "titulo" | "views";
export type StatusFilter = "all" | "rascunho" | "publicado" | "arquivado";

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 100);
}

// ==================== STORE PRINCIPAL ====================

interface NoticiasStore {
  noticias: NoticiaLista[];
  stats: NewsStats;
  categories: Array<{ value: string; label: string }>;
  noticiaDetalhe: NoticiaComAutor | null;
  noticiasRelacionadas: NoticiaLista[];
  loading: boolean;
  loadingStats: boolean;
  error: string | null;

  filters: {
    search: string;
    categoria: string;
    status: StatusFilter;
    destaque: "all" | boolean;
    tipo_media: "all" | "imagem" | "video";
    sortBy: SortBy;
    sortOrder: "asc" | "desc";
  };

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  fetchNoticiasAdmin: () => Promise<void>;
  fetchNoticiasPublicas: () => Promise<void>;
  fetchNoticiaDetalhe: (slugOrId: string) => Promise<void>;
  setNoticiasRelacionadas: (noticias: NoticiaLista[]) => void;
  fetchStats: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setFilters: (filters: Partial<NoticiasStore["filters"]>) => void;
  setPagination: (pagination: Partial<NoticiasStore["pagination"]>) => void;
  excluirNoticia: (id: string) => Promise<{ success: boolean; error?: string }>;
  alternarStatus: (
    id: string,
    currentStatus: string,
  ) => Promise<{ success: boolean; error?: string }>;
  alternarDestaque: (
    id: string,
    currentDestaque: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useNoticiasStore = create<NoticiasStore>((set, get) => ({
  noticias: [],
  noticiaDetalhe: null,
  noticiasRelacionadas: [],
  stats: {
    total: 0,
    published: 0,
    recent: 0,
    featured: 0,
    rascunho: 0,
    arquivado: 0,
    videos: 0,
    imagens: 0,
    canViewStats: false,
  },
  categories: [],
  loading: false,
  loadingStats: false,
  error: null,
  filters: {
    search: "",
    categoria: "all",
    status: "all",
    destaque: "all",
    tipo_media: "all",
    sortBy: "recent",
    sortOrder: "desc",
  },
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },

  fetchNoticiasAdmin: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params: ListNoticiasInput = {
        search: filters.search,
        categoria: filters.categoria === "all" ? undefined : filters.categoria,
        status: filters.status === "all" ? undefined : filters.status,
        destaque: filters.destaque === "all" ? undefined : filters.destaque,
        tipo_media:
          filters.tipo_media === "all" ? undefined : filters.tipo_media,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      const result = await getNews(params);
      if (result.success && result.data) {
        set({
          noticias: result.data,
          pagination: { ...pagination, ...result.pagination },
          loading: false,
        });
      } else throw new Error(result.error);
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  fetchNoticiasPublicas: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params: ListNoticiasInput = {
        search: filters.search,
        categoria: filters.categoria === "all" ? undefined : filters.categoria,
        destaque: filters.destaque === "all" ? undefined : filters.destaque,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      const result = await getPublicNews(params);
      if (result.success && result.data) {
        set({
          noticias: result.data,
          pagination: { ...pagination, ...result.pagination },
          loading: false,
        });
      } else throw new Error(result.error);
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  fetchNoticiaDetalhe: async (slugOrId: string) => {
    set({ loading: true, error: null, noticiaDetalhe: null });
    try {
      const result = await getNoticiaById(slugOrId);
      if (result.success && result.data) {
        set({ noticiaDetalhe: result.data, loading: false });
      } else {
        throw new Error(result.error || "Notícia não encontrada");
      }
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  setNoticiasRelacionadas: (noticias) =>
    set({ noticiasRelacionadas: noticias }),

  fetchStats: async () => {
    set({ loadingStats: true });
    try {
      const result = await getNewsStats();
      if (result.success && result.data) set({ stats: result.data });
    } finally {
      set({ loadingStats: false });
    }
  },

  fetchCategories: async () => {
    const result = await getNewsCategories();
    if (result.success && result.data) set({ categories: result.data });
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    })),
  setPagination: (newPagination) =>
    set((state) => ({ pagination: { ...state.pagination, ...newPagination } })),

  excluirNoticia: async (id) => {
    const result = await deletarNoticia(id);
    if (result.success) {
      await get().fetchNoticiasAdmin();
      await get().fetchStats();
      return { success: true };
    }
    return { success: false, error: result.error };
  },

  alternarStatus: async (id, currentStatus) => {
    let nextStatus = "rascunho";
    if (currentStatus === "rascunho") nextStatus = "publicado";
    else if (currentStatus === "publicado") nextStatus = "arquivado";
    else if (currentStatus === "arquivado") nextStatus = "publicado";
    const result = await toggleStatus(id, nextStatus);
    if (result.success) {
      // ✅ CORREÇÃO 1: Tipagem explícita para evitar 'any'
      set((state) => ({
        noticias: state.noticias.map((n) =>
          n.id === id
            ? { ...n, status: nextStatus as NoticiaLista["status"] }
            : n,
        ),
      }));
      await get().fetchStats();
      return { success: true };
    }
    return { success: false, error: result.error };
  },

  alternarDestaque: async (id, current) => {
    const result = await toggleDestaque(id, !current);
    if (result.success) {
      set((state) => ({
        noticias: state.noticias.map((n) =>
          n.id === id ? { ...n, destaque: !current } : n,
        ),
      }));
      await get().fetchStats();
      return { success: true };
    }
    return { success: false, error: result.error };
  },
}));

// ==================== STORE PARA CRIAÇÃO ====================

interface NoticiaCreateStore {
  formData: Partial<CreateNoticiaInput>;
  saving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  setFormData: (data: Partial<CreateNoticiaInput>) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  resetFormData: () => void;
  createNoticia: (
    data: CreateNoticiaInput,
  ) => Promise<{ success: boolean; error?: string; data?: NoticiaComAutor }>;
  validateForm: () => string[];
  autoGenerateSlug: (title: string) => void;
}

const initialCreateData: Partial<CreateNoticiaInput> = {
  titulo: "",
  slug: "",
  conteudo: "",
  resumo: "",
  categoria: "Operações",
  status: "rascunho",
  tipo_media: "imagem",
  destaque: false,
  data_publicacao: new Date().toISOString().split("T")[0],
};

const useNoticiaCreateStore = create<NoticiaCreateStore>((set, get) => ({
  formData: initialCreateData,
  saving: false,
  error: null,
  hasUnsavedChanges: false,
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      hasUnsavedChanges: true,
    })),
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  resetFormData: () =>
    set({ formData: initialCreateData, error: null, hasUnsavedChanges: false }),
  autoGenerateSlug: (title) => {
    const slug = generateSlug(title);
    set((state) => ({ formData: { ...state.formData, slug } }));
  },
  validateForm: () => {
    const { formData } = get();
    const errors: string[] = [];
    if (!formData.titulo?.trim()) errors.push("Título é obrigatório");
    if (!formData.slug?.trim()) errors.push("Slug é obrigatório");
    return errors;
  },
  createNoticia: async (data) => {
    set({ saving: true, error: null });
    try {
      const result = await criarNoticia(data);
      if (result.success && result.data) {
        get().resetFormData();
        return { success: true, data: result.data };
      }
      set({ error: result.error });
      return { success: false, error: result.error };
    } catch (error) {
      set({ error: String(error) });
      return { success: false, error: String(error) };
    } finally {
      set({ saving: false });
    }
  },
}));

// ==================== STORE PARA EDIÇÃO ====================

interface NoticiaEditStore {
  noticia: NoticiaComAutor | null;
  formData: Partial<UpdateNoticiaInput>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  setNoticia: (noticia: NoticiaComAutor) => void;
  setFormData: (data: Partial<UpdateNoticiaInput>) => void;
  updateNoticia: (
    data: UpdateNoticiaInput,
  ) => Promise<{ success: boolean; error?: string }>;
  validateForm: () => string[];
  autoGenerateSlug: (title: string) => void;
}

const useNoticiaEditStore = create<NoticiaEditStore>((set, get) => ({
  noticia: null,
  formData: {},
  loading: true,
  saving: false,
  error: null,
  hasUnsavedChanges: false,
  setNoticia: (noticia) => {
    // ✅ CORREÇÃO 2: Mapeamento explícito para tratar null vs undefined
    const formValues: Partial<UpdateNoticiaInput> = {
      titulo: noticia.titulo,
      slug: noticia.slug,
      conteudo: noticia.conteudo,
      resumo: noticia.resumo,
      media_url: noticia.media_url,
      video_url: noticia.video_url,
      thumbnail_url: noticia.thumbnail_url,
      tipo_media: noticia.tipo_media,
      duracao_video: noticia.duracao_video,
      categoria: noticia.categoria || undefined, // Converte null para undefined
      destaque: noticia.destaque,
      data_publicacao: noticia.data_publicacao,
      status: noticia.status,
    };
    set({
      noticia,
      formData: formValues,
      loading: false,
      hasUnsavedChanges: false,
      error: null,
    });
  },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      hasUnsavedChanges: true,
    })),
  autoGenerateSlug: (title) => {
    const slug = generateSlug(title);
    set((state) => ({ formData: { ...state.formData, slug } }));
  },
  validateForm: () => {
    const { formData } = get();
    const errors: string[] = [];
    if (!formData.titulo?.trim()) errors.push("Título é obrigatório");
    if (!formData.slug?.trim()) errors.push("Slug é obrigatório");
    return errors;
  },
  updateNoticia: async (data) => {
    const { noticia } = get();
    if (!noticia) return { success: false, error: "Notícia não carregada" };
    set({ saving: true, error: null });
    try {
      const result = await atualizarNoticia(noticia.id, data);
      if (result.success && result.data) {
        get().setNoticia(result.data);
        return { success: true };
      }
      set({ error: result.error });
      return { success: false, error: result.error };
    } catch (error) {
      set({ error: String(error) });
      return { success: false, error: String(error) };
    } finally {
      set({ saving: false });
    }
  },
}));

// ==================== HOOKS ====================

export function useNoticias() {
  const store = useNoticiasStore(
    useShallow((state) => ({
      ...state,
      fetchNoticias: state.fetchNoticiasAdmin,
    })),
  );
  return store;
}

export function useNoticiasBasico() {
  const store = useNoticiasStore(
    useShallow((state) => ({
      noticias: state.noticias,
      loading: state.loading,
      pagination: state.pagination,
      filters: state.filters,
      categories: state.categories,
      setFilters: state.setFilters,
      setPagination: state.setPagination,
      fetchNoticias: state.fetchNoticiasPublicas,
      fetchCategories: state.fetchCategories,
    })),
  );
  return store;
}

export function useNoticiaDetalhe() {
  const store = useNoticiasStore(
    useShallow((state) => ({
      noticiaDetalhe: state.noticiaDetalhe,
      noticiasRelacionadas: state.noticiasRelacionadas,
      loading: state.loading,
      error: state.error,
      fetchNoticiaDetalhe: state.fetchNoticiaDetalhe,
      setNoticiasRelacionadas: state.setNoticiasRelacionadas,
    })),
  );
  return store;
}

export function useNoticiaCreate() {
  return useNoticiaCreateStore();
}

export function useNoticiaEdit(idOrSlug: string) {
  const store = useNoticiaEditStore();
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    async function load() {
      if (!idOrSlug) return;
      try {
        const result = await getNoticiaById(idOrSlug);
        if (result.success && result.data) store.setNoticia(result.data);
        else
          useNoticiaEditStore.setState({ error: result.error, loading: false });
      } catch {
        useNoticiaEditStore.setState({
          error: "Erro ao carregar",
          loading: false,
        });
      } finally {
        setInitialized(true);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrSlug]);
  return { ...store, initialized };
}
