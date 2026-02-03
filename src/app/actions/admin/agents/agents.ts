"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==================== ZOD SCHEMAS ====================

const CreateAgentSchema = z.object({
  matricula: z
    .string()
    .min(1, "Matrícula é obrigatória")
    .regex(/^\d{11}$/, "Matrícula deve ter exatamente 11 dígitos"),
  email: z.string().email("Email inválido"),
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  graduacao: z.string().nullable().optional(),
  tipo_sanguineo: z.string().nullable().optional(),
  validade_certificacao: z.string().nullable().optional(),
  role: z.enum(["admin", "agent"]),
  status: z.boolean().optional().default(true),
  avatar_url: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  data_nascimento: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
});

const UpdateAgentSchema = z.object({
  id: z.string().uuid("ID inválido"),
  matricula: z
    .string()
    .min(1, "Matrícula é obrigatória")
    .regex(/^\d{11}$/, "Matrícula deve ter exatamente 11 dígitos")
    .optional(),
  email: z.string().email("Email inválido").optional(),
  full_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .optional(),
  graduacao: z.string().nullable().optional(),
  tipo_sanguineo: z.string().nullable().optional(),
  validade_certificacao: z.string().nullable().optional(),
  role: z.enum(["admin", "agent"]).optional(),
  status: z.boolean().optional(),
  avatar_url: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  data_nascimento: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
});

// ==================== TYPES ====================

export interface CreateAgentInput {
  matricula: string;
  email: string;
  full_name: string;
  graduacao?: string | null;
  tipo_sanguineo?: string | null;
  validade_certificacao?: string | null;
  role: "admin" | "agent";
  status?: boolean;
  avatar_url?: string | null;
  uf?: string | null;
  data_nascimento?: string | null;
  telefone?: string | null;
}

export interface UpdateAgentInput {
  id: string;
  matricula?: string;
  email?: string;
  full_name?: string;
  graduacao?: string | null;
  tipo_sanguineo?: string | null;
  validade_certificacao?: string | null;
  role?: "admin" | "agent";
  status?: boolean;
  avatar_url?: string | null;
  uf?: string | null;
  data_nascimento?: string | null;
  telefone?: string | null;
}

export interface Agent {
  id: string;
  matricula: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  graduacao: string | null;
  validade_certificacao: string | null;
  tipo_sanguineo: string | null;
  status: boolean;
  role: "admin" | "agent";
  created_at: string;
  updated_at: string;
  uf: string | null;
  data_nascimento: string | null;
  telefone: string | null;
  admin_secret_hash?: string | null;
  admin_secret_salt?: string | null;
  admin_2fa_enabled?: boolean;
  admin_last_auth?: string | null;
}

// ==================== FUNÇÕES UTILITÁRIAS ====================

/**
 * Valida se uma string é um UUID válido (Formato v4)
 * Evita erros 500 no PostgreSQL (invalid input syntax for type uuid)
 */
