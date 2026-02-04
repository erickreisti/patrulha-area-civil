"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "./shared";
import { type GaleriaStats } from "./types";

export async function getGaleriaStats(): Promise<{
  success: boolean;
  data?: GaleriaStats;
  error?: string;
}> {
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    const adminClient = await getAdminClient();

    // Executar todas as contagens em paralelo para performance máxima
    const [
      { count: total_categorias },
      { count: total_itens },
      { count: total_fotos },
      { count: total_videos },
      { count: itens_destaque },
      { count: categorias_ativas },
      { count: itens_ativos },
      { count: fotos_cat },
      { count: videos_cat },
    ] = await Promise.all([
      adminClient
        .from("galeria_categorias")
        .select("*", { count: "exact", head: true }),
      adminClient
        .from("galeria_itens")
        .select("*", { count: "exact", head: true }),
      adminClient
        .from("galeria_itens")
        .select("*", { count: "exact", head: true })
        .eq("tipo", "foto"),
      adminClient
        .from("galeria_itens")
        .select("*", { count: "exact", head: true })
        .eq("tipo", "video"),
      adminClient
        .from("galeria_itens")
        .select("*", { count: "exact", head: true })
        .eq("destaque", true),
      adminClient
        .from("galeria_categorias")
        .select("*", { count: "exact", head: true })
        .eq("status", true),
      adminClient
        .from("galeria_itens")
        .select("*", { count: "exact", head: true })
        .eq("status", true),
      adminClient
        .from("galeria_categorias")
        .select("*", { count: "exact", head: true })
        .eq("tipo", "fotos"),
      adminClient
        .from("galeria_categorias")
        .select("*", { count: "exact", head: true })
        .eq("tipo", "videos"),
    ]);

    return {
      success: true,
      data: {
        total_categorias: total_categorias || 0,
        total_itens: total_itens || 0,
        total_fotos: total_fotos || 0,
        total_videos: total_videos || 0,
        itens_destaque: itens_destaque || 0,
        categorias_ativas: categorias_ativas || 0,
        itens_ativos: itens_ativos || 0,
        categorias_por_tipo: {
          fotos: fotos_cat || 0,
          videos: videos_cat || 0,
        },
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro stats:", error);
    return { success: false, error: message };
  }
}
