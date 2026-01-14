// src/app/actions/admin/agents/agents.ts - VERSÃO ATUALIZADA COM getAdminClient
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import type { ProfileInsert, ProfileUpdate } from "@/lib/supabase/types";
import type { Json } from "@/lib/types/shared";

// IMPORT DO ADMIN CLIENT IGUAL AO DASHBOARD
import { getAdminClient } from "@/lib/supabase/admin";

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const BaseAgentSchema = z.object({
  matricula: z
    .string()
    .min(11, "Matrícula deve ter 11 dígitos")
    .max(11, "Matrícula deve ter 11 dígitos")
    .regex(/^\d+$/, "Matrícula deve conter apenas números")
    .transform((val) => val.replace(/\D/g, "")),
  email: z.string().email("Email inválido"),
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  graduacao: z.string().optional().nullable(),
  tipo_sanguineo: z.string().optional().nullable(),
  validade_certificacao: z.string().optional().nullable(),
  uf: z.string().length(2, "UF deve ter 2 caracteres").optional().nullable(),
  data_nascimento: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
});

const CreateAgentSchema = BaseAgentSchema.extend({
  role: z.enum(["admin", "agent"]).default("agent"),
  status: z.boolean().default(true),
});

const UpdateAgentSchema = BaseAgentSchema.partial().extend({
  id: z.string().uuid("ID inválido"),
  role: z.enum(["admin", "agent"]).optional(),
  status: z.boolean().optional(),
});

const DeleteAgentSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

const ListAgentsSchema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "agent", "all"]).default("all"),
  status: z.enum(["active", "inactive", "all"]).default("all"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
});

// ============================================
// TYPES
// ============================================

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
export type Agent = {
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
};

export type AgentsListResponse = {
  success: boolean;
  data?: Agent[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
};

export type AgentsStatsResponse = {
  success: boolean;
  data?: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    agents: number;
    updated_at: string;
  };
  error?: string;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper para converter Record<string, unknown> para Json
function toJson(data?: Record<string, unknown>): Json | null {
  if (!data) return null;
  try {
    return JSON.parse(JSON.stringify(data)) as Json;
  } catch {
    return data as Json;
  }
}

async function logActivity(
  adminClient: Awaited<ReturnType<typeof getAdminClient>>,
  userId: string,
  action: string,
  description: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const activityData = {
      user_id: userId,
      action_type: action,
      description: description,
      resource_type: "profile",
      resource_id: resourceId || null,
      metadata: toJson(metadata),
      created_at: new Date().toISOString(),
    };

    const { error } = await adminClient
      .from("system_activities")
      .insert([activityData]);

    if (error) {
      console.error("❌ Erro ao registrar atividade:", error);
    }
  } catch (error) {
    console.error("❌ Erro ao registrar atividade:", error);
  }
}

// ============================================
// FUNÇÕES AUXILIARES SIMPLIFICADAS
// ============================================

// Função para verificar cookies admin (mantida para compatibilidade)
async function verifyAdminSession(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get("admin_session");
    const isAdminCookie = cookieStore.get("is_admin")?.value === "true";

    if (!isAdminCookie || !adminSessionCookie) {
      return { success: false, error: "admin_session_required" };
    }

    const sessionData = JSON.parse(adminSessionCookie.value);
    const expiresAt = new Date(sessionData.expiresAt);

    if (expiresAt < new Date()) {
      return { success: false, error: "admin_session_expired" };
    }

    return { success: true, userId: sessionData.userId };
  } catch {
    return { success: false, error: "admin_session_invalid" };
  }
}

// ============================================
// CRUD OPERATIONS COM ADMIN CLIENT
// ============================================

/**
 * Criar novo agente
 */
