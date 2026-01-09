"use client";

import { motion } from "framer-motion";
import { StatCard } from "./StatCard";
import { RecentActivities } from "./RecentActivities";
import {
  RiGroupLine,
  RiShieldUserLine,
  RiArticleLine,
  RiGalleryLine,
  RiEyeLine,
  RiEyeOffLine,
  RiUserLine,
} from "react-icons/ri";

interface DashboardStatsProps {
  agentsStats: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    agents: number;
  };
  dashboardData: {
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
  };
  loading: boolean;
  navigateTo: (path: string) => void;
  profile?: {
    full_name?: string | null;
    matricula?: string | null;
  } | null;
}

export function DashboardStats({
  agentsStats,
  dashboardData,
  loading,
  navigateTo,
}: DashboardStatsProps) {
  const activePercentage =
    agentsStats.total > 0
      ? Math.round((agentsStats.active / agentsStats.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Grid Principal de Estatísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total de Agentes"
          value={agentsStats.total}
          icon={RiGroupLine}
          loading={loading}
          color="blue"
          subtitle={`${agentsStats.active} ativos`}
          onClick={() => navigateTo("/admin/agentes")}
        />

        <StatCard
          title="Administradores"
          value={agentsStats.admins}
          icon={RiShieldUserLine}
          loading={loading}
          color="purple"
          subtitle={`${agentsStats.admins} ativos`}
          onClick={() => navigateTo("/admin/agentes?role=admin")}
        />

        <StatCard
          title="Notícias"
          value={dashboardData.totalNews}
          icon={RiArticleLine}
          loading={loading}
          color="green"
          subtitle="Publicações no sistema"
          onClick={() => navigateTo("/admin/noticias")}
        />

        <StatCard
          title="Galeria"
          value={dashboardData.totalGalleryItems}
          icon={RiGalleryLine}
          loading={loading}
          color="orange"
          subtitle={`${dashboardData.totalCategories} categorias`}
          onClick={() => navigateTo("/admin/galeria")}
        />
      </motion.div>

      {/* Status dos Agentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <StatCard
          title="Agentes Ativos"
          value={agentsStats.active}
          icon={RiEyeLine}
          loading={loading}
          color="green"
          subtitle={`${activePercentage}% do total`}
          onClick={() => navigateTo("/admin/agentes?status=active")}
        />

        <StatCard
          title="Agentes Inativos"
          value={agentsStats.inactive}
          icon={RiEyeOffLine}
          loading={loading}
          color="red"
          subtitle="Necessitam ativação"
          onClick={() => navigateTo("/admin/agentes?status=inactive")}
        />

        <StatCard
          title="Agentes Comuns"
          value={agentsStats.agents}
          icon={RiUserLine}
          loading={loading}
          color="blue"
          subtitle="Acesso básico"
          onClick={() => navigateTo("/admin/agentes?role=agent")}
        />
      </motion.div>

      {/* Atividades Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <RecentActivities
          activities={dashboardData.recentActivities}
          loading={loading}
        />
      </motion.div>
    </div>
  );
}