function isUUID(str: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Limpar avatar temporário em caso de falha
 */
async function cleanupTempAvatar(
  avatarUrl: string | null | undefined,
): Promise<void> {
  if (!avatarUrl) return;

  try {
    console.log(
      "🧹 [cleanupTempAvatar] Tentando limpar avatar temporário:",
      avatarUrl?.substring(0, 50) + "...",
    );

    // Import dinâmico para evitar dependências circulares se houver
    const { deleteFileByUrl } = await import("@/lib/supabase/storage");
    const result = await deleteFileByUrl(avatarUrl);

    if (result.success) {
      console.log("✅ Avatar temporário removido com sucesso");
    } else {
      console.warn(
        "⚠️ Não foi possível remover avatar temporário:",
        result.error,
      );
    }
  } catch (error) {
    console.error("❌ Erro ao tentar limpar avatar temporário:", error);
  }
}

// ==================== API FUNCTIONS ====================

export async function createAgent(input: CreateAgentInput) {
  try {
    console.log("🆕 [createAgent] Iniciando criação de agente...", {
      matricula: input.matricula,
      email: input.email,
      full_name: input.full_name,
      hasAvatar: !!input.avatar_url,
    });

    // Validar entrada
    const validated = CreateAgentSchema.parse(input);

    const supabaseAdmin = createAdminClient();

    // Processar avatar ANTES de criar usuário
    let finalAvatarUrl = validated.avatar_url || null;
    let tempAvatarToCleanup: string | null = null;

    if (validated.avatar_url && validated.avatar_url.includes("temp_")) {
      console.log(
        "🔄 [createAgent] Avatar temporário detectado, será processado após criação do usuário...",
      );
      tempAvatarToCleanup = validated.avatar_url;
    }

    // 1. Criar usuário no Auth
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email: validated.email,
        password: process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure",
        email_confirm: true,
        user_metadata: {
          matricula: validated.matricula,
          full_name: validated.full_name,
        },
      });

    if (userError) {
      console.error("❌ [createAgent] Erro ao criar usuário:", userError);

      if (tempAvatarToCleanup) {
        await cleanupTempAvatar(tempAvatarToCleanup);
      }

      return {
        success: false,
        error: userError.message.includes("already exists")
          ? "Email já cadastrado no sistema"
          : "Erro ao criar usuário",
      };
    }

    if (!userData.user) {
      if (tempAvatarToCleanup) {
        await cleanupTempAvatar(tempAvatarToCleanup);
      }
      return { success: false, error: "Falha ao criar usuário" };
    }

    console.log("✅ [createAgent] Usuário criado:", userData.user.id);

    // Renomear avatar se existir
    if (tempAvatarToCleanup) {
      try {
        const { renameAvatarAfterCreation } =
          await import("@/app/actions/upload/avatar");

        console.log("🔄 Renomeando avatar temporário...");
        const renameResult = await renameAvatarAfterCreation(
          tempAvatarToCleanup,
          userData.user.id,
          validated.matricula,
        );

        if (renameResult.success && renameResult.newUrl) {
          finalAvatarUrl = renameResult.newUrl;
          console.log(
            "✅ Avatar renomeado para ID real:",
            finalAvatarUrl?.substring(0, 50) + "...",
          );
        } else {
          console.warn(
            "⚠️ Não foi possível renomear avatar:",
            renameResult.error,
          );
          finalAvatarUrl = null;
        }
      } catch (error) {
        console.error("❌ Erro ao renomear avatar:", error);
        finalAvatarUrl = null;
      }
    }

    // 2. Criar perfil do agente
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userData.user.id,
        matricula: validated.matricula,
        email: validated.email,
        full_name: validated.full_name,
        graduacao: validated.graduacao,
        tipo_sanguineo: validated.tipo_sanguineo,
        validade_certificacao: validated.validade_certificacao,
        role: validated.role,
        status: validated.status ?? true,
        avatar_url: finalAvatarUrl,
        uf: validated.uf,
        data_nascimento: validated.data_nascimento,
        telefone: validated.telefone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (profileError) {
      console.error("❌ [createAgent] Erro ao criar perfil:", profileError);

      // Rollback: deletar usuário criado
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);

      if (tempAvatarToCleanup) {
        await cleanupTempAvatar(tempAvatarToCleanup);
      }

      if (finalAvatarUrl && finalAvatarUrl !== tempAvatarToCleanup) {
        await cleanupTempAvatar(finalAvatarUrl);
      }

      return {
        success: false,
        error: profileError.message.includes("unique constraint")
          ? "Matrícula ou email já cadastrados"
          : "Erro ao criar perfil",
      };
    }

    // 3. Registrar atividade
    await supabaseAdmin.from("system_activities").insert({
      user_id: userData.user.id,
      action_type: "agent_created",
      description: `Agente ${validated.full_name} criado por administrador`,
      resource_type: "agent",
      resource_id: userData.user.id,
      metadata: {
        matricula: validated.matricula,
        role: validated.role,
        created_by: "admin",
        has_avatar: !!finalAvatarUrl,
        avatar_processed: !!tempAvatarToCleanup,
      },
    });

    console.log("✅ [createAgent] Agente criado com sucesso!");

    revalidatePath("/admin/agentes");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: profile,
      message: `Agente ${validated.full_name} criado com sucesso!`,
    };
  } catch (error) {
    console.error("❌ [createAgent] Erro:", error);

    if (input.avatar_url) {
      await cleanupTempAvatar(input.avatar_url);
    }

    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err) => err.message).join(", ");
      return {
        success: false,
        error: errorMessages,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar agente",
    };
  }
}

