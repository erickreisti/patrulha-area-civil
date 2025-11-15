// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🛡️ PROTEÇÃO DAS ROTAS DE ADMINISTRADOR
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/agent/perfil", request.url));
    }
  }

  // 🛡️ PROTEÇÃO DAS ROTAS DE AGENTE
  if (request.nextUrl.pathname.startsWith("/agent")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 🔄 REDIRECIONAMENTO CORRIGIDO - AMBOS VÃO PARA /agent/perfil
  if (request.nextUrl.pathname === "/login" && user) {
    // ✅ AMBOS admin e user vão para a MESMA página
    return NextResponse.redirect(new URL("/agent/perfil", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/login"],
};
