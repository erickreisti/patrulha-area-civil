// src/app/actions/gallery/shared.ts
"use server";

import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";

// ============================================
// FUNÇÕES COMPARTILHADAS
// ============================================

/**
 * Verificar sessão admin (2ª camada)
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

    // Verificar se a sessão expirou
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
 */
export async function logActivity(
  adminClient: SupabaseClient<Database>,
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
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao registrar atividade:", error);
  }
}

/**
 * Gerar slug a partir de uma string
 */
export async function generateSlug(text: string): Promise<string> {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .trim();
}

/**
 * Validar slug
 */
export async function validateSlug(
  slug: string,
): Promise<{ valid: boolean; error?: string }> {
  if (!slug) {
    return { valid: false, error: "Slug é obrigatório" };
  }

  if (slug.length < 3) {
    return { valid: false, error: "Slug deve ter pelo menos 3 caracteres" };
  }

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
 * Converter objeto para JSON
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
