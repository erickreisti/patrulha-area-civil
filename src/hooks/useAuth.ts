"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/types";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getAuthData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("❌ useAuth: Erro ao buscar usuário:", userError);
          setLoading(false);
          return;
        }

        setUser(user);

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("❌ useAuth: Erro ao buscar perfil:", profileError);
          } else {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("💥 useAuth: Erro geral:", error);
      } finally {
        setLoading(false);
      }
    };

    getAuthData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAdmin: profile?.role === "admin",
    isAgent: profile?.role === "agent" || profile?.role === "admin",
  };
}
