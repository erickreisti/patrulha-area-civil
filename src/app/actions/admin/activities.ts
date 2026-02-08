"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Database } from "@/lib/supabase/types";

// --- TYPES ---

interface AdminSessionData {
  expiresAt: string;
  userId?: string;
}

export interface ActivityWithUser {
  id: string;
  user_id: string | null;
  action_type: string;
  description: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Database["public"]["Tables"]["system_activities"]["Row"]["metadata"];
  created_at: string;
  user_profile: {
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

// --- HELPERS ---

function getSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey)
    throw new Error("Missing Supabase Env Vars");

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// ✅ EXPORTADO PARA USO NO DASHBOARD
export async function verifyAdminSession(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get("admin_session");
    const isAdminCookie = cookieStore.get("is_admin")?.value === "true";

    if (!isAdminCookie || !adminSessionCookie)
      return { success: false, error: "admin_session_required" };

    const sessionData: AdminSessionData = JSON.parse(adminSessionCookie.value);
    if (new Date(sessionData.expiresAt) < new Date())
      return { success: false, error: "admin_session_expired" };

    return { success: true, userId: sessionData.userId };
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    return { success: false, error: "admin_session_invalid" };
  }
}

// --- ZOD SCHEMAS ---

const ActivityFiltersSchema = z.object({
  search: z.string().optional(),
  action_type: z.string().optional(),
  date_range: z.string().optional(),
});

const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(15),
});

// --- ACTIONS ---

export async function getAllActivities(
  filtersInput: unknown = {},
  paginationInput: unknown = { page: 1, limit: 15 },
): Promise<ActivitiesResponse> {
  try {
    const filters = ActivityFiltersSchema.parse(filtersInput);
    const pagination = PaginationSchema.parse(paginationInput);

    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success)
      return { success: false, error: sessionCheck.error, data: [] };

    const supabase = getSupabaseServiceRoleClient();

    let query = supabase
      .from("system_activities")
      .select(
        `*, profiles:profiles!left (id, full_name, email, matricula, role, avatar_url)`,
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (filters.search) {
      query = query.or(
        `description.ilike.%${filters.search}%,profiles.full_name.ilike.%${filters.search}%`,
      );
    }
    if (filters.action_type && filters.action_type !== "all") {
      query = query.eq("action_type", filters.action_type);
    }
    if (filters.date_range && filters.date_range !== "all") {
      const startDate = new Date();
      if (filters.date_range === "today") startDate.setHours(0, 0, 0, 0);
      else if (filters.date_range === "week")
        startDate.setDate(startDate.getDate() - 7);
      else if (filters.date_range === "month")
        startDate.setMonth(startDate.getMonth() - 1);
      query = query.gte("created_at", startDate.toISOString());
    }

    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    query = query.range(from, to);

    const { data: activities, error, count } = await query;
    if (error) throw new Error(error.message);

    const processedActivities: ActivityWithUser[] = (activities || []).map(
      (activity) => {
        const profile = Array.isArray(activity.profiles)
          ? activity.profiles[0]
          : activity.profiles;
        return {
          ...activity,
          user_profile: profile ? { ...profile } : null,
        } as ActivityWithUser;
      },
    );

    return {
      success: true,
      data: processedActivities,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / pagination.limit) : 1,
      },
    };
  } catch (error) {
    console.error("Erro em getAllActivities:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      data: [],
    };
  }
}

export async function getActivitiesOverview(): Promise<{
  success: boolean;
  data?: ActivityStats;
  error?: string;
}> {
  try {
    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success)
      return { success: false, error: sessionCheck.error };

    const supabase = getSupabaseServiceRoleClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [total, todayRes, weekRes, monthRes, typesRes] = await Promise.all([
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

    const byType: Record<string, number> = {};
    typesRes.data?.forEach((a) => {
      byType[a.action_type] = (byType[a.action_type] || 0) + 1;
    });

    return {
      success: true,
      data: {
        total: total.count || 0,
        today: todayRes.count || 0,
        week: weekRes.count || 0,
        month: monthRes.count || 0,
        byType,
      },
    };
  } catch (error) {
    console.error("Erro em getActivitiesOverview:", error);
    return { success: false, error: "Erro ao buscar estatísticas" };
  }
}

export async function getActivityTypes() {
  try {
    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success)
      return { success: false, error: sessionCheck.error };

    const supabase = getSupabaseServiceRoleClient();
    const { data } = await supabase
      .from("system_activities")
      .select("action_type")
      .order("action_type");
    const uniqueTypes = Array.from(new Set(data?.map((i) => i.action_type)))
      .filter(Boolean)
      .sort();

    return { success: true, data: uniqueTypes };
  } catch (error) {
    console.error("Erro em getActivityTypes:", error);
    return { success: false, error: "Erro ao buscar tipos" };
  }
}

export async function createSystemActivity(data: {
  action_type: string;
  description: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Database["public"]["Tables"]["system_activities"]["Row"]["metadata"];
}) {
  try {
    const sessionCheck = await verifyAdminSession();
    if (!sessionCheck.success)
      return { success: false, error: sessionCheck.error };

    const supabase = getSupabaseServiceRoleClient();
    await supabase.from("system_activities").insert([
      {
        user_id: sessionCheck.userId || null,
        ...data,
        metadata: data.metadata || null,
      },
    ]);

    revalidatePath("/admin/atividades");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro em createSystemActivity:", error);
    return { success: false, error: "Erro ao criar atividade" };
  }
}
