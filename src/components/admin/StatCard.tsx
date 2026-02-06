"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

// Tipos de variantes para padronização visual
type StatVariant =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "purple";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  variant?: StatVariant;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

const variants: Record<
  StatVariant,
  { bg: string; text: string; iconBg: string; iconColor: string }
> = {
  primary: {
    bg: "bg-white",
    text: "text-slate-900",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  success: {
    bg: "bg-white",
    text: "text-slate-900",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  warning: {
    bg: "bg-white",
    text: "text-slate-900",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  destructive: {
    bg: "bg-white",
    text: "text-slate-900",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  info: {
    bg: "bg-white",
    text: "text-slate-900",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  purple: {
    bg: "bg-white",
    text: "text-slate-900",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  loading = false,
  variant = "primary",
  subtitle,
  onClick,
  className,
}: StatCardProps) {
  const styles = variants[variant];

  const content = (
    <Card
      className={cn(
        "border-none shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden",
        styles.bg,
        onClick && "cursor-pointer hover:-translate-y-1",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 relative z-10">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              {title}
            </p>

            {loading ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                {subtitle && <Skeleton className="h-3 w-32 rounded-md" />}
              </div>
            ) : (
              <>
                <h3
                  className={cn(
                    "text-3xl font-bold tracking-tight",
                    styles.text,
                  )}
                >
                  {typeof value === "number"
                    ? value.toLocaleString("pt-BR")
                    : value}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-400 font-medium">
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </div>

          <div
            className={cn("p-3 rounded-xl transition-colors", styles.iconBg)}
          >
            <Icon className={cn("w-6 h-6", styles.iconColor)} />
          </div>
        </div>

        {/* Decoração de fundo sutil */}
        <div
          className={cn(
            "absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-[0.03]",
            styles.iconColor.replace("text-", "bg-"),
          )}
        />
      </CardContent>
    </Card>
  );

  if (onClick) {
    return <motion.div whileTap={{ scale: 0.98 }}>{content}</motion.div>;
  }

  return content;
}
