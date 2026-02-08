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

// Rotas que requerem SESSÃO ADMIN ATIVA (2ª camada - Cookie Criptografado)
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

// Rota de perfil do agente (Dashboard do usuário comum)
const AGENT_PROFILE_ROUTE = "/perfil";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = Math.random().toString(36).substring(7);

  // Ignorar arquivos estáticos e rotas da API internas do Next
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
    // 1. CONFIGURAÇÃO DO CLIENTE SUPABASE (SSR)
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
                httpOnly: name === "admin_session" || name === "is_admin",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
              });
            });
          },
        },
      },
    );

    // ============================================
    // 2. VERIFICAÇÃO DE AUTENTICAÇÃO BÁSICA
    // ============================================
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;

    // ============================================
    // CASO 1: ROTA PÚBLICA
    // ============================================
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (isPublicRoute) {
      // Se usuário logado tentar acessar login, manda para o perfil
      if (pathname.startsWith("/login") && userId) {
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }
      return response;
    }

    // Se não é pública e não tem usuário -> Login
    if (!userId) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // ============================================
    // 3. BUSCA DE PERFIL (Role & Status)
    // ============================================
    // "Zero Trust": Buscamos o perfil em toda requisição protegida
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status, admin_2fa_enabled, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error(`[Middleware ${requestId}] Erro perfil ou não encontrado.`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ============================================
    // CASO 4.1: AGENTE COMUM (Não-Admin)
    // ============================================
    if (profile.role !== "admin") {
      // Agente INATIVO: Só acessa perfil (para ver aviso) ou logout
      if (!profile.status) {
        if (pathname !== AGENT_PROFILE_ROUTE) {
          return NextResponse.redirect(
            new URL(AGENT_PROFILE_ROUTE, request.url),
          );
        }
        return response;
      }

      // Agente ATIVO: Acessa perfil
      if (pathname === AGENT_PROFILE_ROUTE) {
        return response;
      }

      // Bloquear acesso a qualquer rota administrativa ou desconhecida
      // Redireciona de volta para o perfil seguro
      return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
    }

    // ============================================
    // CASO 5: ADMINISTRADOR
    // ============================================

    // Verificar se a rota atual é uma rota administrativa
    const isAdminRoute = ADMIN_ROUTES.some((route) => {
      if (route.endsWith("/*")) {
        const baseRoute = route.slice(0, -2);
        return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
      }
      return pathname === route || pathname.startsWith(`${route}/`);
    });

    // Se admin está navegando em rotas normais (ex: /perfil), permitir
    if (!isAdminRoute) {
      return response;
    }

    // ============================================
    // CASO 6: SETUP DE SENHA ADMIN
    // ============================================
    // Se admin ainda não configurou a senha secundária
    if (!profile.admin_2fa_enabled) {
      if (pathname !== "/admin/setup-password") {
        return NextResponse.redirect(
          new URL("/admin/setup-password", request.url),
        );
      }
      return response; // Permite acessar a tela de setup
    }

    // ============================================
    // CASO 7: VERIFICAÇÃO DE SESSÃO ADMIN (2ª Camada)
    // ============================================
    // Rotas críticas exigem o cookie 'admin_session' válido
    const requiresAdminSession = ADMIN_SESSION_ROUTES.some((route) => {
      if (route.endsWith("/*")) {
        const baseRoute = route.slice(0, -2);
        return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
      }
      return pathname === route || pathname.startsWith(`${route}/`);
    });

    if (requiresAdminSession) {
      const adminSessionCookie = request.cookies.get("admin_session");
      const isAdminCookie = request.cookies.get("is_admin");

      // Validar existência dos cookies
      if (
        !adminSessionCookie ||
        !isAdminCookie ||
        isAdminCookie.value !== "true"
      ) {
        // Sem sessão admin -> Manda para o "login" da área admin (que é o perfil/dashboard inicial ou modal)
        // Aqui optamos por mandar para o perfil, onde ele pode clicar em "Acessar Painel" novamente
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }

      // Validar expiração da sessão
      try {
        const sessionData = JSON.parse(adminSessionCookie.value);
        if (sessionData.expiresAt) {
          const expiresAt = new Date(sessionData.expiresAt);
          if (expiresAt < new Date()) {
            // Expirou: Limpar e redirecionar
            response.cookies.delete("admin_session");
            response.cookies.delete("is_admin");
            return NextResponse.redirect(
              new URL(AGENT_PROFILE_ROUTE, request.url),
            );
          }
        }
      } catch {
        // Cookie inválido/corrompido
        response.cookies.delete("admin_session");
        response.cookies.delete("is_admin");
        return NextResponse.redirect(new URL(AGENT_PROFILE_ROUTE, request.url));
      }
    }

    // Acesso permitido à rota administrativa
    return response;
  } catch (error) {
    console.error(`[Middleware ${requestId}] ERRO CRÍTICO:`, error);
    // Em caso de pânico no middleware, falhar seguro para login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas de requisição exceto:
     * 1. /api/ (rotas de API)
     * 2. /_next/ (arquivos estáticos do Next.js)
     * 3. /_static (arquivos estáticos dentro da pasta public)
     * 4. /_vercel (arquivos internos do Vercel)
     * 5. Arquivos com extensão (imagens, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)$).*)",
  ],
};
