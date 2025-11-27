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
  FaCheckCircle,
  FaClock,
  FaServer,
  FaFolder,
  FaEdit,
  FaHome,
} from "react-icons/fa";
import React from "react";

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
  totalAdmins: number;
}

interface SystemStatus {
  database: "online" | "offline" | "slow";
  status: "excellent" | "warning" | "critical";
  message: string;
}

type IconType = React.ComponentType<{ className?: string }>;

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
    totalAdmins: 0,
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
        const { error } = await supabase
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
      } catch (error) {
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

        if (!connectionOk) {
          setLoading(false);
          return;
        }

        // ✅ BUSCAR TODOS OS DADOS CORRETAMENTE
        const [
          agentsResponse,
          newsResponse,
          galleryResponse,
          categoriesResponse,
        ] = await Promise.all([
          // ✅ CORREÇÃO: Buscar TODOS os perfis (agents e admins)
          supabase.from("profiles").select("id, status, role"),

          // ✅ Buscar todas as notícias
          supabase
            .from("noticias")
            .select("id, destaque, status, data_publicacao"),

          // ✅ Buscar todos os itens da galeria
          supabase.from("galeria_itens").select("id, tipo, status"),

          // ✅ Buscar todas as categorias
          supabase.from("galeria_categorias").select("id, tipo, status"),
        ]);

        // ✅ VERIFICAR ERROS EM TODAS AS QUERIES
        if (agentsResponse.error) {
          console.error("Erro ao buscar agentes:", agentsResponse.error);
          throw agentsResponse.error;
        }
        if (newsResponse.error) {
          console.error("Erro ao buscar notícias:", newsResponse.error);
          throw newsResponse.error;
        }
        if (galleryResponse.error) {
          console.error("Erro ao buscar galeria:", galleryResponse.error);
          throw galleryResponse.error;
        }
        if (categoriesResponse.error) {
          console.error("Erro ao buscar categorias:", categoriesResponse.error);
          throw categoriesResponse.error;
        }

        const agentsData = agentsResponse.data || [];
        const newsData = newsResponse.data || [];
        const galleryData = galleryResponse.data || [];
        const categoriesData = categoriesResponse.data || [];

        console.log("📊 Dados do banco:", {
          agents: agentsData.length,
          news: newsData.length,
          gallery: galleryData.length,
          categories: categoriesData.length,
          agentsData: agentsData, // Para debug
        });

        // ✅ CÁLCULOS CORRETOS
        const totalAgents = agentsData.length;
        const activeAgents = agentsData.filter((agent) => agent.status).length;
        const totalAdmins = agentsData.filter(
          (agent) => agent.role?.toLowerCase() === "admin"
        ).length;

        const totalNews = newsData.length;
        const featuredNews = newsData.filter((news) => news.destaque).length;
        const publishedNews = newsData.filter(
          (news) => news.status === "publicado"
        ).length;

        const totalGalleryItems = galleryData.length;
        const photoItems = galleryData.filter(
          (item) => item.tipo === "foto"
        ).length;
        const videoItems = galleryData.filter(
          (item) => item.tipo === "video"
        ).length;

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
          totalAdmins,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        // Mostrar erro no status do sistema
        setSystemStatus({
          database: "offline",
          status: "critical",
          message: "Erro ao carregar dados do banco",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(checkDatabaseConnection, 30000);
    return () => clearInterval(interval);
  }, [supabase]);

  // ... (o restante do código permanece igual, apenas atualize o StatCard para mostrar admins)

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    color = "blue",
    subDescription, // Nova prop para info adicional
  }: {
    title: string;
    value: number;
    icon: IconType;
    description: string;
    color?: "blue" | "green" | "purple" | "navy";
    subDescription?: string;
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      navy: "from-blue-800 to-blue-900",
    };

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                {title}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                {loading ? "..." : value}
              </p>
              <p className="text-xs text-gray-500 truncate">{description}</p>
              {subDescription && (
                <p className="text-xs text-gray-400 mt-1">{subDescription}</p>
              )}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header permanece igual */}
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
              <div className="flex items-center gap-3 order-2 sm:order-1">
                {/* StatusIndicator permanece igual */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FaServer className="w-3 h-3 text-gray-600" />
                    <span className="text-xs text-gray-600 font-medium hidden sm:inline">
                      Status:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="relative group">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            systemStatus.status === "excellent"
                              ? "bg-green-500"
                              : systemStatus.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          } animate-pulse`}
                          title={systemStatus.message}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          systemStatus.status === "excellent"
                            ? "text-green-800"
                            : systemStatus.status === "warning"
                            ? "text-yellow-800"
                            : "text-red-800"
                        } hidden sm:inline`}
                      >
                        {systemStatus.status === "excellent"
                          ? "Ótimo"
                          : systemStatus.status === "warning"
                          ? "Atenção"
                          : "Crítico"}
                      </span>
                    </div>
                  </div>
                </div>
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

              <div className="flex gap-3 order-1 sm:order-2">
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
                <Button
                  asChild
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
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

        {/* ✅ GRID ATUALIZADO COM INFORMAÇÕES CORRETAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total de Usuários"
            value={stats.totalAgents}
            icon={FaUsers}
            description={`${stats.activeAgents} ativos`}
            subDescription={`${stats.totalAdmins} administradores`}
            color="blue"
          />
          <StatCard
            title="Notícias"
            value={stats.totalNews}
            icon={FaNewspaper}
            description={`${stats.publishedNews} publicadas`}
            subDescription={`${stats.featuredNews} em destaque`}
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

        {/* Restante do código permanece igual */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    color="purple"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Adicione estas funções que estão faltando:
const QuickAction = ({
  title,
  description,
  icon: Icon,
  href,
  color = "blue",
}: {
  title: string;
  description: string;
  icon: IconType;
  href: string;
  color?: "blue" | "green" | "purple" | "navy";
}) => {
  const colorClasses = {
    navy: "bg-blue-800 hover:bg-blue-900 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
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
        {/* ... resto do RecentActivity */}
      </div>
    </CardContent>
  </Card>
);
