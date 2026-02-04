"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// ==================== CONSTANTS ====================
const DEFAULT_CATEGORY = "Operações";

// ==================== SCHEMAS ====================
const CreateNoticiaSchema = z.object({
  titulo: z.string().min(3, "Título muito curto").max(200),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido"),
  conteudo: z.string().min(10),
  resumo: z.string().max(500).optional().nullable(),
  media_url: z.string().optional().nullable(),
  video_url: z.string().optional().nullable(),
  thumbnail_url: z.string().optional().nullable(),
  tipo_media: z.enum(["imagem", "video"]).default("imagem"),
  duracao_video: z.number().nullable().optional(),
  categoria: z.string().optional().default(DEFAULT_CATEGORY),
  destaque: z.boolean().default(false),
  data_publicacao: z.string(),
  status: z.enum(["rascunho", "publicado", "arquivado"]).default("rascunho"),
});

const UpdateNoticiaSchema = CreateNoticiaSchema.partial();

// ==================== TYPES & INTERFACES ====================
export type CreateNoticiaInput = z.infer<typeof CreateNoticiaSchema>;
export type UpdateNoticiaInput = z.infer<typeof UpdateNoticiaSchema>;

export type NoticiaStatus = "rascunho" | "publicado" | "arquivado";
export type NoticiaMedia = "imagem" | "video";

export interface NoticiaLista {
  id: string;
  titulo: string;
  slug: string;
  resumo?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  tipo_media: NoticiaMedia;
  categoria?: string | null;
  destaque: boolean;
  data_publicacao: string;
  status: NoticiaStatus;
  views: number;
  created_at: string;
  autor?: { full_name: string | null; avatar_url?: string | null } | null;
}

