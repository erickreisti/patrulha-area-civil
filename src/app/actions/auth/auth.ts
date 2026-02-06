"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as crypto from "crypto";
import { z } from "zod";
// Removidos tipos não usados Session, User, Profile
import type { Database, AdminSessionData } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================
// VALIDAÇÃO DE DADOS (ZOD)
// ============================================

const LoginSchema = z.object({
  matricula: z.string().transform((val) => val.replace(/\D/g, "").trim()),
});

// Agora este schema será usado na função authenticateAdminSession
const AdminAuthSchema = z.object({
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  adminPassword: z.string(),
});

// ============================================
// GERENCIAMENTO DE COOKIES
// ============================================

async function setAdminCookies(
  sessionData: AdminSessionData,
): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const expiresAt = new Date(sessionData.expiresAt);

    // 1. Sessão REAL (Dados Sensíveis) -> HttpOnly: TRUE
    cookieStore.set({
      name: "admin_session",
      value: JSON.stringify(sessionData),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    // 2. Flag de Admin (Sinalizador) -> HttpOnly: FALSE
    cookieStore.set({
      name: "is_admin",
      value: "true",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return true;
  } catch (error) {
    console.error("❌ Erro ao definir cookies:", error); // Usando 'error'
    return false;
  }
}

async function clearAdminCookies(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    cookieStore.delete("is_admin");
    return true;
  } catch {
    // catch sem variável pois não precisamos logar erro ao limpar
    return false;
  }
}

// ============================================
// SERVER ACTIONS
// ============================================

// --- 1. Login Inicial (Camada 1) ---
export async function login(formData: FormData) {
  try {
    const matricula = formData.get("matricula") as string;
    const validated = LoginSchema.parse({ matricula });

    // Admin Client para ignorar RLS e buscar perfil por matrícula
    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("matricula", validated.matricula)
      .single();

    if (!profile) return { success: false, error: "Matrícula não encontrada" };

    // Login Auth Supabase
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "PAC@2025!Secure",
    });

    if (error || !authData.session)
      return { success: false, error: "Erro na autenticação" };

    revalidatePath("/");
    // Usando 'any' aqui apenas no retorno para simplificar compatibilidade com o store,
    // mas os dados internos estão tipados
    return {
      success: true,
      data: { session: authData.session, user: profile },
    };
  } catch (error) {
    console.error("Erro no login:", error); // Usando a variável
    return { success: false, error: "Erro interno no login" };
  }
}

// --- 2. Logout ---
export async function logout() {
  await clearAdminCookies(); // Limpa camada 2
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  await supabase.auth.signOut(); // Limpa camada 1
  revalidatePath("/");
  return { success: true };
}

// --- 3. Autenticação Admin (Camada 2) ---
export async function authenticateAdminSession(
  userId: string,
  userEmail: string,
  adminPassword: string,
) {
  try {
    // Validação com Zod para limpar o erro de "unused variable"
    AdminAuthSchema.parse({ userId, userEmail, adminPassword });

    const supabaseAdmin = createAdminClient();

    // Busca hash da senha admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("admin_secret_hash, admin_secret_salt, role")
      .eq("id", userId)
      .single();

    if (!profile || profile.role !== "admin" || !profile.admin_secret_hash) {
      return { success: false, error: "Não autorizado" };
    }

    // Verifica Hash
    const hash = crypto
      .createHash("sha256")
      .update(adminPassword + profile.admin_secret_salt)
      .digest("hex");

    if (hash !== profile.admin_secret_hash) {
      return { success: false, error: "Senha incorreta" };
    }

    // Cria token de sessão
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

    const sessionData: AdminSessionData = {
      userId,
      userEmail,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    await setAdminCookies(sessionData); // Grava cookies
    return { success: true };
  } catch (error) {
    console.error("Erro auth admin:", error); // Usando variável error
    return { success: false, error: "Erro na validação" };
  }
}

// --- 4. Verificação de Sessão (Usado pelo Store) ---
export async function checkAdminSession() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const isAdmin = cookieStore.get("is_admin");

    const hasSession = !!adminSession && !!isAdmin;

    return {
      success: hasSession,
      isAdmin: hasSession,
      hasSession: hasSession,
    };
  } catch {
    // catch sem variável
    return { success: false, isAdmin: false, hasSession: false };
  }
}

// --- 5. Setup de Senha ---
export async function setupAdminPassword(formData: FormData) {
  const matricula = formData.get("matricula") as string;
  const password = formData.get("adminPassword") as string;

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("matricula", matricula)
    .single();

  if (!profile) return { success: false, error: "Perfil não achado" };

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");

  await supabaseAdmin
    .from("profiles")
    .update({
      admin_secret_hash: hash,
      admin_secret_salt: salt,
      admin_2fa_enabled: true,
    })
    .eq("id", profile.id);

  return { success: true };
}
