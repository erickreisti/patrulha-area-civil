// stores/useNoticiasStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Noticia } from "@/lib/supabase/types-helpers";

// Interface para notícia com autor
export interface NoticiaWithAutor extends Noticia {
  autor?: {
    full_name?: string;
    graduacao?: string;
    avatar_url?: string;
  };
}

interface NoticiasState {
  // Estado
  noticias: NoticiaWithAutor[];
  noticiaDetalhe: NoticiaWithAutor | null;
  noticiasRelacionadas: NoticiaWithAutor[];

  // Estados de loading
  loadingLista: boolean;
  loadingDetalhe: boolean;
  loadingRelacionadas: boolean;

  // Filtros e paginação
  filtros: {
    searchTerm: string;
    categoria: string;
    sortBy: "recent" | "oldest" | "destaque";
    itemsPerPage: number;
    currentPage: number;
  };

  // Estatísticas
  totalCount: number;
  categoriasDisponiveis: Array<{ value: string; label: string }>;

  // Ações
  fetchNoticias: () => Promise<void>;
  fetchNoticiaPorSlug: (slug: string) => Promise<NoticiaWithAutor | null>;
  fetchNoticiasRelacionadas: (
    categoria: string,
    excludeId: string
  ) => Promise<void>;
  fetchCategorias: () => Promise<void>;

  // Setters de filtros
  setSearchTerm: (term: string) => void;
  setCategoria: (categoria: string) => void;
  setSortBy: (sortBy: "recent" | "oldest" | "destaque") => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setCurrentPage: (page: number) => void;

  // Utilitários
  clearNoticiaDetalhe: () => void;
  clearNoticiasRelacionadas: () => void;
}

