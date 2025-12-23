"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// Ícones Remix
import {
  RiMenuLine,
  RiNotificationLine,
  RiUserLine,
  RiLogoutBoxLine,
  RiGlobalLine,
  RiGroupLine,
  RiArticleLine,
  RiImageLine,
  RiFolderLine,
  RiCloseLine,
  RiLoaderLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiEyeLine,
  RiAddLine,
  RiUserAddLine,
  RiListUnordered,
  RiDashboardLine,
  RiSettingsLine,
} from "react-icons/ri";

// Importar o SearchComponent
import { SearchComponent } from "./SearchComponent";

// Importar tipos do Supabase
import type { Notification as NotificationType } from "@/lib/supabase/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Interface para UserProfile simplificada
interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "agent";
}

// Hook de notificações otimizado
const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
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
        .eq("user_id", user.id) // ✅ FILTRO CRÍTICO: Apenas notificações do usuário atual
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
      setNotifications([]);
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

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  }, [supabase]);

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

  useEffect(() => {
    fetchNotifications();

    let isMounted = true;

    const setupRealtime = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        // Remove qualquer canal existente para este usuário
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
              filter: `user_id=eq.${user.id}`, // ✅ FILTRO CRÍTICO
            },
            () => {
              if (isMounted) {
                fetchNotifications();
              }
            }
          )
          .subscribe((status) => {
            console.log(`Canal de notificações: ${status}`);
          });

        channelRef.current = channel;
      } catch (error) {
        console.error("Erro na conexão realtime:", error);
      }
    };

    setupRealtime();

    // RETORNO DE LIMPEZA CRÍTICO
    return () => {
      isMounted = false;

      if (channelRef.current) {
        supabase
          .removeChannel(channelRef.current)
          .then(() => {
            console.log("Canal de notificações removido com sucesso");
          })
          .catch((err) => {
            console.error("Erro ao remover canal:", err);
          });
        channelRef.current = null;
      }
    };
  }, [supabase, fetchNotifications]);

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
};

