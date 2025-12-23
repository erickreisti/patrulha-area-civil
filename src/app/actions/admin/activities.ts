"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/shared";

export interface ActivityWithUser {
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

export interface CreateActivityData {
  action_type: string;
  description: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Json;
}

// Helper para verificar admin
async function verifyAdmin() {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Erro ao obter sessão:", sessionError);
      throw new Error("Erro de autenticação");
    }

    if (!session) {
      console.warn("Usuário não autenticado");
      throw new Error("Não autorizado. Faça login para continuar.");
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
      throw new Error("Erro ao verificar permissões");
    }

    if (!profile || profile.role !== "admin" || !profile.status) {
      console.warn("Usuário não é admin:", {
        userId: session.user.id,
        role: profile?.role,
        status: profile?.status,
      });
      throw new Error(
        "Apenas administradores ativos podem acessar esta funcionalidade."
      );
    }

    return { session, profile, supabase };
  } catch (error) {
    console.error("Erro em verifyAdmin:", error);
    throw error;
  }
}

// 1. Atividades recentes para dashboard
export async function getRecentActivitiesForDashboard() {
  try {
    const { supabase } = await verifyAdmin();

    // Buscar 5 atividades mais recentes
    const { data: activities, error } = await supabase
      .from("system_activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Erro ao buscar atividades:", error);
      throw error;
    }

    if (!activities || activities.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Buscar perfis dos usuários
    const userIds = [
      ...new Set(activities.map((a) => a.user_id).filter(Boolean)),
    ] as string[];

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
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, matricula, role, avatar_url")
        .in("id", userIds);

      if (!profilesError && profiles) {
        profilesMap = new Map(profiles.map((p) => [p.id, p]));
      }
    }

    // Combinar dados
    const activitiesWithProfiles: ActivityWithUser[] = activities.map(
      (activity) => {
        const userProfile = activity.user_id
          ? profilesMap.get(activity.user_id) || null
          : null;

        return {
          ...activity,
          metadata: activity.metadata as Json,
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

    return {
      success: true,
      data: activitiesWithProfiles,
    };
  } catch (error) {
    console.error("Erro em getRecentActivitiesForDashboard:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar atividades",
      data: [],
    };
  }
}

// 2. Estatísticas de atividades
export async function getActivitiesStats(
  timeframe: "day" | "week" | "month" = "week"
) {
  try {
    const { supabase } = await verifyAdmin();

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

    // Contar atividades por tipo
    const { data: activitiesByType, error: typeError } = await supabase
      .from("system_activities")
      .select("action_type")
      .gte("created_at", startDate.toISOString());

    if (typeError) {
      console.error("Erro ao buscar estatísticas por tipo:", typeError);
      throw typeError;
    }

    // Processar estatísticas
    const stats = {
      total: activitiesByType?.length || 0,
      byType: {} as Record<string, number>,
    };

    activitiesByType?.forEach((activity) => {
      const type = activity.action_type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    // Top 5 tipos mais comuns
    const topTypes = Object.entries(stats.byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return {
      success: true,
      data: {
        total: stats.total,
        topTypes,
        timeframe,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas de atividades:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar estatísticas",
      data: {
        total: 0,
        topTypes: [],
        timeframe,
      },
    };
  }
}

// 3. Criar atividade do sistema
export async function createSystemActivity(data: CreateActivityData) {
  try {
    const supabase = await createServerClient();

    // Verificar autenticação
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) {
      throw new Error("Não autorizado. Faça login para continuar.");
    }

    // Inserir atividade
    const { data: activity, error } = await supabase
      .from("system_activities")
      .insert({
        user_id: session.user.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: activity,
    };
  } catch (error) {
    console.error("Erro em createSystemActivity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar atividade",
      data: null,
    };
  }
}
