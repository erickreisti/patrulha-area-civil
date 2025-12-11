// stores/useGaleriaStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type {
  GaleriaCategoria,
  GaleriaItem,
} from "@/lib/supabase/types-helpers";

// Interface para categoria com estatísticas
export interface GaleriaCategoriaComItens extends GaleriaCategoria {
  item_count: number;
  tem_destaque: boolean;
  ultima_imagem_url?: string;
}

// Interface para item com URL da imagem corrigida
export interface GaleriaItemComImagem extends GaleriaItem {
  imageUrl?: string;
  thumbnailUrl?: string;
}

interface GaleriaState {
  // Estado principal
  categorias: GaleriaCategoriaComItens[];
  categoriaDetalhe: GaleriaCategoria | null;
  itensCategoria: GaleriaItemComImagem[];
  itemDetalhe: GaleriaItem | null;

  // Estados de loading
  loadingCategorias: boolean;
  loadingCategoriaDetalhe: boolean;
  loadingItens: boolean;

  // Filtros e paginação para categorias
  filtrosCategorias: {
    searchTerm: string;
    tipo: string;
    sortBy: "recent" | "oldest" | "popular" | "destaque";
    itemsPerPage: number;
    currentPage: number;
  };

  // Filtros e paginação para itens
  filtrosItens: {
    destaque: boolean | null;
    sortBy: "recent" | "oldest" | "name" | "destaque";
    itemsPerPage: number;
    currentPage: number;
  };

  // Estatísticas
  totalCategorias: number;
  totalItens: number;

  // Ações para categorias
  fetchCategorias: () => Promise<void>;
  fetchCategoriaPorSlug: (slug: string) => Promise<GaleriaCategoria | null>;
  clearCategoriaDetalhe: () => void;
  clearItensCategoria: () => void;

  // Setters de filtros para categorias
  setSearchTerm: (term: string) => void;
  setTipo: (tipo: string) => void;
  setSortByCategorias: (
    sortBy: "recent" | "oldest" | "popular" | "destaque"
  ) => void;
  setItemsPerPageCategorias: (itemsPerPage: number) => void;
  setCurrentPageCategorias: (page: number) => void;

  // Ações para itens
  fetchItensPorCategoria: (categoriaId: string) => Promise<void>;
  fetchItemPorId: (itemId: string) => Promise<GaleriaItem | null>;

  // Setters de filtros para itens
  setFilterDestaque: (destaque: boolean | null) => void;
  setSortByItens: (sortBy: "recent" | "oldest" | "name" | "destaque") => void;
  setItemsPerPageItens: (itemsPerPage: number) => void;
  setCurrentPageItens: (page: number) => void;

  // Utilitários
  getImageUrl: (
    url: string | null | undefined,
    bucket?: string
  ) => string | undefined;
  getThumbnailUrl: (url: string | null | undefined) => string | undefined;
}

