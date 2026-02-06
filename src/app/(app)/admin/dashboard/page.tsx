"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  RiRefreshLine,
  RiGroupLine,
  RiArticleLine,
  RiImageLine,
  RiHomeLine,
  RiShieldUserLine,
  RiNewspaperLine,
  RiGalleryLine,
  RiEyeLine,
  RiEyeOffLine,
  RiBarChart2Line,
  RiPieChartLine,
} from "react-icons/ri";

// Stores & Actions
import { useAuthStore } from "@/lib/stores/useAuthStore";

import { getDashboardStats } from "@/app/actions/admin/dashboard/dashboard";

// Componentes Locais
import { StatCard } from "@/components/admin/StatCard";
import {
  RecentActivities,
  DashboardActivity,
} from "./components/dashboard/RecentActivities";
import { LoadingSkeleton } from "./components/dashboard/LoadingSkeleton";
import { AdminAuthModal } from "@/components/admin/AdminAuthModal";

// === TIPOS LOCAIS ===
interface AgentsStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  regular: number;
}

interface ContentStats {
  news: number;
  gallery: number;
  categories: number;
}

interface DashboardData {
  agents: AgentsStats;
  content: ContentStats;
  recentActivities: DashboardActivity[];
}

// === SUB-COMPONENTES ===

const ActionButtons = ({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean;
  onRefresh: () => void;
}) => {
  const actions = [
    {
      href: "/admin/agentes",
      icon: RiGroupLine,
      label: "Agentes",
      color: "text-blue-600 border-blue-200 hover:bg-blue-50",
    },
    {
      href: "/admin/noticias",
      icon: RiArticleLine,
      label: "Notícias",
      color: "text-emerald-600 border-emerald-200 hover:bg-emerald-50",
    },
    {
      href: "/admin/galeria",
      icon: RiImageLine,
      label: "Galeria",
      color: "text-amber-600 border-amber-200 hover:bg-amber-50",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Ver Site",
      color: "text-slate-600 border-slate-200 hover:bg-slate-50",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <Button
        onClick={onRefresh}
        disabled={refreshing}
        variant="outline"
        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-sky-600 shadow-sm transition-all"
      >
        <RiRefreshLine
          className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
        />
        {refreshing ? "Atualizando..." : "Atualizar"}
      </Button>

      <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block" />

      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Button
            variant="outline"
            className={`bg-white shadow-sm transition-all ${action.color}`}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        </Link>
      ))}
    </div>
  );
};

