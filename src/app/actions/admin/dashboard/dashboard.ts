// /app/actions/admin/dashboard.ts - CORRIGIDO COMPLETO
"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@/lib/types/shared";

// Interfaces de tipos
export interface DashboardStats {
  totalAgents: number;
  totalNews: number;
  totalGalleryItems: number;
  activeAgents: number;
  totalCategories: number;
  featuredNews: number;
  publishedNews: number;
  photoItems: number;
  videoItems: number;
  photoCategories: number;
  videoCategories: number;
  totalAdmins: number;
  archivedNews: number;
  draftNews: number;
  archivedCategories: number;
  inactiveAgents: number;
}

export interface SystemActivity {
  id: string;
  user_id: string | null;
  action_type: string;
  description: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Json | null;
  created_at: string;
  user_profile: {
    id: string | null;
    full_name: string | null;
    email: string | null;
    matricula: string | null;
    role: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ActivityStats {
  total: number;
  topTypes: Array<{ type: string; count: number }>;
  timeframe: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: SystemActivity[];
  activityStats: ActivityStats;
}

// Tipos para as queries
type AgentData = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "status" | "role"
>;

type NewsData = Pick<
  Database["public"]["Tables"]["noticias"]["Row"],
  "id" | "destaque" | "status"
>;

type GalleryItemData = Pick<
  Database["public"]["Tables"]["galeria_itens"]["Row"],
  "id" | "tipo" | "status"
>;

type CategoryData = Pick<
  Database["public"]["Tables"]["galeria_categorias"]["Row"],
  "id" | "tipo" | "status" | "arquivada"
>;

type ActivityRecord = Database["public"]["Tables"]["system_activities"]["Row"];

type ProfileData = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "full_name" | "email" | "matricula" | "role" | "avatar_url"
>;

// Tipo para a resposta da galeria quando não é admin
type GalleryItemSimple = {
  id: string;
  tipo: string;
};

// Helper para verificar admin - VERSÃO MODIFICADA
async function verifyAdmin() {
  try {
    console.log("🔍 [Dashboard] Verificando acesso...");

    const supabase = await createServerClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log("🔍 [Dashboard] Sessão:", {
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id,
      email: session?.user?.email,
    });

    if (sessionError) {
      console.error("❌ [Dashboard] Erro de sessão:", sessionError);
      throw new Error(`Erro de autenticação: ${sessionError.message}`);
    }

    if (!session) {
      console.warn("⚠️ [Dashboard] Nenhuma sessão encontrada");
      throw new Error("Não autorizado. Faça login para continuar.");
    }

    // Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, status, email, matricula")
      .eq("id", session.user.id)
      .maybeSingle(); // Usar maybeSingle em vez de single

    console.log("🔍 [Dashboard] Perfil encontrado:", {
      hasProfile: !!profile,
      profileError: profileError?.message,
      profileRole: profile?.role,
      profileStatus: profile?.status,
    });

    if (profileError) {
      console.error("❌ [Dashboard] Erro ao buscar perfil:", profileError);
      // Não lançar erro se for "não encontrado", apenas retornar null
      if (profileError.code === "PGRST116") {
        console.warn("⚠️ [Dashboard] Perfil não encontrado na tabela profiles");
        return {
          session: {
            user: {
              id: session.user.id,
              email: session.user.email,
            },
          },
          profile: null,
          isAdmin: false,
          supabase,
        };
      }
      throw new Error(`Erro ao verificar perfil: ${profileError.message}`);
    }

    if (!profile) {
      console.warn("⚠️ [Dashboard] Perfil não encontrado");
      return {
        session: {
          user: {
            id: session.user.id,
            email: session.user.email,
          },
        },
        profile: null,
        isAdmin: false,
        supabase,
      };
    }

    // Verificar se é admin ativo
    const isAdmin = profile.role === "admin" && profile.status === true;

    console.log("✅ [Dashboard] Verificação concluída:", {
      userId: session.user.id,
      email: session.user.email,
      role: profile.role,
      status: profile.status,
      isAdmin: isAdmin,
    });

    return {
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      },
      profile: {
        id: profile.id,
        role: profile.role,
        status: profile.status,
        email: profile.email,
        matricula: profile.matricula,
      },
      isAdmin,
      supabase,
    };
  } catch (error) {
    console.error("❌ [Dashboard] Erro em verifyAdmin:", error);
    throw error;
  }
}

// Função para buscar estatísticas (para qualquer usuário autenticado)
async function getStats(
  supabase: SupabaseClient<Database>,
  isAdmin: boolean = false
): Promise<DashboardStats> {
  try {
    console.log("🔍 [Dashboard] Buscando estatísticas...");

    // Se não for admin, retornar apenas estatísticas públicas
    if (!isAdmin) {
      console.log(
        "🔍 [Dashboard] Usuário não é admin, buscando estatísticas limitadas..."
      );

      const promises = [
        // Contar agentes ativos (visível para todos)
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("status", true),

        // Contar notícias publicadas
        supabase
          .from("noticias")
          .select("id", { count: "exact", head: true })
          .eq("status", "publicado"),

        // Contar itens da galeria ativos - precisamos do tipo
        supabase
          .from("galeria_itens")
          .select("id, tipo")
          .eq("status", true)
          .limit(1000), // Usar limit em vez de head para pegar os dados
      ];

      const [agentsRes, newsRes, galleryRes] = await Promise.all(promises);

      // Calcular fotos e vídeos - com tipagem correta
      const galleryItems = (galleryRes.data || []) as GalleryItemSimple[];
      const photoItems = galleryItems.filter(
        (item) => item.tipo === "foto"
      ).length;
      const videoItems = galleryItems.filter(
        (item) => item.tipo === "video"
      ).length;

      return {
        totalAgents: agentsRes.count || 0,
        activeAgents: agentsRes.count || 0,
        inactiveAgents: 0,
        totalAdmins: 0,
        totalNews: newsRes.count || 0,
        publishedNews: newsRes.count || 0,
        featuredNews: 0,
        archivedNews: 0,
        draftNews: 0,
        totalGalleryItems: galleryItems.length,
        photoItems: photoItems,
        videoItems: videoItems,
        totalCategories: 0,
        photoCategories: 0,
        videoCategories: 0,
        archivedCategories: 0,
      };
    }

    // Se for admin, buscar todas as estatísticas
    console.log(
      "🔍 [Dashboard] Usuário é admin, buscando todas as estatísticas..."
    );

    const [
      { data: agentsData },
      { data: newsData },
      { data: galleryData },
      { data: categoriesData },
    ] = await Promise.all([
      supabase.from("profiles").select("id, status, role").limit(1000),
      supabase.from("noticias").select("id, destaque, status").limit(1000),
      supabase.from("galeria_itens").select("id, tipo, status").limit(1000),
      supabase
        .from("galeria_categorias")
        .select("id, tipo, status, arquivada")
        .limit(1000),
    ]);

    // Processar agentes
    const processedAgents: AgentData[] = (agentsData || []) as AgentData[];
    const totalAgents = processedAgents.length;
    const activeAgents = processedAgents.filter((agent) => agent.status).length;
    const inactiveAgents = processedAgents.filter(
      (agent) => !agent.status
    ).length;
    const totalAdmins = processedAgents.filter(
      (agent) => agent.role?.toLowerCase() === "admin"
    ).length;

    // Processar notícias
    const processedNews: NewsData[] = (newsData || []) as NewsData[];
    const totalNews = processedNews.length;
    const featuredNews = processedNews.filter((news) => news.destaque).length;
    const publishedNews = processedNews.filter(
      (news) => news.status === "publicado"
    ).length;
    const archivedNews = processedNews.filter(
      (news) => news.status === "arquivado"
    ).length;
    const draftNews = processedNews.filter(
      (news) => news.status === "rascunho"
    ).length;

    // Processar galeria
    const processedGallery: GalleryItemData[] = (galleryData ||
      []) as GalleryItemData[];
    const totalGalleryItems = processedGallery.length;
    const photoItems = processedGallery.filter(
      (item) => item.tipo === "foto"
    ).length;
    const videoItems = processedGallery.filter(
      (item) => item.tipo === "video"
    ).length;

    // Processar categorias
    const processedCategories: CategoryData[] = (categoriesData ||
      []) as CategoryData[];
    const totalCategories = processedCategories.length;
    const photoCategories = processedCategories.filter(
      (cat) => cat.tipo === "fotos"
    ).length;
    const videoCategories = processedCategories.filter(
      (cat) => cat.tipo === "videos"
    ).length;
    const archivedCategories = processedCategories.filter(
      (cat) => cat.arquivada
    ).length;

    const stats: DashboardStats = {
      totalAgents,
      totalNews,
      totalGalleryItems,
      activeAgents,
      totalCategories,
      featuredNews,
      publishedNews,
      photoItems,
      videoItems,
      photoCategories,
      videoCategories,
      totalAdmins,
      archivedNews,
      draftNews,
      archivedCategories,
      inactiveAgents,
    };

    console.log("✅ [Dashboard] Estatísticas calculadas:", stats);
    return stats;
  } catch (error) {
    console.error("❌ [Dashboard] Erro ao buscar estatísticas:", error);

    // Retornar estatísticas vazias em caso de erro
    return {
      totalAgents: 0,
      totalNews: 0,
      totalGalleryItems: 0,
      activeAgents: 0,
      totalCategories: 0,
      featuredNews: 0,
      publishedNews: 0,
      photoItems: 0,
      videoItems: 0,
      photoCategories: 0,
      videoCategories: 0,
      totalAdmins: 0,
      archivedNews: 0,
      draftNews: 0,
      archivedCategories: 0,
      inactiveAgents: 0,
    };
  }
}

// Função para buscar atividades recentes (apenas para admin)
async function getRecentActivities(
  supabase: SupabaseClient<Database>,
  isAdmin: boolean = false
): Promise<SystemActivity[]> {
  try {
    if (!isAdmin) {
      console.log(
        "🔍 [Dashboard] Usuário não é admin, não buscando atividades"
      );
      return [];
    }

    console.log("🔍 [Dashboard] Buscando atividades recentes...");

    const { data: activities, error } = await supabase
      .from("system_activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.warn("⚠️ [Dashboard] Erro ao buscar atividades:", error);
      return [];
    }

    if (!activities || activities.length === 0) {
      console.log("🔍 [Dashboard] Nenhuma atividade encontrada");
      return [];
    }

    // Buscar perfis dos usuários
    const userIds = [
      ...new Set(
        activities.map((a: ActivityRecord) => a.user_id).filter(Boolean)
      ),
    ] as string[];

    console.log("🔍 [Dashboard] User IDs para buscar:", userIds);

    let profilesMap = new Map<
      string,
      {
        id: string;
        full_name: string | null;
        email: string | null;
        matricula: string | null;
        role: string | null;
        avatar_url: string | null;
      }
    >();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, matricula, role, avatar_url")
        .in("id", userIds);

      if (profiles) {
        profilesMap = new Map(
          (profiles as ProfileData[]).map((p: ProfileData) => [
            p.id,
            {
              id: p.id,
              full_name: p.full_name,
              email: p.email,
              matricula: p.matricula,
              role: p.role,
              avatar_url: p.avatar_url,
            },
          ])
        );
      }
    }

    // Combinar dados
    const result = (activities as ActivityRecord[]).map(
      (activity: ActivityRecord) => {
        const userProfile = activity.user_id
          ? profilesMap.get(activity.user_id) || null
          : null;

        return {
          id: activity.id,
          user_id: activity.user_id,
          action_type: activity.action_type,
          description: activity.description,
          resource_type: activity.resource_type,
          resource_id: activity.resource_id,
          metadata: activity.metadata,
          created_at: activity.created_at,
          user_profile: userProfile
            ? {
                id: userProfile.id,
                full_name: userProfile.full_name,
                email: userProfile.email,
                matricula: userProfile.matricula,
                role: userProfile.role,
                avatar_url: userProfile.avatar_url,
              }
            : null,
        };
      }
    );

    console.log(`✅ [Dashboard] ${result.length} atividades processadas`);
    return result;
  } catch (error) {
    console.error("❌ [Dashboard] Erro ao buscar atividades recentes:", error);
    return [];
  }
}

