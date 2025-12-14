import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type { GaleriaCategoria, GaleriaItem } from "@/lib/supabase/types";

// Tipos inline baseados no Database
type TipoCategoria =
  Database["public"]["Tables"]["galeria_categorias"]["Row"]["tipo"];
type SortType = "recent" | "oldest" | "name" | "destaque" | "popular";

// Extendendo os tipos do banco com informações adicionais
interface GaleriaCategoriaComItens extends GaleriaCategoria {
  item_count: number;
  tem_destaque: boolean;
  ultima_imagem_url?: string;
}

interface GaleriaItemComRelacoes extends GaleriaItem {
  categoria?: {
    id: string;
    nome: string;
    slug: string;
  } | null;
  autor?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface GalleryFiltersCategorias {
  searchTerm: string;
  tipo: "all" | TipoCategoria;
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

interface GalleryStats {
  totalFotos: number;
  totalVideos: number;
  totalCategorias: number;
  categoriasComDestaque: number;
}

// ==================== INTERFACE DO STORE ====================
interface GaleriaStore {
  // Estado das categorias
  categorias: GaleriaCategoriaComItens[];
  loadingCategorias: boolean;
  errorCategorias: string | null;

  // Estado dos itens
  itens: GaleriaItemComRelacoes[];
  loadingItens: boolean;
  errorItens: string | null;
  categoriaAtual: GaleriaCategoria | null;

  // Filtros
  filtrosCategorias: GalleryFiltersCategorias;
  filtrosItens: GalleryFiltersItens;

  // Estatísticas
  stats: GalleryStats | null;

  // ==================== ACTIONS ====================

  // Categorias
  fetchCategorias: () => Promise<void>;
  fetchCategoriaPorSlug: (slug: string) => Promise<GaleriaCategoria | null>;
  fetchEstatisticas: () => Promise<GalleryStats>;

  // Itens
  fetchItensPorCategoria: (categoriaId: string) => Promise<void>;
  fetchItemPorId: (itemId: string) => Promise<GaleriaItemComRelacoes | null>;
  incrementarViews: (itemId: string) => Promise<void>;

  // Setters Categorias
  setSearchTermCategorias: (term: string) => void;
  setTipoCategorias: (tipo: "all" | TipoCategoria) => void;
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
}

// ==================== ESTADO INICIAL ====================
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

// ==================== IMPLEMENTAÇÃO DO STORE ====================
export const useGaleriaStore = create<GaleriaStore>((set, get) => ({
  // Estado inicial
  categorias: [],
  loadingCategorias: false,
  errorCategorias: null,

  itens: [],
  loadingItens: false,
  errorItens: null,
  categoriaAtual: null,

  filtrosCategorias: { ...filtrosIniciaisCategorias },
  filtrosItens: { ...filtrosIniciaisItens },

  stats: null,

  // ==================== ACTIONS IMPLEMENTATION ====================

  // Buscar categorias com filtros e paginação
  fetchCategorias: async () => {
    set({ loadingCategorias: true, errorCategorias: null });

    try {
      const supabase = createClient();
      const state = get();
      const { searchTerm, tipo, sortBy, currentPage, itemsPerPage } =
        state.filtrosCategorias;

      // Calcular range para paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Query base para categorias com contagem de itens
      let query = supabase.from("galeria_categorias").select(
        `*,
          galeria_itens:galeria_itens!galeria_itens_categoria_id_fkey(
            id,
            destaque,
            arquivo_url,
            thumbnail_url
          )`,
        { count: "exact" }
      );

      // Aplicar filtros
      if (searchTerm.trim()) {
        query = query.or(
          `nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`
        );
      }

      if (tipo !== "all") {
        query = query.eq("tipo", tipo);
      }

      // Status sempre ativo e não arquivado
      query = query.eq("status", true).eq("arquivada", false);

      // Aplicar ordenação
      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "name":
          query = query.order("nome", { ascending: true });
          break;
        case "destaque":
          query = query.order("ordem", { ascending: true });
          break;
        case "popular":
          query = query.order("ordem", { ascending: true });
          break;
      }

      // Aplicar paginação
      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw new Error(`Erro ao buscar categorias: ${error.message}`);
      }

      // Processar dados para incluir contagem e destaque
      const categoriasComItens: GaleriaCategoriaComItens[] = (data || [])
        .map((categoria) => {
          const itens = categoria.galeria_itens || [];

          // Buscar a imagem do último item em destaque ou o último item
          const ultimoItemDestaque = itens.find((item) => item.destaque);
          const ultimoItem = itens[0];
          const ultima_imagem_url =
            ultimoItemDestaque?.thumbnail_url ||
            ultimoItemDestaque?.arquivo_url ||
            ultimoItem?.thumbnail_url ||
            ultimoItem?.arquivo_url;

          return {
            ...categoria,
            item_count: itens.length,
            tem_destaque: itens.some((item) => item.destaque),
            ultima_imagem_url,
          };
        })
        .filter((categoria) => categoria.item_count > 0); // Apenas categorias com itens

      // Ordenar por popularidade se necessário
      if (sortBy === "popular") {
        categoriasComItens.sort((a, b) => b.item_count - a.item_count);
      }

      set({
        categorias: categoriasComItens,
        loadingCategorias: false,
        filtrosCategorias: {
          ...state.filtrosCategorias,
          total: count || 0,
        },
      });
    } catch (error: unknown) {
      console.error("Erro ao buscar categorias:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao carregar categorias";
      set({
        errorCategorias: errorMessage,
        loadingCategorias: false,
      });
    }
  },

  // Buscar categoria específica por slug
  fetchCategoriaPorSlug: async (
    slug: string
  ): Promise<GaleriaCategoria | null> => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("galeria_categorias")
        .select("*")
        .eq("slug", slug)
        .eq("status", true)
        .eq("arquivada", false)
        .single();

      if (error) throw error;

      set({ categoriaAtual: data });
      return data;
    } catch (error: unknown) {
      console.error("Erro ao buscar categoria:", error);
      return null;
    }
  },

  // Buscar estatísticas da galeria
  fetchEstatisticas: async (): Promise<GalleryStats> => {
    try {
      const supabase = createClient();

      // Buscar categorias ativas
      const { data: categorias, error: catError } = await supabase
        .from("galeria_categorias")
        .select(
          "id, tipo, galeria_itens:galeria_itens!galeria_itens_categoria_id_fkey(id, destaque)"
        )
        .eq("status", true)
        .eq("arquivada", false);

      if (catError) throw catError;

      const totalCategorias = categorias?.length || 0;

      let totalFotos = 0;
      let totalVideos = 0;
      let categoriasComDestaque = 0;

      categorias?.forEach((categoria) => {
        const itens = categoria.galeria_itens || [];

        if (categoria.tipo === "fotos") {
          totalFotos += itens.length;
        } else {
          totalVideos += itens.length;
        }

        if (itens.some((item) => item.destaque)) {
          categoriasComDestaque++;
        }
      });

      const stats: GalleryStats = {
        totalFotos,
        totalVideos,
        totalCategorias,
        categoriasComDestaque,
      };

      set({ stats });
      return stats;
    } catch (error: unknown) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        totalFotos: 0,
        totalVideos: 0,
        totalCategorias: 0,
        categoriasComDestaque: 0,
      };
    }
  },

  // Buscar itens de uma categoria específica
  fetchItensPorCategoria: async (categoriaId: string) => {
    set({ loadingItens: true, errorItens: null });

    try {
      const supabase = createClient();
      const state = get();
      const { searchTerm, sortBy, destaque, currentPage, itemsPerPage } =
        state.filtrosItens;

      // Calcular range para paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Query base com joins
      let query = supabase
        .from("galeria_itens")
        .select(
          `*,
          categoria:galeria_categorias(id, nome, slug),
          autor:profiles(id, full_name, avatar_url)`,
          { count: "exact" }
        )
        .eq("categoria_id", categoriaId)
        .eq("status", true);

      // Aplicar filtros
      if (searchTerm.trim()) {
        query = query.or(
          `titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`
        );
      }

      if (destaque !== null) {
        query = query.eq("destaque", destaque);
      }

      // Aplicar ordenação
      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "name":
          query = query.order("titulo", { ascending: true });
          break;
        case "destaque":
          query = query.order("destaque", { ascending: false });
          query = query.order("created_at", { ascending: false });
          break;
        case "popular":
          query = query.order("views", { ascending: false });
          break;
      }

      // Aplicar paginação
      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error("Erro ao buscar itens:", error);
        throw new Error(`Erro ao buscar itens: ${error.message}`);
      }

      const itens: GaleriaItemComRelacoes[] = (data || []).map((item) => ({
        ...item,
        views: item.views || 0,
      }));

      set({
        itens,
        loadingItens: false,
        filtrosItens: {
          ...state.filtrosItens,
          total: count || 0,
        },
      });
    } catch (error: unknown) {
      console.error("Erro ao buscar itens:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao carregar itens";
      set({
        errorItens: errorMessage,
        loadingItens: false,
      });
    }
  },

  // Buscar item específico por ID
  fetchItemPorId: async (
    itemId: string
  ): Promise<GaleriaItemComRelacoes | null> => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("galeria_itens")
        .select(
          `*,
          categoria:galeria_categorias(id, nome, slug),
          autor:profiles(id, full_name, avatar_url)`
        )
        .eq("id", itemId)
        .single();

      if (error) throw error;

      return {
        ...data,
        views: data.views || 0,
      };
    } catch (error: unknown) {
      console.error("Erro ao buscar item:", error);
      return null;
    }
  },

  // Incrementar visualizações de um item
  incrementarViews: async (itemId: string): Promise<void> => {
    try {
      const supabase = createClient();

      // Buscar views atuais
      const { data: item, error: fetchError } = await supabase
        .from("galeria_itens")
        .select("views")
        .eq("id", itemId)
        .single();

      if (fetchError) throw fetchError;

      const currentViews = item.views || 0;

      // Atualizar views
      const { error: updateError } = await supabase
        .from("galeria_itens")
        .update({ views: currentViews + 1 })
        .eq("id", itemId);

      if (updateError) throw updateError;

      // Atualizar item no estado local se estiver carregado
      const state = get();
      const updatedItens = state.itens.map((item) =>
        item.id === itemId ? { ...item, views: currentViews + 1 } : item
      );

      set({ itens: updatedItens });
    } catch (error: unknown) {
      console.error("Erro ao incrementar views:", error);
    }
  },

  // ==================== SETTERS ====================

  // Setters para categorias
  setSearchTermCategorias: (term: string) => {
    set((state) => ({
      filtrosCategorias: {
        ...state.filtrosCategorias,
        searchTerm: term,
        currentPage: 1, // Resetar para primeira página ao buscar
      },
    }));
  },

  setTipoCategorias: (tipo: "all" | TipoCategoria) => {
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
        currentPage: 1, // Resetar para primeira página ao mudar itens por página
      },
    }));
  },

  // Setters para itens
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

  // Reset
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
    });
  },
}));
