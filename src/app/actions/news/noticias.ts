// @/app/actions/news/noticias.ts
"use server";

import { revalidatePath } from "next/cache";
import { z, ZodIssue } from "zod";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ============================================
// SCHEMAS DE VALIDAÇÃO ZOD
// ============================================

const BaseNoticiaSchema = z.object({
  titulo: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(200, "Título não pode exceder 200 caracteres")
    .transform((val) => val.trim()),

  slug: z
    .string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(100, "Slug não pode exceder 100 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    )
    .transform((val) => val.trim().toLowerCase()),

  conteudo: z
    .string()
    .min(10, "Conteúdo deve ter pelo menos 10 caracteres")
    .max(10000, "Conteúdo não pode exceder 10.000 caracteres")
    .transform((val) => val.trim()),

  resumo: z
    .string()
    .min(10, "Resumo deve ter pelo menos 10 caracteres")
    .max(300, "Resumo não pode exceder 300 caracteres")
    .transform((val) => val.trim()),

  imagem: z.string().url("URL da imagem inválida").nullable().optional(),
  categoria: z.string().max(50).nullable().optional(),

  destaque: z.boolean().default(false),

  data_publicacao: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .default(() => new Date().toISOString().split("T")[0]),

  status: z.enum(["rascunho", "publicado", "arquivado"]).default("rascunho"),
});

const CreateNoticiaSchema = BaseNoticiaSchema;
const UpdateNoticiaSchema = BaseNoticiaSchema.partial().extend({
  id: z.string().uuid("ID inválido"),
});

const DeleteNoticiaSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

const ListNoticiasSchema = z.object({
  search: z.string().optional(),
  categoria: z.string().optional(),
  status: z.enum(["rascunho", "publicado", "arquivado", "all"]).default("all"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  destaque: z.enum(["all", "destaque", "normal"]).default("all"),
  sortBy: z
    .enum(["data_publicacao", "created_at", "views", "titulo"])
    .default("data_publicacao"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================
// TYPES
// ============================================

export type CreateNoticiaInput = z.infer<typeof CreateNoticiaSchema>;
export type UpdateNoticiaInput = z.infer<typeof UpdateNoticiaSchema>;
export type ListNoticiasInput = z.infer<typeof ListNoticiasSchema>;

export type Noticia = {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  resumo: string | null;
  imagem: string | null;
  categoria: string | null;
  autor_id: string | null;
  destaque: boolean;
  data_publicacao: string;
  status: "rascunho" | "publicado" | "arquivado";
  created_at: string;
  updated_at: string;
  views: number;
  autor?: {
    full_name: string | null;
    avatar_url: string | null;
    graduacao: string | null;
    matricula: string | null;
  } | null;
};

export type NoticiaLista = {
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
  created_at: string;
  autor: {
    full_name: string | null;
    avatar_url: string | null;
    graduacao: string | null;
  } | null;
};

export type NoticiaComAutor = Noticia & {
  autor: {
    full_name: string | null;
    avatar_url: string | null;
    graduacao: string | null;
    matricula: string | null;
  } | null;
};

export type NewsStats = {
  total: number;
  published: number;
  recent: number;
  featured: number;
  rascunho: number;
  arquivado: number;
  canViewStats: boolean;
};

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

// Tipos para os dados retornados do Supabase
type SupabaseNoticia = {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  resumo: string | null;
  imagem: string | null;
  categoria: string | null;
  autor_id: string | null;
  destaque: boolean;
  data_publicacao: string;
  status: "rascunho" | "publicado" | "arquivado";
  created_at: string;
  updated_at: string;
  views: number;
};

type SupabaseAutor = {
  full_name: string | null;
  avatar_url: string | null;
  graduacao: string | null;
  matricula: string | null;
};

type SupabaseAutorLista = {
  full_name: string | null;
  avatar_url: string | null;
  graduacao: string | null;
};

// Tipo para dados do Supabase com autor como array
type SupabaseNoticiaWithAutor = SupabaseNoticia & {
  autor: SupabaseAutor[] | null;
};

type SupabaseNoticiaListaWithAutor = Omit<
  SupabaseNoticia,
  "conteudo" | "autor_id" | "updated_at"
> & {
  autor: SupabaseAutorLista[] | null;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function verifyAdminSession(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const isAdminCookie = cookieStore.get("is_admin")?.value === "true";

    if (!isAdminCookie) {
      return { success: false, error: "admin_session_required" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "admin_session_invalid" };
  }
}

// Função para converter dados do Supabase para nosso tipo NoticiaLista
function convertToNoticiaLista(
  data: SupabaseNoticiaListaWithAutor
): NoticiaLista {
  return {
    id: data.id,
    titulo: data.titulo,
    slug: data.slug,
    resumo: data.resumo,
    categoria: data.categoria,
    data_publicacao: data.data_publicacao,
    status: data.status,
    imagem: data.imagem,
    views: data.views,
    destaque: data.destaque,
    created_at: data.created_at,
    autor:
      data.autor && Array.isArray(data.autor) && data.autor.length > 0
        ? {
            full_name: data.autor[0].full_name,
            avatar_url: data.autor[0].avatar_url,
            graduacao: data.autor[0].graduacao,
          }
        : null,
  };
}

// Função para converter dados do Supabase para nosso tipo NoticiaComAutor
function convertToNoticiaComAutor(
  data: SupabaseNoticiaWithAutor
): NoticiaComAutor {
  return {
    id: data.id,
    titulo: data.titulo,
    slug: data.slug,
    conteudo: data.conteudo,
    resumo: data.resumo,
    imagem: data.imagem,
    categoria: data.categoria,
    autor_id: data.autor_id,
    destaque: data.destaque,
    data_publicacao: data.data_publicacao,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    views: data.views,
    autor:
      data.autor && Array.isArray(data.autor) && data.autor.length > 0
        ? {
            full_name: data.autor[0].full_name,
            avatar_url: data.autor[0].avatar_url,
            graduacao: data.autor[0].graduacao,
            matricula: data.autor[0].matricula,
          }
        : null,
  };
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Criar nova notícia
 */
export async function criarNoticia(
  input: CreateNoticiaInput
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    console.log("🔍 [criarNoticia] Iniciando...");

    // Verificar sessão admin
    const session = await verifyAdminSession();
    if (!session.success) {
      return { success: false, error: session.error };
    }

    // Validar entrada
    const validated = CreateNoticiaSchema.parse(input);

    // Usar admin client
    const adminClient = await getAdminClient();

    // Verificar slug único
    const { data: existingSlug } = await adminClient
      .from("noticias")
      .select("id")
      .eq("slug", validated.slug)
      .maybeSingle();

    if (existingSlug) {
      throw new Error("Já existe uma notícia com este slug. Altere o título.");
    }

    // Criar notícia
    const noticiaData = {
      ...validated,
      autor_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
    };

    const { data: newNoticia, error } = await adminClient
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

    if (error) {
      throw new Error(`Erro ao criar notícia: ${error.message}`);
    }

    // Revalidar cache
    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");
    revalidatePath("/");

    return {
      success: true,
      data: convertToNoticiaComAutor(newNoticia as SupabaseNoticiaWithAutor),
    };
  } catch (error) {
    console.error("❌ Erro em criarNoticia:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Erro de validação: " +
          error.issues.map((e: ZodIssue) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar notícia",
    };
  }
}

/**
 * Atualizar notícia
 */
export async function atualizarNoticia(
  id: string,
  input: Partial<UpdateNoticiaInput>
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    console.log("🔍 [atualizarNoticia] Atualizando notícia:", id);

    // Verificar sessão admin
    const session = await verifyAdminSession();
    if (!session.success) {
      return { success: false, error: session.error };
    }

    // Validar entrada
    const validated = UpdateNoticiaSchema.partial().parse({ id, ...input });

    // Usar admin client
    const adminClient = await getAdminClient();

    // Buscar notícia atual
    const { data: currentNoticia } = await adminClient
      .from("noticias")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentNoticia) {
      throw new Error("Notícia não encontrada.");
    }

    // Verificar slug único (se alterar slug)
    if (validated.slug && validated.slug !== currentNoticia.slug) {
      const { data: existingSlug } = await adminClient
        .from("noticias")
        .select("id")
        .eq("slug", validated.slug)
        .neq("id", id)
        .maybeSingle();

      if (existingSlug) {
        throw new Error(
          "Já existe outra notícia com este slug. Altere o título."
        );
      }
    }

    // Atualizar notícia
    const updateData = {
      ...validated,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedNoticia, error } = await adminClient
      .from("noticias")
      .update(updateData)
      .eq("id", id)
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

    if (error) {
      throw new Error(`Erro ao atualizar notícia: ${error.message}`);
    }

    // Revalidar cache
    revalidatePath("/noticias");
    revalidatePath(`/noticias/${updatedNoticia.slug}`);
    revalidatePath("/admin/noticias");
    revalidatePath("/");

    return {
      success: true,
      data: convertToNoticiaComAutor(
        updatedNoticia as SupabaseNoticiaWithAutor
      ),
    };
  } catch (error) {
    console.error("❌ Erro em atualizarNoticia:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Erro de validação: " +
          error.issues.map((e: ZodIssue) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar notícia",
    };
  }
}

/**
 * Deletar notícia
 */
export async function deletarNoticia(id: string): Promise<ApiResponse<void>> {
  try {
    console.log("🔍 [deletarNoticia] Excluindo notícia:", id);

    // Verificar sessão admin
    const session = await verifyAdminSession();
    if (!session.success) {
      return { success: false, error: session.error };
    }

    // Validar
    const validated = DeleteNoticiaSchema.parse({ id });

    // Usar admin client
    const adminClient = await getAdminClient();

    // Deletar notícia
    const { error } = await adminClient
      .from("noticias")
      .delete()
      .eq("id", validated.id);

    if (error) {
      throw new Error(`Erro ao excluir notícia: ${error.message}`);
    }

    // Revalidar cache
    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Erro em deletarNoticia:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir notícia",
    };
  }
}

/**
 * Listar notícias
 */
export async function getNews(
  options: Partial<ListNoticiasInput> = {}
): Promise<ApiResponse<NoticiaLista[]>> {
  try {
    // Usar admin client
    const adminClient = await getAdminClient();

    // Validar filtros
    const validatedFilters = ListNoticiasSchema.parse(options);
    const {
      search,
      categoria,
      status,
      destaque,
      page,
      limit,
      sortBy,
      sortOrder,
    } = validatedFilters;
    const offset = (page - 1) * limit;

    // Construir query
    let query = adminClient
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
        created_at,
        autor:profiles!noticias_autor_id_fkey(
          full_name,
          avatar_url,
          graduacao
        )
      `,
        { count: "exact" }
      )
      .order(sortBy, { ascending: sortOrder === "asc" });

    // Aplicar filtros
    if (search && search.trim()) {
      query = query.or(
        `titulo.ilike.%${search}%,resumo.ilike.%${search}%,conteudo.ilike.%${search}%`
      );
    }

    if (categoria && categoria !== "all") {
      query = query.eq("categoria", categoria);
    }

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (destaque !== "all") {
      query = query.eq("destaque", destaque === "destaque");
    }

    // Paginação
    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      throw new Error(`Erro ao buscar notícias: ${error.message}`);
    }

    // Converter dados para o tipo correto
    const noticias: NoticiaLista[] = (data || []).map((item) =>
      convertToNoticiaLista(item as SupabaseNoticiaListaWithAutor)
    );

    return {
      success: true,
      data: noticias,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error("❌ Erro em getNews:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar notícias",
      data: [],
      pagination: {
        page: options.page || 1,
        limit: options.limit || 20,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Buscar notícia por ID ou Slug
 */
export async function getNoticiaById(
  idOrSlug: string
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    // Usar admin client
    const adminClient = await getAdminClient();

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug
      );

    let query = adminClient.from("noticias").select(`
      *,
      autor:profiles!noticias_autor_id_fkey(
        full_name,
        avatar_url,
        graduacao,
        matricula
      )
    `);

    if (isUuid) {
      query = query.eq("id", idOrSlug);
    } else {
      query = query.eq("slug", idOrSlug);
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
    await adminClient
      .from("noticias")
      .update({ views: currentViews + 1 })
      .eq("id", data.id);

    return {
      success: true,
      data: convertToNoticiaComAutor(data as SupabaseNoticiaWithAutor),
    };
  } catch (error) {
    console.error("❌ Erro em getNoticiaById:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar notícia",
    };
  }
}

/**
 * Obter estatísticas de notícias
 */
export async function getNewsStats(): Promise<ApiResponse<NewsStats>> {
  try {
    // Usar admin client
    const adminClient = await getAdminClient();

    const [
      totalResult,
      publishedResult,
      rascunhoResult,
      arquivadoResult,
      featuredResult,
      recentResult,
    ] = await Promise.all([
      adminClient.from("noticias").select("id", { count: "exact", head: true }),
      adminClient
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .eq("status", "publicado"),
      adminClient
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .eq("status", "rascunho"),
      adminClient
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .eq("status", "arquivado"),
      adminClient
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .eq("destaque", true)
        .eq("status", "publicado"),
      adminClient
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .eq("status", "publicado")
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),
    ]);

    const stats: NewsStats = {
      total: totalResult.count || 0,
      published: publishedResult.count || 0,
      rascunho: rascunhoResult.count || 0,
      arquivado: arquivadoResult.count || 0,
      featured: featuredResult.count || 0,
      recent: recentResult.count || 0,
      canViewStats: true,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("❌ Erro em getNewsStats:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar estatísticas",
      data: {
        total: 0,
        published: 0,
        rascunho: 0,
        arquivado: 0,
        featured: 0,
        recent: 0,
        canViewStats: false,
      },
    };
  }
}

// ============================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================

/**
 * Publicar notícia
 */
export async function publicarNoticia(id: string): Promise<ApiResponse<void>> {
  try {
    await atualizarNoticia(id, {
      status: "publicado",
      data_publicacao: new Date().toISOString().split("T")[0],
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao publicar notícia",
    };
  }
}

/**
 * Arquivar notícia
 */
export async function arquivarNoticia(id: string): Promise<ApiResponse<void>> {
  try {
    await atualizarNoticia(id, {
      status: "arquivado",
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao arquivar notícia",
    };
  }
}

/**
 * Alternar destaque
 */
export async function toggleDestaque(
  id: string,
  currentDestaque: boolean
): Promise<ApiResponse<void>> {
  try {
    await atualizarNoticia(id, {
      destaque: !currentDestaque,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao alternar destaque",
    };
  }
}

/**
 * Buscar categorias disponíveis
 */
export async function getCategoriasNoticias(): Promise<
  ApiResponse<Array<{ value: string; label: string }>>
> {
  try {
    const adminClient = await getAdminClient();

    const { data, error } = await adminClient
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

    // Adicionar "Todas" como primeira opção
    categorias.unshift({ value: "all", label: "Todas categorias" });

    return {
      success: true,
      data: categorias,
    };
  } catch (error) {
    console.error("❌ Erro em getCategoriasNoticias:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar categorias",
      data: [],
    };
  }
}

/**
 * Buscar notícias mais recentes (para home page)
 */
export async function getLatestNews(
  limit: number = 3
): Promise<ApiResponse<NoticiaLista[]>> {
  try {
    // Usar admin client
    const adminClient = await getAdminClient();

    const { data, error } = await adminClient
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
        created_at,
        autor:profiles!noticias_autor_id_fkey(
          full_name,
          avatar_url,
          graduacao
        )
      `
      )
      .eq("status", "publicado")
      .order("data_publicacao", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar notícias recentes: ${error.message}`);
    }

    // Converter dados para o tipo correto
    const noticias: NoticiaLista[] = (data || []).map((item) =>
      convertToNoticiaLista(item as SupabaseNoticiaListaWithAutor)
    );

    return {
      success: true,
      data: noticias,
    };
  } catch (error) {
    console.error("❌ Erro em getLatestNews:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar notícias recentes",
      data: [],
    };
  }
}

/**
 * Validar slug único
 */
export async function validateSlug(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const adminClient = await getAdminClient();

    let query = adminClient
      .from("noticias")
      .select("id")
      .eq("slug", slug.toLowerCase());

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();
    return !data; // Disponível se não encontrar
  } catch (error) {
    console.error("❌ Erro em validateSlug:", error);
    return false;
  }
}