// Função para buscar estatísticas de atividades (apenas para admin)
async function getActivityStats(
  supabase: SupabaseClient<Database>,
  isAdmin: boolean = false,
  timeframe: "day" | "week" | "month" = "week"
): Promise<ActivityStats> {
  try {
    if (!isAdmin) {
      console.log(
        "🔍 [Dashboard] Usuário não é admin, não buscando estatísticas de atividades"
      );
      return {
        total: 0,
        topTypes: [],
        timeframe,
      };
    }

    console.log("🔍 [Dashboard] Buscando estatísticas de atividades...");

    // Calcular datas
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    console.log("🔍 [Dashboard] Período:", {
      timeframe,
      startDate: startDate.toISOString(),
      now: now.toISOString(),
    });

    // Contar atividades por tipo
    const { data: activitiesByType, error: typeError } = await supabase
      .from("system_activities")
      .select("action_type")
      .gte("created_at", startDate.toISOString());

    if (typeError) {
      console.warn("⚠️ [Dashboard] Erro ao buscar estatísticas:", typeError);
      return {
        total: 0,
        topTypes: [],
        timeframe,
      };
    }

    // Processar estatísticas
    const stats = {
      total: activitiesByType?.length || 0,
      byType: {} as Record<string, number>,
    };

    (activitiesByType as { action_type: string }[])?.forEach(
      (activity: { action_type: string }) => {
        const type = activity.action_type;
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      }
    );

    // Top 5 tipos mais comuns
    const topTypes = Object.entries(stats.byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    const result: ActivityStats = {
      total: stats.total,
      topTypes,
      timeframe,
    };

    console.log("✅ [Dashboard] Estatísticas de atividades:", result);
    return result;
  } catch (error) {
    console.error(
      "❌ [Dashboard] Erro ao buscar estatísticas de atividades:",
      error
    );
    return {
      total: 0,
      topTypes: [],
      timeframe,
    };
  }
}

// Server Action principal - VERSÃO MELHORADA
export async function getDashboardData(): Promise<{
  success: boolean;
  data: DashboardData | null;
  error?: string;
}> {
  try {
    console.log("🔍 [Dashboard] === INICIANDO BUSCA DO DASHBOARD ===");

    // 1. Verificar acesso (não necessariamente admin)
    const authResult = await verifyAdmin();
    console.log("✅ [Dashboard] Acesso verificado:", {
      userId: authResult.session.user.id,
      email: authResult.session.user.email,
      isAdmin: authResult.isAdmin,
    });

    // 2. Buscar dados (com permissões apropriadas)
    const [stats, recentActivities, activityStats] = await Promise.all([
      getStats(authResult.supabase, authResult.isAdmin),
      getRecentActivities(authResult.supabase, authResult.isAdmin),
      getActivityStats(authResult.supabase, authResult.isAdmin, "week"),
    ]);

    const dashboardData: DashboardData = {
      stats,
      recentActivities,
      activityStats,
    };

    console.log("✅ [Dashboard] === DASHBOARD CARREGADO COM SUCESSO ===");
    console.log("📊 [Dashboard] Resumo:", {
      agentes: stats.totalAgents,
      noticias: stats.totalNews,
      fotos: stats.photoItems,
      videos: stats.videoItems,
      atividades: activityStats.total,
      isAdmin: authResult.isAdmin,
    });

    return {
      success: true,
      data: dashboardData,
    };
  } catch (error) {
    console.error("❌ [Dashboard] === ERRO NO DASHBOARD ===");

    let errorMessage = "Erro ao carregar dashboard";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Se for erro de não autorizado, retornar sucesso mas com dados vazios
    if (
      errorMessage.includes("Não autorizado") ||
      errorMessage.includes("autenticação")
    ) {
      console.warn(
        "⚠️ [Dashboard] Usuário não autenticado, retornando dados vazios"
      );
      return {
        success: true,
        data: {
          stats: {
            totalAgents: 0,
            totalNews: 0,
            totalGalleryItems: 0,
            activeAgents: 0,
            totalCategories: 0,
            featuredNews: 0,
            publishedNews: 0,
            photoItems: 0,
            videoItems: 0,
            photoCategories: 0,
            videoCategories: 0,
            totalAdmins: 0,
            archivedNews: 0,
            draftNews: 0,
            archivedCategories: 0,
            inactiveAgents: 0,
          },
          recentActivities: [],
          activityStats: {
            total: 0,
            topTypes: [],
            timeframe: "week",
          },
        },
      };
    }

    return {
      success: false,
      error: errorMessage,
      data: null,
    };
  }
}

// Função apenas para estatísticas rápidas
export async function getQuickStats(): Promise<{
  success: boolean;
  data: DashboardStats | null;
  error?: string;
}> {
  try {
    const authResult = await verifyAdmin();
    const stats = await getStats(authResult.supabase, authResult.isAdmin);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("❌ [Dashboard] Erro ao buscar estatísticas rápidas:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar estatísticas",
      data: null,
    };
  }
}
