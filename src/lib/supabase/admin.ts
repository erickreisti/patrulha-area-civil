// lib/supabase/admin.ts - COM VALIDAÇÃO
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validação rigorosa
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não está definido");
  }

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não está definido");
  }

  // Verificar se a URL do Supabase é válida
  if (
    !supabaseUrl.startsWith("https://") ||
    !supabaseUrl.includes(".supabase.co")
  ) {
    throw new Error("URL do Supabase inválida");
  }

  // Verificar se a Service Role Key não é pública
  if (supabaseServiceKey.includes("_publishable_")) {
    throw new Error("Não use a chave pública como Service Role Key");
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "pac-admin-client",
        "X-Env": process.env.NODE_ENV || "development",
      },
    },
  });
}
