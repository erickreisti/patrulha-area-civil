// app/actions/auth/auth.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile, Database } from "@/lib/supabase/types";

// ================ ZOD SCHEMAS ================
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

// ================ TYPES ================
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

type LogoutResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

type AdminAuthResponse = {
  success: boolean;
  message?: string;
  error?: string;
  sessionToken?: string;
};

// ================ FUNÇÕES PÚBLICAS ================

/**
 * 🔐 LOGIN - Para agentes e administradores
 */
export async function login(formData: FormData): Promise<LoginResponse> {
  try {
    const matricula = formData.get("matricula") as string;
    const validated = LoginSchema.parse({ matricula });

    // Buscar email usando Service Role (evita RLS)
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, status, role")
      .eq("matricula", validated.matricula)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Matrícula não encontrada" };
    }

    // Login com email do agente
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const defaultPassword =
      process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure";

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: profile.email,
        password: defaultPassword,
      });

    if (authError) {
      // Criar usuário se não existir
      if (authError.message.includes("Invalid login credentials")) {
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
          return { success: false, error: "Erro na autenticação" };
        }

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
      return { success: false, error: "Sessão não criada" };
    }

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

/**
 * 🚪 LOGOUT - Para todos os usuários
 */
export async function logout(): Promise<LogoutResponse> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Limpar sessão admin primeiro
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    cookieStore.delete("is_admin");

    // Sign out do Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true, message: "Logout realizado" };
  } catch (error) {
    console.error("❌ [logout] Erro:", error);
    return { success: false, error: "Erro no logout" };
  }
}

/**
 * 👑 AUTENTICAÇÃO ADMINISTRATIVA
 */
export async function authenticateAdminSession(
  userId: string,
  userEmail: string,
  adminPassword: string
): Promise<AdminAuthResponse> {
  try {
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

    // Buscar perfil admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("admin_secret_hash, admin_secret_salt, role, status, email")
      .eq("id", validated.userId)
      .eq("email", validated.userEmail)
      .single();

    if (!profile || profile.role !== "admin" || !profile.status) {
      return { success: false, error: "Acesso não autorizado" };
    }

    if (!profile.admin_secret_hash || !profile.admin_secret_salt) {
      return { success: false, error: "Senha não configurada" };
    }

    // Verificar senha
    const hash = crypto
      .createHash("sha256")
      .update(validated.adminPassword + profile.admin_secret_salt)
      .digest("hex");

    if (hash !== profile.admin_secret_hash) {
      return { success: false, error: "Senha incorreta" };
    }

    // Atualizar último acesso
    await supabaseAdmin
      .from("profiles")
      .update({
        admin_last_auth: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.userId);

    // Criar sessão admin
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

    const cookieStore = await cookies();

    cookieStore.set({
      name: "admin_session",
      value: JSON.stringify({
        userId: validated.userId,
        userEmail: validated.userEmail,
        sessionToken,
        expiresAt: expiresAt.toISOString(),
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    cookieStore.set({
      name: "is_admin",
      value: "true",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return {
      success: true,
      message: "Autenticação bem-sucedida",
      sessionToken,
    };
  } catch (error) {
    console.error("❌ [authenticateAdminSession] Erro:", error);
    return { success: false, error: "Erro na autenticação" };
  }
}

/**
 * 🔍 VERIFICAR SESSÃO ADMIN
 */
export async function verifyAdminSession() {
  try {
    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get("admin_session")?.value;

    if (!adminSessionCookie) {
      return { success: false, error: "Sessão não encontrada" };
    }

    const sessionData = JSON.parse(adminSessionCookie);

    if (new Date(sessionData.expiresAt) < new Date()) {
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
      return { success: false, error: "Acesso não autorizado" };
    }

    return {
      success: true,
      user: {
        id: sessionData.userId,
        email: sessionData.userEmail,
      },
    };
  } catch {
    return { success: false, error: "Sessão inválida" };
  }
}

/**
 * ⚙️ CONFIGURAR SENHA ADMIN
 */
export async function setupAdminPassword(formData: FormData) {
  try {
    const matricula = formData.get("matricula") as string;
    const adminPassword = formData.get("adminPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!matricula || !adminPassword || !confirmPassword) {
      return { success: false, error: "Todos os campos são obrigatórios" };
    }

    if (adminPassword !== confirmPassword) {
      return { success: false, error: "As senhas não coincidem" };
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("matricula", matricula)
      .eq("role", "admin")
      .single();

    if (!profile) {
      return { success: false, error: "Perfil admin não encontrado" };
    }

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

    return { success: true, message: "Senha configurada com sucesso!" };
  } catch (error) {
    console.error("❌ [setupAdminPassword] Erro:", error);
    return { success: false, error: "Erro ao configurar senha" };
  }
}

// ================ FUNÇÕES INTERNAS ================

/**
 * 🛠️ HANDLE SUCCESSFUL LOGIN (interna)
 */
async function handleSuccessfulLogin(
  session: Session,
  user: User,
  profile: { id: string; email: string; status: boolean; role: string },
  matricula: string,
  supabaseAdmin: ReturnType<typeof createClient<Database>>
): Promise<LoginResponse> {
  try {
    const { data: fullProfile, error: fullProfileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", profile.id)
      .single();

    if (fullProfileError) {
      // Perfil básico se não encontrar
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

    // Log de atividade
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

    return {
      success: true,
      message: fullProfile.status
        ? "Login realizado!"
        : "Login - Agente inativo",
      data: { session, user: fullProfile },
    };
  } catch (error) {
    console.error("❌ [handleSuccessfulLogin] Erro:", error);
    return { success: false, error: "Erro ao processar login" };
  }
}
