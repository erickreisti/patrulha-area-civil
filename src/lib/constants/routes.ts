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
  ],

  PROTECTED: {
    ADMIN: "/admin",
    AGENT: "/agent",
    PROFILE: "/perfil",
    DASHBOARD: "/admin/dashboard",
    SETTINGS: "/configuracoes",
  },

  REDIRECT: {
    AFTER_LOGIN: {
      ADMIN: "/perfil",
      AGENT: "/perfil",
    },
    UNAUTHENTICATED: "/login",
    UNAUTHORIZED: "/perfil",
    DEFAULT: "/",
  },
} as const;
