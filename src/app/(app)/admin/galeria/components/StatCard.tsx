"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type ColorVariant = "blue" | "green" | "purple" | "amber" | "red" | "indigo";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color?: ColorVariant;
  delay: number;
  loading?: boolean;
}

const colorStyles: Record<ColorVariant, { gradient: string; iconBg: string }> =
  {
    blue: { gradient: "from-blue-500 to-blue-600", iconBg: "bg-blue-500" },
    green: { gradient: "from-green-500 to-green-600", iconBg: "bg-green-500" },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-500",
    },
    amber: { gradient: "from-amber-500 to-amber-600", iconBg: "bg-amber-500" },
    red: { gradient: "from-red-500 to-red-600", iconBg: "bg-red-500" },
    indigo: {
      gradient: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-500",
    },
  };

export function StatCard({
  title,
  value,
  icon,
  description,
  color = "blue",
  delay,
  loading = false,
}: StatCardProps) {
  const styles = colorStyles[color];

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
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
            styles.gradient,
          )}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1 transition-colors">
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
              <p className="text-xs text-gray-500">{description}</p>
            </div>
            <motion.div
              className={cn(
                "p-3 rounded-full text-white shadow-lg group-hover:shadow-xl transition-all duration-300 bg-gradient-to-br",
                styles.gradient,
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
