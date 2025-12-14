"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateAgentSchema = z.object({
  id: z.string().uuid("ID inválido"),
  matricula: z
    .string()
    .min(11, "Matrícula deve ter 11 dígitos")
    .max(11, "Matrícula deve ter 11 dígitos")
    .transform((val) => val.replace(/\D/g, ""))
    .optional(),
  email: z.string().email("Email inválido").optional(),
  full_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .optional(),
  graduacao: z.string().optional().nullable(),
  tipo_sanguineo: z.string().optional().nullable(),
  validade_certificacao: z.string().optional().nullable(),
  uf: z.string().length(2).optional().nullable(),
  data_nascimento: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
});

export async function updateAgent(formData: FormData) {
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
      throw new Error("Apenas administradores podem atualizar agentes.");
    }

    // Extrair dados
    const agentId = formData.get("id") as string;
    const updates = {
      id: agentId, // Para validação do Zod
      matricula: formData.get("matricula") as string,
      email: formData.get("email") as string,
      full_name: formData.get("full_name") as string,
      graduacao: formData.get("graduacao") as string,
      tipo_sanguineo: formData.get("tipo_sanguineo") as string,
      validade_certificacao: formData.get("validade_certificacao") as string,
      uf: formData.get("uf") as string,
      data_nascimento: formData.get("data_nascimento") as string,
      telefone: formData.get("telefone") as string,
    };

    // Validar
    const validatedUpdates = UpdateAgentSchema.parse(updates);

    // CORREÇÃO: Remover o ID que é apenas para validação
    const updateData = Object.fromEntries(
      Object.entries(validatedUpdates).filter(([key]) => key !== "id")
    );

    // Verificar unicidade de matrícula (se for alterar)
    if (updateData.matricula) {
      const { data: existingMatricula } = await supabase
        .from("profiles")
        .select("id")
        .eq("matricula", updateData.matricula)
        .neq("id", agentId)
        .single();

      if (existingMatricula) {
        throw new Error("Matrícula já está em uso por outro agente.");
      }
    }

    // Verificar unicidade de email (se for alterar)
    if (updateData.email) {
      const { data: existingEmail } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", updateData.email)
        .neq("id", agentId)
        .single();

      if (existingEmail) {
        throw new Error("Email já está em uso por outro agente.");
      }
    }

    // Atualizar agente
    const { data: updatedAgent, error } = await supabase
      .from("profiles")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar agente: ${error.message}`);
    }

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: session.user.id,
      action_type: "agent_update",
      description: `Agente ${
        updatedAgent.full_name || updatedAgent.email
      } atualizado por ${session.user.email}`,
      resource_type: "profile",
      resource_id: agentId,
      metadata: {
        updated_by: session.user.id,
        updated_by_email: session.user.email,
        changes: updateData,
      },
    });

    // Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath(`/admin/agentes/${agentId}`);

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
