"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

// Interface padronizada para respostas
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: {
    isAuthenticated: boolean;
    canEdit: boolean;
  };
}

// Interfaces específicas para as actions
export interface GetNewsOptions {
  limit?: number;
  page?: number;
  category?: string;
  featured?: boolean;
  search?: string;
}

export interface NoticiaInsertData {
  titulo: string;
  slug: string;
  conteudo: string;
  resumo?: string;
  imagem?: string;
  categoria?: string;
  autor_id?: string;
  destaque?: boolean;
  data_publicacao?: string;
  status?: "rascunho" | "publicado" | "arquivado";
}

export interface NoticiaUpdateData {
  titulo?: string;
  slug?: string;
  conteudo?: string;
  resumo?: string;
  imagem?: string;
  categoria?: string;
  destaque?: boolean;
  data_publicacao?: string;
  status?: "rascunho" | "publicado" | "arquivado";
}

// Tipos para as queries
export interface NoticiaLista {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  categoria: string | null;
  data_publicacao: string;
  status: "rascunho" | "publicado" | "arquivado";
  imagem: string | null;
  views: number;
  destaque: boolean;
  autor: {
    full_name: string | null;
    avatar_url: string | null;
    graduacao: string | null;
  } | null;
}

export interface NoticiaComAutor extends Noticia {
  autor: {
    full_name: string | null;
    avatar_url: string | null;
    graduacao: string | null;
    matricula: string | null;
  } | null;
}

export interface NewsStats {
  total: number;
  published: number;
  recent: number;
  featured: number;
  canViewStats: boolean;
}

// Função para notícias filtradas
export async function getNews(
  options: GetNewsOptions = {}
): Promise<ApiResponse<NoticiaLista[]>> {
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
        views,
        destaque,
        autor:profiles!noticias_autor_id_fkey(
          full_name,
          avatar_url,
          graduacao
        )
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
export async function getHomeNews(
  limit: number = 3
): Promise<ApiResponse<NoticiaLista[]>> {
  return getNews({
    limit,
  });
}

// Função para notícias em destaque
export async function getFeaturedNews(
  limit: number = 6
): Promise<ApiResponse<NoticiaLista[]>> {
  return getNews({
    limit,
    featured: true,
  });
}

// Função para uma notícia específica
export async function getNewsBySlug(
  slug: string
): Promise<ApiResponse<NoticiaComAutor>> {
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
      };
    }

    // Incrementar visualizações
    const currentViews = data.views || 0;
    await supabase
      .from("noticias")
      .update({ views: currentViews + 1 })
      .eq("id", data.id);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Erro em getNewsBySlug:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar notícia",
    };
  }
}

// Função para buscar notícias por categoria
export async function getNewsByCategory(
  category: string,
  limit: number = 6
): Promise<ApiResponse<NoticiaLista[]>> {
  return getNews({
    limit,
    category,
  });
}

// Função para buscar notícias mais recentes
export async function getLatestNews(
  limit: number = 6
): Promise<ApiResponse<NoticiaLista[]>> {
  return getNews({
    limit,
  });
}

// Função para buscar notícias relacionadas
export async function getRelatedNews(
  currentSlug: string,
  category: string,
  limit: number = 3
): Promise<ApiResponse<NoticiaLista[]>> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
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
        views,
        destaque,
        autor:profiles!noticias_autor_id_fkey(
          full_name,
          avatar_url,
          graduacao
        )
        `
      )
      .eq("categoria", category)
      .eq("status", "publicado")
      .neq("slug", currentSlug)
      .order("data_publicacao", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar notícias relacionadas: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Erro em getRelatedNews:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar notícias relacionadas",
      data: [],
    };
  }
}

// Função para buscar estatísticas de notícias
export async function getNewsStats(): Promise<ApiResponse<NewsStats>> {
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

// ==================== ADMIN ====================

export async function criarNoticia(
  dados: NoticiaInsertData
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    const supabase = await createServerClient();

    // Verificar se é admin
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Não autorizado");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Apenas administradores podem criar notícias");
    }

    const noticiaData = {
      ...dados,
      autor_id: user.user.id,
      data_publicacao:
        dados.data_publicacao || new Date().toISOString().split("T")[0],
      status: dados.status || "rascunho",
      destaque: dados.destaque || false,
      views: 0,
    };

    const { data, error } = await supabase
      .from("noticias")
      .insert(noticiaData)
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
      .single();

    if (error) throw error;

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: user.user.id,
      action_type: "news_created",
      description: `Notícia "${data.titulo}" criada`,
      resource_type: "noticia",
      resource_id: data.id,
      metadata: {
        titulo: data.titulo,
        slug: data.slug,
        status: data.status,
      },
    });

    // Revalidar cache
    revalidatePath("/noticias");
    revalidatePath("/");

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Erro ao criar notícia:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar notícia",
    };
  }
}

export async function atualizarNoticia(
  noticiaId: string,
  dados: NoticiaUpdateData
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    const supabase = await createServerClient();

    // Verificar se é admin
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Não autorizado");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Apenas administradores podem atualizar notícias");
    }

    const updateData = {
      ...dados,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("noticias")
      .update(updateData)
      .eq("id", noticiaId)
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
      .single();

    if (error) throw error;

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: user.user.id,
      action_type: "news_updated",
      description: `Notícia "${data.titulo}" atualizada`,
      resource_type: "noticia",
      resource_id: data.id,
      metadata: {
        titulo: data.titulo,
        slug: data.slug,
        status: data.status,
        destaque: data.destaque,
      },
    });

    // Revalidar cache
    revalidatePath("/noticias");
    revalidatePath(`/noticias/${data.slug}`);
    revalidatePath("/");

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar notícia",
    };
  }
}

export async function deletarNoticia(
  noticiaId: string
): Promise<ApiResponse<void>> {
  try {
    const supabase = await createServerClient();

    // Verificar se é admin
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Não autorizado");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Apenas administradores podem deletar notícias");
    }

    // Primeiro buscar dados da notícia para o log
    const { data: noticia } = await supabase
      .from("noticias")
      .select("titulo")
      .eq("id", noticiaId)
      .single();

    // Deletar notícia
    const { error } = await supabase
      .from("noticias")
      .delete()
      .eq("id", noticiaId);

    if (error) throw error;

    // Registrar atividade
    if (noticia) {
      await supabase.from("system_activities").insert({
        user_id: user.user.id,
        action_type: "news_deleted",
        description: `Notícia "${noticia.titulo}" deletada`,
        resource_type: "noticia",
        resource_id: noticiaId,
      });
    }

    // Revalidar cache
    revalidatePath("/noticias");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao deletar notícia:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao deletar notícia",
    };
  }
}

// Função para obter categorias disponíveis
export async function getCategoriasNoticias(): Promise<
  ApiResponse<Array<{ value: string; label: string }>>
> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("noticias")
      .select("categoria")
      .eq("status", "publicado")
      .not("categoria", "is", null);

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }

    // Extrair categorias únicas
    const categoriasSet = new Set<string>();
    data?.forEach((item) => {
      if (item.categoria) {
        categoriasSet.add(item.categoria);
      }
    });

    const categorias = Array.from(categoriasSet).map((cat) => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    }));

    // Ordenar alfabeticamente
    categorias.sort((a, b) => a.label.localeCompare(b.label));

    return {
      success: true,
      data: categorias,
    };
  } catch (error) {
    console.error("Erro em getCategoriasNoticias:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar categorias",
      data: [],
    };
  }
}
