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

// Rotas que requerem permissão de admin (qualquer rota dentro de /admin)
const ADMIN_ROUTES = [
  "/admin",
  "/admin/*", // Captura todas as sub-rotas de /admin
] as const;

// Rotas que requerem SESSÃO ADMIN ATIVA (2ª camada) - especificas
const ADMIN_SESSION_ROUTES = [
  "/admin/dashboard",
  "/admin/agentes",
  "/admin/agentes/*",
  "/admin/noticias",
  "/admin/noticias/*",
  "/admin/galeria",
  "/admin/galeria/*",
  "/admin/atividades",
  "/admin/atividades/*",
] as const;

// Rota de perfil do agente
const AGENT_PROFILE_ROUTE = "/perfil";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = Math.random().toString(36).substring(7);

  console.log(
    `\n🔍 [Middleware ${requestId}] Iniciando para rota: ${pathname}`
  );

  // Ignorar arquivos estáticos e rotas da API
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/actions/")
  ) {
    console.log(`⚡ [Middleware ${requestId}] Rota estática/API, ignorando...`);
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
              console.log(
                `📝 [Middleware ${requestId}] Configurando cookie: ${name}`
              );
              response.cookies.set({
                name,
                value,
                ...options,
                httpOnly: name === "admin_session" || name === "is_admin",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
              });
            });
          },
        },
      }
    );

    console.log(`🔐 [Middleware ${requestId}] Obtendo sessão Supabase...`);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(
        `❌ [Middleware ${requestId}] Erro ao obter sessão:`,
        sessionError
      );
    }

    const userId = session?.user?.id;
    console.log(
      `👤 [Middleware ${requestId}] Usuário ID: ${userId || "NÃO AUTENTICADO"}`
    );

    // ============================================
    // CASO 1: ROTA PÚBLICA
    // ============================================
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    console.log(
      `📊 [Middleware ${requestId}] É rota pública? ${
        isPublicRoute ? "SIM" : "NÃO"
      }`
    );

    if (isPublicRoute) {
      // Se estiver tentando acessar login já estando logado, redireciona para perfil
      if (pathname.startsWith("/login") && userId) {
        console.log(
          `🔄 [Middleware ${requestId}] Usuário logado tentando login → redirecionando para perfil`
        );
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }
      console.log(`✅ [Middleware ${requestId}] Rota pública permitida`);
      return response;
    }

    // ============================================
    // CASO 2: USUÁRIO NÃO AUTENTICADO
    // ============================================
    if (!userId) {
      console.log(
        `❌ [Middleware ${requestId}] Usuário não autenticado para rota protegida`
      );
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      console.log(
        `🔄 [Middleware ${requestId}] Redirecionando para login com redirect: ${pathname}`
      );
      return NextResponse.redirect(url);
    }

    // ============================================
    // CASO 3: VERIFICAR PERFIL DO USUÁRIO
    // ============================================
    console.log(`📋 [Middleware ${requestId}] Buscando perfil do usuário...`);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status, admin_2fa_enabled, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error(
        `❌ [Middleware ${requestId}] Erro ao buscar perfil:`,
        profileError
      );
      console.log(
        `🔄 [Middleware ${requestId}] Perfil não encontrado → redirecionando para login`
      );
      return NextResponse.redirect(new URL("/login", request.url));
    }

    console.log(`📋 [Middleware ${requestId}] Perfil encontrado:`, {
      nome: profile.full_name,
      role: profile.role,
      status: profile.status,
      admin_2fa_enabled: profile.admin_2fa_enabled,
    });

    // ============================================
    // CASO 4: VERIFICAR SE É ROTA ADMIN
    // ============================================
    const isAdminRoute = ADMIN_ROUTES.some((route) => {
      if (route.endsWith("/*")) {
        const baseRoute = route.slice(0, -2);
        return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
      }
      return pathname === route || pathname.startsWith(`${route}/`);
    });

    console.log(
      `📊 [Middleware ${requestId}] É rota admin? ${
        isAdminRoute ? "SIM" : "NÃO"
      }`
    );

    // ============================================
    // CASO 4.1: AGENTE COMUM (não-admin)
    // ============================================
    if (profile.role !== "admin") {
      console.log(
        `👤 [Middleware ${requestId}] Agente comum (${profile.role})`
      );

      // Agente inativo só pode acessar seu perfil
      if (!profile.status && pathname !== AGENT_PROFILE_ROUTE) {
        console.log(
          `⚠️ [Middleware ${requestId}] Agente INATIVO tentou acessar ${pathname} → redirecionando para perfil`
        );
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }

      // Agente comum ativo só pode acessar seu perfil
      if (pathname !== AGENT_PROFILE_ROUTE) {
        console.log(
          `❌ [Middleware ${requestId}] Agente comum tentou acessar rota não-perfil: ${pathname}`
        );
        console.log(`🔄 [Middleware ${requestId}] Redirecionando para perfil`);
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }

      console.log(
        `✅ [Middleware ${requestId}] Agente comum permitido no perfil`
      );
      return response;
    }

    // ============================================
    // CASO 5: ADMINISTRADOR
    // ============================================
    console.log(`👑 [Middleware ${requestId}] Administrador detectado`);

    // Se não é rota admin, permitir acesso (admin pode acessar qualquer rota autenticada)
    if (!isAdminRoute) {
      console.log(
        `✅ [Middleware ${requestId}] Admin em rota não-admin permitida`
      );
      return response;
    }

    console.log(
      `🔧 [Middleware ${requestId}] Verificando acesso admin para: ${pathname}`
    );

    // ============================================
    // CASO 6: ROTA ADMIN ESPECÍFICA
    // ============================================

    // 6.1: Para /admin/setup-password, permitir acesso sem senha configurada
    if (pathname === "/admin/setup-password") {
      console.log(
        `✅ [Middleware ${requestId}] Setup password permitido para admin`
      );
      return response;
    }

    // 6.2: Verificar se configurou senha admin (para outras rotas admin)
    if (!profile.admin_2fa_enabled) {
      console.log(
        `⚠️ [Middleware ${requestId}] Admin sem senha configurada para: ${pathname}`
      );
      console.log(
        `🔄 [Middleware ${requestId}] Redirecionando para setup-password`
      );
      return NextResponse.redirect(
        new URL("/admin/setup-password", request.url)
      );
    }

    console.log(
      `🔐 [Middleware ${requestId}] Admin tem senha configurada: SIM`
    );

    // ============================================
    // CASO 7: VERIFICAR SESSÃO ADMIN (2ª CAMADA)
    // ============================================
    const requiresAdminSession = ADMIN_SESSION_ROUTES.some((route) => {
      if (route.endsWith("/*")) {
        const baseRoute = route.slice(0, -2);
        return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
      }
      return pathname === route || pathname.startsWith(`${route}/`);
    });

    console.log(
      `📊 [Middleware ${requestId}] Requer sessão admin? ${
        requiresAdminSession ? "SIM" : "NÃO"
      }`
    );

    if (requiresAdminSession) {
      console.log(
        `🔐 [Middleware ${requestId}] Verificando sessão admin (2ª camada)...`
      );

      // Verificar cookies de sessão admin
      const adminSessionCookie = request.cookies.get("admin_session");
      const isAdminCookie = request.cookies.get("is_admin");

      // Se não tem cookies admin válidos, redireciona para perfil
      if (
        !adminSessionCookie ||
        !isAdminCookie ||
        isAdminCookie.value !== "true"
      ) {
        console.log(`❌ [Middleware ${requestId}] FALTAM COOKIES ADMIN!`);
        console.log(`🔄 [Middleware ${requestId}] Redirecionando para /perfil`);
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }

      // Verificar se sessão admin expirou
      try {
        const sessionData = JSON.parse(adminSessionCookie.value);

        if (sessionData.expiresAt) {
          const expiresAt = new Date(sessionData.expiresAt);
          const now = new Date();

          if (expiresAt < now) {
            console.log(`❌ [Middleware ${requestId}] Sessão admin EXPIRADA!`);
            // Limpar cookies expirados
            response.cookies.delete("admin_session");
            response.cookies.delete("is_admin");
            console.log(
              `🔄 [Middleware ${requestId}] Redirecionando para /perfil (sessão expirada)`
            );
            return NextResponse.redirect(
              new URL(AGENT_PROFILE_ROUTE, request.url)
            );
          }
        }

        console.log(
          `✅ [Middleware ${requestId}] Sessão admin VÁLIDA para: ${pathname}`
        );
        return response;
      } catch (error) {
        console.error(
          `❌ [Middleware ${requestId}] Erro ao parsear cookie admin:`,
          error
        );
        // Limpar cookies inválidos
        response.cookies.delete("admin_session");
        response.cookies.delete("is_admin");
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }
    }

    // ============================================
    // CASO 8: OUTRAS ROTAS ADMIN (sem sessão requerida)
    // ============================================
    console.log(
      `✅ [Middleware ${requestId}] Rota admin básica permitida: ${pathname}`
    );
    return response;
  } catch (error) {
    console.error(`❌ [Middleware ${requestId}] ERRO CRÍTICO:`, error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)$).*)",
  ],
};
