// src/app/actions/upload/avatar.ts - VERSÃO COMPLETA CORRIGIDA
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

// ==================== SCHEMAS CORRIGIDOS ====================
const UploadAvatarSchema = z
  .object({
    userId: z.string().min(1, "ID do usuário é obrigatório"),
    matricula: z.string().min(1, "Matrícula é obrigatória"),
    mode: z.enum(["create", "edit"]).default("edit"),
  })
  .superRefine((data, ctx) => {
    // ✅ CORREÇÃO: Validação condicional baseada no modo
    if (data.mode === "edit") {
      // No modo edição: matrícula deve ser 11 dígitos numéricos
      if (!/^\d{11}$/.test(data.matricula)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Matrícula deve ter exatamente 11 dígitos numéricos no modo edição",
          path: ["matricula"],
        });
      }
    }
    // No modo criação: permitir qualquer string (incluindo "temp_*")
  });

const RemoveAvatarSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  avatarUrl: z.string().url("URL inválida"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  mode: z.enum(["create", "edit"]).default("edit"),
});

// ==================== FUNÇÕES UTILITÁRIAS (NÃO EXPORTADAS) ====================
function validateAvatarFile(file: File): { isValid: boolean; error?: string } {
  if (!file) return { isValid: false, error: "Nenhum arquivo selecionado" };

  if (file.size > AVATAR_CONFIG.maxSize) {
    const maxSizeMB = AVATAR_CONFIG.maxSize / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `Arquivo muito grande: ${fileSizeMB}MB. Máximo: ${maxSizeMB}MB`,
    };
  }

  if (!AVATAR_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo não permitido: ${file.type}. Use JPG, PNG, WEBP ou GIF.`,
    };
  }

  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (extension && !AVATAR_CONFIG.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Extensão não permitida: ${extension}. Permitidas: ${AVATAR_CONFIG.allowedExtensions.join(", ")}`,
    };
  }

  const dangerousPatterns = [
    /\.\.\//,
    /\.php$/,
    /\.exe$/,
    /\.sh$/,
    /\.bat$/,
    /\.cmd$/,
    /<script>/i,
    /javascript:/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(file.name.toLowerCase())) {
      return {
        isValid: false,
        error: "Nome de arquivo inválido por questões de segurança",
      };
    }
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
  const cleanMatricula =
    matricula.replace(/\D/g, "").substring(0, 20) || "temp";

  // Para criação: usar prefixo "temp_" + timestamp
  // Para edição: usar userId real
  const userIdentifier = isForCreation
    ? `temp_${timestamp}`
    : userId.substring(0, 8);

  return `${cleanMatricula}_${userIdentifier}_${random}.${extension}`;
}

// Função auxiliar para extrair path da URL
function extractFilePathFromUrl(url: string): {
  bucket: string | null;
  path: string | null;
} {
  try {
    if (!url || typeof url !== "string") {
      return { bucket: null, path: null };
    }

    const cleanUrl = url.split("?")[0].split("#")[0];
    const supabasePattern =
      /supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)/;
    const match = cleanUrl.match(supabasePattern);

    if (!match) {
      return { bucket: null, path: null };
    }

    return {
      bucket: match[1],
      path: decodeURIComponent(match[2]),
    };
  } catch (error) {
    console.error("❌ Erro ao extrair caminho da URL:", error);
    return { bucket: null, path: null };
  }
}