export async function createAgent(input: CreateAgentInput) {
  try {
    console.log("🔍 [createAgent] Iniciando...");

    // 1. Verificar cookies admin
    const session = await verifyAdminSession();
    if (!session.success) {
      console.log("❌ [createAgent] Acesso negado:", session.error);
      return { success: false, error: session.error };
    }

    // 2. Validar entrada
    const validated = CreateAgentSchema.parse(input);

    // 3. Usar admin client (igual ao dashboard)
    const adminClient = await getAdminClient();

    // 4. Verificar unicidade
    const { data: existingMatricula } = await adminClient
      .from("profiles")
      .select("id")
      .eq("matricula", validated.matricula)
      .single();

    if (existingMatricula) {
      throw new Error("Matrícula já cadastrada no sistema.");
    }

    const { data: existingEmail } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", validated.email)
      .single();

    if (existingEmail) {
      throw new Error("Email já cadastrada no sistema.");
    }

    // 5. Criar usuário no Auth usando admin client (tem permissões necessárias)
    const defaultPassword =
      process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure";

    const { data: authUser, error: authError } =
      await adminClient.auth.admin.createUser({
        email: validated.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          full_name: validated.full_name,
          matricula: validated.matricula,
        },
      });

    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }

    // 6. Criar perfil
    const profileData: ProfileInsert = {
      id: authUser.user.id,
      matricula: validated.matricula,
      email: validated.email,
      full_name: validated.full_name,
      role: validated.role,
      status: validated.status,
      graduacao: validated.graduacao || null,
      tipo_sanguineo: validated.tipo_sanguineo || null,
      validade_certificacao: validated.validade_certificacao || null,
      uf: validated.uf || null,
      data_nascimento: validated.data_nascimento || null,
      telefone: validated.telefone || null,
      avatar_url: validated.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newAgent, error: profileError } = await adminClient
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      // Rollback: deletar usuário do Auth
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Erro ao criar perfil: ${profileError.message}`);
    }

    // 7. Registrar atividade
    try {
      await logActivity(
        adminClient,
        session.userId!,
        "agent_creation",
        `Agente ${validated.full_name} (${validated.matricula}) criado`,
        newAgent.id,
        { agent_data: validated }
      );
    } catch (activityError) {
      console.error("❌ Erro ao registrar atividade:", activityError);
    }

    // 8. Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Agente criado com sucesso!",
      data: newAgent,
    };
  } catch (error) {
    console.error("❌ Erro em createAgent:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar agente",
    };
  }
}

/**
 * Buscar agente por ID
 */
export async function getAgent(id: string) {
  try {
    console.log("🔍 [getAgent] Buscando agente:", id);

    // 1. Verificar cookies admin
    const session = await verifyAdminSession();
    if (!session.success) {
      console.log("❌ [getAgent] Acesso negado:", session.error);
      return { success: false, error: session.error };
    }

    // 2. Usar admin client
    const adminClient = await getAdminClient();

    // 3. Buscar agente
    const { data: agent, error } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Agente não encontrado: ${error.message}`);
    }

    console.log("✅ [getAgent] Agente encontrado:", agent?.full_name);
    return {
      success: true,
      data: agent,
    };
  } catch (error) {
    console.error("❌ Erro em getAgent:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar agente",
    };
  }
}

/**
 * Atualizar agente (completo ou parcial)
 */
