// lib/supabase/server.ts
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Versão que ACEITA cookies como parâmetro opcional
export async function createServerClient(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
): Promise<SupabaseClient<Database>> {
  try {
    // Se não fornecido, buscar cookies
    let cookieStoreToUse: Awaited<ReturnType<typeof cookies>>;

    if (cookieStore) {
      cookieStoreToUse = cookieStore;
    } else {
      cookieStoreToUse = await cookies();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurado");
    }

    if (!supabaseAnonKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado");
    }

    const supabase = createSupabaseServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStoreToUse.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStoreToUse.set(name, value, options)
              );
            } catch {
              // Erro silencioso durante pré-renderização
            }
          },
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );

    return supabase;
  } catch (error) {
    console.error("❌ Erro ao criar cliente do servidor:", error);
    throw new Error("Falha ao inicializar o cliente do servidor");
  }
}
