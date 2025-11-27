import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

// Extender a interface Window para incluir a propriedade supabase
declare global {
  interface Window {
    supabase?: SupabaseClient;
  }
}

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variáveis de ambiente do Supabase não configuradas");
    throw new Error("Variáveis de ambiente do Supabase não configuradas");
  }

  console.log("✅ Criando Supabase client com URL:", supabaseUrl);

  const client = createBrowserClient(supabaseUrl, supabaseKey);

  // Adicionar ao window para debug (apenas desenvolvimento)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    window.supabase = client;
  }

  return client;
};
