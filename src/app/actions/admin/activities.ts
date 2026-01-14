// src/app/actions/admin/activities.ts - VERSÃO FINAL COM TIPOS CORRETOS
"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Database } from "@/lib/supabase/types";

// ============================================
// TYPES - CORRIGIDOS PARA USAR O TIPO Json DO SUPABASE
// ============================================

// Interface para dados da sessão admin
interface AdminSessionData {
  expiresAt: string;
  userId?: string;
  userEmail?: string;
  sessionToken?: string;
  createdAt?: string;
}

// Tipos para resposta
export interface ActivityWithUser {
  id: string;
  user_id: string | null;
  action_type: string;
  description: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Database["public"]["Tables"]["system_activities"]["Row"]["metadata"]; // Usando o tipo correto
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
  today: number;
  week: number;
  month: number;
  byType: Record<string, number>;
}

export interface ActivitiesResponse {
  success: boolean;
  data?: ActivityWithUser[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Função para criar cliente com service role
function getSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// Função para verificar sessão admin (igual ao dashboard)
async function verifyAdminSession(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get("admin_session");
    const isAdminCookie = cookieStore.get("is_admin")?.value === "true";

    if (!isAdminCookie || !adminSessionCookie) {
      return { success: false, error: "admin_session_required" };
    }

    // Verificar se não expirou
    const sessionData: AdminSessionData = JSON.parse(adminSessionCookie.value);
    const expiresAt = new Date(sessionData.expiresAt);

    if (expiresAt < new Date()) {
      return { success: false, error: "admin_session_expired" };
    }

    return { success: true, userId: sessionData.userId };
  } catch {
    return { success: false, error: "admin_session_invalid" };
  }
}

// ============================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// ============================================

const ActivityFiltersSchema = z.object({
  search: z.string().optional(),
  action_type: z.string().optional(),
  date_range: z.string().optional(),
});

const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(15),
});

// ============================================
// FUNÇÕES PRINCIPAIS - CORRIGIDAS
// ============================================

/**
 * Buscar todas as atividades (com service role)
 */
