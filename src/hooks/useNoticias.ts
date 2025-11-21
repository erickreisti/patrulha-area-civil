// src/hooks/useNoticias.ts
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useNoticias() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNoticias() {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from("noticias")
          .select(
            "id, titulo, slug, resumo, categoria, data_publicacao, destaque"
          )
          .eq("status", "publicado")
          .order("data_publicacao", { ascending: false })
          .limit(6);

        if (error) throw error;

        setNoticias(data || []);
      } catch (err: any) {
        console.error("Erro ao carregar notícias:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  return { noticias, loading, error };
}
