// src/hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

// Interface para metadata baseada no schema
export interface NotificationMetadata {
  resource_type?: string;
  resource_id?: string;
  action_type?: string;
  user_id?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
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
  is_read: boolean;
  metadata?: NotificationMetadata;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { success, error } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setNotifications(data || []);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
      error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  }, [supabase, error]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error: updateError } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId);

        if (updateError) throw updateError;

        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      } catch (err) {
        console.error("Erro ao marcar notificação como lida:", err);
        error("Erro ao atualizar notificação");
      }
    },
    [supabase, error]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );

      success("Todas notificações marcadas como lidas");
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
      error("Erro ao atualizar notificações");
    }
  }, [supabase, error, success]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const { error: deleteError } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        if (deleteError) throw deleteError;

        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
        success("Notificação removida");
      } catch (err) {
        console.error("Erro ao excluir notificação:", err);
        error("Erro ao remover notificação");
      }
    },
    [supabase, error, success]
  );

  // Escutar por novas notificações em tempo real
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification;

          // Verificar se a notificação é para o usuário atual
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && newNotification.user_id === user.id) {
              setNotifications((prev) => [newNotification, ...prev]);

              // Mostrar toast para notificações não lidas
              if (!newNotification.is_read) {
                success(`Nova notificação: ${newNotification.title}`);
              }
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotifications, success]);

  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
  };
}
