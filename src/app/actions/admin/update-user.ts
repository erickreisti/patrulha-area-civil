"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ProfileUpdate } from "@/lib/supabase/types";

// Schema para atualização de usuário
const UpdateUserSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido"),
  newEmail: z.string().email("Email inválido").optional(),
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .optional(),
  metadata: z
    .object({
      graduacao: z.string().optional().nullable(),
      tipo_sanguineo: z.string().optional().nullable(),
      validade_certificacao: z.string().optional().nullable(),
      avatar_url: z.string().optional().nullable(),
    })
    .optional(),
});

// Interface para dados do Auth
interface AuthUpdateData {
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export async function updateUser(formData: FormData) {
  try {
    const supabase = await createServerClient();

    // Verificar autenticação e permissões
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Não autorizado. Faça login para continuar.");
    }

    // Verificar se é admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!adminProfile) {
      throw new Error("Apenas administradores podem atualizar usuários.");
    }

    // Extrair e validar dados
    const rawData = {
      userId: formData.get("userId") as string,
      newEmail: formData.get("newEmail") as string,
      fullName: formData.get("fullName") as string,
      metadata: {
        graduacao: formData.get("graduacao") as string,
        tipo_sanguineo: formData.get("tipo_sanguineo") as string,
        validade_certificacao: formData.get("validade_certificacao") as string,
        avatar_url: formData.get("avatar_url") as string,
      },
    };

    const validated = UpdateUserSchema.parse(rawData);

    // Verificar se usuário existe
    const { data: existingUser, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", validated.userId)
      .single();

    if (userError || !existingUser) {
      throw new Error("Usuário não encontrado.");
    }

    // Preparar dados de atualização com tipo específico
    const updateData: ProfileUpdate = {
      updated_at: new Date().toISOString(),
    };

    // Verificar unicidade de email (se for alterar)
    if (validated.newEmail && validated.newEmail !== existingUser.email) {
      const { data: emailExists } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", validated.newEmail)
        .neq("id", validated.userId)
        .single();

      if (emailExists) {
        throw new Error("Este email já está em uso por outro usuário.");
      }

      updateData.email = validated.newEmail;
    }

    // Atualizar nome se fornecido
    if (validated.fullName) {
      updateData.full_name = validated.fullName;
    }

    // Atualizar metadata se fornecido
    if (validated.metadata) {
      if (validated.metadata.graduacao !== undefined) {
        updateData.graduacao = validated.metadata.graduacao;
      }
      if (validated.metadata.tipo_sanguineo !== undefined) {
        updateData.tipo_sanguineo = validated.metadata.tipo_sanguineo;
      }
      if (validated.metadata.validade_certificacao !== undefined) {
        updateData.validade_certificacao =
          validated.metadata.validade_certificacao;
      }
      if (validated.metadata.avatar_url !== undefined) {
        updateData.avatar_url = validated.metadata.avatar_url;
      }
    }

    // Atualizar no banco
    const { data: updatedUser, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", validated.userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erro ao atualizar usuário: ${updateError.message}`);
    }

    // Atualizar no Auth se necessário (email ou metadata)
    if (validated.newEmail || validated.fullName || validated.metadata) {
      try {
        const authUpdateData: AuthUpdateData = {};

        if (validated.newEmail) {
          authUpdateData.email = validated.newEmail;
        }

        // Obter metadados atuais do Auth
        const { data: authUser } = await supabase.auth.admin.getUserById(
          validated.userId
        );

        const currentMetadata = authUser?.user?.user_metadata || {};

        if (validated.fullName || validated.metadata) {
          authUpdateData.user_metadata = {
            ...currentMetadata,
            ...(validated.fullName ? { full_name: validated.fullName } : {}),
            ...(validated.metadata?.graduacao !== undefined
              ? { graduacao: validated.metadata.graduacao }
              : {}),
            ...(validated.metadata?.tipo_sanguineo !== undefined
              ? { tipo_sanguineo: validated.metadata.tipo_sanguineo }
              : {}),
            ...(validated.metadata?.validade_certificacao !== undefined
              ? {
                  validade_certificacao:
                    validated.metadata.validade_certificacao,
                }
              : {}),
            ...(validated.metadata?.avatar_url !== undefined
              ? { avatar_url: validated.metadata.avatar_url }
              : {}),
          };
        }

        if (Object.keys(authUpdateData).length > 0) {
          await supabase.auth.admin.updateUserById(
            validated.userId,
            authUpdateData
          );
        }
      } catch (authError) {
        console.warn(
          "Aviso: Usuário atualizado no banco, mas erro no Auth:",
          authError
        );
        // Não lançamos erro para não reverter a atualização do banco
      }
    }

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: session.user.id,
      action_type: "user_update",
      description: `Usuário ${existingUser.email} atualizado por ${session.user.email}`,
      resource_type: "profile",
      resource_id: validated.userId,
      metadata: {
        updated_by: session.user.id,
        updated_by_email: session.user.email,
        changes: updateData,
        previous_data: existingUser,
        timestamp: new Date().toISOString(),
      },
    });

    // Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath(`/admin/agentes/${validated.userId}`);

    return {
      success: true,
      message: "Usuário atualizado com sucesso!",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Erro em updateUser:", error);

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
        error instanceof Error ? error.message : "Erro ao atualizar usuário",
    };
  }
}
