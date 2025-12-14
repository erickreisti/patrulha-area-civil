// Exportações principais
export { createClient } from "./client";
export { createServerClient } from "./server";
export { createAdminClient, getAdminClient } from "./admin";
export { validateEnvironment } from "./validate-env";

// Tipos
export type { Database } from "./types";
export type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Notification,
  NotificationInsert,
  NotificationUpdate,
  SystemActivity,
  SystemActivityInsert,
  SystemActivityUpdate,
  Noticia,
  NoticiaInsert,
  NoticiaUpdate,
  GaleriaCategoria,
  GaleriaCategoriaInsert,
  GaleriaCategoriaUpdate,
  GaleriaItem,
  GaleriaItemInsert,
  GaleriaItemUpdate,
  ProfilesHistory,
  ProfilesHistoryInsert,
  ProfilesHistoryUpdate,
} from "./types";

// Storage
export {
  STORAGE_BUCKETS,
  type StorageBucket,
  UPLOAD_CONFIGS,
  type UploadConfig,
  validateUpload,
} from "./storage";

// Configuração padrão
export const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "X-Client-Info": "pac-system",
      "Content-Type": "application/json",
    },
  },
  cookieOptions: {
    name: "sb-pac-auth",
    lifetime: 60 * 60 * 8, // 8 horas
    domain: "",
    path: "/",
    sameSite: "lax",
  },
};

// Utilitários
export const isBrowser = typeof window !== "undefined";
export const isServer = typeof window === "undefined";
