import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { GaleriaItem, GaleriaCategoria } from "@/types";
import { toast } from "sonner";

export interface Filtros {
  busca: string;
  categoria: string;
  tipo: string;
  status: string;
}

export function useGaleriaData() {
  const [itens, setItens] = useState<GaleriaItem[]>([]);
  const [categorias, setCategorias] = useState<GaleriaCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItens, setTotalItens] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const supabase = createClient();
  const ITEMS_PER_PAGE = 10;

  const verificarAdmin = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Você precisa estar autenticado");
        return false;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao verificar perfil:", error);
        toast.error("Erro ao verificar permissões");
        return false;
      }

      return profile?.role === "admin" && profile?.status === true;
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
      return false;
    }
  }, [supabase]);

  const contarTotalItens = useCallback(
    async (filtrosAtuais: Filtros) => {
      try {
        let query = supabase
          .from("galeria_itens")
          .select("*", { count: "exact", head: true });

        if (filtrosAtuais.busca) {
          query = query.ilike("titulo", `%${filtrosAtuais.busca}%`);
        }
        if (filtrosAtuais.categoria !== "all") {
          query = query.eq("categoria_id", filtrosAtuais.categoria);
        }
        if (filtrosAtuais.tipo !== "all") {
          query = query.eq("tipo", filtrosAtuais.tipo);
        }
        if (filtrosAtuais.status !== "all") {
          query = query.eq("status", filtrosAtuais.status === "ativo");
        }

        const { count, error } = await query;
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error("Erro ao contar itens:", error);
        return 0;
      }
    },
    [supabase]
  );

  const fetchItens = useCallback(
    async (page = 1, filtros: Filtros) => {
      try {
        setLoading(true);
        const isAdmin = await verificarAdmin();
        if (!isAdmin) {
          setItens([]);
          setTotalItens(0);
          setTotalPages(0);
          return;
        }

        const offset = (page - 1) * ITEMS_PER_PAGE;

        let query = supabase
          .from("galeria_itens")
          .select(
            `
          *,
          galeria_categorias (
            id,
            nome,
            tipo,
            status,
            arquivada
          )
        `
          )
          .order("ordem", { ascending: true })
          .order("created_at", { ascending: false })
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (filtros.busca) {
          query = query.ilike("titulo", `%${filtros.busca}%`);
        }
        if (filtros.categoria !== "all") {
          query = query.eq("categoria_id", filtros.categoria);
        }
        if (filtros.tipo !== "all") {
          query = query.eq("tipo", filtros.tipo);
        }
        if (filtros.status !== "all") {
          query = query.eq("status", filtros.status === "ativo");
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro Supabase:", error);
          throw new Error(`Erro ao carregar itens: ${error.message}`);
        }

        const total = await contarTotalItens(filtros);
        setTotalItens(total);
        setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
        setItens(data || []);
      } catch (error: unknown) {
        console.error("Erro ao carregar itens:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        toast.error(`Erro ao carregar itens: ${errorMessage}`);
        setItens([]);
        setTotalItens(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [supabase, verificarAdmin, contarTotalItens]
  );

  const fetchCategorias = useCallback(async () => {
    try {
      const isAdmin = await verificarAdmin();
      if (!isAdmin) {
        setCategorias([]);
        return;
      }

      const { data: categoriasData, error: categoriasError } = await supabase
        .from("galeria_categorias")
        .select(
          "id, nome, descricao, slug, tipo, status, arquivada, ordem, created_at"
        )
        .order("ordem", { ascending: true })
        .order("status", { ascending: false });

      if (categoriasError) throw categoriasError;

      const categoriasComCount = await Promise.all(
        (categoriasData || []).map(async (categoria) => {
          const { count, error: countError } = await supabase
            .from("galeria_itens")
            .select("*", { count: "exact", head: true })
            .eq("categoria_id", categoria.id);

          if (countError) {
            console.error(
              `Erro ao contar itens da categoria ${categoria.id}:`,
              countError
            );
            return { ...categoria, itens_count: 0 };
          }

          return { ...categoria, itens_count: count || 0 };
        })
      );

      setCategorias(categoriasComCount);
    } catch (error: unknown) {
      console.error("Erro ao carregar categorias:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar categorias: ${errorMessage}`);
      setCategorias([]);
    }
  }, [supabase, verificarAdmin]);

  return {
    itens,
    categorias,
    loading,
    totalItens,
    totalPages,
    fetchItens,
    fetchCategorias,
    ITEMS_PER_PAGE,
  };
}
