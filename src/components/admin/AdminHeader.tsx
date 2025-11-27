// src/components/admin/AdminHeader.tsx - COMPLETO COM NOTIFICAÇÕES FUNCIONAIS
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";

// React Icons
import {
  FaBars,
  FaBell,
  FaUser,
  FaSearch,
  FaCog,
  FaSignOutAlt,
  FaGlobeAmericas,
  FaUsers,
  FaFileAlt,
  FaImage,
  FaFolder,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaTrash,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEye,
} from "react-icons/fa";

// =============================================
// SCHEMAS E TIPOS
// =============================================

const profileSchema = z.object({
  id: z.string().uuid(),
  matricula: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  avatar_url: z.string().nullable(),
  graduacao: z.string().nullable(),
  tipo_sanguineo: z.string().nullable(),
  status: z.boolean(),
  role: z.enum(["admin", "agent"]),
  created_at: z.string(),
  updated_at: z.string(),
});

const newsSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  resumo: z.string().nullable(),
  categoria: z.string().nullable(),
  status: z.enum(["rascunho", "publicado", "arquivado"]),
  data_publicacao: z.string().nullable(),
  created_at: z.string(),
});

const galleryItemSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  descricao: z.string().nullable(),
  tipo: z.enum(["foto", "video"]),
  categoria_id: z.string().uuid().nullable(),
  created_at: z.string(),
});

const galleryCategorySchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  tipo: z.enum(["fotos", "videos"]),
  created_at: z.string(),
});

// Interface para metadata baseada no schema
interface NotificationMetadata {
  resource_type?: string;
  resource_id?: string;
  action_type?: string;
  user_id?: string;
  [key: string]: unknown;
}

// Interface para notificações
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
  metadata?: NotificationMetadata;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

type ProfileData = z.infer<typeof profileSchema>;
type NewsData = z.infer<typeof newsSchema>;
type GalleryItemData = z.infer<typeof galleryItemSchema>;
type GalleryCategoryData = z.infer<typeof galleryCategorySchema>;

interface SearchResults {
  agents: ProfileData[];
  news: NewsData[];
  galleryItems: GalleryItemData[];
  galleryCategories: GalleryCategoryData[];
}

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
  role: string;
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

const getInitials = (fullName: string): string => {
  if (!fullName || fullName.trim().length === 0) return "U";

  const names = fullName.trim().split(/\s+/);
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }

  const firstInitial = names[0].charAt(0).toUpperCase();
  const lastInitial = names[names.length - 1].charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
};

