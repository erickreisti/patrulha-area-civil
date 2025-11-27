// src/lib/notifications.ts
import { createClient } from "@/lib/supabase/client";

// Interface para metadata baseada no schema
export interface NotificationMetadata {
  resource_type?: string;
  action_type?: string;
  resource_id?: string;
  user_id?: string;
  [key: string]: unknown;
}

export interface CreateNotificationParams {
  user_id: string;
  type:
    | "system"
    | "user_created"
    | "news_published"
    | "gallery_upload"
    | "warning"
    | "info";
  title: string;
  message: string;
  action_url?: string;
  metadata?: NotificationMetadata;
  expires_at?: Date;
}

export class NotificationService {
  private static supabase = createClient();

  static async createNotification(params: CreateNotificationParams) {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .insert([
          {
            ...params,
            expires_at: params.expires_at?.toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      throw error;
    }
  }

  // Notificação para todos os administradores
  static async notifyAdmins(params: Omit<CreateNotificationParams, "user_id">) {
    try {
      // Buscar todos os administradores
      const { data: admins, error: adminsError } = await this.supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .eq("status", true);

      if (adminsError) throw adminsError;

      // Criar notificação para cada admin
      const notifications = admins.map((admin) => ({
        ...params,
        user_id: admin.id,
      }));

      const { data, error } = await this.supabase
        .from("notifications")
        .insert(notifications)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao notificar administradores:", error);
      throw error;
    }
  }

  // Notificação para um usuário específico
  static async notifyUser(
    userId: string,
    params: Omit<CreateNotificationParams, "user_id">
  ) {
    return this.createNotification({
      ...params,
      user_id: userId,
    });
  }

  // Notificações do sistema
  static async systemNotification(
    message: string,
    metadata?: NotificationMetadata
  ) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return;

    return this.createNotification({
      user_id: user.id,
      type: "system",
      title: "Atualização do Sistema",
      message,
      metadata,
    });
  }
}
