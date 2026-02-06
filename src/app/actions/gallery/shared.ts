"use server";

import { cookies } from "next/headers";
import { type SupabaseClient } from "@supabase/supabase-js";
// Ajuste o import abaixo conforme o local real do seu arquivo de tipos do banco
// Geralmente é @/lib/supabase/types ou similar
import { type Database } from "@/lib/supabase/types";

// ============================================
// FUNÇÕES COMPARTILHADAS
// ============================================

/**
 * Verificar sessão admin (Verificação simples de cookie)
 */
export async function verifyAdminSession(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get("admin_session");
    const isAdminCookie = cookieStore.get("is_admin");

    if (
      !adminSessionCookie ||
      !isAdminCookie ||
      isAdminCookie.value !== "true"
    ) {
      return {
        success: false,
        error: "Sessão admin não encontrada. Faça login novamente.",
      };
    }

    try {
      const sessionData = JSON.parse(adminSessionCookie.value);

      if (sessionData.expiresAt) {
        const expiresAt = new Date(sessionData.expiresAt);
        const now = new Date();

        if (expiresAt < now) {
          return {
            success: false,
            error: "Sessão admin expirada. Faça login novamente.",
          };
        }
      }

      return {
        success: true,
        userId: sessionData.userId,
      };
    } catch {
      return {
        success: false,
        error: "Sessão admin inválida.",
      };
    }
  } catch (error) {
    console.error("❌ Erro ao verificar sessão admin:", error);
    return {
      success: false,
      error: "Erro ao verificar autenticação.",
    };
  }
}

/**
 * Registrar atividade no sistema
 * OBS: Requer o cliente Supabase (Admin ou Auth) passado como argumento
 */
export async function logActivity(
  adminClient: SupabaseClient<Database>, // Cliente injetado
  userId: string,
  actionType: string,
  description: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await adminClient.from("system_activities").insert({
      user_id: userId,
      action_type: actionType,
      description: description,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: metadata ? JSON.stringify(metadata) : null,
      // created_at é automático no banco, mas pode forçar se quiser
    });
  } catch (error) {
    // Não paramos o fluxo se o log falhar, apenas avisamos no console
    console.error("❌ Erro ao registrar atividade:", error);
  }
}

/**
 * Gerar slug a partir de uma string
 * Marcada como ASYNC para consistência e evitar problemas de Promise no caller
 */
export async function generateSlug(text: string): Promise<string> {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Espaços viram hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .trim();
}

/**
 * Validar slug
 */
export async function validateSlug(
  slug: string,
): Promise<{ valid: boolean; error?: string }> {
  if (!slug) return { valid: false, error: "Slug é obrigatório" };
  if (slug.length < 3)
    return { valid: false, error: "Slug deve ter pelo menos 3 caracteres" };

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      valid: false,
      error: "Slug deve conter apenas letras minúsculas, números e hífens",
    };
  }

  if (slug.startsWith("-") || slug.endsWith("-")) {
    return {
      valid: false,
      error: "Slug não pode começar ou terminar com hífen",
    };
  }

  if (slug.includes("--")) {
    return { valid: false, error: "Slug não pode ter hífens consecutivos" };
  }

  return { valid: true };
}

/**
 * Converter objeto para JSON (Helper simples)
 */
export async function toJson(
  data?: Record<string, unknown>,
): Promise<string | null> {
  if (!data) return null;
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
}
