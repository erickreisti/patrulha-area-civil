import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/lib/constants/routes";
import type { Database } from "@/lib/supabase/types";

// Rotas que requerem autenticação admin em duas camadas
const ADMIN_2FA_REQUIRED_PATHS = [
  "/admin/dashboard",
  "/admin/agentes",
  "/admin/noticias",
  "/admin/galeria",
  "/admin/relatorios",
  "/admin/configuracoes",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔍 [Middleware] Rota: ${pathname} | Método: ${request.method}`);

  // 1. IGNORAR APENAS ARQUIVOS ESTÁTICOS
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // 2. Permitir server actions de login/logout (sem verificação extra)
  if (
    pathname.includes("/actions/login") ||
    pathname.includes("/actions/logout")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  try {
    // Criar cliente Supabase
    const supabase = createServerClient<Database>(
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

    // 🔒 VERIFICAÇÃO PARA ROTAS ADMIN COM 2FA
    const requiresAdmin2FA = ADMIN_2FA_REQUIRED_PATHS.some((path) =>
      pathname.startsWith(path)
    );

    if (requiresAdmin2FA) {
      console.log(`🔒 [Middleware] Verificando 2FA admin para: ${pathname}`);

      // 1. Verificar autenticação básica
      if (!userId) {
        console.log(`❌ [Middleware] Não autenticado`);
        return redirectToLogin(request, pathname);
      }

      // 2. Verificar se é admin no perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", userId)
        .single();

      if (!profile || profile.role !== "admin" || !profile.status) {
        console.log(`❌ [Middleware] Não é admin ou inativo`);
        return NextResponse.redirect(
          new URL(ROUTES.REDIRECT.UNAUTHORIZED, request.url)
        );
      }

      // 3. VERIFICAR AUTENTICAÇÃO 2FA (verificar cookie)
      const adminAuthToken = request.cookies.get("admin_auth_token")?.value;

      if (!adminAuthToken) {
        console.log(`🔒 [Middleware] Cookie admin não encontrado`);

        // Para server actions, retornar erro JSON
        if (pathname.includes("/actions/")) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Autenticação admin necessária",
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Para navegação normal, redirecionar para perfil
        return NextResponse.redirect(new URL("/perfil", request.url));
      }

      console.log(`✅ [Middleware] 2FA admin validado`);
    }

    // Proteger rotas de perfil
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
