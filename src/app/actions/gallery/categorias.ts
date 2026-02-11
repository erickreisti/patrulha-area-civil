"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type SupabaseClient } from "@supabase/supabase-js";
import { type Database, type GaleriaCategoria } from "@/lib/supabase/types";
import { logActivity, generateSlug, validateSlug } from "./shared";
import {
  CreateCategoriaSchema,
  UpdateCategoriaSchema,
  ListCategoriasSchema,
  type CreateCategoriaInput,
  type UpdateCategoriaInput,
  type Categoria,
  type CategoriasListResponse,
} from "./types";

// ==========================================
// HELPERS
// ==========================================

// ✅ Tipo auxiliar para lidar com o retorno cru do Supabase com Join
type CategoriaRawDB = GaleriaCategoria & {
  itens: { count: number }[];
};

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

async function getItensCountByCategoria(
  client: SupabaseClient<Database>,
  categoriaId: string,
): Promise<number> {
  const { count } = await client
    .from("galeria_itens")
    .select("*", { count: "exact", head: true })
    .eq("categoria_id", categoriaId);
  return count || 0;
}

// ==========================================
// LEITURA
// ==========================================

export async function getPublicCategorias() {
  try {
    const adminClient = await getTypedAdminClient();

    const { data, error } = await adminClient
      .from("galeria_categorias")
      .select("*, itens:galeria_itens(count)")
      .eq("status", true)
      .eq("arquivada", false)
      .order("ordem", { ascending: true });

    if (error) throw error;

    const rawData = data as unknown as CategoriaRawDB[];

    const formattedData: Categoria[] = rawData.map((cat) => {
      const { itens, ...rest } = cat;
      return {
        ...rest,
        itens_count: itens?.[0]?.count || 0,
      };
    });

    return { success: true, data: formattedData };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function getCategoriaPorSlug(slug: string) {
  try {
    const adminClient = await getTypedAdminClient();
    const { data, error } = await adminClient
      .from("galeria_categorias")
      .select("*, itens:galeria_itens(count)")
      .eq("slug", slug)
      .single();

    if (error || !data)
      return { success: false, error: "Categoria não encontrada" };

    const rawData = data as unknown as CategoriaRawDB;
    const { itens, ...rest } = rawData;

    const formattedData: Categoria = {
      ...rest,
      itens_count: itens?.[0]?.count || 0,
    };

    return { success: true, data: formattedData };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function getCategoriasAdmin(
  filters?: Partial<z.infer<typeof ListCategoriasSchema>>,
): Promise<CategoriasListResponse> {
  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

    const { search, tipo, status, arquivada, page, limit } =
      ListCategoriasSchema.parse(filters || {});
    const offset = (page - 1) * limit;
    const adminClient = await getTypedAdminClient();

    let query = adminClient
      .from("galeria_categorias")
      .select("*, itens:galeria_itens(count)", { count: "exact" });

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

    const rawData = data as unknown as CategoriaRawDB[];

    const formattedData: Categoria[] = rawData.map((cat) => {
      const { itens, ...rest } = cat;
      return {
        ...rest,
        itens_count: itens?.[0]?.count || 0,
      };
    });

    return {
      success: true,
      data: formattedData,
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

export async function getCategoriaById(
  id: string,
): Promise<{ success: boolean; data?: Categoria; error?: string }> {
  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

    const adminClient = await getTypedAdminClient();
    const { data, error } = await adminClient
      .from("galeria_categorias")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return { success: false, error: "Categoria não encontrada" };

    const count = await getItensCountByCategoria(adminClient, data.id);
    return {
      success: true,
      data: { ...data, itens_count: count } as Categoria,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

// ==========================================
// ESCRITA
// ==========================================

export async function createCategoria(
  input: CreateCategoriaInput,
): Promise<{ success: boolean; data?: Categoria; error?: string }> {
  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

    const validated = CreateCategoriaSchema.parse(input);
    const slugCheck = await validateSlug(validated.slug);
    if (!slugCheck.valid) return { success: false, error: slugCheck.error };

    const adminClient = await getTypedAdminClient();

    const { data: existing } = await adminClient
      .from("galeria_categorias")
      .select("id")
      .eq("slug", validated.slug)
      .single();
    if (existing) return { success: false, error: "Slug já existe." };

    const { data: newCategoria, error } = await adminClient
      .from("galeria_categorias")
      .insert({
        ...validated,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(
      adminClient,
      auth.userId!,
      "categoria_created",
      `Categoria ${newCategoria.nome} criada`,
      "galeria_categoria",
      newCategoria.id,
    );

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");

    return {
      success: true,
      data: { ...newCategoria, itens_count: 0 } as Categoria,
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError)
      return { success: false, error: "Erro de validação" };
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function updateCategoria(
  id: string,
  input: Partial<UpdateCategoriaInput>,
): Promise<{ success: boolean; data?: Categoria; error?: string }> {
  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _ignoredId, ...updateFields } = input;
    const validated = UpdateCategoriaSchema.partial().parse(updateFields);
    const adminClient = await getTypedAdminClient();

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

    const { data: updated, error } = await adminClient
      .from("galeria_categorias")
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(
      adminClient,
      auth.userId!,
      "categoria_updated",
      `Categoria ${updated.nome} atualizada`,
      "galeria_categoria",
      id,
    );

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");

    const count = await getItensCountByCategoria(adminClient, id);
    return {
      success: true,
      data: { ...updated, itens_count: count } as Categoria,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function deleteCategoria(id: string) {
  try {
    const auth = await checkAdminPermission();
    if (!auth.success) return { success: false, error: auth.error };

    const adminClient = await getTypedAdminClient();

    const count = await getItensCountByCategoria(adminClient, id);
    if (count > 0)
      return {
        success: false,
        error: `Categoria possui ${count} itens. Esvazie-a antes.`,
      };

    const { error } = await adminClient
      .from("galeria_categorias")
      .delete()
      .eq("id", id);
    if (error) throw error;

    await logActivity(
      adminClient,
      auth.userId!,
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

export async function toggleCategoriaStatus(
  id: string,
  currentStatus: boolean,
) {
  return updateCategoria(id, { status: !currentStatus });
}

export async function generateAvailableSlug(nome: string) {
  return { success: true, slug: await generateSlug(nome) };
}
