// src/hooks/useAuth.ts
"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  matricula: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  graduacao: string;
  validade_certificacao: string | null;
  tipo_sanguineo: string;
  status: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getAuthData = async () => {
      try {
        console.log("🔐 useAuth: Iniciando carregamento...");

        // 1. Buscar usuário autenticado
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("❌ useAuth: Erro ao buscar usuário:", userError);
          setLoading(false);
          return;
        }

        console.log("👤 useAuth: Usuário encontrado:", user?.id);
        setUser(user);

        // 2. Se usuário existe, buscar perfil
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("❌ useAuth: Erro ao buscar perfil:", profileError);
          } else {
            console.log(
              "📊 useAuth: Perfil carregado:",
              profileData?.full_name
            );
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("💥 useAuth: Erro geral:", error);
      } finally {
        setLoading(false);
        console.log("🏁 useAuth: Carregamento finalizado");
      }
    };

    getAuthData();

    // 3. Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 useAuth: Mudança de auth -", event);

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Buscar perfil atualizado
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
    console.log("🚪 useAuth: Iniciando logout...");
    await supabase.auth.signOut();
    // Forçar recarregamento para limpar estado
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
