"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUserLine,
  RiNewspaperLine,
  RiImageLine,
  RiBarChartLine,
  RiAddLine,
  RiCheckLine,
  RiTimeLine,
  RiEditLine,
  RiHomeLine,
  RiUserAddLine,
  RiEyeLine,
  RiDatabaseLine,
  RiRefreshLine,
  RiArrowRightLine,
  RiAlertLine,
  RiUserSettingsLine,
} from "react-icons/ri";

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
  archivedNews: number;
  draftNews: number;
  archivedCategories: number;
  inactiveAgents: number;
}

interface SystemStatus {
  database: "online" | "offline" | "slow";
  status: "excellent" | "warning" | "critical";
  message: string;
}

interface ActivityMetadata {
  version?: string;
  details?: string;
  [key: string]: unknown;
}

interface Activity {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: ActivityMetadata;
  created_at: string;
  user_profile?: {
    full_name: string;
    matricula: string;
  };
}

type IconType = React.ComponentType<{ className?: string }>;

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  color = "blue",
  delay,
  loading = false,
}: {
  title: string;
  value: number;
  icon: IconType;
  description: string;
  color?: "blue" | "green" | "purple" | "amber" | "navy";
  delay: number;
  loading?: boolean;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
    navy: "from-navy-600 to-navy-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1 transition-colors duration-300">
                {title}
              </p>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1 bg-gray-200" />
              ) : (
                <motion.p
                  className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: delay * 0.1 + 0.2 }}
                >
                  {value}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 transition-colors duration-300">
                {description}
              </p>
            </div>
            <motion.div
              className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
    navy: "bg-navy-600 hover:bg-navy-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <CardContent className="p-6 h-full">
          <div className="flex items-start space-x-4 h-full">
            <motion.div
              className={`p-3 rounded-lg ${
                colorClasses[color].split(" ")[0]
              } text-white flex-shrink-0 group-hover:scale-110 transition-all duration-300 group-hover:rotate-6`}
              whileHover={{ scale: 1.1 }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 mb-2 transition-colors duration-300 group-hover:text-navy-700">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 transition-colors duration-300 group-hover:text-gray-700">
                {description}
              </p>
              <Button
                asChild
                className={`${colorClasses[color]} font-medium w-full transition-all duration-300 hover:shadow-md`}
                size="sm"
              >
                <Link href={href} className="flex items-center gap-2">
                  Acessar
                  <RiArrowRightLine className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
    archivedNews: 0,
    draftNews: 0,
    archivedCategories: 0,
    inactiveAgents: 0,
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "online",
    status: "excellent",
    message: "Sistema operando normalmente",
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Função para buscar dados COM RLS (admin tem acesso total)
  const fetchData = useCallback(async () => {
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

    const fetchRecentActivities = async () => {
      try {
        setActivitiesLoading(true);

        // Admin pode ver todas atividades (RLS permite)
        const { data: activities, error } = await supabase
          .from("system_activities")
          .select(
            `
            *,
            user_profile:profiles!system_activities_user_id_fkey(full_name, matricula)
          `
          )
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        setRecentActivities(activities || []);
      } catch (error) {
        console.error("Erro ao buscar atividades:", error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    const fetchStatsData = async () => {
      try {
        // 🔥 USANDO RLS CORRETAMENTE:
        // Admin pode ver TUDO através das políticas

        // 1. Buscar perfis - admin vê todos
        const { data: agentsData, error: agentsError } = await supabase
          .from("profiles")
          .select("id, status, role");

        if (agentsError) throw agentsError;

        // 2. Buscar notícias - admin vê todas
        const { data: newsData, error: newsError } = await supabase
          .from("noticias")
          .select("id, destaque, status");

        if (newsError) throw newsError;

        // 3. Buscar itens da galeria - admin vê todos
        const { data: galleryData, error: galleryError } = await supabase
          .from("galeria_itens")
          .select("id, tipo, status");

        if (galleryError) throw galleryError;

        // 4. Buscar categorias - admin vê todas
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("galeria_categorias")
          .select("id, tipo, status, arquivada");

        if (categoriesError) throw categoriesError;

        // Processar dados
        const processedAgents = agentsData || [];
        const processedNews = newsData || [];
        const processedGallery = galleryData || [];
        const processedCategories = categoriesData || [];

        // Calcular estatísticas
        const totalAgents = processedAgents.length;
        const activeAgents = processedAgents.filter(
          (agent) => agent.status
        ).length;
        const inactiveAgents = processedAgents.filter(
          (agent) => !agent.status
        ).length;
        const totalAdmins = processedAgents.filter(
          (agent) => agent.role?.toLowerCase() === "admin"
        ).length;

        const totalNews = processedNews.length;
        const featuredNews = processedNews.filter(
          (news) => news.destaque
        ).length;
        const publishedNews = processedNews.filter(
          (news) => news.status === "publicado"
        ).length;
        const archivedNews = processedNews.filter(
          (news) => news.status === "arquivado"
        ).length;
        const draftNews = processedNews.filter(
          (news) => news.status === "rascunho"
        ).length;

        const totalGalleryItems = processedGallery.length;
        const photoItems = processedGallery.filter(
          (item) => item.tipo === "foto"
        ).length;
        const videoItems = processedGallery.filter(
          (item) => item.tipo === "video"
        ).length;

        const totalCategories = processedCategories.length;
        const photoCategories = processedCategories.filter(
          (cat) => cat.tipo === "fotos"
        ).length;
        const videoCategories = processedCategories.filter(
          (cat) => cat.tipo === "videos"
        ).length;
        const archivedCategories = processedCategories.filter(
          (cat) => cat.arquivada
        ).length;

        // Atualizar estado
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
          archivedNews,
          draftNews,
          archivedCategories,
          inactiveAgents,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        throw error;
      }
    };

    const fetchAllData = async () => {
      try {
        setRefreshing(true);
        const connectionOk = await checkDatabaseConnection();

        if (!connectionOk) {
          setLoading(false);
          setRefreshing(false);
          return;
        }

        await Promise.all([fetchStatsData(), fetchRecentActivities()]);
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setSystemStatus({
          database: "offline",
          status: "critical",
          message: "Erro ao carregar dados do banco",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    // Executar fetch inicial
    await fetchAllData();

    // Auto-refresh
    const statusInterval = setInterval(checkDatabaseConnection, 30000);
    const dataInterval = setInterval(fetchAllData, 120000);

    // Real-time para atividades (admin pode assinar)
    const channel = supabase
      .channel("dashboard-activities")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_activities",
        },
        (payload) => {
          console.log("Nova atividade detectada:", payload);
          fetchRecentActivities();
        }
      )
      .subscribe();

    return () => {
      clearInterval(statusInterval);
      clearInterval(dataInterval);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Verificar se usuário é admin
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Buscar perfil para verificar role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/perfil"); // Redireciona para perfil comum
        return;
      }

      setIsAdmin(true);
    };

    checkAdmin();
  }, [supabase, router]);

  useEffect(() => {
    setMounted(true);
    if (mounted && isAdmin) {
      fetchData();
    }
  }, [mounted, isAdmin, fetchData]);

  // Restante do código permanece igual...
  const getActivityIcon = (actionType: string) => {
    const iconClass = "w-4 h-4 flex-shrink-0";
    switch (actionType) {
      case "user_created":
      case "user_registered":
        return <RiUserAddLine className={`${iconClass} text-green-600`} />;
      case "user_updated":
      case "user_login":
        return <RiUserLine className={`${iconClass} text-blue-600`} />;
      case "news_created":
      case "article_created":
        return <RiNewspaperLine className={`${iconClass} text-green-600`} />;
      case "news_updated":
      case "article_updated":
        return <RiNewspaperLine className={`${iconClass} text-blue-600`} />;
      case "news_published":
      case "article_published":
        return <RiEyeLine className={`${iconClass} text-purple-600`} />;
      case "gallery_item_created":
      case "media_uploaded":
        return <RiImageLine className={`${iconClass} text-green-600`} />;
      default:
        return <RiCheckLine className={`${iconClass} text-gray-600`} />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Agora mesmo";
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400)
      return `Há ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000)
      return `Há ${Math.floor(diffInSeconds / 86400)} dias`;
    return date.toLocaleDateString("pt-BR");
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Agora mesmo";
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    return `Há ${Math.floor(diffInSeconds / 3600)} h`;
  };

  const manualRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      // Reutilizar a lógica de fetch
      const checkDb = async () => {
        try {
          const { error } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .limit(1);
          if (error) throw error;
          return true;
        } catch {
          return false;
        }
      };

      const connectionOk = await checkDb();
      if (!connectionOk) {
        setRefreshing(false);
        return;
      }

      // Buscar dados atualizados
      const [
        agentsResponse,
        newsResponse,
        galleryResponse,
        categoriesResponse,
      ] = await Promise.all([
        supabase.from("profiles").select("id, status, role"),
        supabase.from("noticias").select("id, destaque, status"),
        supabase.from("galeria_itens").select("id, tipo, status"),
        supabase
          .from("galeria_categorias")
          .select("id, tipo, status, arquivada"),
      ]);

      // Processar dados (mesma lógica de antes)
      const agentsData = agentsResponse.data || [];
      const newsData = newsResponse.data || [];
      const galleryData = galleryResponse.data || [];
      const categoriesData = categoriesResponse.data || [];

      // ... (cálculos de estatísticas)

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao atualizar manualmente:", error);
    } finally {
      setRefreshing(false);
    }
  }, [supabase]);

  // Componente de Atividades Recentes (manter igual)
  const RecentActivity = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="h-full"
    >
      <Card className="border-0 shadow-lg h-full bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800">
            <RiTimeLine className="w-5 h-5 mr-2 text-navy-600" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <RiTimeLine className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Nenhuma atividade recente</p>
              <p className="text-gray-400 text-xs mt-1">
                As atividades do sistema aparecerão aqui
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white transition-all duration-300 group"
                  >
                    <div className="transition-transform duration-300 group-hover:scale-125">
                      {getActivityIcon(activity.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-tight transition-colors duration-300 group-hover:text-navy-700">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600 transition-colors duration-300">
                          {activity.user_profile?.full_name || "Sistema"}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-600">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {recentActivities.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-4 pt-3 border-t border-gray-200"
            >
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:shadow-sm"
              >
                <Link
                  href="/admin/atividades"
                  className="flex items-center justify-center gap-2"
                >
                  Ver todas as atividades
                  <RiArrowRightLine className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const navigationButtons = [
    {
      href: "/perfil",
      icon: RiEditLine,
      label: "Editar Perfil",
      className:
        "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
  ];

  if (!mounted || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
              PAINEL ADMINISTRATIVO
            </h1>
            <p className="text-gray-600">
              Bem-vindo ao centro de controle da Patrulha Aérea Civil
            </p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            {/* Status e Atualização */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
              {/* Status Indicator */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`${
                      systemStatus.status === "excellent"
                        ? "animate-pulse-gentle"
                        : ""
                    }`}
                  >
                    <RiDatabaseLine className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    Status:
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          systemStatus.status === "excellent"
                            ? "bg-green-500 animate-pulse-gentle"
                            : systemStatus.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        } transition-colors duration-300`}
                        title={systemStatus.message}
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        {systemStatus.message}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        systemStatus.status === "excellent"
                          ? "text-green-800"
                          : systemStatus.status === "warning"
                          ? "text-yellow-800"
                          : "text-red-800"
                      } transition-colors duration-300`}
                    >
                      {systemStatus.status === "excellent"
                        ? "Ótimo"
                        : systemStatus.status === "warning"
                        ? "Atenção"
                        : "Crítico"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Refresh Button */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={manualRefresh}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50 transition-colors duration-300 h-10 px-3"
                >
                  <motion.div
                    animate={{ rotate: refreshing ? 360 : 0 }}
                    transition={{
                      duration: 1,
                      repeat: refreshing ? Infinity : 0,
                    }}
                  >
                    <RiRefreshLine
                      className={`w-4 h-4 ${
                        refreshing ? "text-blue-600" : "text-gray-600"
                      }`}
                    />
                  </motion.div>
                  <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
                </Button>
              </motion.div>

              {/* Last Update Indicator */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-1 text-sm text-gray-500 bg-white/50 rounded-lg px-3 py-2 border border-gray-200 h-10"
              >
                <RiTimeLine className="w-4 h-4 text-gray-400" />
                <span>Última atualização:</span>
                <span className="font-medium text-gray-700">
                  {formatLastUpdate(lastUpdate)}
                </span>
              </motion.div>
            </div>

            {/* Navegação */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-2"
            >
              {navigationButtons.map((button, index) => (
                <motion.div
                  key={button.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={button.href}>
                    <Button
                      variant="outline"
                      className={`transition-all duration-300 h-10 ${button.className}`}
                    >
                      <button.icon className="w-4 h-4 mr-2" />
                      {button.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total de Agentes",
              value: stats.totalAgents,
              icon: RiUserLine,
              description: `${stats.activeAgents} ativos • ${stats.inactiveAgents} inativos`,
              color: "blue" as const,
              delay: 0,
            },
            {
              title: "Notícias",
              value: stats.totalNews,
              icon: RiNewspaperLine,
              description: `${stats.publishedNews} publicadas • ${stats.draftNews} rascunhos`,
              color: "green" as const,
              delay: 1,
            },
            {
              title: "Galeria",
              value: stats.totalGalleryItems,
              icon: RiImageLine,
              description: `${stats.photoItems} fotos • ${stats.videoItems} vídeos`,
              color: "purple" as const,
              delay: 2,
            },
            {
              title: "Administradores",
              value: stats.totalAdmins,
              icon: RiUserSettingsLine,
              description: `${stats.totalAgents} agentes no total`,
              color: "navy" as const,
              delay: 3,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatCard {...stat} loading={loading} />
            </motion.div>
          ))}
        </div>

        {/* Quick Actions e Atividades Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg h-full bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg text-gray-800">
                    <RiAddLine className="w-5 h-5 mr-2 text-navy-600" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <QuickAction
                      title="Gerenciar Agentes"
                      description="Adicionar, editar ou remover agentes do sistema"
                      icon={RiUserLine}
                      href="/admin/agentes"
                      color="navy"
                    />
                    <QuickAction
                      title="Criar Notícia"
                      description="Publicar nova notícia no site"
                      icon={RiNewspaperLine}
                      href="/admin/noticias/criar"
                      color="green"
                    />
                    <QuickAction
                      title="Gerenciar Galeria"
                      description="Adicionar fotos e vídeos"
                      icon={RiImageLine}
                      href="/admin/galeria"
                      color="blue"
                    />
                    <QuickAction
                      title="Ver Relatórios"
                      description="Acessar relatórios do sistema"
                      icon={RiBarChartLine}
                      href="/admin/relatorios"
                      color="purple"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <RecentActivity />
        </div>

        {/* Sistema de Alertas */}
        {systemStatus.status !== "excellent" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <RiAlertLine
                      className={`w-5 h-5 ${
                        systemStatus.status === "warning"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    />
                  </motion.div>
                  <div>
                    <p
                      className={`font-medium ${
                        systemStatus.status === "warning"
                          ? "text-yellow-800"
                          : "text-red-800"
                      }`}
                    >
                      {systemStatus.status === "warning"
                        ? "Atenção"
                        : "Problema no Sistema"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {systemStatus.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
