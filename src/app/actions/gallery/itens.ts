"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GaleriaItemUpdate } from "@/lib/supabase/types";
import {
  CreateItemSchema,
  UpdateItemSchema,
  Item,
  TipoItemFilter,
  StatusFilter,
} from "./types";
import { verifyAdminSession, generateSlug, logActivity } from "./shared";

interface AdminItemFilters {
  search?: string;
  tipo?: TipoItemFilter;
  categoria_id?: string;
  status?: StatusFilter;
  page?: number;
  limit?: number;
}

// ==========================================
// CREATE (Upload & Insert)
// ==========================================
export async function createItem(formData: FormData) {
  try {
    const session = await verifyAdminSession();
    if (!session.success) {
      return { success: false, error: "Sessão inválida ou expirada." };
    }

    const catId = formData.get("categoria_id");
    const validCatId =
      catId && catId !== "null" && catId !== "" ? catId.toString() : null;

    const rawData = {
      titulo: formData.get("titulo"),
      descricao: formData.get("descricao"),
      tipo: formData.get("tipo"),
      categoria_id: validCatId,
      ordem: Number(formData.get("ordem")),
      status: formData.get("status") === "true",
      destaque: formData.get("destaque") === "true",
      arquivo_url: "http://temp.com",
    };

    const validatedFields = CreateItemSchema.safeParse(rawData);

    if (!validatedFields.success) {
      console.error("Erro validação Zod:", validatedFields.error.flatten());
      return { success: false, error: "Dados inválidos. Verifique os campos." };
    }

    const { titulo, descricao, tipo, categoria_id, ordem, status, destaque } =
      validatedFields.data;

    const file = formData.get("arquivo_file") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "Arquivo principal obrigatório." };
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();

    const slug = await generateSlug(titulo);
    const fileName = `${Date.now()}_${slug}.${fileExt}`;

    const bucketName = tipo === "foto" ? "galeria-fotos" : "galeria-videos";
    const supabaseAdmin = createAdminClient();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro Upload Storage:", uploadError);
      return {
        success: false,
        error: `Erro no upload: ${uploadError.message}`,
      };
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const finalArquivoUrl = publicUrlData.publicUrl;
    let finalThumbnailUrl = null;

    const thumbFile = formData.get("thumbnail_file") as File;
    if (thumbFile && thumbFile.size > 0) {
      const thumbBuffer = Buffer.from(await thumbFile.arrayBuffer());
      const thumbName = `thumb_${fileName.split(".")[0]}.jpg`;

      const { error: thumbError } = await supabaseAdmin.storage
        .from("galeria-fotos")
        .upload(thumbName, thumbBuffer, {
          contentType: thumbFile.type,
          upsert: false,
        });

      if (!thumbError) {
        const { data: thumbUrlData } = supabaseAdmin.storage
          .from("galeria-fotos")
          .getPublicUrl(thumbName);
        finalThumbnailUrl = thumbUrlData.publicUrl;
      }
    }

    const { data: newItem, error: dbError } = await supabaseAdmin
      .from("galeria_itens")
      .insert({
        titulo,
        descricao,
        tipo,
        categoria_id,
        ordem,
        status,
        destaque,
        arquivo_url: finalArquivoUrl,
        thumbnail_url: finalThumbnailUrl,
        autor_id: session.userId,
        views: 0,
      })
      .select()
      .single();

    if (dbError) {
      await supabaseAdmin.storage.from(bucketName).remove([fileName]);
      console.error("Erro DB Insert:", dbError);
      return {
        success: false,
        error: `Erro ao salvar no banco: ${dbError.message}`,
      };
    }

    await logActivity(
      supabaseAdmin,
      session.userId || "sistema",
      "criar_item_galeria",
      `Criou item: ${titulo}`,
      "galeria_itens",
      newItem.id,
    );

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");

    return { success: true, data: newItem };
  } catch (error) {
    console.error("Erro fatal createItem:", error);
    return { success: false, error: "Erro interno no servidor." };
  }
}

// ==========================================
// READ (Admin List)
// ==========================================
export async function getItensAdmin(filtros: AdminItemFilters = {}) {
  try {
    const supabaseAdmin = createAdminClient();

    const page = filtros.page || 1;
    const limit = filtros.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin.from("galeria_itens").select(
      `
        *,
        galeria_categorias (id, nome, slug, tipo)
      `,
      { count: "exact" },
    );

    if (filtros.search) {
      query = query.ilike("titulo", `%${filtros.search}%`);
    }
    if (filtros.tipo && filtros.tipo !== "all") {
      query = query.eq("tipo", filtros.tipo);
    }
    if (filtros.categoria_id && filtros.categoria_id !== "all") {
      query = query.eq("categoria_id", filtros.categoria_id);
    }
    if (filtros.status && filtros.status !== "all") {
      query = query.eq("status", filtros.status === "ativo");
    }

    query = query
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    query = query.range(from, to);

    const { data, error, count } = await query;

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
  } catch (error) {
    console.error("Erro getItensAdmin:", error);
    return { success: false, error: "Erro ao buscar itens" };
  }
}

// ==========================================
// GET BY ID
// ==========================================
export async function getItemById(id: string) {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("galeria_itens")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return { success: false, error: "Item não encontrado" };
    return { success: true, data: data as Item };
  } catch {
    return { success: false, error: "Erro ao buscar item" };
  }
}

