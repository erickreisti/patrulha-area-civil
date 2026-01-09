"use client";

import { AdminSidebar } from "./admin/dashboard/components/layout/AdminSidebar";
import { AdminHeader } from "./admin/dashboard/components/layout/AdminHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar e Header são responsáveis pelo seu próprio posicionamento */}
      <AdminSidebar />
      <AdminHeader />

      {/* Conteúdo principal */}
      <main className="lg:ml-64 pt-20">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
