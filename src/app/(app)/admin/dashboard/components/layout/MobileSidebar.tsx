"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  RiDashboardLine,
  RiGroupLine,
  RiArticleLine,
  RiImageLine,
  RiUserLine,
  RiSettingsLine,
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
        name: "Listar",
        href: "/admin/agentes",
        icon: RiGroupLine,
      },
      {
        name: "Criar",
        href: "/admin/agentes/criar",
        icon: RiUserLine,
      },
    ],
  },
  {
    name: "Notícias",
    href: "/admin/noticias",
    icon: RiArticleLine,
  },
  {
    name: "Galeria",
    href: "/admin/galeria",
    icon: RiImageLine,
  },
  {
    name: "Configurações",
    href: "/admin/configuracoes",
    icon: RiSettingsLine,
  },
];

export function MobileSidebar() {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <nav className="space-y-1 px-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = isLinkActive(item.href);

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                />
                {item.name}
              </Link>

              {item.children && isActive && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = isLinkActive(child.href);

                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                          isChildActive
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <ChildIcon className="mr-2 h-4 w-4" />
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
  );
}
