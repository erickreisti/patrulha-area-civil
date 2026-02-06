"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

// ============================================
// TYPES
// ============================================

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
  recentActivities: DashboardActivity[];
  calculations: {
    activePercentage: number;
    adminPercentage: number;
    publishedPercentage: number;
    featuredPercentage: number;
  };
}

export interface DashboardActivity {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  user_name: string | null;
}

export interface DashboardResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
  timestamp?: string;
}

interface AdminSessionData {
  expiresAt: string;
}

// ============================================
// HELPERS
// ============================================

const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// ============================================
// MAIN ACTION
// ============================================

export async function getDashboardStats(): Promise<DashboardResponse> {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const isAdminCookie = cookieStore.get("is_admin")?.value === "true";

    // 1. Verificação de Segurança (Camada Admin)
    if (!isAdminCookie || !adminSession) {
      return { success: false, error: "AUTH_REQUIRED" }; // Código de erro específico
    }

    try {
      const sessionData = JSON.parse(adminSession.value) as AdminSessionData;
      if (new Date(sessionData.expiresAt) < new Date()) {
        return { success: false, error: "AUTH_EXPIRED" };
      }
    } catch {
      return { success: false, error: "AUTH_INVALID" };
    }

    // 2. Inicializar Cliente Admin
    const supabase = createAdminClient();

    // 3. Executar Queries em Paralelo (Performance Otimizada)
    const [profilesRes, newsRes, galleryRes, activitiesRes, categoriesRes] =
      await Promise.all([
        supabase.from("profiles").select("id, status, role, full_name"),
        supabase.from("noticias").select("id, status, destaque"),
        supabase.from("galeria_itens").select("id, tipo").eq("status", true),
        supabase
          .from("system_activities")
          .select(
            `id, action_type, description, created_at, profiles(full_name)`,
          )
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("galeria_categorias")
          .select("id", { count: "exact", head: true })
          .eq("status", true),
      ]);

    // 4. Processamento de Dados
    const profiles = profilesRes.data || [];
    const news = newsRes.data || [];
    const gallery = galleryRes.data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activitiesRaw = activitiesRes.data || ([] as any[]);

    // Agentes
    const totalAgents = profiles.length;
    const activeAgents = profiles.filter((p) => p.status).length;
    const admins = profiles.filter((p) => p.role === "admin").length;

    // Notícias
    const totalNews = news.length;
    const publishedNews = news.filter((n) => n.status === "publicado").length;
    const featuredNews = news.filter(
      (n) => n.destaque && n.status === "publicado",
    ).length;

    // Galeria
    const totalGallery = gallery.length;
    const photos = gallery.filter((g) => g.tipo === "foto").length;
    const videos = gallery.filter((g) => g.tipo === "video").length;

    // Atividades
    const recentActivities: DashboardActivity[] = activitiesRaw.map((a) => ({
      id: a.id,
      action_type: a.action_type,
      description: a.description,
      created_at: a.created_at,
      user_name: a.profiles?.full_name || "Sistema",
    }));

    const last24h = recentActivities.filter(
      (a) =>
        new Date(a.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000,
    ).length;

    // 5. Retorno
    return {
      success: true,
      data: {
        summary: {
          agents: {
            total: totalAgents,
            active: activeAgents,
            inactive: totalAgents - activeAgents,
            admins: admins,
            regular: totalAgents - admins,
          },
          news: {
            total: totalNews,
            published: publishedNews,
            draft: news.filter((n) => n.status === "rascunho").length,
            archived: news.filter((n) => n.status === "arquivado").length,
            featured: featuredNews,
          },
          gallery: {
            total: totalGallery,
            photos,
            videos,
            categories: categoriesRes.count || 0,
          },
          system: {
            totalActivities: recentActivities.length, // Total buscado
            recentActivities: last24h,
            activeUsers: activeAgents,
          },
        },
        recentActivities,
        calculations: {
          activePercentage: calculatePercentage(activeAgents, totalAgents),
          adminPercentage: calculatePercentage(admins, totalAgents),
          publishedPercentage: calculatePercentage(publishedNews, totalNews),
          featuredPercentage: calculatePercentage(featuredNews, totalNews),
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro Dashboard:", error);
    return { success: false, error: "Erro interno no servidor" };
  }
}
