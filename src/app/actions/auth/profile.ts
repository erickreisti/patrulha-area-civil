// src/app/actions/auth/profile.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import crypto from "crypto";

// Schema para verificação da senha admin
const VerifyAdminPasswordSchema = z.object({
  adminPassword: z.string().min(1, "Senha de administrador é obrigatória"),
  userId: z.string().uuid("ID do usuário inválido"),
  userEmail: z.string().email("Email inválido"),
});

export async function verifyAdminPassword(formData: FormData) {
  try {
    console.log("🔍 [Server] Verificando senha administrativa...");

    const { adminPassword, userId, userEmail } =
      VerifyAdminPasswordSchema.parse({
        adminPassword: formData.get("adminPassword"),
        userId: formData.get("userId"),
        userEmail: formData.get("userEmail"),
      });

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

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("admin_secret_hash, admin_secret_salt, role, status")
      .eq("id", userId)
      .eq("email", userEmail)
      .single();

    if (profileError || !profile) {
      console.error("❌ [Server] Perfil não encontrado:", profileError);
      return {
        success: false,
        error: "Perfil não encontrado",
      };
    }

    if (profile.role !== "admin") {
      return {
        success: false,
        error: "Usuário não possui permissões de administrador",
      };
    }

    if (!profile.status) {
      return {
        success: false,
        error: "Conta de administrador inativa",
      };
    }

    // Verificar se o admin tem senha configurada
    if (!profile.admin_secret_hash || !profile.admin_secret_salt) {
      return {
        success: false,
        error:
          "Senha administrativa não configurada. Configure primeiro no seu perfil.",
      };
    }

    console.log("🔍 [Server] Dados do perfil:", {
      hasHash: !!profile.admin_secret_hash,
      hasSalt: !!profile.admin_secret_salt,
      hashLength: profile.admin_secret_hash?.length,
      saltLength: profile.admin_secret_salt?.length,
    });

    // ✅ CORREÇÃO: Usar SHA256 (igual ao que está no banco)
    const hash = crypto
      .createHash("sha256")
      .update(adminPassword + profile.admin_secret_salt)
      .digest("hex");

    const isValid = hash === profile.admin_secret_hash;

    console.log("🔍 [Server] Comparação:", {
      inputHash: hash.substring(0, 10) + "...",
      storedHash: profile.admin_secret_hash?.substring(0, 10) + "...",
      isValid,
    });

    if (!isValid) {
      console.log("❌ [Server] Senha administrativa incorreta");
      return {
        success: false,
        error: "Senha de administrador incorreta",
      };
    }

    // Atualizar último acesso
    await supabaseAdmin
      .from("profiles")
      .update({
        admin_last_auth: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    console.log("✅ [Server] Senha administrativa verificada com sucesso");
    return {
      success: true,
      message: "Autenticação administrativa bem-sucedida",
    };
  } catch (error) {
    console.error("❌ [Server] Erro em verifyAdminPassword:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        details: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro na autenticação",
    };
  }
}

export async function setupAdminPassword(formData: FormData) {
  try {
    console.log("🔍 [Server] Configurando senha administrativa...");

    const matricula = formData.get("matricula") as string;
    const adminPassword = formData.get("adminPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!matricula || !adminPassword || !confirmPassword) {
      return {
        success: false,
        error: "Todos os campos são obrigatórios",
      };
    }

    if (adminPassword !== confirmPassword) {
      return {
        success: false,
        error: "As senhas não coincidem",
      };
    }

    if (adminPassword.length < 6) {
      return {
        success: false,
        error: "A senha deve ter no mínimo 6 caracteres",
      };
    }

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

    // Buscar perfil pela matrícula
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .eq("matricula", matricula)
      .eq("role", "admin")
      .single();

    if (profileError || !profile) {
      console.error("❌ [Server] Perfil admin não encontrado:", profileError);
      return {
        success: false,
        error: "Perfil de administrador não encontrado",
      };
    }

    // ✅ CORREÇÃO: Gerar salt e hash usando SHA256 (compatível com seu banco)
    const salt = crypto.randomBytes(16).toString("hex"); // 32 chars hex
    const hash = crypto
      .createHash("sha256")
      .update(adminPassword + salt)
      .digest("hex"); // 64 chars hex

    console.log("🔍 [Server] Gerando hash:", {
      saltLength: salt.length,
      hashLength: hash.length,
      salt: salt.substring(0, 10) + "...",
      hash: hash.substring(0, 10) + "...",
    });

    // Atualizar perfil
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        admin_secret_hash: hash,
        admin_secret_salt: salt,
        admin_2fa_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("❌ [Server] Erro ao atualizar perfil:", updateError);
      return {
        success: false,
        error: "Erro ao configurar senha",
      };
    }

    console.log("✅ [Server] Senha administrativa configurada com sucesso");
    return {
      success: true,
      message: "Senha administrativa configurada com sucesso!",
    };
  } catch (error) {
    console.error("❌ [Server] Erro em setupAdminPassword:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao configurar senha",
    };
  }
}

// ✅ FUNÇÃO ADICIONAL: Resetar senha admin
export async function resetAdminPassword(userId: string) {
  try {
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

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        admin_secret_hash: null,
        admin_secret_salt: null,
        admin_2fa_enabled: false,
        admin_last_auth: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("❌ [Server] Erro ao resetar senha:", error);
      return {
        success: false,
        error: "Erro ao resetar senha",
      };
    }

    console.log("✅ [Server] Senha administrativa resetada");
    return {
      success: true,
      message: "Senha administrativa resetada com sucesso",
    };
  } catch (error) {
    console.error("❌ [Server] Erro em resetAdminPassword:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao resetar senha",
    };
  }
}
