import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/utils/error-handler";

export class AgentsService {
  private static supabase = createAdminClient();

  // Buscar todos os agentes (com paginação e filtros)
  static async getAgents(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: boolean;
    role?: string;
  }) {
    const { page = 1, limit = 50, search, status, role } = options;
    const offset = (page - 1) * limit;

    let query = this.supabase.from("profiles").select("*", { count: "exact" });

    // Aplicar filtros
    if (search) {
      query = query.or(
        `matricula.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`
      );
    }

    if (status !== undefined) {
      query = query.eq("status", status);
    }

    if (role) {
      query = query.eq("role", role);
    }

    const {
      data: agents,
      error,
      count,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new ApiError("Erro ao buscar agentes", 500, error);
    }

    return {
      agents: agents || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  // Criar novo agente
  static async createAgent(
    agentData: any,
    adminId: string,
    adminEmail: string
  ) {
    const {
      matricula,
      email,
      full_name,
      role = "agent",
      graduacao = "",
      tipo_sanguineo = "",
      validade_certificacao = "",
      avatar_url = "",
    } = agentData;

    // Validações
    const matriculaLimpa = matricula?.replace(/\D/g, "") || "";

    if (matriculaLimpa.length !== 11) {
      throw new ApiError("Matrícula deve conter exatamente 11 dígitos", 400);
    }

    // Verificar duplicatas
    const [{ data: existingMatricula }, { data: existingEmail }] =
      await Promise.all([
        this.supabase
          .from("profiles")
          .select("id")
          .eq("matricula", matriculaLimpa)
          .single(),
        this.supabase
          .from("profiles")
          .select("id")
          .eq("email", email.trim())
          .single(),
      ]);

    if (existingMatricula) {
      throw new ApiError("Matrícula já cadastrada", 409);
    }

    if (existingEmail) {
      throw new ApiError("Email já cadastrado", 409);
    }

    // Criar usuário no Auth
    const { data: authUser, error: authError } =
      await this.supabase.auth.admin.createUser({
        email: email.trim(),
        password: process.env.DEFAULT_PASSWORD || "PAC@2025!Secure",
        email_confirm: true,
        user_metadata: {
          full_name: full_name.trim(),
          matricula: matriculaLimpa,
          role,
        },
      });

    if (authError) {
      throw new ApiError("Erro ao criar usuário", 500, authError);
    }

    // Criar perfil
    const { error: profileError } = await this.supabase
      .from("profiles")
      .insert({
        id: authUser.user.id,
        matricula: matriculaLimpa,
        email: email.trim(),
        full_name: full_name.trim(),
        graduacao: graduacao.trim(),
        tipo_sanguineo: tipo_sanguineo.trim(),
        validade_certificacao: validade_certificacao || null,
        role,
        avatar_url: avatar_url.trim(),
        status: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      // Rollback: deletar usuário do Auth
      await this.supabase.auth.admin
        .deleteUser(authUser.user.id)
        .catch(() => {});
      throw new ApiError("Erro ao criar perfil", 500, profileError);
    }

    // Registrar atividade
    await this.supabase.from("system_activities").insert({
      user_id: adminId,
      action_type: "agent_created",
      description: `Novo agente criado: ${full_name} (${matriculaLimpa})`,
      resource_type: "profile",
      resource_id: authUser.user.id,
      metadata: {
        created_by: adminId,
        created_by_email: adminEmail,
        agent_email: email,
        agent_matricula: matriculaLimpa,
        agent_role: role,
      },
    });

    return {
      id: authUser.user.id,
      email: email.trim(),
      full_name: full_name.trim(),
      matricula: matriculaLimpa,
      role,
    };
  }

  // Atualizar matrícula
  static async updateMatricula(
    agentId: string,
    newMatricula: string,
    adminId: string,
    adminEmail: string
  ) {
    const matriculaLimpa = newMatricula.replace(/\D/g, "");

    if (matriculaLimpa.length !== 11) {
      throw new ApiError("Matrícula deve conter exatamente 11 dígitos", 400);
    }

    // Buscar agente atual
    const { data: agent, error: fetchError } = await this.supabase
      .from("profiles")
      .select("matricula, email, full_name")
      .eq("id", agentId)
      .single();

    if (fetchError || !agent) {
      throw new ApiError("Agente não encontrado", 404);
    }

    // Verificar se nova matrícula já existe
    if (matriculaLimpa !== agent.matricula) {
      const { data: existing } = await this.supabase
        .from("profiles")
        .select("id")
        .eq("matricula", matriculaLimpa)
        .neq("id", agentId)
        .single();

      if (existing) {
        throw new ApiError("Matrícula já está em uso", 409);
      }
    }

    // Atualizar matrícula
    const { data, error: updateError } = await this.supabase
      .from("profiles")
      .update({
        matricula: matriculaLimpa,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId)
      .select()
      .single();

    if (updateError) {
      throw new ApiError("Erro ao atualizar matrícula", 500, updateError);
    }

    // Registrar atividade
    await this.supabase.from("system_activities").insert({
      user_id: adminId,
      action_type: "matricula_update",
      description: `Matrícula do agente ${
        agent.full_name || agent.email
      } alterada de ${agent.matricula} para ${matriculaLimpa}`,
      resource_type: "profile",
      resource_id: agentId,
      metadata: {
        updated_by: adminId,
        updated_by_email: adminEmail,
        old_matricula: agent.matricula,
        new_matricula: matriculaLimpa,
      },
    });

    return data;
  }

  // Atualizar status
  static async updateStatus(
    agentId: string,
    status: boolean,
    adminId: string,
    adminEmail: string
  ) {
    const { data: agent, error: fetchError } = await this.supabase
      .from("profiles")
      .select("email, full_name, status")
      .eq("id", agentId)
      .single();

    if (fetchError || !agent) {
      throw new ApiError("Agente não encontrado", 404);
    }

    const { data, error: updateError } = await this.supabase
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId)
      .select()
      .single();

    if (updateError) {
      throw new ApiError("Erro ao atualizar status", 500, updateError);
    }

    // Registrar atividade
    await this.supabase.from("system_activities").insert({
      user_id: adminId,
      action_type: "status_update",
      description: `Status do agente ${
        agent.full_name || agent.email
      } alterado para ${status ? "ativo" : "inativo"}`,
      resource_type: "profile",
      resource_id: agentId,
      metadata: {
        updated_by: adminId,
        updated_by_email: adminEmail,
        old_status: agent.status,
        new_status: status,
      },
    });

    return data;
  }

  // Deletar agente
  static async deleteAgent(
    agentId: string,
    adminId: string,
    adminEmail: string
  ) {
    // Verificar se não está tentando deletar a si mesmo
    if (agentId === adminId) {
      throw new ApiError("Não é possível excluir sua própria conta", 400);
    }

    // Buscar dados do agente
    const { data: agent, error: fetchError } = await this.supabase
      .from("profiles")
      .select("email, full_name, matricula, avatar_url")
      .eq("id", agentId)
      .single();

    if (fetchError || !agent) {
      throw new ApiError("Agente não encontrado", 404);
    }

    // Backup em profiles_backup
    await this.supabase.from("profiles_backup").insert({
      id: agentId,
      email: agent.email,
      full_name: agent.full_name,
      matricula: agent.matricula,
      avatar_url: agent.avatar_url,
      deleted_at: new Date().toISOString(),
      deleted_by: adminId,
    });

    // Deletar avatar do storage se existir
    if (agent.avatar_url) {
      try {
        const urlParts = agent.avatar_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
          await this.supabase.storage
            .from("avatares-agentes")
            .remove([fileName]);
        }
      } catch (error) {
        console.warn("Erro ao deletar avatar:", error);
      }
    }

    // Deletar de profiles
    const { error: deleteError } = await this.supabase
      .from("profiles")
      .delete()
      .eq("id", agentId);

    if (deleteError) {
      throw new ApiError("Erro ao excluir agente", 500, deleteError);
    }

    // Deletar do Auth
    await this.supabase.auth.admin.deleteUser(agentId);

    // Registrar atividade
    await this.supabase.from("system_activities").insert({
      user_id: adminId,
      action_type: "agent_deleted",
      description: `Agente ${agent.full_name} (${agent.email}) excluído por ${adminEmail}`,
      resource_type: "profile",
      resource_id: agentId,
      metadata: {
        deleted_by: adminId,
        deleted_by_email: adminEmail,
        target_email: agent.email,
        target_name: agent.full_name,
        target_matricula: agent.matricula,
      },
    });

    return {
      id: agentId,
      email: agent.email,
      name: agent.full_name,
      deleted_by: adminEmail,
    };
  }
}
