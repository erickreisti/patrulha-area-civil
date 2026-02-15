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
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("events" as any)
      .select("*")
      .order("start_date", { ascending: true });

    if (error) throw new Error("Erro no Supabase");

    const validation = z.array(eventSchema).safeParse(data);

    if (!validation.success) {
      console.error(validation.error);
      return { success: false, data: [] };
    }

    return { success: true, data: validation.data };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}
