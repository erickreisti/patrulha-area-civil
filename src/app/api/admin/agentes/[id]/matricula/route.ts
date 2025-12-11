import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verificar autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const supabaseAdmin = createAdminClient();

    // 2. Verificar se o usuário atual é admin
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ Erro ao verificar token:", authError);
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: currentUserProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem alterar matrículas" },
        { status: 403 }
      );
    }

    // 3. Obter dados da requisição
    const { id } = await params;
    const body = await request.json();
    const { matricula } = body;

    if (!matricula || typeof matricula !== "string") {
      return NextResponse.json(
        { error: "Matrícula é obrigatória e deve ser uma string" },
        { status: 400 }
      );
    }

    const matriculaTrimmed = matricula.trim();

    if (matriculaTrimmed.length < 2) {
      return NextResponse.json(
        { error: "Matrícula deve ter pelo menos 2 caracteres" },
        { status: 400 }
      );
    }

    console.log("🔄 [UPDATE MATRÍCULA API] Iniciando atualização:", {
      agentId: id,
      novaMatricula: matriculaTrimmed,
      adminId: user.id,
    });

    // 4. Verificar se o agente existe
    const { data: agent, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, matricula, email, full_name")
      .eq("id", id)
      .single();

    if (fetchError || !agent) {
      console.error("❌ Agente não encontrado:", fetchError);
      return NextResponse.json(
        { error: "Agente não encontrado" },
        { status: 404 }
      );
    }

    // 5. Verificar se a nova matrícula já existe em outro perfil
    if (matriculaTrimmed !== agent.matricula) {
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .eq("matricula", matriculaTrimmed)
        .neq("id", id)
        .single();

      if (existingProfile) {
        return NextResponse.json(
          {
            error: "Matrícula já está em uso",
            details: `A matrícula ${matriculaTrimmed} pertence a ${
              existingProfile.full_name || existingProfile.email
            }`,
          },
          { status: 409 }
        );
      }
    }

    // 6. Atualizar matrícula no banco de dados
    console.log("💾 Atualizando matrícula no perfil...");
    const { data, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        matricula: matriculaTrimmed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Erro ao atualizar matrícula:", updateError);
      return NextResponse.json(
        {
          error: "Falha ao atualizar matrícula",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Matrícula atualizada com sucesso");

    // 7. Registrar atividade no sistema
    try {
      await supabaseAdmin.from("system_activities").insert({
        user_id: user.id,
        action_type: "matricula_update",
        description: `Matrícula do agente ${
          agent.full_name || agent.email
        } alterada de ${agent.matricula} para ${matriculaTrimmed}`,
        resource_type: "profile",
        resource_id: id,
        metadata: {
          updated_by: user.id,
          updated_by_email: user.email,
          target_user_id: id,
          old_matricula: agent.matricula,
          new_matricula: matriculaTrimmed,
          timestamp: new Date().toISOString(),
        },
      });

      console.log("📝 Atividade registrada no sistema");
    } catch (activityError) {
      console.warn("⚠️ Não foi possível registrar atividade:", activityError);
    }

    // 8. Retornar sucesso
    return NextResponse.json({
      success: true,
      message: "Matrícula atualizada com sucesso",
      data: {
        id: data.id,
        old_matricula: agent.matricula,
        new_matricula: data.matricula,
        updated_at: data.updated_at,
        updated_by: user.id,
      },
    });
  } catch (error: unknown) {
    console.error("💥 ERRO na API de atualização de matrícula:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json(
      {
        error: "Falha na atualização de matrícula",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
