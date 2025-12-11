// lib/config/service-worker.ts
export const SERVICE_WORKER_CONFIG = {
  enabled: false, // Desabilitar completamente
  version: "0.0.0",
  cacheName: "pac-app-cache",

  // URLs para não cachear
  excludeFromCache: [
    "/api/",
    "/login",
    "/logout",
    "/admin",
    "/_next/",
    "/favicon.ico",
  ],

  // Estratégias de cache
  strategies: {
    static: "CacheFirst",
    api: "NetworkFirst",
    images: "StaleWhileRevalidate",
  },
} as const;

export const shouldHandleRequest = (url: string): boolean => {
  try {
    const requestUrl = new URL(
      url,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000"
    );

    // Não cachear rotas de API
    if (requestUrl.pathname.startsWith("/api/")) {
      return false;
    }

    // Não cachear páginas de admin
    if (requestUrl.pathname.startsWith("/admin")) {
      return false;
    }

    // Não cachear páginas de autenticação
    if (["/login", "/logout", "/register"].includes(requestUrl.pathname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};
