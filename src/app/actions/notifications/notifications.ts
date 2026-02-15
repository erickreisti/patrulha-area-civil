"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Tipagem oficial para o Front-end
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

// Schemas de Validação
const NotificationIdSchema = z.object({
  id: z.string().uuid(),
});

// --- BUSCAR NOTIFICAÇÕES ---
export async function getRecentNotifications() {
  const supabase = await createServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [], unreadCount: 0 };

    // 1. Busca as notificações
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20); // Aumentei para 20 para ter um histórico melhor

    if (error) throw error;

    // 2. Conta as não lidas
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

// --- MARCAR UMA COMO LIDA ---
export async function markAsRead(id: string) {
  const supabase = await createServerClient();

  try {
    const validated = NotificationIdSchema.parse({ id });

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq("id", validated.id);

    if (error) throw error;

    // Revalida caches importantes
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar como lida:", error);
    return { success: false };
  }
}

// --- MARCAR TODAS COMO LIDAS ---
export async function markAllAsRead() {
  const supabase = await createServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar todas:", error);
    return { success: false };
  }
}

// --- DELETAR NOTIFICAÇÃO ---
export async function deleteNotification(id: string) {
  const supabase = await createServerClient();

  try {
    const validated = NotificationIdSchema.parse({ id });

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", validated.id);

    if (error) throw error;

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return { success: false };
  }
}
