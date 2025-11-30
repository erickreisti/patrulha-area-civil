// src/components/admin/AdminHeader.tsx - CORRIGIDO
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// Icons
import {
  RiMenuLine,
  RiNotificationLine,
  RiUserLine,
  RiSearchLine,
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

// =============================================
// TIPOS E INTERFACES
// =============================================

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
  role: string;
}

interface Notification {
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
  created_at: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

// =============================================
// HOOK DE NOTIFICAÇÕES
// =============================================

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false })
        .limit(20);

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

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        fetchNotifications
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

// =============================================
// COMPONENTE DE NOTIFICAÇÃO
// =============================================

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
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

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
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
            onClick={handleClick}
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

// =============================================
// HEADER DA PATRULHA AÉREA CIVIL - IDÊNTICO À SIDEBAR
// =============================================

const PatrulhaAereaCivilHeader = () => {
  return (
    <div className="flex items-center justify-center h-24 flex-shrink-0 px-4 border-b border-gray-200 bg-gradient-to-r from-navy-700 to-navy-900">
      <Link href="/" className="flex items-center gap-4 group">
        {/* Logo estilo passaporte - IDÊNTICO À SIDEBAR */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Container estilo passaporte */}
          <div className=" bg-white rounded-full shadow-xl overflow-hidden flex items-center justify-center">
            {/* Imagem da logo */}
            <div className="w-full h-full flex items-center justify-center p-1">
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                width={56}
                height={56}
                className="object-cover w-full h-full"
                priority
              />
            </div>
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

// =============================================
// SIDEBAR MOBILE - ESTRUTURA IDÊNTICA À SIDEBAR PRINCIPAL
// =============================================

const MobileSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: RiDashboardLine,
    },
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

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isLinkActive(item.href);
    const IconComponent = item.icon;

    return (
      <div key={item.name}>
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
      {/* Navegação */}
      <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Footer do Mobile Sidebar */}
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

// =============================================
// COMPONENTE PRINCIPAL ADMIN HEADER
// =============================================

export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);

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

  // =============================================
  // EFFECTS E CARREGAMENTO DE DADOS
  // =============================================

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

        if (profile) setUserProfile(profile);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // =============================================
  // SISTEMA DE BUSCA
  // =============================================

  const performSearch = useCallback(
    async (query: string) => {
      const searchTerm = `%${query}%`;

      try {
        const [
          { data: agents },
          { data: news },
          { data: galleryItems },
          { data: galleryCategories },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("status", true)
            .or(`full_name.ilike.${searchTerm},matricula.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from("noticias")
            .select("*")
            .neq("status", "arquivado")
            .or(`titulo.ilike.${searchTerm},resumo.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from("galeria_itens")
            .select("*")
            .eq("status", true)
            .or(`titulo.ilike.${searchTerm},descricao.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from("galeria_categorias")
            .select("*")
            .eq("status", true)
            .or(`nome.ilike.${searchTerm},descricao.ilike.${searchTerm}`)
            .limit(5),
        ]);

        // Os resultados da busca podem ser usados aqui se necessário
        console.log("Resultados da busca:", {
          agents: agents?.length || 0,
          news: news?.length || 0,
          galleryItems: galleryItems?.length || 0,
          galleryCategories: galleryCategories?.length || 0,
        });
      } catch (error) {
        console.error("Erro na busca:", error);
      }
    },
    [supabase]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          await performSearch(searchQuery);
        } catch (error) {
          console.error("Erro na busca:", error);
        } finally {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearchOpen(false);
      return;
    }
    setIsSearchOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  return (
    <>
      <header className="flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Lado Esquerdo - Menu Mobile e Busca */}
          <div className="flex items-center space-x-4" ref={searchAreaRef}>
            {/* Menu Mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <RiMenuLine className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-white">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de Navegação</SheetTitle>
                </SheetHeader>

                <button
                  type="button"
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary z-50 bg-white/80 backdrop-blur-sm p-1.5"
                  onClick={() =>
                    document
                      .querySelector('[data-state="open"]')
                      ?.dispatchEvent(
                        new KeyboardEvent("keydown", { key: "Escape" })
                      )
                  }
                >
                  <RiCloseLine className="h-2 w-2 text-gray-600" />
                  <span className="sr-only">Fechar menu</span>
                </button>

                <PatrulhaAereaCivilHeader />
                <MobileSidebar />
              </SheetContent>
            </Sheet>

            {/* Sistema de Busca */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Buscar agentes, notícias, galeria..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length >= 2)
                      setIsSearchOpen(true);
                  }}
                  onFocus={() =>
                    searchQuery.trim().length >= 2 && setIsSearchOpen(true)
                  }
                  className="pl-10 pr-10 w-64 lg:w-80 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-10 px-3 py-2 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <RiCloseLine className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lado Direito - Ações e Perfil */}
          <div className="flex items-center space-x-3">
            {/* Link para Site Público */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-gray-600 hover:text-blue-600 border-gray-300 hover:border-blue-600 hidden sm:flex"
            >
              <Link href="/" target="_blank">
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
                >
                  {loading ? (
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  ) : userProfile?.avatar_url ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src={userProfile.avatar_url}
                        alt={userProfile.full_name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {userProfile
                        ? userProfile.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)
                        : "A"}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {userProfile?.full_name}
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

      {/* Modal de Busca */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0 bg-white">
          <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-navy-700 to-navy-900">
            <DialogTitle className="flex items-center gap-2 text-white">
              <RiSearchLine className="w-5 h-5 text-white" />
              Resultados da Busca
              {isSearching && (
                <RiLoaderLine className="w-4 h-4 animate-spin ml-2 text-white" />
              )}
            </DialogTitle>
            <DialogDescription className="text-blue-200 mt-1">
              Resultados da busca por &quot;{searchQuery}&quot;
            </DialogDescription>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <RiCloseLine className="h-5 w-5 text-white hover:text-gray-200" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          </DialogHeader>
          <div className="px-6 py-4 bg-white">
            <div className="relative mb-4">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="search"
                placeholder="Continue buscando..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-10 px-3 py-2 text-sm bg-white"
                autoFocus
              />
            </div>
            {/* Área para exibir resultados da busca quando implementado */}
            <div className="text-center py-8 text-gray-500">
              <RiSearchLine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Digite pelo menos 2 caracteres para buscar</p>
              <p className="text-sm text-gray-400 mt-2">
                A funcionalidade de busca está em desenvolvimento
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
