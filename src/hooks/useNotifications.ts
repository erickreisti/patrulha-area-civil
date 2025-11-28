// src/hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error: updateError } = await supabase
          .from("notifications")
          .update({
            is_read: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", notificationId);

        if (updateError) throw updateError;

        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );

        toast.success("Notificação marcada como lida");
      } catch (err) {
        console.error("Erro ao marcar notificação como lida:", err);
        toast.error("Erro ao atualizar notificação");
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

      const { error: updateError } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );

      toast.success("Todas notificações marcadas como lidas");
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
      toast.error("Erro ao atualizar notificações");
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
      } catch (err) {
        console.error("Erro ao excluir notificação:", err);
        toast.error("Erro ao remover notificação");
      }
    },
    [supabase]
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
        async (payload) => {
          const newNotification = payload.new as Notification;

          // Verificar se a notificação é para o usuário atual
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && newNotification.user_id === user.id) {
            setNotifications((prev) => [newNotification, ...prev]);

            // Mostrar toast para notificações não lidas
            if (!newNotification.is_read) {
              // Toast customizado baseado no tipo
              const getToastConfig = (type: Notification["type"]) => {
                switch (type) {
                  case "system":
                  case "info":
                    return { style: "info" as const };
                  case "user_created":
                    return { style: "success" as const };
                  case "warning":
                    return { style: "warning" as const };
                  case "news_published":
                  case "gallery_upload":
                  default:
                    return { style: "default" as const };
                }
              };

              const toastConfig = getToastConfig(newNotification.type);

              // Usar toast padrão para tipos que não têm método específico
              if (toastConfig.style === "default") {
                toast(newNotification.title, {
                  description: newNotification.message,
                  duration: newNotification.type === "warning" ? 8000 : 4000,
                  action: newNotification.action_url
                    ? {
                        label: "Ver",
                        onClick: () =>
                          window.open(newNotification.action_url, "_blank"),
                      }
                    : undefined,
                });
              } else {
                // Usar métodos específicos do toast (success, warning, info)
                toast[toastConfig.style](newNotification.title, {
                  description: newNotification.message,
                  duration: newNotification.type === "warning" ? 8000 : 4000,
                  action: newNotification.action_url
                    ? {
                        label: "Ver",
                        onClick: () =>
                          window.open(newNotification.action_url, "_blank"),
                      }
                    : undefined,
                });
              }
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
        },
        async (payload) => {
          const updatedNotification = payload.new as Notification;

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && updatedNotification.user_id === user.id) {
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === updatedNotification.id
                  ? updatedNotification
                  : notif
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          const deletedNotification = payload.old as Notification;

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && deletedNotification.user_id === user.id) {
            setNotifications((prev) =>
              prev.filter((notif) => notif.id !== deletedNotification.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotifications]);

  // Limpar notificações expiradas
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
          .eq("user_id", user.id)
          .lt("expires_at", new Date().toISOString());

        if (deleteError) {
          console.error("Erro ao limpar notificações expiradas:", deleteError);
        }
      } catch (err) {
        console.error("Erro na limpeza de notificações:", err);
      }
    };

    // Executar limpeza a cada hora
    const interval = setInterval(cleanupExpiredNotifications, 60 * 60 * 1000);

    // Executar uma vez na inicialização
    cleanupExpiredNotifications();

    return () => clearInterval(interval);
  }, [supabase]);

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

// Hook auxiliar para criar notificações
export function useNotificationCreator() {
  const supabase = createClient();

  const createNotification = useCallback(
    async (
      userId: string,
      type: Notification["type"],
      title: string,
      message: string,
      metadata?: NotificationMetadata,
      action_url?: string
    ) => {
      try {
        const { error: insertError } = await supabase
          .from("notifications")
          .insert({
            user_id: userId,
            type,
            title,
            message,
            action_url,
            metadata,
            is_read: false,
            expires_at:
              type === "warning"
                ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                : undefined,
          });

        if (insertError) throw insertError;

        return true;
      } catch (err) {
        console.error("Erro ao criar notificação:", err);
        toast.error("Erro ao criar notificação");
        return false;
      }
    },
    [supabase]
  );

  return { createNotification };
}
