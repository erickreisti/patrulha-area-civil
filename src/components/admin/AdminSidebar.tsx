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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
        name: "Todas as Categorias",
        href: "/admin/galeria/categorias",
        icon: Folder,
      },
      {
        name: "Todos os Itens",
        href: "/admin/galeria/itens",
        icon: Images,
      },
      {
        name: "Nova Categoria",
        href: "/admin/galeria/categorias/criar",
        icon: Folder,
      },
    ],
  },
  {
    name: "Relatórios",
    href: "/admin/relatorios",
    icon: BarChart3,
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
      {/* Logo */}
      <div className="flex items-center justify-center h-20 flex-shrink-0 px-4 border-b border-gray-200 bg-gradient-to-r from-navy-light to-navy">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <span className="text-navy font-bold text-lg">PAC</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">PAC Admin</h1>
            <p className="text-xs text-blue-200">Patrulha Aérea Civil</p>
          </div>
        </div>
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
                      ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent hover:border-gray-200"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                      isActive
                        ? "text-blue-600"
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
                              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent hover:border-gray-200"
                          )}
                        >
                          <child.icon
                            className={cn(
                              "mr-3 flex-shrink-0 h-4 w-4 transition-colors",
                              isChildActive
                                ? "text-blue-600"
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

          {/* Link para Perfil */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/perfil")} // ✅ ATUALIZADO
            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
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
  );
}
