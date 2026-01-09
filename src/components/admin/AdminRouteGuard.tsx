// src/components/admin/AdminRouteGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Spinner } from "@/components/ui/spinner";

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requireAdminSession?: boolean;
}

/**
 * COMPONENTE AdminRouteGuard
 *
 * 🛡️ FUNÇÃO: Proteção client-side para rotas administrativas
 *
 * ✅ O QUE FAZ:
 * 1. Verifica se o usuário está autenticado
 * 2. Verifica se o usuário é admin
 * 3. Se requireAdminSession=true, verifica sessão admin ativa
 * 4. Redireciona automaticamente se não tiver permissão
 *
 * 📍 ONDE USAR:
 * - Páginas CRUD (/admin/agentes, /admin/noticias, etc.)
 * - Dashboard (/admin/dashboard)
 * - Qualquer rota que requer acesso admin
 *
 * 🎯 VANTAGENS:
 * - Camada extra de segurança além do middleware
 * - Feedback visual (loading) enquanto verifica
 * - Redirecionamento automático
 * - Fácil reutilização
 */

export function AdminRouteGuard({
  children,
  requireAdminSession = true,
}: AdminRouteGuardProps) {
  const router = useRouter();
  const { profile, hasAdminSession, isLoading, isAuthenticated } =
    useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // Verificar se está autenticado
    if (!isAuthenticated || !profile) {
      router.push("/login");
      return;
    }

    // Verificar se é admin
    if (profile.role !== "admin") {
      router.push("/perfil");
      return;
    }

    // Se a rota requer sessão admin, verificar
    if (requireAdminSession && !hasAdminSession) {
      router.push("/perfil");
      return;
    }
  }, [
    profile,
    hasAdminSession,
    isLoading,
    isAuthenticated,
    router,
    requireAdminSession,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return null; // Será redirecionado pelo useEffect
  }

  if (requireAdminSession && !hasAdminSession) {
    return null; // Será redirecionado pelo useEffect
  }

  return <>{children}</>;
}
