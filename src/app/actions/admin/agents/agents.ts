"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ProfileInsert, ProfileUpdate } from "@/lib/supabase/types";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";

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

// Tipos para as funções auxiliares
interface AdminProfile {
  role: "admin" | "agent";
  full_name?: string | null;
  email: string;
}

interface AdminVerificationResult {
  session: Session;
  profile: AdminProfile;
}

// ============================================
// FUNÇÕES AUXILIARES (PRIVADAS)
// ============================================

async function verifyAdminAccess(
  supabase: SupabaseClient
): Promise<AdminVerificationResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Não autorizado. Faça login para continuar.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", session.user.id)
    .eq("role", "admin")
    .single();

  if (!profile) {
    throw new Error("Apenas administradores podem realizar esta ação.");
  }

  return { session, profile: profile as AdminProfile };
}

async function logActivity(
  supabase: SupabaseClient,
  session: Session,
  action: string,
  description: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await supabase.from("system_activities").insert({
      user_id: session.user.id,
      action_type: action,
      description,
      resource_type: "profile",
      resource_id: resourceId,
      metadata,
    });
  } catch (error) {
    console.error("Erro ao registrar atividade:", error);
  }
}

// ============================================
// OPERAÇÕES PRINCIPAIS (CRUD)
// ============================================

/**
 * Criar novo agente
 */
