import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔍 [Middleware] Rota: ${pathname}`);

  // Ignorar arquivos estáticos
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

    // 🔓 ROTAS PÚBLICAS: Permitir acesso sem autenticação
    const isPublicRoute = ROUTES.PUBLIC.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isPublicRoute) {
      // Se já está logado e tenta acessar login, redireciona para perfil
      if (pathname.startsWith("/login") && userId) {
        return NextResponse.redirect(new URL("/perfil", request.url));
      }
      return NextResponse.next();
    }

    // 🚫 SEM AUTENTICAÇÃO: Redirecionar para login
    if (!userId) {
      console.log(`❌ [Middleware] Não autenticado para: ${pathname}`);
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // 👤 VERIFICAR PERFIL (após autenticação)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", userId)
      .single();

    if (!profile) {
      console.log(`❌ [Middleware] Perfil não encontrado para: ${userId}`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 🚫 AGENTE INATIVO: Apenas /perfil
    if (!profile.status && pathname !== "/perfil") {
      console.log(`⚠️ [Middleware] Agente inativo tentou acessar: ${pathname}`);
      return NextResponse.redirect(new URL("/perfil", request.url));
    }

    // 👑 ROTAS ADMIN: Verificar se é admin E tem cookie de sessão admin
    if (pathname.startsWith("/admin")) {
      if (profile.role !== "admin") {
        console.log(`❌ [Middleware] Agente tentou acessar admin: ${pathname}`);
        return NextResponse.redirect(new URL("/perfil", request.url));
      }

      // ✅ VERIFICAR COOKIE DE SESSÃO ADMIN ADICIONAL
      const adminSessionCookie = request.cookies.get("admin_session")?.value;
      const isAdminCookie = request.cookies.get("is_admin")?.value === "true";

      console.log("🔍 [Middleware] Verificando sessão admin:", {
        adminSessionCookie: !!adminSessionCookie,
        isAdminCookie,
      });

      if (!adminSessionCookie || !isAdminCookie) {
        console.log(`❌ [Middleware] Admin sem sessão válida: ${pathname}`);

        // Se for dashboard, redirecionar para perfil
        if (pathname === "/admin/dashboard") {
          return NextResponse.redirect(new URL("/perfil", request.url));
        }

        // Para outras rotas admin, permitir mas o frontend deve verificar
        console.log(
          `⚠️ [Middleware] Admin sem sessão completa acessando: ${pathname}`
        );
      }
    }

    // ✅ TUDO OK: Permitir acesso
    return NextResponse.next();
  } catch (error) {
    console.error("❌ [Middleware] Erro:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)$).*)",
  ],
};
