"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==================== CONSTANTES ====================
const AVATAR_CONFIG = {
  bucketName: "avatares-agentes" as const,
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  pathPrefix: "avatars/",
};

// ==================== SCHEMAS ====================
const UploadAvatarSchema = z
  .object({
    userId: z.string().min(1, "ID do usuário é obrigatório"),
    matricula: z.string().min(1, "Matrícula é obrigatória"),
    mode: z.enum(["create", "edit"]).default("edit"),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "edit") {
      if (!/^\d{11}$/.test(data.matricula)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Matrícula deve ter exatamente 11 dígitos no modo edição",
          path: ["matricula"],
        });
      }
    }
  });

const RemoveAvatarSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  avatarUrl: z.string().url("URL inválida"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  mode: z.enum(["create", "edit"]).default("edit"),
});

// ==================== FUNÇÕES UTILITÁRIAS ====================

function validateAvatarFile(file: File): { isValid: boolean; error?: string } {
  if (!file) return { isValid: false, error: "Nenhum arquivo selecionado" };

  if (file.size > AVATAR_CONFIG.maxSize) {
    const maxSizeMB = AVATAR_CONFIG.maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB`,
    };
  }

  if (!AVATAR_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Tipo não permitido. Use JPG, PNG, WEBP ou GIF.",
    };
  }

  return { isValid: true };
}

function generateAvatarFileName(
  originalName: string,
  userId: string,
  matricula: string,
  isForCreation: boolean,
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";

  const cleanMatricula = matricula.replace(/\D/g, "") || "temp";
  const userIdentifier = isForCreation
    ? `temp_${timestamp}`
    : userId.substring(0, 8);

  return `${cleanMatricula}_${userIdentifier}_${random}.${extension}`;
}

function extractFilePathFromUrl(url: string): {
  bucket: string | null;
  path: string | null;
} {
  try {
    if (!url || typeof url !== "string") return { bucket: null, path: null };

    const cleanUrl = url.split("?")[0].split("#")[0];
    const match = cleanUrl.match(
      /\/storage\/v1\/object\/public\/([^/]+)\/(.+)/,
    );

    if (!match) return { bucket: null, path: null };

    return {
      bucket: match[1],
      path: decodeURIComponent(match[2]),
    };
  } catch (error) {
    console.error("❌ Erro ao extrair caminho da URL:", error);
    return { bucket: null, path: null };
  }
}

export async function deleteFileByUrl(
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { bucket, path } = extractFilePathFromUrl(url);

    if (!bucket || !path) return { success: false, error: "URL inválida" };

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch {
    return { success: false, error: "Erro desconhecido ao deletar arquivo" };
  }
}

// ==================== ACTIONS PRINCIPAIS ====================

export async function uploadAgentAvatar(formData: FormData) {
  try {
    console.log("📤 [uploadAgentAvatar] Iniciando...");
    const supabaseAdmin = createAdminClient();

    const rawData = {
      userId: formData.get("userId") as string,
      matricula: formData.get("matricula") as string,
      mode: (formData.get("mode") as "create" | "edit") || "edit",
    };

    const validated = UploadAvatarSchema.parse(rawData);
    const isForCreation = validated.mode === "create";
    const file = formData.get("file") as File;

    const fileValidation = validateAvatarFile(file);
    if (!fileValidation.isValid)
      return { success: false, error: fileValidation.error };

    const safeMatricula = validated.matricula
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 50);
    const fileName = generateAvatarFileName(
      file.name,
      validated.userId,
      safeMatricula,
      isForCreation,
    );

    const folderName =
      isForCreation && safeMatricula.startsWith("temp_")
        ? safeMatricula
        : safeMatricula;
    const filePath = `${AVATAR_CONFIG.pathPrefix}${folderName}/${fileName}`;

    console.log("📁 Upload para:", filePath);

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(AVATAR_CONFIG.bucketName)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Erro upload:", uploadError);
      return { success: false, error: "Falha ao salvar no storage" };
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from(AVATAR_CONFIG.bucketName)
      .getPublicUrl(uploadData.path);

    if (validated.mode === "edit") {
      const { data: currentProfile } = await supabaseAdmin
        .from("profiles")
        .select("avatar_url")
        .eq("id", validated.userId)
        .single();

      if (currentProfile?.avatar_url) {
        await deleteFileByUrl(currentProfile.avatar_url);
      }

      await supabaseAdmin
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", validated.userId);

      revalidatePath("/admin/agentes");
      return {
        success: true,
        message: "Avatar atualizado",
        data: { url: publicUrl, path: uploadData.path },
      };
    } else {
      return {
        success: true,
        message: "Avatar temporário criado",
        data: {
          url: publicUrl,
          path: uploadData.path,
          fileName,
          isTempFile: true,
        },
      };
    }
  } catch (error) {
    console.error("❌ Erro upload:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function removeAgentAvatar(formData: FormData) {
  try {
    const supabaseAdmin = createAdminClient();
    const rawData = {
      userId: formData.get("userId") as string,
      avatarUrl: formData.get("avatarUrl") as string,
      matricula: formData.get("matricula") as string,
      mode: (formData.get("mode") as "create" | "edit") || "edit",
    };

    const validated = RemoveAvatarSchema.parse(rawData);

    const deleteResult = await deleteFileByUrl(validated.avatarUrl);
    if (!deleteResult.success) return deleteResult;

    if (validated.mode === "edit") {
      await supabaseAdmin
        .from("profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", validated.userId);

      revalidatePath("/admin/agentes");
    }

    return { success: true, message: "Avatar removido" };
  } catch {
    return { success: false, error: "Erro ao remover avatar" };
  }
}

export async function renameAvatarAfterCreation(
  tempAvatarUrl: string,
  newUserId: string,
  newMatricula: string,
): Promise<{ success: boolean; newUrl?: string; error?: string }> {
  try {
    console.log("🔄 [renameAvatar] Movendo avatar...", { newMatricula });

    if (!/^\d{11}$/.test(newMatricula)) {
      return { success: false, error: "Matrícula inválida para renomeação" };
    }

    const supabaseAdmin = createAdminClient();
    const { bucket, path: tempPath } = extractFilePathFromUrl(tempAvatarUrl);

    if (!bucket || !tempPath)
      return { success: false, error: "URL temporária inválida" };

    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from(bucket)
      .download(tempPath);

    if (downloadError) {
      console.warn(
        "⚠️ Arquivo temporário não encontrado para renomear:",
        downloadError,
      );
      return { success: false, error: "Arquivo temporário não encontrado" };
    }

    const tempFileName = tempPath.split("/").pop() || "avatar.png";
    const extension = tempFileName.split(".").pop() || "png";
    const newFileName = `${newMatricula}_${newUserId.substring(0, 8)}_${Date.now()}.${extension}`;
    const newPath = `${AVATAR_CONFIG.pathPrefix}${newMatricula}/${newFileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(newPath, fileBlob, {
        contentType: fileBlob.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Erro upload final:", uploadError);
      return { success: false, error: "Erro ao salvar arquivo final" };
    }

    await supabaseAdmin.storage.from(bucket).remove([tempPath]);

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(newPath);

    console.log("✅ Avatar movido:", publicUrl);
    return { success: true, newUrl: publicUrl };
  } catch (error) {
    console.error("❌ Erro rename:", error);
    return { success: false, error: "Erro interno na renomeação" };
  }
}
