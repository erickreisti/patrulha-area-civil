// src/app/(app)/admin/dashboard/page.tsx - VERSÃO FUNCIONAL COMPLETA
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Ícones
import {
  RiRefreshLine,
  RiDashboardLine,
  RiGroupLine,
  RiArticleLine,
  RiImageLine,
  RiHomeLine,
  RiUserLine,
  RiEyeLine,
  RiEyeOffLine,
  RiShieldUserLine,
  RiBarChart2Line,
  RiCalendarLine,
  RiGalleryLine,
  RiNewspaperLine,
} from "react-icons/ri";

// Zustand Stores - APENAS AUTH
import { useAuthStore } from "@/lib/stores/useAuthStore";

// Server actions - CORRIGIDO
import { getDashboardStats } from "@/app/actions/admin/dashboard/dashboard";

// Componentes
import { RecentActivities } from "./components/dashboard/RecentActivities";

// Tipos - Corrigidos
interface DashboardActivity {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  user_name: string | null;
}

interface DashboardStats {
  summary?: {
    agents?: {
      total: number;
      active: number;
      inactive: number;
      admins: number;
      regular: number;
    };
    news?: {
      total: number;
      published: number;
      draft: number;
      archived: number;
      featured: number;
    };
    gallery?: {
      total: number;
      photos: number;
      videos: number;
      categories: number;
    };
    system?: {
      totalActivities: number;
      recentActivities: number;
      activeUsers: number;
    };
  };
  recentActivities: DashboardActivity[];
  calculations?: {
    activePercentage: number;
    adminPercentage: number;
    publishedPercentage: number;
    featuredPercentage: number;
  };
}

interface AgentsStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  agents: number;
}

interface DashboardSummaryData {
  totalNews: number;
  totalGalleryItems: number;
  totalCategories: number;
  recentActivities: DashboardActivity[];
}

// Componente de estatísticas - Corrigido
const StatCard = ({
  title,
  value,
  icon,
  description,
  color = "blue",
  delay,
  loading = false,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color?: "blue" | "green" | "red" | "purple" | "gray" | "orange" | "cyan";
  delay: number;
  loading?: boolean;
  onClick?: () => void;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
    gray: "from-gray-500 to-gray-600",
    orange: "from-orange-500 to-orange-600",
    cyan: "from-cyan-500 to-cyan-600",
  };

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="h-full"
    >
      <Card
        className={`h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm relative overflow-hidden ${
          onClick
            ? "cursor-pointer hover:shadow-xl transition-all duration-300"
            : ""
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5`}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1 bg-gray-200" />
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                  {value}
                </p>
              )}
              <p className="text-xs text-gray-500">{description}</p>
            </div>
            <div
              className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return onClick ? (
    <div onClick={onClick} className="cursor-pointer">
      {cardContent}
    </div>
  ) : (
    cardContent
  );
};

