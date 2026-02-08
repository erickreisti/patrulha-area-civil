"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "../activities";

// --- TYPES ---

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

// --- HELPERS ---

const calculatePercentage = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

// --- MAIN ACTION ---

export async function getDashboardStats(): Promise<DashboardResponse> {
  try {
    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success)
      return { success: false, error: sessionCheck.error || "Acesso negado" };

    const supabase = createAdminClient();

    const [profilesRes, newsRes, galleryRes, activitiesRes, categoriesRes] =
      await Promise.all([
        supabase.from("profiles").select("id, status, role, full_name"),
        supabase.from("noticias").select("id, status, destaque"),
        supabase.from("galeria_itens").select("id, tipo").eq("status", true),
        supabase
          .from("system_activities")
          .select(
            `id, action_type, description, created_at, profiles(full_name)`,
            { count: "exact" },
          )
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("galeria_categorias")
          .select("id", { count: "exact", head: true })
          .eq("status", true),
      ]);

    const profiles = profilesRes.data || [];
    const news = newsRes.data || [];
    const gallery = galleryRes.data || [];

    // Processamento
    const totalAgents = profiles.length;
    const activeAgents = profiles.filter((p) => p.status).length;
    const admins = profiles.filter((p) => p.role === "admin").length;

    const totalNews = news.length;
    const publishedNews = news.filter((n) => n.status === "publicado").length;
    const featuredNews = news.filter(
      (n) => n.destaque && n.status === "publicado",
    ).length;

    const totalGallery = gallery.length;
    const photos = gallery.filter((g) => g.tipo === "foto").length;
    const videos = gallery.filter((g) => g.tipo === "video").length;

    const activitiesRaw = activitiesRes.data || [];
    const recentActivities: DashboardActivity[] = activitiesRaw.map((a) => {
      const profile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
      return {
        id: a.id,
        action_type: a.action_type,
        description: a.description,
        created_at: a.created_at,
        user_name: profile?.full_name || "Sistema",
      };
    });

    const last24h = recentActivities.filter(
      (a) =>
        new Date(a.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000,
    ).length;

    return {
      success: true,
      timestamp: new Date().toISOString(),
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
            totalActivities: activitiesRes.count || 0,
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
    };
  } catch (error) {
    console.error("Erro Dashboard:", error);
    return { success: false, error: "Erro interno no servidor" };
  }
}
