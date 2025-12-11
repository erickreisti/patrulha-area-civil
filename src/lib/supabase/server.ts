import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import type { CookieOptions } from "@supabase/ssr";
import { supabaseConfig } from "./config";

export async function createServerClient() {
  const cookieStore = cookies();

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
          } catch {
            // Ignore se chamado de Server Component
          }
        },
      },
      ...supabaseConfig,
    }
  );
}
