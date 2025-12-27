// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import type { CookieOptions } from "@supabase/ssr";

// Singleton global
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

export function createClient() {
  // Se já existe, retorna a instância
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL não configurado");
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurado");
  }

  if (!supabaseAnonKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado");
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado");
  }

  supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];

        const allCookies = document.cookie.split("; ");
        return allCookies.map((cookie) => {
          const [name, ...rest] = cookie.split("=");
          const value = rest.join("=");
          return { name, value };
        });
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
      ) {
        if (typeof document === "undefined") return;

        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = options
            ? Object.entries(options)
                .map(([key, val]) => {
                  if (val === true) return key;
                  if (val === false || val === undefined || val === null)
                    return "";
                  return `${key}=${val}`;
                })
                .filter(Boolean)
                .join("; ")
            : "";

          document.cookie = `${name}=${encodeURIComponent(
            value
          )}; ${cookieOptions}`;
        });
      },
    },
  });

  return supabaseClient;
}

// Helper para verificar se estamos no navegador
export const isBrowser = typeof window !== "undefined";

// Helper para obter cliente de forma segura
export function getClient() {
  if (!isBrowser) {
    throw new Error("Este cliente só pode ser usado no navegador");
  }
  return createClient();
}

// Para compatibilidade com código existente que usa "supabase"
export const supabase = createClient();
