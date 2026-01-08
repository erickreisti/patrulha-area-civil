"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile, Database } from "@/lib/supabase/types";

const LoginSchema = z.object({
  matricula: z
    .string()
    .min(1, "Matrícula é obrigatória")
    .max(20, "Matrícula muito longa")
    .transform((val) => val.replace(/\D/g, "").trim()),
});

const AdminAuthSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido"),
  userEmail: z.string().email("Email inválido"),
  adminPassword: z.string().min(1, "Senha de administrador é obrigatória"),
});

// 🔧 CORREÇÃO CRÍTICA: Função para definir cookies de forma correta
const setAdminCookies = async (
  userId: string,
  userEmail: string,
  sessionToken: string,
  expiresAt: Date
): Promise<boolean> => {
  try {
    console.log("🍪 [setAdminCookies] Definindo cookies admin...", {
      userId,
      userEmail,
      expiresAt: expiresAt.toISOString(),
    });

    const cookieStore = await cookies();

    // ✅ Usar expiresAt passado como parâmetro
    const expires = expiresAt;

    // Cookie de sessão admin - IMPORTANTE: httpOnly false para middleware ler
    cookieStore.set({
      name: "admin_session",
      value: JSON.stringify({
        userId,
        userEmail,
        sessionToken,
        expiresAt: expires.toISOString(),
        createdAt: new Date().toISOString(),
      }),
      httpOnly: false, // 🔥 CRÍTICO: false para middleware poder ler
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expires,
      maxAge: 2 * 60 * 60, // 2 horas em segundos
    });

    // Flag de admin
    cookieStore.set({
      name: "is_admin",
      value: "true",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expires,
      maxAge: 2 * 60 * 60, // 2 horas em segundos
    });

    console.log("✅ [setAdminCookies] Cookies admin definidos com sucesso");
    return true;
  } catch (error) {
    console.error("❌ [setAdminCookies] Erro:", error);
    return false;
  }
};

const clearAdminCookies = async (): Promise<boolean> => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    cookieStore.delete("is_admin");
    console.log("✅ [clearAdminCookies] Cookies admin removidos");
    return true;
  } catch (error) {
    console.error("❌ [clearAdminCookies] Erro:", error);
    return false;
  }
};

// PRINCIPAIS FUNÇÕES
export async function login(formData: FormData) {
  try {
    console.log("🔐 [login] Iniciando processo de login...");

    const matricula = formData.get("matricula") as string;
    const validated = LoginSchema.parse({ matricula });

    console.log("🔢 [login] Matrícula validada:", validated.matricula);

    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, status, role, full_name")
      .eq("matricula", validated.matricula)
      .single();

    if (profileError || !profile) {
      console.log("❌ [login] Matrícula não encontrada:", validated.matricula);
      return { success: false, error: "Matrícula não encontrada" };
    }

    console.log("✅ [login] Perfil encontrado:", {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      status: profile.status,
    });

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const defaultPassword =
      process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure";

    console.log("🔑 [login] Tentando login com senha padrão...");

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: profile.email,
        password: defaultPassword,
      });

    if (authError) {
      console.log("⚠️ [login] Erro no login:", authError.message);

      if (authError.message.includes("Invalid login credentials")) {
        console.log("🔄 [login] Criando usuário...");

        await supabaseAdmin.auth.admin.createUser({
          email: profile.email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: { matricula: validated.matricula },
        });

        const { data: retryAuth } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: defaultPassword,
        });

        if (!retryAuth?.session) {
          console.log("❌ [login] Erro na retentativa de login");
          return { success: false, error: "Erro na autenticação" };
        }

        console.log("✅ [login] Usuário criado e autenticado");
        return await handleSuccessfulLogin(
          retryAuth.session,
          retryAuth.user,
          profile,
          validated.matricula,
          supabaseAdmin
        );
      }
      return { success: false, error: authError.message };
    }

    if (!authData.session) {
      console.log("❌ [login] Sessão não criada");
      return { success: false, error: "Sessão não criada" };
    }

    console.log("✅ [login] Login bem-sucedido");
    return await handleSuccessfulLogin(
      authData.session,
      authData.user,
      profile,
      validated.matricula,
      supabaseAdmin
    );
  } catch (error) {
    console.error("❌ [login] Erro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro no login",
    };
  }
}

