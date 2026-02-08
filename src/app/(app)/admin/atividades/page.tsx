"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

// UI Components
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  RiTimeLine,
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine,
  RiCalendarCheckLine,
  RiStackLine,
  RiCalendarEventLine,
  RiCalendarLine,
  RiUserLine,
  RiArticleLine,
  RiSettingsLine,
  RiDeleteBinLine,
  RiShieldLine,
  RiLoginCircleLine,
  RiAddCircleLine,
  RiEditCircleLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiShieldUserLine,
} from "react-icons/ri";

// Stores & Actions
import { useActivitiesList } from "@/lib/stores/useActivitiesStore";
import {
  getActivitiesOverview,
  getActivityTypes,
} from "@/app/actions/admin/activities";

// Componentes Compartilhados
import { StatCard } from "@/components/admin/StatCard";
import { AdminAuthModal } from "@/components/admin/AdminAuthModal";

export default function AllActivitiesPage() {
  const router = useRouter();

  // Store
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

  // Estados Locais
  const [stats, setStats] = useState<{
    total: number;
    today: number;
    week: number;
    month: number;
  } | null>(null);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Inicialização
  useEffect(() => {
    const loadInitialData = async () => {
      try {
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
        console.error("Erro inicial:", error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoadingStats(false);
      }
    };

    loadInitialData();
    fetchActivities();
  }, [fetchActivities]);

  // Tratamento de Erros
  useEffect(() => {
    if (error) {
      if (error.includes("Sessão") || error.includes("autorizado")) {
        setShowAuthModal(true);
      } else {
        toast.error(error);
      }
      clearError();
    }
  }, [error, clearError]);

  const handleRefresh = () => {
    fetchActivities();
    toast.success("Lista atualizada");
  };

  // Helpers de UI
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionConfig = (type: string) => {
    switch (type) {
      case "user_login":
        return {
          label: "Login",
          icon: RiLoginCircleLine,
          color: "text-blue-600",
          bg: "bg-blue-50",
          badge: "bg-blue-100 text-blue-700",
        };
      case "user_created":
      case "agent_creation":
        return {
          label: "Criação",
          icon: RiAddCircleLine,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          badge: "bg-emerald-100 text-emerald-700",
        };
      case "user_updated":
      case "agent_update":
        return {
          label: "Atualização",
          icon: RiEditCircleLine,
          color: "text-amber-600",
          bg: "bg-amber-50",
          badge: "bg-amber-100 text-amber-700",
        };
      case "agent_deleted":
        return {
          label: "Exclusão",
          icon: RiDeleteBinLine,
          color: "text-red-600",
          bg: "bg-red-50",
          badge: "bg-red-100 text-red-700",
        };
      case "news_created":
        return {
          label: "Notícia",
          icon: RiArticleLine,
          color: "text-purple-600",
          bg: "bg-purple-50",
          badge: "bg-purple-100 text-purple-700",
        };
      case "permission_updated":
        return {
          label: "Permissão",
          icon: RiShieldLine,
          color: "text-rose-600",
          bg: "bg-rose-50",
          badge: "bg-rose-100 text-rose-700",
        };
      default:
        return {
          label: type.replace(/_/g, " "),
          icon: RiSettingsLine,
          color: "text-slate-600",
          bg: "bg-slate-50",
          badge: "bg-slate-100 text-slate-700",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <AdminAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* HEADER FIXO */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/dashboard")}
              className="text-slate-500 hover:text-pac-primary"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Log de Atividades
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Monitoramento do sistema
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              <RiRefreshLine
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Registrado"
            value={stats?.total || 0}
            icon={RiStackLine}
            loading={loadingStats}
            variant="primary"
          />
          <StatCard
            title="Hoje"
            value={stats?.today || 0}
            icon={RiCalendarCheckLine}
            loading={loadingStats}
            variant="success"
          />
          <StatCard
            title="Esta Semana"
            value={stats?.week || 0}
            icon={RiCalendarEventLine}
            loading={loadingStats}
            variant="purple"
          />
          <StatCard
            title="Este Mês"
            value={stats?.month || 0}
            icon={RiCalendarLine}
            loading={loadingStats}
            variant="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUNA ESQUERDA - LISTA */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                      <RiTimeLine className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">
                        Linha do Tempo
                      </CardTitle>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-slate-500 font-mono bg-white"
                  >
                    {pagination.total} registros
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading && !activities.length ? (
                  <div className="space-y-4 p-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                      <RiSearchLine className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">
                      Nenhuma atividade encontrada
                    </p>
                    <p className="text-sm text-slate-400">
                      Tente ajustar os filtros de busca
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activities.map((activity) => {
                      const config = getActionConfig(activity.action_type);
                      const Icon = config.icon;

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 flex gap-4 hover:bg-slate-50 transition-colors"
                        >
                          {/* Ícone */}
                          <div
                            className={`p-2.5 rounded-full h-fit flex-shrink-0 ${config.bg} ${config.color}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                              <div>
                                <p className="text-sm font-medium text-slate-800 leading-snug">
                                  {activity.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <Badge
                                    className={`text-[10px] px-1.5 py-0 h-5 font-bold border-0 ${config.badge}`}
                                  >
                                    {config.label.toUpperCase()}
                                  </Badge>

                                  {activity.user_profile?.full_name ? (
                                    <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                      <RiUserLine className="w-3 h-3" />
                                      {activity.user_profile.full_name}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
                                      <RiShieldUserLine className="w-3 h-3" />
                                      Sistema/Desconhecido
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap mt-1 sm:mt-0 flex items-center gap-1">
                                <RiTimeLine className="w-3 h-3" />
                                {formatDateTime(activity.created_at)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
                    <Button
                      onClick={() => setPage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      <RiArrowLeftLine className="mr-1 w-3 h-3" /> Anterior
                    </Button>
                    <span className="text-xs font-medium text-slate-500">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      onClick={() => setPage(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      Próxima <RiArrowRightLine className="ml-1 w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA - FILTROS */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-slate-200 shadow-sm sticky top-24">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <RiFilterLine className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-800">
                    Filtros
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar atividade..."
                      value={filters.search}
                      onChange={(e) => setFilters({ search: e.target.value })}
                      className="pl-10 h-10 bg-white"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Tipo de Ação
                  </label>
                  <Select
                    value={filters.action_type}
                    onValueChange={(value) =>
                      setFilters({ action_type: value })
                    }
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Todas ações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas ações</SelectItem>
                      {activityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {getActionConfig(type).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Período
                  </label>
                  <Select
                    value={filters.date_range}
                    onValueChange={(value) => setFilters({ date_range: value })}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo período</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      search: "",
                      action_type: "all",
                      date_range: "all",
                    })
                  }
                  className="w-full mt-2 text-xs"
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>

            {/* Resumo Rápido */}
            <Card className="bg-pac-primary/5 border-pac-primary/20 shadow-none">
              <CardContent className="p-5">
                <h4 className="text-pac-primary font-bold text-sm uppercase mb-2 flex items-center">
                  <RiShieldLine className="mr-1" /> Auditoria
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Todas as ações administrativas são registradas e auditáveis.
                  Filtre por data para gerar relatórios específicos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
