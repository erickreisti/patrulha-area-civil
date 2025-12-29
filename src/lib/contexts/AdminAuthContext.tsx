"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/lib/stores";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { User, Profile } from "@/lib/supabase/types";

interface AdminAuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCommonAgent: boolean;
  isActiveAgent: boolean;
  isInactiveAgent: boolean;
  user: User | null;
  profile: Profile | null;
  refreshAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    profile,
    isAuthenticated,
    isAdmin,
    isLoading: authLoading,
    initialize,
  } = useAuthStore();

  // Verificações de status do agente
  const isCommonAgent = isAuthenticated && !isAdmin;
  const isActiveAgent = isCommonAgent && profile?.status === true;
  const isInactiveAgent = isCommonAgent && profile?.status === false;

  // Inicializar autenticação
  useEffect(() => {
    const initAuth = async () => {
      await initialize();
    };
    initAuth();
  }, [initialize]);

  // Redirecionamentos baseados no tipo de usuário
  useEffect(() => {
    if (authLoading) return;

    // 👤 SE NÃO ESTÁ AUTENTICADO E NÃO É LOGIN → REDIRECIONAR
    if (!isAuthenticated && !pathname.startsWith("/login")) {
      const redirectPath = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirectPath}`);
      return;
    }

    // 👑 SE É ADMIN → PODE ACESSAR QUALQUER LUGAR (dashboard admin)
    if (isAdmin) {
      // Se está em /perfil e quer ir para dashboard, pode usar o botão
      // Não forçamos redirecionamento automático
      return;
    }

    // 👥 SE É AGENTE COMUM (ativo ou inativo)
    if (isCommonAgent) {
      // Se está tentando acessar área admin → redirecionar para perfil
      if (pathname.startsWith("/admin")) {
        router.push("/perfil");
        return;
      }

      // Se está na página de perfil → permitir acesso (tanto ativo quanto inativo)
      if (pathname.startsWith("/perfil")) {
        return;
      }

      // Se está em qualquer outra página que não seja login → redirecionar para perfil
      if (!pathname.startsWith("/login")) {
        router.push("/perfil");
        return;
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, isCommonAgent, pathname, router]);

  // Loading
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Verificando autenticação...</p>
      </div>
    );
  }

  const refreshAuth = async () => {
    await initialize();
  };

  const value: AdminAuthContextType = {
    isLoading: authLoading,
    isAuthenticated,
    isAdmin,
    isCommonAgent,
    isActiveAgent,
    isInactiveAgent,
    user,
    profile,
    refreshAuth,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth deve ser usado dentro de AdminAuthProvider");
  }
  return context;
}
