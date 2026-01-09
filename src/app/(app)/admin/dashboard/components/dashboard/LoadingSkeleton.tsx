"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Botão de Refresh */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      {/* Status dos Agentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      {/* Atividades Recentes */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}
