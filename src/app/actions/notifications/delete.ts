"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DeleteNotificationSchema = z.object({
  notificationId: z.string().uuid("ID da notificação inválido"),
});

export async function deleteNotification(formData: FormData) {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const notificationId = formData.get("notificationId") as string;
    const validated = DeleteNotificationSchema.parse({ notificationId });

    // Verificar se a notificação pertence ao usuário
    const { data: notification } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", validated.notificationId)
      .single();

    if (!notification) {
      throw new Error("Notificação não encontrada");
    }

    if (notification.user_id !== session.user.id) {
      throw new Error("Esta notificação não pertence a você");
    }

    // Deletar notificação
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", validated.notificationId);

    if (error) {
      throw new Error(`Erro ao deletar notificação: ${error.message}`);
    }

    // Revalidar cache
    revalidatePath("/notifications");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Notificação excluída com sucesso",
    };
  } catch (error) {
    console.error("Erro em deleteNotification:", error);

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
        error instanceof Error ? error.message : "Erro ao excluir notificação",
    };
  }
}
