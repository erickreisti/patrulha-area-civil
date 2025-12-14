"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DeleteAgentSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export async function deleteAgent(formData: FormData) {
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
      throw new Error("Apenas administradores podem excluir agentes.");
    }

    // Validar ID
    const agentId = formData.get("id") as string;
    const validated = DeleteAgentSchema.parse({ id: agentId });

    // Buscar dados do agente antes de excluir (para registro)
    const { data: agentData } = await supabase
      .from("profiles")
      .select("matricula, email, full_name")
      .eq("id", validated.id)
      .single();

    if (!agentData) {
      throw new Error("Agente não encontrado.");
    }

    // Excluir agente
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", validated.id);

    if (error) {
      throw new Error(`Erro ao excluir agente: ${error.message}`);
    }

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: session.user.id,
      action_type: "agent_deletion",
      description: `Agente ${agentData.full_name || agentData.email} (${
        agentData.matricula
      }) excluído por ${session.user.email}`,
      resource_type: "profile",
      resource_id: validated.id,
      metadata: {
        deleted_by: session.user.id,
        deleted_by_email: session.user.email,
        agent_data: agentData,
      },
    });

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
