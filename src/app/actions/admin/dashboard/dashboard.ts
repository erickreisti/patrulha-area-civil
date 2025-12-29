// app/actions/admin/dashboard/dashboard.ts
"use server";

import { getAdminClient } from "@/lib/supabase/admin";

// Interface para resposta padronizada
export interface DashboardResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

// Interface para atividade do sistema
interface SystemActivity {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  user_id: string | null;
  profiles: {
    full_name: string | null;
  } | null;
}

export interface DashboardStats {
  // Usuários
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  totalAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;

  // Notícias
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  archivedNews: number;
  featuredNews: number;

  // Galeria
  totalGalleryItems: number;
  totalFotos: number;
  totalVideos: number;
  totalCategories: number;
  categoriesWithPhotos: number;
  categoriesWithVideos: number;

  // Atividades
  recentActivities: Array<{
    id: string;
    action_type: string;
    description: string;
    created_at: string;
    user_name: string | null;
  }>;

  // Resumo
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

export async function getDashboardStats(): Promise<DashboardResponse> {
  try {
    console.log("📊 [getDashboardStats] Iniciando...");

    // 1. USAR ADMIN CLIENT (ignora RLS)
    const adminClient = await getAdminClient();

    console.log("✅ [getDashboardStats] Admin client conectado");

    // 2. BUSCAR TODAS AS ESTATÍSTICAS EM PARALELO
    console.log("🔍 [getDashboardStats] Executando queries...");

    const [
      // Perfis (Agentes/Admins)
      totalProfilesRes,
      activeProfilesRes,
      inactiveProfilesRes,
      adminProfilesRes,
      activeAdminsRes,
      inactiveAdminsRes,

      // Notícias
      totalNewsRes,
      publishedNewsRes,
      draftNewsRes,
      archivedNewsRes,
      featuredNewsRes,

      // Galeria
      galleryItemsRes,
      galleryFotosRes,
      galleryVideosRes,
      galleryCategoriesRes,
      categoriesPhotosRes,
      categoriesVideosRes,

      // Atividades recentes
      recentActivitiesRes,
    ] = await Promise.allSettled([
      // ========= PERFIS =========
      adminClient.from("profiles").select("id", { count: "exact", head: true }),
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", true),
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", false),
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin"),
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("status", true),
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("status", false),

      // ========= NOTÍCIAS =========
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

      // ========= GALERIA =========
      adminClient
        .from("galeria_itens")
        .select("id", { count: "exact", head: true })
        .eq("status", true),
      adminClient
        .from("galeria_itens")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "foto")
        .eq("status", true),
      adminClient
        .from("galeria_itens")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "video")
        .eq("status", true),
      adminClient
        .from("galeria_categorias")
        .select("id", { count: "exact", head: true })
        .eq("status", true)
        .eq("arquivada", false),
      adminClient
        .from("galeria_categorias")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "fotos")
        .eq("status", true)
        .eq("arquivada", false),
      adminClient
        .from("galeria_categorias")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "videos")
        .eq("status", true)
        .eq("arquivada", false),

      // ========= ATIVIDADES RECENTES =========
      adminClient
        .from("system_activities")
        .select(
          "id, action_type, description, created_at, user_id, profiles!inner(full_name)"
        )
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    console.log("✅ [getDashboardStats] Queries concluídas");

    // 3. PROCESSAR RESULTADOS
    const getCount = (
      result: PromiseSettledResult<{ count: number | null }>
    ): number => {
      if (result.status === "fulfilled") {
        return result.value.count || 0;
      }
      console.warn("❌ [getDashboardStats] Query falhou:", result.reason);
      return 0;
    };

    // Processar atividades recentes
    let recentActivities: Array<{
      id: string;
      action_type: string;
      description: string;
      created_at: string;
      user_name: string | null;
    }> = [];

    if (
      recentActivitiesRes.status === "fulfilled" &&
      recentActivitiesRes.value.data
    ) {
      const activitiesData = recentActivitiesRes.value.data as SystemActivity[];
      if (Array.isArray(activitiesData)) {
        recentActivities = activitiesData.map((activity) => ({
          id: activity.id,
          action_type: activity.action_type,
          description: activity.description,
          created_at: activity.created_at,
          user_name: activity.profiles?.full_name || "Sistema",
        }));
      }
    }

    // Coletar estatísticas
    const stats: DashboardStats = {
      totalAgents: getCount(totalProfilesRes),
      activeAgents: getCount(activeProfilesRes),
      inactiveAgents: getCount(inactiveProfilesRes),
      totalAdmins: getCount(adminProfilesRes),
      activeAdmins: getCount(activeAdminsRes),
      inactiveAdmins: getCount(inactiveAdminsRes),
      totalNews: getCount(totalNewsRes),
      publishedNews: getCount(publishedNewsRes),
      draftNews: getCount(draftNewsRes),
      archivedNews: getCount(archivedNewsRes),
      featuredNews: getCount(featuredNewsRes),
      totalGalleryItems: getCount(galleryItemsRes),
      totalFotos: getCount(galleryFotosRes),
      totalVideos: getCount(galleryVideosRes),
      totalCategories: getCount(galleryCategoriesRes),
      categoriesWithPhotos: getCount(categoriesPhotosRes),
      categoriesWithVideos: getCount(categoriesVideosRes),
      recentActivities,
      summary: {
        agents: {
          total: getCount(totalProfilesRes),
          active: getCount(activeProfilesRes),
          inactive: getCount(inactiveProfilesRes),
        },
        admins: {
          total: getCount(adminProfilesRes),
          active: getCount(activeAdminsRes),
          inactive: getCount(inactiveAdminsRes),
        },
        news: {
          total: getCount(totalNewsRes),
          published: getCount(publishedNewsRes),
          draft: getCount(draftNewsRes),
          archived: getCount(archivedNewsRes),
          featured: getCount(featuredNewsRes),
        },
        gallery: {
          total: getCount(galleryItemsRes),
          photos: getCount(galleryFotosRes),
          videos: getCount(galleryVideosRes),
          categories: getCount(galleryCategoriesRes),
        },
      },
    };

    console.log("✅ [getDashboardStats] Dados carregados com sucesso!");

    return {
      success: true,
      data: stats,
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