export async function logout() {
  try {
    console.log("🚪 [logout] Iniciando logout...");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Limpar cookies admin primeiro
    await clearAdminCookies();

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("❌ [logout] Erro ao fazer logout:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ [logout] Logout realizado com sucesso");
    revalidatePath("/");
    return { success: true, message: "Logout realizado" };
  } catch (error) {
    console.error("❌ [logout] Erro:", error);
    return { success: false, error: "Erro no logout" };
  }
}

export async function authenticateAdminSession(
  userId: string,
  userEmail: string,
  adminPassword: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  sessionToken?: string;
}> {
  try {
    console.log(
      "🔐 [authenticateAdminSession] Iniciando autenticação admin...",
      {
        userId,
        userEmail,
      }
    );

    const validated = AdminAuthSchema.parse({
      userId,
      userEmail,
      adminPassword,
    });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select(
        "admin_secret_hash, admin_secret_salt, role, status, email, full_name"
      )
      .eq("id", validated.userId)
      .eq("email", validated.userEmail)
      .single();

    if (!profile || profile.role !== "admin" || !profile.status) {
      console.log("❌ [authenticateAdminSession] Acesso não autorizado:", {
        hasProfile: !!profile,
        role: profile?.role,
        status: profile?.status,
      });
      return { success: false, error: "Acesso não autorizado" };
    }

    if (!profile.admin_secret_hash || !profile.admin_secret_salt) {
      console.log("❌ [authenticateAdminSession] Senha não configurada");
      return { success: false, error: "Senha não configurada" };
    }

    const hash = crypto
      .createHash("sha256")
      .update(validated.adminPassword + profile.admin_secret_salt)
      .digest("hex");

    const isValid = hash === profile.admin_secret_hash;
    console.log("🔑 [authenticateAdminSession] Senha válida:", isValid);

    if (!isValid) {
      return { success: false, error: "Senha incorreta" };
    }

    // Atualizar último auth
    await supabaseAdmin
      .from("profiles")
      .update({
        admin_last_auth: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.userId);

    // Criar sessão admin com timeout de 2 horas
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    console.log("🔐 [authenticateAdminSession] Criando sessão...", {
      expiresAt: expiresAt.toISOString(),
      sessionToken: sessionToken.substring(0, 10) + "...",
    });

    const cookiesSet = await setAdminCookies(
      validated.userId,
      validated.userEmail,
      sessionToken,
      expiresAt
    );

    if (!cookiesSet) {
      console.log("❌ [authenticateAdminSession] Erro ao criar cookies");
      return { success: false, error: "Erro ao criar sessão" };
    }

    console.log("✅ [authenticateAdminSession] Autenticação bem-sucedida");
    return {
      success: true,
      message: "Autenticação administrativa bem-sucedida",
      sessionToken,
    };
  } catch (error) {
    console.error("❌ [authenticateAdminSession] Erro:", error);
    return { success: false, error: "Erro na autenticação" };
  }
}

export async function verifyAdminSession(): Promise<{
  success: boolean;
  error?: string;
  user?: { id: string; email: string };
  expiresAt?: string;
}> {
  try {
    console.log("🔍 [verifyAdminSession] Verificando sessão admin...");

    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get("admin_session")?.value;

    if (!adminSessionCookie) {
      console.log("❌ [verifyAdminSession] Sessão não encontrada");
      return { success: false, error: "Sessão não encontrada" };
    }

    const sessionData = JSON.parse(adminSessionCookie);

    console.log("📅 [verifyAdminSession] Dados da sessão:", {
      userId: sessionData.userId,
      expiresAt: sessionData.expiresAt,
      now: new Date().toISOString(),
    });

    // Verificar expiração
    if (new Date(sessionData.expiresAt) < new Date()) {
      console.log("❌ [verifyAdminSession] Sessão expirada");
      await clearAdminCookies();
      return { success: false, error: "Sessão expirada" };
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, status")
      .eq("id", sessionData.userId)
      .single();

    if (!profile || profile.role !== "admin" || !profile.status) {
      console.log("❌ [verifyAdminSession] Acesso não autorizado:", {
        hasProfile: !!profile,
        role: profile?.role,
        status: profile?.status,
      });
      await clearAdminCookies();
      return { success: false, error: "Acesso não autorizado" };
    }

    console.log("✅ [verifyAdminSession] Sessão válida");
    return {
      success: true,
      user: {
        id: sessionData.userId,
        email: sessionData.userEmail,
      },
      expiresAt: sessionData.expiresAt,
    };
  } catch (error) {
    console.error("❌ [verifyAdminSession] Erro:", error);
    await clearAdminCookies();
    return { success: false, error: "Sessão inválida" };
  }
}

export async function setupAdminPassword(formData: FormData) {
  try {
    console.log("🔧 [setupAdminPassword] Configurando senha admin...");

    const matricula = formData.get("matricula") as string;
    const adminPassword = formData.get("adminPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!matricula || !adminPassword || !confirmPassword) {
      console.log("❌ [setupAdminPassword] Campos obrigatórios faltando");
      return { success: false, error: "Todos os campos são obrigatórios" };
    }

    if (adminPassword !== confirmPassword) {
      console.log("❌ [setupAdminPassword] Senhas não coincidem");
      return { success: false, error: "As senhas não coincidem" };
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role, email")
      .eq("matricula", matricula)
      .eq("role", "admin")
      .single();

    if (!profile) {
      console.log("❌ [setupAdminPassword] Perfil admin não encontrado");
      return { success: false, error: "Perfil admin não encontrado" };
    }

    console.log("✅ [setupAdminPassword] Perfil encontrado:", profile.id);

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .createHash("sha256")
      .update(adminPassword + salt)
      .digest("hex");

    await supabaseAdmin
      .from("profiles")
      .update({
        admin_secret_hash: hash,
        admin_secret_salt: salt,
        admin_2fa_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    console.log("✅ [setupAdminPassword] Senha configurada com sucesso");
    return { success: true, message: "Senha configurada com sucesso!" };
  } catch (error) {
    console.error("❌ [setupAdminPassword] Erro:", error);
    return { success: false, error: "Erro ao configurar senha" };
  }
}

export async function checkAdminSession() {
  try {
    console.log("🔍 [checkAdminSession] Verificando cookies...");

    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get("admin_session")?.value;
    const isAdminCookie = cookieStore.get("is_admin")?.value === "true";

    console.log("🍪 [checkAdminSession] Cookies encontrados:", {
      hasAdminSession: !!adminSessionCookie,
      hasIsAdminCookie: isAdminCookie,
    });

    return {
      success: isAdminCookie && !!adminSessionCookie,
      isAdmin: isAdminCookie,
      hasSession: !!adminSessionCookie,
    };
  } catch (error) {
    console.error("❌ [checkAdminSession] Erro:", error);
    return { success: false, isAdmin: false, hasSession: false };
  }
}

// FUNÇÃO INTERNA
async function handleSuccessfulLogin(
  session: Session,
  user: User,
  profile: { id: string; email: string; status: boolean; role: string },
  matricula: string,
  supabaseAdmin: ReturnType<typeof createClient<Database>>
): Promise<{
  success: boolean;
  message: string;
  data: { session: Session; user: Profile };
}> {
  try {
    console.log("👤 [handleSuccessfulLogin] Processando login bem-sucedido...");

    const { data: fullProfile, error: fullProfileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", profile.id)
      .single();

    if (fullProfileError) {
      console.log("⚠️ [handleSuccessfulLogin] Criando perfil básico...");
      const basicProfile: Profile = {
        id: profile.id,
        email: profile.email,
        matricula: matricula,
        status: profile.status,
        role: profile.role as "admin" | "agent",
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

      return {
        success: true,
        message: profile.status ? "Login realizado!" : "Login - Agente inativo",
        data: { session, user: basicProfile },
      };
    }

    console.log("📝 [handleSuccessfulLogin] Registrando atividade...");
    await supabaseAdmin.from("system_activities").insert({
      user_id: user.id,
      action_type: "user_login",
      description: `Login por ${fullProfile.full_name || fullProfile.email}`,
      resource_type: "auth",
      resource_id: user.id,
      metadata: { matricula: fullProfile.matricula },
    });

    revalidatePath("/");
    revalidatePath("/perfil");

    console.log("✅ [handleSuccessfulLogin] Login finalizado");
    return {
      success: true,
      message: fullProfile.status
        ? "Login realizado!"
        : "Login - Agente inativo",
      data: { session, user: fullProfile },
    };
  } catch (error) {
    console.error("❌ [handleSuccessfulLogin] Erro:", error);
    return {
      success: false,
      message: "Erro ao processar login",
      data: { session, user: {} as Profile },
    };
  }
}
