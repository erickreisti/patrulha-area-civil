// src/hooks/useUpload.ts - VERSÃO CORRIGIDA
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { STORAGE_BUCKETS, STORAGE_CONFIG } from "@/lib/supabase/storage";

interface UploadOptions {
  bucket: keyof typeof STORAGE_BUCKETS;
  folder?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (url: string) => void;
}

interface UploadResult {
  url: string | null;
  error: string | null;
  path: string | null;
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { success: toastSuccess, error: toastError } = useToast();
  const supabase = createClient();

  const uploadFile = async (
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> => {
    const { bucket, folder = "", onComplete } = options;

    const bucketName = STORAGE_BUCKETS[bucket];
    const maxSize = STORAGE_CONFIG.MAX_FILE_SIZES[bucket];

    // Tipos permitidos baseados no bucket - usando ReadonlyArray
    let allowedTypes: ReadonlyArray<string> = [];
    switch (bucket) {
      case "AVATARES":
        allowedTypes = STORAGE_CONFIG.ALLOWED_TYPES.IMAGES;
        break;
      case "NOTICIAS":
        allowedTypes = STORAGE_CONFIG.ALLOWED_TYPES.IMAGES;
        break;
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

    // Validações
    if (file.size > maxSize) {
      const error = `Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`;
      toastError(error, "Erro de validação");
      return { url: null, error, path: null };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      const error = `Tipo de arquivo não permitido. Permitidos: ${allowedTypes
        .map((t) => t.split("/")[1])
        .join(", ")}`;
      toastError(error, "Erro de validação");
      return { url: null, error, path: null };
    }

    setUploading(true);
    setProgress(0);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;

      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Fazer upload
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        console.error("❌ Erro no upload:", error);
        throw error;
      }

      // Completar progresso
      setProgress(100);

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data!.path);

      toastSuccess("Arquivo enviado com sucesso!", "Upload concluído");

      if (onComplete) {
        onComplete(publicUrl);
      }

      // Resetar progresso
      setTimeout(() => setProgress(0), 1000);

      return { url: publicUrl, error: null, path: data!.path };
    } catch (error: unknown) {
      console.error("❌ Erro ao fazer upload:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao enviar arquivo";
      toastError("Erro ao enviar arquivo", "Erro de upload");
      setProgress(0);
      return { url: null, error: errorMessage, path: null };
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (
    bucket: keyof typeof STORAGE_BUCKETS,
    path: string
  ) => {
    try {
      const bucketName = STORAGE_BUCKETS[bucket];
      const { error } = await supabase.storage.from(bucketName).remove([path]);

      if (error) throw error;

      toastSuccess("Arquivo removido com sucesso!", "Remoção concluída");
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("❌ Erro ao remover arquivo:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao remover arquivo";
      toastError("Erro ao remover arquivo", "Erro");
      return { success: false, error: errorMessage };
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
    resetProgress: () => setProgress(0),
  };
}
