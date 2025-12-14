"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

// Tipos baseados no Database
type TipoCategoria =
  Database["public"]["Tables"]["galeria_categorias"]["Row"]["tipo"];
type TipoItem = Database["public"]["Tables"]["galeria_itens"]["Row"]["tipo"];

// Tipo para a resposta das categorias
export interface CategoriaComItens {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: TipoCategoria;
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
  tipo: TipoItem;
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

// ==================== CATEGORIAS ====================

export async function getCategoriasGaleria(filters?: {
  tipo?: "all" | TipoCategoria;
  search?: string;
  sortBy?: "recent" | "oldest" | "name" | "popular" | "destaque";
  limit?: number;
  page?: number;
}) {
  try {
    const supabase = await createServerClient();

    const {
      tipo = "all",
      search = "",
      sortBy = "recent",
      limit = 12,
      page = 1,
    } = filters || {};

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("galeria_categorias")
      .select(
        `*,
        galeria_itens:galeria_itens!galeria_itens_categoria_id_fkey(
          id,
          destaque,
          arquivo_url,
          thumbnail_url
        )`,
        { count: "exact" }
      )
      .eq("status", true)
      .eq("arquivada", false);

    // Filtros
    if (search.trim()) {
      query = query.or(`nome.ilike.%${search}%,descricao.ilike.%${search}%`);
    }

    if (tipo !== "all") {
      query = query.eq("tipo", tipo);
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
      case "destaque":
        query = query.order("ordem", { ascending: true });
        break;
      case "popular":
        query = query.order("ordem", { ascending: true });
        break;
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Erro ao buscar categorias:", error);
      throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }

    // Processar dados para o frontend
    const categorias: CategoriaComItens[] = (data || []).map((categoria) => {
      const itens = categoria.galeria_itens || [];
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
      data: categorias,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("Erro em getCategoriasGaleria:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      error: "Erro ao carregar categorias",
    };
  }
}

export async function getCategoriaPorSlug(slug: string) {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("galeria_categorias")
      .select("*")
      .eq("slug", slug)
      .eq("status", true)
      .eq("arquivada", false)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return {
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
    };
  } catch (error: unknown) {
    console.error("Erro ao buscar categoria por slug:", error);
    return null;
  }
}

export async function getCategoriasDestaque(
  limit: number = 3
): Promise<CategoriaComItens[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("galeria_categorias")
      .select(
        `*,
        galeria_itens:galeria_itens!galeria_itens_categoria_id_fkey(
          id,
          destaque,
          arquivo_url,
          thumbnail_url
        )`
      )
      .eq("status", true)
      .eq("arquivada", false)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Processar dados e filtrar categorias que possuem itens
    const categorias: CategoriaComItens[] = data
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
          tem_destaque: itens.some((item) => item.destaque),
          ultima_imagem_url,
        };
      })
      .filter((cat) => cat.item_count > 0) // Apenas categorias com itens
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
      .slice(0, limit); // Limitar ao número solicitado

    return categorias;
  } catch (error) {
    console.error("Erro ao buscar categorias em destaque:", error);
    return [];
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
) {
  try {
    const supabase = await createServerClient();

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
        `*,
        categoria:galeria_categorias(id, nome, slug),
        autor:profiles(id, full_name, avatar_url)`,
        { count: "exact" }
      )
      .eq("categoria_id", categoriaId)
      .eq("status", true);

    // Filtros
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

    if (error) throw error;

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
      categoria: item.categoria,
      autor: item.autor,
    }));

    return {
      data: itens,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("Erro ao buscar itens da galeria:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      error: "Erro ao carregar itens",
    };
  }
}

export async function getItemPorId(
  itemId: string
): Promise<ItemGaleria | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("galeria_itens")
      .select(
        `*,
        categoria:galeria_categorias(id, nome, slug),
        autor:profiles(id, full_name, avatar_url)`
      )
      .eq("id", itemId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return {
      id: data.id,
      titulo: data.titulo,
      descricao: data.descricao,
      categoria_id: data.categoria_id,
      tipo: data.tipo,
      arquivo_url: data.arquivo_url,
      thumbnail_url: data.thumbnail_url,
      ordem: data.ordem,
      autor_id: data.autor_id,
      status: data.status,
      destaque: data.destaque,
      created_at: data.created_at,
      views: data.views || 0,
      categoria: data.categoria,
      autor: data.autor,
    };
  } catch (error: unknown) {
    console.error("Erro ao buscar item por ID:", error);
    return null;
  }
}

