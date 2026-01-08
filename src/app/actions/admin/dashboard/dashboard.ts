// src/app/actions/admin/dashboard/dashboard.ts
"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

// ============================================
// INTERFACES
// ============================================

export interface DashboardResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
  timestamp?: string;
}

export interface DashboardStats {
  summary: {
    agents: {
      total: number;
      active: number;
      inactive: number;
      admins: number;
      regular: number;
    };
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
    system: {
      totalActivities: number;
      recentActivities: number;
      activeUsers: number;
    };
  };
  recentActivities: Array<{
    id: string;
    action_type: string;
    description: string;
    created_at: string;
    user_name: string | null;
  }>;
  calculations: {
    activePercentage: number;
    adminPercentage: number;
    publishedPercentage: number;
    featuredPercentage: number;
  };
}

// Interface para atividade com perfil
interface ActivityWithProfile {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  user_id: string | null;
  profiles: {
    full_name: string | null;
  } | null;
}

// Interface para dados da sessão admin
interface AdminSessionData {
  expiresAt: string;
  userId?: string;
  userEmail?: string;
  sessionToken?: string;
  createdAt?: string;
}

// Tipos para dados do banco
interface Profile {
  status: boolean;
  role: "admin" | "agent";
}

interface NewsItem {
  status: "publicado" | "rascunho" | "arquivado";
  destaque: boolean;
}

