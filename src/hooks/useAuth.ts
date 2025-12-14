import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth";

export function useAuth() {
  const {
    user,
    session: storeSession,
    isLoading,
    initialize,
    logout,
  } = useAuthStore();

  // Wrap initialize in useCallback to prevent infinite re-renders
  const safeInitialize = useCallback(async () => {
    try {
      await initialize();
    } catch (error) {
      console.error("❌ Falha na inicialização da autenticação:", error);
      // Don't throw, just log - we don't want to break the UI
    }
  }, [initialize]);

  // Wrap logout in useCallback
  const safeLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("❌ Falha no logout:", error);
    }
  }, [logout]);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const setupAuth = async () => {
      if (!mounted) return;

      try {
        // Only try to initialize if we're in the browser
        if (typeof window !== "undefined") {
          await safeInitialize();
        }
      } catch (error) {
        console.error("❌ Erro no setup de autenticação:", error);
      }
    };

    setupAuth();

    // Set up auth listener - but only if Supabase is configured
    try {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange(async (event) => {
        if (!mounted) return;

        console.log("🔐 Auth state changed:", event);

        if (event === "SIGNED_OUT") {
          await safeLogout();
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await safeInitialize();
        }
      });

      subscription = data.subscription;
    } catch (error) {
      // Supabase client creation failed (likely due to missing env vars)
      console.warn(
        "⚠️ Supabase não configurado. Autenticação desativada.",
        error
      );
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [safeInitialize, safeLogout]);

  return {
    user,
    session: storeSession,
    isLoading,
    isAuthenticated: !!user && !!storeSession,
    isAdmin: user?.role === "admin",
    isActive: user?.status === "active",
    logout: safeLogout,
    refresh: safeInitialize,
  };
}
