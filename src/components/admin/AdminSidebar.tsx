// src/components/admin/AdminSidebar.tsx - CORRIGIDO COM LOGO PREENCHENDO O FUNDO
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  Images,
  Folder,
  Settings,
  LogOut,
  BarChart3,
  User,
  Plus,
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
    icon: Home,
  },
  {
    name: "Agentes",
    href: "/admin/agentes",
    icon: Users,
  },
  {
    name: "Notícias",
    href: "/admin/noticias",
    icon: FileText,
  },
  {
    name: "Galeria",
    href: "/admin/galeria",
    icon: Images,
    children: [
      {
        name: "Todos os Itens",
        href: "/admin/galeria/itens",
        icon: Folder,
      },
      {
        name: "Criar Item",
        href: "/admin/galeria/itens/criar",
        icon: Plus,
      },
      {
        name: "Todas as Categorias",
        href: "/admin/galeria/categorias",
        icon: Folder,
      },
      {
        name: "Criar Categoria",
        href: "/admin/galeria/categorias/criar",
        icon: Plus,
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

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200 shadow-lg">
      {/* Logo - CORRIGIDA: IMAGEM PREENCHENDO O FUNDO REDONDO */}
      <div className="flex items-center justify-center h-24 flex-shrink-0 px-4 border-b border-gray-200 bg-gradient-to-r from-navy-700 to-navy-900">
        <Link href="/" className="flex items-center gap-4 group">
          {/* ✅ CORREÇÃO: Logo preenchendo completamente o fundo redondo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Container do fundo redondo - agora a imagem vai preencher ele */}
            <div className="w-16 h-16 bg-white rounded-full shadow-xl overflow-hidden border-4 border-white">
              {/* Imagem da logo preenchendo todo o espaço */}
              <div className="w-full h-full flex items-center justify-center">
                <Image
                  src="/images/logos/logo.webp"
                  alt="Patrulha Aérea Civil"
                  width={64} // ✅ Mesmo tamanho do container (64px)
                  height={64} // ✅ Mesmo tamanho do container (64px)
                  className="object-cover w-full h-full p-1" // ✅ Preenche todo o espaço
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
              Serviço Humanitário
            </p>
          </div>
        </Link>
      </div>

      {/* Navegação */}
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 border",
                    isActive
                      ? "bg-navy-light/10 text-navy border-navy-light/20 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent hover:border-gray-200"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                      isActive
                        ? "text-navy"
                        : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>

                {/* Subitens */}
                {item.children && isActive && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive =
                        pathname === child.href ||
                        pathname.startsWith(`${child.href}/`);

                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 border",
                            isChildActive
                              ? "bg-navy-light/10 text-navy border-navy-light/20 shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent hover:border-gray-200"
                          )}
                        >
                          <child.icon
                            className={cn(
                              "mr-3 flex-shrink-0 h-4 w-4 transition-colors",
                              isChildActive
                                ? "text-navy"
                                : "text-gray-400 group-hover:text-gray-500"
                            )}
                          />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer do Sidebar */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
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
              className="text-gray-400 hover:text-navy hover:bg-navy/10 transition-colors"
              title="Meu Perfil"
            >
              <User className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
