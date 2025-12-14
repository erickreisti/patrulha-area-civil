import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/lib/constants/routes";
import type { Database } from "@/lib/supabase/types";

const PUBLIC_PATHS = new Set(ROUTES.PUBLIC);
const ADMIN_PATH = "/admin";
const AGENT_PATH = "/agent";

// Cache de sessões válidas por 5 minutos
const sessionCache = new Map<
  string,
  { expires: number; role: string; status: boolean }
>();

// Tipo para o cliente Supabase no middleware
type SupabaseMiddlewareClient = ReturnType<typeof createServerClient<Database>>;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar arquivos estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  try {
    // Criar cliente Supabase no middleware (versão 0.7.0+)
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

    // Verificar se é rota pública (com type assertion)
    const isPublicPath = PUBLIC_PATHS.has(
      pathname as
        | "/"
        | "/login"
        | "/register"
        | "/forgot-password"
        | "/reset-password"
        | "/about"
        | "/contact"
    );

    // Se é rota pública e usuário está logado, redirecionar
    if (isPublicPath && userId) {
      const { role } = await getUserProfileCached(userId, supabase);
      const redirectTo =
        role === "admin"
          ? ROUTES.REDIRECT.AFTER_LOGIN.ADMIN
          : ROUTES.REDIRECT.AFTER_LOGIN.AGENT;

      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Proteger rotas de admin
    if (pathname.startsWith(ADMIN_PATH)) {
      if (!userId) {
        return redirectToLogin(request, pathname);
      }

      const { role, status } = await getUserProfileCached(userId, supabase);

      if (role !== "admin") {
        return NextResponse.redirect(
          new URL(ROUTES.REDIRECT.UNAUTHORIZED, request.url)
        );
      }

      if (!status) {
        return redirectToLogin(request, pathname);
      }
    }

    // Proteger rotas de agente
    if (pathname.startsWith(AGENT_PATH)) {
      if (!userId) {
        return redirectToLogin(request, pathname);
      }

      const { status } = await getUserProfileCached(userId, supabase);

      if (!status) {
        return redirectToLogin(request, pathname);
      }
    }
  } catch (error) {
    console.error("Middleware error:", error);
  }

  return response;
}

async function getUserProfileCached(
  userId: string,
  supabase: SupabaseMiddlewareClient
) {
  const cached = sessionCache.get(userId);

  if (cached && cached.expires > Date.now()) {
    return { role: cached.role, status: cached.status };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", userId)
    .single();

  if (!profile) {
    throw new Error("Perfil não encontrado");
  }

  // Cache por 5 minutos
  sessionCache.set(userId, {
    role: profile.role,
    status: profile.status,
    expires: Date.now() + 5 * 60 * 1000,
  });

  return profile;
}

function redirectToLogin(request: NextRequest, fromPath: string) {
  const url = new URL(ROUTES.REDIRECT.UNAUTHENTICATED, request.url);
  url.searchParams.set("redirect", fromPath);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
