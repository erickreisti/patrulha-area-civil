// src/hooks/useGaleria.ts
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useGaleria() {
  const [categorias, setCategorias] = useState<any[]>([]);
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
      } catch (err: any) {
        console.error("Erro ao carregar categorias:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategorias();
  }, []);

  return { categorias, loading, error };
}