export async function incrementarViewsItem(itemId: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();

    // Buscar views atuais
    const { data: item, error: fetchError } = await supabase
      .from("galeria_itens")
      .select("views")
      .eq("id", itemId)
      .single();

    if (fetchError) throw fetchError;

    // Incrementar views
    const { error: updateError } = await supabase
      .from("galeria_itens")
      .update({ views: (item.views || 0) + 1 })
      .eq("id", itemId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("Erro ao incrementar views:", error);
    return false;
  }
}

// ==================== ESTATÍSTICAS ====================

export async function getEstatisticasGaleria(): Promise<EstatisticasGaleria> {
  try {
    const supabase = await createServerClient();

    // Buscar todas as categorias ativas
    const { data: categorias, error: catError } = await supabase
      .from("galeria_categorias")
      .select(
        `id,
        tipo,
        galeria_itens:galeria_itens!galeria_itens_categoria_id_fkey(id, destaque)`
      )
      .eq("status", true)
      .eq("arquivada", false);

    if (catError) throw catError;

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

    return {
      totalFotos,
      totalVideos,
      totalCategorias: categorias?.length || 0,
      categoriasComDestaque,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas da galeria:", error);
    return {
      totalFotos: 0,
      totalVideos: 0,
      totalCategorias: 0,
      categoriasComDestaque: 0,
    };
  }
}

// ==================== ADMIN ====================

export async function criarCategoriaGaleria(dados: {
  nome: string;
  slug: string;
  descricao?: string;
  tipo: TipoCategoria;
  ordem?: number;
  status?: boolean;
}) {
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
      throw new Error("Apenas administradores podem criar categorias");
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

    if (error) throw error;

    // Revalidar cache
    revalidatePath("/galeria");

    return {
      success: true,
      data: {
        id: data.id,
        nome: data.nome,
        slug: data.slug,
        descricao: data.descricao,
        tipo: data.tipo,
        ordem: data.ordem,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        arquivada: data.arquivada,
      },
    };
  } catch (error: unknown) {
    console.error("Erro ao criar categoria:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao criar categoria";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function atualizarCategoriaGaleria(
  categoriaId: string,
  dados: Partial<{
    nome: string;
    slug: string;
    descricao: string;
    tipo: TipoCategoria;
    ordem: number;
    status: boolean;
    arquivada: boolean;
  }>
) {
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
      throw new Error("Apenas administradores podem atualizar categorias");
    }

    const { error } = await supabase
      .from("galeria_categorias")
      .update({
        ...dados,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoriaId);

    if (error) throw error;

    // Revalidar cache
    revalidatePath("/galeria");
    revalidatePath("/galeria/*");

    return { success: true };
  } catch (error: unknown) {
    console.error("Erro ao atualizar categoria:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao atualizar categoria";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function criarItemGaleria(dados: {
  titulo: string;
  descricao?: string;
  categoria_id: string;
  tipo: TipoItem;
  arquivo_url: string;
  thumbnail_url?: string;
  ordem?: number;
  destaque?: boolean;
  status?: boolean;
}) {
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
      throw new Error("Apenas administradores podem criar itens");
    }

    const { data, error } = await supabase
      .from("galeria_itens")
      .insert({
        ...dados,
        autor_id: user.user.id,
        ordem: dados.ordem || 0,
        destaque: dados.destaque ?? false,
        status: dados.status ?? true,
      })
      .select(
        `*,
        categoria:galeria_categorias(id, nome, slug),
        autor:profiles(id, full_name, avatar_url)`
      )
      .single();

    if (error) throw error;

    // Revalidar cache
    revalidatePath("/galeria");
    if (data.categoria?.slug) {
      revalidatePath(`/galeria/${data.categoria.slug}`);
    }

    return {
      success: true,
      data: {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        categoria_id: data.categoria_id,
        tipo: data.tipo,
        arquivo_url: data.arquivo_url,
        thumbnail_url: data.thumbnail_url,
        ordem: data.ordem,
        autor_id: data.autor_id,
        status: data.status,
        destaque: data.destaque,
        created_at: data.created_at,
        views: data.views || 0,
        categoria: data.categoria,
        autor: data.autor,
      },
    };
  } catch (error: unknown) {
    console.error("Erro ao criar item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao criar item";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
