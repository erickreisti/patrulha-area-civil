"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

type LogoutSuccessResponse = {
  success: true;
  message: string;
};

type LogoutErrorResponse = {
  success: false;
  error: string;
};

type LogoutResponse = LogoutSuccessResponse | LogoutErrorResponse;

export async function logout(): Promise<LogoutResponse> {
  try {
    const supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Sign out do Supabase
    const { error } = await supabasePublic.auth.signOut();

    if (error) {
      console.error("Erro no logout:", error);
      return {
        success: false,
        error: error.message,
      } as LogoutErrorResponse;
    }

    // 2. Limpar cookies manualmente
    try {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();

      // Limpar cookies específicos do Supabase
      const supabaseCookies = allCookies.filter(
        (cookie) =>
          cookie.name.startsWith("sb-") ||
          cookie.name.startsWith("supabase-auth")
      );

      for (const cookie of supabaseCookies) {
        cookieStore.delete(cookie.name);
      }
    } catch (cookieError) {
      console.warn("Não foi possível limpar cookies:", cookieError);
      // Não falhar a operação principal se der erro nos cookies
    }

    // 3. Revalidar cache (opcional, pode ser removido se causar problemas)
    try {
      revalidatePath("/");
      revalidatePath("/dashboard");
      revalidatePath("/perfil");
    } catch (revalidateError) {
      console.warn("Erro ao revalidar cache:", revalidateError);
    }

    return {
      success: true,
      message: "Logout realizado com sucesso",
    } as LogoutSuccessResponse;
  } catch (error) {
    console.error("Erro em logout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro no logout",
    } as LogoutErrorResponse;
  }
}