export async function updateAgent(
  id: string,
  input: Partial<UpdateAgentInput>
) {
  try {
    console.log("🔍 [updateAgent] Atualizando agente:", id);

    // 1. Verificar cookies admin
    const session = await verifyAdminSession();
    if (!session.success) {
      console.log("❌ [updateAgent] Acesso negado:", session.error);
      return { success: false, error: session.error };
    }

    // 2. Validar entrada
    const validated = UpdateAgentSchema.partial().parse({ id, ...input });

    // 3. Usar admin client
    const adminClient = await getAdminClient();

    // 4. Buscar agente atual
    const { data: currentAgent } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentAgent) {
      throw new Error("Agente não encontrado.");
    }

    // 5. Preparar dados para atualização
    const updateData: ProfileUpdate = {
      ...validated,
      updated_at: new Date().toISOString(),
    };

    // 6. Verificar unicidade (se alterar matrícula ou email)
    if (validated.matricula && validated.matricula !== currentAgent.matricula) {
      const { data: existingMatricula } = await adminClient
        .from("profiles")
        .select("id")
        .eq("matricula", validated.matricula)
        .neq("id", id)
        .single();

      if (existingMatricula) {
        throw new Error("Matrícula já está em uso por outro agente.");
      }
    }

    if (validated.email && validated.email !== currentAgent.email) {
      const { data: existingEmail } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", validated.email)
        .neq("id", id)
        .single();

      if (existingEmail) {
        throw new Error("Email já está em uso por outro agente.");
      }
    }

    // 7. Atualizar agente
    const { data: updatedAgent, error } = await adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar agente: ${error.message}`);
    }

    // 8. Registrar no histórico
    const historyData = {
      profile_id: id,
      matricula: currentAgent.matricula,
      email: currentAgent.email,
      full_name: currentAgent.full_name,
      uf: currentAgent.uf,
      avatar_url: currentAgent.avatar_url,
      graduacao: currentAgent.graduacao,
      validade_certificacao: currentAgent.validade_certificacao,
      tipo_sanguineo: currentAgent.tipo_sanguineo,
      data_nascimento: currentAgent.data_nascimento,
      telefone: currentAgent.telefone,
      status: currentAgent.status,
      role: currentAgent.role,
      action_type: "UPDATE",
      changed_by: session.userId,
      old_data: toJson(currentAgent as Record<string, unknown>),
      new_data: toJson(updatedAgent as Record<string, unknown>),
    };

    await adminClient.from("profiles_history").insert(historyData);

    // 9. Registrar atividade
    const changes = Object.keys(validated).filter((key) => key !== "id");
    await logActivity(
      adminClient,
      session.userId!,
      "agent_update",
      `Agente ${
        currentAgent.full_name || currentAgent.email
      } atualizado. Campos: ${changes.join(", ")}`,
      id,
      {
        changed_fields: changes,
        previous_data: currentAgent,
        new_data: updatedAgent,
      }
    );

    // 10. Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath(`/admin/agentes/${id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Agente atualizado com sucesso!",
      data: updatedAgent,
    };
  } catch (error) {
    console.error("❌ Erro em updateAgent:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar agente",
    };
  }
}

/**
 * Deletar agente permanentemente
 */
export async function deleteAgent(id: string) {
  try {
    console.log("🔍 [deleteAgent] Excluindo agente:", id);

    // 1. Verificar cookies admin
    const session = await verifyAdminSession();
    if (!session.success) {
      console.log("❌ [deleteAgent] Acesso negado:", session.error);
      return { success: false, error: session.error };
    }

    // 2. Validar
    const validated = DeleteAgentSchema.parse({ id });

    // 3. Usar admin client
    const adminClient = await getAdminClient();

    // 4. Buscar dados do agente antes de excluir
    const { data: agentData } = await adminClient
      .from("profiles")
      .select("matricula, email, full_name")
      .eq("id", validated.id)
      .single();

    if (!agentData) {
      throw new Error("Agente não encontrado.");
    }

    // 5. Registrar no histórico antes de excluir
    const historyData = {
      profile_id: validated.id,
      matricula: agentData.matricula,
      email: agentData.email,
      full_name: agentData.full_name,
      action_type: "DELETE",
      changed_by: session.userId,
      old_data: toJson(agentData as Record<string, unknown>),
    };

    await adminClient.from("profiles_history").insert(historyData);

    // 6. Excluir agente
    const { error } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", validated.id);

    if (error) {
      throw new Error(`Erro ao excluir agente: ${error.message}`);
    }

    // 7. Tentar excluir do Auth também
    try {
      await adminClient.auth.admin.deleteUser(validated.id);
    } catch (authError) {
      console.warn("⚠️ Não foi possível excluir usuário do Auth:", authError);
    }

    // 8. Registrar atividade
    await logActivity(
      adminClient,
      session.userId!,
      "agent_deletion",
      `Agente ${agentData.full_name || agentData.email} (${
        agentData.matricula
      }) excluído`,
      validated.id,
      {
        agent_data: agentData,
      }
    );

    // 9. Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Agente excluído com sucesso!",
    };
  } catch (error) {
    console.error("❌ Erro em deleteAgent:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir agente",
    };
  }
}

/**
 * Listar agentes com filtros e paginação
 */
