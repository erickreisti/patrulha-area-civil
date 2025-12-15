import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL não configurado");
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurado");
  }

  if (!supabaseServiceKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY não configurado");
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "X-Client-Info": "pac-admin",
      },
    },
  });
}

export async function getAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Admin client não deve ser usado no navegador");
  }
  return createAdminClient();
}
