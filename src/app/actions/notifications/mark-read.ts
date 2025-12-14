"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MarkReadSchema = z.object({
  notificationId: z.string().uuid("ID da notificação inválido"),
});

export async function markNotificationAsRead(formData: FormData) {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const notificationId = formData.get("notificationId") as string;
    const validated = MarkReadSchema.parse({ notificationId });

    // Verificar se a notificação pertence ao usuário
    const { data: notification } = await supabase
      .from("notifications")
      .select("user_id, is_read")
      .eq("id", validated.notificationId)
      .single();

    if (!notification) {
      throw new Error("Notificação não encontrada");
    }

    if (notification.user_id !== session.user.id) {
      throw new Error("Esta notificação não pertence a você");
    }

    // Se já estiver lida, retornar sucesso
    if (notification.is_read) {
      return {
        success: true,
        message: "Notificação já estava marcada como lida",
      };
    }

    // Marcar como lida
    const { data: updatedNotification, error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.notificationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao marcar notificação como lida: ${error.message}`);
    }

    // Revalidar cache
    revalidatePath("/notifications");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Notificação marcada como lida",
      data: updatedNotification,
    };
  } catch (error) {
    console.error("Erro em markNotificationAsRead:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
        details: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao marcar notificação como lida",
    };
  }
}

// Marcar todas como lidas
export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    // Marcar todas como lidas
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (error) {
      throw new Error(`Erro ao marcar todas como lidas: ${error.message}`);
    }

    // Revalidar cache
    revalidatePath("/notifications");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Todas as notificações foram marcadas como lidas",
    };
  } catch (error) {
    console.error("Erro em markAllNotificationsAsRead:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao marcar notificações como lidas",
    };
  }
}
