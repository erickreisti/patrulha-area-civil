import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useShallow } from "zustand/react/shallow";

// ==================== TIPAGEM (UI) ====================

export interface Categoria {
  id: string;
  titulo: string;
  nome: string;
  slug: string;
  descricao?: string;
  capa_url?: string;
  data_evento: string;
  created_at: string;
  updated_at: string;
  status: boolean;
  arquivada: boolean;
  destaque: boolean;
  tipo: "fotos" | "videos";
  ordem: number;
  qtd_fotos?: number;
  qtd_videos?: number;
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
}

// ==================== TIPAGEM (BANCO DE DADOS) ====================

interface CategoriaDB {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
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

interface FiltrosCategorias {
  search: string;
  ano: string;
}

interface FiltrosItens {
  tipo: "todos" | "foto" | "video";
}

interface PaginationState {
  page: number;
  limit: number;
}

// ==================== INTERFACE DA STORE ====================

interface GaleriaState {
  categorias: Categoria[];
  loadingCategorias: boolean;
  errorCategorias: string | null;
  filtrosCategorias: FiltrosCategorias;
  pagination: PaginationState;

  categoriaSelecionada: Categoria | null;
  itens: GaleriaItem[];
  loadingItens: boolean;
  errorItens: string | null;
  filtrosItens: FiltrosItens;

