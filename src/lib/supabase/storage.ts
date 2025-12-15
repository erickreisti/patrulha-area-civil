// Importe TUDO de constants/upload.ts - ele já tem todas as definições
import {
  STORAGE_BUCKETS,
  UPLOAD_CONFIGS,
  type StorageBucket,
  type UploadConfig,
  UPLOAD_PATHS,
  UPLOAD_DIMENSIONS,
} from "@/lib/constants/upload";

// Re-export TUDO para manter compatibilidade
export { STORAGE_BUCKETS, UPLOAD_CONFIGS, UPLOAD_PATHS, UPLOAD_DIMENSIONS };
export type { StorageBucket, UploadConfig };

// Agora adicione APENAS as funções que não existem em constants/upload.ts
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
      .map((t: string) => t.split("/")[1])
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

export function getBucketName(bucket: StorageBucket): string {
  return STORAGE_BUCKETS[bucket];
}

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
