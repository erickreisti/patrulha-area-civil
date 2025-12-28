"use server";

import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  totalAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  archivedNews: number;
  featuredNews: number;
  totalGalleryItems: number;
  totalFotos: number;
  totalVideos: number;
  totalCategories: number;
  categoriesWithPhotos: number;
  categoriesWithVideos: number;
  recentActivities: Array<{
    id: string;
    action_type: string;
    description: string;
    created_at: string;
    user_name: string | null;
  }>;
  summary: {
    agents: { total: number; active: number; inactive: number };
    admins: { total: number; active: number; inactive: number };
    news: {
      total: number;
      published: number;
      draft: number;
      archived: number;
      featured: number;
    };
    gallery: {
      total: number;
      photos: number;
      videos: number;
      categories: number;
    };
  };
}

export interface DashboardResponse {
  success: boolean;
  stats?: DashboardStats;
  error?: string;
  debug?: {
    userId: string;
    userEmail: string;
    isAdmin: boolean;
    timestamp: string;
    queryResults?: {
      totalAgents: number;
      activeAgents: number;
      inactiveAgents: number;
      totalAdmins: number;
      activeAdmins: number;
      inactiveAdmins: number;
    };
  };
}

// Tipo para a resposta de atividades com relacionamento
type ActivityWithProfile =
  Database["public"]["Tables"]["system_activities"]["Row"] & {
    profiles: {
      full_name: string | null;
    } | null;
  };

