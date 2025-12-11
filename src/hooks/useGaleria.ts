"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type CategoriaListagem = Pick<
  Database["public"]["Tables"]["galeria_categorias"]["Row"],
  "id" | "nome" | "slug" | "descricao" | "tipo" | "ordem"
>;

interface UseGaleriaReturn {
  categorias: CategoriaListagem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGaleria(): UseGaleriaReturn {
  const [categorias, setCategorias] = useState<CategoriaListagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const { data: categoriasData, error: categoriasError } = await supabase
        .from("galeria_categorias")
        .select("id, nome, slug, descricao, tipo, ordem")
        .eq("status", true)
        .order("ordem", { ascending: true });

      if (categoriasError) {
        throw new Error(
          `Erro ao carregar categorias: ${categoriasError.message}`
        );
      }

      setCategorias(categoriasData || []);
    } catch (err: unknown) {
      console.error("Erro ao carregar categorias:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar categorias";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return {
    categorias,
    loading,
    error,
    refetch: fetchCategorias,
  };
}
