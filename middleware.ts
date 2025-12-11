// middleware.ts - VERSÃO OTIMIZADA
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  REDIRECT_ROUTES,
} from "@/lib/config/routes";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignorar arquivos estáticos e rotas de API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Se é uma rota pública e usuário está logado, redirecionar
    if (PUBLIC_ROUTES.includes(pathname) && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const redirectTo =
        profile?.role === "admin"
          ? REDIRECT_ROUTES.AFTER_LOGIN.ADMIN
          : REDIRECT_ROUTES.AFTER_LOGIN.AGENT;

      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Proteger rotas de admin
    if (pathname.startsWith("/admin")) {
      if (!user) {
        const redirectUrl = new URL(
          REDIRECT_ROUTES.UNAUTHENTICATED,
          request.url
        );
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        return NextResponse.redirect(
          new URL(REDIRECT_ROUTES.UNAUTHORIZED, request.url)
        );
      }

      if (!profile.status) {
        return NextResponse.redirect(
          new URL(REDIRECT_ROUTES.UNAUTHENTICATED, request.url)
        );
      }
    }

    // Proteger rotas de agente
    if (pathname.startsWith("/agent")) {
      if (!user) {
        const redirectUrl = new URL(
          REDIRECT_ROUTES.UNAUTHENTICATED,
          request.url
        );
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.status) {
        return NextResponse.redirect(
          new URL(REDIRECT_ROUTES.UNAUTHENTICATED, request.url)
        );
      }
    }
  } catch (error) {
    console.error("Middleware error:", error);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js)$).*)",
  ],
};
