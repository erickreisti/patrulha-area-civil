// app/api/auth/profile/route.ts - MANTENHA ESTA
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { SEGURANCA } from "@/lib/security-config";

// Cache em memória para rate limiting
const loginAttempts = new Map<
  string,
  { count: number; lastAttempt: number; blockUntil?: number }
>();

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    // 1. Identificar origem da requisição
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    console.log(`📨 [${requestId}] Nova requisição POST /api/auth/profile`, {
      ip,
      timestamp: new Date().toISOString(),
    });

    // 2. Rate limiting e segurança
    const now = Date.now();
    const ipRecord = loginAttempts.get(ip);

    // Limpar registros antigos (> 15 minutos)
    if (ipRecord && now - ipRecord.lastAttempt > 15 * 60 * 1000) {
      loginAttempts.delete(ip);
    }

    // Verificar se IP está bloqueado
    if (ipRecord?.blockUntil && now < ipRecord.blockUntil) {
      const remainingMinutes = Math.ceil(
        (ipRecord.blockUntil - now) / 1000 / 60
      );

      console.warn(`🚫 [${requestId}] IP bloqueado:`, {
        ip,
        attempts: ipRecord.count,
        remainingMinutes,
      });

      return NextResponse.json(
        {
          success: false,
          error: "IP_BLOCKED",
          message: `Muitas tentativas. Tente novamente em ${remainingMinutes} minuto(s)`,
        },
        { status: 429 }
      );
    }

    // 3. Validar corpo da requisição
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "Requisição inválida",
        },
        { status: 400 }
      );
    }

    const { matricula } = body;

    if (!matricula || typeof matricula !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "MATRICULA_REQUIRED",
          message: "Matrícula é obrigatória",
        },
        { status: 400 }
      );
    }

    // 4. Validar formato da matrícula
    const matriculaLimpa = matricula.replace(/\D/g, "");
    if (matriculaLimpa.length !== 11) {
      // Registrar tentativa inválida
      const newCount = (ipRecord?.count || 0) + 1;
      const blockUntil =
        newCount >= SEGURANCA.TENTATIVAS_MAXIMAS
          ? now + SEGURANCA.BLOQUEIO_MINUTOS * 60 * 1000
          : undefined;

      loginAttempts.set(ip, {
        count: newCount,
        lastAttempt: now,
        blockUntil,
      });

      return NextResponse.json(
        {
          success: false,
          error: "INVALID_MATRICULA_FORMAT",
          message: "Matrícula deve conter exatamente 11 dígitos",
        },
        { status: 400 }
      );
    }

    console.log(
      `🔍 [${requestId}] Buscando perfil para matrícula:`,
      matriculaLimpa
    );

    // 5. Conectar ao banco com admin client
    const supabaseAdmin = createAdminClient();

    // 6. Buscar perfil no banco
    const { data: profile, error: dbError } = await supabaseAdmin
      .from("profiles")
      .select(
        `
        id,
        email,
        matricula,
        full_name,
        status,
        role,
        avatar_url,
        graduacao,
        created_at,
        updated_at
      `
      )
      .eq("matricula", matriculaLimpa)
      .single();

    // 7. Tratar erros da consulta
    if (dbError) {
      console.error(`❌ [${requestId}] Erro no banco:`, dbError);

      // Se não encontrou o perfil
      if (dbError.code === "PGRST116") {
        // Registrar tentativa fracassada
        const newCount = (ipRecord?.count || 0) + 1;
        const blockUntil =
          newCount >= SEGURANCA.TENTATIVAS_MAXIMAS
            ? now + SEGURANCA.BLOQUEIO_MINUTOS * 60 * 1000
            : undefined;

        loginAttempts.set(ip, {
          count: newCount,
          lastAttempt: now,
          blockUntil,
        });

        return NextResponse.json(
          {
            success: false,
            error: "PROFILE_NOT_FOUND",
            message: "Matrícula não encontrada ou agente inativo",
            attempts: newCount,
            maxAttempts: SEGURANCA.TENTATIVAS_MAXIMAS,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_ERROR",
          message: "Erro ao consultar banco de dados",
        },
        { status: 500 }
      );
    }

    // 8. Validar perfil encontrado
    if (!profile.status) {
      console.warn(`⚠️ [${requestId}] Perfil inativo:`, profile.id);

      return NextResponse.json(
        {
          success: false,
          error: "PROFILE_INACTIVE",
          message: "Conta de agente está inativa",
        },
        { status: 403 }
      );
    }

    console.log(`✅ [${requestId}] Perfil encontrado:`, {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      duration: `${Date.now() - startTime}ms`,
    });

    // 9. Registrar atividade (opcional - para auditoria)
    try {
      await supabaseAdmin.from("system_activities").insert({
        user_id: profile.id,
        action_type: "login_profile_search",
        description: `Perfil consultado para login via matrícula ${matriculaLimpa}`,
        resource_type: "auth",
        resource_id: profile.id,
        metadata: {
          requestId,
          ip,
          matricula: matriculaLimpa,
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime,
        },
        created_at: new Date().toISOString(),
      });
    } catch (activityError) {
      console.warn(
        `⚠️ [${requestId}] Não foi possível registrar atividade:`,
        activityError
      );
    }

    // 10. Resetar contador de tentativas para este IP (sucesso)
    loginAttempts.delete(ip);

    // 11. Retornar dados do perfil (apenas informações necessárias)
    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        matricula: profile.matricula,
        avatar_url: profile.avatar_url,
        graduacao: profile.graduacao,
      },
      security: {
        default_password: SEGURANCA.SENHA_PADRAO,
        requires_password_change: false,
      },
      metadata: {
        requestId,
        responseTime: Date.now() - startTime,
      },
    });
  } catch (error: unknown) {
    console.error(`💥 [${requestId}] Erro inesperado:`, error);

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Erro interno do servidor",
        requestId,
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
