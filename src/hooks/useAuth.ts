"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UseAuthReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Erro de sessão: ${sessionError.message}`);
      }

      if (!session) {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        throw new Error(`Erro ao carregar perfil: ${profileError.message}`);
      }

      if (profileData) {
        setProfile(profileData);
        setIsAdmin(profileData.role === "admin");
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    } catch (err: unknown) {
      console.error("Erro no useAuth:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar dados do usuário"
      );
      setProfile(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let isSubscribed = true;
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        await fetchProfile();

        if (isSubscribed) {
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(() => {
            if (isSubscribed) {
              fetchProfile();
            }
          });

          unsubscribe = () => subscription.unsubscribe();
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Erro na inicialização do auth:", err);
        }
      }
    };

    initAuth();

    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchProfile, supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setIsAdmin(false);
      setError(null);
    } catch (err: unknown) {
      console.error("Erro ao fazer logout:", err);
      setError(
        err instanceof Error ? err.message : "Erro desconhecido ao fazer logout"
      );
    }
  };

  return {
    profile,
    loading,
    error,
    isAdmin,
    signOut,
    supabase,
    refreshProfile: fetchProfile,
  };
}