export async function getDashboardStats(): Promise<DashboardResponse> {
  try {
    console.log("📊 [getDashboardStats] Iniciando...");

    // ✅ 1. PRIMEIRO verificar se é admin (CRÍTICO!)
    const { checkAdminAccess } = await import("@/app/actions/auth/admin");
    const accessResult = await checkAdminAccess();

    if (!accessResult.success) {
      console.error(
        "❌ [getDashboardStats] Acesso negado:",
        accessResult.error
      );
      return {
        success: false,
        error: accessResult.error || "Acesso restrito a administradores",
      };
    }

    console.log("✅ [getDashboardStats] Admin verificado:", {
      userId: accessResult.user?.id,
      email: accessResult.user?.email,
    });

    // ✅ 2. AGORA usar admin client do arquivo correto
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = await getAdminClient();

    // ✅ 3. Criar cliente normal para atividades
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    // Buscar todas as estatísticas em paralelo
    console.log("🔍 [getDashboardStats] Executando queries...");

    const [
      totalAgentsRes,
      activeAgentsRes,
      inactiveAgentsRes,
      totalAdminsRes,
      activeAdminsRes,
      inactiveAdminsRes,
      newsRes,
      publishedNewsRes,
      draftNewsRes,
      archivedNewsRes,
      featuredNewsRes,
      galleryRes,
      fotosRes,
      videosRes,
      categoriesRes,
      categoriesPhotosRes,
      categoriesVideosRes,
      activitiesRes,
    ] = await Promise.all([
      // 1. TOTAL DE PERFIS (agentes + admins)
      adminClient.from("profiles").select("id", { count: "exact", head: true }),

      // 2. PERFIS ATIVOS (status = true)
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", true),

      // 3. PERFIS INATIVOS (status = false)
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", false),

      // 4. TOTAL DE ADMINS (role = 'admin')
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin"),

      // 5. ADMINS ATIVOS (role = 'admin' e status = true)
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("status", true),

      // 6. ADMINS INATIVOS (role = 'admin' e status = false)
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("status", false),

      // 7. TOTAL DE NOTÍCIAS
      adminClient.from("noticias").select("id", { count: "exact", head: true }),

      // 8. NOTÍCIAS PUBLICADAS
      adminClient
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .eq("status", "publicado"),

      // 9. NOTÍCIAS EM RASCUNHO
      adminClient
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .eq("status", "rascunho"),

      // 10. NOTÍCIAS ARQUIVADAS
      adminClient
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .eq("status", "arquivado"),

      // 11. NOTÍCIAS EM DESTAQUE
      adminClient
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .eq("destaque", true)
        .eq("status", "publicado"),

      // 12. TOTAL DE ITENS DA GALERIA
      adminClient
        .from("galeria_itens")
        .select("id", { count: "exact", head: true })
        .eq("status", true),

      // 13. FOTOS
      adminClient
        .from("galeria_itens")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "foto")
        .eq("status", true),

      // 14. VÍDEOS
      adminClient
        .from("galeria_itens")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "video")
        .eq("status", true),

      // 15. CATEGORIAS - total
      adminClient
        .from("galeria_categorias")
        .select("id", { count: "exact", head: true })
        .eq("status", true)
        .eq("arquivada", false),

      // 16. CATEGORIAS COM FOTOS
      adminClient
        .from("galeria_categorias")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "fotos")
        .eq("status", true)
        .eq("arquivada", false),

      // 17. CATEGORIAS COM VÍDEOS
      adminClient
        .from("galeria_categorias")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "videos")
        .eq("status", true)
        .eq("arquivada", false),

      // 18. ATIVIDADES RECENTES (usa cliente normal)
      supabase
        .from("system_activities")
        .select(
          "id, action_type, description, created_at, user_id, profiles:user_id(full_name)"
        )
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Processar resultados
    console.log("🔍 [getDashboardStats] Processando resultados...");

    // Verificar erros nas queries principais
    const queryErrors = [
      totalAgentsRes.error,
      activeAgentsRes.error,
      inactiveAgentsRes.error,
      totalAdminsRes.error,
      activeAdminsRes.error,
      inactiveAdminsRes.error,
    ].filter(Boolean);

    if (queryErrors.length > 0) {
      console.error("❌ [getDashboardStats] Erros nas queries:", queryErrors);
      throw new Error(
        `Erro ao buscar estatísticas: ${queryErrors[0]?.message}`
      );
    }

    // Calcular totais
    const totalAgents = totalAgentsRes.count || 0;
    const activeAgents = activeAgentsRes.count || 0;
    const inactiveAgents = inactiveAgentsRes.count || 0;
    const totalAdmins = totalAdminsRes.count || 0;
    const activeAdmins = activeAdminsRes.count || 0;
    const inactiveAdmins = inactiveAdminsRes.count || 0;
    const totalNews = newsRes.count || 0;
    const publishedNews = publishedNewsRes.count || 0;
    const draftNews = draftNewsRes.count || 0;
    const archivedNews = archivedNewsRes.count || 0;
    const featuredNews = featuredNewsRes.count || 0;
    const totalGalleryItems = galleryRes.count || 0;
    const totalFotos = fotosRes.count || 0;
    const totalVideos = videosRes.count || 0;
    const totalCategories = categoriesRes.count || 0;
    const categoriesWithPhotos = categoriesPhotosRes.count || 0;
    const categoriesWithVideos = categoriesVideosRes.count || 0;

    // Processar atividades com tipo correto
    const activitiesData = activitiesRes.data as ActivityWithProfile[] | null;
    const recentActivities = (activitiesData || []).map((activity) => ({
      id: activity.id,
      action_type: activity.action_type,
      description: activity.description,
      created_at: activity.created_at,
      user_name: activity.profiles?.full_name || "Sistema",
    }));

    // Debug: Mostrar resultados
    console.log("📊 [getDashboardStats] Resultados obtidos:", {
      totalAgents,
      activeAgents,
      inactiveAgents,
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      totalNews,
      publishedNews,
      totalGalleryItems,
      totalFotos,
      totalVideos,
      recentActivitiesCount: recentActivities.length,
    });

    // Verificar consistência
    if (activeAgents + inactiveAgents !== totalAgents) {
      console.warn(
        "⚠️ [getDashboardStats] Inconsistência: ativos + inativos ≠ total"
      );
    }

    if (activeAdmins + inactiveAdmins !== totalAdmins) {
      console.warn(
        "⚠️ [getDashboardStats] Inconsistência: admins ativos + inativos ≠ total"
      );
    }

    // Montar resposta
    const stats: DashboardStats = {
      totalAgents,
      activeAgents,
      inactiveAgents,
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      totalNews,
      publishedNews,
      draftNews,
      archivedNews,
      featuredNews,
      totalGalleryItems,
      totalFotos,
      totalVideos,
      totalCategories,
      categoriesWithPhotos,
      categoriesWithVideos,
      recentActivities,
      summary: {
        agents: {
          total: totalAgents,
          active: activeAgents,
          inactive: inactiveAgents,
        },
        admins: {
          total: totalAdmins,
          active: activeAdmins,
          inactive: inactiveAdmins,
        },
        news: {
          total: totalNews,
          published: publishedNews,
          draft: draftNews,
          archived: archivedNews,
          featured: featuredNews,
        },
        gallery: {
          total: totalGalleryItems,
          photos: totalFotos,
          videos: totalVideos,
          categories: totalCategories,
        },
      },
    };

    console.log("✅ [getDashboardStats] Dados carregados com sucesso!");

    return {
      success: true,
      stats,
      debug: {
        userId: accessResult.user?.id || "",
        userEmail: accessResult.user?.email || "",
        isAdmin: true,
        timestamp: new Date().toISOString(),
        queryResults: {
          totalAgents,
          activeAgents,
          inactiveAgents,
          totalAdmins,
          activeAdmins,
          inactiveAdmins,
        },
      },
    };
  } catch (error) {
    console.error("❌ [getDashboardStats] Erro:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao buscar estatísticas",
    };
  }
}
