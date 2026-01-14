"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Ícones
import {
  RiDashboardLine,
  RiGroupLine,
  RiArticleLine,
  RiImageLine,
  RiLogoutBoxLine,
  RiUserLine,
  RiAddLine,
  RiUserAddLine,
  RiListUnordered,
  RiFolderLine,
  RiSettingsLine,
  RiShieldLine,
  RiBarChart2Line,
} from "react-icons/ri";

// Singleton do Supabase
import { supabase } from "@/lib/supabase/client";
import LogoHeader from "./LogoHeader";

// Tipos para navegação
interface NavigationChild {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavigationChild[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavigationChild[];
}

// Estrutura de navegação
const navigation: NavigationItem[] = [
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
        name: "Criar Agente",
        href: "/admin/agentes/criar",
        icon: RiUserAddLine,
        badge: "Novo",
      },
      {
        name: "Listar Agentes",
        href: "/admin/agentes",
        icon: RiListUnordered,
      },
    ],
  },
  {
    name: "Notícias",
    href: "/admin/noticias",
    icon: RiArticleLine,
    children: [
      {
        name: "Criar Notícia",
        href: "/admin/noticias/criar",
        icon: RiAddLine,
        badge: "Novo",
      },
      {
        name: "Listar Notícias",
        href: "/admin/noticias",
        icon: RiListUnordered,
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
            name: "Criar Item",
            href: "/admin/galeria/itens/criar",
            icon: RiAddLine,
          },
          {
            name: "Listar Itens",
            href: "/admin/galeria/itens",
            icon: RiListUnordered,
          },
        ],
      },
      {
        name: "Categorias",
        href: "/admin/galeria/categorias",
        icon: RiFolderLine,
        children: [
          {
            name: "Criar Categoria",
            href: "/admin/galeria/categorias/criar",
            icon: RiAddLine,
          },
          {
            name: "Listar Categorias",
            href: "/admin/galeria/categorias",
            icon: RiListUnordered,
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

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isLinkActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const renderNavigationItem = (
    item: NavigationItem | NavigationChild,
    level = 0
  ) => {
    const isActive = isLinkActive(item.href);
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={`${item.name}-${level}`} className="space-y-1">
        <Link
          href={item.href}
          className={cn(
            "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 border",
            isActive
              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent hover:border-gray-200",
            level === 1 && "ml-4 text-xs py-2",
            level === 2 && "ml-8 text-xs py-1",
            hasChildren && "font-semibold"
          )}
        >
          <Icon
            className={cn(
              "mr-3 flex-shrink-0 transition-colors",
              level === 0 ? "h-5 w-5" : "h-4 w-4",
              isActive
                ? "text-blue-600"
                : "text-gray-400 group-hover:text-gray-500"
            )}
          />
          <span className="flex-1 truncate">{item.name}</span>
          {item.badge && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>

        {/* Subitens */}
        {hasChildren && (
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              level === 0 ? "ml-4 space-y-1" : "ml-4 space-y-0",
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
    <div className="hidden lg:flex lg:flex-col w-64 min-h-0 bg-white border-r border-gray-200 shadow-lg h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <LogoHeader />
      </div>

      {/* Navegação principal */}
      <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-2">
          {navigation.map((item) => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Footer com ações do usuário */}
      <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/perfil")}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Meu Perfil"
            >
              <RiUserLine className="h-4 w-4 mr-2" />
              <span className="text-sm">Perfil</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sair do sistema"
            >
              <RiLogoutBoxLine className="h-4 w-4 mr-2" />
              <span className="text-sm">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
