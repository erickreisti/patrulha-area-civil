"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

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
}

// Tipos derivados do Database
export type TipoCategoriaDB =
  Database["public"]["Tables"]["galeria_categorias"]["Row"]["tipo"];
export type TipoItemDB =
  Database["public"]["Tables"]["galeria_itens"]["Row"]["tipo"];
export type TipoCategoriaFilter = "all" | TipoCategoriaDB;

// Tipo para a resposta das categorias
export interface CategoriaComItens {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: TipoCategoriaDB;
  ordem: number;
  status: boolean;
  arquivada: boolean;
  created_at: string;
  updated_at: string;
  item_count: number;
  tem_destaque: boolean;
  ultima_imagem_url?: string;
}

// Tipo para itens da galeria
export interface ItemGaleria {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria_id: string | null;
  tipo: TipoItemDB;
  arquivo_url: string;
  thumbnail_url: string | null;
  ordem: number;
  autor_id: string | null;
  status: boolean;
  destaque: boolean;
  created_at: string;
  views: number;
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

// Tipo para estatísticas
export interface EstatisticasGaleria {
  totalFotos: number;
  totalVideos: number;
  totalCategorias: number;
  categoriasComDestaque: number;
}

// ==================== HELPER FUNCTIONS ====================

// Tipo para itens da galeria com destaque
interface GaleriaItemComDestaque {
  id: string;
  destaque: boolean;
  arquivo_url: string;
  thumbnail_url: string | null;
}

// Função para processar itens da galeria com type safety
function processarItensGaleria(itens: unknown): GaleriaItemComDestaque[] {
  if (!itens || !Array.isArray(itens)) {
    return [];
  }

  return itens
    .filter(
      (item): item is Record<string, unknown> =>
        item && typeof item === "object" && "id" in item
    )
    .map((item) => ({
      id: String(item.id),
      destaque: Boolean(item.destaque),
      arquivo_url: String(item.arquivo_url || ""),
      thumbnail_url: item.thumbnail_url ? String(item.thumbnail_url) : null,
    }));
}

// ==================== CATEGORIAS ====================

export async function getCategoriasGaleria(filters?: {
  tipo?: TipoCategoriaFilter;
  search?: string;
  sortBy?: "recent" | "oldest" | "name" | "popular" | "destaque";
  limit?: number;
  page?: number;
}): Promise<ApiResponse<CategoriaComItens[]>> {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    const {
      tipo = "all",
      search = "",
      sortBy = "recent",
      limit = 12,
      page = 1,
    } = filters || {};

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Query base
    let query = supabase.from("galeria_categorias").select(
      `
        *,
        galeria_itens!galeria_itens_categoria_id_fkey(
          id,
          destaque,
          arquivo_url,
          thumbnail_url
        )
      `,
      { count: "exact" }
    );

    // Filtros baseados na autenticação
    if (!isAuthenticated) {
      query = query.eq("status", true).eq("arquivada", false);
    }

    // Filtro de tipo
    if (tipo !== "all") {
      query = query.eq("tipo", tipo);
    }

    // Filtro de busca
    if (search.trim()) {
      query = query.or(`nome.ilike.%${search}%,descricao.ilike.%${search}%`);
    }

    // Ordenação
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
      case "popular":
        query = query.order("created_at", { ascending: false });
        break;
      case "destaque":
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Erro ao buscar categorias:", error);
      return {
        success: false,
        error: `Erro ao buscar categorias: ${error.message}`,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Processar dados para o frontend
    const categorias: CategoriaComItens[] = (data || []).map((categoria) => {
      const itens = processarItensGaleria(categoria.galeria_itens);
      const tem_destaque = itens.some((item) => item.destaque);

      // Buscar a imagem do último item em destaque ou o último item
      const ultimoItemDestaque = itens.find((item) => item.destaque);
      const ultimoItem = itens[0];
      const ultima_imagem_url =
        ultimoItemDestaque?.thumbnail_url ||
        ultimoItemDestaque?.arquivo_url ||
        ultimoItem?.thumbnail_url ||
        ultimoItem?.arquivo_url;

      return {
        id: categoria.id,
        nome: categoria.nome,
        slug: categoria.slug,
        descricao: categoria.descricao,
        tipo: categoria.tipo,
        ordem: categoria.ordem,
        status: categoria.status,
        arquivada: categoria.arquivada,
        created_at: categoria.created_at,
        updated_at: categoria.updated_at,
        item_count: itens.length,
        tem_destaque,
        ultima_imagem_url,
      };
    });

    // Ordenar por popularidade se necessário
    if (sortBy === "popular") {
      categorias.sort((a, b) => b.item_count - a.item_count);
    }

    return {
      success: true,
      data: categorias,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error("Erro em getCategoriasGaleria:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro interno do servidor",
      data: [],
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 12,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export async function getCategoriaPorSlug(
  slug: string
): Promise<ApiResponse<CategoriaComItens>> {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    // Construir query corretamente - aplicar todos os filtros ANTES do .single()
    let query = supabase
      .from("galeria_categorias")
      .select("*")
      .eq("slug", slug);

    // Aplicar filtros baseados na autenticação
    if (!isAuthenticated) {
      query = query.eq("status", true).eq("arquivada", false);
    }

    // Chamar .single() depois de aplicar todos os filtros
    const { data: categoria, error: catError } = await query.single();

    if (catError) {
      if (catError.code === "PGRST116") {
        return {
          success: false,
          error: "Categoria não encontrada",
        };
      }
      console.error("Erro ao buscar categoria:", catError);
      return {
        success: false,
        error: `Erro ao buscar categoria: ${catError.message}`,
      };
    }

    // Agora buscar os itens da categoria
    const { data: itens, error: itensError } = await supabase
      .from("galeria_itens")
      .select("id, destaque, arquivo_url, thumbnail_url")
      .eq("categoria_id", categoria.id);

    if (itensError) {
      console.error("Erro ao buscar itens da categoria:", itensError);
    }

    // Processar dados
    const itensProcessados = processarItensGaleria(itens || []);
    const tem_destaque = itensProcessados.some((item) => item.destaque);

    const ultimoItemDestaque = itensProcessados.find((item) => item.destaque);
    const ultimoItem = itensProcessados[0];
    const ultima_imagem_url =
      ultimoItemDestaque?.thumbnail_url ||
      ultimoItemDestaque?.arquivo_url ||
      ultimoItem?.thumbnail_url ||
      ultimoItem?.arquivo_url;

    const categoriaComItens: CategoriaComItens = {
      id: categoria.id,
      nome: categoria.nome,
      slug: categoria.slug,
      descricao: categoria.descricao,
      tipo: categoria.tipo,
      ordem: categoria.ordem,
      status: categoria.status,
      arquivada: categoria.arquivada,
      created_at: categoria.created_at,
      updated_at: categoria.updated_at,
      item_count: itensProcessados.length,
      tem_destaque,
      ultima_imagem_url,
    };

    return {
      success: true,
      data: categoriaComItens,
    };
  } catch (error) {
    console.error("Erro ao buscar categoria por slug:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro interno do servidor",
    };
  }
}

export async function getCategoriasDestaque(
  limit: number = 3
): Promise<ApiResponse<CategoriaComItens[]>> {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    // Buscar categorias ativas
    const { data: categorias, error: catError } = await supabase
      .from("galeria_categorias")
      .select("*")
      .eq("status", true)
      .eq("arquivada", false)
      .order("created_at", { ascending: false });

    if (catError) {
      console.error("Erro na query Supabase:", catError);
      throw catError;
    }

    if (!categorias || categorias.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Para cada categoria, buscar seus itens
    const categoriasComItens = await Promise.all(
      categorias.map(async (categoria) => {
        const { data: itens } = await supabase
          .from("galeria_itens")
          .select("id, destaque, arquivo_url, thumbnail_url")
          .eq("categoria_id", categoria.id);

        const itensProcessados = processarItensGaleria(itens || []);

        // Buscar a imagem do último item em destaque ou o último item
        const ultimoItemDestaque = itensProcessados.find(
          (item) => item.destaque
        );
        const ultimoItem = itensProcessados[0];
        const ultima_imagem_url =
          ultimoItemDestaque?.thumbnail_url ||
          ultimoItemDestaque?.arquivo_url ||
          ultimoItem?.thumbnail_url ||
          ultimoItem?.arquivo_url;

        return {
          id: categoria.id,
          nome: categoria.nome,
          slug: categoria.slug,
          descricao: categoria.descricao,
          tipo: categoria.tipo,
          ordem: categoria.ordem,
          status: categoria.status,
          arquivada: categoria.arquivada,
          created_at: categoria.created_at,
          updated_at: categoria.updated_at,
          item_count: itensProcessados.length,
          tem_destaque: itensProcessados.some((item) => item.destaque),
          ultima_imagem_url,
        };
      })
    );

    // Filtrar, ordenar e limitar
    const categoriasFiltradas = categoriasComItens
      .filter((cat) => cat.item_count > 0)
      .sort((a, b) => {
        // Ordenar por: 1) tem destaque, 2) quantidade de itens, 3) ordem
        if (a.tem_destaque !== b.tem_destaque) {
          return a.tem_destaque ? -1 : 1;
        }
        if (a.item_count !== b.item_count) {
          return b.item_count - a.item_count;
        }
        return a.ordem - b.ordem;
      })
      .slice(0, limit);

    return {
      success: true,
      data: categoriasFiltradas,
    };
  } catch (error) {
    console.error("Erro em getCategoriasDestaque:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro interno do servidor",
      data: [],
    };
  }
}

// ==================== ITENS DA GALERIA ====================

export async function getItensPorCategoria(
  categoriaId: string,
  filters?: {
    search?: string;
    sortBy?: "recent" | "oldest" | "name" | "popular" | "destaque";
    destaque?: boolean | null;
    limit?: number;
    page?: number;
  }
): Promise<ApiResponse<ItemGaleria[]>> {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    const {
      search = "",
      sortBy = "destaque",
      destaque = null,
      limit = 12,
      page = 1,
    } = filters || {};

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("galeria_itens")
      .select(
        `
        *,
        categoria:galeria_categorias!categoria_id(
          id,
          nome,
          slug
        ),
        autor:profiles!autor_id(
          id,
          full_name,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .eq("categoria_id", categoriaId);

    // Aplicar filtros baseados na autenticação
    if (!isAuthenticated) {
      query = query.eq("status", true);
    }

    // Filtros adicionais
    if (search.trim()) {
      query = query.or(`titulo.ilike.%${search}%,descricao.ilike.%${search}%`);
    }

    if (destaque !== null) {
      query = query.eq("destaque", destaque);
    }

    // Ordenação
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

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Erro ao buscar itens:", error);
      return {
        success: false,
        error: `Erro ao buscar itens: ${error.message}`,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const itens: ItemGaleria[] = (data || []).map((item) => ({
      id: item.id,
      titulo: item.titulo,
      descricao: item.descricao,
      categoria_id: item.categoria_id,
      tipo: item.tipo,
      arquivo_url: item.arquivo_url,
      thumbnail_url: item.thumbnail_url,
      ordem: item.ordem,
      autor_id: item.autor_id,
      status: item.status,
      destaque: item.destaque,
      created_at: item.created_at,
      views: item.views || 0,
      categoria: item.categoria
        ? {
            id: item.categoria.id,
            nome: item.categoria.nome,
            slug: item.categoria.slug,
          }
        : null,
      autor: item.autor
        ? {
            id: item.autor.id,
            full_name: item.autor.full_name,
            avatar_url: item.autor.avatar_url,
          }
        : null,
    }));

    return {
      success: true,
      data: itens,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar itens da galeria:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro interno do servidor",
      data: [],
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 12,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

// ==================== ESTATÍSTICAS ====================

export async function getEstatisticasGaleria(): Promise<
  ApiResponse<EstatisticasGaleria>
> {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    // Buscar todas as categorias ativas (públicas)
    const { data: categorias, error: catError } = await supabase
      .from("galeria_categorias")
      .select("*")
      .eq("status", true)
      .eq("arquivada", false);

    if (catError) {
      console.error("Erro ao buscar categorias:", catError);
      return {
        success: false,
        error: `Erro ao buscar categorias: ${catError.message}`,
        data: {
          totalFotos: 0,
          totalVideos: 0,
          totalCategorias: 0,
          categoriasComDestaque: 0,
        },
      };
    }

    // Buscar estatísticas de itens
    const { data: itensFotos } = await supabase
      .from("galeria_itens")
      .select("categoria_id, destaque")
      .eq("status", true);

    const { data: itensVideos } = await supabase
      .from("galeria_itens")
      .select("categoria_id, destaque")
      .eq("status", true);

    // Processar estatísticas
    let totalFotos = 0;
    let totalVideos = 0;
    let categoriasComDestaque = 0;

    categorias?.forEach((categoria) => {
      const itensDaCategoria = [
        ...(itensFotos?.filter((item) => item.categoria_id === categoria.id) ||
          []),
        ...(itensVideos?.filter((item) => item.categoria_id === categoria.id) ||
          []),
      ];

      if (categoria.tipo === "fotos") {
        totalFotos +=
          itensFotos?.filter((item) => item.categoria_id === categoria.id)
            .length || 0;
      } else if (categoria.tipo === "videos") {
        totalVideos +=
          itensVideos?.filter((item) => item.categoria_id === categoria.id)
            .length || 0;
      }

      if (itensDaCategoria.some((item) => item.destaque)) {
        categoriasComDestaque++;
      }
    });

    const stats: EstatisticasGaleria = {
      totalFotos,
      totalVideos,
      totalCategorias: categorias?.length || 0,
      categoriasComDestaque,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas da galeria:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar estatísticas",
      data: {
        totalFotos: 0,
        totalVideos: 0,
        totalCategorias: 0,
        categoriasComDestaque: 0,
      },
    };
  }
}

// ==================== ADMIN ====================

export async function criarCategoriaGaleria(dados: {
  nome: string;
  slug: string;
  descricao?: string;
  tipo: TipoCategoriaDB;
  ordem?: number;
  status?: boolean;
}): Promise<ApiResponse<CategoriaComItens>> {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    // Verificar se é admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return {
        success: false,
        error: "Apenas administradores podem criar categorias",
      };
    }

    const { data, error } = await supabase
      .from("galeria_categorias")
      .insert({
        ...dados,
        ordem: dados.ordem || 0,
        status: dados.status ?? true,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Erro ao criar categoria: ${error.message}`,
      };
    }

    // Revalidar cache
    revalidatePath("/galeria");
    revalidatePath("/");

    const categoria: CategoriaComItens = {
      id: data.id,
      nome: data.nome,
      slug: data.slug,
      descricao: data.descricao,
      tipo: data.tipo,
      ordem: data.ordem,
      status: data.status,
      arquivada: data.arquivada,
      created_at: data.created_at,
      updated_at: data.updated_at,
      item_count: 0,
      tem_destaque: false,
    };

    return {
      success: true,
      data: categoria,
    };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro interno do servidor",
    };
  }
}
