"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { adminNavigation } from "@/config/admin-navigation";
import LogoHeader from "./LogoHeader";
import { NavItem } from "./NavItem";
import { Button } from "@/components/ui/button";
import { RiLogoutBoxLine, RiUserLine } from "react-icons/ri";

export function AdminSidebar() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 h-screen fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 shadow-sm">
      {/* Header da Sidebar */}
      <div className="h-20 flex items-center justify-center border-b border-slate-100 px-6">
        <LogoHeader />
      </div>

      {/* Área de Navegação (Scrollável) */}
      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
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
            className="w-full justify-start text-slate-600 hover:text-sky-700 border-slate-200 hover:bg-white"
          >
            <RiUserLine className="mr-2 h-4 w-4" />
            Perfil
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-slate-600 hover:text-red-600 border-slate-200 hover:bg-red-50 hover:border-red-100"
          >
            <RiLogoutBoxLine className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">
          PAC Sistema v2.0
        </p>
      </div>
    </aside>
  );
}
