"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  try {
    const supabase = await createServerClient();

    // Verificar autenticação e permissões
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Não autorizado. Faça login para continuar.");
    }

    // Verificar se é admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!adminProfile) {
      throw new Error("Apenas administradores podem ver estatísticas.");
    }

    // Executar múltiplas consultas em paralelo
    const [
      agentsCount,
      activeAgentsCount,
      adminsCount,
      notificationsCount,
      activitiesCount,
      latestActivities,
    ] = await Promise.all([
      // Total de agentes
      supabase.from("profiles").select("*", { count: "exact", head: true }),

      // Agentes ativos
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", true),

      // Total de administradores
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin"),

      // Notificações não lidas
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false),

      // Atividades dos últimos 7 dias
      supabase
        .from("system_activities")
        .select("*", { count: "exact", head: true })
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),

      // Últimas 5 atividades
      supabase
        .from("system_activities")
        .select(
          `
          *,
          user:profiles!system_activities_user_id_fkey(email, full_name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return {
      success: true,
      data: {
        stats: {
          total_agents: agentsCount.count || 0,
          active_agents: activeAgentsCount.count || 0,
          total_admins: adminsCount.count || 0,
          unread_notifications: notificationsCount.count || 0,
          recent_activities: activitiesCount.count || 0,
        },
        recent_activities: latestActivities.data || [],
      },
    };
  } catch (error) {
    console.error("Erro em getDashboardStats:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar estatísticas",
      data: {
        stats: {
          total_agents: 0,
          active_agents: 0,
          total_admins: 0,
          unread_notifications: 0,
          recent_activities: 0,
        },
        recent_activities: [],
      },
    };
  }
}
