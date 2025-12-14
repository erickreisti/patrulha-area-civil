"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UploadAvatarSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido"),
});

export async function uploadAvatar(formData: FormData) {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const rawData = {
      userId: formData.get("userId") as string,
    };
    const validated = UploadAvatarSchema.parse(rawData);

    const file = formData.get("file") as File;

    // Validações
    if (!file) {
      throw new Error("Nenhum arquivo enviado");
    }

    // Verificar permissões
    if (session.user.id !== validated.userId) {
      // Verificar se é admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        throw new Error("Você só pode fazer upload do seu próprio avatar");
      }
    }

    // Validações do arquivo
    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      throw new Error("Arquivo muito grande. Máximo: 2MB");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF."
      );
    }

    // Gerar nome do arquivo
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${validated.userId}/${Date.now()}.${fileExt}`;

    // Converter para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload para o storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatares-agentes")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatares-agentes").getPublicUrl(uploadData.path);

    // Atualizar perfil do usuário
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.userId)
      .select()
      .single();

    if (updateError) {
      // Tentar deletar o arquivo enviado se falhar a atualização
      await supabase.storage.from("avatares-agentes").remove([uploadData.path]);

      throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
    }

    // Registrar atividade se for admin atualizando outro usuário
    if (session.user.id !== validated.userId) {
      const { data: targetUser } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", validated.userId)
        .single();

      await supabase.from("system_activities").insert({
        user_id: session.user.id,
        action_type: "avatar_upload",
        description: `Avatar do agente ${
          targetUser?.full_name || targetUser?.email
        } atualizado`,
        resource_type: "profile",
        resource_id: validated.userId,
        metadata: {
          uploaded_by: session.user.id,
          uploaded_by_email: session.user.email,
          target_user_id: validated.userId,
          file_name: fileName,
          file_size: file.size,
          file_type: file.type,
        },
      });
    }

    // Revalidar cache
    revalidatePath("/perfil");
    revalidatePath("/admin/agentes");
    revalidatePath(`/admin/agentes/${validated.userId}`);

    return {
      success: true,
      message: "Avatar atualizado com sucesso!",
      data: {
        url: publicUrl,
        path: uploadData.path,
        file_name: fileName,
        file_size: file.size,
        profile: updatedProfile,
      },
    };
  } catch (error) {
    console.error("Erro em uploadAvatar:", error);

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
          : "Erro ao fazer upload do avatar",
    };
  }
}