export interface NoticiaComAutor extends NoticiaLista {
  conteudo: string;
  video_url?: string | null;
  duracao_video?: number | null;
  autor_id: string | null;
  updated_at: string;
  autor?: {
    full_name: string | null;
    avatar_url?: string | null;
    graduacao?: string | null;
    matricula: string;
  } | null;
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

// ==================== VERIFICAÇÃO DE PERMISSÃO HÍBRIDA ====================

async function getCurrentUserRole() {
  const cookieStore = await cookies();
  const supabaseAdmin = createAdminClient();

  try {
    // 1. TENTATIVA PADRÃO: Supabase Auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {}
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Se autenticou via Supabase, verifica role
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      return { isAdmin: profile?.role === "admin", userId: user.id };
    }

    // 2. TENTATIVA CUSTOMIZADA: Cookies do seu Login ('is_admin' / 'admin_session')
    // Seus logs mostram que o login cria cookies 'admin_session' ou 'is_admin'
    const hasAdminCookie =
      cookieStore.has("is_admin") || cookieStore.has("admin_session");

    if (hasAdminCookie) {
      console.log(
        "🔓 [Auth Fallback] Sessão admin customizada detectada. Permitindo acesso.",
      );

      // Como não temos o ID do usuário fácil via cookie customizado (geralmente é criptografado),
      // Vamos buscar o primeiro ADMIN do banco para usar como "autor" da ação (System Admin)
      // OU se você tiver um cookie 'user_id', podemos usá-lo.

      // Fallback: Busca o ID do perfil que é admin (ex: você mesmo) para atribuir a autoria
      const { data: adminProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .single();

      return { isAdmin: true, userId: adminProfile?.id || null };
    }

    console.log(
      "⛔ [Auth] Nenhuma sessão encontrada (Nem Supabase, Nem Custom)",
    );
    return { isAdmin: false, userId: null };
  } catch (e) {
    console.error("Erro na verificação de role:", e);
    return { isAdmin: false, userId: null };
  }
}

// ==================== ACTIONS PÚBLICAS ====================

export async function getPublicNews(
  params: ListNoticiasInput,
): Promise<ApiResponse<NoticiaLista[]>> {
  try {
    const supabaseAdmin = createAdminClient();

    let query = supabaseAdmin
      .from("noticias")
      .select(
        `
      id, titulo, slug, resumo, media_url, thumbnail_url, tipo_media,
      categoria, destaque, data_publicacao, status, views, created_at,
      autor:profiles!noticias_autor_id_fkey(full_name, avatar_url)
    `,
        { count: "exact" },
      )
      .eq("status", "publicado");

    if (params.search)
      query = query.or(
        `titulo.ilike.%${params.search}%,resumo.ilike.%${params.search}%`,
      );
    if (params.categoria && params.categoria !== "all")
      query = query.eq("categoria", params.categoria);
    if (params.destaque !== undefined)
      query = query.eq("destaque", params.destaque);
    if (params.tipo_media && params.tipo_media !== "all")
      query = query.eq("tipo_media", params.tipo_media as NoticiaMedia);

    const column = params.sortBy === "popular" ? "views" : "created_at";
    query = query.order(column, { ascending: params.sortOrder === "asc" });

    const page = params.page || 1;
    const limit = params.limit || 6;
    const from = (page - 1) * limit;
    const { data, error, count } = await query.range(from, from + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data as unknown as NoticiaLista[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error("Erro getPublicNews:", error);
    return { success: false, error: "Falha ao buscar notícias públicas" };
  }
}

// ==================== ACTIONS ADMINISTRATIVAS ====================

export async function getNews(
  params: ListNoticiasInput,
): Promise<ApiResponse<NoticiaLista[]>> {
  try {
    const { isAdmin } = await getCurrentUserRole();

    if (!isAdmin) {
      return { success: false, error: "Acesso negado" };
    }

    const supabaseAdmin = createAdminClient();

    let query = supabaseAdmin.from("noticias").select(
      `
      id, titulo, slug, resumo, media_url, thumbnail_url, tipo_media,
      categoria, destaque, data_publicacao, status, views, created_at,
      autor:profiles!noticias_autor_id_fkey(full_name, avatar_url)
    `,
      { count: "exact" },
    );

    if (params.search)
      query = query.or(
        `titulo.ilike.%${params.search}%,resumo.ilike.%${params.search}%`,
      );
    if (params.categoria && params.categoria !== "all")
      query = query.eq("categoria", params.categoria);
    if (params.status && params.status !== "all")
      query = query.eq("status", params.status as NoticiaStatus);
    if (params.tipo_media && params.tipo_media !== "all")
      query = query.eq("tipo_media", params.tipo_media as NoticiaMedia);
    if (params.destaque !== undefined)
      query = query.eq("destaque", params.destaque);

    const column = params.sortBy === "popular" ? "views" : "created_at";
    query = query.order(column, { ascending: params.sortOrder === "asc" });

    const page = params.page || 1;
    const limit = params.limit || 20;
    const from = (page - 1) * limit;
    const { data, error, count } = await query.range(from, from + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data as unknown as NoticiaLista[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

export async function getNewsStats(): Promise<ApiResponse<NewsStats>> {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) return { success: false, error: "Acesso negado" };

    const supabaseAdmin = createAdminClient();
    const { data: stats, error } = await supabaseAdmin
      .from("noticias")
      .select("status, tipo_media, destaque, created_at");

    if (error) throw error;

    const total = stats?.length || 0;

    return {
      success: true,
      data: {
        total,
        published: stats?.filter((n) => n.status === "publicado").length || 0,
        rascunho: stats?.filter((n) => n.status === "rascunho").length || 0,
        arquivado: stats?.filter((n) => n.status === "arquivado").length || 0,
        featured: stats?.filter((n) => n.destaque).length || 0,
        videos: stats?.filter((n) => n.tipo_media === "video").length || 0,
        imagens: stats?.filter((n) => n.tipo_media === "imagem").length || 0,
        recent:
          stats?.filter(
            (n) => new Date(n.created_at) > new Date(Date.now() - 7 * 86400000),
          ).length || 0,
        canViewStats: true,
      },
    };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Erro ao carregar estatísticas";
    return { success: false, error: msg };
  }
}

export async function getNewsCategories(): Promise<
  ApiResponse<Array<{ value: string; label: string }>>
> {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("noticias")
      .select("categoria");

    if (error) throw error;
    if (!data) return { success: true, data: [] };

    const unique = Array.from(
      new Set(data.map((i) => i.categoria).filter(Boolean)),
    );
    return {
      success: true,
      data: unique.map((c) => ({ value: c!, label: c! })),
    };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Erro ao buscar categorias";
    return { success: false, error: msg };
  }
}

export async function criarNoticia(
  input: CreateNoticiaInput,
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    const { isAdmin, userId } = await getCurrentUserRole();
    if (!isAdmin || !userId)
      return { success: false, error: "Acesso não autorizado" };

    const validated = CreateNoticiaSchema.parse(input);
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("noticias")
      .insert({ ...validated, autor_id: userId })
      .select(
        `*, autor:profiles!noticias_autor_id_fkey(full_name, avatar_url, graduacao, matricula)`,
      )
      .single();

    if (error) throw error;
    revalidatePath("/admin/noticias");
    revalidatePath("/");
    return { success: true, data: data as unknown as NoticiaComAutor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function atualizarNoticia(
  id: string,
  input: UpdateNoticiaInput,
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) return { success: false, error: "Acesso negado" };

    const validated = UpdateNoticiaSchema.parse(input);
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("noticias")
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(
        `*, autor:profiles!noticias_autor_id_fkey(full_name, avatar_url, graduacao, matricula)`,
      )
      .single();

    if (error) throw error;
    revalidatePath("/admin/noticias");
    revalidatePath("/");
    return { success: true, data: data as unknown as NoticiaComAutor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar",
    };
  }
}

export async function deletarNoticia(id: string): Promise<ApiResponse<void>> {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) return { success: false, error: "Acesso negado" };

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("noticias")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/noticias");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro ao deletar";
    return { success: false, error: msg };
  }
}

export async function toggleStatus(
  id: string,
  status: string,
): Promise<ApiResponse<void>> {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) return { success: false, error: "Sem permissão" };

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("noticias")
      .update({ status: status as NoticiaStatus })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/noticias");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Erro ao alterar status";
    return { success: false, error: msg };
  }
}

export async function toggleDestaque(
  id: string,
  destaque: boolean,
): Promise<ApiResponse<void>> {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) return { success: false, error: "Sem permissão" };

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("noticias")
      .update({ destaque })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/noticias");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Erro ao alterar destaque";
    return { success: false, error: msg };
  }
}

export async function getNoticiaById(
  idOrSlug: string,
): Promise<ApiResponse<NoticiaComAutor>> {
  try {
    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin
      .from("noticias")
      .select(
        `*, autor:profiles!noticias_autor_id_fkey(full_name, avatar_url, matricula, graduacao)`,
      );

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    if (isUUID) query = query.eq("id", idOrSlug);
    else query = query.eq("slug", idOrSlug);

    const { data, error } = await query.single();

    if (error) throw error;
    return { success: true, data: data as unknown as NoticiaComAutor };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Não encontrado";
    return { success: false, error: msg };
  }
}
