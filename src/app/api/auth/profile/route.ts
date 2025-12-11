import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  handleApiError,
  createSuccessResponse,
  createValidationError,
} from "@/lib/utils/error-handler";

// Cache para rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  try {
    // Rate limiting simples
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    if (now - attempts.lastAttempt < 60000 && attempts.count >= 5) {
      // 5 tentativas por minuto
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 1 minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { matricula } = body;

    if (!matricula || typeof matricula !== "string") {
      return createValidationError("Matrícula é obrigatória");
    }

    const matriculaLimpa = matricula.replace(/\D/g, "");

    if (matriculaLimpa.length !== 11) {
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: now });
      return createValidationError("Matrícula deve conter 11 dígitos");
    }

    const supabaseAdmin = createAdminClient();

    // Buscar perfil pela matrícula
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, email, full_name, role, status, avatar_url, graduacao, matricula"
      )
      .eq("matricula", matriculaLimpa)
      .single();

    if (profileError || !profile) {
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: now });
      return NextResponse.json(
        { error: "Matrícula não encontrada" },
        { status: 404 }
      );
    }

    // Verificar status
    if (!profile.status) {
      return NextResponse.json(
        { error: "Conta inativa. Entre em contato com o administrador." },
        { status: 403 }
      );
    }

    // Resetar contador de tentativas
    loginAttempts.delete(ip);

    return createSuccessResponse({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      status: profile.status,
      matricula: profile.matricula,
      avatar_url: profile.avatar_url,
      graduacao: profile.graduacao,
      security: {
        default_password: process.env.DEFAULT_PASSWORD || "PAC@2025!Secure",
        requires_password_change: false,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
