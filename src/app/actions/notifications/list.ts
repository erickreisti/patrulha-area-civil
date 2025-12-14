"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface GetNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
}

export async function getNotifications(options: GetNotificationsOptions = {}) {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const { limit = 50, unreadOnly = false } = options;

    // Construir query
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar notificações: ${error.message}`);
    }

    // Contar não lidas
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    return {
      success: true,
      data: {
        notifications: notifications || [],
        unread_count: count || 0,
      },
    };
  } catch (error) {
    console.error("Erro em getNotifications:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar notificações",
      data: {
        notifications: [],
        unread_count: 0,
      },
    };
  }
}