export const useNoticiasStore = create<NoticiasState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      noticias: [],
      noticiaDetalhe: null,
      noticiasRelacionadas: [],
      loadingLista: false,
      loadingDetalhe: false,
      loadingRelacionadas: false,

      filtros: {
        searchTerm: "",
        categoria: "all",
        sortBy: "recent",
        itemsPerPage: 10,
        currentPage: 1,
      },

      totalCount: 0,
      categoriasDisponiveis: [],

      // Buscar lista de notícias
      fetchNoticias: async () => {
        const { filtros } = get();
        set({ loadingLista: true });

        try {
          const supabase = createClient();
          const from = (filtros.currentPage - 1) * filtros.itemsPerPage;
          const to = from + filtros.itemsPerPage - 1;

          let query = supabase
            .from("noticias")
            .select(
              `
              *,
              autor:profiles(full_name, graduacao, avatar_url)
            `,
              { count: "exact" }
            )
            .range(from, to);

          // Apenas usuários autenticados podem ver rascunhos e arquivados
          const { data: sessionData } = await supabase.auth.getSession();

          if (!sessionData.session) {
            // Usuário não autenticado - só vê publicados
            query = query.eq("status", "publicado");
          }

          // Aplicar filtros
          if (filtros.categoria !== "all") {
            query = query.eq("categoria", filtros.categoria);
          }

          if (filtros.searchTerm.trim()) {
            query = query.or(
              `titulo.ilike.%${filtros.searchTerm}%,resumo.ilike.%${filtros.searchTerm}%,conteudo.ilike.%${filtros.searchTerm}%`
            );
          }

          // Ordenação
          switch (filtros.sortBy) {
            case "recent":
              query = query.order("data_publicacao", { ascending: false });
              break;
            case "oldest":
              query = query.order("data_publicacao", { ascending: true });
              break;
            case "destaque":
              query = query
                .order("destaque", { ascending: false })
                .order("data_publicacao", { ascending: false });
              break;
          }

          const { data, error, count } = await query;

          if (error) throw error;

          set({
            noticias: (data as NoticiaWithAutor[]) || [],
            totalCount: count || 0,
            loadingLista: false,
          });
        } catch (error) {
          console.error("❌ Erro ao buscar notícias:", error);
          set({
            noticias: [],
            totalCount: 0,
            loadingLista: false,
          });
        }
      },

      // Buscar notícia por slug
      fetchNoticiaPorSlug: async (slug: string) => {
        set({ loadingDetalhe: true });

        try {
          const supabase = createClient();

          // Primeiro verificar se o usuário está autenticado
          const { data: sessionData } = await supabase.auth.getSession();
          const isAuthenticated = !!sessionData.session;

          let query = supabase
            .from("noticias")
            .select(
              `
              *,
              autor:profiles(full_name, graduacao, avatar_url)
            `
            )
            .eq("slug", slug);

          // Se não estiver autenticado, só pode ver publicados
          if (!isAuthenticated) {
            query = query.eq("status", "publicado");
          }

          const { data, error } = await query.maybeSingle();

          if (error) throw error;
          if (!data) return null;

          const noticia = data as NoticiaWithAutor;
          set({ noticiaDetalhe: noticia, loadingDetalhe: false });
          return noticia;
        } catch (error) {
          console.error("❌ Erro ao buscar notícia:", error);
          set({ loadingDetalhe: false });
          return null;
        }
      },

      // Buscar notícias relacionadas
      fetchNoticiasRelacionadas: async (
        categoria: string,
        excludeId: string
      ) => {
        set({ loadingRelacionadas: true });

        try {
          const supabase = createClient();

          // Verificar autenticação
          const { data: sessionData } = await supabase.auth.getSession();
          const isAuthenticated = !!sessionData.session;

          let query = supabase
            .from("noticias")
            .select(
              `
              *,
              autor:profiles(full_name, graduacao, avatar_url)
            `
            )
            .eq("categoria", categoria)
            .neq("id", excludeId)
            .limit(3)
            .order("data_publicacao", { ascending: false });

          // Apenas usuários autenticados podem ver todas
          if (!isAuthenticated) {
            query = query.eq("status", "publicado");
          }

          const { data, error } = await query;

          if (error) throw error;

          set({
            noticiasRelacionadas: (data as NoticiaWithAutor[]) || [],
            loadingRelacionadas: false,
          });
        } catch (error) {
          console.error("❌ Erro ao buscar notícias relacionadas:", error);
          set({ loadingRelacionadas: false });
        }
      },

      // Buscar categorias únicas
      fetchCategorias: async () => {
        try {
          const supabase = createClient();

          // Verificar autenticação
          const { data: sessionData } = await supabase.auth.getSession();
          const isAuthenticated = !!sessionData.session;

          let query = supabase
            .from("noticias")
            .select("categoria")
            .not("categoria", "is", null);

          if (!isAuthenticated) {
            query = query.eq("status", "publicado");
          }

          const { data, error } = await query;

          if (error) throw error;

          // Extrair categorias únicas
          const categoriasMap = new Map<string, string>();
          data?.forEach((item) => {
            if (item.categoria && !categoriasMap.has(item.categoria)) {
              categoriasMap.set(item.categoria, item.categoria);
            }
          });

          const categorias = Array.from(categoriasMap.entries()).map(
            ([value, label]) => ({
              value,
              label,
            })
          );

          set({ categoriasDisponiveis: categorias });
        } catch (error) {
          console.error("❌ Erro ao buscar categorias:", error);
        }
      },

      // Setters de filtros
      setSearchTerm: (term: string) => {
        set((state) => ({
          filtros: { ...state.filtros, searchTerm: term, currentPage: 1 },
        }));
        // Auto-fetch quando terminar de digitar
        setTimeout(() => {
          get().fetchNoticias();
        }, 500);
      },

      setCategoria: (categoria: string) => {
        set((state) => ({
          filtros: { ...state.filtros, categoria, currentPage: 1 },
        }));
        get().fetchNoticias();
      },

      setSortBy: (sortBy: "recent" | "oldest" | "destaque") => {
        set((state) => ({
          filtros: { ...state.filtros, sortBy, currentPage: 1 },
        }));
        get().fetchNoticias();
      },

      setItemsPerPage: (itemsPerPage: number) => {
        set((state) => ({
          filtros: { ...state.filtros, itemsPerPage, currentPage: 1 },
        }));
        get().fetchNoticias();
      },

      setCurrentPage: (currentPage: number) => {
        set((state) => ({
          filtros: { ...state.filtros, currentPage },
        }));
        get().fetchNoticias();
      },

      // Limpar estado
      clearNoticiaDetalhe: () => {
        set({ noticiaDetalhe: null });
      },

      clearNoticiasRelacionadas: () => {
        set({ noticiasRelacionadas: [] });
      },
    }),
    {
      name: "noticias-storage",
      partialize: (state) => ({
        filtros: state.filtros,
        categoriasDisponiveis: state.categoriasDisponiveis,
      }),
    }
  )
);
