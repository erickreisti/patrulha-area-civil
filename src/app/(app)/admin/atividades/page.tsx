// src/app/(app)/admin/atividades/page.tsx - VERSÃO FINAL SEM ESLINT ERRORS
"use client";

import { useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import {
  RiTimeLine,
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine,
  RiHomeLine,
  RiDashboardLine,
} from "react-icons/ri";

// Import do store otimizado
import { useActivitiesList } from "@/lib/stores/useActivitiesStore";

// Import server actions para estatísticas
import {
  getActivitiesOverview,
  getActivityTypes,
} from "@/app/actions/admin/activities";
import { useState } from "react";

export default function AllActivitiesPage() {
  // Store de atividades
  const {
    activities,
    loading,
    error,
    filters,
    pagination,
    fetchActivities,
    setFilters,
    setPage,
    clearError,
  } = useActivitiesList();

  // Estado local para estatísticas e tipos
  const [stats, setStats] = useState<{
    total: number;
    today: number;
    week: number;
    month: number;
  } | null>(null);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Carregar estatísticas
        setLoadingStats(true);
        const [statsResult, typesResult] = await Promise.all([
          getActivitiesOverview(),
          getActivityTypes(),
        ]);

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }

        if (typesResult.success && typesResult.data) {
          setActivityTypes(typesResult.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast.error("Erro ao carregar estatísticas");
      } finally {
        setLoadingStats(false);
      }
    };

    loadInitialData();
    fetchActivities();
  }, [fetchActivities]);

  // Lidar com erros
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Função de refresh
  const handleRefresh = () => {
    fetchActivities();
    toast.success("Lista atualizada");
  };

  // Formatadores
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

  const getActionTypeLabel = (actionType: string) => {
    const types: Record<string, string> = {
      user_login: "Login",
      user_created: "Usuário Criado",
      user_updated: "Usuário Atualizado",
      agent_creation: "Agente Criado",
      agent_update: "Agente Atualizado",
      agent_deleted: "Agente Excluído",
      news_created: "Notícia Criada",
      news_updated: "Notícia Atualizada",
    };
    return types[actionType] || actionType.replace(/_/g, " ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            REGISTRO DE ATIVIDADES
          </h1>
          <p className="text-gray-600">
            Histórico completo de todas as atividades do sistema
            {stats && (
              <span className="block text-sm text-gray-500 mt-1">
                Total de registros: <strong>{stats.total}</strong>
                {stats.today > 0 && (
                  <span className="ml-4">
                    Hoje: <strong>{stats.today}</strong>
                  </span>
                )}
              </span>
            )}
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RiRefreshLine
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Atualizando..." : "Atualizar Lista"}
          </Button>

          <Link href="/admin/dashboard">
            <Button
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            >
              <RiDashboardLine className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white"
            >
              <RiHomeLine className="w-4 h-4 mr-2" />
              Voltar ao Site
            </Button>
          </Link>
        </div>

        {/* Estatísticas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiTimeLine className="w-5 h-5" />
              Estatísticas de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
                {loadingStats ? (
                  <Skeleton className="h-8 w-16 mx-auto bg-gray-200" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.total || 0}
                  </p>
                )}
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Hoje</p>
                {loadingStats ? (
                  <Skeleton className="h-8 w-16 mx-auto bg-gray-200" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.today || 0}
                  </p>
                )}
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Esta Semana
                </p>
                {loadingStats ? (
                  <Skeleton className="h-8 w-16 mx-auto bg-gray-200" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.week || 0}
                  </p>
                )}
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Este Mês
                </p>
                {loadingStats ? (
                  <Skeleton className="h-8 w-16 mx-auto bg-gray-200" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.month || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiFilterLine className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por descrição ou usuário..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Select
                  value={filters.action_type}
                  onValueChange={(value) => setFilters({ action_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas ações</SelectItem>
                    {activityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getActionTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={filters.date_range}
                  onValueChange={(value) => setFilters({ date_range: value })}
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

            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                {pagination.total} atividades encontradas • Página{" "}
                {pagination.page} de {pagination.totalPages}
              </div>

              <Button
                onClick={() => {
                  setFilters({
                    search: "",
                    action_type: "all",
                    date_range: "all",
                  });
                  setPage(1);
                }}
                variant="outline"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Atividades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <RiTimeLine className="w-5 h-5 mr-2" />
                Histórico de Atividades
                {pagination.total > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pagination.total}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full bg-gray-200" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <RiTimeLine className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma atividade encontrada</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {getActionTypeLabel(activity.action_type)}
                            </Badge>
                            {activity.user_profile?.full_name && (
                              <span className="text-sm text-gray-600">
                                por {activity.user_profile.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateTime(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 pt-6 border-t">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        variant="outline"
                      >
                        Anterior
                      </Button>

                      <div className="flex items-center px-4">
                        Página {pagination.page} de {pagination.totalPages}
                      </div>

                      <Button
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        variant="outline"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
