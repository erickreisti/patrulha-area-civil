"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface GetActivitiesOptions {
  page?: number;
  limit?: number;
  userId?: string;
  actionType?: string;
}

export async function getActivities(options: GetActivitiesOptions = {}) {
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
      throw new Error(
        "Apenas administradores podem ver atividades do sistema."
      );
    }

    const { page = 1, limit = 100, userId, actionType } = options;
    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase
      .from("system_activities")
      .select(
        `
        *,
        user:profiles!system_activities_user_id_fkey(email, full_name, role)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // Aplicar filtros
    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (actionType) {
      query = query.eq("action_type", actionType);
    }

    // Executar query com paginação
    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      throw new Error(`Erro ao buscar atividades: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error("Erro em getActivities:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar atividades",
      data: [],
      pagination: {
        page: options.page || 1,
        limit: options.limit || 100,
        total: 0,
        totalPages: 0,
      },
    };
  }
}
