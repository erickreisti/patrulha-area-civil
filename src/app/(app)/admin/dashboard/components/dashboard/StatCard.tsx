"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
  subtitle?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  color = "blue",
  subtitle,
  onClick,
}: StatCardProps) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    green: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    purple:
      "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    orange:
      "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    red: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
  };

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
    cyan: "text-cyan-600",
  };

  const cardContent = (
    <Card
      className={`${colors[color]} border hover:shadow-md transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColors[color]}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            {subtitle && <Skeleton className="h-3 w-32" />}
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold">
              {value.toLocaleString("pt-BR")}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return onClick ? (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {cardContent}
    </motion.div>
  ) : (
    cardContent
  );
}
