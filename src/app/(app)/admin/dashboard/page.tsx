// src/app/(app)/admin/dashboard/page.tsx - CORRIGIDO
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FaUsers,
  FaNewspaper,
  FaImages,
  FaChartBar,
  FaPlus,
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaServer,
  FaFolder,
  FaVideo,
  FaCamera,
  FaGlobe,
  FaEdit,
  FaHome,
} from "react-icons/fa";

interface DashboardStats {
  totalAgents: number;
  totalNews: number;
  totalGalleryItems: number;
  activeAgents: number;
  totalCategories: number;
  featuredNews: number;
  publishedNews: number;
  photoItems: number;
  videoItems: number;
  photoCategories: number;
  videoCategories: number;
}

interface SystemStatus {
  database: "online" | "offline" | "slow";
  status: "excellent" | "warning" | "critical";
  message: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalNews: 0,
    totalGalleryItems: 0,
    activeAgents: 0,
    totalCategories: 0,
    featuredNews: 0,
    publishedNews: 0,
    photoItems: 0,
    videoItems: 0,
    photoCategories: 0,
    videoCategories: 0,
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "online",
    status: "excellent",
    message: "Sistema operando normalmente",
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        const startTime = Date.now();
        const { data, error, count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .limit(1);

        const responseTime = Date.now() - startTime;

        if (error) throw error;

        if (responseTime < 500) {
          setSystemStatus({
            database: "online",
            status: "excellent",
            message: "Conexão excelente com o banco",
          });
        } else if (responseTime < 2000) {
          setSystemStatus({
            database: "slow",
            status: "warning",
            message: "Conexão lenta com o banco",
          });
        } else {
          setSystemStatus({
            database: "slow",
            status: "warning",
            message: "Conexão muito lenta com o banco",
          });
        }

        return true;
      } catch (error: any) {
        console.error("Erro na conexão com o banco:", error);
        setSystemStatus({
          database: "offline",
          status: "critical",
          message: "Erro na conexão com o banco",
        });
        return false;
      }
    };

    const fetchStats = async () => {
      try {
        setLoading(true);
        const connectionOk = await checkDatabaseConnection();

        if (connectionOk) {
          const [
            agentsResponse,
            newsResponse,
            galleryResponse,
            categoriesResponse,
          ] = await Promise.all([
            supabase
              .from("profiles")
              .select("id, status, role")
              .eq("role", "agent"),
            supabase
              .from("noticias")
              .select("id, destaque, status, data_publicacao"),
            supabase.from("galeria_itens").select("id, tipo, status"),
            supabase.from("galeria_categorias").select("id, tipo, status"),
          ]);

          const agentsData = agentsResponse.data || [];
          const totalAgents = agentsData.length;
          const activeAgents = agentsData.filter(
            (agent) => agent.status
          ).length;

          const newsData = newsResponse.data || [];
          const totalNews = newsData.length;
          const featuredNews = newsData.filter((news) => news.destaque).length;
          const publishedNews = newsData.filter(
            (news) => news.status === "publicado"
          ).length;

          const galleryData = galleryResponse.data || [];
          const totalGalleryItems = galleryData.length;
          const photoItems = galleryData.filter(
            (item) => item.tipo === "foto"
          ).length;
          const videoItems = galleryData.filter(
            (item) => item.tipo === "video"
          ).length;

          const categoriesData = categoriesResponse.data || [];
          const totalCategories = categoriesData.length;
          const photoCategories = categoriesData.filter(
            (cat) => cat.tipo === "fotos"
          ).length;
          const videoCategories = categoriesData.filter(
            (cat) => cat.tipo === "videos"
          ).length;

          setStats({
            totalAgents,
            totalNews,
            totalGalleryItems,
            activeAgents,
            totalCategories,
            featuredNews,
            publishedNews,
            photoItems,
            videoItems,
            photoCategories,
            videoCategories,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(checkDatabaseConnection, 30000);
    return () => clearInterval(interval);
  }, [supabase]);

  const StatusIndicator = () => {
    const statusConfig = {
      excellent: {
        color: "bg-green-500",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: FaCheckCircle,
        label: "Ótimo",
      },
      warning: {
        color: "bg-yellow-500",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        icon: FaExclamationTriangle,
        label: "Atenção",
      },
      critical: {
        color: "bg-red-500",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: FaExclamationTriangle,
        label: "Crítico",
      },
    };

    const config = statusConfig[systemStatus.status];
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <FaServer className="w-3 h-3 text-gray-600" />
          <span className="text-xs text-gray-600 font-medium hidden sm:inline">
            Status:
          </span>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div
                className={`w-3 h-3 rounded-full ${config.color} animate-pulse`}
                title={systemStatus.message}
              />
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {systemStatus.message}
              </div>
            </div>
            <span
              className={`text-xs font-medium ${config.textColor} hidden sm:inline`}
            >
              {config.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    color = "navy",
  }: {
    title: string;
    value: number;
    icon: any;
    description: string;
    color?: "blue" | "green" | "purple" | "navy";
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      navy: "from-navy to-navy-700",
    };

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                {title}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {loading ? "..." : value}
              </p>
              <p className="text-xs text-gray-500 truncate">{description}</p>
            </div>
            <div
              className={`p-2 sm:p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-3`}
            >
              <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // CORREÇÃO: Adicionar "purple" ao tipo de color
  const QuickAction = ({
    title,
    description,
    icon: Icon,
    href,
    color = "navy",
  }: {
    title: string;
    description: string;
    icon: any;
    href: string;
    color?: "navy" | "green" | "blue" | "purple"; // CORRIGIDO: Adicionei "purple"
  }) => {
    const colorClasses = {
      navy: "bg-navy hover:bg-navy-700 text-white",
      green: "bg-green-600 hover:bg-green-700 text-white",
      blue: "bg-blue-600 hover:bg-blue-700 text-white",
      purple: "bg-purple-600 hover:bg-purple-700 text-white", // CORRIGIDO: Adicionei purple
    };

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm h-full">
        <CardContent className="p-4 sm:p-6 h-full">
          <div className="flex items-start space-x-3 sm:space-x-4 h-full">
            <div
              className={`p-2 sm:p-3 rounded-lg ${
                colorClasses[color].split(" ")[0]
              } text-white flex-shrink-0`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base truncate">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                {description}
              </p>
              <Button
                asChild
                className={`${colorClasses[color]} font-medium w-full sm:w-auto`}
                size="sm"
              >
                <Link href={href}>Acessar</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const RecentActivity = () => (
    <Card className="border-0 shadow-md h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <FaClock className="w-5 h-5 text-gray-600 mr-2" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <FaCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                Sistema atualizado
              </p>
              <p className="text-xs text-gray-600">Há 2 minutos</p>
            </div>
          </div>

          {stats.featuredNews > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <FaNewspaper className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {stats.featuredNews} notícia(s) em destaque
                </p>
                <p className="text-xs text-gray-600">Destaques ativos</p>
              </div>
            </div>
          )}

          {stats.publishedNews > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <FaNewspaper className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {stats.publishedNews} notícia(s) publicadas
                </p>
                <p className="text-xs text-gray-600">No site</p>
              </div>
            </div>
          )}

          {stats.photoItems > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <FaCamera className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {stats.photoItems} foto(s) na galeria
                </p>
                <p className="text-xs text-gray-600">Disponíveis</p>
              </div>
            </div>
          )}

          {stats.videoItems > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <FaVideo className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {stats.videoItems} vídeo(s) na galeria
                </p>
                <p className="text-xs text-gray-600">Disponíveis</p>
              </div>
            </div>
          )}

          {systemStatus.status === "warning" && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <FaExclamationTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  Conexão lenta com o banco
                </p>
                <p className="text-xs text-gray-600">Verifique a conexão</p>
              </div>
            </div>
          )}

          {systemStatus.status === "critical" && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <FaExclamationTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  Erro na conexão com o banco
                </p>
                <p className="text-xs text-gray-600">Ação necessária</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header do Dashboard */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
                PAINEL ADMINISTRATIVO
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Bem-vindo ao centro de controle da Patrulha Aérea Civil
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Status do Sistema */}
              <div className="flex items-center gap-3 order-2 sm:order-1">
                <StatusIndicator />
                {/* 🔵 AZUL - Ações Administrativas */}
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-6 py-2.5"
                >
                  <Link href="/admin/configuracoes">
                    <FaCog className="w-4 h-4 mr-2" />
                    Configurações
                  </Link>
                </Button>
              </div>

              {/* Links de Navegação */}
              <div className="flex gap-3 order-1 sm:order-2">
                {/* 🔵 AZUL - Ações Administrativas */}
                <Button
                  asChild
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <Link href="/perfil">
                    <FaEdit className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Editar Perfil</span>
                  </Link>
                </Button>
                {/* ⚫ CINZA - Navegação Neutra */}
                <Button
                  asChild
                  variant="outline"
                  className="text-slate-700 border-slate-300 hover:bg-slate-100"
                >
                  <Link href="/">
                    <FaHome className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Voltar ao Site</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total de Agentes"
            value={stats.totalAgents}
            icon={FaUsers}
            description={`${stats.activeAgents} ativos`}
            color="blue"
          />
          <StatCard
            title="Notícias Publicadas"
            value={stats.totalNews}
            icon={FaNewspaper}
            description={`${stats.publishedNews} publicadas`}
            color="green"
          />
          <StatCard
            title="Galeria"
            value={stats.totalGalleryItems}
            icon={FaImages}
            description={`${stats.photoItems} fotos, ${stats.videoItems} vídeos`}
            color="purple"
          />
          <StatCard
            title="Categorias"
            value={stats.totalCategories}
            icon={FaFolder}
            description={`${stats.photoCategories} fotos, ${stats.videoCategories} vídeos`}
            color="navy"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ações Rápidas */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FaPlus className="w-5 h-5 text-gray-600 mr-2" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <QuickAction
                    title="Gerenciar Agentes"
                    description="Adicionar, editar ou remover agentes do sistema"
                    icon={FaUsers}
                    href="/admin/agentes"
                    color="navy"
                  />
                  <QuickAction
                    title="Criar Notícia"
                    description="Publicar nova notícia no site"
                    icon={FaNewspaper}
                    href="/admin/noticias/criar"
                    color="green"
                  />
                  <QuickAction
                    title="Gerenciar Galeria"
                    description="Adicionar fotos e vídeos"
                    icon={FaImages}
                    href="/admin/galeria"
                    color="blue"
                  />
                  <QuickAction
                    title="Ver Relatórios"
                    description="Acessar relatórios do sistema"
                    icon={FaChartBar}
                    href="/admin/relatorios"
                    color="purple" // AGORA FUNCIONA: "purple" está incluído no tipo
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Atividade Recente */}
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
