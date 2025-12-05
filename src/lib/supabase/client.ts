// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

// Definir o tipo correto para o cliente do browser
export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

// Extender a interface Window para debug
declare global {
  interface Window {
    supabase?: SupabaseBrowserClient;
  }
}

let supabaseClient: SupabaseBrowserClient | null = null;

export const createClient = (): SupabaseBrowserClient => {
  // Se já existe uma instância, retorne-a
  if (supabaseClient) {
    return supabaseClient;
  }

  // Verificar se está no cliente
  if (typeof window === "undefined") {
    throw new Error("createClient deve ser chamado apenas no lado do cliente");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variáveis de ambiente do Supabase não configuradas");
    throw new Error("Variáveis de ambiente do Supabase não configuradas");
  }

  console.log("✅ Criando Supabase client com URL:", supabaseUrl);

  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  // Adicionar ao window para debug (apenas desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    window.supabase = supabaseClient;
  }

  return supabaseClient;
};

// Função para limpar o cliente (útil para testes)
export const clearClient = (): void => {
  supabaseClient = null;
  if (typeof window !== "undefined") {
    delete window.supabase;
  }
};