// Função auxiliar para deletar arquivo por URL
async function deleteFileByUrl(url: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { bucket, path } = extractFilePathFromUrl(url);

    if (!bucket || !path) {
      return { success: false, error: "URL inválida" };
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Erro em deleteFileByUrl:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// ==================== FUNÇÕES PRINCIPAIS CORRIGIDAS ====================

/**
 * Upload de avatar (UNIFICADO para criar e editar) - CORRIGIDO
 */
export async function uploadAgentAvatar(formData: FormData) {
  try {
    console.log("📤 [uploadAgentAvatar] Upload iniciado...");

    const supabaseAdmin = createAdminClient();

    // Extrair dados
    const rawData = {
      userId: formData.get("userId") as string,
      matricula: formData.get("matricula") as string,
      mode: (formData.get("mode") as "create" | "edit") || "edit",
    };

    console.log("📝 Dados recebidos:", {
      userId: rawData.userId,
      isTempId: rawData.userId?.startsWith("temp_"),
      matricula: rawData.matricula,
      mode: rawData.mode,
    });

    // ✅ CORREÇÃO: Usar schema com validação condicional
    const validated = UploadAvatarSchema.parse(rawData);
    const isForCreation = validated.mode === "create";

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Nenhum arquivo enviado" };
    }

    // Validar arquivo
    const fileValidation = validateAvatarFile(file);
    if (!fileValidation.isValid) {
      return { success: false, error: fileValidation.error };
    }

    // ✅ CORREÇÃO: Sanitizar matrícula para nomes de arquivo
    const safeMatricula = validated.matricula
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 50);

    // Gerar nome do arquivo
    const fileName = generateAvatarFileName(
      file.name,
      validated.userId,
      safeMatricula,
      isForCreation,
    );

    // ✅ CORREÇÃO: Usar matrícula sanitizada no caminho
    const filePath = `${AVATAR_CONFIG.pathPrefix}${safeMatricula}/${fileName}`;

    console.log("📁 Preparando upload:", {
      bucket: AVATAR_CONFIG.bucketName,
      path: filePath,
      size: file.size,
      type: file.type,
      mode: validated.mode,
      isForCreation,
      safeMatricula,
    });

    // Converter para Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Fazer upload
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(AVATAR_CONFIG.bucketName)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
        duplex: "half",
      });

    if (uploadError) {
      console.error("❌ Erro no upload:", uploadError);
      return {
        success: false,
        error: `Erro no upload: ${uploadError.message}`,
      };
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from(AVATAR_CONFIG.bucketName)
      .getPublicUrl(uploadData.path);

    console.log("✅ Upload realizado com sucesso:", {
      publicUrl: publicUrl?.substring(0, 100) + "...",
      filePath: uploadData.path,
      mode: validated.mode,
      isTempFile: isForCreation,
    });

    // 🔄 LÓGICA DIFERENCIADA POR MODO
    if (validated.mode === "edit") {
      // MODO EDIÇÃO: atualizar perfil existente

      // Verificar se há avatar antigo
      const { data: currentProfile } = await supabaseAdmin
        .from("profiles")
        .select("avatar_url, full_name, email")
        .eq("id", validated.userId)
        .single();

      // Remover avatar antigo se existir
      if (currentProfile?.avatar_url) {
        try {
          const deleteResult = await deleteFileByUrl(currentProfile.avatar_url);
          if (deleteResult.success) {
            console.log("🗑️ Avatar antigo removido");
          } else {
            console.warn(
              "⚠️ Não foi possível remover avatar antigo:",
              deleteResult.error,
            );
          }
        } catch (err) {
          console.warn("⚠️ Erro ao tentar remover avatar antigo:", err);
        }
      }

      // Atualizar perfil
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", validated.userId);

      if (updateError) {
        // Rollback: remover arquivo se falhar
        await supabaseAdmin.storage
          .from(AVATAR_CONFIG.bucketName)
          .remove([uploadData.path]);

        return {
          success: false,
          error: `Erro ao atualizar perfil: ${updateError.message}`,
        };
      }

      // Registrar atividade
      await supabaseAdmin.from("system_activities").insert({
        user_id: validated.userId,
        action_type: "avatar_updated",
        description: `Avatar do agente ${currentProfile?.full_name || currentProfile?.email} atualizado`,
        resource_type: "profile",
        resource_id: validated.userId,
        metadata: {
          uploaded_by_admin: true,
          file_name: fileName,
          file_size: file.size,
          file_type: file.type,
          matricula: validated.matricula,
        },
      });

      // Revalidar cache
      revalidatePath("/admin/agentes");
      revalidatePath(`/admin/agentes/${validated.userId}`);

      return {
        success: true,
        message: "Avatar atualizado com sucesso!",
        data: {
          url: publicUrl,
          path: uploadData.path,
          fileName,
          mode: "edit",
          isTempFile: false,
        },
      };
    } else {
      // MODO CRIAÇÃO: apenas retornar dados (sem atualizar perfil)
      return {
        success: true,
        message: "Avatar carregado para novo agente",
        data: {
          url: publicUrl,
          path: uploadData.path, // 🔑 IMPORTANTE: Caminho para renomeação futura
          fileName,
          mode: "create",
          isTempFile: true,
          tempPath: filePath, // Caminho temporário completo
        },
      };
    }
  } catch (error) {
    console.error("❌ [uploadAgentAvatar] Erro:", error);

    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => {
          // ✅ CORREÇÃO: Mensagens de erro mais amigáveis
          if (issue.path.includes("matricula") && issue.code === "custom") {
            return issue.message;
          }
          return `${issue.path.join(".")}: ${issue.message}`;
        })
        .join(", ");
      return { success: false, error: errorMessages };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao fazer upload do avatar",
    };
  }
}

/**
 * Remover avatar (UNIFICADO para criar e editar)
 */
