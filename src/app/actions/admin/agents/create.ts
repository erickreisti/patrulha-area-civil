"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ProfileInsert } from "@/lib/supabase/types";

// Schema de validação
const AgentSchema = z.object({
  matricula: z
    .string()
    .min(11, "Matrícula deve ter 11 dígitos")
    .max(11, "Matrícula deve ter 11 dígitos")
    .transform((val) => val.replace(/\D/g, "")),
  email: z.string().email("Email inválido"),
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  role: z.enum(["admin", "agent"]).default("agent"),
  graduacao: z.string().optional().nullable(),
  tipo_sanguineo: z.string().optional().nullable(),
  validade_certificacao: z.string().optional().nullable(),
  uf: z.string().length(2).optional().nullable(),
  data_nascimento: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
});

export async function createAgent(formData: FormData) {
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
      throw new Error("Apenas administradores podem criar agentes.");
    }

    // Extrair e validar dados do formulário
    const rawData = {
      matricula: formData.get("matricula") as string,
      email: formData.get("email") as string,
      full_name: formData.get("full_name") as string,
      role: (formData.get("role") as string) || "agent",
      graduacao: formData.get("graduacao") as string,
      tipo_sanguineo: formData.get("tipo_sanguineo") as string,
      validade_certificacao: formData.get("validade_certificacao") as string,
      uf: formData.get("uf") as string,
      data_nascimento: formData.get("data_nascimento") as string,
      telefone: formData.get("telefone") as string,
    };

    const validatedData = AgentSchema.parse(rawData);

    // Verificar se matrícula já existe
    const { data: existingMatricula } = await supabase
      .from("profiles")
      .select("id")
      .eq("matricula", validatedData.matricula)
      .single();

    if (existingMatricula) {
      throw new Error("Matrícula já cadastrada no sistema.");
    }

    // Verificar se email já existe
    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", validatedData.email)
      .single();

    if (existingEmail) {
      throw new Error("Email já cadastrado no sistema.");
    }

    // Criar usuário no Auth primeiro
    const defaultPassword =
      process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure";

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: validatedData.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          full_name: validatedData.full_name,
          matricula: validatedData.matricula,
        },
      });

    if (authError) {
      console.error("Erro ao criar usuário no Auth:", authError);
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }

    // Criar perfil com o ID gerado pelo Auth
    const profileData: ProfileInsert = {
      id: authUser.user.id, // Usar o ID do usuário criado no Auth
      matricula: validatedData.matricula,
      email: validatedData.email,
      full_name: validatedData.full_name,
      role: validatedData.role,
      graduacao: validatedData.graduacao || null,
      tipo_sanguineo: validatedData.tipo_sanguineo || null,
      validade_certificacao: validatedData.validade_certificacao || null,
      uf: validatedData.uf || null,
      data_nascimento: validatedData.data_nascimento || null,
      telefone: validatedData.telefone || null,
      status: true,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newAgent, error: profileError } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      // Se falhar ao criar perfil, tentar deletar o usuário do Auth
      await supabase.auth.admin.deleteUser(authUser.user.id);

      console.error("Erro ao criar perfil:", profileError);
      throw new Error(`Erro ao criar perfil: ${profileError.message}`);
    }

    // Registrar atividade
    await supabase.from("system_activities").insert({
      user_id: session.user.id,
      action_type: "agent_creation",
      description: `Agente ${validatedData.full_name} (${validatedData.matricula}) criado por ${session.user.email}`,
      resource_type: "profile",
      resource_id: newAgent.id,
      metadata: {
        created_by: session.user.id,
        created_by_email: session.user.email,
        agent_data: validatedData,
      },
    });

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
