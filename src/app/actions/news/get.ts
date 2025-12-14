"use server";

import { createServerClient } from "@/lib/supabase/server";
import type {
  NoticiaLista,
  NoticiaComAutor,
  NewsStats,
} from "@/lib/stores/useNoticiasStore";

// Interfaces locais
export interface GetNewsOptions {
  limit?: number;
  page?: number;
  category?: string;
  featured?: boolean;
  search?: string;
}

export interface NewsResponse {
  success: boolean;
  data: NoticiaLista[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata: {
    isAuthenticated: boolean;
    canEdit: boolean;
  };
  error?: string;
}

export interface NewsDetailResponse {
  success: boolean;
  data: NoticiaComAutor | null;
  error?: string;
}

export interface NewsStatsResponse {
  success: boolean;
  data: NewsStats;
  error?: string;
}

// Função para notícias filtradas - com tipo de retorno correto
export async function getNews(
  options: GetNewsOptions = {}
): Promise<NewsResponse> {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { limit = 6, page = 1, category, featured, search } = options;
    const offset = (page - 1) * limit;

    // Construir query base
    let query = supabase
      .from("noticias")
      .select(
        `
        id,
        titulo,
        slug,
        resumo,
        categoria,
        data_publicacao,
        status,
        imagem,
        autor:profiles!noticias_autor_id_fkey(full_name, avatar_url, graduacao),
        views,
        destaque
        `,
        { count: "exact" }
      )
      .order("data_publicacao", { ascending: false });

    // Usuários não autenticados só veem publicadas
    if (!session) {
      query = query.eq("status", "publicado");
    }

    // Aplicar filtros
    if (category) {
      query = query.eq("categoria", category);
    }

    if (featured !== undefined) {
      query = query.eq("destaque", featured);
    }

    if (search) {
      query = query.or(`titulo.ilike.%${search}%,resumo.ilike.%${search}%`);
    }

    // Paginação
    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      throw new Error(`Erro ao buscar notícias: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      metadata: {
        isAuthenticated: !!session,
        canEdit: session?.user ? true : false,
      },
    };
  } catch (error) {
    console.error("Erro em getNews:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar notícias",
      data: [],
      pagination: {
        page: options.page || 1,
        limit: options.limit || 6,
        total: 0,
        totalPages: 0,
      },
      metadata: {
        isAuthenticated: false,
        canEdit: false,
      },
    };
  }
}

// Função específica para a home page
export async function getHomeNews(limit: number = 3) {
  return getNews({
    limit,
  });
}

// Função para uma notícia específica - com tipo de retorno correto
export async function getNewsBySlug(slug: string): Promise<NewsDetailResponse> {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    let query = supabase
      .from("noticias")
      .select(
        `
        *,
        autor:profiles!noticias_autor_id_fkey(
          full_name,
          avatar_url,
          graduacao,
          matricula
        )
        `
      )
      .eq("slug", slug);

    // Usuários não autenticados só veem publicadas
    if (!session) {
      query = query.eq("status", "publicado");
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar notícia: ${error.message}`);
    }

    if (!data) {
      return {
        success: false,
        error: "Notícia não encontrada",
        data: null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Erro em getNewsBySlug:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar notícia",
      data: null,
    };
  }
}

// Função para buscar notícias por categoria
export async function getNewsByCategory(category: string, limit: number = 6) {
  return getNews({
    limit,
    category,
  });
}

// Função para buscar notícias mais recentes
export async function getLatestNews(limit: number = 6) {
  return getNews({
    limit,
  });
}

// Função para buscar estatísticas de notícias - com tipo de retorno correto
export async function getNewsStats(): Promise<NewsStatsResponse> {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const [totalPromise, publishedPromise, featuredPromise, recentPromise] =
      await Promise.allSettled([
        supabase.from("noticias").select("*", { count: "exact", head: true }),
        supabase
          .from("noticias")
          .select("*", { count: "exact", head: true })
          .eq("status", "publicado"),
        supabase
          .from("noticias")
          .select("*", { count: "exact", head: true })
          .eq("destaque", true)
          .eq("status", "publicado"),
        supabase
          .from("noticias")
          .select("*", { count: "exact", head: true })
          .eq("status", "publicado")
          .gte(
            "data_publicacao",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          ),
      ]);

    const getCount = (
      result: PromiseSettledResult<{ count: number | null }>
    ): number => {
      if (result.status === "fulfilled") {
        return result.value.count || 0;
      }
      return 0;
    };

    const stats: NewsStats = {
      total: getCount(totalPromise),
      published: getCount(publishedPromise),
      featured: getCount(featuredPromise),
      recent: getCount(recentPromise),
      canViewStats: !!session?.user,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Erro em getNewsStats:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar estatísticas",
      data: {
        total: 0,
        published: 0,
        featured: 0,
        recent: 0,
        canViewStats: false,
      },
    };
  }
}