// ==========================================
// UPDATE
// ==========================================
export async function updateItem(id: string, formData: FormData) {
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: "Sem permissão" };

    const catId = formData.get("categoria_id");
    const validCatId =
      catId && catId !== "null" && catId !== "" ? catId.toString() : null;

    const rawData = {
      id,
      titulo: formData.get("titulo"),
      descricao: formData.get("descricao"),
      tipo: formData.get("tipo"),
      categoria_id: validCatId,
      ordem: Number(formData.get("ordem")),
      status: formData.get("status") === "true",
      destaque: formData.get("destaque") === "true",
    };

    const validated = UpdateItemSchema.safeParse(rawData);
    if (!validated.success) {
      console.error("Zod Validation Error:", validated.error.flatten());
      return {
        success: false,
        error: "Dados inválidos enviadados para atualização.",
      };
    }

    const updates = validated.data;
    const supabaseAdmin = createAdminClient();

    const newFile = formData.get("arquivo_file") as File;
    const newThumb = formData.get("thumbnail_file") as File;
    const tipo = formData.get("tipo") as string;

    // ✅ CORREÇÃO: Removido 'updated_at' pois a coluna não existe no banco
    const updatePayload: GaleriaItemUpdate = {
      ...updates,
      // updated_at: new Date().toISOString() // <-- LINHA REMOVIDA
    };

    // 1. Upload de novo arquivo principal
    if (newFile && newFile.size > 0) {
      const fileBuffer = Buffer.from(await newFile.arrayBuffer());
      const fileExt = newFile.name.split(".").pop();
      const slug = await generateSlug(updates.titulo || "edit");
      const fileName = `${Date.now()}_${slug}.${fileExt}`;
      const bucketName = tipo === "foto" ? "galeria-fotos" : "galeria-videos";

      const { error: upErr } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, { contentType: newFile.type });
      if (!upErr) {
        const { data: pub } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        updatePayload.arquivo_url = pub.publicUrl;
      } else {
        console.error("Erro upload update:", upErr);
      }
    }

    // 2. Upload de nova thumbnail
    if (newThumb && newThumb.size > 0) {
      const thumbBuffer = Buffer.from(await newThumb.arrayBuffer());
      const thumbName = `thumb_edit_${Date.now()}.jpg`;
      const { error: tErr } = await supabaseAdmin.storage
        .from("galeria-fotos")
        .upload(thumbName, thumbBuffer, { contentType: newThumb.type });
      if (!tErr) {
        const { data: pubT } = supabaseAdmin.storage
          .from("galeria-fotos")
          .getPublicUrl(thumbName);
        updatePayload.thumbnail_url = pubT.publicUrl;
      }
    }

    // 3. Update no Banco
    console.log("🛠️ Tentando atualizar DB com payload:", updatePayload);

    const { error: dbError } = await supabaseAdmin
      .from("galeria_itens")
      .update(updatePayload)
      .eq("id", id);

    if (dbError) {
      console.error("❌ ERRO CRÍTICO SUPABASE:", dbError);
      return { success: false, error: `Erro Banco: ${dbError.message}` };
    }

    await logActivity(
      supabaseAdmin,
      session.userId!,
      "editar_item",
      `Editou: ${updates.titulo}`,
      "galeria_itens",
      id,
    );
    revalidatePath("/admin/galeria");
    return { success: true };
  } catch (error) {
    console.error("🔥 Erro update (Catch):", error);
    return { success: false, error: "Erro interno não tratado." };
  }
}

// ==========================================
// DELETE
// ==========================================
export async function deleteItem(id: string) {
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: "Sem permissão" };

    const supabaseAdmin = createAdminClient();

    const { data: item, error: fetchError } = await supabaseAdmin
      .from("galeria_itens")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !item)
      return { success: false, error: "Item não encontrado" };

    const bucketName =
      item.tipo === "foto" ? "galeria-fotos" : "galeria-videos";

    const extractPath = (url: string) => {
      try {
        const parts = url.split(`${bucketName}/`);
        return parts.length > 1 ? parts[1] : null;
      } catch {
        return null;
      }
    };

    const mainFilePath = extractPath(item.arquivo_url);

    if (mainFilePath) {
      await supabaseAdmin.storage.from(bucketName).remove([mainFilePath]);
    }

    if (item.thumbnail_url) {
      const thumbPathParts = item.thumbnail_url.split("galeria-fotos/");
      if (thumbPathParts.length > 1) {
        await supabaseAdmin.storage
          .from("galeria-fotos")
          .remove([thumbPathParts[1]]);
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("galeria_itens")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    await logActivity(
      supabaseAdmin,
      session.userId || "sistema",
      "excluir_item",
      `Excluiu item ID: ${id}`,
      "galeria_itens",
      id,
    );

    revalidatePath("/admin/galeria");
    return { success: true };
  } catch (error) {
    console.error("Erro deleteItem:", error);
    return { success: false, error: "Erro ao excluir item" };
  }
}

// ==========================================
// PUBLIC READ
// ==========================================
export async function getPublicItens(limit = 6) {
  const supabaseAdmin = createAdminClient();

  const { data } = await supabaseAdmin
    .from("galeria_itens")
    .select(`*, galeria_categorias(nome, slug)`)
    .eq("status", true)
    .order("destaque", { ascending: false })
    .order("ordem", { ascending: true })
    .limit(limit);

  return { success: true, data: data as Item[] };
}

export async function getItensPorCategoria(categoriaSlug: string) {
  const supabaseAdmin = createAdminClient();

  const { data: cat } = await supabaseAdmin
    .from("galeria_categorias")
    .select("id, nome")
    .eq("slug", categoriaSlug)
    .single();

  if (!cat) return { success: false, data: [] };

  const { data } = await supabaseAdmin
    .from("galeria_itens")
    .select("*")
    .eq("categoria_id", cat.id)
    .eq("status", true)
    .order("ordem", { ascending: true });

  return { success: true, data: data as Item[], categoria: cat };
}

// ==========================================
// STUBS
// ==========================================
export async function toggleItemStatus() {
  return { success: false };
}
export async function toggleItemDestaque() {
  return { success: false };
}
