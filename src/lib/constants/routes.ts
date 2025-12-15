export const ROUTES = {
  PUBLIC: [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/about",
    "/contact",
  ],

  PROTECTED: {
    ADMIN: "/admin",
    AGENT: "/agent",
    PROFILE: "/perfil",
    DASHBOARD: "/dashboard",
    SETTINGS: "/configuracoes",
  },

  REDIRECT: {
    AFTER_LOGIN: {
      ADMIN: "/admin/dashboard",
      AGENT: "/perfil",
    },
    UNAUTHENTICATED: "/login",
    UNAUTHORIZED: "/perfil",
    DEFAULT: "/",
  },
} as const;
