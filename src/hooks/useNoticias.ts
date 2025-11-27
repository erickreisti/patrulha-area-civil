// src/hooks/useNoticias.ts
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  categoria: string | null;
  data_publicacao: string;
  destaque: boolean;
}

export function useNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
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
      } catch (err: unknown) {
        console.error("Erro ao carregar notícias:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao carregar notícias";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  return { noticias, loading, error };
}
