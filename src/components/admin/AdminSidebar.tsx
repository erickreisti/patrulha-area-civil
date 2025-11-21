// src/components/admin/AdminSidebar.tsx - APENAS LINKS "CRIAR"
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  FileText,
  Images,
  Folder,
  LogOut,
  BarChart3,
  User,
  Plus,
  UserPlus,
  List,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    name: "Agentes",
    href: "/admin/agentes",
    icon: Users,
    children: [
      {
        name: "Criar Agente",
        href: "/admin/agentes/criar",
        icon: UserPlus,
      },
    ],
  },
  {
    name: "Notícias",
    href: "/admin/noticias",
    icon: Newspaper,
    children: [
      {
        name: "Criar Notícia",
        href: "/admin/noticias/criar",
        icon: Plus,
      },
    ],
  },
  {
    name: "Galeria",
    href: "/admin/galeria",
    icon: Images,
    children: [
      // TODOS OS ITENS
      {
        name: "Todos os Itens",
        href: "/admin/galeria/itens",
        icon: List,
        children: [
          {
            name: "Criar Item",
            href: "/admin/galeria/itens/criar",
            icon: Plus,
          },
        ],
      },
      // TODAS AS CATEGORIAS
      {
        name: "Todas as Categorias",
        href: "/admin/galeria/categorias",
        icon: Folder,
        children: [
          {
            name: "Criar Categoria",
            href: "/admin/galeria/categorias/criar",
            icon: Plus,
          },
        ],
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Função para verificar se um link está ativo
  const isLinkActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    // Para outros links, verifica se o pathname começa com o href
    return pathname.startsWith(href);
  };

  // Função para renderizar os itens de navegação
  const renderNavigationItem = (item: any, level = 0) => {
    const isActive = isLinkActive(item.href);

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
          <item.icon
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

        {/* Subitens - Mostrar sempre que houver children */}
        {item.children && (
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              level === 0 ? "ml-4 mt-1 space-y-1" : "ml-4 space-y-0",
              isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            {item.children.map((child: any) =>
              renderNavigationItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200 shadow-lg">
      {/* Logo - ESTILO IDÊNTICO AO PERFIL */}
      <div className="flex items-center justify-center h-24 flex-shrink-0 px-4 border-b border-gray-200 bg-gradient-to-r from-navy-700 to-navy-900">
        <Link href="/" className="flex items-center gap-4 group">
          {/* Logo estilo passaporte - IDÊNTICO AO PERFIL */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Container estilo passaporte */}
            <div className="w-16 h-16 bg-white rounded-xl shadow-xl overflow-hidden border-2 border-white flex items-center justify-center">
              {/* Imagem da logo */}
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

          <div className="text-left">
            <h1 className="font-bebas text-xl text-white tracking-wider uppercase leading-tight drop-shadow-md">
              PATRULHA AÉREA CIVIL
            </h1>
            <p className="text-blue-300 text-xs leading-tight mt-1 font-roboto font-medium">
              Painel Administrativo
            </p>
          </div>
        </Link>
      </div>

      {/* Navegação */}
      <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Footer do Sidebar */}
      <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Administrador
            </p>
            <p className="text-xs text-gray-500 truncate">Sistema PAC</p>
          </div>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/perfil")}
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-2"
              title="Meu Perfil"
            >
              <User className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-2"
              title="Sair do sistema"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
