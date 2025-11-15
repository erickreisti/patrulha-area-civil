import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variáveis de ambiente do Supabase não configuradas:");
    console.error("URL:", supabaseUrl);
    console.error(
      "KEY:",
      supabaseKey ? "***" + supabaseKey.slice(-4) : "undefined"
    );
    throw new Error("Variáveis de ambiente do Supabase não configuradas");
  }

  console.log("✅ Supabase Client criado com URL:", supabaseUrl);

  return createBrowserClient(supabaseUrl, supabaseKey);
};
