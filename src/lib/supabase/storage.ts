import { createAdminClient } from "@/lib/supabase/admin";
import {
  STORAGE_BUCKETS,
  UPLOAD_CONFIGS,
  validateFile,
  generateSafeFileName,
  extractFilePathFromUrl,
  type MediaType,
  type ValidationResult,
  type UploadConfig, // Importar o tipo
} from "@/lib/constants/upload";

// ==================== TIPOS ====================

export interface UploadResult {
  success: boolean;
  data?: {
    url: string;
    path: string;
    fileName: string;
    mediaType: MediaType;
  };
  error?: string;
}

// ==================== FUNÇÕES PRINCIPAIS ====================

/**
 * Função unificada de upload
 */
export async function uploadFile(
  file: File,
  bucketId: string,
  options?: { folder?: string; upsert?: boolean },
): Promise<UploadResult> {
  try {
    const supabaseAdmin = createAdminClient();
    const folder = options?.folder || "";
    const fileName = generateSafeFileName(file.name);
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(bucketId)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: options?.upsert ?? false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucketId).getPublicUrl(data.path);

    const mediaType: MediaType = file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("image/")
        ? "image"
        : "document";

    return {
      success: true,
      data: {
        url: publicUrl,
        path: data.path,
        fileName: fileName,
        mediaType,
      },
    };
  } catch (error: unknown) {
    console.error("Erro uploadFile:", error);
    const message = error instanceof Error ? error.message : "Falha no upload";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Validação simplificada por tipo
 */
export function validateUploadByType(
  file: File,
  type: "image" | "video" | "document",
): ValidationResult {
  // CORREÇÃO: Tipagem explícita para evitar erro de inferência de tupla
  let config: UploadConfig;

  if (type === "image") {
    config = UPLOAD_CONFIGS.GALERIA_FOTOS;
  } else if (type === "video") {
    config = UPLOAD_CONFIGS.GALERIA_VIDEOS;
  } else if (type === "document") {
    config = UPLOAD_CONFIGS.DOCUMENTOS;
  } else {
    // Fallback seguro
    config = UPLOAD_CONFIGS.NOTICIAS;
  }

  return validateFile(file, config);
}

/**
 * Deletar arquivo por URL
 */
export async function deleteFileByUrl(url: string) {
  try {
    const { bucket, path } = extractFilePathFromUrl(url);
    if (!bucket || !path) return { success: false, error: "URL inválida" };

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export {
  extractFilePathFromUrl,
  generateSafeFileName,
  STORAGE_BUCKETS,
  UPLOAD_CONFIGS,
};
