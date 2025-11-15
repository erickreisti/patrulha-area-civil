// src/lib/supabase/client.ts - VERSÃO ROBUSTA
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
