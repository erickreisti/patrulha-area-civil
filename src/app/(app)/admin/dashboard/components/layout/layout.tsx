// src/app/admin/dashboard/components/layout/AdminLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Spinner } from "@/components/ui/spinner";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { Toaster } from "@/components/ui/sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, hasAdminSession, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("🔍 [AdminLayout] Status:", {
      pathname,
      isAdmin,
      hasAdminSession,
      isLoading,
    });

    // Verificar acesso após carregamento
    if (!isLoading) {
      if (!isAdmin || !hasAdminSession) {
        console.log("❌ [AdminLayout] Acesso negado, redirecionando...");
        router.push("/perfil");
      } else {
        const timer = setTimeout(() => {
          setIsChecking(false);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [isAdmin, hasAdminSession, isLoading, pathname, router]);

  // Se está carregando ou verificando
  if (isLoading || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <Spinner className="w-12 h-12 text-blue-600" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              Verificando acesso administrativo
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Aguarde enquanto verificamos suas credenciais...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se não tem acesso, não renderiza nada
  if (!isAdmin || !hasAdminSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
