// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Criar uma resposta Next.js padrão que podemos modificar
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Configurar cliente do Supabase para o lado do servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Obter todos os cookies da requisição
        getAll() {
          return request.cookies.getAll();
        },
        // Configurar cookies na resposta
        setAll(cookiesToSet) {
          // Primeiro atualiza os cookies da requisição
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          // Cria uma nova resposta
          supabaseResponse = NextResponse.next({
            request,
          });
          // Aplica os cookies na resposta
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // VERIFICAÇÃO DE AUTENTICAÇÃO
  // Obter informações do usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🛡️ PROTEÇÃO DAS ROTAS DE ADMINISTRADOR
  // Se a rota começar com /admin, verificar permissões
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Se não há usuário logado, redirecionar para login
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verificar se o usuário tem role de admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Se não for admin, redirecionar para área do agente
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/agent/perfil", request.url));
    }
  }

  // 🛡️ PROTEÇÃO DAS ROTAS DE AGENTE
  // Se a rota começar com /agent, verificar autenticação
  if (request.nextUrl.pathname.startsWith("/agent")) {
    // Se não há usuário logado, redirecionar para login
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 🔄 REDIRECIONAMENTO DE USUÁRIOS LOGADOS
  // Se usuário já está logado e tenta acessar /login
  if (request.nextUrl.pathname === "/login" && user) {
    // Buscar perfil para determinar o tipo de usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Definir URL de redirecionamento baseado no role
    const redirectUrl =
      profile?.role === "admin" ? "/admin/dashboard" : "/agent/perfil";

    // Redirecionar para a área apropriada
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Retornar a resposta (com cookies atualizados se necessário)
  return supabaseResponse;
}

// 🎯 CONFIGURAÇÃO DO MIDDLEWARE
// Define quais rotas serão interceptadas pelo middleware
export const config = {
  matcher: [
    // Proteger todas as rotas que começam com /admin
    "/admin/:path*",
    // Proteger todas as rotas que começam com /agent
    "/agent/:path*",
    // Interceptar acesso à página de login
    "/login",
  ],
};
