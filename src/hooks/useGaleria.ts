// src/hooks/useGaleria.ts
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface CategoriaGaleria {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: string;
  ordem: number;
}

export function useGaleria() {
  const [categorias, setCategorias] = useState<CategoriaGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategorias() {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: categoriasData, error: categoriasError } = await supabase
          .from("galeria_categorias")
          .select("id, nome, slug, descricao, tipo, ordem")
          .eq("status", true)
          .order("ordem", { ascending: true });

        if (categoriasError) throw categoriasError;

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
    }

    fetchCategorias();
  }, []);

  return { categorias, loading, error };
}