export async function getAllActivities(
  filtersInput: unknown = {},
  paginationInput: unknown = { page: 1, limit: 15 }
): Promise<ActivitiesResponse> {
  try {
    console.log("🚀 [getAllActivities] Iniciando busca...");

    // 1. Validar inputs com Zod
    const filters = ActivityFiltersSchema.parse(filtersInput);
    const pagination = PaginationSchema.parse(paginationInput);

    console.log("📋 Filtros validados:", filters);
    console.log("📊 Paginação:", pagination);

    // 2. Verificar sessão admin
    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success) {
      console.log("❌ [getAllActivities] Acesso negado:", sessionCheck.error);
      return {
        success: false,
        error: sessionCheck.error,
        data: [],
      };
    }

    console.log("✅ [getAllActivities] Acesso admin confirmado");

    // 3. Usar service role client (ignora RLS)
    const supabase = getSupabaseServiceRoleClient();

    // 4. Construir query
    let query = supabase
      .from("system_activities")
      .select(
        `
        *,
        profiles:profiles!left (
          id,
          full_name,
          email,
          matricula,
          role,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // Aplicar filtros
    if (filters.search) {
      query = query.or(
        `description.ilike.%${filters.search}%,profiles.full_name.ilike.%${filters.search}%`
      );
    }

    if (filters.action_type && filters.action_type !== "all") {
      query = query.eq("action_type", filters.action_type);
    }

    // Filtro por data
    if (filters.date_range && filters.date_range !== "all") {
      const now = new Date();
      const startDate = new Date();

      switch (filters.date_range) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      query = query.gte("created_at", startDate.toISOString());
    }

    // Aplicar paginação
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    query = query.range(from, to);

    // 5. Executar query
    const { data: activities, error, count } = await query;

    if (error) {
      console.error("❌ [getAllActivities] Erro do Supabase:", error);
      throw new Error(`Erro ao buscar atividades: ${error.message}`);
    }

    console.log(
      `✅ [getAllActivities] ${activities?.length || 0} atividades encontradas`
    );

    // 6. Processar resposta
    const total = count || 0;
    const totalPages = Math.ceil(total / pagination.limit);

    const processedActivities: ActivityWithUser[] = (activities || []).map(
      (activity) => {
        let userProfile = null;

        // Tratar perfis que podem vir como array ou objeto
        if (activity.profiles) {
          if (
            Array.isArray(activity.profiles) &&
            activity.profiles.length > 0
          ) {
            userProfile = activity.profiles[0];
          } else if (
            typeof activity.profiles === "object" &&
            activity.profiles !== null
          ) {
            userProfile = activity.profiles;
          }
        }

        return {
          id: activity.id,
          user_id: activity.user_id,
          action_type: activity.action_type,
          description: activity.description,
          resource_type: activity.resource_type,
          resource_id: activity.resource_id,
          metadata: activity.metadata, // Já está no tipo correto
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

    return {
      success: true,
      data: processedActivities,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("❌ [getAllActivities] Erro:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação nos filtros",
        data: [],
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar atividades",
      data: [],
    };
  }
}

/**
 * Buscar estatísticas de atividades
 */
export async function getActivitiesOverview(): Promise<{
  success: boolean;
  data?: ActivityStats;
  error?: string;
}> {
  try {
    console.log("📊 [getActivitiesOverview] Iniciando...");

    // 1. Verificar sessão admin
    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success) {
      return { success: false, error: sessionCheck.error };
    }

    // 2. Usar service role client
    const supabase = getSupabaseServiceRoleClient();

    // 3. Calcular datas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // 4. Buscar contagens em paralelo
    const [totalResult, todayResult, weekResult, monthResult, byTypeResult] =
      await Promise.all([
        supabase
          .from("system_activities")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("system_activities")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("system_activities")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("system_activities")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthAgo.toISOString()),
        supabase.from("system_activities").select("action_type"),
      ]);

    // 5. Processar por tipo
    const byType: Record<string, number> = {};

    if (byTypeResult.data) {
      byTypeResult.data.forEach((activity) => {
        const type = activity.action_type;
        byType[type] = (byType[type] || 0) + 1;
      });
    }

    console.log(`✅ [getActivitiesOverview] Estatísticas calculadas`);

    return {
      success: true,
      data: {
        total: totalResult.count || 0,
        today: todayResult.count || 0,
        week: weekResult.count || 0,
        month: monthResult.count || 0,
        byType,
      },
    };
  } catch (error) {
    console.error("❌ [getActivitiesOverview] Erro:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar estatísticas",
    };
  }
}

/**
 * Buscar tipos de atividade únicos
 */
export async function getActivityTypes(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    console.log("🔍 [getActivityTypes] Buscando tipos...");

    // 1. Verificar sessão admin
    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success) {
      return { success: false, error: sessionCheck.error };
    }

    // 2. Usar service role client
    const supabase = getSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("system_activities")
      .select("action_type")
      .not("action_type", "is", null)
      .order("action_type");

    if (error) {
      throw new Error(`Erro ao buscar tipos: ${error.message}`);
    }

    // 3. Remover duplicatas
    const uniqueTypes = Array.from(
      new Set(data?.map((item) => item.action_type).filter(Boolean))
    ).sort();

    console.log(
      `✅ [getActivityTypes] ${uniqueTypes.length} tipos encontrados`
    );

    return {
      success: true,
      data: uniqueTypes,
    };
  } catch (error) {
    console.error("❌ [getActivityTypes] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar tipos",
    };
  }
}

/**
 * Buscar atividades recentes para dashboard
 */
export async function getRecentActivitiesForDashboard(
  limit: number = 5
): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    action_type: string;
    description: string;
    created_at: string;
    user_name: string | null;
  }>;
  error?: string;
}> {
  try {
    console.log("🔍 [getRecentActivitiesForDashboard] Iniciando...");

    // 1. Verificar sessão admin
    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success) {
      return { success: false, error: sessionCheck.error };
    }

    // 2. Usar service role client
    const supabase = getSupabaseServiceRoleClient();

    const { data: activities, error } = await supabase
      .from("system_activities")
      .select(
        `
        id,
        action_type,
        description,
        created_at,
        user_id,
        profiles:profiles!left (
          full_name
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar atividades: ${error.message}`);
    }

    // 3. Processar resposta
    const recentActivities = (activities || []).map((activity) => {
      let userProfile = null;

      if (activity.profiles) {
        if (Array.isArray(activity.profiles) && activity.profiles.length > 0) {
          userProfile = activity.profiles[0];
        } else if (
          typeof activity.profiles === "object" &&
          activity.profiles !== null
        ) {
          userProfile = activity.profiles;
        }
      }

      return {
        id: activity.id,
        action_type: activity.action_type,
        description: activity.description,
        created_at: activity.created_at,
        user_name: userProfile?.full_name || "Sistema",
      };
    });

    console.log(
      `✅ [getRecentActivitiesForDashboard] ${recentActivities.length} atividades processadas`
    );

    return {
      success: true,
      data: recentActivities,
    };
  } catch (error) {
    console.error("❌ [getRecentActivitiesForDashboard] Erro:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar atividades",
    };
  }
}

/**
 * Criar nova atividade do sistema - CORRIGIDO COM TIPO Json
 */
export async function createSystemActivity(data: {
  action_type: string;
  description: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Database["public"]["Tables"]["system_activities"]["Row"]["metadata"];
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log("📝 [createSystemActivity] Criando atividade...");

    // 1. Verificar sessão admin
    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success) {
      return { success: false, error: sessionCheck.error };
    }

    // 2. Usar service role client
    const supabase = getSupabaseServiceRoleClient();

    // 3. Criar objeto com os tipos corretos
    const activityData = {
      user_id: sessionCheck.userId || null, // Pode ser null
      action_type: data.action_type,
      description: data.description,
      resource_type: data.resource_type || null,
      resource_id: data.resource_id || null,
      metadata: data.metadata || null,
    };

    console.log("📋 [createSystemActivity] Dados da atividade:", activityData);

    // 4. Inserir atividade
    const { error } = await supabase
      .from("system_activities")
      .insert([activityData]); // Note o array aqui

    if (error) {
      console.error("❌ [createSystemActivity] Erro ao inserir:", error);
      throw new Error(`Erro ao criar atividade: ${error.message}`);
    }

    console.log("✅ [createSystemActivity] Atividade criada com sucesso");

    // 5. Revalidar cache
    revalidatePath("/admin/atividades");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("❌ [createSystemActivity] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar atividade",
    };
  }
}
