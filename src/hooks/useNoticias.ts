"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type NoticiaListagem = Pick<
  Database["public"]["Tables"]["noticias"]["Row"],
  | "id"
  | "titulo"
  | "slug"
  | "resumo"
  | "categoria"
  | "data_publicacao"
  | "destaque"
>;

interface UseNoticiasReturn {
  noticias: NoticiaListagem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNoticias(): UseNoticiasReturn {
  const [noticias, setNoticias] = useState<NoticiaListagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNoticias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("noticias")
        .select(
          "id, titulo, slug, resumo, categoria, data_publicacao, destaque"
        )
        .eq("status", "publicado")
        .order("data_publicacao", { ascending: false })
        .limit(6);

      if (fetchError) {
        throw new Error(`Erro ao carregar notícias: ${fetchError.message}`);
      }

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
  }, []);

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  return {
    noticias,
    loading,
    error,
    refetch: fetchNoticias,
  };
}
