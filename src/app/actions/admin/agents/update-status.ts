"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateStatusSchema = z.object({
  id: z.string().uuid("ID inválido"),
  status: z.boolean(),
});

export async function updateAgentStatus(formData: FormData) {
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
      throw new Error(
        "Apenas administradores podem alterar status de agentes."
      );
    }

    // Extrair e validar dados
    const rawData = {
      id: formData.get("id") as string,
      status: formData.get("status") === "true",
    };

    const validated = UpdateStatusSchema.parse(rawData);

    // Buscar dados atuais do agente
    const { data: agentData } = await supabase
      .from("profiles")
      .select("matricula, email, full_name, status")
      .eq("id", validated.id)
      .single();

    if (!agentData) {
      throw new Error("Agente não encontrado.");
    }

    // Evitar atualização desnecessária
    if (agentData.status === validated.status) {
      return {
        success: true,
        message: `Agente já está ${validated.status ? "ativo" : "inativo"}.`,
        data: agentData,
      };
    }

    // Atualizar status
    const { data: updatedAgent, error } = await supabase
      .from("profiles")
      .update({
        status: validated.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: session.user.id,
      action_type: "agent_status_change",
      description: `Status do agente ${
        agentData.full_name || agentData.email
      } alterado para ${validated.status ? "ativo" : "inativo"} por ${
        session.user.email
      }`,
      resource_type: "profile",
      resource_id: validated.id,
      metadata: {
        changed_by: session.user.id,
        changed_by_email: session.user.email,
        previous_status: agentData.status,
        new_status: validated.status,
        agent_data: agentData,
      },
    });

    // Revalidar cache
    revalidatePath("/admin/agentes");
    revalidatePath(`/admin/agentes/${validated.id}`);

    return {
      success: true,
      message: `Agente ${
        validated.status ? "ativado" : "desativado"
      } com sucesso!`,
      data: updatedAgent,
    };
  } catch (error) {
    console.error("Erro em updateAgentStatus:", error);

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
        error instanceof Error ? error.message : "Erro ao atualizar status",
    };
  }
}
