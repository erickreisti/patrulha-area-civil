import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/types";

export function useAuth() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        setProfile(null);
        setIsAdmin(false);
      } else {
        setProfile(profileData);
        setIsAdmin(profileData.role === "admin");
      }
    } catch (error) {
      console.error("Erro no useAuth:", error);
      setProfile(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfile();

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return {
    profile,
    loading,
    isAdmin,
    signOut,
    supabase,
    refreshProfile: fetchProfile,
  };
}