export async function removeAgentAvatar(formData: FormData) {
  try {
    console.log("🗑️ [removeAgentAvatar] Remoção iniciada...");

    const supabaseAdmin = createAdminClient();

    const rawData = {
      userId: formData.get("userId") as string,
      avatarUrl: formData.get("avatarUrl") as string,
      matricula: formData.get("matricula") as string,
      mode: (formData.get("mode") as "create" | "edit") || "edit",
    };

    console.log("📝 Dados para remoção:", {
      userId: rawData.userId,
      avatarUrl: rawData.avatarUrl?.substring(0, 50) + "...",
      matricula: rawData.matricula,
      mode: rawData.mode,
    });

    const validated = RemoveAvatarSchema.parse(rawData);

    // 🔄 LÓGICA DIFERENCIADA POR MODO
    if (validated.mode === "edit") {
      // MODO EDIÇÃO: remover do storage E atualizar perfil

      // Extrair path da URL usando função corrigida
      const { bucket, path } = extractFilePathFromUrl(validated.avatarUrl);

      if (!bucket || !path) {
        console.error("❌ Não foi possível extrair informações da URL");
        return {
          success: false,
          error: "URL do avatar inválida",
        };
      }

      console.log("🗑️ Removendo arquivo:", { bucket, path });

      // Remover do storage
      const { error: removeError } = await supabaseAdmin.storage
        .from(bucket)
        .remove([path]);

      if (removeError) {
        console.error("❌ Erro ao remover avatar:", removeError);
        return { success: false, error: removeError.message };
      }

      // Atualizar perfil
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", validated.userId)
        .select("full_name, email")
        .single();

      if (updateError) {
        console.error("❌ Erro ao atualizar perfil:", updateError);
        return { success: false, error: updateError.message };
      }

      // Registrar atividade
      await supabaseAdmin.from("system_activities").insert({
        user_id: validated.userId,
        action_type: "avatar_removed",
        description: `Avatar do agente ${updatedProfile.full_name || updatedProfile.email} removido`,
        resource_type: "profile",
        resource_id: validated.userId,
        metadata: {
          removed_by_admin: true,
          matricula: validated.matricula,
        },
      });

      // Revalidar cache
      revalidatePath("/admin/agentes");
      revalidatePath(`/admin/agentes/${validated.userId}`);

      console.log("✅ Avatar removido com sucesso");
      return {
        success: true,
        message: "Avatar removido com sucesso!",
      };
    } else {
      // MODO CRIAÇÃO: apenas remover do storage (não há perfil para atualizar)
      const { bucket, path } = extractFilePathFromUrl(validated.avatarUrl);

      if (!bucket || !path) {
        return {
          success: false,
          error: "URL do avatar inválida",
        };
      }

      const { error: removeError } = await supabaseAdmin.storage
        .from(bucket)
        .remove([path]);

      if (removeError) {
        console.error("❌ Erro ao remover arquivo temporário:", removeError);
        return { success: false, error: removeError.message };
      }

      console.log("✅ Arquivo temporário removido");
      return {
        success: true,
        message: "Pré-visualização de avatar removida",
      };
    }
  } catch (error) {
    console.error("❌ [removeAgentAvatar] Erro:", error);

    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errorMessages };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao remover avatar",
    };
  }
}

/**
 * Renomear avatar após criação do agente - CORRIGIDO
 */
