"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface GetAgentsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
  role?: "admin" | "agent";
}

export async function getAgents(options: GetAgentsOptions = {}) {
  try {
    const supabase = await createServerClient();

    // Verificar autenticação e permissões
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Não autorizado. Faça login para continuar.");
    }

    const { page = 1, limit = 50, search, status, role } = options;
    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase.from("profiles").select("*", { count: "exact" });

    // Aplicar filtros
    if (search) {
      query = query.or(
        `matricula.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`
      );
    }

    if (status !== undefined) {
      query = query.eq("status", status);
    }

    if (role) {
      query = query.eq("role", role);
    }

    // Executar query com paginação
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Erro ao buscar agentes: ${error.message}`);
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
    console.error("Erro em getAgents:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar agentes",
      data: [],
      pagination: {
        page: options.page || 1,
        limit: options.limit || 50,
        total: 0,
        totalPages: 0,
      },
    };
  }
}