export const useGaleriaStore = create<GaleriaState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      categorias: [],
      categoriaDetalhe: null,
      itensCategoria: [],
      itemDetalhe: null,

      loadingCategorias: false,
      loadingCategoriaDetalhe: false,
      loadingItens: false,

      filtrosCategorias: {
        searchTerm: "",
        tipo: "all",
        sortBy: "recent",
        itemsPerPage: 10,
        currentPage: 1,
      },

      filtrosItens: {
        destaque: null,
        sortBy: "destaque",
        itemsPerPage: 12,
        currentPage: 1,
      },

      totalCategorias: 0,
      totalItens: 0,

      // Função para corrigir URL da imagem
      getImageUrl: (
        url: string | null | undefined,
        bucket: string = "imagens-noticias"
      ) => {
        if (!url) return undefined;

        // Se já é uma URL completa
        if (url.startsWith("http")) return url;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!supabaseUrl) {
          console.error("NEXT_PUBLIC_SUPABASE_URL não está definido");
          return undefined;
        }

        // Determinar o bucket com base no tipo de mídia
        const actualBucket = url.includes("galeria-fotos")
          ? "galeria-fotos"
          : url.includes("galeria-videos")
          ? "galeria-videos"
          : bucket;

        // Corrigir barras duplicadas
        const cleanUrl = url.startsWith("/") ? url.substring(1) : url;

        if (cleanUrl.includes(actualBucket)) {
          return `${supabaseUrl}/storage/v1/object/public/${cleanUrl}`;
        } else {
          return `${supabaseUrl}/storage/v1/object/public/${actualBucket}/${cleanUrl}`;
        }
      },

      getThumbnailUrl: (url: string | null | undefined) => {
        return get().getImageUrl(url, "galeria-fotos");
      },

      // Buscar lista de categorias
      fetchCategorias: async () => {
        const { filtrosCategorias, getImageUrl } = get();
        set({ loadingCategorias: true });

        try {
          const supabase = createClient();
          const from =
            (filtrosCategorias.currentPage - 1) *
            filtrosCategorias.itemsPerPage;
          const to = from + filtrosCategorias.itemsPerPage - 1;

          // Primeiro, contar total
          let countQuery = supabase
            .from("galeria_categorias")
            .select("*", { count: "exact", head: true })
            .eq("status", true)
            .eq("arquivada", false);

          if (filtrosCategorias.tipo !== "all") {
            countQuery = countQuery.eq(
              "tipo",
              filtrosCategorias.tipo as "fotos" | "videos"
            ); // ✅ Corrigido
          }

          if (filtrosCategorias.searchTerm.trim()) {
            countQuery = countQuery.or(
              `nome.ilike.%${filtrosCategorias.searchTerm}%,descricao.ilike.%${filtrosCategorias.searchTerm}%`
            );
          }

          const { count, error: countError } = await countQuery;
          if (countError) throw countError;

          // Buscar categorias
          let query = supabase
            .from("galeria_categorias")
            .select("*")
            .eq("status", true)
            .eq("arquivada", false)
            .range(from, to);

          if (filtrosCategorias.tipo !== "all") {
            query = query.eq(
              "tipo",
              filtrosCategorias.tipo as "fotos" | "videos"
            ); // ✅ Corrigido
          }

          if (filtrosCategorias.searchTerm.trim()) {
            query = query.or(
              `nome.ilike.%${filtrosCategorias.searchTerm}%,descricao.ilike.%${filtrosCategorias.searchTerm}%`
            );
          }

          // Ordenação
          switch (filtrosCategorias.sortBy) {
            case "recent":
              query = query.order("created_at", { ascending: false });
              break;
            case "oldest":
              query = query.order("created_at", { ascending: true });
              break;
            case "destaque":
              query = query.order("ordem", { ascending: true });
              break;
            case "popular":
              query = query.order("nome", { ascending: true });
              break;
          }

          const { data: categoriasData, error: categoriasError } = await query;
          if (categoriasError) throw categoriasError;

          // Processar cada categoria para obter estatísticas
          const categoriasComItens = await Promise.all(
            (categoriasData || []).map(async (categoria) => {
              // Contar itens da categoria
              const { count: itemCount } = await supabase
                .from("galeria_itens")
                .select("*", { count: "exact", head: true })
                .eq("categoria_id", categoria.id)
                .eq("status", true);

              // Verificar se há itens em destaque
              const { data: destaqueData } = await supabase
                .from("galeria_itens")
                .select("id")
                .eq("categoria_id", categoria.id)
                .eq("status", true)
                .eq("destaque", true)
                .limit(1);

              // Buscar última imagem para thumbnail
              let ultimaImagemUrl: string | undefined = undefined;
              if (itemCount && itemCount > 0) {
                const { data: ultimoItem } = await supabase
                  .from("galeria_itens")
                  .select("arquivo_url, thumbnail_url, created_at")
                  .eq("categoria_id", categoria.id)
                  .eq("status", true)
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (ultimoItem) {
                  ultimaImagemUrl =
                    ultimoItem.thumbnail_url || ultimoItem.arquivo_url;
                }
              }

              // Converter para o tipo correto
              const categoriaFormatada: GaleriaCategoriaComItens = {
                id: categoria.id,
                nome: categoria.nome,
                slug: categoria.slug,
                descricao: categoria.descricao || undefined, // ✅ Converter null para undefined
                tipo: categoria.tipo,
                ordem: categoria.ordem,
                status: categoria.status,
                arquivada: categoria.arquivada || undefined,
                created_at: categoria.created_at,
                updated_at: categoria.updated_at || undefined,
                item_count: itemCount || 0,
                tem_destaque: !!destaqueData && destaqueData.length > 0,
                ultima_imagem_url: ultimaImagemUrl
                  ? getImageUrl(ultimaImagemUrl)
                  : undefined,
              };

              return categoriaFormatada;
            })
          );

          // Ordenar por popularidade se necessário
          if (filtrosCategorias.sortBy === "popular") {
            categoriasComItens.sort((a, b) => b.item_count - a.item_count);
          }

          set({
            categorias: categoriasComItens,
            totalCategorias: count || 0,
            loadingCategorias: false,
          });
        } catch (error) {
          console.error("❌ Erro ao buscar categorias:", error);
          set({
            categorias: [],
            totalCategorias: 0,
            loadingCategorias: false,
          });
        }
      },

      // Buscar categoria por slug
      fetchCategoriaPorSlug: async (slug: string) => {
        set({ loadingCategoriaDetalhe: true });

        try {
          const supabase = createClient();

          const { data: categoriaData, error: categoriaError } = await supabase
            .from("galeria_categorias")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();

          if (categoriaError) throw categoriaError;
          if (!categoriaData) return null;

          // Converter para o tipo correto
          const categoriaFormatada: GaleriaCategoria = {
            id: categoriaData.id,
            nome: categoriaData.nome,
            slug: categoriaData.slug,
            descricao: categoriaData.descricao || undefined, // ✅ Converter null para undefined
            tipo: categoriaData.tipo,
            ordem: categoriaData.ordem,
            status: categoriaData.status,
            arquivada: categoriaData.arquivada || undefined,
            created_at: categoriaData.created_at,
            updated_at: categoriaData.updated_at || undefined,
          };

          set({
            categoriaDetalhe: categoriaFormatada,
            loadingCategoriaDetalhe: false,
          });
          return categoriaFormatada;
        } catch (error) {
          console.error("❌ Erro ao buscar categoria:", error);
          set({ loadingCategoriaDetalhe: false });
          return null;
        }
      },

      // Buscar itens por categoria
      fetchItensPorCategoria: async (categoriaId: string) => {
        const { filtrosItens, getImageUrl } = get();
        set({ loadingItens: true });

        try {
          const supabase = createClient();
          const from =
            (filtrosItens.currentPage - 1) * filtrosItens.itemsPerPage;
          const to = from + filtrosItens.itemsPerPage - 1;

          // Contar total
          let countQuery = supabase
            .from("galeria_itens")
            .select("*", { count: "exact", head: true })
            .eq("categoria_id", categoriaId)
            .eq("status", true);

          if (filtrosItens.destaque !== null) {
            countQuery = countQuery.eq("destaque", filtrosItens.destaque);
          }

          const { count, error: countError } = await countQuery;
          if (countError) throw countError;

          // Buscar itens
          let query = supabase
            .from("galeria_itens")
            .select("*")
            .eq("categoria_id", categoriaId)
            .eq("status", true)
            .range(from, to);

          if (filtrosItens.destaque !== null) {
            query = query.eq("destaque", filtrosItens.destaque);
          }

          // Ordenação
          switch (filtrosItens.sortBy) {
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
          }

          const { data: itensData, error: itensError } = await query;
          if (itensError) throw itensError;

          // Processar URLs das imagens e converter tipos
          const itensComImagem = (itensData || []).map((item) => {
            const itemFormatado: GaleriaItemComImagem = {
              id: item.id,
              titulo: item.titulo,
              descricao: item.descricao || undefined, // ✅ Converter null para undefined
              categoria_id: item.categoria_id || undefined,
              tipo: item.tipo,
              arquivo_url: item.arquivo_url,
              thumbnail_url: item.thumbnail_url || undefined,
              ordem: item.ordem,
              autor_id: item.autor_id || undefined,
              status: item.status,
              destaque: item.destaque,
              created_at: item.created_at,
              imageUrl: getImageUrl(
                item.arquivo_url,
                item.tipo === "foto" ? "galeria-fotos" : "galeria-videos"
              ),
              thumbnailUrl: getImageUrl(item.thumbnail_url, "galeria-fotos"),
            };
            return itemFormatado;
          });

          set({
            itensCategoria: itensComImagem,
            totalItens: count || 0,
            loadingItens: false,
          });
        } catch (error) {
          console.error("❌ Erro ao buscar itens:", error);
          set({
            itensCategoria: [],
            totalItens: 0,
            loadingItens: false,
          });
        }
      },

      // Buscar item por ID
      fetchItemPorId: async (itemId: string) => {
        try {
          const supabase = createClient();

          const { data: itemData, error: itemError } = await supabase
            .from("galeria_itens")
            .select("*")
            .eq("id", itemId)
            .maybeSingle();

          if (itemError) throw itemError;
          if (!itemData) return null;

          // Converter para o tipo correto
          const itemFormatado: GaleriaItem = {
            id: itemData.id,
            titulo: itemData.titulo,
            descricao: itemData.descricao || undefined, // Converter null para undefined
            categoria_id: itemData.categoria_id || undefined,
            tipo: itemData.tipo,
            arquivo_url: itemData.arquivo_url,
            thumbnail_url: itemData.thumbnail_url || undefined,
            ordem: itemData.ordem,
            autor_id: itemData.autor_id || undefined,
            status: itemData.status,
            destaque: itemData.destaque,
            created_at: itemData.created_at,
          };

          set({ itemDetalhe: itemFormatado });
          return itemFormatado;
        } catch (error) {
          console.error("❌ Erro ao buscar item:", error);
          return null;
        }
      },

      // Setters de filtros para categorias
      setSearchTerm: (term: string) => {
        set((state) => ({
          filtrosCategorias: {
            ...state.filtrosCategorias,
            searchTerm: term,
            currentPage: 1,
          },
        }));
      },

      setTipo: (tipo: string) => {
        set((state) => ({
          filtrosCategorias: {
            ...state.filtrosCategorias,
            tipo,
            currentPage: 1,
          },
        }));
      },

      setSortByCategorias: (
        sortBy: "recent" | "oldest" | "popular" | "destaque"
      ) => {
        set((state) => ({
          filtrosCategorias: {
            ...state.filtrosCategorias,
            sortBy,
            currentPage: 1,
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

      setCurrentPageCategorias: (currentPage: number) => {
        set((state) => ({
          filtrosCategorias: {
            ...state.filtrosCategorias,
            currentPage,
          },
        }));
      },

      // Setters de filtros para itens
      setFilterDestaque: (destaque: boolean | null) => {
        set((state) => ({
          filtrosItens: {
            ...state.filtrosItens,
            destaque,
            currentPage: 1,
          },
        }));
      },

      setSortByItens: (sortBy: "recent" | "oldest" | "name" | "destaque") => {
        set((state) => ({
          filtrosItens: {
            ...state.filtrosItens,
            sortBy,
            currentPage: 1,
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

      setCurrentPageItens: (currentPage: number) => {
        set((state) => ({
          filtrosItens: {
            ...state.filtrosItens,
            currentPage,
          },
        }));
      },

      // Limpar estado
      clearCategoriaDetalhe: () => {
        set({ categoriaDetalhe: null });
      },

      clearItensCategoria: () => {
        set({ itensCategoria: [] });
      },
    }),
    {
      name: "galeria-storage",
      partialize: (state) => ({
        filtrosCategorias: state.filtrosCategorias,
        filtrosItens: state.filtrosItens,
      }),
    }
  )
);
