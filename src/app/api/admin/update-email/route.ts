import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Obter dados da requisição
    const body = await request.json();
    const { userId, newEmail, oldEmail } = body;

    if (!userId || !newEmail) {
      return NextResponse.json(
        { error: "ID do usuário e novo email são obrigatórios" },
        { status: 400 }
      );
    }

    console.log("🔄 [UPDATE EMAIL API] Iniciando atualização de email:", {
      userId,
      oldEmail,
      newEmail,
    });

    // 2. Verificar se o usuário atual é admin
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autorização não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Verificar o token e obter o usuário
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
        { error: "Apenas administradores podem alterar emails" },
        { status: 403 }
      );
    }

    console.log("✅ Usuário autorizado (admin):", user.email);

    // 3. Verificar se o novo email já existe em outro perfil
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", newEmail)
      .neq("id", userId)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "Este email já está em uso por outro usuário" },
        { status: 409 }
      );
    }

    // 4. Atualizar email no sistema de autenticação (Auth)
    console.log("🔐 Atualizando email no Auth...");
    const { error: authUpdateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: newEmail,
      });

    if (authUpdateError) {
      console.error("❌ Erro ao atualizar email no Auth:", authUpdateError);
      return NextResponse.json(
        {
          error: "Falha ao atualizar email no sistema de autenticação",
          details: authUpdateError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Email atualizado no Auth");

    // 5. Atualizar email no perfil (banco de dados)
    console.log("💾 Atualizando email no perfil...");
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        email: newEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileUpdateError) {
      console.error("❌ Erro ao atualizar perfil:", profileUpdateError);

      // Tentar reverter a mudança no Auth em caso de erro
      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          email: oldEmail,
        });
      } catch (revertError) {
        console.error(
          "❌ Não foi possível reverter mudança no Auth:",
          revertError
        );
      }

      return NextResponse.json(
        {
          error: "Falha ao atualizar perfil",
          details: profileUpdateError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Email atualizado no perfil");

    // 6. Registrar atividade no sistema
    try {
      await supabaseAdmin.from("system_activities").insert({
        user_id: user.id,
        action_type: "email_update",
        description: `Email do usuário ${userId} alterado de ${oldEmail} para ${newEmail}`,
        resource_type: "profile",
        resource_id: userId,
        metadata: {
          updated_by: user.id,
          updated_by_email: user.email,
          target_user_id: userId,
          old_email: oldEmail,
          new_email: newEmail,
          timestamp: new Date().toISOString(),
        },
      });

      console.log("📝 Atividade registrada no sistema");
    } catch (activityError) {
      console.warn("⚠️ Não foi possível registrar atividade:", activityError);
    }

    // 7. Retornar sucesso
    console.log("🎉 Atualização de email concluída com sucesso!");

    return NextResponse.json({
      success: true,
      message: "Email atualizado com sucesso em todos os sistemas",
      data: {
        userId,
        oldEmail,
        newEmail,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id,
      },
    });
  } catch (error: unknown) {
    console.error("💥 ERRO na API de atualização de email:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json(
      {
        error: "Falha na atualização de email",
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
