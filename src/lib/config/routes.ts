// lib/config/routes.ts
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/contact",
] as const;

export const PROTECTED_ROUTES = {
  ADMIN: "/admin/:path*",
  AGENT: "/agent/:path*",
  PROFILE: "/perfil",
  DASHBOARD: "/dashboard",
} as const;

export const REDIRECT_ROUTES = {
  AFTER_LOGIN: {
    ADMIN: "/admin/dashboard",
    AGENT: "/perfil",
  },
  UNAUTHENTICATED: "/login",
  UNAUTHORIZED: "/perfil",
  DEFAULT: "/",
} as const;

export const API_ROUTES = {
  ADMIN: {
    AGENTS: "/api/admin/agentes",
    UPDATE_USER: "/api/admin/update-user",
  },
  AUTH: {
    PROFILE: "/api/auth/profile",
  },
  UPLOAD: {
    AVATAR: "/api/upload/avatar",
    GENERAL: "/api/upload/general",
  },
} as const;
