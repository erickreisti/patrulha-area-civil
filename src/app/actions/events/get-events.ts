"use server";

import { createServerClient } from "@/lib/supabase/server";
import { eventSchema, type EventType } from "@/lib/schemas/events";
import { z } from "zod";

export async function getEvents(): Promise<{
  success: boolean;
  data: EventType[];
  error?: string;
}> {
  const supabase = await createServerClient();

  try {
    // OBS: O cast "as any" é necessário porque a tabela 'events'
    // ainda não existe no arquivo de tipos gerado automaticamente pelo Supabase.
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("events" as any)
      .select("*")
      .order("start_date", { ascending: true }); // Ordena por data mais próxima

    if (error) {
      console.error("Erro Supabase:", error);
      throw new Error("Erro ao buscar eventos no banco de dados.");
    }

    // Validação Segura com Zod
    // Isso garante que, mesmo burlando a tipagem do banco acima,
    // os dados que saem daqui estão estritamente tipados como EventType.
    const validation = z.array(eventSchema).safeParse(data);

    if (!validation.success) {
      console.error("Erro de validação de schema:", validation.error);
      // Retornamos um array vazio em vez de erro para não quebrar a UI inteira
      return { success: false, data: [] };
    }

    return { success: true, data: validation.data };
  } catch (error) {
    console.error("Erro em getEvents:", error);
    return { success: false, data: [] };
  }
}
