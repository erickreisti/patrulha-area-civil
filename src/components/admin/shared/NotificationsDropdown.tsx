"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  RiNotification3Line,
  RiCheckDoubleLine,
  RiUserAddLine,
  RiArticleLine,
  RiImageAddLine,
  RiAlertLine,
  RiInformationLine,
  RiSettings3Line,
  RiLoader4Line,
} from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  getRecentNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from "@/app/actions/notifications/notifications"; // Importando do arquivo unificado

const getNotificationStyles = (type: string) => {
  switch (type) {
    case "user_created":
      return { icon: RiUserAddLine, color: "text-blue-600 bg-blue-50" };
    case "news_published":
      return { icon: RiArticleLine, color: "text-emerald-600 bg-emerald-50" };
    case "gallery_upload":
      return { icon: RiImageAddLine, color: "text-purple-600 bg-purple-50" };
    case "warning":
      return { icon: RiAlertLine, color: "text-amber-600 bg-amber-50" };
    case "system":
      return { icon: RiSettings3Line, color: "text-slate-600 bg-slate-50" };
    default:
      return { icon: RiInformationLine, color: "text-slate-500 bg-slate-50" };
  }
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRecentNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling a cada 60 segundos
  useEffect(() => {
    let isMounted = true;

    const initializeNotifications = async () => {
      if (isMounted) await loadNotifications();
    };

    initializeNotifications();

    const interval = setInterval(() => {
      if (isMounted) loadNotifications();
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loadNotifications]);

  const handleMarkRead = async (id: string, isRead: boolean) => {
    if (isRead) return;

    // Atualização Otimista (UI primeiro)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    // Atualização Otimista
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success("Todas as notificações marcadas como lidas");

    await markAllAsRead();
  };

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) loadNotifications();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:text-sky-700 hover:bg-sky-50 relative transition-colors h-9 w-9 rounded-full"
        >
          <RiNotification3Line className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 bg-white shadow-xl border-slate-200 rounded-xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <DropdownMenuLabel className="p-0 text-slate-800 font-bold text-sm flex items-center">
            Notificações
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-red-100 text-red-600 hover:bg-red-200 border-0 h-5 px-1.5 font-bold"
              >
                {unreadCount}
              </Badge>
            )}
          </DropdownMenuLabel>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] sm:text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2 font-medium"
              onClick={handleMarkAllRead}
            >
              <RiCheckDoubleLine className="mr-1" /> Ler todas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[350px]">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <RiLoader4Line className="h-6 w-6 animate-spin" />
              <span className="text-xs">Atualizando...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <div className="p-3 bg-slate-50 rounded-full">
                <RiNotification3Line className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-sm font-medium">Tudo limpo por aqui!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((notif) => {
                const style = getNotificationStyles(notif.type);
                const Icon = style.icon;

                return (
                  <DropdownMenuItem
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                      !notif.is_read
                        ? "bg-sky-50/30 hover:bg-sky-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => handleMarkRead(notif.id, notif.is_read)}
                  >
                    <div
                      className={`p-2 rounded-full shrink-0 mt-0.5 ${style.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p
                          className={`text-sm leading-snug truncate pr-2 ${
                            !notif.is_read
                              ? "font-bold text-slate-800"
                              : "font-medium text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <p className="text-[10px] text-slate-400 font-medium pt-1">
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator className="m-0" />
        {/* Futuro: Link para página completa de notificações */}
        {notifications.length > 0 && (
          <div className="p-2 bg-slate-50 text-center">
            <span className="text-[10px] text-slate-400">
              Exibindo as últimas 20
            </span>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
