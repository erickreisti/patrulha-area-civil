// src/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

// ✅ Use o singleton do client
import { supabase } from "@/lib/supabase/client"; // <-- Alteração aqui

// Ícones Remix
import {
  RiDashboardLine,
  RiGroupLine,
  RiArticleLine,
  RiImageLine,
  RiFolderLine,
  RiLogoutBoxLine,
  RiUserLine,
  RiAddLine,
  RiUserAddLine,
  RiListUnordered,
} from "react-icons/ri";

// Tipos para navegação hierárquica
interface NavigationChild {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationChild[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationChild[];
}

// Estrutura de navegação com submenus
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
      },
    ],
  },
  {
    name: "Galeria",
    href: "/admin/galeria",
    icon: RiImageLine,
    children: [
      {
        name: "Todos os Itens",
        href: "/admin/galeria/itens",
        icon: RiListUnordered,
        children: [
          {
            name: "Criar Item",
            href: "/admin/galeria/itens/criar",
            icon: RiAddLine,
          },
        ],
      },
      {
        name: "Todas as Categorias",
        href: "/admin/galeria/categorias",
        icon: RiFolderLine,
        children: [
          {
            name: "Criar Categoria",
            href: "/admin/galeria/categorias/criar",
            icon: RiAddLine,
          },
        ],
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Agora usando o singleton
  // const supabase = createClient(); // REMOVER esta linha

  // Logout do sistema
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Verifica se um link está ativo
  const isLinkActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  // Renderiza itens de navegação recursivamente
  const renderNavigationItem = (
    item: NavigationItem | NavigationChild,
    level = 0
  ) => {
    const isActive = isLinkActive(item.href);
    const Icon = item.icon;

    return (
      <div key={item.name}>
        <Link
          href={item.href}
          className={cn(
            "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 border",
            isActive
              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent hover:border-gray-200",
            level === 1 && "ml-4 text-xs py-2",
            level === 2 && "ml-8 text-xs py-1"
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
          {item.name}
        </Link>

        {/* Subitens - mostrados quando o pai está ativo */}
        {item.children && (
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              level === 0 ? "ml-4 mt-1 space-y-1" : "ml-4 space-y-0",
              isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            {item.children.map((child) =>
              renderNavigationItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200 shadow-lg">
      {/* Logo - Estilo passaporte */}
      <div className="flex items-center justify-center h-24 flex-shrink-0 px-4 border-b border-gray-200 bg-gradient-to-r from-navy-700 to-navy-900">
        <Link href="/" className="flex items-center gap-4 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Container redondo estilo passaporte */}
            <div className="bg-white rounded-full shadow-xl overflow-hidden flex items-center justify-center w-14 h-14">
              <div className="w-full h-full flex items-center justify-center p-1">
                <Image
                  src="/images/logos/logo.webp"
                  alt="Patrulha Aérea Civil"
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Texto da organização */}
          <div className="text-left">
            <h1 className="font-roboto text-[12px] text-white tracking-wider uppercase leading-tight drop-shadow-md">
              PATRULHA AÉREA CIVIL
            </h1>
            <p className="text-blue-300 text-xs leading-tight mt-1 font-roboto font-medium">
              Painel Administrativo
            </p>
          </div>
        </Link>
      </div>

      {/* Navegação principal */}
      <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Footer com ações do usuário */}
      <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Administrador
            </p>
            <p className="text-xs text-gray-500 truncate">Sistema PAC</p>
          </div>

          {/* Botões de ação */}
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/perfil")}
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-2"
              title="Meu Perfil"
            >
              <RiUserLine className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-2"
              title="Sair do sistema"
            >
              <RiLogoutBoxLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