export async function getAgents(
  filters?: Partial<z.infer<typeof ListAgentsSchema>>
): Promise<AgentsListResponse> {
  try {
    console.log("🔍 [getAgents] Iniciando...");

    // 1. VERIFICAR COOKIES ADMIN
    const session = await verifyAdminSession();
    if (!session.success) {
      console.log("❌ [getAgents] Acesso negado:", session.error);
      return {
        success: false,
        error: session.error,
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        },
      };
    }

    console.log("✅ [getAgents] Acesso via cookies admin - Aprovado");

    const adminClient = await getAdminClient();

    // 2. Validar filtros
    const validatedFilters = ListAgentsSchema.parse(filters || {});
    const { search, role, status, page, limit } = validatedFilters;
    const offset = (page - 1) * limit;

    // 3. Construir query
    let query = adminClient.from("profiles").select("*", { count: "exact" });

    // Aplicar filtros
    if (search) {
      query = query.or(
        `matricula.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`
      );
    }

    if (role !== "all") {
      query = query.eq("role", role);
    }

    if (status !== "all") {
      query = query.eq("status", status === "active");
    }

    // 4. Executar query
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("❌ [getAgents] Erro do Supabase:", error);
      throw new Error(`Erro ao buscar agentes: ${error.message}`);
    }

    console.log(`✅ [getAgents] ${data?.length || 0} agentes encontrados`);

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error("❌ [getAgents] Erro:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    return {
      success: false,
      error: errorMessage,
      data: [],
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 50,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

// ============================================
// OPERAÇÕES DE ESTATÍSTICAS - CORRIGIDAS
// ============================================

/**
 * Obter estatísticas de agentes - VERSÃO COM ADMIN CLIENT
 */
export async function getAgentsStats(): Promise<AgentsStatsResponse> {
  try {
    console.log("🔍 [getAgentsStats] Iniciando...");

    // 1. Verificar cookies admin
    const session = await verifyAdminSession();
    if (!session.success) {
      console.log("❌ [getAgentsStats] Acesso negado:", session.error);
      return {
        success: false,
        error: session.error,
      };
    }

    // 2. Usar Admin Client igual ao dashboard
    const adminClient = await getAdminClient();

    console.log("✅ [getAgentsStats] Admin client conectado");

    // 3. Buscar estatísticas
    console.log("📊 [getAgentsStats] Buscando dados...");

    const [totalResult, activeResult, adminsResult, agentsResult] =
      await Promise.all([
        // Total de perfis
        adminClient
          .from("profiles")
          .select("id", { count: "exact", head: true }),

        // Agentes ativos
        adminClient
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("status", true),

        // Administradores
        adminClient
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin"),

        // Agentes normais
        adminClient
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "agent"),
      ]);

    // 4. Verificar erros
    const errors = [
      totalResult.error,
      activeResult.error,
      adminsResult.error,
      agentsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error("❌ [getAgentsStats] Erros nas queries:", errors);
      throw new Error("Erro ao buscar estatísticas do banco de dados.");
    }

    const total = totalResult.count || 0;
    const active = activeResult.count || 0;
    const admins = adminsResult.count || 0;
    const agents = agentsResult.count || 0;
    const inactive = total - active;

    console.log("📊 [getAgentsStats] Resultados:", {
      total,
      active,
      inactive,
      admins,
      agents,
    });

    return {
      success: true,
      data: {
        total,
        active,
        inactive,
        admins,
        agents,
        updated_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("❌ [getAgentsStats] Erro crítico:", error);

    // Retornar dados zerados em caso de erro, mas manter a estrutura
    return {
      success: true, // Ainda sucesso para não quebrar o frontend
      data: {
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
        agents: 0,
        updated_at: new Date().toISOString(),
      },
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// ============================================
// OPERAÇÕES ESPECÍFICAS (Conveniência)
// ============================================

/**
 * Atualizar apenas status do agente
 */
export async function updateAgentStatus(id: string, status: boolean) {
  return updateAgent(id, { status });
}

/**
 * Atualizar apenas matrícula do agente
 */
export async function updateAgentMatricula(id: string, matricula: string) {
  return updateAgent(id, { matricula });
}

/**
 * Atualizar apenas email do agente
 */
export async function updateAgentEmail(id: string, email: string) {
  return updateAgent(id, { email });
}

/**
 * Alternar status do agente (toggle)
 */
export async function toggleAgentStatus(id: string) {
  try {
    const agent = await getAgent(id);

    if (!agent.success || !agent.data) {
      throw new Error("Agente não encontrado");
    }

    const newStatus = !agent.data.status;
    return updateAgentStatus(id, newStatus);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao alternar status",
    };
  }
}

/**
 * Atualizar avatar do agente
 */
export async function updateAgentAvatar(id: string, avatar_url: string) {
  return updateAgent(id, { avatar_url });
}

// ============================================
// OPERAÇÕES DE VALIDAÇÃO
// ============================================

/**
 * Verificar se matrícula está disponível
 */
export async function validateMatricula(
  matricula: string,
  excludeId?: string
): Promise<boolean> {
  try {
    // Usar admin client para validação
    const adminClient = await getAdminClient();

    let query = adminClient
      .from("profiles")
      .select("id")
      .eq("matricula", matricula);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();

    return !data; // Disponível se não encontrar
  } catch (error) {
    console.error("❌ Erro em validateMatricula:", error);
    return true; // Se erro, assume disponível
  }
}

/**
 * Verificar se email está disponível
 */
export async function validateEmail(
  email: string,
  excludeId?: string
): Promise<boolean> {
  try {
    // Usar admin client para validação
    const adminClient = await getAdminClient();

    let query = adminClient.from("profiles").select("id").eq("email", email);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();

    return !data; // Disponível se não encontrar
  } catch (error) {
    console.error("❌ Erro em validateEmail:", error);
    return true; // Se erro, assume disponível
  }
}

// ============================================
// OPERAÇÕES EM MASSA
// ============================================

/**
 * Atualizar múltiplos agentes
 */
export async function bulkUpdateAgents(
  ids: string[],
  updates: Partial<Omit<UpdateAgentInput, "id">>
) {
  try {
    // 1. Verificar cookies admin
    const session = await verifyAdminSession();
    if (!session.success) {
      console.log("❌ [bulkUpdateAgents] Acesso negado:", session.error);
      return { success: false, error: session.error };
    }

    if (!ids.length) {
      throw new Error("Nenhum agente selecionado.");
    }

    // 2. Usar admin client
    const adminClient = await getAdminClient();

    const { error } = await adminClient
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) {
      throw new Error(`Erro na atualização em massa: ${error.message}`);
    }

    // 3. Registrar atividade
    await logActivity(
      adminClient,
      session.userId!,
      "bulk_agent_update",
      `${ids.length} agentes atualizados. Campos: ${Object.keys(updates).join(
        ", "
      )}`,
      undefined,
      {
        agent_ids: ids,
        updates,
        count: ids.length,
      }
    );

    // 4. Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${ids.length} agentes atualizados com sucesso!`,
    };
  } catch (error) {
    console.error("❌ Erro em bulkUpdateAgents:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro na atualização em massa",
    };
  }
}

/**
 * Exportar agentes para CSV
 */
export async function exportAgentsToCSV(
  filters?: Partial<z.infer<typeof ListAgentsSchema>>
) {
  try {
    // 1. Verificar cookies admin
    const session = await verifyAdminSession();
    if (!session.success) {
      console.log("❌ [exportAgentsToCSV] Acesso negado:", session.error);
      return { success: false, error: session.error };
    }

    const result = await getAgents({ ...filters, limit: 1000 });

    if (!result.success || !result.data) {
      throw new Error(result.error || "Erro ao buscar agentes");
    }

    // Criar cabeçalhos CSV
    const headers = [
      "Matrícula",
      "Nome",
      "Email",
      "Graduação",
      "Tipo Sanguíneo",
      "Status",
      "Tipo",
      "Data de Criação",
    ];

    // Criar linhas
    const rows = result.data.map((agent) => [
      agent.matricula,
      agent.full_name || "",
      agent.email,
      agent.graduacao || "",
      agent.tipo_sanguineo || "",
      agent.status ? "Ativo" : "Inativo",
      agent.role === "admin" ? "Administrador" : "Agente",
      new Date(agent.created_at).toLocaleDateString("pt-BR"),
    ]);

    // Juntar tudo
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return {
      success: true,
      data: csvContent,
      filename: `agentes_${new Date().toISOString().split("T")[0]}.csv`,
    };
  } catch (error) {
    console.error("❌ Erro em exportAgentsToCSV:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao exportar agentes",
    };
  }
}
