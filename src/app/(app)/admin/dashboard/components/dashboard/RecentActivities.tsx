// src/app/(app)/admin/dashboard/components/dashboard/RecentActivities.tsx - VERSÃO CORRIGIDA
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  RiUserLine,
  RiArticleLine,
  RiImageLine,
  RiSettingsLine,
  RiCalendarLine,
  RiExternalLinkLine,
  RiTimeLine,
  RiUserAddLine,
  RiDeleteBinLine,
  RiShieldLine,
  RiFileLine,
  RiDatabaseLine,
  RiArrowRightLine,
} from "react-icons/ri";

// Interface compatível com DashboardRecentActivity
export interface DashboardActivity {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  user_name: string | null;
}

interface RecentActivitiesProps {
  activities: DashboardActivity[];
  loading: boolean;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function RecentActivities({
  activities,
  loading,
}: RecentActivitiesProps) {
  const router = useRouter();

  const getActivityIcon = (type: string) => {
    const iconClass = "w-4 h-4 flex-shrink-0";
    switch (type) {
      case "user_login":
      case "agent_creation":
      case "agent_update":
        return <RiUserLine className={`${iconClass} text-blue-600`} />;
      case "news_created":
      case "news_updated":
      case "news_published":
        return <RiArticleLine className={`${iconClass} text-green-600`} />;
      case "gallery_upload":
      case "gallery_item_created":
      case "gallery_item_updated":
        return <RiImageLine className={`${iconClass} text-orange-600`} />;
      case "settings_update":
        return <RiSettingsLine className={`${iconClass} text-purple-600`} />;
      case "event_created":
        return <RiCalendarLine className={`${iconClass} text-cyan-600`} />;
      case "user_created":
      case "user_registered":
        return <RiUserAddLine className={`${iconClass} text-green-600`} />;
      case "agent_deleted":
      case "user_deleted":
        return <RiDeleteBinLine className={`${iconClass} text-red-600`} />;
      case "system_start":
      case "system_update":
        return <RiDatabaseLine className={`${iconClass} text-gray-600`} />;
      case "permission_updated":
        return <RiShieldLine className={`${iconClass} text-purple-600`} />;
      default:
        return <RiFileLine className={`${iconClass} text-gray-600`} />;
    }
  };

  const getActionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      user_login: "Login",
      agent_creation: "Criação de Agente",
      agent_update: "Atualização de Agente",
      agent_deleted: "Agente Excluído",
      user_created: "Usuário Criado",
      user_deleted: "Usuário Excluído",
      news_created: "Notícia Criada",
      news_updated: "Notícia Atualizada",
      news_published: "Notícia Publicada",
      gallery_upload: "Upload na Galeria",
      gallery_item_created: "Item da Galeria Criado",
      gallery_item_updated: "Item da Galeria Atualizado",
      settings_update: "Configuração Atualizada",
      event_created: "Evento Criado",
      permission_updated: "Permissão Atualizada",
      system_start: "Sistema Iniciado",
      system_update: "Sistema Atualizado",
    };
    return types[type] || type.replace(/_/g, " ");
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_login":
      case "agent_creation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "news_created":
      case "news_published":
        return "bg-green-100 text-green-800 border-green-200";
      case "gallery_upload":
      case "gallery_item_created":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "settings_update":
      case "permission_updated":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "event_created":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "agent_deleted":
      case "user_deleted":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Agora mesmo";
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Há ${Math.floor(diffInMinutes / 60)} h`;
    if (diffInMinutes < 10080)
      return `Há ${Math.floor(diffInMinutes / 1440)} dias`;
    return date.toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewAllActivities = () => {
    // Navegação que passa pelo middleware
    router.push("/admin/atividades");
  };

  if (loading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiTimeLine className="h-5 w-5 text-blue-600" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 p-3 border rounded-lg"
                >
                  <Skeleton className="h-10 w-10 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <Skeleton className="h-3 w-3/4 bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiTimeLine className="h-5 w-5 text-blue-600" />
              Atividades Recentes
            </div>
            {activities.length > 0 && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {activities.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <RiTimeLine className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Nenhuma atividade recente</p>
              <p className="text-sm text-gray-400 mt-1">
                As atividades do sistema aparecerão aqui
              </p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <AnimatePresence>
                  {activities.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 group"
                    >
                      <motion.div
                        className="mt-1 transition-transform duration-300 group-hover:scale-125"
                        whileHover={{ rotate: 10 }}
                      >
                        {getActivityIcon(activity.action_type)}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getActivityColor(
                                  activity.action_type
                                )} transition-colors duration-300`}
                              >
                                {getActionTypeLabel(activity.action_type)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                por {activity.user_name || "Sistema"}
                              </span>
                            </div>
                          </div>
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            className="text-xs text-gray-400 whitespace-nowrap"
                            title={formatDateTime(activity.created_at)}
                          >
                            {formatTimeAgo(activity.created_at)}
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {activities.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleViewAllActivities}
                    variant="outline"
                    size="sm"
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-600 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center">
                      <RiExternalLinkLine className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                      Ver todas as atividades
                      <RiArrowRightLine className="h-4 w-4 ml-1 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </div>
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
