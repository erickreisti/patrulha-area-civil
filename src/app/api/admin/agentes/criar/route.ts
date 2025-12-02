import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { SEGURANCA } from "@/lib/security-config";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Obter dados do corpo
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

    // 2. Validações básicas
    if (!matricula || !email || !full_name) {
      return NextResponse.json(
        { error: "Matrícula, email e nome são obrigatórios" },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(matricula)) {
      return NextResponse.json(
        { error: "Matrícula deve conter exatamente 11 dígitos" },
        { status: 400 }
      );
    }

    // 3. Verificar se matrícula já existe
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

    // 4. Verificar se email já existe
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

    // 5. CRIAR USUÁRIO NO SUPABASE AUTH - CORRIGIDO METADADOS
    const { data: authUser, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password: SEGURANCA.SENHA_PADRAO,
        email_confirm: true,
        user_metadata: {
          full_name: full_name.trim(),
          matricula: matricula.trim(),
          role: role,
          graduacao: graduacao?.trim() || "",
          tipo_sanguineo: tipo_sanguineo?.trim() || "",
          avatar_url: avatar_url?.trim() || "",
          email_verified: true, // IMPORTANTE: manter este campo
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

    // 6. CRIAR PERFIL NA TABELA PROFILES
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

    // 7. REGISTRAR ATIVIDADE NO LOG (OPCIONAL MAS RECOMENDADO)
    try {
      await supabaseAdmin.from("system_activities").insert({
        user_id: authUser.user.id, // Ou o ID do admin que está criando
        action_type: "user_created",
        description: `Novo agente criado: ${full_name} (${matricula})`,
        resource_type: "profile",
        resource_id: authUser.user.id,
        metadata: {
          created_by: "admin", // Você pode passar o ID do admin logado
          role: role,
          email: email,
        },
      });
    } catch (logError) {
      console.warn("⚠️ Não foi possível registrar atividade:", logError);
      // Não falha a criação por causa do log
    }

    console.log("✅ Perfil criado com sucesso!");

    // 8. Retornar sucesso
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
