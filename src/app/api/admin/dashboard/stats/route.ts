import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api/middleware/auth";
import {
  handleApiError,
  createSuccessResponse,
} from "@/lib/utils/error-handler";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { supabaseAdmin } = authResult;

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
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true }),

      // Agentes ativos
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", true),

      // Total de administradores
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin"),

      // Notificações não lidas
      supabaseAdmin
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false),

      // Atividades dos últimos 7 dias
      supabaseAdmin
        .from("system_activities")
        .select("*", { count: "exact", head: true })
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),

      // Últimas 5 atividades
      supabaseAdmin
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

    return createSuccessResponse({
      stats: {
        total_agents: agentsCount.count || 0,
        active_agents: activeAgentsCount.count || 0,
        total_admins: adminsCount.count || 0,
        unread_notifications: notificationsCount.count || 0,
        recent_activities: activitiesCount.count || 0,
      },
      recent_activities: latestActivities.data || [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
