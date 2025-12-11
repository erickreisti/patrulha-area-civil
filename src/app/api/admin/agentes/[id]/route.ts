// app/api/admin/agentes/[id]/route.ts - VERSÃO FINAL
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;

    if (!agentId) {
      return NextResponse.json(
        { error: "ID do agente é obrigatório" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Verificar autenticação (apenas admins podem deletar)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autorização não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Verificar se quem está chamando é admin
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!callerProfile || callerProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir agentes" },
        { status: 403 }
      );
    }

    // Impedir que um admin se delete
    if (user.id === agentId) {
      return NextResponse.json(
        { error: "Administradores não podem se excluir" },
        { status: 400 }
      );
    }

    console.log(
      "🔄 [ADMIN API] Exclusão autorizada por admin:",
      user.email,
      "-> Deletando agente:",
      agentId
    );

    // Buscar dados do agente
    const { data: agent, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, matricula, avatar_url")
      .eq("id", agentId)
      .single();

    if (fetchError || !agent) {
      console.error("❌ Agente não encontrado:", fetchError);
      return NextResponse.json(
        { error: "Agente não encontrado no banco de dados" },
        { status: 404 }
      );
    }

    console.log("✅ Agente encontrado:", agent.email);

    // Deletar avatar se existir
    if (agent.avatar_url) {
      try {
        const urlParts = agent.avatar_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
          await supabaseAdmin.storage
            .from("avatares-agentes")
            .remove([fileName]);
          console.log("✅ Avatar deletado");
        }
      } catch (storageError) {
        console.warn("⚠️ Erro ao deletar avatar:", storageError);
      }
    }

    // Deletar de tabelas relacionadas
    const relatedTables = [
      "notifications",
      "system_activities",
      "galeria_itens",
      "noticias",
    ] as const;

    for (const table of relatedTables) {
      try {
        let deleteQuery;

        // Use type assertion para cada tabela
        switch (table) {
          case "notifications":
          case "system_activities":
            deleteQuery = supabaseAdmin
              .from(table)
              .delete()
              .eq("user_id", agentId);
            break;
          case "galeria_itens":
          case "noticias":
            deleteQuery = supabaseAdmin
              .from(table)
              .delete()
              .eq("autor_id", agentId);
            break;
          default:
            continue;
        }

        await deleteQuery;
        console.log(`✅ Dados deletados da tabela ${table}`);
      } catch (error) {
        console.warn(`⚠️ Erro ao limpar ${table}:`, error);
      }
    }

    // Deletar das tabelas profiles
    try {
      await supabaseAdmin.from("profiles_simple").delete().eq("id", agentId);
      console.log("✅ Deletado de profiles_simple");
    } catch (error) {
      console.warn("⚠️ Erro ao deletar de profiles_simple:", error);
    }

    try {
      await supabaseAdmin.from("profiles").delete().eq("id", agentId);
      console.log("✅ Deletado de profiles");
    } catch (error) {
      console.warn("⚠️ Erro ao deletar de profiles:", error);
    }

    // Fazer backup em profiles_backup
    try {
      await supabaseAdmin.from("profiles_backup").insert({
        id: agentId,
        matricula: agent.matricula,
        email: agent.email,
        full_name: agent.full_name,
        avatar_url: agent.avatar_url,
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      });
      console.log("✅ Backup realizado em profiles_backup");
    } catch (backupError) {
      console.warn("⚠️ Erro ao fazer backup:", backupError);
    }

    // Deletar do Auth
    try {
      await supabaseAdmin.auth.admin.deleteUser(agentId);
      console.log("✅ Usuário deletado do Auth");
    } catch (authDeleteError) {
      console.error("❌ Erro ao deletar do Auth:", authDeleteError);
      return NextResponse.json(
        { error: "Erro ao remover usuário do sistema de autenticação" },
        { status: 500 }
      );
    }

    // Registrar a atividade
    await supabaseAdmin.from("system_activities").insert({
      user_id: user.id,
      action_type: "agent_deleted",
      description: `Agente ${agent.full_name} (${agent.email}) excluído por ${user.email}`,
      resource_type: "agent",
      resource_id: agentId,
      metadata: {
        deleted_by: user.id,
        deleted_by_email: user.email,
        target_email: agent.email,
        target_name: agent.full_name,
        target_matricula: agent.matricula,
        timestamp: new Date().toISOString(),
      },
    });

    console.log("✅ Atividade registrada no sistema");

    return NextResponse.json({
      success: true,
      message: "Agente excluído permanentemente",
      data: {
        id: agentId,
        email: agent.email,
        nome: agent.full_name,
        deletado_por: user.email,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("💥 ERRO na API de exclusão:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json(
      {
        error: "Falha na exclusão do agente",
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
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
