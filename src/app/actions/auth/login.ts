"use server";

import { authenticateAdminSession } from "@/app/actions/auth/auth"; // Reutiliza a lógica central
import { createAdminClient } from "@/lib/supabase/admin";

interface AdminLoginInput {
  email: string;
  password?: string;
  adminPassword?: string; // O modal pode enviar como password ou adminPassword
}

export async function loginAdmin(data: AdminLoginInput) {
  try {
    const email = data.email;
    const password = data.adminPassword || data.password;

    if (!email || !password) {
      return { success: false, error: "Dados incompletos" };
    }

    // 1. Buscar ID do usuário pelo email (precisamos do ID para a autenticação admin)
    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .single();

    if (!profile) {
      return { success: false, error: "Usuário não encontrado" };
    }

    if (profile.role !== "admin") {
      return { success: false, error: "Acesso não autorizado" };
    }

    // 2. Autenticar Sessão Admin (Camada 2)
    const result = await authenticateAdminSession(profile.id, email, password);

    return result;
  } catch (error) {
    console.error("Erro loginAdmin:", error);
    return { success: false, error: "Erro interno no servidor" };
  }
}
