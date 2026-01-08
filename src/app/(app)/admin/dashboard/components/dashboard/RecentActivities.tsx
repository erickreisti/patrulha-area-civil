// src/app/admin/dashboard/components/dashboard/RecentActivities.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RiUserLine,
  RiArticleLine,
  RiImageLine,
  RiSettingsLine,
  RiCalendarLine,
  RiExternalLinkLine,
  RiTimeLine,
} from "react-icons/ri";

interface Activity {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  user_name: string | null;
}

interface RecentActivitiesProps {
  activities: Activity[];
  loading: boolean;
}

export function RecentActivities({
  activities,
  loading,
}: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    const iconClass = "h-4 w-4 flex-shrink-0";
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
        return <RiImageLine className={`${iconClass} text-orange-600`} />;
      case "settings_update":
        return <RiSettingsLine className={`${iconClass} text-purple-600`} />;
      case "event_created":
        return <RiCalendarLine className={`${iconClass} text-cyan-600`} />;
      default:
        return <RiTimeLine className={`${iconClass} text-gray-600`} />;
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

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_login":
      case "agent_creation":
        return "bg-blue-100 text-blue-800";
      case "news_created":
      case "news_published":
        return "bg-green-100 text-green-800";
      case "gallery_upload":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <RiTimeLine className="h-5 w-5 text-blue-600" />
          Atividades Recentes
        </CardTitle>
        {activities.length > 0 && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {activities.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <RiTimeLine className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhuma atividade recente</p>
            <p className="text-sm text-gray-400 mt-1">
              As atividades do sistema aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="mt-1">
                  {getActivityIcon(activity.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getActivityColor(
                            activity.action_type
                          )}`}
                        >
                          {activity.action_type.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          por {activity.user_name || "Sistema"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {activities.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <RiExternalLinkLine className="h-4 w-4 mr-2" />
                Ver todas as atividades
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