export default function DashboardPage() {
  const router = useRouter();

  // Zustand Store - APENAS AUTH
  const { profile, hasAdminSession } = useAuthStore();

  // Estado local
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [localAgentsStats, setLocalAgentsStats] = useState<AgentsStats>({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    agents: 0,
  });
  const [isClient, setIsClient] = useState(false);

  // Marcar que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Botões de navegação
  const navigationButtons = [
    {
      href: "/admin/agentes",
      icon: RiGroupLine,
      label: "Gerenciar Agentes",
      className:
        "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
    {
      href: "/admin/noticias",
      icon: RiArticleLine,
      label: "Gerenciar Notícias",
      className:
        "border-green-600 text-green-600 hover:bg-green-600 hover:text-white",
    },
    {
      href: "/admin/galeria",
      icon: RiImageLine,
      label: "Gerenciar Galeria",
      className:
        "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
  ];

  // Carregar dados - VERSÃO SIMPLIFICADA E CORRIGIDA
  const loadDashboard = useCallback(async () => {
    console.log("📊 [DashboardPage] Carregando dados do dashboard...");
    setRefreshing(true);
    setError(null);

    try {
      // Buscar estatísticas do dashboard - USANDO A FUNÇÃO CORRETA
      const result = await getDashboardStats();

      console.log("📊 [DashboardPage] Resultado da API:", result);

      if (result.success && result.data) {
        console.log("✅ [DashboardPage] Estatísticas carregadas com sucesso");
        setDashboardStats(result.data);

        // Calcular estatísticas básicas de agentes a partir dos dados
        if (result.data.summary?.agents) {
          const agents = result.data.summary.agents;
          setLocalAgentsStats({
            total: agents.total || 0,
            active: agents.active || 0,
            inactive: agents.inactive || 0,
            admins: agents.admins || 0,
            agents: agents.regular || 0,
          });
        } else {
          // Fallback para dados básicos
          setLocalAgentsStats({
            total: 0,
            active: 0,
            inactive: 0,
            admins: 0,
            agents: 0,
          });
        }
      } else {
        const errorMsg = result.error || "Erro ao buscar estatísticas";
        throw new Error(errorMsg);
      }

      toast.success("Dashboard atualizado com sucesso");
    } catch (err) {
      console.error("❌ [DashboardPage] Erro ao carregar dashboard:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Efeito inicial
  useEffect(() => {
    if (isClient) {
      console.log("🔍 [DashboardPage] Iniciando carregamento...");
      loadDashboard();
    }
  }, [loadDashboard, isClient]);

  // Preparar dados para exibição
  const getDashboardData = (): DashboardSummaryData => {
    if (dashboardStats) {
      return {
        totalNews: dashboardStats.summary?.news?.total || 0,
        totalGalleryItems: dashboardStats.summary?.gallery?.total || 0,
        totalCategories: dashboardStats.summary?.gallery?.categories || 0,
        recentActivities: dashboardStats.recentActivities || [],
      };
    }

    // Dados fallback
    return {
      totalNews: 0,
      totalGalleryItems: 0,
      totalCategories: 0,
      recentActivities: [],
    };
  };

  const handleRefresh = () => {
    loadDashboard();
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  // Se ainda não está no cliente, mostrar loading
  if (!isClient || (loading && !refreshing)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Spinner className="w-8 h-8" />
          </div>
        </div>
      </div>
    );
  }

  // Se tem erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-red-800 mb-3">
                Erro ao carregar dashboard
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={handleRefresh}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <RiRefreshLine className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/perfil")}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Voltar para Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Obter role do perfil
  const userRole = profile?.role || "agent";
  const dashboardData = getDashboardData();

  console.log("🔍 [DashboardPage] Renderizando com:", {
    userRole,
    hasAdminSession,
    profileId: profile?.id,
    dashboardData,
    localAgentsStats,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            DASHBOARD ADMINISTRATIVO
          </h1>
          <p className="text-gray-600">
            Visão geral do sistema da Patrulha Aérea Civil
            {profile?.full_name && (
              <span className="block text-sm text-gray-500 mt-1">
                Olá, <strong>{profile.full_name}</strong> ({profile.matricula})
              </span>
            )}
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RiRefreshLine
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Atualizando..." : "Atualizar Dashboard"}
          </Button>

          {navigationButtons.map((button) => (
            <Link key={button.href} href={button.href}>
              <Button variant="outline" className={button.className}>
                <button.icon className="w-4 h-4 mr-2" />
                {button.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Agentes"
            value={localAgentsStats.total || 0}
            icon={<RiGroupLine className="w-6 h-6" />}
            description="Agentes no sistema"
            color="blue"
            delay={0}
            loading={refreshing}
            onClick={() => navigateTo("/admin/agentes")}
          />
          <StatCard
            title="Administradores"
            value={localAgentsStats.admins || 0}
            icon={<RiShieldUserLine className="w-6 h-6" />}
            description="Com acesso total"
            color="purple"
            delay={1}
            loading={refreshing}
            onClick={() => navigateTo("/admin/agentes?role=admin")}
          />
          <StatCard
            title="Notícias"
            value={dashboardData.totalNews || 0}
            icon={<RiNewspaperLine className="w-6 h-6" />}
            description="Publicações no sistema"
            color="green"
            delay={2}
            loading={refreshing}
            onClick={() => navigateTo("/admin/noticias")}
          />
          <StatCard
            title="Galeria"
            value={dashboardData.totalGalleryItems || 0}
            icon={<RiGalleryLine className="w-6 h-6" />}
            description={`${dashboardData.totalCategories} categorias`}
            color="orange"
            delay={3}
            loading={refreshing}
            onClick={() => navigateTo("/admin/galeria")}
          />
        </div>

        {/* Estatísticas de Agentes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiGroupLine className="w-5 h-5" />
              Estatísticas de Agentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Ativos"
                value={localAgentsStats.active || 0}
                icon={<RiEyeLine className="w-6 h-6" />}
                description={`${
                  localAgentsStats.total > 0
                    ? Math.round(
                        (localAgentsStats.active / localAgentsStats.total) * 100
                      )
                    : 0
                }% do total`}
                color="green"
                delay={0}
                loading={refreshing}
                onClick={() => navigateTo("/admin/agentes?status=active")}
              />
              <StatCard
                title="Inativos"
                value={localAgentsStats.inactive || 0}
                icon={<RiEyeOffLine className="w-6 h-6" />}
                description="Necessitam ativação"
                color="red"
                delay={1}
                loading={refreshing}
                onClick={() => navigateTo("/admin/agentes?status=inactive")}
              />
              <StatCard
                title="Agentes Comuns"
                value={localAgentsStats.agents || 0}
                icon={<RiUserLine className="w-6 h-6" />}
                description="Acesso básico"
                color="cyan"
                delay={2}
                loading={refreshing}
                onClick={() => navigateTo("/admin/agentes?role=agent")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumo do Sistema */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiDashboardLine className="w-5 h-5" />
              Resumo do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <RiGroupLine className="w-4 h-4" />
                  Distribuição de Agentes
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Administradores
                    </span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {localAgentsStats.admins}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Agentes Comuns
                    </span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {localAgentsStats.agents}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <Badge variant="outline">{localAgentsStats.total}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <RiNewspaperLine className="w-4 h-4" />
                  Conteúdo Publicado
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Notícias</span>
                    <Badge className="bg-green-100 text-green-800">
                      {dashboardData.totalNews}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Itens na Galeria
                    </span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {dashboardData.totalGalleryItems}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Categorias</span>
                    <Badge variant="outline">
                      {dashboardData.totalCategories}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <RiBarChart2Line className="w-4 h-4" />
                  Status do Sistema
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Taxa de Atividade
                    </span>
                    <Badge
                      className={
                        localAgentsStats.total > 0 &&
                        localAgentsStats.active / localAgentsStats.total > 0.8
                          ? "bg-green-100 text-green-800"
                          : localAgentsStats.active / localAgentsStats.total >
                            0.5
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {localAgentsStats.total > 0
                        ? `${Math.round(
                            (localAgentsStats.active / localAgentsStats.total) *
                              100
                          )}%`
                        : "0%"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Agentes por Admin
                    </span>
                    <Badge variant="outline">
                      {localAgentsStats.admins > 0
                        ? Math.round(
                            localAgentsStats.agents / localAgentsStats.admins
                          )
                        : "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Última Atualização
                    </span>
                    <span className="text-xs text-gray-500">Agora</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        {dashboardData.recentActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <RiCalendarLine className="w-5 h-5 mr-2" />
                  Atividades Recentes
                </div>
                <Badge variant="secondary">
                  {dashboardData.recentActivities.length} atividades
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivities
                activities={dashboardData.recentActivities}
                loading={refreshing}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
