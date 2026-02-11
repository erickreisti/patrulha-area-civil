import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useShallow } from "zustand/react/shallow";

// ==================== TIPAGEM (UI & DB) ====================

export interface Categoria {
  id: string;
  titulo: string;
  nome: string; // Alias
  slug: string;
  descricao: string | null;
  capa_url?: string | null;
  data_evento: string;
  created_at: string;
  updated_at: string;
  status: boolean;
  arquivada: boolean;
  destaque: boolean;
  tipo: "fotos" | "videos";
  ordem: number;
  itens_count?: number;
  qtd_fotos?: number;
  qtd_videos?: number;
  // Adicionado para suportar a capa automática
  itens?: {
    arquivo_url: string;
    thumbnail_url: string | null;
    tipo: "foto" | "video";
  }[];
}

export interface GaleriaItem {
  id: string;
  categoria_id: string;
  tipo: "foto" | "video";
  url: string;
  thumbnail_url?: string | null;
  titulo?: string;
  descricao?: string;
  ordem: number;
  status: boolean;
  destaque: boolean;
  created_at: string;
  galeria_categorias?: {
    nome: string;
  };
}

export interface GaleriaStats {
  totalCategorias: number;
  categoriasAtivas: number;
  categoriasPorTipo: {
    fotos: number;
    videos: number;
  };
  totalItens: number;
  itensAtivos: number;
  totalVideos: number;
  itensDestaque: number;
}

interface CategoriaDB {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  capa_url: string | null;
  tipo: "fotos" | "videos";
  ordem: number;
  status: boolean;
  arquivada: boolean;
  created_at: string;
  updated_at: string;
}

interface GaleriaItemDB {
  id: string;
  categoria_id: string;
  titulo: string;
  descricao: string | null;
  arquivo_url: string;
  tipo: "foto" | "video";
  thumbnail_url: string | null;
  ordem: number;
  status: boolean;
  destaque?: boolean;
  created_at: string;
  updated_at: string;
}

type GaleriaItemWithJoin = GaleriaItemDB & {
  galeria_categorias: { nome: string } | null;
};

export type TipoCategoriaFilter = "all" | "fotos" | "videos";
export type TipoItemFilter = "all" | "foto" | "video";
export type StatusFilter = "all" | "ativo" | "inativo";

interface FiltrosCategorias {
  search: string;
  tipo: TipoCategoriaFilter;
}

interface FiltrosItens {
  search: string;
  tipo: TipoItemFilter;
  categoria_id: string;
  status: StatusFilter;
}

interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// ==================== INTERFACE DA STORE ====================

interface GaleriaState {
  // --- Estados ---
  categorias: Categoria[];
  adminCategorias: Categoria[];
  itens: GaleriaItem[];
  adminItens: GaleriaItem[];
  stats: GaleriaStats;

  loadingCategorias: boolean;
  loadingItens: boolean;
  loadingAdmin: boolean;
  loadingStats: boolean;

  errorCategorias: string | null;
  errorItens: string | null;
  errorAdmin: string | null;

  filtrosCategorias: FiltrosCategorias;
  filtrosItens: FiltrosItens;
  pagination: PaginationState;

  categoriaSelecionada: Categoria | null;

  // Actions
  fetchCategorias: () => Promise<void>;
  fetchItens: (slug: string) => Promise<void>;

