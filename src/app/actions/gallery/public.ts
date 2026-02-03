"use server";

import { createClient } from "@/lib/supabase/client";
import type { CategoriaShowcase } from "@/app/actions/gallery/types";
import type { GaleriaCategoria } from "@/lib/supabase/types";

// 1. Definimos o tipo exato do Item que vem no JOIN
interface ItemParcial {
  arquivo_url: string;
  thumbnail_url: string | null;
  tipo: "foto" | "video";
}

// 2. Definimos o tipo da Categoria + a relação com Itens
interface CategoriaComRelacao extends GaleriaCategoria {
  itens: ItemParcial[];
}

export async function getCategoriasDestaquePublico(): Promise<{
  success: boolean;
  data?: CategoriaShowcase[];
  error?: string;
}> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("galeria_categorias")
      .select(
        `
        *,
        itens:galeria_itens(
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

    if (!data) return { success: true, data: [] };

    // 3. Forçamos a tipagem do retorno do banco para o nosso tipo intermediário
    // Isso elimina o 'any' e diz ao TS: "Eu garanto que o banco retornou isso"
    const categoriasDoBanco = data as unknown as CategoriaComRelacao[];

    const categoriasFormatadas: CategoriaShowcase[] = categoriasDoBanco
      .map((cat) => {
        // Agora 'cat' e 'cat.itens' são tipados
        const itens = Array.isArray(cat.itens) ? cat.itens : [];

        // 'i' agora é inferido como ItemParcial, sem 'any'
        const capaItem = itens.find(
          (i) => i.thumbnail_url || (i.tipo === "foto" && i.arquivo_url),
        );

        const capaUrl =
          capaItem?.thumbnail_url || capaItem?.arquivo_url || null;

        return {
          ...cat,
          itens: undefined, // Removemos a lista pesada do objeto final
          itens_count: itens.length,
          capa_url: capaUrl,
          tem_destaque: false, // Lógica opcional de destaque
        };
      })
      .filter((c) => c.itens_count > 0)
      .slice(0, 3);

    return { success: true, data: categoriasFormatadas };
  } catch (error) {
    console.error("Erro ao buscar destaques:", error);
    return { success: false, error: "Não foi possível carregar a galeria." };
  }
}
