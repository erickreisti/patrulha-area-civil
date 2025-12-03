// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/types";

export function useAuth() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
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
          setLoading(false);
          return;
        }

        setProfile(profileData);
        setIsAdmin(profileData.role === "admin");
      } catch (error) {
        console.error("Erro no useAuth:", error);
      } finally {
        setLoading(false);
      }
    };

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
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
  };

  return {
    profile,
    loading,
    isAdmin,
    signOut,
    supabase,
  };
}
