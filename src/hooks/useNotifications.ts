"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  NotificationRow,
  NotificationUpdate,
  NotificationType,
} from "@/lib/supabase/types-helpers";
import { toJsonValue } from "@/lib/supabase/types-helpers";

interface UseNotificationsReturn {
  notifications: NotificationRow[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

type ToastStyle =
  | "default"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading";

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();
  const hasSetupListener = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(`Erro ao obter usuário: ${userError.message}`);
      }

      setUserId(user?.id || null);

      if (!user) {
        setNotifications([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setNotifications(data || []);
    } catch (err: unknown) {
      console.error("Erro ao buscar notificações:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar notificações";
      setError(errorMessage);
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const setupRealtimeListener = useCallback(async () => {
    if (hasSetupListener.current) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        hasSetupListener.current = false;
        return;
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const newNotification = payload.new as NotificationRow;

            setNotifications((prev) => [newNotification, ...prev]);

            if (!newNotification.is_read) {
              const getToastStyle = (type: NotificationType): ToastStyle => {
                switch (type) {
                  case "warning":
                    return "warning";
                  case "system":
                  case "info":
                    return "info";
                  case "user_created":
                  case "news_published":
                  case "gallery_upload":
                    return "success";
                  default:
                    return "default";
                }
              };

              const toastStyle = getToastStyle(newNotification.type);
              const toastOptions = {
                description: newNotification.message,
                duration: newNotification.type === "warning" ? 8000 : 4000,
                action: newNotification.action_url
                  ? {
                      label: "Ver",
                      onClick: () => {
                        if (newNotification.action_url) {
                          window.open(newNotification.action_url, "_blank");
                        }
                      },
                    }
                  : undefined,
              };

              switch (toastStyle) {
                case "success":
                  toast.success(newNotification.title, toastOptions);
                  break;
                case "warning":
                  toast.warning(newNotification.title, toastOptions);
                  break;
                case "info":
                  toast.info(newNotification.title, toastOptions);
                  break;
                default:
                  toast(newNotification.title, toastOptions);
                  break;
              }
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedNotification = payload.new as NotificationRow;
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === updatedNotification.id
                  ? updatedNotification
                  : notif
              )
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const deletedNotification = payload.old as NotificationRow;
            setNotifications((prev) =>
              prev.filter((notif) => notif.id !== deletedNotification.id)
            );
          }
        );

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          hasSetupListener.current = true;
          channelRef.current = channel;
        }
      });
    } catch (err) {
      console.error("Erro ao configurar listener:", err);
      hasSetupListener.current = false;
    }
  }, [supabase]);

  const cleanupRealtimeListener = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    hasSetupListener.current = false;
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();
    setupRealtimeListener();

    return () => {
      cleanupRealtimeListener();
    };
  }, [fetchNotifications, setupRealtimeListener, cleanupRealtimeListener]);

  useEffect(() => {
    if (userId) {
      cleanupRealtimeListener();
      setupRealtimeListener();
    }
  }, [userId, setupRealtimeListener, cleanupRealtimeListener]);

  useEffect(() => {
    const cleanupExpiredNotifications = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { error: deleteError } = await supabase
          .from("notifications")
          .delete()
          .lt("expires_at", new Date().toISOString())
          .eq("user_id", user.id);

        if (deleteError) {
          console.error("Erro ao limpar notificações expiradas:", deleteError);
        }
      } catch (err) {
        console.error("Erro na limpeza de notificações:", err);
      }
    };

    const interval = setInterval(cleanupExpiredNotifications, 60 * 60 * 1000);
    cleanupExpiredNotifications();

    return () => clearInterval(interval);
  }, [supabase]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const updateData: NotificationUpdate = {
          is_read: true,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("notifications")
          .update(updateData)
          .eq("id", notificationId);

        if (updateError) throw updateError;

        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );

        toast.success("Notificação marcada como lida");
      } catch (err: unknown) {
        console.error("Erro ao marcar notificação como lida:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao atualizar notificação";
        toast.error(errorMessage);
      }
    },
    [supabase]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const updateData: NotificationUpdate = {
        is_read: true,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("notifications")
        .update(updateData)
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );

      toast.success("Todas notificações marcadas como lidas");
    } catch (err: unknown) {
      console.error("Erro ao marcar todas como lidas:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar notificações";
      toast.error(errorMessage);
    }
  }, [supabase]);

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

        toast.success("Notificação removida");
      } catch (err: unknown) {
        console.error("Erro ao excluir notificação:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao remover notificação";
        toast.error(errorMessage);
      }
    },
    [supabase]
  );

  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
  };
}

// Hook auxiliar para criar notificações
export function useNotificationCreator() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const { refreshNotifications } = useNotifications();

  const createNotification = useCallback(
    async (
      userId: string,
      type: NotificationType,
      title: string,
      message: string,
      metadata?: Record<string, unknown>,
      action_url?: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);

        const notificationData = {
          user_id: userId,
          type,
          title,
          message,
          action_url: action_url || null,
          metadata: toJsonValue(metadata),
          is_read: false,
          expires_at:
            type === "warning"
              ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              : null,
        };

        const { error: insertError } = await supabase
          .from("notifications")
          .insert(notificationData);

        if (insertError) throw insertError;

        await refreshNotifications();

        return { success: true };
      } catch (err: unknown) {
        console.error("Erro ao criar notificação:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao criar notificação";
        toast.error("Erro ao criar notificação");
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [supabase, refreshNotifications]
  );

  const notifyAdmins = useCallback(
    async (
      type: NotificationType,
      title: string,
      message: string,
      metadata?: Record<string, unknown>,
      action_url?: string
    ): Promise<{ success: boolean; error?: string; count?: number }> => {
      try {
        setLoading(true);

        const { data: admins, error: adminsError } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .eq("status", true);

        if (adminsError) throw adminsError;

        if (!admins || admins.length === 0) {
          return { success: true, count: 0 };
        }

        const notifications = admins.map((admin) => ({
          user_id: admin.id,
          type,
          title,
          message,
          action_url: action_url || null,
          metadata: toJsonValue(metadata),
          is_read: false,
          expires_at:
            type === "warning"
              ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              : null,
        }));

        const { error: insertError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (insertError) throw insertError;

        await refreshNotifications();

        return { success: true, count: admins.length };
      } catch (err: unknown) {
        console.error("Erro ao notificar administradores:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao notificar administradores";
        toast.error("Erro ao notificar administradores");
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [supabase, refreshNotifications]
  );

  return { createNotification, notifyAdmins, loading };
}
