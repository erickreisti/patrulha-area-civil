import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SEGURANCA } from "@/utils/security-config";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Verificar autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Verificar se o usuário atual é admin
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

    const { data: currentUserProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem criar agentes" },
        { status: 403 }
      );
    }

    // 2. Obter dados do corpo
    const body = await request.json();
    const {
      matricula,
      email,
      full_name,
      graduacao = "",
      tipo_sanguineo = "",
      validade_certificacao = "",
      role = "agent",
      avatar_url = "",
    } = body;

    // 3. Validações básicas
    if (!matricula || !email || !full_name) {
      return NextResponse.json(
        { error: "Matrícula, email e nome são obrigatórios" },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(matricula.replace(/\D/g, ""))) {
      return NextResponse.json(
        { error: "Matrícula deve conter exatamente 11 dígitos" },
        { status: 400 }
      );
    }

    // 4. Verificar se matrícula já existe
    const { data: existingMatricula } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("matricula", matricula.trim())
      .single();

    if (existingMatricula) {
      return NextResponse.json(
        { error: "Matrícula já cadastrada no sistema" },
        { status: 409 }
      );
    }

    // 5. Verificar se email já existe
    const { data: existingEmail } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email.trim())
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email já cadastrado no sistema" },
        { status: 409 }
      );
    }

    console.log("🔐 Criando usuário no Auth...", { email, matricula });

    // 6. CRIAR USUÁRIO NO SUPABASE AUTH COM SENHA PADRÃO
    const { data: authUser, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password: SEGURANCA.SENHA_PADRAO, // ← SENHA PADRÃO
        email_confirm: true,
        user_metadata: {
          full_name: full_name.trim(),
          matricula: matricula.trim(),
          role: role,
          graduacao: graduacao?.trim() || "",
          tipo_sanguineo: tipo_sanguineo?.trim() || "",
          avatar_url: avatar_url?.trim() || "",
          email_verified: true,
        },
      });

    if (createAuthError) {
      console.error("❌ Erro ao criar usuário no Auth:", createAuthError);
      return NextResponse.json(
        {
          error: "Erro ao criar conta do agente",
          details: createAuthError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Usuário criado no Auth:", authUser.user.id);

    // 7. CRIAR PERFIL NA TABELA PROFILES
    const { error: createProfileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        matricula: matricula.trim(),
        email: email.trim(),
        full_name: full_name.trim(),
        graduacao: graduacao?.trim() || "",
        tipo_sanguineo: tipo_sanguineo?.trim() || "",
        validade_certificacao: validade_certificacao || null,
        role: role,
        avatar_url: avatar_url?.trim() || "",
        status: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (createProfileError) {
      console.error("❌ Erro ao criar perfil:", createProfileError);

      // Reverter: deletar usuário do Auth
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      } catch (deleteError) {
        console.error("❌ Não foi possível reverter:", deleteError);
      }

      return NextResponse.json(
        {
          error: "Erro ao criar perfil do agente",
          details: createProfileError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Perfil criado com sucesso!");

    // 8. Registrar atividade no sistema
    try {
      await supabaseAdmin.from("system_activities").insert({
        user_id: user.id,
        action_type: "agent_created",
        description: `Novo agente criado: ${full_name} (${matricula})`,
        resource_type: "profile",
        resource_id: authUser.user.id,
        metadata: {
          created_by: user.id,
          created_by_email: user.email,
          agent_email: email,
          agent_matricula: matricula,
          agent_role: role,
          used_default_password: true,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (logError) {
      console.warn("⚠️ Não foi possível registrar atividade:", logError);
    }

    // 9. Retornar sucesso
    return NextResponse.json({
      success: true,
      message: "Agente criado com sucesso",
      data: {
        id: authUser.user.id,
        email: email,
        full_name: full_name,
        matricula: matricula,
        role: role,
        graduacao: graduacao,
        avatar_url: avatar_url,
      },
      security: {
        default_password_used: true,
        password: SEGURANCA.SENHA_PADRAO,
        message: "Senha padrão configurada: PAC@2025!Secure",
      },
    });
  } catch (error: unknown) {
    console.error("💥 Erro inesperado:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
