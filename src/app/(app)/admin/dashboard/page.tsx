"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Zustand Stores
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useActivitiesStore } from "@/lib/stores/useActivitiesStore";

// Componentes
import { LoadingSkeleton } from "./components/dashboard/LoadingSkeleton";
import { DashboardStats } from "./components/dashboard/DashboardStats";
import { Button } from "@/components/ui/button";
import { RiRefreshLine } from "react-icons/ri";

// Tipos
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
  recentActivities: Array<{
    id: string;
    action_type: string;
    description: string;
    created_at: string;
    user_name: string | null;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();

  // Zustand Stores
  const { profile, hasAdminSession } = useAuthStore();
  const { dashboardStats, loadingDashboard, fetchDashboardStats } =
    useActivitiesStore();

  // Estado local
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localAgentsStats, setLocalAgentsStats] = useState<AgentsStats>({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    agents: 0,
  });

  // Carregar dados
  const loadDashboard = useCallback(async () => {
    console.log("📊 [DashboardPage] Carregando dados do dashboard...");
    setLoading(true);
    setError(null);

    try {
      // 1. Verificar sessão admin via cookies primeiro
      const authModule = await import("@/app/actions/auth/auth");
      const sessionCheck = await authModule.verifyAdminSession();

      if (!sessionCheck.success) {
        console.log(
          "❌ [DashboardPage] Sem sessão admin válida:",
          sessionCheck.error
        );
        throw new Error(
          "Acesso não autorizado. Faça login como administrador."
        );
      }

      console.log(
        "✅ [DashboardPage] Sessão admin verificada:",
        sessionCheck.user?.id
      );

      // 2. Carregar estatísticas em paralelo
      const [dashboardResult, agentsResult] = await Promise.all([
        fetchDashboardStats(),
        (async () => {
          try {
            const agentsModule = await import(
              "@/app/actions/admin/agents/agents"
            );
            const result = await agentsModule.getAgentsStats();
            return result;
          } catch (err) {
            console.error("⚠️ Erro ao carregar agentes:", err);
            return {
              success: false,
              data: {
                total: 0,
                active: 0,
                inactive: 0,
                admins: 0,
                agents: 0,
                updated_at: new Date().toISOString(),
              },
            };
          }
        })(),
      ]);

      // 3. Processar resultados
      if (dashboardResult) {
        console.log("✅ [DashboardPage] Estatísticas do dashboard carregadas");
      }

      if (agentsResult?.success && agentsResult.data) {
        console.log(
          "✅ [DashboardPage] Estatísticas de agentes carregadas:",
          agentsResult.data
        );
        setLocalAgentsStats(agentsResult.data);
      } else {
        console.warn(
          "⚠️ [DashboardPage] Estatísticas de agentes não disponíveis"
        );
      }
    } catch (err) {
      console.error("❌ [DashboardPage] Erro ao carregar dashboard:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats]);

  // Efeito inicial
  useEffect(() => {
    console.log("🔍 [DashboardPage] Iniciando useEffect...");

    const checkAndLoad = async () => {
      try {
        // Verificar cookies admin diretamente
        const authModule = await import("@/app/actions/auth/auth");
        const sessionCheck = await authModule.verifyAdminSession();

        if (sessionCheck.success && sessionCheck.user) {
          console.log(
            "✅ [DashboardPage] Admin com sessão, carregando dashboard..."
          );
          await loadDashboard();
        } else {
          console.log("❌ [DashboardPage] Acesso negado:", sessionCheck.error);

          // Redirecionar para perfil após 1 segundo
          const timer = setTimeout(() => {
            console.log("🔄 [DashboardPage] Redirecionando para /perfil...");
            router.push("/perfil");
          }, 1000);

          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("❌ [DashboardPage] Erro na verificação:", err);
        setError("Erro na verificação de acesso");
        setLoading(false);
      }
    };

    checkAndLoad();
  }, [router, loadDashboard]);

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

  // Se está carregando
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Se tem erro
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-medium text-red-800">
          Erro ao carregar dashboard
        </h2>
        <p className="text-red-600 mt-2">{error}</p>
        <div className="mt-4 space-x-4">
          <Button
            onClick={handleRefresh}
            className="bg-red-600 hover:bg-red-700"
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
      </div>
    );
  }

  // Obter role do perfil
  const userRole = profile?.role || "agent";

  console.log("🔍 [DashboardPage] Renderizando com:", {
    userRole,
    hasAdminSession,
    profileId: profile?.id,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Botão de Refresh */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loadingDashboard}
          className="flex items-center gap-2"
        >
          <RiRefreshLine className="h-4 w-4" />
          Atualizar Dados
        </Button>
      </div>

      {/* Estatísticas */}
      <DashboardStats
        agentsStats={localAgentsStats}
        dashboardData={getDashboardData()}
        loading={loadingDashboard}
        navigateTo={navigateTo}
        profile={profile}
      />

      {/* Área para widgets adicionais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Resumo do Sistema
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={loadingDashboard}
          >
            <RiRefreshLine className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {localAgentsStats.total}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total de Usuários</div>
            <div className="text-xs text-gray-500 mt-1">
              {localAgentsStats.active} ativos • {localAgentsStats.inactive}{" "}
              inativos
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {getDashboardData().totalNews}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Notícias Publicadas
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {getDashboardData().totalGalleryItems}
            </div>
            <div className="text-sm text-gray-600 mt-1">Itens na Galeria</div>
            <div className="text-xs text-gray-500 mt-1">
              {getDashboardData().totalCategories} categorias
            </div>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {localAgentsStats.admins}
            </div>
            <div className="text-sm text-gray-600 mt-1">Administradores</div>
            <div className="text-xs text-gray-500 mt-1">
              {localAgentsStats.agents} agentes comuns
            </div>
          </div>
        </div>
      </motion.div>

      {/* Seção de Atividades Recentes */}
      {getDashboardData().recentActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Atividades Recentes
          </h3>
          <div className="space-y-3">
            {getDashboardData()
              .recentActivities.slice(0, 5)
              .map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {activity.description}
                    </div>
                    <div className="text-sm text-gray-600">
                      Por: {activity.user_name || "Sistema"} •{" "}
                      {new Date(activity.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {activity.action_type}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
