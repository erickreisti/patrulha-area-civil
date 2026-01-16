// @/components/ui/skeleton.tsx corrigido
"use client";

import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
