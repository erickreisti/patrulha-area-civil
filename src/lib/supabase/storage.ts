export const STORAGE_BUCKETS = {
  AVATARES: "avatares-agentes",
  NOTICIAS: "imagens-noticias",
  GALERIA_FOTOS: "galeria-fotos",
  GALERIA_VIDEOS: "galeria-videos",
  DOCUMENTOS: "documentos-oficiais",
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

export const STORAGE_CONFIG = {
  MAX_FILE_SIZES: {
    AVATARES: 2 * 1024 * 1024, // 2MB
    NOTICIAS: 5 * 1024 * 1024, // 5MB
    GALERIA_FOTOS: 10 * 1024 * 1024, // 10MB
    GALERIA_VIDEOS: 50 * 1024 * 1024, // 50MB
    DOCUMENTOS: 20 * 1024 * 1024, // 20MB
  },
  ALLOWED_TYPES: {
    IMAGES: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
    VIDEOS: [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
    ] as const,
    DOCUMENTS: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ] as const,
  },
} as const;

export type AllowedImageType =
  (typeof STORAGE_CONFIG.ALLOWED_TYPES.IMAGES)[number];
export type AllowedVideoType =
  (typeof STORAGE_CONFIG.ALLOWED_TYPES.VIDEOS)[number];
export type AllowedDocumentType =
  (typeof STORAGE_CONFIG.ALLOWED_TYPES.DOCUMENTS)[number];

export const validateUpload = (
  file: File,
  bucket: StorageBucket
): { isValid: boolean; error?: string } => {
  const maxSize = STORAGE_CONFIG.MAX_FILE_SIZES[bucket];

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`,
    };
  }

  let allowedTypes: readonly string[] = [];
  switch (bucket) {
    case "AVATARES":
    case "NOTICIAS":
    case "GALERIA_FOTOS":
      allowedTypes = STORAGE_CONFIG.ALLOWED_TYPES.IMAGES;
      break;
    case "GALERIA_VIDEOS":
      allowedTypes = STORAGE_CONFIG.ALLOWED_TYPES.VIDEOS;
      break;
    case "DOCUMENTOS":
      allowedTypes = STORAGE_CONFIG.ALLOWED_TYPES.DOCUMENTS;
      break;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido. Permitidos: ${allowedTypes
        .map((t) => t.split("/")[1])
        .join(", ")}`,
    };
  }

  return { isValid: true };
};
