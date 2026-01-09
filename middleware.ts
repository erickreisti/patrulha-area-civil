import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ============================================
// CONFIGURAÇÃO DE ROTAS
// ============================================

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

// Rotas que requerem permissão de admin
const ADMIN_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/agentes",
  "/admin/noticias",
  "/admin/galeria",
  "/admin/atividades",
  "/admin/setup-password",
] as const;

// Rotas que requerem SESSÃO ADMIN ATIVA (2ª camada)
const ADMIN_SESSION_ROUTES = [
  "/admin/dashboard",
  "/admin/agentes",
  "/admin/noticias",
  "/admin/galeria",
  "/admin/atividades",
] as const;

// Rota de perfil do agente
const AGENT_PROFILE_ROUTE = "/perfil";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔍 [Middleware] Rota: ${pathname}`);

  // DEBUG: Log de todos os cookies disponíveis
  const allCookies = request.cookies.getAll();
  console.log(
    "🍪 [Middleware] Cookies disponíveis:",
    allCookies.map((c) => c.name)
  );

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
    // ============================================
    // CONFIGURAÇÃO DO CLIENTE SUPABASE
    // ============================================
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
              response.cookies.set({
                name,
                value,
                ...options,
                // Mantenha as configurações de segurança
                httpOnly:
                  name === "admin_session" || name === "is_admin"
                    ? true
                    : options?.httpOnly,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
              });
            });
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;
    console.log(`👤 [Middleware] Usuário ID: ${userId || "Não autenticado"}`);

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
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }
      console.log(`✅ [Middleware] Rota pública permitida: ${pathname}`);
      return response;
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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status, admin_2fa_enabled, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.log(`❌ [Middleware] Perfil não encontrado para: ${userId}`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    console.log(`📋 [Middleware] Perfil encontrado:`, {
      role: profile.role,
      status: profile.status,
      name: profile.full_name,
    });

    // ============================================
    // CASO 4: VERIFICAR SE É ROTA ADMIN
    // ============================================
    const isAdminRoute = ADMIN_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // ============================================
    // CASO 4.1: AGENTE COMUM (não-admin)
    // ============================================
    if (profile.role !== "admin") {
      console.log(
        `👤 [Middleware] Agente comum (${profile.role}) tentando acessar: ${pathname}`
      );

      // Agente inativo só pode acessar seu perfil
      if (!profile.status && pathname !== AGENT_PROFILE_ROUTE) {
        console.log(
          `⚠️ [Middleware] Agente inativo tentou acessar: ${pathname} → perfil`
        );
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }

      // Agente comum ativo só pode acessar seu perfil
      if (pathname !== AGENT_PROFILE_ROUTE) {
        console.log(
          `❌ [Middleware] Agente comum tentou acessar rota não-perfil: ${pathname} → perfil`
        );
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }

      // Permite acesso à página de perfil
      console.log(
        `✅ [Middleware] Agente comum permitido no perfil: ${pathname}`
      );
      return response;
    }

    // ============================================
    // CASO 5: ADMINISTRADOR
    // ============================================
    console.log(
      `👑 [Middleware] Administrador verificando acesso: ${pathname}`
    );

    // Se não é rota admin, permitir acesso (admin pode acessar qualquer rota autenticada)
    if (!isAdminRoute) {
      console.log(
        `✅ [Middleware] Admin em rota não-admin permitida: ${pathname}`
      );
      return response;
    }

    // ============================================
    // CASO 6: ROTA ADMIN ESPECÍFICA
    // ============================================

    // 6.1: Para /admin/setup-password, permitir acesso sem senha configurada
    if (pathname === "/admin/setup-password") {
      console.log(`✅ [Middleware] Setup password permitido para admin`);
      return response;
    }

    // 6.2: Verificar se configurou senha admin (para outras rotas admin)
    if (!profile.admin_2fa_enabled) {
      console.log(
        `⚠️ [Middleware] Admin sem senha configurada tentou acessar: ${pathname}`
      );
      return NextResponse.redirect(
        new URL("/admin/setup-password", request.url)
      );
    }

    // ============================================
    // CASO 7: VERIFICAR SESSÃO ADMIN (2ª CAMADA)
    // ============================================
    const requiresAdminSession = ADMIN_SESSION_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (requiresAdminSession) {
      console.log(`🔐 [Middleware] Verificando sessão admin para: ${pathname}`);

      // Verificar cookies de sessão admin
      const adminSessionCookie = request.cookies.get("admin_session");
      const isAdminCookie = request.cookies.get("is_admin");

      console.log(`🍪 [Middleware] Cookie admin_session:`, {
        exists: !!adminSessionCookie,
        hasValue: adminSessionCookie?.value ? "SIM" : "NÃO",
      });

      console.log(`🍪 [Middleware] Cookie is_admin:`, {
        exists: !!isAdminCookie,
        value: isAdminCookie?.value,
      });

      // Se não tem cookies admin válidos, redireciona para perfil
      if (
        !adminSessionCookie ||
        !isAdminCookie ||
        isAdminCookie.value !== "true"
      ) {
        console.log(
          `⚠️ [Middleware] Admin sem sessão ativa para: ${pathname} → /perfil`
        );
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }

      // Verificar se sessão admin expirou
      try {
        const sessionData = JSON.parse(adminSessionCookie.value);

        if (sessionData.expiresAt) {
          const expiresAt = new Date(sessionData.expiresAt);
          const now = new Date();
          console.log(`📅 [Middleware] Sessão admin expira em:`, expiresAt);
          console.log(`📅 [Middleware] Hora atual:`, now);

          if (expiresAt < now) {
            console.log(`❌ [Middleware] Sessão admin expirada → /perfil`);
            // Limpar cookies expirados
            response.cookies.delete("admin_session");
            response.cookies.delete("is_admin");
            return NextResponse.redirect(
              new URL(AGENT_PROFILE_ROUTE, request.url)
            );
          }
        }

        console.log(`✅ [Middleware] Sessão admin válida para: ${pathname}`);
        return response;
      } catch (error) {
        console.log(`❌ [Middleware] Cookie admin inválido:`, error);
        // Limpar cookies inválidos
        response.cookies.delete("admin_session");
        response.cookies.delete("is_admin");
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }
    }

    // ============================================
    // CASO 8: OUTRAS ROTAS ADMIN (sem sessão requerida)
    // ============================================
    console.log(`✅ [Middleware] Rota admin básica permitida: ${pathname}`);
    return response;
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
