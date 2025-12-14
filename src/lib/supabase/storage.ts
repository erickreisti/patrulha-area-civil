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
};

export function validateUpload(
  file: File,
  bucket: StorageBucket
): { isValid: boolean; error?: string } {
  const config = UPLOAD_CONFIGS[bucket];

  // Verificar se o arquivo existe
  if (!file) {
    return { isValid: false, error: "Nenhum arquivo selecionado" };
  }

  // Tamanho
  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / 1024 / 1024;
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      isValid: false,
      error: `Arquivo muito grande: ${fileSizeMB}MB. Máximo permitido: ${maxSizeMB}MB`,
    };
  }

  // Tipo MIME
  if (!config.allowedMimeTypes.includes(file.type)) {
    const allowedTypes = config.allowedMimeTypes
      .map((t) => t.split("/")[1])
      .join(", ");
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido: ${file.type}. Tipos permitidos: ${allowedTypes}`,
    };
  }

  // Extensão
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (extension && !config.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Extensão não permitida: ${extension}. Extensões permitidas: ${config.allowedExtensions.join(
        ", "
      )}`,
    };
  }

  // Nome do arquivo (segurança)
  const fileName = file.name.toLowerCase();
  const forbiddenPatterns = [
    /\.\.\//, // Path traversal
    /\.php$/,
    /\.exe$/,
    /\.sh$/,
    /\.bat$/,
    /\.cmd$/,
    /<script>/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(fileName)) {
      return {
        isValid: false,
        error: "Nome de arquivo não permitido por questões de segurança",
      };
    }
  }

  return { isValid: true };
}

// Helper para obter bucket pelo nome
export function getBucketName(bucket: StorageBucket): string {
  return STORAGE_BUCKETS[bucket];
}

// Helper para gerar nome de arquivo seguro
export function generateSafeFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop()?.toLowerCase() || "";

  // Remover caracteres especiais do nome base
  const baseName = originalName
    .split(".")
    .slice(0, -1)
    .join(".")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .toLowerCase()
    .substring(0, 50);

  return `${baseName}_${timestamp}_${random}.${extension}`;
}
