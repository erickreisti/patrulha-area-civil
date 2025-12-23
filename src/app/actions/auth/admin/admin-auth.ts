"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import type { Database } from "@/lib/supabase/types";

// Schema de validação
const VerifyAdminSchema = z.object({
  adminPassword: z.string().min(1, "Senha admin obrigatória"),
  userId: z.string().uuid("ID do usuário inválido"),
  userEmail: z.string().email("Email inválido").optional(),
});

const SetupAdminPasswordSchema = z
  .object({
    matricula: z.string().min(11, "Matrícula inválida"),
    adminPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

// Cliente admin para bypass RLS
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("🔧 [ADMIN-AUTH] Criando cliente service role...");
  console.log("🔧 [ADMIN-AUTH] Supabase URL:", !!supabaseUrl);
  console.log("🔧 [ADMIN-AUTH] Service Role Key:", !!serviceRoleKey);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Gerar hash da senha
async function hashPassword(password: string, salt: string): Promise<string> {
  console.log("🔐 [ADMIN-AUTH] Gerando hash para senha...");

  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  console.log(
    "🔐 [ADMIN-AUTH] Hash gerado (primeiros 10 chars):",
    hash.substring(0, 10) + "..."
  );
  return hash;
}

// Interface para informações de debug
interface DebugInfo {
  step?: string;
  error?: string;
  code?: string;
  userId?: string;
  matricula?: string;
  timestamp?: string;
  hashExpected?: string;
  hashReceived?: string;
  hashLengthExpected?: number;
  hashLengthReceived?: number;
  testWithPac2026?: boolean;
  not_admin?: string;
  inactive?: boolean;
  "2fa_disabled"?: boolean;
  hash_salt_missing?: {
    hasHash: boolean;
    hasSalt: boolean;
  };
  zod_error?: z.ZodIssue[];
  unexpected_error?: string;
  fetch_profile?: string;
  profile_not_found?: string;
  password_mismatch?: {
    hashExpected: string;
    hashReceived: string;
    hashLengthExpected: number;
    hashLengthReceived: number;
    testWithPac2026: boolean;
  };
}

// Função principal de verificação de senha admin
export async function verifyAdminPassword(formData: FormData) {
  console.log("🚀 [ADMIN-AUTH] ===== INICIANDO VERIFICAÇÃO ADMIN =====");

  try {
    // 1. VALIDAR DADOS DO FORM
    console.log("🔍 [ADMIN-AUTH] Passo 1: Validando dados do formulário...");

    const adminPassword = formData.get("adminPassword") as string;
    const userId = formData.get("userId") as string;
    const userEmail = formData.get("userEmail") as string;

    console.log("📋 [ADMIN-AUTH] Dados recebidos:");
    console.log("   - Admin Password:", adminPassword ? "***" : "vazio");
    console.log("   - User ID:", userId);
    console.log("   - User Email:", userEmail || "não fornecido");

    const validated = VerifyAdminSchema.parse({
      adminPassword,
      userId,
      userEmail,
    });

    console.log("✅ [ADMIN-AUTH] Validação OK");

    // 2. BUSCAR PERFIL DO ADMIN (usando service role)
    console.log("🔍 [ADMIN-AUTH] Passo 2: Buscando perfil do admin...");
    const supabaseAdmin = createServiceRoleClient();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, matricula, email, full_name, role, status, admin_secret_hash, admin_secret_salt, admin_2fa_enabled"
      )
      .eq("id", validated.userId)
      .single();

    if (profileError) {
      console.error("❌ [ADMIN-AUTH] Erro ao buscar perfil:", profileError);
      console.error("❌ [ADMIN-AUTH] Error details:", profileError.message);
      console.error("❌ [ADMIN-AUTH] Error code:", profileError.code);

      return {
        success: false,
        error:
          "Erro ao buscar perfil de administrador. Verifique se você é administrador.",
        debug: {
          step: "fetch_profile",
          error: profileError.message,
          code: profileError.code,
          userId: validated.userId,
        } as DebugInfo,
      };
    }

    if (!profile) {
      console.error(
        "❌ [ADMIN-AUTH] Perfil não encontrado para user_id:",
        validated.userId
      );
      return {
        success: false,
        error: "Perfil de administrador não encontrado",
        debug: {
          step: "profile_not_found",
          userId: validated.userId,
        } as DebugInfo,
      };
    }

    console.log("✅ [ADMIN-AUTH] Perfil encontrado:");
    console.log("   - ID:", profile.id);
    console.log("   - Matrícula:", profile.matricula);
    console.log("   - Nome:", profile.full_name);
    console.log("   - Role:", profile.role);
    console.log("   - Status:", profile.status);
    console.log("   - Admin 2FA:", profile.admin_2fa_enabled);
    console.log("   - Tem hash:", !!profile.admin_secret_hash);
    console.log("   - Tem salt:", !!profile.admin_secret_salt);

    // 3. VERIFICAR SE É ADMIN E ESTÁ ATIVO
    console.log("🔍 [ADMIN-AUTH] Passo 3: Verificando permissões...");

    if (profile.role !== "admin") {
      console.error(
        "❌ [ADMIN-AUTH] Usuário não é administrador. Role:",
        profile.role
      );
      return {
        success: false,
        error: "Usuário não possui permissões de administrador",
        debug: { step: "not_admin", not_admin: profile.role } as DebugInfo,
      };
    }

    if (!profile.status) {
      console.error("❌ [ADMIN-AUTH] Conta de administrador inativa");
      return {
        success: false,
        error: "Conta de administrador está inativa",
        debug: { step: "inactive", inactive: profile.status } as DebugInfo,
      };
    }

    // 4. VERIFICAR SE 2FA ESTÁ CONFIGURADO
    console.log("🔍 [ADMIN-AUTH] Passo 4: Verificando configuração 2FA...");

    if (!profile.admin_2fa_enabled) {
      console.error("❌ [ADMIN-AUTH] Admin 2FA não está habilitado");
      return {
        success: false,
        error: "Autenticação admin não habilitada para este usuário",
        debug: {
          step: "2fa_disabled",
          "2fa_disabled": profile.admin_2fa_enabled,
        } as DebugInfo,
      };
    }

    if (!profile.admin_secret_hash || !profile.admin_secret_salt) {
      console.error("❌ [ADMIN-AUTH] Hash ou salt não configurados");
      console.log("   Hash presente:", !!profile.admin_secret_hash);
      console.log("   Salt presente:", !!profile.admin_secret_salt);

      return {
        success: false,
        error: "Senha administrativa não configurada para este usuário",
        debug: {
          step: "hash_salt_missing",
          hash_salt_missing: {
            hasHash: !!profile.admin_secret_hash,
            hasSalt: !!profile.admin_secret_salt,
          },
        } as DebugInfo,
      };
    }

    console.log("✅ [ADMIN-AUTH] Configuração 2FA OK");
    console.log(
      "   Salt (primeiros 10 chars):",
      profile.admin_secret_salt.substring(0, 10) + "..."
    );
    console.log(
      "   Hash (primeiros 10 chars):",
      profile.admin_secret_hash.substring(0, 10) + "..."
    );

    // 5. CALCULAR HASH DA SENHA FORNECIDA
    console.log(
      "🔍 [ADMIN-AUTH] Passo 5: Calculando hash da senha fornecida..."
    );
    console.log("📝 [ADMIN-AUTH] Senha fornecida:", validated.adminPassword);
    console.log(
      "🧂 [ADMIN-AUTH] Salt do banco (primeiros 10 chars):",
      profile.admin_secret_salt.substring(0, 10) + "..."
    );

    const hashedInput = await hashPassword(
      validated.adminPassword,
      profile.admin_secret_salt
    );

    console.log(
      "🔐 [ADMIN-AUTH] Hash calculado (primeiros 10 chars):",
      hashedInput.substring(0, 10) + "..."
    );
    console.log(
      "🔐 [ADMIN-AUTH] Hash do banco (primeiros 10 chars):",
      profile.admin_secret_hash.substring(0, 10) + "..."
    );

    // 6. VERIFICAR SE A SENHA ESTÁ CORRETA
    console.log("🔍 [ADMIN-AUTH] Passo 6: Comparando hashes...");
    const isValid = hashedInput === profile.admin_secret_hash;

    console.log(
      "🔐 [ADMIN-AUTH] Hash esperado (primeiros 20 chars):",
      profile.admin_secret_hash.substring(0, 20) + "..."
    );
    console.log(
      "🔐 [ADMIN-AUTH] Hash recebido (primeiros 20 chars):",
      hashedInput.substring(0, 20) + "..."
    );
    console.log("🔐 [ADMIN-AUTH] Hashes são iguais?", isValid);

    if (isValid) {
      console.log("🎉 [ADMIN-AUTH] ✅ SENHA VÁLIDA! ✅");

      // 7. REGISTRAR ATIVIDADE
      console.log("🔍 [ADMIN-AUTH] Passo 7: Registrando atividade...");
      try {
        await supabaseAdmin.from("system_activities").insert({
          user_id: profile.id,
          action_type: "admin_dashboard_access",
          description: "Acesso ao painel administrativo",
          resource_type: "admin_panel",
        });
        console.log("✅ [ADMIN-AUTH] Atividade registrada");
      } catch (activityError) {
        console.error(
          "⚠️ [ADMIN-AUTH] Erro ao registrar atividade:",
          activityError
        );
      }

      // 8. ATUALIZAR ÚLTIMO ACESSO
      console.log("🔍 [ADMIN-AUTH] Passo 8: Atualizando último acesso...");
      try {
        await supabaseAdmin
          .from("profiles")
          .update({ admin_last_auth: new Date().toISOString() })
          .eq("id", profile.id);
        console.log("✅ [ADMIN-AUTH] Último acesso atualizado");
      } catch (updateError) {
        console.error(
          "⚠️ [ADMIN-AUTH] Erro ao atualizar último acesso:",
          updateError
        );
      }

      console.log("🎉 [ADMIN-AUTH] ===== AUTENTICAÇÃO BEM-SUCEDIDA =====");

      return {
        success: true,
        message: "Autenticação admin bem-sucedida",
        debug: {
          step: "success",
          userId: profile.id,
          matricula: profile.matricula,
          timestamp: new Date().toISOString(),
        } as DebugInfo,
      };
    } else {
      console.error("❌ [ADMIN-AUTH] ❌ SENHA INCORRETA! ❌");
      console.log("🔍 [ADMIN-AUTH] Detalhes da comparação:");
      console.log(
        "   Hash do banco (primeiros 50 chars):",
        profile.admin_secret_hash.substring(0, 50)
      );
      console.log(
        "   Hash calculado (primeiros 50 chars):",
        hashedInput.substring(0, 50)
      );
      console.log(
        "   Comprimento hash banco:",
        profile.admin_secret_hash.length
      );
      console.log("   Comprimento hash calculado:", hashedInput.length);

      // Teste com a senha fornecida pelo usuário
      console.log("🧪 [ADMIN-AUTH] Testando com senha P@c_2026#...");
      const testHash = await hashPassword(
        "P@c_2026#",
        profile.admin_secret_salt
      );
      console.log(
        "   Hash com P@c_2026# (primeiros 20 chars):",
        testHash.substring(0, 20) + "..."
      );
      console.log(
        "   Hash do banco (primeiros 20 chars):",
        profile.admin_secret_hash.substring(0, 20) + "..."
      );
      console.log("   São iguais?", testHash === profile.admin_secret_hash);

      console.log("❌ [ADMIN-AUTH] ===== AUTENTICAÇÃO FALHOU =====");

      return {
        success: false,
        error: "Senha administrativa incorreta",
        debug: {
          step: "password_mismatch",
          password_mismatch: {
            hashExpected: profile.admin_secret_hash.substring(0, 20) + "...",
            hashReceived: hashedInput.substring(0, 20) + "...",
            hashLengthExpected: profile.admin_secret_hash.length,
            hashLengthReceived: hashedInput.length,
            testWithPac2026: testHash === profile.admin_secret_hash,
          },
        } as DebugInfo,
      };
    }
  } catch (error) {
    console.error("💥 [ADMIN-AUTH] ===== ERRO CRÍTICO =====");
    console.error("💥 [ADMIN-AUTH] Erro em verifyAdminPassword:", error);

    if (error instanceof z.ZodError) {
      console.error("💥 [ADMIN-AUTH] Erro de validação Zod:", error.issues);
      return {
        success: false,
        error: "Dados inválidos",
        details: error.flatten(),
        debug: {
          step: "zod_error",
          zod_error: error.issues,
        } as DebugInfo,
      };
    }

    console.error(
      "💥 [ADMIN-AUTH] Stack trace:",
      error instanceof Error ? error.stack : "No stack"
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro na verificação",
      debug: {
        step: "unexpected_error",
        unexpected_error:
          error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      } as DebugInfo,
    };
  }
}

// Função para configurar senha admin (primeira vez)
export async function setupAdminPassword(formData: FormData) {
  console.log("🔧 [ADMIN-AUTH] setupAdminPassword iniciado");

  try {
    const supabaseAdmin = createServiceRoleClient();

    // Validar dados
    const validated = SetupAdminPasswordSchema.parse({
      matricula: formData.get("matricula"),
      adminPassword: formData.get("adminPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    console.log(
      "🔧 [ADMIN-AUTH] Configurando senha para matrícula:",
      validated.matricula
    );

    // Gerar salt e hash
    const salt = randomBytes(16).toString("hex");
    console.log("🔧 [ADMIN-AUTH] Salt gerado:", salt.substring(0, 10) + "...");

    const hash = await hashPassword(validated.adminPassword, salt);
    console.log("🔧 [ADMIN-AUTH] Hash gerado:", hash.substring(0, 20) + "...");

    // Buscar perfil para obter ID
    const { data: profileData, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, matricula, role")
      .eq("matricula", validated.matricula)
      .eq("role", "admin")
      .single();

    if (fetchError || !profileData) {
      console.error("❌ [ADMIN-AUTH] Erro ao buscar perfil:", fetchError);
      return {
        success: false,
        error: "Perfil de administrador não encontrado",
        debug: {
          error: fetchError?.message,
          matricula: validated.matricula,
        } as DebugInfo,
      };
    }

    // Atualizar perfil
    const { data: profile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        admin_secret_hash: hash,
        admin_secret_salt: salt,
        admin_2fa_enabled: true,
        admin_last_auth: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileData.id)
      .select()
      .single();

    if (updateError || !profile) {
      console.error("❌ [ADMIN-AUTH] Erro ao configurar senha:", updateError);
      return {
        success: false,
        error: "Erro ao configurar senha admin",
        debug: {
          error: updateError?.message,
          matricula: validated.matricula,
        } as DebugInfo,
      };
    }

    // Registrar atividade
    await supabaseAdmin.from("system_activities").insert({
      user_id: profile.id,
      action_type: "admin_password_setup",
      description: "Senha administrativa configurada",
      resource_type: "admin_security",
    });

    revalidatePath("/perfil");

    console.log(
      "✅ [ADMIN-AUTH] Senha configurada com sucesso para:",
      profile.matricula
    );

    return {
      success: true,
      message: "Senha administrativa configurada com sucesso!",
      debug: {
        profileId: profile.id,
        matricula: profile.matricula,
        timestamp: new Date().toISOString(),
      } as DebugInfo,
    };
  } catch (error) {
    console.error("❌ [ADMIN-AUTH] Erro em setupAdminPassword:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação",
        details: error.flatten(),
        debug: { step: "zod_error", zod_error: error.issues } as DebugInfo,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro na configuração",
      debug: {
        step: "unexpected_error",
        unexpected_error: String(error),
      } as DebugInfo,
    };
  }
}

// Função para verificar se admin precisa configurar senha
export async function checkAdminPasswordSetup(userId: string) {
  console.log(
    "🔧 [ADMIN-AUTH] checkAdminPasswordSetup iniciado para user:",
    userId
  );

  try {
    const supabaseAdmin = createServiceRoleClient();

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, matricula, role, admin_2fa_enabled, admin_secret_hash")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      console.error("❌ [ADMIN-AUTH] Erro ao buscar perfil:", error);
      return {
        success: false,
        needsSetup: false,
        error: "Erro ao verificar configuração",
      };
    }

    const needsSetup = profile.role === "admin" && !profile.admin_2fa_enabled;

    console.log("✅ [ADMIN-AUTH] Verificação concluída:");
    console.log("   - Role:", profile.role);
    console.log("   - Admin 2FA:", profile.admin_2fa_enabled);
    console.log("   - Tem hash:", !!profile.admin_secret_hash);
    console.log("   - Precisa configurar:", needsSetup);

    return {
      success: true,
      needsSetup,
      profile: {
        id: profile.id,
        matricula: profile.matricula,
        role: profile.role,
      },
    };
  } catch (error) {
    console.error("❌ [ADMIN-AUTH] Erro em checkAdminPasswordSetup:", error);
    return {
      success: false,
      needsSetup: false,
      error: "Erro na verificação",
    };
  }
}

// Validar acesso admin em rotas protegidas
export async function validateAdminAccess() {
  console.log("🔧 [ADMIN-AUTH] validateAdminAccess iniciado");

  try {
    // A validação real da sessão deve acontecer no middleware ou no componente
    // Esta função serve apenas como placeholder para a estrutura

    return {
      success: true,
      message: "Validação de acesso administrativo",
      debug: { timestamp: new Date().toISOString() } as DebugInfo,
    };
  } catch (error) {
    console.error("💥 [ADMIN-AUTH] Erro na validação:", error);
    return {
      success: false,
      error: "Erro na validação do acesso admin",
    };
  }
}

// Logout admin
export async function adminLogout() {
  console.log("🔧 [ADMIN-AUTH] adminLogout iniciado");

  try {
    return {
      success: true,
      message: "Sessão administrativa encerrada",
      debug: {
        step: "logout_success",
        timestamp: new Date().toISOString(),
      } as DebugInfo,
    };
  } catch (error) {
    console.error("❌ [ADMIN-AUTH] Erro em adminLogout:", error);
    return {
      success: false,
      error: "Erro ao encerrar sessão admin",
      debug: { step: "logout_error", error: String(error) } as DebugInfo,
    };
  }
}
