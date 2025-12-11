"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores";
import { createClient } from "@/lib/supabase/client";

export function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (isMounted) {
        await initialize();
      }
    };

    initializeAuth();

    // Configurar listener para mudanças de autenticação
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (isMounted) {
        if (event === "SIGNED_OUT") {
          useAuthStore.getState().logout();
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Forçar refresh do estado
          await initialize();
        } else if (event === "USER_UPDATED") {
          // Atualizar quando houver mudanças no usuário
          await initialize();
        }
      }
    });

    // Verificar sessão periodicamente (a cada 5 minutos)
    const interval = setInterval(async () => {
      if (isMounted) {
        await useAuthStore.getState().refreshSession();
      }
    }, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [initialize]);

  return null;
}
