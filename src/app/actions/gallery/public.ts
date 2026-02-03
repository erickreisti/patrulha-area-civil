"use server";

import { createClient } from "@/lib/supabase/client";
import type { CategoriaShowcase } from "@/app/actions/gallery/types";
import type { GaleriaCategoria } from "@/lib/supabase/types";

interface ItemParcial {
  arquivo_url: string;
  thumbnail_url: string | null;
  tipo: "foto" | "video";
}

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

    const categoriasDoBanco = data as unknown as CategoriaComRelacao[];

    const categoriasFormatadas: CategoriaShowcase[] = categoriasDoBanco
      .map((cat) => {
        const itens = Array.isArray(cat.itens) ? cat.itens : [];
        const capaItem = itens.find(
          (i) => i.thumbnail_url || (i.tipo === "foto" && i.arquivo_url),
        );

        return {
          ...cat,
          itens: undefined,
          itens_count: itens.length,
          capa_url: capaItem?.thumbnail_url || capaItem?.arquivo_url || null,
        };
      })
      .filter((c) => c.itens_count > 0)
      .slice(0, 3);

    return { success: true, data: categoriasFormatadas };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Falha ao carregar galeria" };
  }
}
