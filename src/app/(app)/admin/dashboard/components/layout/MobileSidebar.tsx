"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  RiDashboardLine,
  RiGroupLine,
  RiArticleLine,
  RiImageLine,
  RiSettingsLine,
  RiAddLine,
  RiListUnordered,
  RiCalendarLine,
  RiFolderLine,
  RiShieldLine,
  RiBarChart2Line,
  RiUserAddLine,
} from "react-icons/ri";

interface MobileNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MobileNavItem[];
}

const navigation: MobileNavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: RiDashboardLine,
  },
  {
    name: "Agentes",
    href: "/admin/agentes",
    icon: RiGroupLine,
    children: [
      {
        name: "Listar Agentes",
        href: "/admin/agentes",
        icon: RiListUnordered,
      },
      {
        name: "Criar Agente",
        href: "/admin/agentes/criar",
        icon: RiUserAddLine,
      },
      {
        name: "Estatísticas",
        href: "/admin/agentes/estatisticas",
        icon: RiBarChart2Line,
      },
    ],
  },
  {
    name: "Notícias",
    href: "/admin/noticias",
    icon: RiArticleLine,
    children: [
      {
        name: "Listar Notícias",
        href: "/admin/noticias",
        icon: RiListUnordered,
      },
      {
        name: "Criar Notícia",
        href: "/admin/noticias/criar",
        icon: RiAddLine,
      },
      {
        name: "Calendário",
        href: "/admin/noticias/calendario",
        icon: RiCalendarLine,
      },
    ],
  },
  {
    name: "Galeria",
    href: "/admin/galeria",
    icon: RiImageLine,
    children: [
      {
        name: "Itens da Galeria",
        href: "/admin/galeria/itens",
        icon: RiImageLine,
        children: [
          {
            name: "Listar Itens",
            href: "/admin/galeria/itens",
            icon: RiListUnordered,
          },
          {
            name: "Criar Item",
            href: "/admin/galeria/itens/criar",
            icon: RiAddLine,
          },
        ],
      },
      {
        name: "Categorias",
        href: "/admin/galeria/categorias",
        icon: RiFolderLine,
        children: [
          {
            name: "Listar Categorias",
            href: "/admin/galeria/categorias",
            icon: RiListUnordered,
          },
          {
            name: "Criar Categoria",
            href: "/admin/galeria/categorias/criar",
            icon: RiAddLine,
          },
        ],
      },
    ],
  },
  {
    name: "Administração",
    href: "/admin/configuracoes",
    icon: RiSettingsLine,
    children: [
      {
        name: "Configurações",
        href: "/admin/configuracoes",
        icon: RiSettingsLine,
      },
      {
        name: "Atividades",
        href: "/admin/atividades",
        icon: RiBarChart2Line,
      },
      {
        name: "Segurança",
        href: "/admin/seguranca",
        icon: RiShieldLine,
      },
    ],
  },
];

export function MobileSidebar() {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const renderNavigationItem = (item: MobileNavItem, level = 0) => {
    const Icon = item.icon;
    const isActive = isLinkActive(item.href);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={`${item.name}-${level}`} className="space-y-1">
        <Link
          href={item.href}
          className={cn(
            "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
            isActive
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
            level === 1 && "ml-4 text-xs py-2",
            level === 2 && "ml-8 text-xs py-2"
          )}
        >
          <Icon
            className={cn(
              "mr-3 flex-shrink-0",
              level === 0 ? "h-5 w-5" : "h-4 w-4",
              isActive ? "text-blue-600" : "text-gray-400"
            )}
          />
          <span className="flex-1 truncate">{item.name}</span>
        </Link>

        {/* Subitens */}
        {hasChildren && (
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            {item.children!.map((child) =>
              renderNavigationItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="space-y-2">
      {navigation.map((item) => renderNavigationItem(item))}
    </nav>
  );
}
