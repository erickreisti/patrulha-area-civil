"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// CORREÇÃO: Definir tipos como array de strings literais
type AllowedMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "video/mp4"
  | "video/mpeg"
  | "video/quicktime"
  | "video/webm"
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "text/plain";

// Configurações por tipo de arquivo - CORRIGIDO
const UPLOAD_CONFIGS = {
  news: {
    bucket: "imagens-noticias" as const,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
    ] as AllowedMimeType[],
    pathPrefix: "news/" as const,
  },
  gallery: {
    bucket: "galeria-fotos" as const,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
    ] as AllowedMimeType[],
    pathPrefix: "gallery/" as const,
  },
  video: {
    bucket: "galeria-videos" as const,
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/webm",
    ] as AllowedMimeType[],
    pathPrefix: "videos/" as const,
  },
  document: {
    bucket: "documentos-oficiais" as const,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ] as AllowedMimeType[],
    pathPrefix: "documents/" as const,
  },
} as const;

type UploadType = keyof typeof UPLOAD_CONFIGS;

const UploadGeneralSchema = z.object({
  type: z.enum(["news", "gallery", "video", "document"] as const),
  categoryId: z.string().optional(), // Para organizar em subpastas
});

export async function uploadGeneralFile(formData: FormData) {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Apenas administradores podem fazer upload geral");
    }

    // Extrair e validar dados
    const rawData = {
      type: formData.get("type") as UploadType,
      categoryId: formData.get("categoryId") as string,
    };

    const validated = UploadGeneralSchema.parse(rawData);
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("Nenhum arquivo enviado");
    }

    // Verificar configuração do tipo
    const config = UPLOAD_CONFIGS[validated.type];
    if (!config) {
      throw new Error("Tipo de upload inválido");
    }

    // Validações do arquivo
    if (file.size > config.maxSize) {
      throw new Error(
        `Arquivo muito grande. Máximo permitido: ${
          config.maxSize / 1024 / 1024
        }MB`
      );
    }

    // CORREÇÃO: Usar type assertion para evitar erro de tipo
    const fileType = file.type as AllowedMimeType;

    if (!config.allowedTypes.includes(fileType)) {
      throw new Error(
        `Tipo de arquivo não permitido. Tipos permitidos: ${config.allowedTypes.join(
          ", "
        )}`
      );
    }

    // Validar extensões perigosas
    const dangerousExtensions = [
      ".exe",
      ".bat",
      ".cmd",
      ".sh",
      ".js",
      ".vbs",
      ".php",
    ];
    const fileExt = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (dangerousExtensions.includes(fileExt)) {
      throw new Error("Tipo de arquivo potencialmente perigoso");
    }

    // Gerar nome seguro do arquivo
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "_")
      .substring(0, 50);

    const fileName = `${config.pathPrefix}${
      validated.categoryId ? `${validated.categoryId}/` : ""
    }${timestamp}_${random}_${safeName}`;

    // Converter para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Usar Uint8Array diretamente (o Supabase aceita)
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload usando Uint8Array
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(config.bucket).getPublicUrl(uploadData.path);

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: session.user.id,
      action_type: `${validated.type}_upload`,
      description: `Arquivo ${file.name} enviado para ${config.bucket}`,
      resource_type: "storage",
      resource_id: fileName,
      metadata: {
        uploaded_by: session.user.id,
        uploaded_by_email: session.user.email,
        original_name: file.name,
        file_name: fileName,
        file_size: file.size,
        file_type: file.type,
        bucket: config.bucket,
        type: validated.type,
        category_id: validated.categoryId,
        public_url: publicUrl,
      },
    });

    // Revalidar cache baseado no tipo
    switch (validated.type) {
      case "news":
        revalidatePath("/noticias");
        break;
      case "gallery":
      case "video":
        revalidatePath("/galeria");
        break;
      case "document":
        revalidatePath("/documentos");
        break;
    }

    return {
      success: true,
      message: "Arquivo enviado com sucesso!",
      data: {
        url: publicUrl,
        path: uploadData.path,
        bucket: config.bucket,
        file_name: fileName,
        original_name: file.name,
        file_size: file.size,
        file_type: file.type,
        type: validated.type,
      },
    };
  } catch (error) {
    console.error("Erro em uploadGeneralFile:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
        details: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao fazer upload do arquivo",
    };
  }
}
