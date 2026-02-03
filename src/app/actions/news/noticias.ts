"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

// ==================== CONSTANTS ====================
const STORAGE_BUCKET = "imagens-noticias";
const DEFAULT_CATEGORY = "Operações";

// ==================== SCHEMAS ====================
const CreateNoticiaSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200),
  slug: z
    .string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(200)
    // Regex ajustado para ser um pouco mais permissivo se necessário, mas mantendo padrão url-friendly
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug deve conter apenas letras minúsculas, números e hífens",
    ),
  conteudo: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  resumo: z
    .string()
    .min(10, "Resumo deve ter pelo menos 10 caracteres")
    .max(500, "Resumo não pode exceder 500 caracteres")
    .optional()
    .nullable()
    .default(null),
  media_url: z.string().url("URL inválida").optional().nullable().default(null),
  video_url: z
    .string()
    .url("URL do vídeo inválida")
    .optional()
    .nullable()
    .default(null),
  thumbnail_url: z
    .string()
    .url("URL do thumbnail inválida")
    .optional()
    .nullable()
    .default(null),
  tipo_media: z.enum(["imagem", "video"]).default("imagem"),
  duracao_video: z
    .number()
    .int()
    .min(0)
    .max(36000)
    .nullable()
    .optional()
    .default(null),
  categoria: z.string().max(100).optional().default(DEFAULT_CATEGORY),
  destaque: z.boolean().default(false),
  data_publicacao: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data de publicação inválida",
  }),
  status: z.enum(["rascunho", "publicado", "arquivado"]).default("rascunho"),
});

const UpdateNoticiaSchema = CreateNoticiaSchema.partial();

// ==================== TYPES ====================
export type CreateNoticiaInput = z.infer<typeof CreateNoticiaSchema>;
export type UpdateNoticiaInput = z.infer<typeof UpdateNoticiaSchema>;

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

export interface NoticiaComAutor {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  resumo?: string | null;
  media_url?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  tipo_media: "imagem" | "video";
  duracao_video?: number | null;
  categoria?: string | null;
  destaque: boolean;
  data_publicacao: string;
  status: "rascunho" | "publicado" | "arquivado";
  autor_id: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  autor?: {
    full_name: string | null;
    avatar_url?: string | null;
    graduacao?: string | null;
    matricula: string;
  } | null;
}