export async function getAgents(filters?: {
  search?: string;
  role?: "admin" | "agent";
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}) {
  try {
    console.log("📋 [getAgents] Buscando agentes com filtros:", filters);

    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin.from("profiles").select("*", { count: "exact" });

    if (filters?.search) {
      query = query.or(
        `matricula.ilike.%${filters.search}%,email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`,
      );
    }

    if (filters?.role) {
      query = query.eq("role", filters.role);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status === "active");
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ [getAgents] Erro ao buscar agentes:", error);
      return { success: false, error: error.message };
    }

    const totalPages = count ? Math.ceil(count / limit) : 1;

    return {
      success: true,
      data: data as Agent[],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error) {
    console.error("❌ [getAgents] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function getAgent(id: string) {
  try {
    // 🛡️ SEGURANÇA: Verificar se ID é válido antes de chamar o banco
    if (!isUUID(id)) {
      return { success: false, error: "ID de agente inválido" };
    }

    console.log("👤 [getAgent] Buscando agente:", id);

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ [getAgent] Erro ao buscar agente:", error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Agente não encontrado" };
    }

    return {
      success: true,
      data: data as Agent,
    };
  } catch (error) {
    console.error("❌ [getAgent] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function updateAgent(
  id: string,
  input: Omit<UpdateAgentInput, "id">,
) {
  try {
    // 🛡️ SEGURANÇA: Validação de UUID
    if (!isUUID(id)) {
      return { success: false, error: "ID de agente inválido" };
    }

    console.log("✏️ [updateAgent] Atualizando agente:", id);

    const validationData = { id, ...input };
    const validated = UpdateAgentSchema.parse(validationData);

    const supabaseAdmin = createAdminClient();

    // Verificar se agente existe
    const { data: existingAgent, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id, matricula, email, avatar_url")
      .eq("id", id)
      .single();

    if (checkError || !existingAgent) {
      return { success: false, error: "Agente não encontrado" };
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Mapear campos
    if (validated.matricula !== undefined)
      updateData.matricula = validated.matricula;
    if (validated.email !== undefined) updateData.email = validated.email;
    if (validated.full_name !== undefined)
      updateData.full_name = validated.full_name;
    if (validated.graduacao !== undefined)
      updateData.graduacao = validated.graduacao;
    if (validated.tipo_sanguineo !== undefined)
      updateData.tipo_sanguineo = validated.tipo_sanguineo;
    if (validated.validade_certificacao !== undefined)
      updateData.validade_certificacao = validated.validade_certificacao;
    if (validated.role !== undefined) updateData.role = validated.role;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.uf !== undefined) updateData.uf = validated.uf;
    if (validated.data_nascimento !== undefined)
      updateData.data_nascimento = validated.data_nascimento;
    if (validated.telefone !== undefined)
      updateData.telefone = validated.telefone;

    // Tratamento de avatar
    if (validated.avatar_url !== undefined) {
      updateData.avatar_url = validated.avatar_url;

      if (validated.avatar_url === null && existingAgent.avatar_url) {
        try {
          console.log("🗑️ Removendo avatar antigo do storage...");
          const { deleteFileByUrl } = await import("@/lib/supabase/storage");
          await deleteFileByUrl(existingAgent.avatar_url);
        } catch (error) {
          console.warn("⚠️ Não foi possível remover avatar antigo:", error);
        }
      }
    }

    const { data: updatedAgent, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      console.error("❌ [updateAgent] Erro ao atualizar:", updateError);
      return {
        success: false,
        error: updateError.message.includes("unique constraint")
          ? "Matrícula ou email já existem"
          : "Erro ao atualizar agente",
      };
    }

    await supabaseAdmin.from("system_activities").insert({
      user_id: id,
      action_type: "agent_updated",
      description: `Agente ${updatedAgent.full_name || updatedAgent.email} atualizado`,
      resource_type: "agent",
      resource_id: id,
      metadata: {
        updated_fields: Object.keys(updateData),
        updated_by: "admin",
        avatar_changed: validated.avatar_url !== undefined,
      },
    });

    // Histórico
    await supabaseAdmin.from("profiles_history").insert({
      profile_id: id,
      matricula: updatedAgent.matricula,
      email: updatedAgent.email,
      full_name: updatedAgent.full_name,
      uf: updatedAgent.uf,
      graduacao: updatedAgent.graduacao,
      validade_certificacao: updatedAgent.validade_certificacao,
      tipo_sanguineo: updatedAgent.tipo_sanguineo,
      data_nascimento: updatedAgent.data_nascimento,
      telefone: updatedAgent.telefone,
      status: updatedAgent.status,
      role: updatedAgent.role,
      action_type: "UPDATE",
      changed_at: new Date().toISOString(),
      changed_by: "system",
      old_data: existingAgent,
      new_data: updatedAgent,
    });

    console.log("✅ [updateAgent] Agente atualizado com sucesso");

    revalidatePath("/admin/agentes");
    revalidatePath(`/admin/agentes/${id}`);
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: updatedAgent as Agent,
      message: "Agente atualizado com sucesso!",
    };
  } catch (error) {
    console.error("❌ [updateAgent] Erro:", error);

    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err) => err.message).join(", ");
      return {
        success: false,
        error: errorMessages,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao atualizar agente",
    };
  }
}

