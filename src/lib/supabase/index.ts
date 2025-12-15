// Exportações principais
export { createClient } from "./client";
export { createServerClient } from "./server";
export { createAdminClient, getAdminClient } from "./admin";
export { validateEnvironment, validateClientEnvironment } from "./validate-env";

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
  UPLOAD_CONFIGS,
  validateUpload,
  getBucketName,
  generateSafeFilename,
} from "./storage";
export type { StorageBucket, UploadConfig } from "./storage";

// Configuração padrão
export const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  cookieOptions: {
    name: "sb-pac-auth",
    lifetime: 60 * 60 * 8, // 8 horas
    path: "/",
    sameSite: "lax",
  },
};

// Utilitários
export const isBrowser = typeof window !== "undefined";
export const isServer = typeof window === "undefined";
