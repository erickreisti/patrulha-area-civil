"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Json } from "@/lib/types/shared";

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

// Função auxiliar para converter para Json
function toJson(data: Record<string, unknown>): Json {
  return JSON.parse(JSON.stringify(data)) as Json;
}

// Cliente com Service Role para bypass RLS
function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Cliente público para autenticação
function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getCurrentUserProfile() {
  try {
    const supabase = createPublicClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    // Buscar perfil do usuário atual (usa RLS normal)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Erro RLS ao buscar perfil:", error);
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
    // Usar cliente público para verificar sessão
    const supabasePublic = createPublicClient();

    const {
      data: { session },
    } = await supabasePublic.auth.getSession();

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

    // Remover campos undefined
    const cleanUpdates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(validatedUpdates)) {
      if (value !== undefined && value !== null && value !== "") {
        cleanUpdates[key] = value;
      }
    }

    // Se não houver nada para atualizar
    if (Object.keys(cleanUpdates).length === 0) {
      return {
        success: false,
        error: "Nenhum dado fornecido para atualização",
      };
    }

    // Usar Service Role para bypass RLS na atualização
    const supabaseAdmin = createServiceRoleClient();

    console.log("Atualizando perfil com dados:", cleanUpdates);
    console.log("Usuário ID:", session.user.id);

    // Atualizar perfil (bypass RLS)
    const { data: updatedProfile, error } = await supabaseAdmin
      .from("profiles")
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Erro RLS na atualização:", error);
      throw new Error(
        `Erro ao atualizar perfil: ${error.message} (Código: ${error.code})`
      );
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
        await supabaseAdmin.auth.admin.updateUserById(
          session.user.id,
          authUpdateData
        );
      }
    } catch (authError) {
      console.warn("Aviso: Perfil atualizado, mas erro no Auth:", authError);
      // Não falha a operação principal se isso falhar
    }

    // Registrar atividade
    const activityMetadata: Json = toJson({
      updated_by: session.user.id,
      updated_by_email: session.user.email,
      changes: cleanUpdates,
    });

    try {
      await supabaseAdmin.from("system_activities").insert({
        user_id: session.user.id,
        action_type: "profile_update",
        description: `Perfil de ${session.user.email} atualizado`,
        resource_type: "profile",
        resource_id: session.user.id,
        metadata: activityMetadata,
        created_at: new Date().toISOString(),
      });
    } catch (activityError) {
      console.warn("Erro ao registrar atividade:", activityError);
      // Não falha a operação principal
    }

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
