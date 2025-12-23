// /app/(app)/admin/dashboard/page.tsx - COMPLETO
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RiUserLine,
  RiNewspaperLine,
  RiImageLine,
  RiShieldLine,
  RiRefreshLine,
  RiAddLine,
  RiEyeLine,
  RiGroupLine,
} from "react-icons/ri";

// Import do novo arquivo dashboard.ts
import {
  getDashboardData,
  type SystemActivity,
} from "@/app/actions/admin/dashboard/dashboard";

interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalAdmins: number;
  inactiveAgents: number;
  totalNews: number;
  publishedNews: number;
  featuredNews: number;
  archivedNews: number;
  draftNews: number;
  totalFotos: number;
  totalVideos: number;
  totalGalleryItems: number;
  totalCategories: number;
  photoCategories: number;
  videoCategories: number;
  archivedCategories: number;
}

interface ActivityStats {
  total: number;
  topTypes: Array<{ type: string; count: number }>;
  timeframe: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    activeAgents: 0,
    totalAdmins: 0,
    inactiveAgents: 0,
    totalNews: 0,
    publishedNews: 0,
    featuredNews: 0,
    archivedNews: 0,
    draftNews: 0,
    totalFotos: 0,
    totalVideos: 0,
    totalGalleryItems: 0,
    totalCategories: 0,
    photoCategories: 0,
    videoCategories: 0,
    archivedCategories: 0,
  });
  const [recentActivities, setRecentActivities] = useState<SystemActivity[]>(
    []
  );
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    total: 0,
    topTypes: [],
    timeframe: "week",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getDashboardData();

      if (result.success && result.data) {
        const {
          stats: dashboardStats,
          recentActivities,
          activityStats,
        } = result.data;

        setStats({
          totalAgents: dashboardStats.totalAgents,
          activeAgents: dashboardStats.activeAgents,
          totalAdmins: dashboardStats.totalAdmins,
          inactiveAgents: dashboardStats.inactiveAgents,
          totalNews: dashboardStats.totalNews,
          publishedNews: dashboardStats.publishedNews,
          featuredNews: dashboardStats.featuredNews,
          archivedNews: dashboardStats.archivedNews,
          draftNews: dashboardStats.draftNews,
          totalFotos: dashboardStats.photoItems,
          totalVideos: dashboardStats.videoItems,
          totalGalleryItems: dashboardStats.totalGalleryItems,
          totalCategories: dashboardStats.totalCategories,
          photoCategories: dashboardStats.photoCategories,
          videoCategories: dashboardStats.videoCategories,
          archivedCategories: dashboardStats.archivedCategories,
        });

        setRecentActivities(recentActivities);
        setActivityStats(activityStats);
      } else {
        console.error("Erro ao carregar dashboard:", result.error);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o sistema da Patrulha Aérea Civil
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RiRefreshLine className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          <Button
            size="sm"
            onClick={() => (window.location.href = "/admin/agentes/novo")}
          >
            <RiAddLine className="h-4 w-4 mr-2" />
            Novo Agente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Agentes"
          value={stats.totalAgents}
          icon={<RiUserLine className="h-4 w-4" />}
          description={`${stats.activeAgents} ativos • ${stats.inactiveAgents} inativos`}
          color="blue"
        />

        <StatsCard
          title="Notícias"
          value={stats.totalNews}
          icon={<RiNewspaperLine className="h-4 w-4" />}
          description={`${stats.publishedNews} publicadas • ${stats.featuredNews} em destaque`}
          color="green"
        />

        <StatsCard
          title="Galeria"
          value={stats.totalGalleryItems}
          icon={<RiImageLine className="h-4 w-4" />}
          description={`${stats.totalFotos} fotos • ${stats.totalVideos} vídeos`}
          color="purple"
        />

        <StatsCard
          title="Administradores"
          value={stats.totalAdmins}
          icon={<RiShieldLine className="h-4 w-4" />}
          description={`${stats.activeAgents} ativos no total`}
          color="amber"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Estatísticas de Agentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiGroupLine className="h-5 w-5" />
              Estatísticas de Agentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatItem label="Total de Agentes" value={stats.totalAgents} />
              <StatItem
                label="Agentes Ativos"
                value={stats.activeAgents}
                variant="success"
              />
              <StatItem
                label="Agentes Inativos"
                value={stats.inactiveAgents}
                variant="destructive"
              />
              <StatItem
                label="Administradores"
                value={stats.totalAdmins}
                variant="blue"
              />
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Taxa de atividade:{" "}
                  {stats.totalAgents > 0
                    ? Math.round((stats.activeAgents / stats.totalAgents) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas de Notícias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiNewspaperLine className="h-5 w-5" />
              Estatísticas de Notícias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatItem label="Total de Notícias" value={stats.totalNews} />
              <StatItem
                label="Publicadas"
                value={stats.publishedNews}
                variant="success"
              />
              <StatItem
                label="Em Destaque"
                value={stats.featuredNews}
                variant="amber"
              />
              <StatItem
                label="Rascunhos"
                value={stats.draftNews}
                variant="blue"
              />
              <StatItem
                label="Arquivadas"
                value={stats.archivedNews}
                variant="destructive"
              />
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Taxa de publicação:{" "}
                  {stats.totalNews > 0
                    ? Math.round((stats.publishedNews / stats.totalNews) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas da Galeria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiImageLine className="h-5 w-5" />
              Estatísticas da Galeria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <RiImageLine className="h-4 w-4 text-blue-500" />
                <StatItem label="Total de Fotos" value={stats.totalFotos} />
              </div>
              <div className="flex items-center gap-2">
                <RiImageLine className="h-4 w-4 text-purple-500" />
                <StatItem label="Total de Vídeos" value={stats.totalVideos} />
              </div>
              <StatItem
                label="Total de Categorias"
                value={stats.totalCategories}
              />
              <div className="grid grid-cols-2 gap-2">
                <StatItem
                  label="Categorias Fotos"
                  value={stats.photoCategories}
                  variant="blue"
                />
                <StatItem
                  label="Categorias Vídeos"
                  value={stats.videoCategories}
                  variant="purple"
                />
              </div>
              <StatItem
                label="Categorias Arquivadas"
                value={stats.archivedCategories}
                variant="destructive"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes */}
      {recentActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user_profile?.full_name ||
                        activity.user_profile?.email ||
                        "Sistema"}{" "}
                      •{" "}
                      {new Date(activity.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {activity.action_type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas de Atividades */}
      {activityStats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Estatísticas de Atividades ({activityStats.timeframe})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold">{activityStats.total}</p>
                <p className="text-sm text-muted-foreground">
                  Total de atividades
                </p>
              </div>
              {activityStats.topTypes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Tipos mais comuns:</p>
                  <div className="space-y-2">
                    {activityStats.topTypes.map((type) => (
                      <div
                        key={type.type}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{type.type}</span>
                        <span className="text-sm font-medium">
                          {type.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ActionButton
              label="Novo Agente"
              icon={<RiAddLine />}
              onClick={() => (window.location.href = "/admin/agentes/novo")}
            />
            <ActionButton
              label="Ver Agentes"
              icon={<RiEyeLine />}
              onClick={() => (window.location.href = "/admin/agentes")}
            />
            <ActionButton
              label="Nova Notícia"
              icon={<RiNewspaperLine />}
              onClick={() => (window.location.href = "/admin/noticias/novo")}
            />
            <ActionButton
              label="Ver Galeria"
              icon={<RiImageLine />}
              onClick={() => (window.location.href = "/admin/galeria")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componentes auxiliares
const LoadingSkeleton = () => (
  <div className="container mx-auto p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
    <Skeleton className="h-64" />
  </div>
);

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "purple" | "amber";
}

const StatsCard = ({
  title,
  value,
  icon,
  description,
  color,
}: StatsCardProps) => {
  const colors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={colors[color]}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

interface StatItemProps {
  label: string;
  value: number;
  variant?: "default" | "success" | "destructive" | "blue" | "amber" | "purple";
}

const StatItem = ({ label, value, variant = "default" }: StatItemProps) => {
  const variants = {
    default: "text-foreground",
    success: "text-green-600",
    destructive: "text-red-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    purple: "text-purple-600",
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-medium ${variants[variant]}`}>{value}</span>
    </div>
  );
};

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ActionButton = ({ label, icon, onClick }: ActionButtonProps) => (
  <Button
    variant="outline"
    className="flex items-center gap-2 justify-center h-auto py-3"
    onClick={onClick}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </Button>
);
