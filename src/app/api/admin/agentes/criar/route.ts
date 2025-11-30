// src/app/api/admin/agentes/criar/route.ts - VERSÃO COMPLETA CORRIGIDA
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      matricula,
      email,
      full_name,
      graduacao,
      tipo_sanguineo,
      validade_certificacao,
      role,
      avatar_url,
    } = body;

    console.log("🔄 API: Iniciando criação do agente...", { email, matricula });

    // Validações básicas
    if (!matricula || !email || !full_name) {
      return NextResponse.json(
        { error: "Matrícula, email e nome são obrigatórios" },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(matricula)) {
      return NextResponse.json(
        { error: "Matrícula deve conter exatamente 11 dígitos numéricos" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Usar admin client
    const supabaseAdmin = createAdminClient();

    // Verificar duplicatas na tabela profiles
    const { data: existingProfiles, error: existingError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, matricula")
      .or(`email.eq.${email},matricula.eq.${matricula}`);

    if (existingError) {
      console.error("❌ API: Erro ao verificar duplicatas:", existingError);
      return NextResponse.json(
        { error: "Erro ao verificar dados existentes" },
        { status: 500 }
      );
    }

    // Verificar se encontrou algum perfil duplicado
    if (existingProfiles && existingProfiles.length > 0) {
      const existingEmail = existingProfiles.find(
        (profile) => profile.email === email
      );
      const existingMatricula = existingProfiles.find(
        (profile) => profile.matricula === matricula
      );

      if (existingEmail) {
        return NextResponse.json(
          { error: "Este email já está cadastrado no sistema" },
          { status: 400 }
        );
      }
      if (existingMatricula) {
        return NextResponse.json(
          { error: "Esta matrícula já está cadastrada no sistema" },
          { status: 400 }
        );
      }
    }

    // Tentar verificar se o email já existe na auth usando listUsers
    try {
      const { data: usersList, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        console.log(
          "ℹ️ Não foi possível verificar usuários auth, continuando..."
        );
      } else if (usersList && usersList.users) {
        const existingAuthUser = usersList.users.find(
          (user) => user.email === email
        );
        if (existingAuthUser) {
          return NextResponse.json(
            {
              error: "Este email já está cadastrado no sistema de autenticação",
            },
            { status: 400 }
          );
        }
      }
    } catch {
      // Se der erro, continuamos silenciosamente
      console.log("ℹ️ Verificação de auth users falhou, continuando...");
    }

    // Criar usuário de autenticação
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: "pac12345",
        email_confirm: true,
        user_metadata: {
          full_name: full_name,
          role: role,
        },
      });

    if (authError) {
      console.error(
        "❌ API: Erro ao criar usuário de autenticação:",
        authError
      );

      // Mensagens de erro mais específicas
      if (
        authError.message.includes("already registered") ||
        authError.message.includes("already exists")
      ) {
        return NextResponse.json(
          { error: "Este email já está cadastrado no sistema" },
          { status: 400 }
        );
      }

      if (authError.message.includes("password")) {
        return NextResponse.json(
          { error: "Erro na configuração da senha" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Erro de autenticação: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Não foi possível criar o usuário de autenticação" },
        { status: 500 }
      );
    }

    console.log("✅ API: Usuário de autenticação criado:", authData.user.id);

    // Criar perfil do agente
    const profileData = {
      id: authData.user.id,
      matricula: matricula,
      email: email,
      full_name: full_name,
      graduacao: graduacao || null,
      tipo_sanguineo: tipo_sanguineo || null,
      validade_certificacao: validade_certificacao || null,
      role: role || "agent",
      status: true,
      avatar_url: avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error("❌ API: Erro ao criar perfil:", profileError);

      // Rollback: deletar usuário de autenticação
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log("✅ Rollback: Usuário de auth deletado com sucesso");
      } catch (deleteError: unknown) {
        const deleteErrorMessage =
          deleteError instanceof Error
            ? deleteError.message
            : "Erro desconhecido";
        console.error(
          "❌ Erro no rollback (deletar usuário auth):",
          deleteErrorMessage
        );
      }

      // Mensagens de erro específicas para perfil
      if (profileError.code === "23505") {
        // Violação de unique constraint
        if (profileError.message.includes("matricula")) {
          return NextResponse.json(
            { error: "Esta matrícula já está cadastrada no sistema" },
            { status: 400 }
          );
        }
        if (profileError.message.includes("email")) {
          return NextResponse.json(
            { error: "Este email já está cadastrado no sistema" },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: `Erro ao criar perfil: ${profileError.message}` },
        { status: 400 }
      );
    }

    console.log("✅ API: Agente criado com sucesso:", profile.id);

    return NextResponse.json({
      success: true,
      message: "Agente criado com sucesso",
      data: profile,
      senha_inicial: "pac12345",
    });
  } catch (error: unknown) {
    console.error("💥 API: Erro completo:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Adicionar método OPTIONS para CORS (se necessário)
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