  fetchCategorias: () => Promise<void>;
  fetchItens: (slug: string) => Promise<void>;
  setFiltrosCategorias: (filtros: Partial<FiltrosCategorias>) => void;
  setFiltrosItens: (filtros: Partial<FiltrosItens>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  clearErrorCategorias: () => void;
  clearErrorItens: () => void;
  resetFiltrosCategorias: () => void;
  resetFiltrosItens: () => void;
}

// ==================== INITIAL STATE ====================

const initialFiltrosCategorias: FiltrosCategorias = {
  search: "",
  ano: "todos",
};
const initialFiltrosItens: FiltrosItens = { tipo: "todos" };
const initialPagination: PaginationState = { page: 1, limit: 12 };

// ==================== STORE IMPLEMENTATION ====================

const useGaleriaStoreBase = create<GaleriaState>((set, get) => ({
  categorias: [],
  loadingCategorias: false,
  errorCategorias: null,
  filtrosCategorias: initialFiltrosCategorias,
  pagination: initialPagination,

  categoriaSelecionada: null,
  itens: [],
  loadingItens: false,
  errorItens: null,
  filtrosItens: initialFiltrosItens,

  fetchCategorias: async () => {
    const { filtrosCategorias } = get();
    set({ loadingCategorias: true, errorCategorias: null });

    try {
      const supabase = createClient();
      let query = supabase
        .from("galeria_categorias")
        .select("*")
        .eq("status", true)
        .order("created_at", { ascending: false });

      if (filtrosCategorias.search) {
        query = query.ilike("nome", `%${filtrosCategorias.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const categoriasMapeadas: Categoria[] = (data as CategoriaDB[]).map(
        (cat) => ({
          id: cat.id,
          titulo: cat.nome,
          nome: cat.nome,
          slug: cat.slug,
          descricao: cat.descricao || undefined,
          status: cat.status,
          data_evento: cat.created_at,
          created_at: cat.created_at,
          updated_at: cat.updated_at,
          destaque: !cat.arquivada,
          arquivada: cat.arquivada,
          capa_url: undefined,
          tipo: cat.tipo,
          ordem: cat.ordem,
        }),
      );

      set({ categorias: categoriasMapeadas });
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      set({ errorCategorias: "Não foi possível carregar as galerias." });
    } finally {
      set({ loadingCategorias: false });
    }
  },

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

      const { data: categoriaRaw, error: catError } = await supabase
        .from("galeria_categorias")
        .select("*")
        .eq("slug", slug)
        .eq("status", true)
        .single();

      if (catError || !categoriaRaw) throw new Error("Galeria não encontrada.");

      const catDB = categoriaRaw as CategoriaDB;
      const categoriaMapeada: Categoria = {
        id: catDB.id,
        titulo: catDB.nome,
        nome: catDB.nome,
        slug: catDB.slug,
        descricao: catDB.descricao || undefined,
        status: catDB.status,
        data_evento: catDB.created_at,
        created_at: catDB.created_at,
        updated_at: catDB.updated_at,
        destaque: !catDB.arquivada,
        arquivada: catDB.arquivada,
        tipo: catDB.tipo,
        ordem: catDB.ordem,
      };

      set({ categoriaSelecionada: categoriaMapeada });

      let query = supabase
        .from("galeria_itens")
        .select("*")
        .eq("categoria_id", catDB.id)
        .eq("status", true)
        .order("ordem", { ascending: true });

      if (filtrosItens.tipo !== "todos") {
        query = query.eq("tipo", filtrosItens.tipo);
      }

      const { data: itensRaw, error: itensError } = await query;
      if (itensError) throw itensError;

      const itensMapeados: GaleriaItem[] = (itensRaw as GaleriaItemDB[]).map(
        (item) => ({
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
        }),
      );

      set({ itens: itensMapeados });
    } catch (error) {
      // ✅ CORREÇÃO: Removemos ': any'
      console.error("Erro ao buscar itens:", error);

      let msg = "Erro desconhecido";
      // ✅ CORREÇÃO: Verificação de tipo segura
      if (error instanceof Error) {
        msg =
          error.message === "Galeria não encontrada."
            ? "Galeria não encontrada."
            : "Erro ao carregar as fotos/vídeos.";
      }
      set({ errorItens: msg });
    } finally {
      set({ loadingItens: false });
    }
  },

  setFiltrosCategorias: (novos) =>
    set((s) => ({ filtrosCategorias: { ...s.filtrosCategorias, ...novos } })),
  setFiltrosItens: (novos) =>
    set((s) => ({ filtrosItens: { ...s.filtrosItens, ...novos } })),
  setPagination: (pag) =>
    set((s) => ({ pagination: { ...s.pagination, ...pag } })),
  clearErrorCategorias: () => set({ errorCategorias: null }),
  clearErrorItens: () => set({ errorItens: null }),
  resetFiltrosCategorias: () =>
    set({ filtrosCategorias: initialFiltrosCategorias }),
  resetFiltrosItens: () => set({ filtrosItens: initialFiltrosItens }),
}));

// ==================== HOOKS EXPORTADOS ====================

export const useGaleriaList = () => {
  return useGaleriaStoreBase(
    useShallow((state) => ({
      categorias: state.categorias,
      loading: state.loadingCategorias,
      error: state.errorCategorias,
      filtros: state.filtrosCategorias,
      fetchCategorias: state.fetchCategorias,
      setFiltros: state.setFiltrosCategorias,
      clearError: state.clearErrorCategorias,
    })),
  );
};

export const useGaleriaDetalhe = () => {
  return useGaleriaStoreBase(
    useShallow((state) => ({
      categoria: state.categoriaSelecionada,
      itens: state.itens,
      loading: state.loadingItens,
      errorItens: state.errorItens,
      filtros: state.filtrosItens,
      fetchItens: state.fetchItens,
      setFiltros: state.setFiltrosItens,
      clearErrorItens: state.clearErrorItens,
      resetFiltrosItens: state.resetFiltrosItens,
    })),
  );
};

export const useGaleriaPublica = () => {
  return useGaleriaStoreBase(
    useShallow((state) => ({
      categorias: state.categorias,
      loading: state.loadingCategorias,
      error: state.errorCategorias,
      pagination: state.pagination,
      fetchCategorias: state.fetchCategorias,
      setPagination: state.setPagination,
    })),
  );
};

export const useGaleriaStore = useGaleriaStoreBase;
