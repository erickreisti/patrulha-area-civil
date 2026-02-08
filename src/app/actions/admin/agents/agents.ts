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

// ==================== TYPES (EXPORTADOS) ====================

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

function isUUID(str: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function cleanupTempAvatar(
  avatarUrl: string | null | undefined,
): Promise<void> {
  if (!avatarUrl) return;

  try {
    const { deleteFileByUrl } = await import("@/lib/supabase/storage");
    await deleteFileByUrl(avatarUrl);
  } catch (error) {
    console.error("❌ Erro ao limpar avatar temporário:", error);
  }
}

// ==================== API FUNCTIONS (EXPORTADAS) ====================

export async function createAgent(input: CreateAgentInput) {
  try {
    console.log("🆕 [createAgent] Iniciando...", {
      matricula: input.matricula,
      hasAvatar: !!input.avatar_url,
    });

    const validated = CreateAgentSchema.parse(input);
    const supabaseAdmin = createAdminClient();

    let finalAvatarUrl = validated.avatar_url || null;
    let tempAvatarToCleanup: string | null = null;

    if (validated.avatar_url && validated.avatar_url.includes("temp_")) {
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
      console.error("❌ [createAgent] Erro Auth:", userError);
      if (tempAvatarToCleanup) await cleanupTempAvatar(tempAvatarToCleanup);
      return {
        success: false,
        error: userError.message.includes("already exists")
          ? "Email já cadastrado"
          : "Erro ao criar usuário",
      };
    }

    if (!userData.user) {
      if (tempAvatarToCleanup) await cleanupTempAvatar(tempAvatarToCleanup);
      return { success: false, error: "Falha ao criar usuário" };
    }

    // 2. Tentar renomear o avatar
    if (tempAvatarToCleanup) {
      try {
        const { renameAvatarAfterCreation } =
          await import("@/app/actions/upload/avatar");

        const renameResult = await renameAvatarAfterCreation(
          tempAvatarToCleanup,
          userData.user.id,
          validated.matricula,
        );

        if (renameResult.success && renameResult.newUrl) {
          finalAvatarUrl = renameResult.newUrl;
          console.log("✅ Avatar movido para pasta oficial");
        } else {
          console.warn(
            "⚠️ Falha ao mover avatar (usando temp):",
            renameResult.error,
          );
          finalAvatarUrl = tempAvatarToCleanup;
        }
      } catch (error) {
        console.error("❌ Erro ao tentar mover avatar:", error);
        finalAvatarUrl = tempAvatarToCleanup;
      }
    }

    // 3. Criar perfil no Banco
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
      console.error("❌ [createAgent] Erro Perfil:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      if (tempAvatarToCleanup) await cleanupTempAvatar(tempAvatarToCleanup);
      return { success: false, error: "Erro ao criar perfil no banco" };
    }

    revalidatePath("/admin/agentes");
    return {
      success: true,
      data: profile,
      message: "Agente criado com sucesso!",
    };
  } catch (error) {
    console.error("❌ [createAgent] Exceção:", error);
    if (input.avatar_url) await cleanupTempAvatar(input.avatar_url);

    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.issues.map((e) => e.message).join(", ")
          : "Erro desconhecido",
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
    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin.from("profiles").select("*", { count: "exact" });

    if (filters?.search) {
      query = query.or(
        `matricula.ilike.%${filters.search}%,email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`,
      );
    }
    if (filters?.role) query = query.eq("role", filters.role);
    if (filters?.status)
      query = query.eq("status", filters.status === "active");

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const from = (page - 1) * limit;

    query = query
      .range(from, from + limit - 1)
      .order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data as Agent[],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 1,
      },
    };
  } catch (error) {
    console.error("Erro getAgents:", error);
    return { success: false, error: "Erro ao buscar agentes" };
  }
}

export async function getAgent(id: string) {
  if (!isUUID(id)) return { success: false, error: "ID inválido" };

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { success: true, data: data as Agent };
  } catch {
    return { success: false, error: "Agente não encontrado" };
  }
}

export async function updateAgent(
  id: string,
  input: Omit<UpdateAgentInput, "id">,
) {
  if (!isUUID(id)) return { success: false, error: "ID inválido" };

  try {
    const validationData = { id, ...input };
    const validated = UpdateAgentSchema.parse(validationData);
    const supabaseAdmin = createAdminClient();

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("id", id)
      .single();

    if (!existing) return { success: false, error: "Agente não encontrado" };

    const updateData: Record<string, unknown> = {
      ...validated,
      updated_at: new Date().toISOString(),
    };
    delete updateData.id;

    if (
      validated.avatar_url &&
      existing.avatar_url &&
      validated.avatar_url !== existing.avatar_url
    ) {
      try {
        const { deleteFileByUrl } = await import("@/lib/supabase/storage");
        await deleteFileByUrl(existing.avatar_url);
      } catch (e) {
        console.warn("Erro limpando avatar antigo", e);
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    revalidatePath("/admin/agentes");
    return { success: true, data: updated as Agent };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar",
    };
  }
}

export async function deleteAgent(id: string) {
  if (!isUUID(id)) return { success: false, error: "ID inválido" };

  try {
    const supabaseAdmin = createAdminClient();

    const { data: agent } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("id", id)
      .single();

    if (agent?.avatar_url) {
      try {
        const { deleteFileByUrl } = await import("@/lib/supabase/storage");
        await deleteFileByUrl(agent.avatar_url);
      } catch {} // Ignora erro de cleanup
    }

    await supabaseAdmin.from("profiles").delete().eq("id", id);
    await supabaseAdmin.auth.admin.deleteUser(id);

    revalidatePath("/admin/agentes");
    return { success: true, message: "Agente excluído" };
  } catch {
    return { success: false, error: "Erro ao excluir agente" };
  }
}

export async function toggleAgentStatus(id: string) {
  const agent = await getAgent(id);
  if (!agent.success || !agent.data) return { success: false, error: "Erro" };
  return updateAgent(id, { status: !agent.data.status });
}

export async function getAgentsStats() {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("role, status");
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      total: data.length,
      active: data.filter((a) => a.status).length,
      inactive: data.filter((a) => !a.status).length,
      admins: data.filter((a) => a.role === "admin").length,
      agents: data.filter((a) => a.role === "agent").length,
    },
  };
}
