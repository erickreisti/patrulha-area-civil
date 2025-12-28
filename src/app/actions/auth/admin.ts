"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import crypto from "crypto";

// ✅ Interface para resposta
interface AdminAuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  sessionToken?: string;
}

// ✅ Função para autenticar admin e criar sessão
export async function authenticateAdminSession(
  userId: string,
  userEmail: string,
  adminPassword: string
): Promise<AdminAuthResponse> {
  try {
    console.log("🔍 [Server Auth] Iniciando autenticação admin...", {
      userId,
      userEmail: userEmail.substring(0, 10) + "...",
    });

    // 1. Verificar credenciais usando Service Role (para evitar RLS)
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

    // Buscar perfil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("admin_secret_hash, admin_secret_salt, role, status, id, email")
      .eq("id", userId)
      .eq("email", userEmail)
      .single();

    if (profileError || !profile) {
      console.error("❌ [Server Auth] Perfil não encontrado:", profileError);
      return {
        success: false,
        error: "Perfil de administrador não encontrado",
      };
    }

    // Verificar se é admin
    if (profile.role !== "admin") {
      return {
        success: false,
        error: "Usuário não possui permissões de administrador",
      };
    }

    // Verificar status
    if (!profile.status) {
      return {
        success: false,
        error: "Conta de administrador inativa",
      };
    }

    // Verificar senha admin
    if (!profile.admin_secret_hash || !profile.admin_secret_salt) {
      return {
        success: false,
        error: "Senha administrativa não configurada",
      };
    }

    // Calcular hash da senha fornecida
    const hash = crypto
      .createHash("sha256")
      .update(adminPassword + profile.admin_secret_salt)
      .digest("hex");

    if (hash !== profile.admin_secret_hash) {
      console.log("❌ [Server Auth] Senha incorreta");
      return {
        success: false,
        error: "Senha de administrador incorreta",
      };
    }

    console.log("✅ [Server Auth] Credenciais validadas");

    // 2. Atualizar timestamp de última autenticação
    await supabaseAdmin
      .from("profiles")
      .update({
        admin_last_auth: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // 3. Tentar criar uma sessão do Supabase (opcional, para compatibilidade)
    try {
      const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: userEmail,
        password: process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure",
      });

      if (authError) {
        console.warn(
          "⚠️ [Server Auth] Não foi possível criar sessão Supabase:",
          authError.message
        );
      } else {
        console.log(
          "✅ [Server Auth] Sessão Supabase criada para compatibilidade"
        );
      }
    } catch (authErr) {
      console.warn("⚠️ [Server Auth] Erro ao criar sessão Supabase:", authErr);
    }

    // 4. Criar cookie de sessão admin personalizado
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

    // 5. Salvar sessão admin na tabela de atividades
    await supabaseAdmin.from("system_activities").insert({
      user_id: userId,
      action_type: "admin_session_created",
      description: `Sessão administrativa iniciada por ${profile.email}`,
      resource_type: "auth",
      resource_id: userId,
      metadata: {
        session_token: sessionToken.substring(0, 16) + "...",
        expires_at: expiresAt.toISOString(),
      },
    });

    // 6. Definir cookies personalizados
    const cookieStore = await cookies();

    // Cookie principal de sessão admin
    cookieStore.set({
      name: "admin_session",
      value: JSON.stringify({
        userId,
        userEmail,
        sessionToken,
        expiresAt: expiresAt.toISOString(),
        timestamp: new Date().toISOString(),
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    // Cookie de flag admin (para verificação rápida)
    cookieStore.set({
      name: "is_admin",
      value: "true",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    console.log("✅ [Server Auth] Sessão admin criada com sucesso");
    return {
      success: true,
      message: "Autenticação administrativa bem-sucedida!",
      sessionToken,
    };
  } catch (error) {
    console.error("❌ [Server Auth] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro na autenticação",
    };
  }
}

// ✅ Função para verificar sessão admin via cookies
export async function verifyAdminSession(): Promise<{
  success: boolean;
  user?: { id: string; email: string };
  error?: string;
}> {
  try {
    const cookieStore = await cookies();

    // 1. Verificar cookie de sessão admin
    const adminSessionCookie = cookieStore.get("admin_session")?.value;
    if (!adminSessionCookie) {
      return {
        success: false,
        error: "Sessão administrativa não encontrada",
      };
    }

    try {
      const sessionData = JSON.parse(adminSessionCookie);

      // Verificar expiração
      if (new Date(sessionData.expiresAt) < new Date()) {
        return {
          success: false,
          error: "Sessão administrativa expirada",
        };
      }

      // 2. Verificar se é admin no banco
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

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("role, status")
        .eq("id", sessionData.userId)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          error: "Perfil não encontrado",
        };
      }

      if (profile.role !== "admin" || !profile.status) {
        return {
          success: false,
          error: "Usuário não é administrador",
        };
      }

      return {
        success: true,
        user: {
          id: sessionData.userId,
          email: sessionData.userEmail,
        },
      };
    } catch {
      return {
        success: false,
        error: "Sessão administrativa inválida",
      };
    }
  } catch (error) {
    console.error("❌ [Server Auth] Erro na verificação:", error);
    return {
      success: false,
      error: "Erro ao verificar sessão",
    };
  }
}

// ✅ Função para verificar acesso admin (usada pelo dashboard)
export async function checkAdminAccess(): Promise<{
  success: boolean;
  isAdmin?: boolean;
  user?: { id: string; email: string };
  error?: string;
}> {
  try {
    // Primeiro tentar verificar pela sessão admin personalizada
    const adminSessionResult = await verifyAdminSession();

    if (adminSessionResult.success) {
      console.log(
        "✅ [checkAdminAccess] Acesso via sessão admin personalizada"
      );
      return {
        success: true,
        isAdmin: true,
        user: adminSessionResult.user,
      };
    }

    // Se falhar, tentar verificar pela sessão normal do Supabase
    const supabaseServer = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        isAdmin: false,
        error: adminSessionResult.error || "Usuário não autenticado",
      };
    }

    // Verificar se é admin no banco
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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        isAdmin: false,
        error: "Perfil não encontrado",
      };
    }

    if (profile.role !== "admin" || !profile.status) {
      return {
        success: false,
        isAdmin: false,
        error: "Usuário não é administrador",
      };
    }

    console.log("✅ [checkAdminAccess] Acesso via sessão Supabase normal");
    return {
      success: true,
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email || "",
      },
    };
  } catch (error) {
    console.error("❌ [checkAdminAccess] Erro na verificação:", error);
    return {
      success: false,
      isAdmin: false,
      error: "Erro ao verificar acesso",
    };
  }
}

// ✅ Função para destruir sessão admin
export async function destroyAdminSession(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();

    // Limpar cookies de admin
    cookieStore.delete("admin_session");
    cookieStore.delete("is_admin");

    console.log("✅ [Server Auth] Sessão admin destruída");
    return {
      success: true,
      message: "Sessão administrativa encerrada",
    };
  } catch (err) {
    console.error("❌ [Server Auth] Erro ao destruir sessão:", err);
    return {
      success: false,
      error: "Erro ao encerrar sessão administrativa",
    };
  }
}

// ✅ Função auxiliar para verificar cookie admin rapidamente
export async function checkAdminCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("is_admin")?.value;
    return adminCookie === "true";
  } catch {
    return false;
  }
}
