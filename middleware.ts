// middleware.ts - VERSÃO CORRIGIDA
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("🛡️ Middleware: Processando rota", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ Middleware: Erro de autenticação:", authError);
    }

    console.log("👤 Middleware: Usuário encontrado:", user?.id);

    // 🛡️ PROTEÇÃO DAS ROTAS DE ADMINISTRADOR
    if (request.nextUrl.pathname.startsWith("/admin")) {
      console.log("🛡️ Middleware: Protegendo rota admin...");

      if (!user) {
        console.log(
          "❌ Middleware: Usuário não autenticado, redirecionando para login"
        );
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Verificar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Middleware: Erro ao buscar perfil:", profileError);
        return NextResponse.redirect(new URL("/login", request.url));
      }

      console.log(
        "📊 Middleware: Perfil encontrado - Role:",
        profile?.role,
        "Status:",
        profile?.status
      );

      if (profile?.role !== "admin") {
        console.log("🚫 Middleware: Acesso negado - usuário não é admin");
        return NextResponse.redirect(new URL("/perfil", request.url)); // ✅ CORRIGIDO: /agent/perfil → /perfil
      }

      if (!profile?.status) {
        console.log("🚫 Middleware: Acesso negado - conta inativa");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      console.log("✅ Middleware: Acesso admin permitido");
    }

    // 🛡️ PROTEÇÃO DAS ROTAS DE AGENTE
    if (request.nextUrl.pathname.startsWith("/agent")) {
      console.log("🛡️ Middleware: Protegendo rota agent...");

      if (!user) {
        console.log(
          "❌ Middleware: Usuário não autenticado, redirecionando para login"
        );
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Verificar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Middleware: Erro ao buscar perfil:", profileError);
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (!profile?.status) {
        console.log("🚫 Middleware: Acesso negado - conta inativa");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      console.log("✅ Middleware: Acesso agent permitido");
    }

    // 🔄 REDIRECIONAMENTO PARA LOGIN
    if (request.nextUrl.pathname === "/login" && user) {
      console.log(
        "🔄 Middleware: Usuário logado acessando login, redirecionando..."
      );

      // Buscar perfil para redirecionamento correto
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // ✅ REDIRECIONAR PARA A ROTA CORRETA
      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/perfil", request.url)); // ✅ CORRIGIDO: /agent/perfil → /perfil
      }
    }

    // 🔄 REDIRECIONAMENTO DE ROTA RAIZ
    if (request.nextUrl.pathname === "/" && user) {
      console.log(
        "🔄 Middleware: Usuário logado acessando raiz, redirecionando..."
      );

      // Buscar perfil para redirecionamento correto
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/perfil", request.url)); // ✅ CORRIGIDO: /agent/perfil → /perfil
      }
    }
  } catch (error) {
    console.error("💥 Middleware: Erro inesperado:", error);
  }

  console.log("✅ Middleware: Processamento concluído");
  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/login", "/"],
};
