"use server";

import { createServerClient } from "@/lib/supabase/server";
import { eventSchema, type EventType } from "@/lib/schemas/events";
import { revalidatePath } from "next/cache";

// --- CRIAR EVENTO ---
export async function createEvent(data: Omit<EventType, "id">) {
  const supabase = await createServerClient();

  // Validamos sem o ID, pois o banco gera automaticamente
  const createSchema = eventSchema.omit({ id: true });

  const validation = createSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Dados inválidos." };
  }

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("events" as any)
    .insert(validation.data);

  if (error) {
    console.error("Erro ao criar evento:", error);
    return { success: false, error: "Erro ao salvar no banco." };
  }

  // Revalida o cache para atualizar a lista imediatamente
  revalidatePath("/admin/eventos"); // Painel Admin
  revalidatePath("/calendario"); // Calendário Público
  return { success: true };
}

// --- ATUALIZAR EVENTO ---
export async function updateEvent(data: EventType) {
  const supabase = await createServerClient();

  const validation = eventSchema.safeParse(data);
  if (!validation.success) return { success: false, error: "Dados inválidos" };

  // Removemos o ID do objeto de update para não tentar alterar a Primary Key (embora o Supabase ignore)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...updateData } = validation.data;

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("events" as any)
    .update(updateData)
    .eq("id", data.id);

  if (error) {
    console.error("Erro ao atualizar evento:", error);
    return { success: false, error: "Erro ao atualizar." };
  }

  revalidatePath("/admin/eventos");
  revalidatePath("/calendario");
  return { success: true };
}

// --- DELETAR EVENTO ---
export async function deleteEvent(id: string) {
  const supabase = await createServerClient();

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("events" as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar evento:", error);
    return { success: false, error: "Erro ao excluir." };
  }

  revalidatePath("/admin/eventos");
  revalidatePath("/calendario");
  return { success: true };
}

// --- BUSCAR UM EVENTO (Para Edição) ---
export async function getEventById(id: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("events" as any)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar evento por ID:", error);
    return null;
  }

  return data as unknown as EventType;
}
