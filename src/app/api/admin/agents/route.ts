import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Cliente administrativo com Service Role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    console.log("🔍 INICIANDO CRIAÇÃO DE AGENTE");
    console.log("📝 Dados recebidos:", formData);

    // ========== VALIDAÇÃO DE DADOS ==========
    if (!formData.matricula || !formData.email || !formData.full_name) {
      return NextResponse.json(
        { error: "Matrícula, email e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar formato da matrícula (11 dígitos)
    if (!/^\d{11}$/.test(formData.matricula)) {
      return NextResponse.json(
        { error: "Matrícula deve conter exatamente 11 dígitos numéricos" },
        { status: 400 }
      );
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // ========== VERIFICAÇÕES DE EXISTÊNCIA ==========
    console.log("🔎 Verificando se email existe no Auth...");

    // Verificar no Auth
    const { data: authUsers, error: authListError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (authListError) {
      console.error("❌ Erro ao listar usuários do Auth:", authListError);
    } else {
      const existingAuthUser = authUsers.users.find(
        (user) => user.email?.toLowerCase() === formData.email.toLowerCase()
      );
      if (existingAuthUser) {
        return NextResponse.json(
          { error: "Email já está cadastrado no sistema de autenticação" },
          { status: 400 }
        );
      }
    }

    // Verificar matrícula na tabela profiles
    console.log("🔎 Verificando se matrícula existe...");
    const { data: existingMatricula } = await supabaseAdmin
      .from("profiles")
      .select("id, matricula, email")
      .eq("matricula", formData.matricula);

    console.log("📋 Resultado verificação matrícula:", existingMatricula);

    if (existingMatricula && existingMatricula.length > 0) {
      return NextResponse.json(
        { error: "Matrícula já está em uso" },
        { status: 400 }
      );
    }

    // Verificar email na tabela profiles
    console.log("🔎 Verificando se email existe na tabela profiles...");
    const { data: existingEmail } = await supabaseAdmin
      .from("profiles")
      .select("id, matricula, email")
      .eq("email", formData.email);

    console.log("📋 Resultado verificação email:", existingEmail);

    if (existingEmail && existingEmail.length > 0) {
      return NextResponse.json(
        { error: "Email já está em uso na tabela de perfis" },
        { status: 400 }
      );
    }

    // ========== CRIAÇÃO DO USUÁRIO NO AUTH ==========
    console.log("🔄 Criando usuário no Auth...", formData.email);

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: "pac12345", // Senha padrão
        email_confirm: true,
        user_metadata: {
          matricula: formData.matricula,
          full_name: formData.full_name,
        },
      });

    if (authError) {
      console.error("❌ Erro ao criar usuário no Auth:", authError);

      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Email já está cadastrado no sistema" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Erro ao criar usuário: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Nenhum usuário retornado do Auth" },
        { status: 500 }
      );
    }

    console.log("✅ Usuário criado no Auth:");
    console.log("🆔 ID:", authData.user.id);
    console.log("📧 Email:", authData.user.email);
    console.log("📅 Criado em:", authData.user.created_at);

    // ========== CRIAÇÃO DO PERFIL NA TABELA PROFILES ==========
    const profileData = {
      id: authData.user.id,
      matricula: formData.matricula,
      email: formData.email,
      full_name: formData.full_name,
      avatar_url: formData.avatar_url || null,
      graduacao: formData.graduacao || null,
      tipo_sanguineo: formData.tipo_sanguineo || null,
      validade_certificacao: formData.validade_certificacao || null,
      role: formData.role || "agent",
      status: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("📝 Inserindo perfil na tabela profiles:");
    console.log("📊 Dados do perfil:", profileData);

    const { data: insertedProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert(profileData)
      .select();

    if (profileError) {
      console.error("❌ Erro ao criar perfil:", profileError);
      console.error("🔧 Detalhes do erro:", {
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
        message: profileError.message,
      });

      // Rollback: deletar usuário do Auth se o perfil falhou
      console.log("🔄 Fazendo rollback - deletando usuário do Auth...");
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      if (profileError.code === "23505") {
        return NextResponse.json(
          { error: `Erro de chave duplicada: ${profileError.details}` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Erro ao criar perfil: ${profileError.message}` },
        { status: 400 }
      );
    }

    console.log("✅ Perfil criado com sucesso:", insertedProfile);

    // ========== SUCESSO ==========
    return NextResponse.json({
      success: true,
      message: "Agente criado com sucesso!",
      userId: authData.user.id,
      userEmail: authData.user.email,
      data: insertedProfile,
    });
  } catch (error) {
    console.error("💥 Erro não tratado no servidor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
