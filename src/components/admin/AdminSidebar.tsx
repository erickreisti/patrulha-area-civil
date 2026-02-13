"use client";

import { useRouter } from "next/navigation";
import { adminNavigation } from "@/config/admin-navigation";
import LogoHeader from "./LogoHeader";
import { NavItem } from "./NavItem";
import { Button } from "@/components/ui/button";
import { RiLogoutBoxLine, RiUserLine } from "react-icons/ri";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "sonner";

export function AdminSidebar() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Sessão encerrada");
      router.replace("/login");
    } catch (error) {
      toast.error("Erro ao encerrar sessão");
      console.error(error);
    }
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 h-screen fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 shadow-sm">
      {/* Header da Sidebar */}
      <div className="h-20 flex items-center justify-center border-b border-slate-100 px-6 bg-white">
        <LogoHeader />
      </div>

      {/* Área de Navegação (Scrollável) */}
      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar bg-white">
        <nav className="space-y-1">
          {adminNavigation.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>
      </div>

      {/* Footer da Sidebar (Fixo embaixo) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/perfil")}
            className="w-full justify-center text-slate-600 hover:text-pac-primary border-slate-200 hover:bg-white transition-all duration-200"
          >
            <RiUserLine className="mr-1.5 h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-tight">
              Perfil
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-center text-slate-600 hover:text-red-600 border-slate-200 hover:bg-red-50 hover:border-red-100 transition-all duration-200"
          >
            <RiLogoutBoxLine className="mr-1.5 h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-tight">
              Sair
            </span>
          </Button>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div className="h-px w-8 bg-slate-200 mb-3" />
          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">
            PAC SISTEMA <span className="text-pac-primary/50">v2.0</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
