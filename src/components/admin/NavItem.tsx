"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import React from "react";

// ✅ 1. Definimos a interface aqui para corrigir o erro de importação
export interface NavItemType {
  name: string;
  href: string;
  icon: React.ElementType; // Tipagem correta para ícones (React Icons / Lucide)
  badge?: string;
  children?: NavItemType[]; // ✅ 2. Isso corrige o erro do 'child' implicitamente 'any'
}

interface NavItemProps {
  item: NavItemType;
  level?: number;
  onClick?: () => void;
}

export function NavItem({ item, level = 0, onClick }: NavItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;

  const isActive =
    item.href === "/admin/dashboard"
      ? pathname === item.href
      : pathname.startsWith(item.href);

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="space-y-1">
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
          "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
          isActive &&
            "bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800 shadow-sm ring-1 ring-sky-200",
          level > 0 && `ml-${level * 4} pl-${3 + level * 2} text-xs`,
        )}
      >
        <Icon
          className={cn(
            "mr-3 flex-shrink-0 transition-colors",
            level === 0 ? "h-5 w-5" : "h-4 w-4",
            isActive
              ? "text-sky-600"
              : "text-slate-400 group-hover:text-slate-600",
          )}
        />
        <span className="flex-1 truncate">{item.name}</span>

        {item.badge && (
          <span
            className={cn(
              "ml-auto px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider",
              isActive
                ? "bg-sky-200 text-sky-800"
                : "bg-slate-200 text-slate-700",
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>

      {hasChildren && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out border-l border-slate-200 ml-5 space-y-1",
            isActive ? "max-h-[500px] opacity-100 py-1" : "max-h-0 opacity-0",
          )}
        >
          {/* Agora 'child' é inferido corretamente como NavItemType */}
          {item.children!.map((child) => (
            <NavItem
              key={child.href}
              item={child}
              level={level + 1}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