  // Admin Actions
  fetchAdminCategorias: () => Promise<void>;
  fetchAdminItens: () => Promise<void>;
  fetchStats: () => Promise<void>;
  toggleCategoriaStatus: (
    id: string,
    currentStatus: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteCategoria: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Setters
  setFiltrosCategorias: (filtros: Partial<FiltrosCategorias>) => void;
  setFiltrosItens: (filtros: Partial<FiltrosItens>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;

  resetFiltrosCategorias: () => void;
  resetFiltrosItens: () => void;

  clearErrorCategorias: () => void;
  clearErrorItens: () => void;
  clearErrors: () => void;
}

// ==================== INITIAL STATE ====================

const initialFiltrosCategorias: FiltrosCategorias = { search: "", tipo: "all" };
const initialFiltrosItens: FiltrosItens = {
  search: "",
  tipo: "all",
  categoria_id: "all",
  status: "all",
};
const initialPagination: PaginationState = {
  page: 1,
  limit: 12,
  totalPages: 1,
  totalItems: 0,
};
const initialStats: GaleriaStats = {
  totalCategorias: 0,
  categoriasAtivas: 0,
  categoriasPorTipo: { fotos: 0, videos: 0 },
  totalItens: 0,
  itensAtivos: 0,
  totalVideos: 0,
  itensDestaque: 0,
};

// ==================== STORE IMPLEMENTATION ====================

const useGaleriaStoreBase = create<GaleriaState>((set, get) => ({
  categorias: [],
  adminCategorias: [],
  itens: [],
  adminItens: [],
  stats: initialStats,
  loadingCategorias: false,
  loadingItens: false,
  loadingAdmin: false,
  loadingStats: false,
  errorCategorias: null,
  errorItens: null,
  errorAdmin: null,
  filtrosCategorias: initialFiltrosCategorias,
  filtrosItens: initialFiltrosItens,
  pagination: initialPagination,
  categoriaSelecionada: null,

  // --- PUBLIC: Fetch Categorias ---
  fetchCategorias: async () => {
    const { filtrosCategorias } = get();
    set({ loadingCategorias: true, errorCategorias: null });

    try {
      const supabase = createClient();

      // ✅ CORREÇÃO: Busca os itens junto com as categorias para gerar a capa
      let query = supabase
        .from("galeria_categorias")
        .select(
          `
          *,
          itens:galeria_itens(
            arquivo_url,
            thumbnail_url,
            tipo
          )
        `,
        )
        .eq("status", true)
        .eq("arquivada", false)
        .order("created_at", { ascending: false });

      if (filtrosCategorias.search) {
        query = query.ilike("nome", `%${filtrosCategorias.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const categoriasMapeadas: Categoria[] = (data as CategoriaDB[]).map(
        mapCategoriaDBtoUI,
      );
      set({ categorias: categoriasMapeadas });
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      set({ errorCategorias: "Não foi possível carregar as galerias." });
    } finally {
      set({ loadingCategorias: false });
    }
  },

  // --- PUBLIC: Fetch Itens ---
  fetchItens: async (slug: string) => {
    const { filtrosItens } = get();
    set({
      loadingItens: true,
      errorItens: null,
      itens: [],
      categoriaSelecionada: null,
    });

    try {
      const supabase = createClient();
      // 1. Busca Categoria pelo Slug
      const { data: categoriaRaw, error: catError } = await supabase
        .from("galeria_categorias")
        .select("*")
        .eq("slug", slug)
        .eq("status", true)
        .single();

      if (catError || !categoriaRaw) throw new Error("Galeria não encontrada.");

      const categoriaMapeada = mapCategoriaDBtoUI(categoriaRaw as CategoriaDB);
      set({ categoriaSelecionada: categoriaMapeada });

      // 2. Busca Itens da Categoria
      let query = supabase
        .from("galeria_itens")
        .select("*")
        .eq("categoria_id", categoriaMapeada.id)
        .eq("status", true)
        .order("ordem", { ascending: true });

      if (filtrosItens.tipo !== "all") {
        query = query.eq(
          "tipo",
          filtrosItens.tipo === "foto" ? "foto" : "video",
        );
      }

      const { data: itensRaw, error: itensError } = await query;
      if (itensError) throw itensError;

      const itensMapeados: GaleriaItem[] = (itensRaw as GaleriaItemDB[]).map(
        mapItemDBtoUI,
      );
      set({ itens: itensMapeados });
    } catch (error: unknown) {
      console.error("Erro ao buscar itens:", error);
      let msg = "Erro ao carregar as fotos/vídeos.";
      if (error instanceof Error) {
        msg =
          error.message === "Galeria não encontrada."
            ? "Galeria não encontrada."
            : msg;
      }
      set({ errorItens: msg });
    } finally {
      set({ loadingItens: false });
    }
  },

  // --- ADMIN: Fetch Categorias ---
  fetchAdminCategorias: async () => {
    const { filtrosCategorias, pagination } = get();
    set({ loadingAdmin: true, errorAdmin: null });

    try {
      const supabase = createClient();
      let query = supabase
        .from("galeria_categorias")
        .select("*", { count: "exact" });

      if (filtrosCategorias.search) {
        query = query.ilike("nome", `%${filtrosCategorias.search}%`);
      }
      if (filtrosCategorias.tipo !== "all") {
        query = query.eq("tipo", filtrosCategorias.tipo);
      }

      query = query.order("created_at", { ascending: false });

      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

      set((state) => ({
        pagination: { ...state.pagination, totalPages, totalItems },
      }));

      const categoriasMapeadas: Categoria[] = (data as CategoriaDB[]).map(
        mapCategoriaDBtoUI,
      );
      set({ adminCategorias: categoriasMapeadas });
    } catch (error) {
      console.error("Erro admin categorias:", error);
      set({ errorAdmin: "Falha ao carregar categorias." });
    } finally {
      set({ loadingAdmin: false });
    }
  },

  // --- ADMIN: Fetch Itens ---
  fetchAdminItens: async () => {
    const { filtrosItens, pagination } = get();
    set({ loadingAdmin: true, errorAdmin: null });

    try {
      const supabase = createClient();
      let query = supabase
        .from("galeria_itens")
        .select("*, galeria_categorias(nome)", { count: "exact" });

      if (filtrosItens.search) {
        query = query.ilike("titulo", `%${filtrosItens.search}%`);
      }
      if (filtrosItens.tipo !== "all") {
        query = query.eq("tipo", filtrosItens.tipo);
      }
      if (filtrosItens.categoria_id !== "all") {
        query = query.eq("categoria_id", filtrosItens.categoria_id);
      }
      if (filtrosItens.status !== "all") {
        query = query.eq("status", filtrosItens.status === "ativo");
      }

      query = query.order("created_at", { ascending: false });

      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

      set((state) => ({
        pagination: { ...state.pagination, totalPages, totalItems },
      }));

      const itensMapeados = (data as GaleriaItemWithJoin[]).map((item) => ({
        ...mapItemDBtoUI(item),
        galeria_categorias: item.galeria_categorias
          ? { nome: item.galeria_categorias.nome }
          : undefined,
      }));

      set({ adminItens: itensMapeados });
    } catch (error) {
      console.error("Admin Itens Error:", error);
      set({ errorAdmin: "Erro ao carregar itens." });
    } finally {
      set({ loadingAdmin: false });
    }
  },

  // --- ADMIN: Stats ---
  fetchStats: async () => {
    set({ loadingStats: true });
    try {
      const supabase = createClient();
      const { data: catData } = await supabase
        .from("galeria_categorias")
        .select("status, tipo");
      const { data: itemData } = await supabase
        .from("galeria_itens")
        .select("status, tipo, destaque");

      const totalCat = catData?.length || 0;
      const ativasCat = catData?.filter((c) => c.status).length || 0;
      const fotosCat = catData?.filter((c) => c.tipo === "fotos").length || 0;
      const videosCat = catData?.filter((c) => c.tipo === "videos").length || 0;

      const totalItem = itemData?.length || 0;
      const ativasItem = itemData?.filter((i) => i.status).length || 0;
      const videosItem =
        itemData?.filter((i) => i.tipo === "video").length || 0;
      const destaqueItem = itemData?.filter((i) => i.destaque).length || 0;

      set({
        stats: {
          totalCategorias: totalCat,
          categoriasAtivas: ativasCat,
          categoriasPorTipo: { fotos: fotosCat, videos: videosCat },
          totalItens: totalItem,
          itensAtivos: ativasItem,
          totalVideos: videosItem,
          itensDestaque: destaqueItem,
        },
      });
    } catch (error) {
      console.error("Erro stats:", error);
    } finally {
      set({ loadingStats: false });
    }
  },

  // --- ACTIONS ---

  toggleCategoriaStatus: async (id, currentStatus) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("galeria_categorias")
        .update({ status: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        adminCategorias: state.adminCategorias.map((cat) =>
          cat.id === id ? { ...cat, status: !currentStatus } : cat,
        ),
        stats: {
          ...state.stats,
          categoriasAtivas: !currentStatus
            ? state.stats.categoriasAtivas + 1
            : state.stats.categoriasAtivas - 1,
        },
      }));

      return { success: true };
    } catch (error: unknown) {
      let errorMessage = "Erro desconhecido";
      if (error instanceof Error) errorMessage = error.message;
      return { success: false, error: errorMessage };
    }
  },

  deleteCategoria: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("galeria_categorias")
        .delete()
        .eq("id", id);
      if (error) throw error;

      set((state) => ({
        adminCategorias: state.adminCategorias.filter((c) => c.id !== id),
        stats: {
          ...state.stats,
          totalCategorias: state.stats.totalCategorias - 1,
        },
      }));
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = "Erro ao excluir categoria";
      if (error instanceof Error) errorMessage = error.message;
      return { success: false, error: errorMessage };
    }
  },

  deleteItem: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("galeria_itens")
        .delete()
        .eq("id", id);
      if (error) throw error;

      set((state) => ({
        adminItens: state.adminItens.filter((i) => i.id !== id),
      }));
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = "Erro ao excluir item";
      if (error instanceof Error) errorMessage = error.message;
      return { success: false, error: errorMessage };
    }
  },

  // Setters
  setFiltrosCategorias: (novos) =>
    set((s) => ({ filtrosCategorias: { ...s.filtrosCategorias, ...novos } })),
  setFiltrosItens: (novos) =>
    set((s) => ({ filtrosItens: { ...s.filtrosItens, ...novos } })),
  setPagination: (pag) =>
    set((s) => ({ pagination: { ...s.pagination, ...pag } })),

  resetFiltrosCategorias: () =>
    set({ filtrosCategorias: initialFiltrosCategorias }),
  resetFiltrosItens: () => set({ filtrosItens: initialFiltrosItens }),

  clearErrorCategorias: () => set({ errorCategorias: null }),
  clearErrorItens: () => set({ errorItens: null }),
  clearErrors: () =>
    set({ errorCategorias: null, errorItens: null, errorAdmin: null }),
}));

// ==================== HELPERS ====================

function mapCategoriaDBtoUI(cat: CategoriaDB): Categoria {
  return {
    id: cat.id,
    titulo: cat.nome,
    nome: cat.nome,
    slug: cat.slug,
    descricao: cat.descricao,
    capa_url: cat.capa_url,
    status: cat.status,
    data_evento: cat.created_at,
    created_at: cat.created_at,
    updated_at: cat.updated_at,
    destaque: !cat.arquivada,
    arquivada: cat.arquivada,
    tipo: cat.tipo,
    ordem: cat.ordem,
    // ✅ CORREÇÃO: Garante que os itens vindos do Join sejam passados para a UI
    // @ts-expect-error: itens vem do join, não está no tipo base do DB, mas está no retorno da query
    itens: cat.itens,
  };
}

function mapItemDBtoUI(item: GaleriaItemDB): GaleriaItem {
  return {
    id: item.id,
    categoria_id: item.categoria_id,
    tipo: item.tipo,
    url: item.arquivo_url,
    thumbnail_url: item.thumbnail_url,
    titulo: item.titulo,
    descricao: item.descricao || undefined,
    ordem: item.ordem,
    status: item.status,
    destaque: item.destaque || false,
    created_at: item.created_at,
  };
}

// ==================== HOOKS EXPORTADOS ====================

export const useGaleriaList = () => {
  return useGaleriaStoreBase(
    useShallow((s) => ({
      categorias: s.categorias,
      loading: s.loadingCategorias,
      error: s.errorCategorias,
      filtros: s.filtrosCategorias,
      fetchCategorias: s.fetchCategorias,
      setFiltros: s.setFiltrosCategorias,
      clearError: s.clearErrorCategorias,
    })),
  );
};
export const useGaleriaDetalhe = () => {
  return useGaleriaStoreBase(
    useShallow((s) => ({
      categoria: s.categoriaSelecionada,
      itens: s.itens,
      loading: s.loadingItens,
      errorItens: s.errorItens,
      filtros: s.filtrosItens,
      fetchItens: s.fetchItens,
      setFiltros: s.setFiltrosItens,
      clearErrorItens: s.clearErrorItens,
      resetFiltrosItens: s.resetFiltrosItens,
    })),
  );
};
export const useGaleriaPublica = () => {
  return useGaleriaStoreBase(
    useShallow((s) => ({
      categorias: s.categorias,
      loading: s.loadingCategorias,
      error: s.errorCategorias,
      pagination: s.pagination,
      fetchCategorias: s.fetchCategorias,
      setPagination: s.setPagination,
    })),
  );
};
export const useCategoriasAdmin = () => {
  return useGaleriaStoreBase(
    useShallow((s) => ({
      categorias: s.adminCategorias,
      loading: s.loadingAdmin,
      error: s.errorAdmin,
      filtros: s.filtrosCategorias,
      pagination: s.pagination,
      fetchCategorias: s.fetchAdminCategorias,
      setFiltros: s.setFiltrosCategorias,
      resetFiltros: s.resetFiltrosCategorias,
      setPagination: s.setPagination,
      toggleStatus: s.toggleCategoriaStatus,
      deleteCategoria: s.deleteCategoria,
    })),
  );
};

export const useItensAdmin = () => {
  return useGaleriaStoreBase(
    useShallow((state) => ({
      itens: state.adminItens,
      loading: state.loadingAdmin,
      error: state.errorAdmin,
      filtros: state.filtrosItens,
      pagination: state.pagination,
      fetchItens: state.fetchAdminItens,
      categorias: state.adminCategorias,
      fetchCategorias: state.fetchAdminCategorias,
      setFiltros: state.setFiltrosItens,
      resetFiltros: state.resetFiltrosItens,
      setPagination: state.setPagination,
      deleteItem: state.deleteItem,
    })),
  );
};

export const useGaleriaStats = () => {
  return useGaleriaStoreBase(
    useShallow((state) => ({
      stats: state.stats,
      loading: state.loadingStats,
      fetchStats: state.fetchStats,
    })),
  );
};

export const useGaleriaStore = useGaleriaStoreBase;
