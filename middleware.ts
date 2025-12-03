// middleware.ts - VERSÃO FINAL CORRIGIDA
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("🛡️ Middleware: Processando rota", pathname);

  // ⚠️ NÃO APLICAR MIDDLEWARE A ROTAS DE API
  if (pathname.startsWith("/api/")) {
    console.log("🔧 Middleware: Rota de API, permitindo acesso...");
    return NextResponse.next();
  }

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
          cookiesToSet.forEach(({ name, value }) =>
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
    if (pathname.startsWith("/admin")) {
      console.log("🛡️ Middleware: Protegendo rota admin...");

      if (!user) {
        console.log(
          "❌ Middleware: Usuário não autenticado, redirecionando para login"
        );
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
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
        return NextResponse.redirect(new URL("/perfil", request.url));
      }

      if (!profile?.status) {
        console.log("🚫 Middleware: Acesso negado - conta inativa");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      console.log("✅ Middleware: Acesso admin permitido");
    }

    // 🛡️ PROTEÇÃO DAS ROTAS DE AGENTE
    if (pathname.startsWith("/agent")) {
      console.log("🛡️ Middleware: Protegendo rota agent...");

      if (!user) {
        console.log(
          "❌ Middleware: Usuário não autenticado, redirecionando para login"
        );
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
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
    if (pathname === "/login" && user) {
      console.log(
        "🔄 Middleware: Usuário logado acessando login, redirecionando..."
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
        return NextResponse.redirect(new URL("/perfil", request.url));
      }
    }

    // 🔄 REDIRECIONAMENTO DE ROTA RAIZ
    if (pathname === "/" && user) {
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
        return NextResponse.redirect(new URL("/perfil", request.url));
      }
    }
  } catch (error) {
    console.error("💥 Middleware: Erro inesperado:", error);
  }

  console.log("✅ Middleware: Processamento concluído");
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/agent/:path*",
    "/login",
    "/",
    // Permite que o middleware processe todas as rotas,
    // mas pularemos rotas de API no código
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
