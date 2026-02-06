"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Fixa (Desktop) */}
      <AdminSidebar />

      {/* Área Principal (Header + Conteúdo) */}
      <div className="flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        {/* Header (Fixo no topo, ajustado com padding-left no componente interno) */}
        <AdminHeader />

        {/* Conteúdo da Página */}
        <main className="flex-1 lg:pl-64 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