export interface NoticiaLista {
  id: string;
  titulo: string;
  slug: string;
  resumo?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  tipo_media: "imagem" | "video";
  categoria?: string | null;
  destaque: boolean;
  data_publicacao: string;
  status: "rascunho" | "publicado" | "arquivado";
  views: number;
  created_at: string;
  autor?: {
    full_name: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface ListNoticiasInput {
  search?: string;
  categoria?: string;
  status?: string;
  destaque?: boolean;
  tipo_media?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface NewsStats {
  total: number;
  published: number;
  recent: number;
  featured: number;
  rascunho: number;
  arquivado: number;
  videos: number;
  imagens: number;
  canViewStats: boolean;
}

// ==================== FUNÇÕES DE VERIFICAÇÃO ADMIN ====================
async function checkIsAdmin() {
  const supabaseAdmin = createAdminClient();
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser();

  if (authError || !user) {
    return { isAdmin: false, userId: null };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    isAdmin: profile?.role === "admin",
    userId: user.id,
  };
}

// ==================== HELPER: UUID VALIDATOR ====================
function isUUID(str: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// ==================== CRUD FUNCTIONS ====================

// ... (criarNoticia, atualizarNoticia, deletarNoticia mantidos iguais - omitidos para brevidade se não houver mudança, mas inclua-os no arquivo final) ...
// VOU INCLUIR TUDO PARA GARANTIR

export async function criarNoticia(
  input: CreateNoticiaInput,
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    const validated = CreateNoticiaSchema.parse(input);
    const supabaseAdmin = createAdminClient();

    const { isAdmin, userId } = await checkIsAdmin();
    if (!isAdmin || !userId) {
      return { success: false, error: "Acesso não autorizado" };
    }

    const { data: existingSlug } = await supabaseAdmin
      .from("noticias")
      .select("id")
      .eq("slug", validated.slug)
      .maybeSingle();

    if (existingSlug) {
      return {
        success: false,
        error: "Já existe uma notícia com este slug. Altere o título.",
      };
    }

    const noticiaData = {
      ...validated,
      autor_id: userId,
      categoria: validated.categoria || DEFAULT_CATEGORY,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
    };

    const { data: newNoticia, error: createError } = await supabaseAdmin
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
      `,
      )
      .single();

    if (createError) {
      console.error("❌ Erro ao criar notícia:", createError);
      return {
        success: false,
        error: `Erro ao criar notícia: ${createError.message}`,
      };
    }

    await supabaseAdmin.from("system_activities").insert({
      user_id: userId,
      action_type: "noticia_created",
      description: `Notícia "${validated.titulo}" criada`,
      resource_type: "noticia",
      resource_id: newNoticia.id,
      metadata: {
        titulo: validated.titulo,
        slug: validated.slug,
        status: validated.status,
      },
    });

    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");
    revalidatePath("/");

    return {
      success: true,
      data: newNoticia,
    };
  } catch (error) {
    console.error("❌ Erro em criarNoticia:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Erro de validação: " + error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar notícia",
    };
  }
}

export async function atualizarNoticia(
  id: string,
  input: UpdateNoticiaInput,
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    const validated = UpdateNoticiaSchema.parse(input);
    const supabaseAdmin = createAdminClient();

    const { isAdmin, userId } = await checkIsAdmin();
    if (!isAdmin || !userId) {
      return { success: false, error: "Acesso não autorizado" };
    }

    const { data: currentNoticia } = await supabaseAdmin
      .from("noticias")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentNoticia) {
      return { success: false, error: "Notícia não encontrada" };
    }

    const updateData = {
      ...validated,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedNoticia, error: updateError } = await supabaseAdmin
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
      `,
      )
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await supabaseAdmin.from("system_activities").insert({
      user_id: userId,
      action_type: "noticia_updated",
      description: `Notícia "${currentNoticia.titulo}" atualizada`,
      resource_type: "noticia",
      resource_id: id,
      metadata: {
        fields_updated: Object.keys(validated),
      },
    });

    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");
    revalidatePath(`/noticias/${currentNoticia.slug}`);

    return {
      success: true,
      data: updatedNoticia,
    };
  } catch (error) {
    console.error("❌ Erro em atualizarNoticia:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function deletarNoticia(id: string): Promise<ApiResponse<void>> {
  try {
    const supabaseAdmin = createAdminClient();
    const { isAdmin, userId } = await checkIsAdmin();
    if (!isAdmin || !userId) {
      return { success: false, error: "Acesso não autorizado" };
    }

    const { data: noticia } = await supabaseAdmin
      .from("noticias")
      .select("titulo, slug, media_url, video_url")
      .eq("id", id)
      .single();

    if (!noticia) {
      return { success: false, error: "Notícia não encontrada" };
    }

    const mediaUrls = [noticia.media_url, noticia.video_url].filter(Boolean);
    for (const url of mediaUrls) {
      if (url) {
        try {
          const urlParts = url.split("/");
          const bucketIndex = urlParts.indexOf("storage") + 2;
          const path = urlParts
            .slice(bucketIndex + 1)
            .join("/")
            .split("?")[0];

          await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([path]);
        } catch (err) {
          console.warn("⚠️ Erro ao tentar deletar mídia:", err);
        }
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("noticias")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    await supabaseAdmin.from("system_activities").insert({
      user_id: userId,
      action_type: "noticia_deleted",
      description: `Notícia "${noticia.titulo}" excluída`,
      resource_type: "noticia",
      resource_id: id,
      metadata: {
        titulo: noticia.titulo,
        slug: noticia.slug,
      },
    });

    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir notícia",
    };
  }
}

// CORREÇÃO CRÍTICA NA BUSCA POR ID/SLUG
export async function getNoticiaById(
  idOrSlug: string,
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin.from("noticias").select(
      `
        *,
        autor:profiles!noticias_autor_id_fkey(
          full_name,
          avatar_url,
          graduacao,
          matricula
        )
      `,
    );

    // Verifica se é UUID válido para evitar erro de sintaxe no banco
    if (isUUID(idOrSlug)) {
      query = query.eq("id", idOrSlug);
    } else {
      query = query.eq("slug", idOrSlug);
    }

    const { data: noticia, error } = await query.single();

    if (error) {
      console.error("Erro Supabase (getNoticiaById):", error);
      return { success: false, error: "Notícia não encontrada" };
    }

    if (noticia.status === "publicado") {
      // Incrementa views sem bloquear o retorno (fire and forget)
      supabaseAdmin
        .from("noticias")
        .update({ views: (noticia.views || 0) + 1 })
        .eq("id", noticia.id)
        .then();
    }

    return { success: true, data: noticia };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar notícia",
    };
  }
}

export async function getNews(
  params: ListNoticiasInput,
): Promise<ApiResponse<NoticiaLista[]>> {
  try {
    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin.from("noticias").select(
      `
        id,
        titulo,
        slug,
        resumo,
        media_url,
        thumbnail_url,
        tipo_media,
        categoria,
        destaque,
        data_publicacao,
        status,
        views,
        created_at,
        autor:profiles!noticias_autor_id_fkey(
          full_name,
          avatar_url
        )
      `,
      { count: "exact" },
    );

    if (params.search) {
      query = query.or(
        `titulo.ilike.%${params.search}%,conteudo.ilike.%${params.search}%,resumo.ilike.%${params.search}%`,
      );
    }

    if (params.categoria && params.categoria !== "all") {
      query = query.eq("categoria", params.categoria);
    }

    if (params.status && params.status !== "all") {
      query = query.eq(
        "status",
        params.status as "rascunho" | "publicado" | "arquivado",
      );
    }

    if (params.destaque !== undefined) {
      query = query.eq("destaque", params.destaque);
    }

    if (params.tipo_media && params.tipo_media !== "all") {
      query = query.eq("tipo_media", params.tipo_media as "imagem" | "video");
    }

    const sortBy = params.sortBy || "created_at";
    const sortOrder = params.sortOrder || "desc";

    // Mapeamento seguro de ordenação
    if (sortBy === "recent" || sortBy === "created_at") {
      query = query.order("created_at", { ascending: sortOrder === "asc" });
    } else if (sortBy === "oldest") {
      query = query.order("created_at", { ascending: true }); // Oldest = asc
    } else if (sortBy === "popular" || sortBy === "views") {
      query = query.order("views", { ascending: sortOrder === "asc" });
    } else if (sortBy === "titulo") {
      query = query.order("titulo", { ascending: sortOrder === "asc" });
    } else if (sortBy === "data_publicacao") {
      query = query.order("data_publicacao", {
        ascending: sortOrder === "asc",
      });
    } else if (sortBy === "destaque") {
      // Primeiro destaques, depois data
      query = query
        .order("destaque", { ascending: false }) // True vem antes
        .order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data: noticias, error, count } = await query;

    if (error) {
      console.error("❌ Erro ao buscar notícias:", error);
      return { success: false, error: error.message };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: noticias || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar notícias",
    };
  }
}

// ... (getNewsStats, getNewsCategories, toggleStatus, toggleDestaque mantidos iguais) ...
// VOU INCLUIR AQUI PARA NÃO TER ERRO DE LINKING

export async function getNewsStats(): Promise<ApiResponse<NewsStats>> {
  try {
    const supabaseAdmin = createAdminClient();
    const { isAdmin } = await checkIsAdmin();

    if (!isAdmin) {
      return {
        success: true,
        data: {
          total: 0,
          published: 0,
          recent: 0,
          featured: 0,
          rascunho: 0,
          arquivado: 0,
          videos: 0,
          imagens: 0,
          canViewStats: false,
        },
      };
    }

    const { data: stats, error } = await supabaseAdmin
      .from("noticias")
      .select("status, tipo_media, destaque, created_at", { count: "exact" });

    if (error) {
      return {
        success: true,
        data: {
          total: 0,
          published: 0,
          recent: 0,
          featured: 0,
          rascunho: 0,
          arquivado: 0,
          videos: 0,
          imagens: 0,
          canViewStats: true,
        },
      };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const total = stats?.length || 0;
    const published =
      stats?.filter((n) => n.status === "publicado").length || 0;
    const rascunho = stats?.filter((n) => n.status === "rascunho").length || 0;
    const arquivado =
      stats?.filter((n) => n.status === "arquivado").length || 0;
    const recent =
      stats?.filter((n) => new Date(n.created_at) > sevenDaysAgo).length || 0;
    const featured = stats?.filter((n) => n.destaque).length || 0;
    const videos = stats?.filter((n) => n.tipo_media === "video").length || 0;
    const imagens = stats?.filter((n) => n.tipo_media === "imagem").length || 0;

    return {
      success: true,
      data: {
        total,
        published,
        recent,
        featured,
        rascunho,
        arquivado,
        videos,
        imagens,
        canViewStats: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar estatísticas",
    };
  }
}

export async function getNewsCategories(): Promise<
  ApiResponse<Array<{ value: string; label: string }>>
> {
  try {
    const supabaseAdmin = createAdminClient();

    const { data: result, error } = await supabaseAdmin
      .from("noticias")
      .select("categoria")
      .not("categoria", "is", null)
      .order("categoria");

    if (error) {
      console.error("❌ Erro ao buscar categorias:", error);
      return { success: false, error: error.message };
    }

    if (!result || result.length === 0) {
      return { success: true, data: [] };
    }

    const uniqueCategories = new Set<string>();

    result.forEach((item) => {
      if (
        item.categoria &&
        typeof item.categoria === "string" &&
        item.categoria.trim().length > 0
      ) {
        uniqueCategories.add(item.categoria.trim());
      }
    });

    const formatted = Array.from(uniqueCategories)
      .sort()
      .map((cat) => ({
        value: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
      }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("❌ Erro em getNewsCategories:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar categorias",
    };
  }
}

export async function toggleStatus(
  id: string,
  currentStatus: "rascunho" | "publicado" | "arquivado",
): Promise<ApiResponse<void>> {
  try {
    const supabaseAdmin = createAdminClient();
    const { isAdmin, userId } = await checkIsAdmin();
    if (!isAdmin || !userId) {
      return { success: false, error: "Acesso não autorizado" };
    }

    let newStatus: "rascunho" | "publicado" | "arquivado";
    if (currentStatus === "rascunho") newStatus = "publicado";
    else if (currentStatus === "publicado") newStatus = "arquivado";
    else newStatus = "rascunho";

    const { error } = await supabaseAdmin
      .from("noticias")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: noticia } = await supabaseAdmin
      .from("noticias")
      .select("titulo")
      .eq("id", id)
      .single();

    await supabaseAdmin.from("system_activities").insert({
      user_id: userId,
      action_type: "noticia_status_changed",
      description: `Status da notícia "${noticia?.titulo || id}" alterado para ${newStatus}`,
      resource_type: "noticia",
      resource_id: id,
      metadata: {
        old_status: currentStatus,
        new_status: newStatus,
      },
    });

    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao alterar status",
    };
  }
}

export async function toggleDestaque(
  id: string,
  currentDestaque: boolean,
): Promise<ApiResponse<void>> {
  try {
    const supabaseAdmin = createAdminClient();
    const { isAdmin, userId } = await checkIsAdmin();
    if (!isAdmin || !userId) {
      return { success: false, error: "Acesso não autorizado" };
    }

    const newDestaque = !currentDestaque;

    const { error } = await supabaseAdmin
      .from("noticias")
      .update({
        destaque: newDestaque,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: noticia } = await supabaseAdmin
      .from("noticias")
      .select("titulo")
      .eq("id", id)
      .single();

    await supabaseAdmin.from("system_activities").insert({
      user_id: userId,
      action_type: "noticia_destaque_toggled",
      description: `Notícia "${noticia?.titulo || id}" ${
        newDestaque ? "definida como" : "removida de"
      } destaque`,
      resource_type: "noticia",
      resource_id: id,
      metadata: { new_destaque: newDestaque },
    });

    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao alterar destaque",
    };
  }
}
