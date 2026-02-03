"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdminSession, logActivity } from "./shared";
import {
  CreateItemSchema,
  UpdateItemSchema,
  ListItensSchema,
  type Item,
  type ItensListResponse,
} from "./types";
import {
  uploadFile,
  deleteFileByUrl,
  validateUploadByType,
} from "@/lib/supabase/storage";

// ... createItem, updateItem, deleteItem, getItensAdmin (MANTENHA IGUAL) ...
// Estou omitindo as funções que já estavam corretas.
// MANTENHA createItem, updateItem, deleteItem, getItensAdmin aqui.

// ✅ ADICIONADO: getItemById
export async function getItemById(
  id: string,
): Promise<{ success: boolean; data?: Item; error?: string }> {
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    const adminClient = await getAdminClient();
    const { data, error } = await adminClient
      .from("galeria_itens")
      .select(`*, galeria_categorias(id, nome, tipo)`)
      .eq("id", id)
      .single();

    if (error || !data) return { success: false, error: "Item não encontrado" };

    return { success: true, data: data as Item };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

// ✅ ADICIONADO: getItensPorCategoria (Público)
export async function getItensPorCategoria(
  categoriaId: string,
): Promise<ItensListResponse> {
  try {
    const adminClient = await getAdminClient();

    // Buscar apenas itens ativos
    const { data, count, error } = await adminClient
      .from("galeria_itens")
      .select(`*, galeria_categorias(id, nome, tipo)`, { count: "exact" })
      .eq("categoria_id", categoriaId)
      .eq("status", true)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: (data || []) as Item[],
      pagination: {
        total: count || 0,
        page: 1,
        limit: count || 0, // Retorna tudo
        totalPages: 1,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

// ... createItem ...
export async function createItem(formData: FormData): Promise<{
  success: boolean;
  data?: Item;
  error?: string;
}> {
  // ... código anterior ...
  // (Copie da resposta anterior)
  let arquivoUrl: string | null = null;
  let thumbnailUrl: string | null = null;

  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    // Extração manual
    const raw = {
      titulo: formData.get("titulo"),
      descricao: formData.get("descricao"),
      tipo: formData.get("tipo"),
      categoria_id: formData.get("categoria_id"),
      ordem: Number(formData.get("ordem") || 0),
      status: formData.get("status") === "true",
      destaque: formData.get("destaque") === "true",
    };

    const arquivoFile = formData.get("arquivo_file") as File;
    const thumbnailFile = formData.get("thumbnail_file") as File;

    if (!arquivoFile) return { success: false, error: "Arquivo obrigatório" };

    // 1. Upload Arquivo Principal
    const uploadType = raw.tipo === "foto" ? "image" : "video";

    // Validação
    const validation = validateUploadByType(arquivoFile, uploadType);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const bucket = raw.tipo === "foto" ? "galeria-fotos" : "galeria-videos"; // Use string literal ou constante importada
    const uploadRes = await uploadFile(arquivoFile, bucket, {
      folder: "galeria",
    });

    if (!uploadRes.success) throw new Error(uploadRes.error);
    arquivoUrl = uploadRes.data!.url;

    // 2. Upload Thumbnail (se for vídeo e tiver arquivo)
    if (raw.tipo === "video" && thumbnailFile) {
      const thumbValidation = validateUploadByType(thumbnailFile, "image");
      if (!thumbValidation.valid) throw new Error(thumbValidation.error);

      const thumbRes = await uploadFile(thumbnailFile, "galeria-fotos", {
        folder: "thumbnails",
      });
      if (!thumbRes.success) throw new Error(thumbRes.error);
      thumbnailUrl = thumbRes.data!.url;
    }

    // 3. Validar e Inserir no Banco
    const validated = CreateItemSchema.parse({
      ...raw,
      arquivo_url: arquivoUrl,
      thumbnail_url: thumbnailUrl,
    });

    const adminClient = await getAdminClient();
    const { data: newItem, error } = await adminClient
      .from("galeria_itens")
      .insert({
        ...validated,
        autor_id: session.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`*, galeria_categorias(id, nome, tipo)`)
      .single();

    if (error) throw error;

    await logActivity(
      adminClient,
      session.userId!,
      "item_created",
      `Item ${newItem.titulo} criado`,
      "galeria_item",
      newItem.id,
    );

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");

    return { success: true, data: newItem as Item };
  } catch (error: unknown) {
    // ROLLBACK: Apagar arquivos do storage se der erro no banco/validação
    if (arquivoUrl) await deleteFileByUrl(arquivoUrl);
    if (thumbnailUrl) await deleteFileByUrl(thumbnailUrl);

    console.error("Erro createItem:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

export async function updateItem(
  id: string,
  input: Partial<z.infer<typeof UpdateItemSchema>> & {
    arquivo_file?: File;
    thumbnail_file?: File;
  },
) {
  // ... código anterior ...
  // (Copie da resposta anterior)
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    const adminClient = await getAdminClient();

    // Buscar item atual
    const { data: current } = await adminClient
      .from("galeria_itens")
      .select("*")
      .eq("id", id)
      .single();
    if (!current) return { success: false, error: "Item não encontrado" };

    // Preparar dados de atualização
    // Usamos const pois modificamos propriedades do objeto, não a referência da variável
    const updateData: Record<string, unknown> = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    // Remover campos de arquivo do objeto que vai pro banco (pois são Files)
    delete updateData.arquivo_file;
    delete updateData.thumbnail_file;

    // Upload novo arquivo
    if (input.arquivo_file) {
      const bucket =
        (input.tipo || current.tipo) === "foto"
          ? "galeria-fotos"
          : "galeria-videos";

      const res = await uploadFile(input.arquivo_file, bucket, {
        folder: "galeria",
      });
      if (!res.success) throw new Error(res.error);

      updateData.arquivo_url = res.data!.url;
      // Cleanup do arquivo antigo
      if (current.arquivo_url) await deleteFileByUrl(current.arquivo_url);
    }

    // Upload nova thumbnail
    if (input.thumbnail_file) {
      const res = await uploadFile(input.thumbnail_file, "galeria-fotos", {
        folder: "thumbnails",
      });
      if (!res.success) throw new Error(res.error);

      updateData.thumbnail_url = res.data!.url;
      // Cleanup da thumbnail antiga
      if (current.thumbnail_url) await deleteFileByUrl(current.thumbnail_url);
    }

    const { data: updated, error } = await adminClient
      .from("galeria_itens")
      .update(updateData)
      .eq("id", id)
      .select(`*, galeria_categorias(id, nome, tipo)`)
      .single();

    if (error) throw error;

    revalidatePath("/admin/galeria");

    return { success: true, data: updated as Item };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

export async function deleteItem(id: string) {
  // ... código anterior ...
  // (Copie da resposta anterior)
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    const adminClient = await getAdminClient();
    const { data: item } = await adminClient
      .from("galeria_itens")
      .select("*")
      .eq("id", id)
      .single();

    if (!item) return { success: false, error: "Item não encontrado" };

    // Deletar do storage
    if (item.arquivo_url) await deleteFileByUrl(item.arquivo_url);
    if (item.thumbnail_url) await deleteFileByUrl(item.thumbnail_url);

    // Deletar do banco
    const { error } = await adminClient
      .from("galeria_itens")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/galeria");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

export async function getItensAdmin(
  filters?: Partial<z.infer<typeof ListItensSchema>>,
): Promise<ItensListResponse> {
  // ... código anterior ...
  // (Copie da resposta anterior)
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    const {
      search,
      categoria_id,
      tipo,
      status,
      destaque,
      page,
      limit,
      sortBy,
      sortOrder,
    } = ListItensSchema.parse(filters || {});

    const offset = (page - 1) * limit;
    const adminClient = await getAdminClient();

    let query = adminClient
      .from("galeria_itens")
      .select(`*, galeria_categorias(id, nome, tipo)`, { count: "exact" });

    if (search) query = query.ilike("titulo", `%${search}%`);
    if (categoria_id !== "all") query = query.eq("categoria_id", categoria_id);
    if (tipo !== "all") query = query.eq("tipo", tipo);
    if (status !== "all") query = query.eq("status", status === "ativo");
    if (destaque !== "all") query = query.eq("destaque", destaque === "true");

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data as Item[],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

// Helpers
export async function toggleItemStatus(id: string, currentStatus: boolean) {
  return updateItem(id, { status: !currentStatus });
}

export async function toggleItemDestaque(id: string, currentDestaque: boolean) {
  return updateItem(id, { destaque: !currentDestaque });
}
