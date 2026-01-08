// src/app/admin/dashboard/components/shared/NotificationsDropdown.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  RiNotificationLine,
  RiEyeLine,
  RiLoaderLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiSettingsLine,
  RiGroupLine,
  RiArticleLine,
  RiImageLine,
  RiErrorWarningLine,
  RiInformationLine,
} from "react-icons/ri";
import type { Notification as NotificationType } from "@/lib/supabase/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);

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

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true, updated_at: new Date().toISOString() })
          .eq("id", notificationId);

        if (error) throw error;

        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      } catch (err) {
        console.error("Erro ao marcar notificação como lida:", err);
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

      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .in("id", unreadIds);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  }, [supabase, notifications]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        if (error) throw error;

        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
      } catch (err) {
        console.error("Erro ao excluir notificação:", err);
      }
    },
    [supabase]
  );

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-4 h-4 flex-shrink-0";
    switch (type) {
      case "system":
        return <RiSettingsLine className={`${iconClass} text-blue-600`} />;
      case "user_created":
        return <RiGroupLine className={`${iconClass} text-green-600`} />;
      case "news_published":
        return <RiArticleLine className={`${iconClass} text-purple-600`} />;
      case "gallery_upload":
        return <RiImageLine className={`${iconClass} text-orange-600`} />;
      case "warning":
        return (
          <RiErrorWarningLine className={`${iconClass} text-yellow-600`} />
        );
      case "info":
        return <RiInformationLine className={`${iconClass} text-cyan-600`} />;
      default:
        return <RiNotificationLine className={`${iconClass} text-gray-600`} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Há ${Math.floor(diffInMinutes / 60)} h`;
    return date.toLocaleDateString("pt-BR");
  };

  useEffect(() => {
    fetchNotifications();

    let isMounted = true;

    const setupRealtime = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        // Remove canal existente
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
        }

        // Cria novo canal
        const channel = supabase
          .channel(`notifications-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              if (isMounted) fetchNotifications();
            }
          )
          .subscribe();

        channelRef.current = channel;
      } catch (error) {
        console.error("Erro na conexão realtime:", error);
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(console.error);
      }
    };
  }, [supabase, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-gray-500 hover:text-gray-700"
          aria-label={`Notificações ${
            unreadCount > 0 ? `(${unreadCount} não lidas)` : ""
          }`}
        >
          <RiNotificationLine className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs border-2 border-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 max-h-[80vh] overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 text-xs text-blue-600 hover:text-blue-700"
            >
              <RiEyeLine className="w-3 h-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="w-4 h-4 mr-2" />
            <span className="text-sm text-gray-500">Carregando...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <RiNotificationLine className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhuma notificação</p>
            <p className="text-sm text-gray-400 mt-1">
              Novas notificações aparecerão aqui
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    notification.is_read
                      ? "border-gray-200 bg-white"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => {
                          if (!notification.is_read)
                            markAsRead(notification.id);
                          if (notification.action_url)
                            router.push(notification.action_url);
                        }}
                        className="w-full text-left hover:opacity-80 transition-opacity"
                      >
                        <p
                          className={`font-medium text-sm mb-1 ${
                            !notification.is_read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                      </button>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.created_at)}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Marcar como lida"
                            >
                              <RiCheckLine className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Excluir notificação"
                          >
                            <RiDeleteBinLine className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
                className="w-full text-xs"
              >
                <RiLoaderLine className="w-3 h-3 mr-1" />
                Atualizar notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
