"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | "system"
    | "user_created"
    | "news_published"
    | "gallery_upload"
    | "warning"
    | "info";
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export async function getRecentNotifications() {
  const supabase = await createServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [] };

    // Busca as 10 últimas notificações
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    // Conta quantas não foram lidas
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    return {
      success: true,
      data: data as Notification[],
      unreadCount: count || 0,
    };
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return { success: false, data: [], unreadCount: 0 };
  }
}

export async function markAsRead(id: string) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function markAllAsRead() {
  const supabase = await createServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) throw error;

    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false };
  }
}
