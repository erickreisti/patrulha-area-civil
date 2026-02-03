"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type SupabaseClient } from "@supabase/supabase-js";
import { type Database } from "@/lib/supabase/types";
import {
  verifyAdminSession,
  logActivity,
  generateSlug,
  validateSlug,
} from "./shared";
import {
  CreateCategoriaSchema,
  UpdateCategoriaSchema,
  ListCategoriasSchema,
  type CreateCategoriaInput,
  type UpdateCategoriaInput,
  type Categoria,
  type CategoriasListResponse,
} from "./types";

type AdminClient = SupabaseClient<Database>;

async function getItensCountByCategoria(
  client: AdminClient,
  categoriaId: string,
): Promise<number> {
  const { count } = await client
    .from("galeria_itens")
    .select("*", { count: "exact", head: true })
    .eq("categoria_id", categoriaId);
  return count || 0;
}

// ... createCategoria, updateCategoria, deleteCategoria, getCategoriasAdmin (JÁ EXISTENTES - MANTENHA IGUAL) ...
// Estou omitindo as funções que já estavam corretas para focar no que faltava.
// MANTENHA AS OUTRAS FUNÇÕES AQUI.

export async function createCategoria(input: CreateCategoriaInput): Promise<{
  success: boolean;
  data?: Categoria;
  error?: string;
}> {
  // ... código existente ...
  // (Copie da resposta anterior)
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    const validated = CreateCategoriaSchema.parse(input);
    const slugCheck = await validateSlug(validated.slug);
    if (!slugCheck.valid) return { success: false, error: slugCheck.error };

    const adminClient = await getAdminClient();

    const { data: existing } = await adminClient
      .from("galeria_categorias")
      .select("id")
      .eq("slug", validated.slug)
      .single();

    if (existing) return { success: false, error: "Slug já existe." };

    const insertData = {
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newCategoria, error } = await adminClient
      .from("galeria_categorias")
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await logActivity(
      adminClient,
      session.userId!,
      "categoria_created",
      `Categoria ${newCategoria.nome} criada`,
      "galeria_categoria",
      newCategoria.id,
    );

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");

    return { success: true, data: { ...newCategoria, itens_count: 0 } };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Erro de validação" };
    }
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function updateCategoria(
  id: string,
  input: Partial<UpdateCategoriaInput>,
): Promise<{ success: boolean; data?: Categoria; error?: string }> {
  // ... código existente ...
  // (Copie da resposta anterior)
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _ignoredId, ...updateFields } = input;
    const validated = UpdateCategoriaSchema.partial().parse(updateFields);

    const adminClient = await getAdminClient();

    if (validated.slug) {
      const { data: existing } = await adminClient
        .from("galeria_categorias")
        .select("id")
        .eq("slug", validated.slug)
        .neq("id", id)
        .single();
      if (existing)
        return { success: false, error: "Slug em uso por outra categoria." };
    }

    const updateData = { ...validated, updated_at: new Date().toISOString() };

    const { data: updated, error } = await adminClient
      .from("galeria_categorias")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await logActivity(
      adminClient,
      session.userId!,
      "categoria_updated",
      `Categoria ${updated.nome} atualizada`,
      "galeria_categoria",
      id,
    );

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");

    const count = await getItensCountByCategoria(adminClient, id);

    return { success: true, data: { ...updated, itens_count: count } };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function deleteCategoria(id: string) {
  // ... código existente ...
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    const adminClient = await getAdminClient();

    const count = await getItensCountByCategoria(adminClient, id);
    if (count > 0)
      return { success: false, error: `Categoria possui ${count} itens.` };

    const { error } = await adminClient
      .from("galeria_categorias")
      .delete()
      .eq("id", id);
    if (error) throw error;

    await logActivity(
      adminClient,
      session.userId!,
      "categoria_deleted",
      "Categoria excluída",
      "galeria_categoria",
      id,
    );

    revalidatePath("/admin/galeria");
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function getCategoriasAdmin(
  filters?: Partial<z.infer<typeof ListCategoriasSchema>>,
): Promise<CategoriasListResponse> {
  // ... código existente ...
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    const { search, tipo, status, arquivada, page, limit } =
      ListCategoriasSchema.parse(filters || {});

    const offset = (page - 1) * limit;
    const adminClient = await getAdminClient();

    let query = adminClient
      .from("galeria_categorias")
      .select("*", { count: "exact" });

    if (search) query = query.ilike("nome", `%${search}%`);
    if (tipo !== "all") query = query.eq("tipo", tipo);
    if (status !== "all") query = query.eq("status", status === "ativo");
    if (arquivada !== "all")
      query = query.eq("arquivada", arquivada === "true");

    const { data, error, count } = await query
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const dataWithCounts = await Promise.all(
      (data || []).map(async (cat) => ({
        ...cat,
        itens_count: await getItensCountByCategoria(adminClient, cat.id),
      })),
    );

    return {
      success: true,
      data: dataWithCounts,
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

// ✅ ADICIONADO: getCategoriaById
export async function getCategoriaById(
  id: string,
): Promise<{ success: boolean; data?: Categoria; error?: string }> {
  try {
    const session = await verifyAdminSession();
    if (!session.success) return { success: false, error: session.error };

    const adminClient = await getAdminClient();
    const { data, error } = await adminClient
      .from("galeria_categorias")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return { success: false, error: "Categoria não encontrada" };

    const count = await getItensCountByCategoria(adminClient, data.id);
    return { success: true, data: { ...data, itens_count: count } };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function toggleCategoriaStatus(
  id: string,
  currentStatus: boolean,
) {
  return updateCategoria(id, { status: !currentStatus });
}

export async function getCategoriaPorSlug(slug: string) {
  const client = await getAdminClient();
  const { data, error } = await client
    .from("galeria_categorias")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data)
    return { success: false, error: "Categoria não encontrada" };

  const count = await getItensCountByCategoria(client, data.id);
  return { success: true, data: { ...data, itens_count: count } };
}

export async function generateAvailableSlug(nome: string) {
  return { success: true, slug: await generateSlug(nome) };
}