const StatsGrid = ({
  data,
  loading,
}: {
  data: DashboardData;
  loading: boolean;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <StatCard
      title="Total de Agentes"
      value={data.agents.total}
      icon={RiGroupLine}
      loading={loading}
      variant="primary"
      subtitle="Cadastrados no sistema"
    />
    <StatCard
      title="Administradores"
      value={data.agents.admins}
      icon={RiShieldUserLine}
      loading={loading}
      variant="purple"
      subtitle="Acesso total"
    />
    <StatCard
      title="Notícias"
      value={data.content.news}
      icon={RiNewspaperLine}
      loading={loading}
      variant="success"
      subtitle="Publicações ativas"
    />
    <StatCard
      title="Galeria"
      value={data.content.gallery}
      icon={RiGalleryLine}
      loading={loading}
      variant="warning"
      subtitle={`${data.content.categories} categorias`}
    />
  </div>
);

const SystemSummary = ({
  agents,
  content,
}: {
  agents: AgentsStats;
  content: ContentStats;
}) => {
  const activeRate =
    agents.total > 0 ? Math.round((agents.active / agents.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Agentes */}
      <Card className="border-none shadow-sm h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <RiGroupLine />
              </div>
              Agentes
            </h3>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {agents.total} total
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 flex items-center gap-2">
                <RiEyeLine className="text-emerald-500" /> Ativos
              </span>
              <span className="font-bold text-slate-700">{agents.active}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${activeRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 flex items-center gap-2">
                <RiEyeOffLine className="text-red-500" /> Inativos
              </span>
              <span className="font-bold text-slate-700">
                {agents.inactive}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo */}
      <Card className="border-none shadow-sm h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <RiPieChartLine />
              </div>
              Conteúdo
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <span className="block text-2xl font-bold text-slate-800">
                {content.news}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wide">
                Notícias
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <span className="block text-2xl font-bold text-slate-800">
                {content.gallery}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wide">
                Mídias
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="border-none shadow-sm h-full bg-gradient-to-br from-sky-50 to-white">
        <CardContent className="p-6 flex flex-col justify-center h-full">
          <h3 className="font-bold text-sky-900 mb-1 flex items-center gap-2">
            <RiBarChart2Line /> Saúde do Sistema
          </h3>
          <p className="text-sm text-sky-700/80 mb-4">Métricas gerais de uso</p>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sky-800">
              Taxa de Atividade
            </span>
            <span className="text-lg font-bold text-sky-600">
              {activeRate}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sky-800">
              Admin Ratio
            </span>
            <span className="text-sm font-bold text-sky-600">
              {agents.total > 0
                ? Math.round((agents.admins / agents.total) * 100)
                : 0}
              %
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// === PÁGINA PRINCIPAL ===

export default function DashboardPage() {
  const { profile } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [data, setData] = useState<DashboardData>({
    agents: { total: 0, active: 0, inactive: 0, admins: 0, regular: 0 },
    content: { news: 0, gallery: 0, categories: 0 },
    recentActivities: [],
  });

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await getDashboardStats();

      if (result.success && result.data) {
        const s = result.data.summary || {};
        setData({
          agents: {
            total: s.agents?.total || 0,
            active: s.agents?.active || 0,
            inactive: s.agents?.inactive || 0,
            admins: s.agents?.admins || 0,
            regular: s.agents?.regular || 0,
          },
          content: {
            news: s.news?.total || 0,
            gallery: s.gallery?.total || 0,
            categories: s.gallery?.categories || 0,
          },
          recentActivities: result.data.recentActivities || [],
        });
        if (!loading) toast.success("Dashboard atualizado");
      } else {
        // Tratamento de sessão
        if (
          result.error === "AUTH_REQUIRED" ||
          result.error === "AUTH_EXPIRED" ||
          result.error === "AUTH_INVALID"
        ) {
          setShowAuthModal(true);
        } else {
          throw new Error(result.error || "Erro desconhecido");
        }
      }
    } catch (err) {
      console.error("Erro dashboard:", err);
      if (!showAuthModal) toast.error("Falha ao carregar dados");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, showAuthModal]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Se estiver carregando e não tiver dados, mostra o skeleton
  if (loading && !data.agents.total) return <LoadingSkeleton />;

  // Se não tem dados e não está carregando (ex: erro de auth), renderiza container vazio para o modal aparecer sobre ele
  if (!data.agents.total && !loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <AdminAuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            loadDashboard();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
      <AdminAuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          loadDashboard(); // Tenta recarregar ao fechar/sucesso
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-bebas">
            DASHBOARD
          </h1>
          <p className="text-slate-500">
            Visão geral do sistema.
            {profile?.full_name && (
              <span className="font-medium text-slate-700 ml-1">
                Bem-vindo, {profile.full_name.split(" ")[0]}.
              </span>
            )}
          </p>
        </motion.div>

        {/* Ações */}
        <ActionButtons refreshing={refreshing} onRefresh={loadDashboard} />

        {/* KPIs Principais */}
        <StatsGrid data={data} loading={refreshing} />

        {/* Resumo Detalhado */}
        <SystemSummary agents={data.agents} content={data.content} />

        {/* Atividades Recentes */}
        <div className="grid grid-cols-1 gap-6">
          <RecentActivities
            activities={data.recentActivities}
            loading={refreshing}
          />
        </div>
      </div>
    </div>
  );
}