// Componente individual de notificação
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: NotificationType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const router = useRouter();

  const getNotificationIcon = () => {
    const iconClass = "w-4 h-4 flex-shrink-0";
    switch (notification.type) {
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
        return <RiInformationLine className={`${iconClass} text-blue-600`} />;
      default:
        return <RiNotificationLine className={`${iconClass} text-gray-600`} />;
    }
  };

  const getNotificationColor = () => {
    if (notification.is_read) return "border-gray-200 bg-white";
    switch (notification.type) {
      case "system":
        return "border-blue-200 bg-blue-50";
      case "user_created":
        return "border-green-200 bg-green-50";
      case "news_published":
        return "border-purple-200 bg-purple-50";
      case "gallery_upload":
        return "border-orange-200 bg-orange-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
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

  return (
    <div
      className={`p-3 border rounded-lg ${getNotificationColor()} transition-colors`}
    >
      <div className="flex items-start gap-3">
        {getNotificationIcon()}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => {
              if (!notification.is_read) onMarkAsRead(notification.id);
              if (notification.action_url) router.push(notification.action_url);
            }}
            className="w-full text-left hover:opacity-80 transition-opacity"
          >
            <p
              className={`font-medium text-sm mb-1 ${
                !notification.is_read ? "text-gray-900" : "text-gray-700"
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
                  onClick={() => onMarkAsRead(notification.id)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Marcar como lida"
                >
                  <RiCheckLine className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
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
  );
};

// Header da logo (igual ao sidebar)
const PatrulhaAereaCivilHeader = () => {
  return (
    <div className="flex items-center justify-center h-24 flex-shrink-0 px-4 border-b border-gray-200 bg-gradient-to-r from-navy-700 to-navy-900">
      <Link href="/" className="flex items-center gap-4 group">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="bg-white rounded-full shadow-xl overflow-hidden w-14 h-14 flex items-center justify-center">
            <Image
              src="/images/logos/logo.webp"
              alt="Patrulha Aérea Civil"
              width={56}
              height={56}
              className="object-contain w-full h-full p-1"
              priority
            />
          </div>
        </motion.div>
        <div className="text-left">
          <h1 className="font-roboto text-[12px] text-white tracking-wider uppercase leading-tight drop-shadow-md">
            PATRULHA AÉREA CIVIL
          </h1>
          <p className="text-blue-300 text-xs leading-tight mt-1 font-roboto font-medium">
            Painel Administrativo
          </p>
        </div>
      </Link>
    </div>
  );
};

// Tipos para navegação mobile
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

// Sidebar mobile para menu hambúrguer
const MobileSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navigation: NavItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: RiDashboardLine },
    {
      name: "Agentes",
      href: "/admin/agentes",
      icon: RiGroupLine,
      children: [
        {
          name: "Criar Agente",
          href: "/admin/agentes/criar",
          icon: RiUserAddLine,
        },
      ],
    },
    {
      name: "Notícias",
      href: "/admin/noticias",
      icon: RiArticleLine,
      children: [
        {
          name: "Criar Notícia",
          href: "/admin/noticias/criar",
          icon: RiAddLine,
        },
      ],
    },
    {
      name: "Galeria",
      href: "/admin/galeria",
      icon: RiImageLine,
      children: [
        {
          name: "Todos os Itens",
          href: "/admin/galeria/itens",
          icon: RiListUnordered,
          children: [
            {
              name: "Criar Item",
              href: "/admin/galeria/itens/criar",
              icon: RiAddLine,
            },
          ],
        },
        {
          name: "Todas as Categorias",
          href: "/admin/galeria/categorias",
          icon: RiFolderLine,
          children: [
            {
              name: "Criar Categoria",
              href: "/admin/galeria/categorias/criar",
              icon: RiAddLine,
            },
          ],
        },
      ],
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const renderNavigationItem = (item: NavItem, level = 0) => {
    const isActive = isLinkActive(item.href);
    const IconComponent = item.icon;

    return (
      <div key={`${item.name}-${level}`}>
        <Link
          href={item.href}
          className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 border ${
            isActive
              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent hover:border-gray-200"
          } ${level === 1 ? "ml-4 text-xs py-2" : ""} ${
            level === 2 ? "ml-8 text-xs py-1" : ""
          }`}
        >
          <IconComponent
            className={`mr-3 flex-shrink-0 transition-colors ${
              level === 0 ? "h-5 w-5" : "h-4 w-4"
            } ${
              isActive
                ? "text-blue-600"
                : "text-gray-400 group-hover:text-gray-500"
            }`}
          />
          {item.name}
        </Link>

        {item.children && (
          <div
            className={`transition-all duration-300 overflow-hidden ${
              level === 0 ? "ml-4 mt-1 space-y-1" : "ml-4 space-y-0"
            } ${isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
          >
            {item.children.map((child) =>
              renderNavigationItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => renderNavigationItem(item))}
        </nav>
      </div>
      <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Administrador
            </p>
            <p className="text-xs text-gray-500 truncate">Sistema PAC</p>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/perfil")}
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-2"
              title="Meu Perfil"
            >
              <RiUserLine className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-2"
              title="Sair do sistema"
            >
              <RiLogoutBoxLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal AdminHeader
export function AdminHeader() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Hook de notificações
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  // Carrega perfil do usuário
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserProfile({
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            role: profile.role as "admin" | "agent",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [supabase]);

  // Logout do sistema
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <header className="flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Menu Mobile e Busca */}
          <div className="flex items-center space-x-4">
            {/* Menu Mobile (Hambúrguer) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                  aria-label="Abrir menu"
                >
                  <RiMenuLine className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-white">
                <button
                  type="button"
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary z-50 bg-white/80 backdrop-blur-sm p-1.5"
                  onClick={() => {
                    const openSheet = document.querySelector(
                      '[data-state="open"]'
                    ) as HTMLElement;
                    openSheet?.click();
                  }}
                  aria-label="Fechar menu"
                >
                  <RiCloseLine className="h-2 w-2 text-gray-600" />
                </button>
                <PatrulhaAereaCivilHeader />
                <MobileSidebar />
              </SheetContent>
            </Sheet>

            {/* Sistema de Busca - NOVO COMPONENTE */}
            <SearchComponent />
          </div>

          {/* Ações e Perfil */}
          <div className="flex items-center space-x-3">
            {/* Link para Site Público */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-gray-600 hover:text-blue-600 border-gray-300 hover:border-blue-600 hidden sm:flex"
            >
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <RiGlobalLine className="h-4 w-4 mr-2" />
                Ver Site
              </Link>
            </Button>

            {/* Notificações */}
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
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white font-medium">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-96 max-h-96 overflow-y-auto"
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
                <div className="p-2 space-y-2">
                  {notificationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RiLoaderLine className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        Carregando...
                      </span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <RiNotificationLine className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Nenhuma notificação</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Novas notificações aparecerão aqui
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshNotifications}
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

            {/* Perfil do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2"
                  aria-label="Menu do usuário"
                >
                  {loading ? (
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  ) : userProfile?.avatar_url ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src={userProfile.avatar_url}
                        alt={userProfile.full_name || "Usuário"}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {userProfile?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2) || "A"}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {userProfile?.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userProfile?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/perfil")}
                  className="cursor-pointer"
                >
                  <RiUserLine className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 cursor-pointer focus:text-red-600"
                >
                  <RiLogoutBoxLine className="mr-2 h-4 w-4" />
                  Sair do Sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