// =============================================
// HOOK DE NOTIFICAÇÕES
// =============================================

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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
          .update({ is_read: true })
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
        .update({ is_read: true })
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

  // Escutar por novas notificações em tempo real
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
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
// COMPONENTE DE ITEM DE NOTIFICAÇÃO
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
    switch (notification.type) {
      case "system":
        return <FaCog className="w-4 h-4 text-blue-600 flex-shrink-0" />;
      case "user_created":
        return <FaUsers className="w-4 h-4 text-green-600 flex-shrink-0" />;
      case "news_published":
        return <FaFileAlt className="w-4 h-4 text-purple-600 flex-shrink-0" />;
      case "gallery_upload":
        return <FaImage className="w-4 h-4 text-orange-600 flex-shrink-0" />;
      case "warning":
        return (
          <FaExclamationTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
        );
      case "info":
        return <FaInfoCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />;
      default:
        return <FaBell className="w-4 h-4 text-gray-600 flex-shrink-0" />;
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
                  <FaCheck className="w-3 h-3" />
                </button>
              )}

              <button
                onClick={() => onDelete(notification.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Excluir notificação"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();
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

        if (profile) {
          setUserProfile(profile);
        }
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
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // =============================================
  // SISTEMA DE BUSCA INTELIGENTE
  // =============================================

  const performSearch = useCallback(
    async (query: string): Promise<SearchResults> => {
      const searchTerm = `%${query}%`;

      try {
        const [
          { data: agents, error: agentsError },
          { data: news, error: newsError },
          { data: galleryItems, error: galleryItemsError },
          { data: galleryCategories, error: galleryCategoriesError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .or(
              `full_name.ilike.${searchTerm},matricula.ilike.${searchTerm},email.ilike.${searchTerm}`
            )
            .limit(5),
          supabase
            .from("noticias")
            .select("*")
            .or(
              `titulo.ilike.${searchTerm},resumo.ilike.${searchTerm},categoria.ilike.${searchTerm}`
            )
            .limit(5),
          supabase
            .from("galeria_itens")
            .select("*")
            .or(`titulo.ilike.${searchTerm},descricao.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from("galeria_categorias")
            .select("*")
            .or(`nome.ilike.${searchTerm},descricao.ilike.${searchTerm}`)
            .limit(5),
        ]);

        if (agentsError) console.error("Erro ao buscar agentes:", agentsError);
        if (newsError) console.error("Erro ao buscar notícias:", newsError);
        if (galleryItemsError)
          console.error("Erro ao buscar itens da galeria:", galleryItemsError);
        if (galleryCategoriesError)
          console.error("Erro ao buscar categorias:", galleryCategoriesError);

        const validatedResults: SearchResults = {
          agents: agents ? agents.map((item) => profileSchema.parse(item)) : [],
          news: news ? news.map((item) => newsSchema.parse(item)) : [],
          galleryItems: galleryItems
            ? galleryItems.map((item) => galleryItemSchema.parse(item))
            : [],
          galleryCategories: galleryCategories
            ? galleryCategories.map((item) => galleryCategorySchema.parse(item))
            : [],
        };

        return validatedResults;
      } catch (error) {
        console.error("Erro geral na busca:", error);
        return {
          agents: [],
          news: [],
          galleryItems: [],
          galleryCategories: [],
        };
      }
    },
    [supabase]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await performSearch(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Erro na busca:", error);
          setSearchResults(null);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearchOpen(false);
      return;
    }

    setIsSearchOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setIsSearchOpen(false);
  };

  // =============================================
  // HANDLERS DE NAVEGAÇÃO
  // =============================================

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navigateToItem = (type: string, id: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");

    switch (type) {
      case "agent":
        router.push(`/admin/agentes/${id}`);
        break;
      case "news":
        router.push(`/admin/noticias/${id}`);
        break;
      case "galleryItem":
        router.push(`/admin/galeria/${id}`);
        break;
      case "galleryCategory":
        router.push(`/admin/galeria?categoria=${id}`);
        break;
      default:
        console.warn("Tipo de navegação desconhecido:", type);
    }
  };

  // =============================================
  // COMPONENTES DE RENDERIZAÇÃO
  // =============================================

  const renderSearchResults = () => {
    if (!searchResults) return null;

    const totalResults =
      searchResults.agents.length +
      searchResults.news.length +
      searchResults.galleryItems.length +
      searchResults.galleryCategories.length;

    if (totalResults === 0 && !isSearching) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FaSearch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum resultado encontrado para</p>
          <p className="font-semibold">&quot;{searchQuery}&quot;</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* 👥 AGENTES */}
        {searchResults.agents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
              <FaUsers className="w-4 h-4" />
              <span>Agentes ({searchResults.agents.length})</span>
            </div>
            <div className="space-y-2">
              {searchResults.agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => navigateToItem("agent", agent.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(agent.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-700">
                        {agent.full_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {agent.matricula} • {agent.graduacao || "Sem graduação"}
                      </p>
                    </div>
                    <Badge
                      variant={agent.status ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {agent.status ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 📰 NOTÍCIAS */}
        {searchResults.news.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
              <FaFileAlt className="w-4 h-4" />
              <span>Notícias ({searchResults.news.length})</span>
            </div>
            <div className="space-y-2">
              {searchResults.news.map((news) => (
                <button
                  key={news.id}
                  onClick={() => navigateToItem("news", news.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-green-700 mb-1">
                    {news.titulo}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {news.categoria || "Sem categoria"}
                    </Badge>
                    <span className="capitalize">{news.status}</span>
                    {news.data_publicacao && (
                      <span>
                        {new Date(news.data_publicacao).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 🖼️ GALERIA */}
        {(searchResults.galleryItems.length > 0 ||
          searchResults.galleryCategories.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
              <FaImage className="w-4 h-4" />
              <span>
                Galeria (
                {searchResults.galleryItems.length +
                  searchResults.galleryCategories.length}
                )
              </span>
            </div>
            <div className="space-y-2">
              {searchResults.galleryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateToItem("galleryItem", item.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        item.tipo === "foto"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {item.tipo === "foto" ? "📷" : "🎥"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-purple-700">
                        {item.titulo}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {item.tipo}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {searchResults.galleryCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => navigateToItem("galleryCategory", category.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FaFolder className="w-4 h-4 text-purple-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-purple-700">
                        {category.nome}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {category.tipo}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FaBars className="h-5 w-5" />
            </Button>

            {/* 🔍 SISTEMA DE BUSCA PRINCIPAL */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Buscar agentes, notícias, galeria..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      setIsSearchOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) {
                      setIsSearchOpen(true);
                    }
                  }}
                  className="pl-10 pr-10 w-64 lg:w-80 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-10 px-3 py-2 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-4 w-4" />
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
                <FaGlobeAmericas className="h-4 w-4 mr-2" />
                Ver Site
              </Link>
            </Button>

            {/* 🔔 NOTIFICAÇÕES FUNCIONAIS */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-gray-500 hover:text-gray-700"
                >
                  <FaBell className="h-5 w-5" />
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
                      <FaEye className="w-3 h-3 mr-1" />
                      Marcar todas como lidas
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="p-2 space-y-2">
                  {notificationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <FaSpinner className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        Carregando...
                      </span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FaBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
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
                        <FaSpinner className="w-3 h-3 mr-1" />
                        Atualizar notificações
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 👤 PERFIL DO USUÁRIO */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
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
                      {userProfile ? getInitials(userProfile.full_name) : "U"}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium">
                    {loading
                      ? "Carregando..."
                      : userProfile?.full_name || "Admin"}
                  </span>
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
                  <FaUser className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/admin/configuracoes")}
                  className="cursor-pointer"
                >
                  <FaCog className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 cursor-pointer focus:text-red-600"
                >
                  <FaSignOutAlt className="mr-2 h-4 w-4" />
                  Sair do Sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* 🔍 MODAL DE RESULTADOS DA BUSCA */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <FaSearch className="w-5 h-5" />
              Resultados da Busca
              {isSearching && (
                <FaSpinner className="w-4 h-4 animate-spin ml-2" />
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Resultados da busca por {searchQuery}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            {/* Input de busca dentro do modal */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="search"
                placeholder="Continue buscando..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-10 px-3 py-2 text-sm"
                autoFocus
              />
            </div>

            {/* Resultados */}
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Buscando...</span>
              </div>
            ) : (
              renderSearchResults()
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
