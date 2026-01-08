"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Spinner } from "@/components/ui/spinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Verificar se a rota atual é admin (admin tem layout próprio)
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    console.log("🔍 [AppLayout] Status:", {
      pathname,
      isAuthenticated,
      isLoading,
      isAdminRoute,
    });

    // Se não for rota de admin e não estiver autenticado
    if (!isAdminRoute && !isAuthenticated && !isLoading) {
      console.log("🔄 [AppLayout] Redirecionando para login...");
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, isAdminRoute, pathname, router]);

  // Se é rota admin, renderizar apenas children (admin tem layout próprio)
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Se está carregando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Spinner className="w-8 h-8 text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    );
  }

  // Se não está autenticado e não é admin
  if (!isAuthenticated) {
    return null; // Já redirecionou
  }

  // Layout para rotas não-admin (como perfil)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
