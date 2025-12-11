import { createClient } from "@/lib/supabase/client";
import type {
  NotificationInsert,
  NotificationType,
  NotificationRow,
} from "@/lib/supabase/types-helpers";
import { toJsonValue } from "@/lib/supabase/types-helpers";

export interface CreateNotificationParams {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  expires_at?: Date;
}

export class NotificationService {
  private static supabase = createClient();

  static async createNotification(
    params: CreateNotificationParams
  ): Promise<NotificationRow | null> {
    try {
      const notificationData: NotificationInsert = {
        user_id: params.user_id,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.action_url || null,
        is_read: false,
        metadata: toJsonValue(params.metadata),
        expires_at: params.expires_at?.toISOString() || null,
      };

      const { data, error } = await this.supabase
        .from("notifications")
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      return null;
    }
  }

  static async notifyAdmins(
    params: Omit<CreateNotificationParams, "user_id">
  ): Promise<NotificationRow[] | null> {
    try {
      const { data: admins, error: adminsError } = await this.supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .eq("status", true);

      if (adminsError) throw adminsError;

      if (!admins || admins.length === 0) {
        return [];
      }

      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.action_url || null,
        metadata: toJsonValue(params.metadata),
        is_read: false,
        expires_at: params.expires_at?.toISOString() || null,
      }));

      const { data, error } = await this.supabase
        .from("notifications")
        .insert(notifications)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao notificar administradores:", error);
      return null;
    }
  }

  static async notifyUser(
    userId: string,
    params: Omit<CreateNotificationParams, "user_id">
  ): Promise<NotificationRow | null> {
    return this.createNotification({
      ...params,
      user_id: userId,
    });
  }

  static async systemNotification(
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<NotificationRow | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) return null;

    return this.createNotification({
      user_id: user.id,
      type: "system",
      title: "Atualização do Sistema",
      message,
      metadata,
    });
  }

  static async getUserNotifications(
    userId: string,
    limit: number = 20
  ): Promise<NotificationRow[]> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar notificações do usuário:", error);
      return [];
    }
  }

  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      return false;
    }
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      return false;
    }
  }

  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
      return false;
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Erro ao contar notificações não lidas:", error);
      return 0;
    }
  }

  static async cleanupExpiredNotifications(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .delete()
        .lt("expires_at", new Date().toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao limpar notificações expiradas:", error);
      return false;
    }
  }
}
