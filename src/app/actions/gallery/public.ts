"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import type { CategoriaShowcase } from "@/app/actions/gallery/types";

// Tipos auxiliares para a query
interface ItemQuery {
  arquivo_url: string;
  thumbnail_url: string | null;
  tipo: "foto" | "video";
  created_at: string;
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
  updated_at: string;
  galeria_itens: ItemQuery[];
}

export async function getCategoriasDestaquePublico(): Promise<{
  success: boolean;
  data?: CategoriaShowcase[];
  error?: string;
}> {
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
          tipo,
          created_at
        )
      `,
      )
      .eq("status", true)
      .eq("arquivada", false)
      // Ordena as categorias (ex: mais recentes primeiro)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) throw error;

    const categoriasDoBanco = data as unknown as CategoriaQuery[];

    const categoriasFormatadas: CategoriaShowcase[] = categoriasDoBanco
      .map((cat) => {
        // Ordena os itens para garantir que pegamos o primeiro adicionado como capa
        // Se quiser a foto mais recente como capa, use b.created_at - a.created_at
        const itens = Array.isArray(cat.galeria_itens)
          ? cat.galeria_itens.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
            )
          : [];

        // LÓGICA DE CAPA CORRIGIDA:
        // 1. Pega o primeiro item da lista (seja foto ou vídeo)
        const primeiroItem = itens[0];

        // 2. Se for vídeo, usa thumbnail se tiver, senão usa o próprio vídeo como capa
        // 3. Se for foto, usa thumbnail se tiver, senão usa a própria foto
        let capaUrl = null;

        if (primeiroItem) {
          capaUrl =
            primeiroItem.thumbnail_url || primeiroItem.arquivo_url || null;
        }

        // Remove a propriedade do join para limpar o objeto final
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { galeria_itens, ...restCategoria } = cat;

        return {
          ...restCategoria,
          itens_count: itens.length,
          capa_url: capaUrl,
        };
      })
      .filter((c) => c.itens_count > 0)
      .slice(0, 3);

    return { success: true, data: categoriasFormatadas };
  } catch (error) {
    console.error("Erro ao buscar categorias destaque:", error);
    return { success: false, error: "Falha ao carregar galeria" };
  }
}
