// middleware.ts - ATUALIZADO
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/lib/constants/routes";

// Rotas que requerem 2FA confirmado (ações destrutivas/críticas)
const ADMIN_PROTECTED_PATHS = [
  "/admin/agentes/novo",
  "/admin/agentes/editar",
  "/admin/noticias/novo",
  "/admin/noticias/editar",
  "/admin/galeria/nova",
  "/admin/galeria/editar",
  "/admin/configuracoes",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔍 [Middleware] Rota: ${pathname}`);

  // 1. Ignorar arquivos estáticos e assets
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.includes("/api/") ||
    pathname.includes("/actions/")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  try {
    // Criar cliente Supabase
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

    // 🔒 VERIFICAÇÃO PARA QUALQUER ROTA /admin/*
    if (pathname.startsWith("/admin")) {
      console.log(`🔒 [Middleware] Verificando acesso admin: ${pathname}`);

      // 1. Verificar autenticação básica
      if (!userId) {
        console.log(`❌ [Middleware] Não autenticado para admin`);
        return redirectToLogin(request, pathname);
      }

      // 2. Verificar se é admin no perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status, admin_2fa_enabled")
        .eq("id", userId)
        .single();

      if (!profile || profile.role !== "admin" || !profile.status) {
        console.log(`❌ [Middleware] Não é admin ou inativo`);
        return NextResponse.redirect(
          new URL(ROUTES.REDIRECT.UNAUTHORIZED, request.url)
        );
      }

      console.log(`✅ [Middleware] Admin verificado`);

      // 3. Verificar se é rota que requer 2FA confirmado
      const requires2FA = ADMIN_PROTECTED_PATHS.some((path) =>
        pathname.startsWith(path)
      );

      if (requires2FA) {
        console.log(`🔐 [Middleware] Verificando 2FA para: ${pathname}`);

        const adminAuthToken = request.cookies.get("admin_auth_token")?.value;

        if (!adminAuthToken) {
          console.log(`❌ [Middleware] 2FA não confirmado, redirecionando`);

          // Para páginas HTML, redirecionar para dashboard
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url)
          );
        }

        console.log(`✅ [Middleware] 2FA confirmado`);
      }
    }

    // Proteger rotas de perfil (agentes normais podem acessar)
    if (pathname === "/perfil" && !userId) {
      return redirectToLogin(request, pathname);
    }
  } catch (error) {
    console.error("❌ [Middleware] Erro:", error);
  }

  return response;
}

function redirectToLogin(request: NextRequest, fromPath: string) {
  const url = new URL(ROUTES.REDIRECT.UNAUTHENTICATED, request.url);
  url.searchParams.set("redirect", fromPath);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)$).*)",
  ],
};
