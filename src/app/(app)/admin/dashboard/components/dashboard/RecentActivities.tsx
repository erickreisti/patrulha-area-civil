"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  RiUserLine,
  RiArticleLine,
  RiImageLine,
  RiSettingsLine,
  RiCalendarLine,
  RiTimeLine,
  RiUserAddLine,
  RiDeleteBinLine,
  RiShieldLine,
  RiFileLine,
  RiDatabaseLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils/cn";

// Tipagem
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

// Helpers de UI
const getActivityConfig = (type: string) => {
  const baseIconClass = "w-5 h-5";

  switch (type) {
    case "user_login":
    case "user_created":
    case "user_registered":
      return {
        icon: <RiUserLine className={baseIconClass} />,
        color: "text-sky-600",
        bg: "bg-sky-50",
      };

    case "agent_creation":
    case "agent_update":
      return {
        icon: <RiUserAddLine className={baseIconClass} />,
        color: "text-blue-600",
        bg: "bg-blue-50",
      };

    case "news_created":
    case "news_updated":
    case "news_published":
      return {
        icon: <RiArticleLine className={baseIconClass} />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      };

    case "gallery_upload":
    case "gallery_item_created":
      return {
        icon: <RiImageLine className={baseIconClass} />,
        color: "text-amber-600",
        bg: "bg-amber-50",
      };

    case "settings_update":
    case "permission_updated":
      return {
        icon: <RiSettingsLine className={baseIconClass} />,
        color: "text-purple-600",
        bg: "bg-purple-50",
      };

    case "event_created":
      return {
        icon: <RiCalendarLine className={baseIconClass} />,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
      };

    case "agent_deleted":
    case "user_deleted":
      return {
        icon: <RiDeleteBinLine className={baseIconClass} />,
        color: "text-red-600",
        bg: "bg-red-50",
      };

    case "system_start":
    case "system_update":
      return {
        icon: <RiDatabaseLine className={baseIconClass} />,
        color: "text-slate-600",
        bg: "bg-slate-50",
      };

    case "permission_updated":
      return {
        icon: <RiShieldLine className={baseIconClass} />,
        color: "text-rose-600",
        bg: "bg-rose-50",
      };

    default:
      return {
        icon: <RiFileLine className={baseIconClass} />,
        color: "text-slate-500",
        bg: "bg-slate-50",
      };
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return "Agora mesmo";
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
  if (diffInMinutes < 10080)
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  return date.toLocaleDateString("pt-BR");
};

export function RecentActivities({
  activities,
  loading,
}: RecentActivitiesProps) {
  const router = useRouter();

  if (loading) {
    return (
      <Card className="border-none shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <RiTimeLine className="text-sky-600" /> Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <RiTimeLine className="text-sky-600" /> Atividades Recentes
          </CardTitle>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {activities.length} novas
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
            <div className="p-4 rounded-full bg-slate-50 mb-3">
              <RiTimeLine className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              Nenhuma atividade recente
            </p>
            <p className="text-xs text-slate-400 mt-1">
              As ações do sistema aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {activities.slice(0, 6).map((activity, index) => {
                  const config = getActivityConfig(activity.action_type);

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex items-start gap-3 py-4 hover:bg-slate-50/50 transition-colors rounded-lg px-2 -mx-2 cursor-default"
                    >
                      <div
                        className={cn(
                          "p-2 rounded-full flex-shrink-0 mt-0.5",
                          config.bg,
                          config.color,
                        )}
                      >
                        {config.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span className="font-medium text-slate-500">
                            {activity.user_name || "Sistema"}
                          </span>
                          <span>•</span>
                          <span>{formatTimeAgo(activity.created_at)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="pt-4 mt-auto border-t border-slate-50">
          <Button
            variant="ghost"
            className="w-full justify-between text-slate-500 hover:text-sky-700 hover:bg-sky-50 group"
            onClick={() => router.push("/admin/atividades")}
          >
            <span className="text-sm font-medium">Ver histórico completo</span>
            <RiArrowRightLine className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
