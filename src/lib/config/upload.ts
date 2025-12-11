// lib/config/upload.ts
export const STORAGE_BUCKETS = {
  AVATARES: "avatares-agentes",
  NOTICIAS: "imagens-noticias",
  GALERIA_FOTOS: "galeria-fotos",
  GALERIA_VIDEOS: "galeria-videos",
  DOCUMENTOS: "documentos-oficiais",
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

// Configurações de upload - DEFINIR PRIMEIRO
export const UPLOAD_CONFIGS = {
  AVATAR: {
    bucket: STORAGE_BUCKETS.AVATARES,
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    pathTemplate: (userId: string) => `avatars/${userId}/${Date.now()}`,
  },
  NEWS_IMAGE: {
    bucket: STORAGE_BUCKETS.NOTICIAS,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    pathTemplate: (slug: string) => `news/${slug}/${Date.now()}`,
  },
  GALLERY_PHOTO: {
    bucket: STORAGE_BUCKETS.GALERIA_FOTOS,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    pathTemplate: (categoryId: string) => `gallery/${categoryId}/${Date.now()}`,
  },
  GALLERY_VIDEO: {
    bucket: STORAGE_BUCKETS.GALERIA_VIDEOS,
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ["video/mp4", "video/mpeg"] as const,
    allowedExtensions: [".mp4", ".mpeg", ".mov", ".avi"],
    pathTemplate: (categoryId: string) => `videos/${categoryId}/${Date.now()}`,
  },
  DOCUMENT: {
    bucket: STORAGE_BUCKETS.DOCUMENTOS,
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ["application/pdf"] as const,
    allowedExtensions: [".pdf", ".doc", ".docx"],
    pathTemplate: (type: string) => `documents/${type}/${Date.now()}`,
  },
} as const;

// AGORA definir o tipo - DEPOIS da constante
export type UploadType = keyof typeof UPLOAD_CONFIGS;

// Função de validação corrigida
export const validateUpload = (
  file: File,
  type: UploadType
): { isValid: boolean; error?: string } => {
  const config = UPLOAD_CONFIGS[type];

  // Verificar tamanho
  if (file.size > config.maxSize) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo: ${config.maxSize / 1024 / 1024}MB`,
    };
  }

  // Converter allowedTypes para array de strings e fazer type assertion
  const allowedTypesArray = [...config.allowedTypes] as readonly string[];

  // Verificar tipo MIME - usar type assertion para string
  if (!allowedTypesArray.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido. Tipos permitidos: ${allowedTypesArray.join(
        ", "
      )}`,
    };
  }

  // Verificar extensão - converter allowedExtensions para string[]
  const allowedExtensionsArray = [...config.allowedExtensions] as string[];
  const fileExt = file.name.split(".").pop()?.toLowerCase();

  if (fileExt && !allowedExtensionsArray.includes(`.${fileExt}`)) {
    return {
      isValid: false,
      error: `Extensão não permitida. Extensões permitidas: ${allowedExtensionsArray.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
};

// Função auxiliar para verificar tipo MIME específico
export const isMimeTypeAllowed = (
  mimeType: string,
  type: UploadType
): boolean => {
  const config = UPLOAD_CONFIGS[type];
  const allowedTypesArray = [...config.allowedTypes] as readonly string[];
  return allowedTypesArray.includes(mimeType);
};

// Função auxiliar para obter configuração de upload
export const getUploadConfig = (type: UploadType) => {
  return UPLOAD_CONFIGS[type];
};
