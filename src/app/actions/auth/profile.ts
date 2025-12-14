"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema para atualização do próprio perfil
const UpdateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .optional(),
  telefone: z.string().optional(),
  uf: z.string().length(2, "UF deve ter 2 caracteres").optional(),
  data_nascimento: z.string().optional().nullable(),
  graduacao: z.string().optional(),
  tipo_sanguineo: z.string().optional(),
  validade_certificacao: z.string().optional().nullable(),
});

export async function getCurrentUserProfile() {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    // Buscar perfil do usuário atual
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar perfil: ${error.message}`);
    }

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Erro em getCurrentUserProfile:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar perfil",
    };
  }
}

export async function updateCurrentUserProfile(formData: FormData) {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    // Extrair dados do formulário
    const updates = {
      full_name: formData.get("full_name") as string,
      telefone: formData.get("telefone") as string,
      uf: formData.get("uf") as string,
      data_nascimento: formData.get("data_nascimento") as string,
      graduacao: formData.get("graduacao") as string,
      tipo_sanguineo: formData.get("tipo_sanguineo") as string,
      validade_certificacao: formData.get("validade_certificacao") as string,
    };

    // Validar dados
    const validatedUpdates = UpdateProfileSchema.parse(updates);

    // Remover campos undefined - SOLUÇÃO SEM PROBLEMAS DE ESLINT
    const cleanUpdates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(validatedUpdates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    // Atualizar perfil
    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar perfil: ${error.message}`);
    }

    // Atualizar também no Auth user_metadata
    try {
      const authUpdateData: Record<string, unknown> = {};

      if (validatedUpdates.full_name) {
        authUpdateData.user_metadata = {
          full_name: validatedUpdates.full_name,
        };
      }

      if (Object.keys(authUpdateData).length > 0) {
        await supabase.auth.admin.updateUserById(
          session.user.id,
          authUpdateData
        );
      }
    } catch (authError) {
      console.warn("Aviso: Perfil atualizado, mas erro no Auth:", authError);
    }

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: session.user.id,
      action_type: "profile_update",
      description: `Perfil de ${session.user.email} atualizado`,
      resource_type: "profile",
      resource_id: session.user.id,
      metadata: {
        updated_by: session.user.id,
        updated_by_email: session.user.email,
        changes: cleanUpdates,
      },
    });

    // Revalidar cache
    revalidatePath("/perfil");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Perfil atualizado com sucesso!",
      data: updatedProfile,
    };
  } catch (error) {
    console.error("Erro em updateCurrentUserProfile:", error);

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
        error instanceof Error ? error.message : "Erro ao atualizar perfil",
    };
  }
}