interface GalleryItem {
  tipo: "foto" | "video";
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// CORREÇÃO: Removido uso de 'any' - especificado tipo AdminSessionData
const isSessionValid = (sessionData: unknown): boolean => {
  try {
    // Verificar se é um objeto válido
    if (!sessionData || typeof sessionData !== "object") return false;

    const data = sessionData as AdminSessionData;
    if (!data.expiresAt) return false;

    const expiresAt = new Date(data.expiresAt);
    return expiresAt > new Date();
  } catch {
    return false;
  }
};

// ============================================
// MAIN FUNCTION - DASHBOARD STATS
// ============================================

export async function getDashboardStats(): Promise<DashboardResponse> {
  const startTime = Date.now();
  console.log("📊 [getDashboardStats] Iniciando coleta de estatísticas...");

  try {
    // Verificar cookies de admin
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const isAdminCookie = cookieStore.get("is_admin")?.value === "true";

    console.log("🍪 [getDashboardStats] Verificando cookies:", {
      hasAdminSession: !!adminSession,
      hasIsAdminCookie: isAdminCookie,
    });

    if (!isAdminCookie || !adminSession) {
      console.log("❌ [getDashboardStats] Acesso não autorizado");
      return {
        success: false,
        error: "Acesso não autorizado. Sessão admin não encontrada.",
      };
    }

    // Verificar se a sessão não expirou
    try {
      if (adminSession.value) {
        const sessionData: AdminSessionData = JSON.parse(adminSession.value);
        if (!isSessionValid(sessionData)) {
          console.log("⌛ [getDashboardStats] Sessão admin expirada");
          return {
            success: false,
            error: "Sessão expirada. Faça login novamente.",
          };
        }
      }
    } catch (error) {
      console.warn("⚠️ [getDashboardStats] Erro ao verificar sessão:", error);
      return {
        success: false,
        error: "Sessão inválida.",
      };
    }

    // 1. Conectar com Admin Client
    const adminClient = await getAdminClient();
    console.log("✅ [getDashboardStats] Admin client conectado");

    // 2. Executar queries em paralelo
    console.log("🔍 [getDashboardStats] Executando queries...");

    // Buscar dados principais
    const [profilesRes, newsRes, galleryRes, activitiesRes] = await Promise.all(
      [
        // Perfis
        adminClient.from("profiles").select("*"),
        // Notícias
        adminClient.from("noticias").select("*"),
        // Galeria
        adminClient.from("galeria_itens").select("*").eq("status", true),
        // Atividades recentes
        adminClient
          .from("system_activities")
          .select(
            `
          id,
          action_type,
          description,
          created_at,
          user_id,
          profiles!inner(full_name)
        `
          )
          .order("created_at", { ascending: false })
          .limit(10),
      ]
    );

    // 3. Processar resultados com type safety
    const profiles = profilesRes.data || [];
    const news = newsRes.data || [];
    const galleryItems = galleryRes.data || [];
    const activities = (activitiesRes.data || []) as ActivityWithProfile[];

    // Contar perfis com type safety
    const totalProfiles = profiles.length;
    const activeProfiles = profiles.filter((p: Profile) => p.status).length;
    const inactiveProfiles = profiles.filter((p: Profile) => !p.status).length;
    const totalAdmins = profiles.filter(
      (p: Profile) => p.role === "admin"
    ).length;
    const totalAgents = totalProfiles - totalAdmins;

    // Contar notícias com type safety
    const totalNews = news.length;
    const publishedNews = news.filter(
      (n: NewsItem) => n.status === "publicado"
    ).length;
    const draftNews = news.filter(
      (n: NewsItem) => n.status === "rascunho"
    ).length;
    const archivedNews = news.filter(
      (n: NewsItem) => n.status === "arquivado"
    ).length;
    const featuredNews = news.filter(
      (n: NewsItem) => n.destaque && n.status === "publicado"
    ).length;

    // Contar galeria com type safety
    const totalGalleryItems = galleryItems.length;
    const totalFotos = galleryItems.filter(
      (i: GalleryItem) => i.tipo === "foto"
    ).length;
    const totalVideos = galleryItems.filter(
      (i: GalleryItem) => i.tipo === "video"
    ).length;

    // Buscar categorias
    const categoriesRes = await adminClient
      .from("galeria_categorias")
      .select("id")
      .eq("status", true)
      .eq("arquivada", false);

    const totalCategories = categoriesRes.data?.length || 0;

    // Processar atividades com type safety
    const recentActivities = activities.map(
      (activity: ActivityWithProfile) => ({
        id: activity.id,
        action_type: activity.action_type,
        description: activity.description,
        created_at: activity.created_at,
        user_name: activity.profiles?.full_name || "Sistema",
      })
    );

    // Calcular atividades das últimas 24h
    const last24hActivities = recentActivities.filter(
      (activity) =>
        new Date(activity.created_at).getTime() >
        Date.now() - 24 * 60 * 60 * 1000
    ).length;

    // Calcular porcentagens
    const calculations = {
      activePercentage: calculatePercentage(activeProfiles, totalProfiles),
      adminPercentage: calculatePercentage(totalAdmins, totalProfiles),
      publishedPercentage: calculatePercentage(publishedNews, totalNews),
      featuredPercentage: calculatePercentage(featuredNews, totalNews),
    };

    // 4. Montar resposta
    const data: DashboardStats = {
      summary: {
        agents: {
          total: totalProfiles,
          active: activeProfiles,
          inactive: inactiveProfiles,
          admins: totalAdmins,
          regular: totalAgents,
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
        system: {
          totalActivities: recentActivities.length,
          recentActivities: last24hActivities,
          activeUsers: activeProfiles,
        },
      },
      recentActivities,
      calculations,
    };

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `✅ [getDashboardStats] Estatísticas coletadas em ${duration}ms`,
      {
        perfis: totalProfiles,
        noticias: totalNews,
        galeria: totalGalleryItems,
        atividades: recentActivities.length,
      }
    );

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ [getDashboardStats] Erro crítico:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao buscar estatísticas do sistema",
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================
// AUXILIARY FUNCTIONS
// ============================================

/**
 * Buscar estatísticas básicas para loading rápido
 */
export async function getQuickDashboardStats(): Promise<DashboardResponse> {
  try {
    const cookieStore = await cookies();
    const isAdminCookie = cookieStore.get("is_admin")?.value === "true";

    if (!isAdminCookie) {
      return {
        success: false,
        error: "Acesso não autorizado",
      };
    }

    const adminClient = await getAdminClient();

    // Buscar apenas contagens básicas para carregamento rápido
    const [profilesCount, newsCount, galleryCount, activitiesCount] =
      await Promise.all([
        adminClient
          .from("profiles")
          .select("id", { count: "exact", head: true }),
        adminClient
          .from("noticias")
          .select("id", { count: "exact", head: true }),
        adminClient
          .from("galeria_itens")
          .select("id", { count: "exact", head: true })
          .eq("status", true),
        adminClient
          .from("system_activities")
          .select("id", { count: "exact", head: true })
          .gte(
            "created_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          ),
      ]);

    return {
      success: true,
      data: {
        summary: {
          agents: {
            total: profilesCount.count || 0,
            active: 0,
            inactive: 0,
            admins: 0,
            regular: 0,
          },
          news: {
            total: newsCount.count || 0,
            published: 0,
            draft: 0,
            archived: 0,
            featured: 0,
          },
          gallery: {
            total: galleryCount.count || 0,
            photos: 0,
            videos: 0,
            categories: 0,
          },
          system: {
            totalActivities: 0,
            recentActivities: activitiesCount.count || 0,
            activeUsers: 0,
          },
        },
        recentActivities: [],
        calculations: {
          activePercentage: 0,
          adminPercentage: 0,
          publishedPercentage: 0,
          featuredPercentage: 0,
        },
      },
    };
  } catch (error) {
    console.error("❌ [getQuickDashboardStats] Erro:", error);
    return {
      success: false,
      error: "Erro ao buscar estatísticas rápidas",
    };
  }
}
