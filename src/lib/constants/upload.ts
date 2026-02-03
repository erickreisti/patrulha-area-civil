// src/lib/constants/upload.ts

export const STORAGE_BUCKETS = {
  AVATARES: "avatares-agentes",
  NOTICIAS: "imagens-noticias",
  GALERIA_FOTOS: "galeria-fotos",
  GALERIA_VIDEOS: "galeria-videos",
  DOCUMENTOS: "documentos-oficiais",
} as const;

export type BucketName = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export type MediaType = "image" | "video" | "document";

export interface UploadConfig {
  maxSize: number; // bytes
  // CORREÇÃO: Adicionado 'readonly' para aceitar arrays definidos com 'as const'
  allowedTypes: readonly string[];
}

export const UPLOAD_CONFIGS = {
  AVATARES: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  NOTICIAS: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ],
  },
  GALERIA_FOTOS: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  GALERIA_VIDEOS: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ["video/mp4", "video/webm"],
  },
  DOCUMENTOS: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ],
  },
} as const;

// --- Helpers de Validação ---

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  config: UploadConfig,
  // Parâmetro type removido pois não era utilizado
): ValidationResult {
  if (!file) return { valid: false, error: "Nenhum arquivo fornecido." };

  // Validar tamanho
  if (file.size > config.maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxMB = (config.maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Arquivo muito grande (${sizeMB}MB). Máximo permitido: ${maxMB}MB.`,
    };
  }

  // Validar tipo
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Formato de arquivo não suportado: ${file.type}`,
    };
  }

  return { valid: true };
}

export function generateSafeFileName(
  originalName: string,
  prefix?: string,
  // Parâmetro type removido pois não era utilizado
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop()?.toLowerCase() || "bin";

  const safeName = originalName
    .split(".")[0]
    .replace(/[^a-zA-Z0-9]/g, "-")
    .substring(0, 50);

  const finalPrefix = prefix ? `${prefix}-` : "";
  return `${finalPrefix}${safeName}-${timestamp}-${random}.${ext}`;
}

export function detectMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

export function extractFilePathFromUrl(url: string): {
  bucket: string | null;
  path: string | null;
} {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/storage/v1/object/public/");

    if (parts.length < 2) return { bucket: null, path: null };

    const fullPath = parts[1];
    const firstSlash = fullPath.indexOf("/");

    if (firstSlash === -1) return { bucket: null, path: null };

    const bucket = fullPath.substring(0, firstSlash);
    const path = fullPath.substring(firstSlash + 1);

    return { bucket, path: decodeURIComponent(path) };
  } catch {
    return { bucket: null, path: null };
  }
}
