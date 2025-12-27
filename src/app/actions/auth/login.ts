// app/actions/auth/login.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile, Database } from "@/lib/supabase/types";

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

// Schema
const LoginSchema = z.object({
  matricula: z
    .string()
    .min(1, "Matrícula é obrigatória")
    .max(20, "Matrícula muito longa")
    .transform((val) => val.replace(/\D/g, "").trim()),
});

export async function login(formData: FormData): Promise<LoginResponse> {
  console.log("🔍 [Login] Iniciando...");

  try {
    // 1. Validar matrícula
    const matricula = formData.get("matricula") as string;
    console.log("🔍 [Login] Matrícula recebida:", matricula);

    const validated = LoginSchema.parse({ matricula });
    console.log("🔍 [Login] Matrícula validada:", validated.matricula);

    // 2. 🔐 Buscar APENAS email usando Service Role (necessário)
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
      }
    );

    console.log(
      "🔍 [Login] Buscando email para matrícula:",
      validated.matricula
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, status, role")
      .eq("matricula", validated.matricula)
      .single();

    if (profileError || !profile) {
      console.log(
        "🔍 [Login] Matrícula não encontrada:",
        profileError?.message
      );
      return {
        success: false,
        error: "Matrícula ou senha incorretos",
      };
    }

    console.log("🔍 [Login] Perfil encontrado:", {
      email: profile.email,
      status: profile.status,
      role: profile.role,
      id: profile.id,
    });

    // 3. 🔑 Tentar login com email REAL do agente
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const defaultPassword =
      process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure";
    console.log("🔍 [Login] Tentando auth com:", {
      email: profile.email,
      passwordLength: defaultPassword.length,
    });

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: profile.email,
        password: defaultPassword,
      });

    if (authError) {
      console.error("🔍 [Login] Erro no auth:", authError.message);

      if (authError.message.includes("Invalid login credentials")) {
        console.log("🔍 [Login] Criando usuário no Auth...");

        const { error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email: profile.email,
            password: defaultPassword,
            email_confirm: true,
            user_metadata: { matricula: validated.matricula },
          });

        if (createError) {
          console.error("🔍 [Login] Erro ao criar usuário:", createError);
          return {
            success: false,
            error: "Erro na autenticação. Contate o administrador.",
          };
        }

        const { data: retryAuth, error: retryError } =
          await supabase.auth.signInWithPassword({
            email: profile.email,
            password: defaultPassword,
          });

        if (retryError) {
          return {
            success: false,
            error: "Erro na autenticação. Tente novamente.",
          };
        }

        if (!retryAuth.session) {
          return {
            success: false,
            error: "Sessão não criada",
          };
        }

        return await handleSuccessfulLogin(
          retryAuth.session,
          retryAuth.user,
          profile,
          validated.matricula,
          supabase,
          supabaseAdmin
        );
      } else {
        return {
          success: false,
          error: `Erro na autenticação: ${authError.message}`,
        };
      }
    }

    if (!authData.session) {
      return {
        success: false,
        error: "Sessão não criada",
      };
    }

    return await handleSuccessfulLogin(
      authData.session,
      authData.user,
      profile,
      validated.matricula,
      supabase,
      supabaseAdmin
    );
  } catch (error) {
    console.error("🔍 [Login] Erro completo:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Matrícula inválida. Verifique o formato.",
        details: error.flatten(),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro interno no servidor",
    };
  }
}

// app/actions/auth/login.ts - CORREÇÃO
async function handleSuccessfulLogin(
  session: Session,
  user: User,
  profile: { id: string; email: string; status: boolean; role: string },
  matricula: string,
  supabase: ReturnType<typeof createClient<Database>>,
  supabaseAdmin: ReturnType<typeof createClient<Database>>
): Promise<LoginResponse> {
  try {
    console.log("🔍 [Login] Buscando perfil completo...");

    // ✅ CORREÇÃO: Usar Service Role para evitar RLS
    const { data: fullProfile, error: fullProfileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", profile.id) // Usar o ID que já temos da busca anterior
      .single();

    if (fullProfileError) {
      console.error("❌ [Login] Erro Service Role:", fullProfileError);

      // Fallback: criar perfil básico
      // ✅ CORREÇÃO: Remover o "as any" e usar casting correto
      const basicProfile: Profile = {
        id: profile.id,
        email: profile.email,
        matricula: matricula,
        status: profile.status,
        role: profile.role as "admin" | "agent", // ✅ CORREÇÃO AQUI
        full_name: null,
        avatar_url: null,
        graduacao: null,
        validade_certificacao: null,
        tipo_sanguineo: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        uf: null,
        data_nascimento: null,
        telefone: null,
        admin_secret_hash: null,
        admin_secret_salt: null,
        admin_2fa_enabled: false,
        admin_last_auth: null,
      };

      console.log("⚠️ [Login] Usando perfil básico");

      // Registrar atividade
      await supabaseAdmin.from("system_activities").insert({
        user_id: user.id,
        action_type: "user_login",
        description: `Login realizado por ${profile.email}`,
        resource_type: "auth",
        resource_id: user.id,
        metadata: {
          matricula: matricula,
          ip: "server-action",
          timestamp: new Date().toISOString(),
          note: "Perfil básico usado",
        },
      });

      revalidatePath("/perfil");

      return {
        success: true,
        message: profile.status
          ? "Login realizado com sucesso!"
          : "Login realizado - Agente inativo",
        data: {
          session: session,
          user: basicProfile,
        },
      };
    }

    console.log("✅ [Login] Perfil completo:", {
      nome: fullProfile.full_name,
      matricula: fullProfile.matricula,
      uf: fullProfile.uf,
      status: fullProfile.status,
      role: fullProfile.role,
    });

    // Registrar atividade
    await supabaseAdmin.from("system_activities").insert({
      user_id: user.id,
      action_type: "user_login",
      description: `Login realizado por ${
        fullProfile.full_name || fullProfile.email
      }`,
      resource_type: "auth",
      resource_id: user.id,
      metadata: {
        matricula: fullProfile.matricula,
        ip: "server-action",
        timestamp: new Date().toISOString(),
      },
    });

    revalidatePath("/");
    revalidatePath("/perfil");

    return {
      success: true,
      message: fullProfile.status
        ? "Login realizado com sucesso!"
        : "Login realizado - Agente inativo",
      data: {
        session: session,
        user: fullProfile, // ✅ Perfil COMPLETO
      },
    };
  } catch (error) {
    console.error("❌ [Login] Erro no handleSuccessfulLogin:", error);
    return {
      success: false,
      error: "Erro ao processar login",
    };
  }
}
