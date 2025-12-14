"use server";

import { createClient } from "@/lib/supabase/client";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const LoginSchema = z.object({
  matricula: z
    .string()
    .min(1, "Matrícula é obrigatória")
    .transform((val) => val.replace(/\D/g, "")),
});

// Cache para rate limiting (simples)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function loginWithMatricula(formData: FormData) {
  const ip = "server-action"; // Em Server Actions, não temos IP direto
  const now = Date.now();

  try {
    // Rate limiting simples
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    if (now - attempts.lastAttempt < 60000 && attempts.count >= 5) {
      return {
        success: false,
        error: "Muitas tentativas. Tente novamente em 1 minuto.",
      };
    }

    // Extrair e validar matrícula
    const matricula = formData.get("matricula") as string;
    const validated = LoginSchema.parse({ matricula });

    // Usar cliente do servidor para buscar dados
    const supabaseServer = await createServerClient();

    // Buscar perfil pela matrícula
    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select(
        "id, email, full_name, role, status, avatar_url, graduacao, matricula"
      )
      .eq("matricula", validated.matricula)
      .single();

    if (profileError || !profile) {
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: now });
      return {
        success: false,
        error: "Matrícula não encontrada",
      };
    }

    // Verificar status
    if (!profile.status) {
      return {
        success: false,
        error: "Conta inativa. Entre em contato com o administrador.",
      };
    }

    // Resetar contador de tentativas
    loginAttempts.delete(ip);

    // Retornar informações do perfil (sem fazer login ainda)
    // O login real será feito pelo cliente com a senha padrão
    return {
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        status: profile.status,
        matricula: profile.matricula,
        avatar_url: profile.avatar_url,
        graduacao: profile.graduacao,
        security: {
          default_password: process.env.DEFAULT_PASSWORD || "PAC@2025!Secure",
          requires_password_change: false,
        },
      },
    };
  } catch (error) {
    console.error("Erro em loginWithMatricula:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
        details: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao fazer login",
    };
  }
}

// Função para login real com email e senha
export async function performLogin(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        success: false,
        error: "Email e senha são obrigatórios",
      };
    }

    // Usar cliente do navegador (isso será executado no cliente)
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    };
  } catch (error) {
    console.error("Erro em performLogin:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao fazer login",
    };
  }
}
