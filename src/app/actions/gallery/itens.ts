"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type SupabaseClient } from "@supabase/supabase-js";
import {
  type Database,
  type GaleriaItemInsert,
  type GaleriaItemUpdate,
} from "@/lib/supabase/types";
import { logActivity } from "./shared";
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

// ==========================================
// HELPERS
// ==========================================

async function getTypedAdminClient() {
  return (await getAdminClient()) as SupabaseClient<Database>;
}

async function checkAdminPermission() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const adminClient = await getTypedAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") return { success: true, userId: user.id };
  }

  const hasAdminCookie =
    cookieStore.has("is_admin") || cookieStore.has("admin_session");

  if (hasAdminCookie) {
    const adminClient = await getTypedAdminClient();
    const { data: sysAdmin } = await adminClient
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();
    return { success: true, userId: sysAdmin?.id || "system" };
  }

  return { success: false, error: "Acesso negado." };
}

// ==========================================
// ACTIONS DE LEITURA
// ==========================================

export async function getPublicItens(
  categoriaSlug?: string,
  limit = 12,
  page = 1,
): Promise<ItensListResponse> {
  try {
    const adminClient = await getTypedAdminClient();
    const offset = (page - 1) * limit;

    let query = adminClient
      .from("galeria_itens")
      .select("*, galeria_categorias!inner(id, slug, nome, tipo)", {
        count: "exact",
      })
      .eq("status", true);

    if (categoriaSlug && categoriaSlug !== "all") {
      query = query.eq("galeria_categorias.slug", categoriaSlug);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data as unknown as Item[],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function getItensPorCategoria(
  categoriaId: string,
): Promise<ItensListResponse> {
  try {
    const adminClient = await getTypedAdminClient();
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
      data: (data || []) as unknown as Item[],
      pagination: {
        total: count || 0,
        page: 1,
        limit: count || 0,
        totalPages: 1,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function getItemById(
  id: string,
): Promise<{ success: boolean; data?: Item; error?: string }> {
  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

    const adminClient = await getTypedAdminClient();
    const { data, error } = await adminClient
      .from("galeria_itens")
      .select(`*, galeria_categorias(id, nome, tipo)`)
      .eq("id", id)
      .single();

    if (error || !data) return { success: false, error: "Item não encontrado" };
    return { success: true, data: data as unknown as Item };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function getItensAdmin(
  filters?: Partial<z.infer<typeof ListItensSchema>>,
): Promise<ItensListResponse> {
  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

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
    const adminClient = await getTypedAdminClient();

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
      data: data as unknown as Item[],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

// ==========================================
// ACTIONS DE ESCRITA
// ==========================================

export async function createItem(
  formData: FormData,
): Promise<{ success: boolean; data?: Item; error?: string }> {
  let arquivoUrl: string | null = null;
  let thumbnailUrl: string | null = null;

  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

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

    const uploadType = raw.tipo === "foto" ? "image" : "video";
    const validation = validateUploadByType(arquivoFile, uploadType);
    if (!validation.valid) return { success: false, error: validation.error };

    const bucket = raw.tipo === "foto" ? "galeria-fotos" : "galeria-videos";
    const uploadRes = await uploadFile(arquivoFile, bucket, {
      folder: "galeria",
    });

    if (!uploadRes.success) throw new Error(uploadRes.error);
    arquivoUrl = uploadRes.data!.url;

    if (raw.tipo === "video" && thumbnailFile) {
      const thumbValidation = validateUploadByType(thumbnailFile, "image");
      if (!thumbValidation.valid) throw new Error(thumbValidation.error);

      const thumbRes = await uploadFile(thumbnailFile, "galeria-fotos", {
        folder: "thumbnails",
      });
      if (!thumbRes.success) throw new Error(thumbRes.error);
      thumbnailUrl = thumbRes.data!.url;
    }

    const validated = CreateItemSchema.parse({
      ...raw,
      arquivo_url: arquivoUrl,
      thumbnail_url: thumbnailUrl,
    });

    const adminClient = await getTypedAdminClient();

    // Objeto tipado para Insert
    const insertData: GaleriaItemInsert = {
      titulo: validated.titulo,
      descricao: validated.descricao || null,
      tipo: validated.tipo,
      categoria_id: validated.categoria_id,
      ordem: validated.ordem,
      status: validated.status,
      destaque: validated.destaque,
      arquivo_url: validated.arquivo_url,
      thumbnail_url: validated.thumbnail_url || null,
      autor_id: auth.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newItem, error } = await adminClient
      .from("galeria_itens")
      .insert(insertData)
      .select(`*, galeria_categorias(id, nome, tipo)`)
      .single();

    if (error) throw error;

    await logActivity(
      adminClient,
      auth.userId!,
      "item_created",
      `Item ${newItem.titulo} criado`,
      "galeria_item",
      newItem.id,
    );

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");

    return { success: true, data: newItem as unknown as Item };
  } catch (error: unknown) {
    if (arquivoUrl) await deleteFileByUrl(arquivoUrl);
    if (thumbnailUrl) await deleteFileByUrl(thumbnailUrl);

    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function updateItem(
  id: string,
  input: Partial<z.infer<typeof UpdateItemSchema>> & {
    arquivo_file?: File;
    thumbnail_file?: File;
  },
) {
  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

    const adminClient = await getTypedAdminClient();

    const { data: current } = await adminClient
      .from("galeria_itens")
      .select("*")
      .eq("id", id)
      .single();

    if (!current) return { success: false, error: "Item não encontrado" };

    const updateData: GaleriaItemUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (input.titulo !== undefined) updateData.titulo = input.titulo;
    if (input.descricao !== undefined)
      updateData.descricao = input.descricao || null;
    if (input.categoria_id !== undefined)
      updateData.categoria_id = input.categoria_id;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.destaque !== undefined) updateData.destaque = input.destaque;
    if (input.ordem !== undefined) updateData.ordem = input.ordem;

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
      if (current.arquivo_url) await deleteFileByUrl(current.arquivo_url);
    }

    if (input.thumbnail_file) {
      const res = await uploadFile(input.thumbnail_file, "galeria-fotos", {
        folder: "thumbnails",
      });
      if (!res.success) throw new Error(res.error);

      updateData.thumbnail_url = res.data!.url;
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
    return { success: true, data: updated as unknown as Item };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function deleteItem(id: string) {
  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

    const adminClient = await getTypedAdminClient();
    const { data: item } = await adminClient
      .from("galeria_itens")
      .select("arquivo_url, thumbnail_url")
      .eq("id", id)
      .single();

    if (!item) return { success: false, error: "Item não encontrado" };

    if (item.arquivo_url) await deleteFileByUrl(item.arquivo_url);
    if (item.thumbnail_url) await deleteFileByUrl(item.thumbnail_url);

    const { error } = await adminClient
      .from("galeria_itens")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/galeria");
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function toggleItemStatus(id: string, currentStatus: boolean) {
  return updateItem(id, { status: !currentStatus });
}

export async function toggleItemDestaque(id: string, currentDestaque: boolean) {
  return updateItem(id, { destaque: !currentDestaque });
}
