"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateMatriculaSchema = z.object({
  id: z.string().uuid("ID inválido"),
  matricula: z
    .string()
    .min(11, "Matrícula deve ter 11 dígitos")
    .max(11, "Matrícula deve ter 11 dígitos")
    .transform((val) => val.replace(/\D/g, "")),
});

export async function updateAgentMatricula(formData: FormData) {
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
      throw new Error("Apenas administradores podem alterar matrículas.");
    }

    // Extrair e validar dados
    const rawData = {
      id: formData.get("id") as string,
      matricula: formData.get("matricula") as string,
    };

    const validated = UpdateMatriculaSchema.parse(rawData);

    // Buscar dados atuais do agente
    const { data: agentData } = await supabase
      .from("profiles")
      .select("matricula, email, full_name")
      .eq("id", validated.id)
      .single();

    if (!agentData) {
      throw new Error("Agente não encontrado.");
    }

    // Verificar se nova matrícula já existe
    const { data: existingMatricula } = await supabase
      .from("profiles")
      .select("id")
      .eq("matricula", validated.matricula)
      .neq("id", validated.id)
      .single();

    if (existingMatricula) {
      throw new Error("Matrícula já está em uso por outro agente.");
    }

    // Atualizar matrícula
    const { data: updatedAgent, error } = await supabase
      .from("profiles")
      .update({
        matricula: validated.matricula,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar matrícula: ${error.message}`);
    }

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: session.user.id,
      action_type: "agent_matricula_update",
      description: `Matrícula do agente ${
        agentData.full_name || agentData.email
      } alterada de ${agentData.matricula} para ${validated.matricula} por ${
        session.user.email
      }`,
      resource_type: "profile",
      resource_id: validated.id,
      metadata: {
        updated_by: session.user.id,
        updated_by_email: session.user.email,
        previous_matricula: agentData.matricula,
        new_matricula: validated.matricula,
        agent_data: agentData,
      },
    });

    // Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath(`/admin/agentes/${validated.id}`);

    return {
      success: true,
      message: "Matrícula atualizada com sucesso!",
      data: updatedAgent,
    };
  } catch (error) {
    console.error("Erro em updateAgentMatricula:", error);

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
        error instanceof Error ? error.message : "Erro ao atualizar matrícula",
    };
  }
}
