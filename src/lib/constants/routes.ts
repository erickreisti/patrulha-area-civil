// src/lib/config/routes.ts
export const ROUTES = {
  PUBLIC: [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/about",
    "/contact",
    "/noticias",
    "/galeria",
  ] as const,

  ADMIN: {
    BASE: "/admin",
    DASHBOARD: "/admin/dashboard",
    AGENTS: "/admin/agentes",
    NEWS: "/admin/noticias",
    GALLERY: "/admin/galeria",
    ACTIVITIES: "/admin/atividades",
    SETUP_PASSWORD: "/admin/setup-password",
  } as const,

  // Rotas que requerem sessão admin ativa (2ª camada)
  ADMIN_SESSION_REQUIRED: [
    "/admin/dashboard",
    "/admin/agentes",
    "/admin/noticias",
    "/admin/galeria",
    "/admin/atividades",
  ] as const,

  AGENT: {
    PROFILE: "/perfil",
    SETTINGS: "/configuracoes",
  } as const,

  REDIRECT: {
    AFTER_LOGIN: "/perfil",
    UNAUTHENTICATED: "/login",
    UNAUTHORIZED: "/perfil",
    DEFAULT: "/",
  } as const,
} as const;

// Helper para verificar se uma rota é admin
export const isAdminRoute = (pathname: string): boolean => {
  return Object.values(ROUTES.ADMIN).some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

// Helper para verificar se uma rota requer sessão admin
export const requiresAdminSession = (pathname: string): boolean => {
  return ROUTES.ADMIN_SESSION_REQUIRED.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

// Helper para verificar se uma rota é pública
export const isPublicRoute = (pathname: string): boolean => {
  return ROUTES.PUBLIC.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};
