"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface GaleriaCategoria {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: "fotos" | "videos";
  ordem: number;
  status: boolean;
  created_at: string;
  galeria_itens?: { count: number }[];
}

export interface GaleriaItem {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria_id: string | null;
  tipo: "foto" | "video";
  arquivo_url: string;
  thumbnail_url: string | null;
  ordem: number;
  autor_id: string | null;
  status: boolean;
  created_at: string;
  categoria?: GaleriaCategoria;
}

export function useGaleria() {
  const [categorias, setCategorias] = useState<GaleriaCategoria[]>([]);
  const [itens, setItens] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("galeria_categorias")
        .select(
          `
          *,
          galeria_itens(count)
        `
        )
        .eq("status", true)
        .order("ordem", { ascending: true })
        .order("nome", { ascending: true });

      if (error) throw error;

      setCategorias(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar categorias:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchItensPorCategoria = async (categoriaSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro buscar a categoria
      const { data: categoriaData, error: categoriaError } = await supabase
        .from("galeria_categorias")
        .select("id")
        .eq("slug", categoriaSlug)
        .eq("status", true)
        .single();

      if (categoriaError) throw categoriaError;
      if (!categoriaData) throw new Error("Categoria não encontrada");

      // Buscar itens da categoria
      const { data: itensData, error: itensError } = await supabase
        .from("galeria_itens")
        .select(
          `
          *,
          categoria:galeria_categorias(*)
        `
        )
        .eq("categoria_id", categoriaData.id)
        .eq("status", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });

      if (itensError) throw itensError;

      setItens(itensData || []);
      return itensData || [];
    } catch (err: any) {
      console.error("Erro ao buscar itens da galeria:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchTodosItens = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("galeria_itens")
        .select(
          `
          *,
          categoria:galeria_categorias(*)
        `
        )
        .eq("status", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItens(data || []);
      return data || [];
    } catch (err: any) {
      console.error("Erro ao buscar todos os itens:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [supabase]);

  return {
    categorias,
    itens,
    loading,
    error,
    fetchCategorias,
    fetchItensPorCategoria,
    fetchTodosItens,
  };
}
