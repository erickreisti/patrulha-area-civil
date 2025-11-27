"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaUsers,
  FaNewspaper,
  FaImages,
  FaFolder,
  FaUserPlus,
  FaFileAlt,
  FaEye,
  FaTrash,
  FaServer,
  FaCheckCircle,
  FaCalendarAlt,
  FaUser,
  FaCog,
  FaHome,
} from "react-icons/fa";

interface Activity {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: {
    version?: string;
    details?: string;
    [key: string]: unknown;
  };
  created_at: string;
  user_profile?: {
    full_name: string;
    matricula: string;
    graduacao?: string;
  };
}

interface ActivityFilters {
  search: string;
  action_type: string;
  resource_type: string;
  date_range: string;
}

export default function AllActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    action_type: "all",
    resource_type: "all",
    date_range: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const supabase = createClient();

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase.from("system_activities").select(
        `
          *,
          user_profile:profiles(full_name, matricula, graduacao)
        `,
        { count: "exact" }
      );

      // Aplicar filtros
      if (filters.search) {
        query = query.ilike("description", `%${filters.search}%`);
      }

      if (filters.action_type !== "all") {
        query = query.eq("action_type", filters.action_type);
      }

      if (filters.resource_type !== "all") {
        query = query.eq("resource_type", filters.resource_type);
      }

      // Filtro por data
      if (filters.date_range !== "all") {
        const now = new Date();
        const startDate = new Date();

        switch (filters.date_range) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        query = query.gte("created_at", startDate.toISOString());
      }

      // Paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        // Se a tabela não existir, mostrar array vazio
        if (error.code === "42P01") {
          console.log("Tabela de atividades não encontrada");
          setActivities([]);
          setTotalCount(0);
          return;
        }
        throw error;
      }

      setActivities(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      setActivities([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [supabase, filters, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (actionType: string) => {
    const iconClass = "w-4 h-4";

    switch (actionType) {
      case "user_created":
      case "user_registered":
        return <FaUserPlus className={`${iconClass} text-green-600`} />;
      case "user_updated":
      case "user_login":
        return <FaUsers className={`${iconClass} text-blue-600`} />;
      case "news_created":
      case "article_created":
        return <FaFileAlt className={`${iconClass} text-green-600`} />;
      case "news_updated":
      case "article_updated":
        return <FaNewspaper className={`${iconClass} text-blue-600`} />;
      case "news_published":
      case "article_published":
        return <FaEye className={`${iconClass} text-purple-600`} />;
      case "gallery_item_created":
      case "media_uploaded":
        return <FaImages className={`${iconClass} text-green-600`} />;
      case "gallery_item_updated":
      case "media_updated":
        return <FaImages className={`${iconClass} text-blue-600`} />;
      case "gallery_item_deleted":
      case "media_deleted":
        return <FaTrash className={`${iconClass} text-red-600`} />;
      case "category_created":
        return <FaFolder className={`${iconClass} text-green-600`} />;
      case "category_updated":
        return <FaFolder className={`${iconClass} text-blue-600`} />;
      case "system_start":
      case "system_update":
        return <FaServer className={`${iconClass} text-gray-600`} />;
      default:
        return <FaCheckCircle className={`${iconClass} text-gray-600`} />;
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    const types: Record<string, string> = {
      user_created: "Usuário Criado",
      user_updated: "Usuário Atualizado",
      user_login: "Login",
      news_created: "Notícia Criada",
      news_updated: "Notícia Atualizada",
      news_published: "Notícia Publicada",
      gallery_item_created: "Item da Galeria Criado",
      gallery_item_updated: "Item da Galeria Atualizado",
      gallery_item_deleted: "Item da Galeria Excluído",
      category_created: "Categoria Criada",
      category_updated: "Categoria Atualizada",
      system_start: "Sistema Iniciado",
      system_update: "Sistema Atualizado",
    };

    return types[actionType] || actionType;
  };

  const getActionTypeColor = (actionType: string) => {
    if (actionType.includes("created")) return "bg-green-100 text-green-800";
    if (actionType.includes("updated")) return "bg-blue-100 text-blue-800";
    if (actionType.includes("deleted")) return "bg-red-100 text-red-800";
    if (actionType.includes("login")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Agora mesmo";
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400)
      return `Há ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000)
      return `Há ${Math.floor(diffInSeconds / 86400)} dias`;

    return date.toLocaleDateString("pt-BR");
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              REGISTRO DE ATIVIDADES
            </h1>
            <p className="text-gray-600">
              Histórico completo de todas as atividades do sistema
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>

            <Link href="/admin">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                <FaCog className="w-4 h-4 mr-2" />
                Painel Admin
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-700 hover:bg-slate-100"
              >
                <FaHome className="w-4 h-4 mr-2" />
                Voltar ao Site
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <Card className="border-0 shadow-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaFilter className="w-5 h-5 text-navy" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por descrição..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Select
                  value={filters.action_type}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, action_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas ações</SelectItem>
                    <SelectItem value="user_login">Login</SelectItem>
                    <SelectItem value="user_created">
                      Criação de Usuário
                    </SelectItem>
                    <SelectItem value="news_created">
                      Criação de Notícia
                    </SelectItem>
                    <SelectItem value="gallery_item_created">
                      Upload na Galeria
                    </SelectItem>
                    <SelectItem value="category_created">
                      Criação de Categoria
                    </SelectItem>
                    <SelectItem value="system_start">
                      Início do Sistema
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={filters.date_range}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, date_range: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todo período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo período</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                    <SelectItem value="year">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  setFilters({
                    search: "",
                    action_type: "all",
                    resource_type: "all",
                    date_range: "all",
                  });
                  setCurrentPage(1);
                }}
                variant="outline"
                className="border-slate-700 text-slate-700 hover:bg-slate-100"
              >
                Limpar Filtros
              </Button>

              <div className="flex-1 text-right">
                <span className="text-sm text-gray-600">
                  {totalCount} atividades encontradas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Atividades */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaCalendarAlt className="w-5 h-5 mr-2 text-navy" />
              Histórico de Atividades ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando atividades...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {Object.values(filters).some(
                    (val) => val !== "" && val !== "all"
                  )
                    ? "Nenhuma atividade encontrada com os filtros aplicados"
                    : "Nenhuma atividade registrada no sistema"}
                </p>
                {!Object.values(filters).some(
                  (val) => val !== "" && val !== "all"
                ) && (
                  <p className="text-gray-400 text-sm mt-2">
                    As atividades aparecerão aqui quando o sistema for utilizado
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.action_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge
                              className={getActionTypeColor(
                                activity.action_type
                              )}
                            >
                              {getActionTypeLabel(activity.action_type)}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FaUser className="w-3 h-3" />
                              <span>
                                {activity.user_profile?.full_name || "Sistema"}
                              </span>
                              {activity.user_profile?.matricula && (
                                <span>({activity.user_profile.matricula})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs text-gray-500 flex-shrink-0 ml-4">
                          <div className="font-medium">
                            {formatRelativeTime(activity.created_at)}
                          </div>
                          <div>{formatDateTime(activity.created_at)}</div>
                        </div>
                      </div>

                      {activity.metadata &&
                        Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>

                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
