"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import type { CategoriaShowcase } from "@/app/actions/gallery/types";

// Tipos auxiliares para a query
interface ItemQuery {
  arquivo_url: string;
  thumbnail_url: string | null;
  tipo: "foto" | "video";
}

interface CategoriaQuery {
  id: string;
  nome: string;
  slug: string;
  tipo: "fotos" | "videos";
  descricao: string | null;
  created_at: string;
  status: boolean;
  ordem: number;
  arquivada: boolean;
  updated_at: string; // Adicionado para conformidade com GaleriaCategoria
  // O Supabase retorna o join como um array de objetos
  galeria_itens: ItemQuery[];
}

export async function getCategoriasDestaquePublico(): Promise<{
  success: boolean;
  data?: CategoriaShowcase[];
  error?: string;
}> {
  // Usar getAdminClient garante acesso no server-side sem depender de cookies de sessão do browser
  // Como é público, filtramos manualmente status=true
  const supabase = await getAdminClient();

  try {
    const { data, error } = await supabase
      .from("galeria_categorias")
      .select(
        `
        *,
        galeria_itens (
          arquivo_url,
          thumbnail_url,
          tipo
        )
      `,
      )
      .eq("status", true)
      .eq("arquivada", false)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) throw error;

    // Casting seguro baseado na resposta da Query
    const categoriasDoBanco = data as unknown as CategoriaQuery[];

    const categoriasFormatadas: CategoriaShowcase[] = categoriasDoBanco
      .map((cat) => {
        // galeria_itens vem do join
        const itens = Array.isArray(cat.galeria_itens) ? cat.galeria_itens : [];

        // Tenta achar uma capa: prioridade para thumbnail, senão arquivo se for foto
        const capaItem = itens.find(
          (i) => i.thumbnail_url || (i.tipo === "foto" && i.arquivo_url),
        );

        // Remove a propriedade do join para limpar o objeto final e adiciona a URL da capa
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { galeria_itens, ...restCategoria } = cat;

        return {
          ...restCategoria,
          itens_count: itens.length,
          capa_url: capaItem?.thumbnail_url || capaItem?.arquivo_url || null,
        };
      })
      // Filtra categorias vazias (opcional, remova se quiser mostrar categorias vazias com placeholder)
      .filter((c) => c.itens_count > 0)
      .slice(0, 3);

    return { success: true, data: categoriasFormatadas };
  } catch (error) {
    console.error("Erro ao buscar categorias destaque:", error);
    return { success: false, error: "Falha ao carregar galeria" };
  }
}
