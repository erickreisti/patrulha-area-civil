"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

// Tipos de resposta
type LoginSuccessResponse = {
  success: true;
  message: string;
  data: {
    session: Session;
    user: Profile;
  };
};

type LoginErrorResponse = {
  success: false;
  error: string;
  details?: z.ZodError["flatten"] | Record<string, unknown>;
};

type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

// Schema de validação
const LoginSchema = z.object({
  matricula: z
    .string()
    .min(11, "Matrícula deve ter 11 dígitos")
    .max(11, "Matrícula deve ter 11 dígitos")
    .transform((val) => val.replace(/\D/g, "")),
});

// Cache para rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function login(formData: FormData): Promise<LoginResponse> {
  console.log("🔍 [Server Action] login() chamada");
  console.log("🔍 [Server Action] FormData:", Array.from(formData.entries()));

  const ip = "server-action";
  const now = Date.now();

  try {
    // Rate limiting
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    console.log("🔍 [Server Action] Rate limiting check:", attempts);

    if (now - attempts.lastAttempt < 60000 && attempts.count >= 5) {
      console.log("🔍 [Server Action] Rate limit excedido");
      return {
        success: false,
        error: "Muitas tentativas. Tente novamente em 1 minuto.",
      };
    }

    // Extrair e validar matrícula
    const matricula = formData.get("matricula") as string;
    console.log("🔍 [Server Action] Matrícula do formData:", matricula);

    const validated = LoginSchema.parse({ matricula });
    console.log("🔍 [Server Action] Matrícula validada:", validated.matricula);

    // 🔐 1. Buscar email pela matrícula usando Service Role (bypass RLS)
    console.log("🔍 [Server Action] Criando cliente Supabase Admin...");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 🔧 BUSCAR TODOS OS CAMPOS DO PERFIL
    console.log("🔍 [Server Action] Buscando perfil no banco...");
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("matricula", validated.matricula)
      .single();

    console.log("🔍 [Server Action] Resultado da busca do perfil:", {
      profile,
      profileError,
      hasProfile: !!profile,
      status: profile?.status,
    });

    if (profileError || !profile) {
      console.error("🔍 [Server Action] Erro ao buscar perfil:", profileError);
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: now });
      return {
        success: false,
        error: "Matrícula não encontrada",
      };
    }

    console.log("🔍 [Server Action] Perfil encontrado:", {
      id: profile.id,
      email: profile.email,
      status: profile.status,
      role: profile.role,
      has_validade_certificacao: !!profile.validade_certificacao,
      has_tipo_sanguineo: !!profile.tipo_sanguineo,
    });

    // 🔑 2. Fazer login com email e senha padrão
    console.log("🔍 [Server Action] Criando cliente Supabase público...");
    const supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const defaultPassword =
      process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure";
    console.log("🔍 [Server Action] Senha padrão usada:", defaultPassword);

    console.log("🔍 [Server Action] Tentando autenticar com:", {
      email: profile.email,
      passwordLength: defaultPassword.length,
    });

    const { data: authData, error: authError } =
      await supabasePublic.auth.signInWithPassword({
        email: profile.email,
        password: defaultPassword,
      });

    console.log("🔍 [Server Action] Resultado da autenticação:", {
      hasAuthData: !!authData,
      hasAuthError: !!authError,
      authError,
      session: authData?.session ? "Sessão criada" : "Sem sessão",
    });

    if (authError) {
      console.error("🔍 [Server Action] Erro no auth:", authError);
      return {
        success: false,
        error: `Erro ao fazer login: ${authError.message}`,
      };
    }

    if (!authData.session) {
      return {
        success: false,
        error: "Sessão não criada",
      };
    }

    // ✅ 3. Resetar contador e retornar sucesso
    console.log("🔍 [Server Action] Login bem-sucedido!");
    loginAttempts.delete(ip);

    // 🗃️ 4. Revalidar cache
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/perfil");

    // 📋 5. Retornar dados COMPLETOS do usuário
    const responseData: LoginSuccessResponse = {
      success: true,
      message: profile.status
        ? "Login realizado com sucesso!"
        : "Login realizado - Agente inativo",
      data: {
        session: authData.session,
        user: profile,
      },
    };

    console.log("🔍 [Server Action] Retornando dados:", {
      success: responseData.success,
      message: responseData.message,
      userId: responseData.data.user.id,
      userStatus: responseData.data.user.status,
      camposRetornados: Object.keys(responseData.data.user),
    });

    return responseData;
  } catch (error) {
    console.error("🔍 [Server Action] Erro em login:", error);

    if (error instanceof z.ZodError) {
      console.error(
        "🔍 [Server Action] Erro de validação Zod:",
        error.flatten()
      );
      return {
        success: false,
        error: "Erro de validação",
        details: error.flatten(),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro desconhecido no login",
    };
  }
}
