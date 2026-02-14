"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

// Variantes de cores alinhadas com o resto do sistema
type ColorVariant = "blue" | "green" | "purple" | "amber" | "red" | "indigo";

interface StatCardProps {
  title: string;
  value: number | string; // Permitir string para casos formatados
  icon: React.ReactNode;
  description?: string; // Opcional agora
  color?: ColorVariant;
  delay?: number; // Opcional, default 0
  loading?: boolean;
  className?: string; // Para estilização extra se necessário
}

const colorStyles: Record<ColorVariant, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600", // Emerald é o padrão verde do sistema
  purple: "bg-purple-50 text-purple-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

export function StatCard({
  title,
  value,
  icon,
  description,
  color = "blue",
  delay = 0,
  loading = false,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 overflow-hidden",
          className,
        )}
      >
        <CardContent className="p-6 flex items-start justify-between h-full">
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 opacity-90">
                {title}
              </p>

              {loading ? (
                <Skeleton className="h-8 w-24 bg-slate-100 rounded-md" />
              ) : (
                <motion.h3
                  className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {value}
                </motion.h3>
              )}
            </div>

            {/* Descrição condicional */}
            {description && !loading && (
              <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
                {description}
              </p>
            )}

            {/* Skeleton para descrição */}
            {loading && description && (
              <Skeleton className="h-3 w-32 mt-3 bg-slate-100" />
            )}
          </div>

          <div
            className={cn(
              "p-3 rounded-xl flex items-center justify-center shrink-0 transition-colors",
              colorStyles[color],
            )}
          >
            {/* Clona o ícone para garantir o tamanho correto, se for um elemento React válido */}
            {icon}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
