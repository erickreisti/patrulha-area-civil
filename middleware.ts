import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas públicas (acessíveis sem autenticação)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/contact",
  "/noticias",
  "/galeria",
] as const;

// Rotas que requerem autenticação (qualquer usuário logado)
const PROTECTED_ROUTES = ["/perfil", "/configuracoes"] as const;

// Rotas que requerem permissão de admin + sessão admin válida
const ADMIN_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/agentes",
  "/admin/noticias",
  "/admin/galeria",
  "/admin/atividades",
  "/admin/setup-password",
] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔍 [Middleware] Rota: ${pathname}`);

  // Ignorar arquivos estáticos e rotas da API
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/actions/")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set({ name, value, ...options });
            });
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;

    // ============================================
    // CASO 1: ROTA PÚBLICA
    // ============================================
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isPublicRoute) {
      // Se estiver tentando acessar login já estando logado, redireciona para perfil
      if (pathname.startsWith("/login") && userId) {
        console.log(`✅ [Middleware] Usuário logado tentando login → perfil`);
        return NextResponse.redirect(new URL("/perfil", request.url));
      }
      return NextResponse.next();
    }

    // ============================================
    // CASO 2: USUÁRIO NÃO AUTENTICADO
    // ============================================
    if (!userId) {
      console.log(`❌ [Middleware] Não autenticado para: ${pathname}`);
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // ============================================
    // CASO 3: VERIFICAR PERFIL DO USUÁRIO
    // ============================================
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status, admin_2fa_enabled")
      .eq("id", userId)
      .single();

    if (!profile) {
      console.log(`❌ [Middleware] Perfil não encontrado para: ${userId}`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ============================================
    // CASO 4: AGENTE INATIVO
    // ============================================
    // Agente inativo só pode acessar /perfil
    if (!profile.status && pathname !== "/perfil") {
      console.log(`⚠️ [Middleware] Agente inativo tentou acessar: ${pathname}`);
      return NextResponse.redirect(new URL("/perfil", request.url));
    }

    // ============================================
    // CASO 5: ROTAS ADMINISTRATIVAS
    // ============================================
    const isAdminRoute = ADMIN_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isAdminRoute) {
      console.log(`🔍 [Middleware] Verificando acesso admin para: ${pathname}`);

      // 5.1: Verificar se é admin
      if (profile.role !== "admin") {
        console.log(
          `❌ [Middleware] Agente comum tentou acessar área admin: ${pathname}`
        );
        return NextResponse.redirect(new URL("/perfil", request.url));
      }

      // 5.2: Para /admin/setup-password, permitir acesso sem senha configurada
      if (pathname === "/admin/setup-password") {
        console.log(`✅ [Middleware] Setup password permitido`);
        return NextResponse.next();
      }

      // 5.3: Verificar se configurou senha admin
      if (!profile.admin_2fa_enabled) {
        console.log(
          `⚠️ [Middleware] Admin sem senha configurada tentou acessar: ${pathname}`
        );
        // Admin sem senha configurada só pode acessar /perfil e /admin/setup-password
        return NextResponse.redirect(
          new URL("/admin/setup-password", request.url)
        );
      }

      // 5.4: Para DASHBOARD ESPECÍFICO, verificar sessão admin (cookies)
      const isDashboardRoute =
        pathname === "/admin/dashboard" ||
        pathname.startsWith("/admin/dashboard/");

      if (isDashboardRoute) {
        const adminSessionCookie = request.cookies.get("admin_session")?.value;
        const isAdminCookie = request.cookies.get("is_admin")?.value === "true";

        console.log(`🔐 [Middleware] Dashboard - Verificando cookies admin:`, {
          hasAdminSession: !!adminSessionCookie,
          hasIsAdmin: isAdminCookie,
        });

        // Se não tem cookies admin válidos, não pode acessar dashboard
        if (!adminSessionCookie || !isAdminCookie) {
          console.log(
            `⚠️ [Middleware] Admin sem sessão para dashboard → /perfil`
          );
          return NextResponse.redirect(new URL("/perfil", request.url));
        }

        // Verificar se sessão admin expirou
        try {
          const sessionData = JSON.parse(adminSessionCookie);
          if (
            sessionData.expiresAt &&
            new Date(sessionData.expiresAt) < new Date()
          ) {
            console.log(`❌ [Middleware] Sessão admin expirada → /perfil`);
            response.cookies.delete("admin_session");
            response.cookies.delete("is_admin");
            return NextResponse.redirect(new URL("/perfil", request.url));
          }
        } catch {
          console.log(`❌ [Middleware] Cookie admin inválido → /perfil`);
          response.cookies.delete("admin_session");
          response.cookies.delete("is_admin");
          return NextResponse.redirect(new URL("/perfil", request.url));
        }

        console.log(`✅ [Middleware] Dashboard permitido para admin`);
      }

      // Para outras rotas admin (não dashboard), apenas ser admin com senha configurada é suficiente
      console.log(`✅ [Middleware] Rota admin permitida: ${pathname}`);
    }

    // ============================================
    // CASO 6: ROTAS PROTEGIDAS (QUALQUER USUÁRIO LOGADO)
    // ============================================
    const isProtectedRoute = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isProtectedRoute) {
      // Agentes (ativos/inativos) e Admins podem acessar /perfil
      // Admins podem acessar tudo
      console.log(`✅ [Middleware] Rota protegida permitida: ${pathname}`);
    }

    // ============================================
    // CASO 7: QUALQUER OUTRA ROTA
    // ============================================
    // Se chegou aqui e não é rota pública, protegida ou admin,
    // redireciona para perfil (segurança extra)
    if (!isPublicRoute && !isProtectedRoute && !isAdminRoute) {
      console.log(
        `⚠️ [Middleware] Rota não identificada → perfil: ${pathname}`
      );
      return NextResponse.redirect(new URL("/perfil", request.url));
    }

    // ✅ TUDO OK: Permitir acesso
    console.log(`✅ [Middleware] Acesso permitido para: ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error("❌ [Middleware] Erro:", error);
    // Em caso de erro, redireciona para login como segurança
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)$).*)",
  ],
};