export async function createAgent(input: CreateAgentInput) {
  try {
    const supabase = await createServerClient();
    const { session, profile } = await verifyAdminAccess(supabase);

    // Validar entrada
    const validated = CreateAgentSchema.parse(input);

    // Verificar unicidade
    const { data: existingMatricula } = await supabase
      .from("profiles")
      .select("id")
      .eq("matricula", validated.matricula)
      .single();

    if (existingMatricula) {
      throw new Error("Matrícula já cadastrada no sistema.");
    }

    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", validated.email)
      .single();

    if (existingEmail) {
      throw new Error("Email já cadastrado no sistema.");
    }

    // Criar usuário no Auth
    const defaultPassword =
      process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure";

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
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

    // Criar perfil
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

    const { data: newAgent, error: profileError } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      // Rollback: deletar usuário do Auth
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Erro ao criar perfil: ${profileError.message}`);
    }

    // Registrar atividade
    await logActivity(
      supabase,
      session,
      "agent_creation",
      `Agente ${validated.full_name} (${validated.matricula}) criado por ${profile.email}`,
      newAgent.id,
      { agent_data: validated, created_by: profile.email }
    );

    // Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Agente criado com sucesso!",
      data: newAgent,
    };
  } catch (error) {
    console.error("Erro em createAgent:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
        details: error.flatten().fieldErrors,
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
    const supabase = await createServerClient();

    // ✅ PRIMEIRO: VERIFICAR SESSÃO ADMIN VIA COOKIES
    const authModule = await import("@/app/actions/auth/auth");
    const adminSession = await authModule.verifyAdminSession();

    if (adminSession.success && adminSession.user) {
      console.log("✅ [getAgent] Acesso via sessão admin (cookies)");

      const { data: agent, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Agente não encontrado: ${error.message}`);
      }

      return {
        success: true,
        data: agent,
      };
    }

    // ✅ SEGUNDO: VERIFICAR SESSÃO SUPABASE NORMAL
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Não autorizado. Faça login para continuar.");
    }

    const { data: agent, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Agente não encontrado: ${error.message}`);
    }

    // Verificar permissões
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    // Se não for admin e não for o próprio perfil
    if (currentProfile?.role !== "admin" && agent.id !== session.user.id) {
      throw new Error("Você não tem permissão para visualizar este agente.");
    }

    return {
      success: true,
      data: agent,
    };
  } catch (error) {
    console.error("Erro em getAgent:", error);

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
    const supabase = await createServerClient();

    // ✅ PRIMEIRO: VERIFICAR SESSÃO ADMIN VIA COOKIES
    const authModule = await import("@/app/actions/auth/auth");
    const adminSession = await authModule.verifyAdminSession();

    let session: Session;
    let profile: AdminProfile;

    if (adminSession.success && adminSession.user) {
      console.log("✅ [updateAgent] Acesso via sessão admin (cookies)");

      // Buscar perfil do admin via service role
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      const { data: adminProfile } = await supabaseAdmin
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", adminSession.user.id)
        .eq("role", "admin")
        .single();

      if (!adminProfile) {
        throw new Error("Perfil admin não encontrado.");
      }

      session = { user: { id: adminSession.user.id } } as Session;
      profile = adminProfile as AdminProfile;
    } else {
      // ✅ SEGUNDO: VERIFICAR SESSÃO SUPABASE NORMAL
      const { session: supabaseSession, profile: supabaseProfile } =
        await verifyAdminAccess(supabase);
      session = supabaseSession;
      profile = supabaseProfile;
    }

    // Validar entrada
    const validated = UpdateAgentSchema.partial().parse({ id, ...input });

    // Buscar agente atual
    const { data: currentAgent } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentAgent) {
      throw new Error("Agente não encontrado.");
    }

    // Preparar dados para atualização
    const updateData: ProfileUpdate = {
      ...validated,
      updated_at: new Date().toISOString(),
    };

    // Verificar unicidade (se alterar matrícula ou email)
    if (validated.matricula && validated.matricula !== currentAgent.matricula) {
      const { data: existingMatricula } = await supabase
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
      const { data: existingEmail } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", validated.email)
        .neq("id", id)
        .single();

      if (existingEmail) {
        throw new Error("Email já está em uso por outro agente.");
      }
    }

    // Atualizar agente
    const { data: updatedAgent, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar agente: ${error.message}`);
    }

    // Registrar no histórico
    await supabase.from("profiles_history").insert({
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
      changed_by: session.user.id,
      old_data: currentAgent,
      new_data: updatedAgent,
    });

    // Registrar atividade
    const changes = Object.keys(validated).filter((key) => key !== "id");
    await logActivity(
      supabase,
      session,
      "agent_update",
      `Agente ${currentAgent.full_name || currentAgent.email} atualizado por ${
        profile.email
      }. Campos: ${changes.join(", ")}`,
      id,
      {
        updated_by: profile.email,
        changed_fields: changes,
        previous_data: currentAgent,
        new_data: updatedAgent,
      }
    );

    // Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath(`/admin/agentes/${id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Agente atualizado com sucesso!",
      data: updatedAgent,
    };
  } catch (error) {
    console.error("Erro em updateAgent:", error);

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
        error instanceof Error ? error.message : "Erro ao atualizar agente",
    };
  }
}

/**
 * Deletar agente permanentemente
 */