export async function deleteAgent(id: string) {
  try {
    // 🛡️ SEGURANÇA: Validação de UUID
    if (!isUUID(id)) {
      return { success: false, error: "ID de agente inválido" };
    }

    console.log("🗑️ [deleteAgent] Excluindo agente:", id);

    const supabaseAdmin = createAdminClient();

    // 1. Buscar dados para histórico
    const { data: agentData, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !agentData) {
      return { success: false, error: "Agente não encontrado" };
    }

    // 2. Remover avatar
    if (agentData.avatar_url) {
      try {
        const { deleteFileByUrl } = await import("@/lib/supabase/storage");
        await deleteFileByUrl(agentData.avatar_url);
      } catch (error) {
        console.warn("⚠️ Erro ao tentar remover avatar:", error);
      }
    }

    // 3. Registrar histórico
    await supabaseAdmin.from("profiles_history").insert({
      profile_id: id,
      matricula: agentData.matricula,
      email: agentData.email,
      full_name: agentData.full_name,
      uf: agentData.uf,
      graduacao: agentData.graduacao,
      validade_certificacao: agentData.validade_certificacao,
      tipo_sanguineo: agentData.tipo_sanguineo,
      data_nascimento: agentData.data_nascimento,
      telefone: agentData.telefone,
      status: agentData.status,
      role: agentData.role,
      action_type: "DELETE",
      changed_at: new Date().toISOString(),
      changed_by: "system",
      old_data: agentData,
      new_data: null,
    });

    // 4. Excluir perfil
    const { error: deleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("❌ [deleteAgent] Erro ao excluir perfil:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // 5. Excluir usuário do Auth
    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch (authError) {
      console.warn("⚠️ Não foi possível remover usuário do Auth:", authError);
    }

    // 6. Registrar atividade
    await supabaseAdmin.from("system_activities").insert({
      user_id: id,
      action_type: "agent_deleted",
      description: `Agente ${agentData.full_name || agentData.email} excluído do sistema`,
      resource_type: "agent",
      resource_id: id,
      metadata: {
        matricula: agentData.matricula,
        deleted_by: "admin",
        had_avatar: !!agentData.avatar_url,
      },
    });

    revalidatePath("/admin/agentes");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Agente excluído com sucesso!",
    };
  } catch (error) {
    console.error("❌ [deleteAgent] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function toggleAgentStatus(id: string) {
  try {
    // 🛡️ SEGURANÇA: Validação de UUID
    if (!isUUID(id)) {
      return { success: false, error: "ID de agente inválido" };
    }

    console.log("🔄 [toggleAgentStatus] Alternando status do agente:", id);

    const supabaseAdmin = createAdminClient();

    const { data: agent, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, status, full_name, email")
      .eq("id", id)
      .single();

    if (fetchError || !agent) {
      return { success: false, error: "Agente não encontrado" };
    }

    const newStatus = !agent.status;

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await supabaseAdmin.from("system_activities").insert({
      user_id: id,
      action_type: "agent_status_changed",
      description: `Status do agente ${agent.full_name || agent.email} alterado para ${newStatus ? "ATIVO" : "INATIVO"}`,
      resource_type: "agent",
      resource_id: id,
      metadata: {
        previous_status: agent.status,
        new_status: newStatus,
        changed_by: "admin",
      },
    });

    revalidatePath("/admin/agentes");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: { status: newStatus },
      message: `Agente ${newStatus ? "ativado" : "desativado"} com sucesso!`,
    };
  } catch (error) {
    console.error("❌ [toggleAgentStatus] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function getAgentsStats() {
  try {
    console.log("📊 [getAgentsStats] Buscando estatísticas...");

    const supabaseAdmin = createAdminClient();

    const { data: agents, error } = await supabaseAdmin
      .from("profiles")
      .select("id, role, status");

    if (error) {
      console.error("❌ [getAgentsStats] Erro:", error);
      return { success: false, error: error.message };
    }

    const total = agents?.length || 0;
    const active = agents?.filter((a) => a.status)?.length || 0;
    const inactive = agents?.filter((a) => !a.status)?.length || 0;
    const admins = agents?.filter((a) => a.role === "admin")?.length || 0;
    const regularAgents =
      agents?.filter((a) => a.role === "agent")?.length || 0;

    return {
      success: true,
      data: {
        total,
        active,
        inactive,
        admins,
        agents: regularAgents,
      },
    };
  } catch (error) {
    console.error("❌ [getAgentsStats] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
