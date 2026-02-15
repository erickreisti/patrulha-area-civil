"use server";

import { createServerClient } from "@/lib/supabase/server";
import { eventSchema, type EventType } from "@/lib/schemas/events";
import { revalidatePath } from "next/cache";

// --- CRIAR EVENTO ---
export async function createEvent(data: Omit<EventType, "id">) {
  const supabase = await createServerClient();

  // CORREÇÃO 1: Criamos um schema temporário sem o ID para validar a criação
  // Se usarmos eventSchema.safeParse(data) direto, vai falhar porque 'id' é obrigatório lá
  const createSchema = eventSchema.omit({ id: true });

  const validation = createSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Dados inválidos." };
  }

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("events" as any)
    .insert(validation.data); // Usamos o dado validado

  if (error) {
    console.error("Erro ao criar evento:", error);
    return { success: false, error: "Erro ao salvar no banco." };
  }

  // CORREÇÃO 2: Atualizar para o nome novo da rota (/eventos)
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  return { success: true };
}

// --- ATUALIZAR EVENTO ---
export async function updateEvent(data: EventType) {
  const supabase = await createServerClient();

  const validation = eventSchema.safeParse(data);
  if (!validation.success) return { success: false, error: "Dados inválidos" };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...updateData } = validation.data;

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("events" as any)
    .update(updateData)
    .eq("id", data.id);

  if (error) {
    console.error(error);
    return { success: false, error: "Erro ao atualizar." };
  }

  // CORREÇÃO 2: Rotas atualizadas
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
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
    return { success: false, error: "Erro ao excluir." };
  }

  // CORREÇÃO 2: Rotas atualizadas
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
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

  if (error || !data) return null;

  return data as unknown as EventType;
}