export async function deleteAgent(id: string) {
  try {
    const supabase = await createServerClient();

    // ✅ PRIMEIRO: VERIFICAR SESSÃO ADMIN VIA COOKIES
    const authModule = await import("@/app/actions/auth/auth");
    const adminSession = await authModule.verifyAdminSession();

    let session: Session;
    let profile: AdminProfile;

    if (adminSession.success && adminSession.user) {
      console.log("✅ [deleteAgent] Acesso via sessão admin (cookies)");

      // Buscar perfil do admin via service role
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      const { data: adminProfile } = await supabaseAdmin
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", adminSession.user.id)
        .eq("role", "admin")
        .single();

      if (!adminProfile) {
        throw new Error("Perfil admin não encontrado.");
      }

      session = { user: { id: adminSession.user.id } } as Session;
      profile = adminProfile as AdminProfile;
    } else {
      // ✅ SEGUNDO: VERIFICAR SESSÃO SUPABASE NORMAL
      const { session: supabaseSession, profile: supabaseProfile } =
        await verifyAdminAccess(supabase);
      session = supabaseSession;
      profile = supabaseProfile;
    }

    // Validar
    const validated = DeleteAgentSchema.parse({ id });

    // Buscar dados do agente antes de excluir
    const { data: agentData } = await supabase
      .from("profiles")
      .select("matricula, email, full_name")
      .eq("id", validated.id)
      .single();

    if (!agentData) {
      throw new Error("Agente não encontrado.");
    }

    // Registrar no histórico antes de excluir
    await supabase.from("profiles_history").insert({
      profile_id: validated.id,
      matricula: agentData.matricula,
      email: agentData.email,
      full_name: agentData.full_name,
      action_type: "DELETE",
      changed_by: session.user.id,
      old_data: agentData,
    });

    // Excluir agente
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", validated.id);

    if (error) {
      throw new Error(`Erro ao excluir agente: ${error.message}`);
    }

    // Tentar excluir do Auth também
    try {
      await supabase.auth.admin.deleteUser(validated.id);
    } catch (authError) {
      console.warn("Não foi possível excluir usuário do Auth:", authError);
    }

    // Registrar atividade
    await logActivity(
      supabase,
      session,
      "agent_deletion",
      `Agente ${agentData.full_name || agentData.email} (${
        agentData.matricula
      }) excluído por ${profile.email}`,
      validated.id,
      {
        deleted_by: profile.email,
        agent_data: agentData,
      }
    );

    // Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Agente excluído com sucesso!",
    };
  } catch (error) {
    console.error("Erro em deleteAgent:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
        details: error.flatten().fieldErrors,
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
) {
  try {
    const supabase = await createServerClient();

    // ✅ PRIMEIRO: VERIFICAR SESSÃO ADMIN VIA COOKIES
    const authModule = await import("@/app/actions/auth/auth");
    const adminSession = await authModule.verifyAdminSession();

    let hasAdminAccess = false;

    if (adminSession.success && adminSession.user) {
      console.log("✅ [getAgents] Acesso via sessão admin (cookies)");
      hasAdminAccess = true;
    } else {
      // ✅ SEGUNDO: VERIFICAR SESSÃO SUPABASE NORMAL
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Não autorizado. Faça login para continuar.");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "admin") {
        hasAdminAccess = true;
      }
    }

    if (!hasAdminAccess) {
      throw new Error("Apenas administradores podem acessar esta lista.");
    }

    // Validar filtros
    const validatedFilters = ListAgentsSchema.parse(filters || {});
    const { search, role, status, page, limit } = validatedFilters;
    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase.from("profiles").select("*", { count: "exact" });

    // Aplicar filtros de busca
    if (search) {
      query = query.or(
        `matricula.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`
      );
    }

    // Filtro por role
    if (role !== "all") {
      query = query.eq("role", role);
    }

    // Filtro por status
    if (status !== "all") {
      query = query.eq("status", status === "active");
    }

    // Executar query com paginação
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Erro ao buscar agentes: ${error.message}`);
    }

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
    console.error("Erro em getAgents:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
        details: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      data: [],
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 50,
        total: 0,
        totalPages: 0,
      },
      error: error instanceof Error ? error.message : "Erro ao buscar agentes",
    };
  }
}

// ============================================
// OPERAÇÕES DE ESTATÍSTICAS - CORRIGIDAS
// ============================================

/**
 * Obter estatísticas de agentes - VERSÃO CORRIGIDA
 */
export async function getAgentsStats(): Promise<AgentsStatsResponse> {
  try {
    console.log("🔍 [getAgentsStats] Iniciando...");

    // Primeiro verificar cookies admin
    const cookieStore = await cookies();
    const isAdminCookie = cookieStore.get("is_admin")?.value === "true";
    const adminSession = cookieStore.get("admin_session")?.value;

    console.log("🍪 [getAgentsStats] Cookies:", {
      hasIsAdmin: isAdminCookie,
      hasSession: !!adminSession,
    });

    if (!isAdminCookie || !adminSession) {
      console.log("❌ [getAgentsStats] Cookies admin não encontrados");
      return {
        success: false,
        error: "Acesso não autorizado. Faça login como administrador.",
      };
    }

    // Usar Service Role Key para acesso direto
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Variáveis de ambiente do Supabase não configuradas.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("✅ [getAgentsStats] Conectado ao Supabase com service role");

    // Buscar estatísticas
    console.log("📊 [getAgentsStats] Buscando dados...");

    const [totalResult, activeResult, adminsResult, agentsResult] =
      await Promise.all([
        // Total de perfis
        supabase.from("profiles").select("id", { count: "exact", head: true }),

        // Agentes ativos
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("status", true),

        // Administradores
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin"),

        // Agentes normais
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "agent"),
      ]);

    // Verificar erros
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

/**
 * Obter agentes recentes (últimos 7 dias)
 */
export async function getRecentAgents(limit: number = 10) {
  try {
    const supabase = await createServerClient();

    // ✅ PRIMEIRO: VERIFICAR SESSÃO ADMIN VIA COOKIES
    const authModule = await import("@/app/actions/auth/auth");
    const adminSession = await authModule.verifyAdminSession();

    let hasAdminAccess = false;

    if (adminSession.success && adminSession.user) {
      console.log("✅ [getRecentAgents] Acesso via sessão admin (cookies)");
      hasAdminAccess = true;
    } else {
      // ✅ SEGUNDO: VERIFICAR SESSÃO SUPABASE NORMAL
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Não autorizado. Faça login para continuar.");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "admin") {
        hasAdminAccess = true;
      }
    }

    if (!hasAdminAccess) {
      throw new Error("Apenas administradores podem ver agentes recentes.");
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erro ao buscar agentes recentes:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Erro em getRecentAgents:", error);

    return {
      success: false,
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar agentes recentes",
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
    const supabase = await createServerClient();

    let query = supabase
      .from("profiles")
      .select("id")
      .eq("matricula", matricula);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();

    return !data; // Disponível se não encontrar
  } catch (error) {
    console.error("Erro em validateMatricula:", error);
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
    const supabase = await createServerClient();

    let query = supabase.from("profiles").select("id").eq("email", email);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();

    return !data; // Disponível se não encontrar
  } catch (error) {
    console.error("Erro em validateEmail:", error);
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
    const supabase = await createServerClient();

    // ✅ PRIMEIRO: VERIFICAR SESSÃO ADMIN VIA COOKIES
    const authModule = await import("@/app/actions/auth/auth");
    const adminSession = await authModule.verifyAdminSession();

    let session: Session;
    let profile: AdminProfile;

    if (adminSession.success && adminSession.user) {
      console.log("✅ [bulkUpdateAgents] Acesso via sessão admin (cookies)");

      // Buscar perfil do admin via service role
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      const { data: adminProfile } = await supabaseAdmin
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", adminSession.user.id)
        .eq("role", "admin")
        .single();

      if (!adminProfile) {
        throw new Error("Perfil admin não encontrado.");
      }

      session = { user: { id: adminSession.user.id } } as Session;
      profile = adminProfile as AdminProfile;
    } else {
      // ✅ SEGUNDO: VERIFICAR SESSÃO SUPABASE NORMAL
      const { session: supabaseSession, profile: supabaseProfile } =
        await verifyAdminAccess(supabase);
      session = supabaseSession;
      profile = supabaseProfile;
    }

    if (!ids.length) {
      throw new Error("Nenhum agente selecionado.");
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) {
      throw new Error(`Erro na atualização em massa: ${error.message}`);
    }

    // Registrar atividade
    await logActivity(
      supabase,
      session,
      "bulk_agent_update",
      `${ids.length} agentes atualizados por ${
        profile.email
      }. Campos: ${Object.keys(updates).join(", ")}`,
      undefined,
      {
        updated_by: profile.email,
        agent_ids: ids,
        updates,
        count: ids.length,
      }
    );

    // Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${ids.length} agentes atualizados com sucesso!`,
    };
  } catch (error) {
    console.error("Erro em bulkUpdateAgents:", error);

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
    console.error("Erro em exportAgentsToCSV:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao exportar agentes",
    };
  }
}
