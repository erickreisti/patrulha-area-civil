"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { type ElementType } from "react";

// 1. Definição da tipagem correta (usando 'title')
export interface NavItemType {
  title: string; // <-- Mudou de 'name' para 'title'
  href: string;
  icon: ElementType;
}

interface NavItemProps {
  item: NavItemType;
}

export function NavItem({ item }: NavItemProps) {
  const pathname = usePathname();

  // Lógica para verificar se o link está ativo (exato ou sub-rota)
  const isActive =
    pathname === item.href ||
    (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 mb-1",
        isActive
          ? "bg-pac-primary/10 text-pac-primary" // Estilo Ativo
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900", // Estilo Inativo
      )}
    >
      <Icon
        className={cn(
          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
          isActive
            ? "text-pac-primary"
            : "text-slate-400 group-hover:text-slate-500",
        )}
        aria-hidden="true"
      />
      {/* 2. Renderizando 'title' */}
      {item.title}
    </Link>
  );
}
