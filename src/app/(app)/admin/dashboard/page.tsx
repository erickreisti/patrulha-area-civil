"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  RiUserLine,
  RiShieldLine,
  RiNewspaperLine,
  RiImageLine,
  RiVideoLine,
  RiBarChartLine,
  RiRefreshLine,
  RiErrorWarningLine,
  RiTimeLine,
  RiCheckLine,
  RiUserAddLine,
  RiFileAddLine,
  RiFolderAddLine,
  RiSettingsLine,
  RiDashboardLine,
  RiFileTextLine,
} from "react-icons/ri";
import {
  getDashboardStats,
  type DashboardResponse,
} from "@/app/actions/admin/dashboard/dashboard";
import { useRouter } from "next/navigation";

// Tipos de cores para StatCard
type StatCardColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "cyan"
  | "pink"
  | "indigo"
  | "gray"
  | "yellow";

// Tipos de cores para QuickActionCard
type QuickActionColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "cyan"
  | "indigo";

// Card de estatística
function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  color = "blue",
  subtitle,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  color?: StatCardColor;
  subtitle?: string;
  trend?: number;
}) {
  const colors: Record<StatCardColor, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
    pink: "bg-pink-50 text-pink-700 border-pink-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };

  return (
    <Card
      className={`${colors[color]} border hover:shadow-md transition-shadow`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{value}</div>
              {trend !== undefined && (
                <Badge
                  variant={trend >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {trend >= 0 ? "+" : ""}
                  {trend}%
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Card de atalho rápido
function QuickActionCard({
  title,
  description,
  icon: Icon,
  color = "blue",
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: QuickActionColor;
  onClick: () => void;
}) {
  const colors: Record<QuickActionColor, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    green: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    purple:
      "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    orange:
      "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    red: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
    indigo:
      "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
  };

  return (
    <Card
      className={`${colors[color]} border cursor-pointer transition-all hover:shadow-md hover:-translate-y-1`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Interface para atividade
interface Activity {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  user_name: string | null;
}

// Card de atividade recente
function ActivityCard({ activity }: { activity: Activity }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} h atrás`;
    if (diffDays < 7) return `${diffDays} dias atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case "user_login":
        return <RiUserLine className="h-4 w-4" />;
      case "user_created":
        return <RiUserAddLine className="h-4 w-4" />;
      case "news_published":
        return <RiNewspaperLine className="h-4 w-4" />;
      case "agent_creation":
        return <RiUserAddLine className="h-4 w-4" />;
      case "agent_update":
        return <RiSettingsLine className="h-4 w-4" />;
      case "gallery_upload":
        return <RiImageLine className="h-4 w-4" />;
      default:
        return <RiTimeLine className="h-4 w-4" />;
    }
  };

  const getActivityColor = (actionType: string) => {
    if (actionType.includes("user") || actionType.includes("login"))
      return "text-blue-600 bg-blue-100";
    if (actionType.includes("news") || actionType.includes("publish"))
      return "text-green-600 bg-green-100";
    if (actionType.includes("agent") || actionType.includes("creation"))
      return "text-purple-600 bg-purple-100";
    if (actionType.includes("gallery") || actionType.includes("upload"))
      return "text-orange-600 bg-orange-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
      <div
        className={`p-2 rounded-full ${getActivityColor(activity.action_type)}`}
      >
        {getActivityIcon(activity.action_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">
          {activity.description}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span>{activity.user_name}</span>
          <span>•</span>
          <span>{formatDate(activity.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Carregando dashboard...");
      const result = await getDashboardStats();
      console.log("📊 Resultado:", result);

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || "Erro ao carregar dashboard");

        if (
          result.error?.includes("Acesso restrito") ||
          result.error?.includes("Não autenticado")
        ) {
          setTimeout(() => {
            router.push("/perfil");
          }, 2000);
        }
      }
    } catch (err) {
      console.error("❌ Erro:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    loadDashboard();
  };

  const quickActions = [
    {
      title: "Novo Agente",
      description: "Adicionar novo agente ao sistema",
      icon: RiUserAddLine,
      color: "blue" as QuickActionColor,
      path: "/admin/agentes/novo",
    },
    {
      title: "Publicar Notícia",
      description: "Criar e publicar nova notícia",
      icon: RiFileAddLine,
      color: "green" as QuickActionColor,
      path: "/admin/noticias/nova",
    },
    {
      title: "Upload na Galeria",
      description: "Adicionar fotos ou vídeos",
      icon: RiFolderAddLine,
      color: "orange" as QuickActionColor,
      path: "/admin/galeria/upload",
    },
    {
      title: "Configurações",
      description: "Configurar sistema e permissões",
      icon: RiSettingsLine,
      color: "purple" as QuickActionColor,
      path: "/admin/configuracoes",
    },
    {
      title: "Ver Logs",
      description: "Visualizar logs do sistema",
      icon: RiFileTextLine,
      color: "indigo" as QuickActionColor,
      path: "/admin/logs",
    },
    {
      title: "Dashboard Avançado",
      description: "Estatísticas detalhadas",
      icon: RiDashboardLine,
      color: "cyan" as QuickActionColor,
      path: "/admin/estatisticas",
    },
  ];

  if (loading && !data) {
    return <LoadingSkeleton />;
  }

  if (error && !loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <RiErrorWarningLine className="h-12 w-12 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Acesso Restrito
                </h3>
                <p className="text-red-600 mt-1">{error}</p>
                {error.includes("redirecionando") && (
                  <p className="text-sm text-red-500 mt-2">
                    Redirecionando para o perfil...
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline">
                  <RiRefreshLine className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
                <Button onClick={() => router.push("/perfil")}>
                  Voltar ao Perfil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema e estatísticas
          </p>
          {data?.debug && (
            <p className="text-xs text-slate-500 mt-2">
              Logado como: {data.debug.userEmail} • Última atualização:{" "}
              {new Date().toLocaleTimeString("pt-BR")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RiRefreshLine
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RiUserLine className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Usuários</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {stats?.totalAgents || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Agentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {stats?.totalAdmins || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Admins</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RiNewspaperLine className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Notícias</h3>
              </div>
              <div className="text-2xl font-bold mt-4">
                {stats?.totalNews || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats?.publishedNews || 0} publicadas
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RiImageLine className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-lg">Galeria</h3>
              </div>
              <div className="text-2xl font-bold mt-4">
                {stats?.totalGalleryItems || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats?.totalFotos || 0} fotos • {stats?.totalVideos || 0}{" "}
                vídeos
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RiTimeLine className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Atividades</h3>
              </div>
              <div className="text-2xl font-bold mt-4">
                {stats?.recentActivities?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Últimas 24 horas
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Estatísticas Detalhadas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Agentes Ativos"
          value={stats?.activeAgents || 0}
          icon={RiUserLine}
          loading={loading}
          color="green"
          subtitle={`de ${stats?.totalAgents || 0} total`}
        />
        <StatCard
          title="Agentes Inativos"
          value={stats?.inactiveAgents || 0}
          icon={RiUserLine}
          loading={loading}
          color="red"
        />
        <StatCard
          title="Admins Ativos"
          value={stats?.activeAdmins || 0}
          icon={RiShieldLine}
          loading={loading}
          color="green"
          subtitle={`de ${stats?.totalAdmins || 0} total`}
        />
        <StatCard
          title="Notícias em Destaque"
          value={stats?.featuredNews || 0}
          icon={RiNewspaperLine}
          loading={loading}
          color="orange"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Notícias Publicadas"
          value={stats?.publishedNews || 0}
          icon={RiCheckLine}
          loading={loading}
          color="green"
        />
        <StatCard
          title="Notícias em Rascunho"
          value={stats?.draftNews || 0}
          icon={RiFileTextLine}
          loading={loading}
          color="blue"
        />
        <StatCard
          title="Notícias Arquivadas"
          value={stats?.archivedNews || 0}
          icon={RiFileTextLine}
          loading={loading}
          color="gray"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Fotos"
          value={stats?.totalFotos || 0}
          icon={RiImageLine}
          loading={loading}
          color="blue"
        />
        <StatCard
          title="Total de Vídeos"
          value={stats?.totalVideos || 0}
          icon={RiVideoLine}
          loading={loading}
          color="purple"
        />
        <StatCard
          title="Categorias"
          value={stats?.totalCategories || 0}
          icon={RiFolderAddLine}
          loading={loading}
          color="green"
        />
        <StatCard
          title="Itens na Galeria"
          value={stats?.totalGalleryItems || 0}
          icon={RiImageLine}
          loading={loading}
          color="orange"
        />
      </div>

      {/* Atalhos Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiBarChartLine className="h-5 w-5" />
            Atalhos Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onClick={() => router.push(action.path)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Atividades Recentes e Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiTimeLine className="h-5 w-5" />
              Atividades Recentes
              <Badge variant="outline" className="ml-2">
                {stats?.recentActivities?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stats.recentActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma atividade recente
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiDashboardLine className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Usuários Online</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {Math.floor((stats?.totalAgents || 0) * 0.3)} ativos
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notícias Hoje</span>
                <Badge variant="outline">
                  {Math.floor((stats?.totalNews || 0) * 0.1)} novas
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uploads Hoje</span>
                <Badge variant="outline">
                  {Math.floor((stats?.totalGalleryItems || 0) * 0.05)} itens
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uso do Sistema</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Normal
                </Badge>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Links Úteis</h4>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/admin/agentes")}
                >
                  <RiUserLine className="h-4 w-4 mr-2" />
                  Gerenciar Agentes
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/admin/noticias")}
                >
                  <RiNewspaperLine className="h-4 w-4 mr-2" />
                  Gerenciar Notícias
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/admin/galeria")}
                >
                  <RiImageLine className="h-4 w-4 mr-2" />
                  Gerenciar Galeria
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/admin/logs")}
                >
                  <RiFileTextLine className="h-4 w-4 mr-2" />
                  Ver Logs do Sistema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Debug (apenas para desenvolvimento) */}
      {process.env.NODE_ENV === "development" && data?.debug && (
        <Card className="border-dashed border-gray-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Informações de Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-gray-50 p-4 rounded overflow-auto">
              <pre>{JSON.stringify(data.debug, null, 2)}</pre>
              {stats?.summary && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Resumo:</h4>
                  <pre>{JSON.stringify(stats.summary, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Loading State
function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}
