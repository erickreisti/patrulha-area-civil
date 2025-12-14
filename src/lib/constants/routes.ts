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

  API: {
    AUTH: {
      LOGIN: "/api/auth/login",
      LOGOUT: "/api/auth/logout",
      PROFILE: "/api/auth/profile",
      REFRESH: "/api/auth/refresh",
    },
    ADMIN: {
      AGENTS: "/api/admin/agentes",
      STATS: "/api/admin/stats",
      ACTIVITIES: "/api/admin/activities",
    },
    UPLOAD: {
      AVATAR: "/api/upload/avatar",
      GENERAL: "/api/upload/general",
    },
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
