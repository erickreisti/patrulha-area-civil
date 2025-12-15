export const STORAGE_BUCKETS = {
  AVATARES: "avatares-agentes",
  NOTICIAS: "imagens-noticias",
  GALERIA_FOTOS: "galeria-fotos",
  GALERIA_VIDEOS: "galeria-videos",
  DOCUMENTOS: "documentos-oficiais",
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

export interface UploadConfig {
  maxSize: number;
  allowedMimeTypes: readonly string[];
  allowedExtensions: readonly string[];
  maxWidth?: number;
  maxHeight?: number;
}

export const UPLOAD_CONFIGS: Record<StorageBucket, UploadConfig> = {
  AVATARES: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxWidth: 512,
    maxHeight: 512,
  },
  NOTICIAS: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxWidth: 1920,
    maxHeight: 1080,
  },
  GALERIA_FOTOS: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxWidth: 3840,
    maxHeight: 2160,
  },
  GALERIA_VIDEOS: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ],
    allowedExtensions: [".mp4", ".mpeg", ".mov", ".avi", ".webm", ".mkv"],
  },
  DOCUMENTOS: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ],
    allowedExtensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"],
  },
} as const;

export const UPLOAD_PATHS = {
  AVATAR: (userId: string) => `avatars/${userId}/${Date.now()}`,
  NEWS_IMAGE: (slug: string) => `news/${slug}/${Date.now()}`,
  GALLERY_PHOTO: (categoryId: string) => `gallery/${categoryId}/${Date.now()}`,
  GALLERY_VIDEO: (categoryId: string) => `videos/${categoryId}/${Date.now()}`,
  DOCUMENT: (type: string) => `documents/${type}/${Date.now()}`,
} as const;

export const UPLOAD_DIMENSIONS = {
  AVATAR: { width: 300, height: 300 },
  NEWS: { width: 1200, height: 630 },
  GALLERY: { width: 1920, height: 1080 },
} as const;
