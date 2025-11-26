import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    try {
      // Criar cliente Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        }
      );

      console.log("🔄 Processando código de autenticação...");

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("❌ Erro no callback de autenticação:", error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=auth_failed`
        );
      }

      console.log("✅ Autenticação bem-sucedida para:", data.user?.email);

      // Buscar perfil do usuário
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (!profileError && profile) {
          console.log("✅ Perfil carregado:", profile.full_name);
        }
      }
    } catch (error) {
      console.error("💥 Erro inesperado no callback:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=unexpected_error`
      );
    }
  } else {
    console.log("⚠️ Nenhum código recebido no callback");
  }

  return NextResponse.redirect(`${requestUrl.origin}/perfil`);
}