export async function renameAvatarAfterCreation(
  tempAvatarUrl: string,
  newUserId: string,
  matricula: string,
): Promise<{ success: boolean; newUrl?: string; error?: string }> {
  try {
    console.log("🔄 [renameAvatarAfterCreation] Iniciando renomeação...", {
      tempAvatarUrl: tempAvatarUrl?.substring(0, 50) + "...",
      newUserId,
      matricula,
    });

    // ✅ CORREÇÃO: Validar matrícula antes de prosseguir
    if (!/^\d{11}$/.test(matricula)) {
      console.error("❌ Matrícula inválida para renomeação:", matricula);
      return {
        success: false,
        error: "Matrícula deve ter 11 dígitos numéricos para renomear avatar",
      };
    }

    const supabaseAdmin = createAdminClient();

    // 1. Extrair informações do arquivo temporário usando função corrigida
    const { bucket, path: tempPath } = extractFilePathFromUrl(tempAvatarUrl);

    if (!bucket || !tempPath) {
      console.error(
        "❌ Não foi possível extrair informações da URL temporária",
      );
      return {
        success: false,
        error: "URL do avatar temporário inválida",
      };
    }

    console.log("📁 Informações extraídas:", { bucket, tempPath });

    // 2. Verificar se o arquivo temporário existe
    const { data: fileExists, error: checkError } = await supabaseAdmin.storage
      .from(bucket)
      .list("", {
        search: tempPath.split("/").pop(),
      });

    if (checkError) {
      console.error("❌ Erro ao verificar arquivo:", checkError);
      return { success: false, error: checkError.message };
    }

    if (!fileExists || fileExists.length === 0) {
      console.error("❌ Arquivo temporário não encontrado:", tempPath);
      return { success: false, error: "Arquivo temporário não encontrado" };
    }

    console.log("✅ Arquivo temporário encontrado");

    // 3. Gerar novo nome de arquivo
    const tempFileName = tempPath.split("/").pop()!;
    const extension = tempFileName.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    // Nome final: matricula_userId_timestamp_random.extension
    const newFileName = `${matricula}_${newUserId.substring(0, 8)}_${timestamp}_${random}.${extension}`;
    const newPath = `${AVATAR_CONFIG.pathPrefix}${matricula}/${newFileName}`;

    console.log("📝 Renomeando:", {
      from: tempPath,
      to: newPath,
      tempFileName,
      newFileName,
    });

    // 4. Baixar arquivo temporário
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(bucket)
      .download(tempPath);

    if (downloadError) {
      console.error("❌ Erro ao baixar arquivo temporário:", downloadError);
      return { success: false, error: downloadError.message };
    }

    // 5. Fazer upload com novo nome
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(newPath, fileData, {
        contentType: fileData.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(
        "❌ Erro ao fazer upload do arquivo renomeado:",
        uploadError,
      );
      return { success: false, error: uploadError.message };
    }

    // 6. Remover arquivo temporário
    const { error: deleteError } = await supabaseAdmin.storage
      .from(bucket)
      .remove([tempPath]);

    if (deleteError) {
      console.warn(
        "⚠️ Arquivo renomeado mas não foi possível remover o temporário:",
        deleteError,
      );
      // Continuar mesmo assim, pois o rename foi bem sucedido
    }

    // 7. Obter nova URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(newPath);

    console.log("✅ Renomeação concluída com sucesso!");
    console.log("🔗 Nova URL:", publicUrl);

    return {
      success: true,
      newUrl: publicUrl,
    };
  } catch (error) {
    console.error("❌ [renameAvatarAfterCreation] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao renomear avatar",
    };
  }
}

/**
 * Limpar avatares temporários antigos
 */
export async function cleanupTempAvatars(maxAgeHours = 24): Promise<{
  success: boolean;
  cleaned: number;
  error?: string;
}> {
  try {
    console.log("🧹 [cleanupTempAvatars] Limpando avatares temporários...");

    const supabaseAdmin = createAdminClient();
    const { data: files, error } = await supabaseAdmin.storage
      .from(AVATAR_CONFIG.bucketName)
      .list(AVATAR_CONFIG.pathPrefix, {
        limit: 1000,
      });

    if (error) {
      console.error("❌ Erro ao listar arquivos:", error);
      return { success: false, error: error.message, cleaned: 0 };
    }

    const now = Date.now();
    let cleaned = 0;
    const filesToDelete: string[] = [];

    for (const file of files || []) {
      // Verificar se é arquivo temporário
      if (file.name.includes("temp_")) {
        // Extrair timestamp do nome do arquivo
        const timestampMatch = file.name.match(/temp_(\d+)_/);
        if (timestampMatch) {
          const fileTime = parseInt(timestampMatch[1]);
          const ageHours = (now - fileTime) / (1000 * 60 * 60);

          if (ageHours > maxAgeHours) {
            const filePath = `${AVATAR_CONFIG.pathPrefix}${file.name}`;
            filesToDelete.push(filePath);
            cleaned++;
            console.log(
              `🗑️  Marcado para limpeza: ${file.name} (${ageHours.toFixed(1)} horas)`,
            );
          }
        }
      }
    }

    if (filesToDelete.length > 0) {
      console.log(
        `🧹 Removendo ${filesToDelete.length} arquivos temporários...`,
      );
      const { error: deleteError } = await supabaseAdmin.storage
        .from(AVATAR_CONFIG.bucketName)
        .remove(filesToDelete);

      if (deleteError) {
        console.error("❌ Erro ao remover arquivos:", deleteError);
        return { success: false, error: deleteError.message, cleaned: 0 };
      }
    }

    console.log(`✅ Limpeza concluída: ${cleaned} arquivos removidos`);
    return { success: true, cleaned };
  } catch (error) {
    console.error("❌ [cleanupTempAvatars] Erro:", error);
    return {
      success: false,
      cleaned: 0,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
