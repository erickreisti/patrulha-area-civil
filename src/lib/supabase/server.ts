import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import type { CookieOptions } from "@supabase/ssr";

export async function createServerClient() {
  try {
    const cookieStore = await cookies();

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

    return createSupabaseServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Erro silencioso durante pré-renderização
            if (process.env.NODE_ENV === "development") {
              console.warn("⚠️ Erro ao definir cookies:", error);
            }
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao criar cliente do servidor:", error);
    throw new Error("Falha ao inicializar o cliente do servidor");
  }
}
