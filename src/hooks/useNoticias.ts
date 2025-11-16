// src/hooks/useNoticias.ts
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { NoticiaWithAutor } from "@/types/noticias";

export function useNoticias() {
  const [noticias, setNoticias] = useState<NoticiaWithAutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("noticias")
          .select(
            `
            *,
            autor:profiles(full_name, graduacao)
          `
          )
          .eq("status", "publicado") // Apenas notícias publicadas
          .order("data_publicacao", { ascending: false });

        if (error) throw error;

        setNoticias(data || []);
      } catch (err: any) {
        console.error("Erro ao buscar notícias:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, [supabase]);

  return { noticias, loading, error };
}
