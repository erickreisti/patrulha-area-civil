import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

interface UpdateUserBody {
  userId: string;
  newEmail?: string;
  oldEmail?: string;
  fullName?: string;
  metadata?: Record<string, unknown>;
}

interface UserMetadata {
  full_name?: string;
  [key: string]: unknown;
}

interface AuthUpdateData {
  email?: string;
  user_metadata?: UserMetadata;
  [key: string]: unknown;
}

interface ProfileUpdateData {
  email?: string;
  full_name?: string;
  graduacao?: string | null;
  tipo_sanguineo?: string | null;
  validade_certificacao?: string | null;
  avatar_url?: string | null;
  status?: boolean | null;
  role?: string | null;
  updated_at: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Obter dados da requisição
    const body: UpdateUserBody = await request.json();
    const { userId, newEmail, oldEmail, fullName, metadata } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    console.log("🔄 [UPDATE USER API] Iniciando atualização:", {
      userId,
      oldEmail,
      newEmail,
      fullName,
      hasMetadata: !!metadata,
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
      data: { user: currentUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !currentUser) {
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
      .eq("id", currentUser.id)
      .single();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem editar usuários" },
        { status: 403 }
      );
    }

    console.log("✅ Usuário autorizado (admin):", currentUser.email);

    // 3. Verificar se o novo email já existe em outro perfil (se for alterar email)
    if (newEmail) {
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
    }

    // 4. Preparar dados para atualização no Auth
    const authUpdateData: AuthUpdateData = {};

    // Atualizar email se fornecido
    if (newEmail) {
      authUpdateData.email = newEmail;
    }

    // Se houver fullName, garantir que ele seja incluído nos user_metadata
    // Primeiro obter os metadados atuais para preservar o que já existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(
      userId
    );

    let currentMetadata: UserMetadata = {};
    if (existingUser?.user?.user_metadata) {
      currentMetadata = existingUser.user.user_metadata as UserMetadata;
    }

    // Atualizar full_name nos metadados se fornecido
    if (fullName !== undefined) {
      currentMetadata.full_name = fullName;
    }

    // Adicionar outros metadados se fornecidos
    if (metadata) {
      Object.assign(currentMetadata, metadata);
    }

    // Sempre incluir os user_metadata mesmo que não tenha mudado (para garantir a sincronização)
    authUpdateData.user_metadata = currentMetadata;

    // 5. Atualizar usuário no sistema de autenticação (Auth)
    console.log("🔐 Atualizando usuário no Auth...", authUpdateData);

    const { data: authUpdateResult, error: authUpdateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, authUpdateData);

    if (authUpdateError) {
      console.error("❌ Erro ao atualizar usuário no Auth:", authUpdateError);
      return NextResponse.json(
        {
          error: "Falha ao atualizar usuário no sistema de autenticação",
          details: authUpdateError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Usuário atualizado no Auth:", {
      email: authUpdateResult.user?.email,
      metadata: authUpdateResult.user?.user_metadata,
    });

    // 6. Preparar dados para atualização no perfil (banco de dados)
    const profileUpdateData: ProfileUpdateData = {
      updated_at: new Date().toISOString(),
    };

    // Atualizar email no perfil se fornecido
    if (newEmail) {
      profileUpdateData.email = newEmail;
    }

    // Atualizar full_name no perfil se fornecido (CORRIGIDO: garantir que seja sincronizado)
    if (fullName !== undefined) {
      profileUpdateData.full_name = fullName;
    } else {
      // Se não foi fornecido fullName, mas está nos metadados, usar dos metadados
      if (currentMetadata.full_name) {
        profileUpdateData.full_name = currentMetadata.full_name;
      }
    }

    // Adicionar outros campos do metadata que correspondem ao schema do profile
    if (metadata) {
      // Campos permitidos no profile (baseado no schema)
      const allowedProfileFields = [
        "graduacao",
        "tipo_sanguineo",
        "validade_certificacao",
        "avatar_url",
        "status",
        "role",
      ] as const;

      allowedProfileFields.forEach((field) => {
        const value = metadata[field];
        if (value !== undefined) {
          // Type-safe assignment - agora aceita null
          if (
            (field === "graduacao" ||
              field === "tipo_sanguineo" ||
              field === "validade_certificacao" ||
              field === "avatar_url" ||
              field === "role") &&
            (typeof value === "string" || value === null)
          ) {
            profileUpdateData[field] = value as string | null;
          } else if (
            field === "status" &&
            (typeof value === "boolean" || value === null)
          ) {
            profileUpdateData[field] = value as boolean | null;
          }
        }
      });
    }

    // 7. Atualizar perfil no banco de dados
    console.log(
      "💾 Atualizando perfil no banco de dados...",
      profileUpdateData
    );

    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(profileUpdateData)
      .eq("id", userId);

    if (profileUpdateError) {
      console.error("❌ Erro ao atualizar perfil:", profileUpdateError);

      // Tentar reverter a mudança no Auth em caso de erro
      try {
        const revertData: AuthUpdateData = {};

        if (newEmail && oldEmail) {
          revertData.email = oldEmail;
        }

        // Reverter metadados para o estado original
        if (existingUser?.user?.user_metadata) {
          revertData.user_metadata = existingUser.user
            .user_metadata as UserMetadata;
        }

        if (Object.keys(revertData).length > 0) {
          await supabaseAdmin.auth.admin.updateUserById(userId, revertData);
          console.warn(
            "⚠️ Alterações no Auth revertidas devido a erro no perfil"
          );
        }
      } catch (revertError: unknown) {
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

    console.log("✅ Perfil atualizado no banco de dados");

    // 8. Registrar atividade no sistema
    try {
      const activityDescription: string[] = [];
      if (newEmail) {
        activityDescription.push(
          `email alterado de ${oldEmail} para ${newEmail}`
        );
      }
      if (fullName) {
        activityDescription.push(`nome alterado para "${fullName}"`);
      }
      if (metadata) {
        activityDescription.push(`metadados atualizados`);
      }

      await supabaseAdmin.from("system_activities").insert({
        user_id: currentUser.id,
        action_type: "user_update",
        description: `Usuário ${userId} atualizado: ${activityDescription.join(
          ", "
        )}`,
        resource_type: "profile",
        resource_id: userId,
        metadata: {
          updated_by: currentUser.id,
          updated_by_email: currentUser.email,
          target_user_id: userId,
          old_email: oldEmail,
          new_email: newEmail,
          full_name: fullName,
          metadata_changes: metadata,
          timestamp: new Date().toISOString(),
        },
      });

      console.log("📝 Atividade registrada no sistema");
    } catch (activityError: unknown) {
      console.warn("⚠️ Não foi possível registrar atividade:", activityError);
    }

    // 9. Retornar sucesso
    console.log("🎉 Atualização de usuário concluída com sucesso!");

    return NextResponse.json({
      success: true,
      message: "Usuário atualizado com sucesso em todos os sistemas",
      data: {
        userId,
        oldEmail,
        newEmail,
        fullName,
        metadata,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.id,
        authUpdate: {
          email: authUpdateResult.user?.email,
          user_metadata: authUpdateResult.user?.user_metadata,
        },
        profileUpdate: profileUpdateData,
      },
    });
  } catch (error: unknown) {
    console.error("💥 ERRO na API de atualização de usuário:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json(
      {
        error: "Falha na atualização de usuário",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Rota para atualização específica de email (mantendo compatibilidade)
export async function PATCH(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    const body: UpdateUserBody = await request.json();
    const { userId, newEmail, fullName, metadata } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    console.log("🔄 [PATCH USER API] Atualização parcial:", {
      userId,
      newEmail,
      fullName,
      metadata,
    });

    // Verificar autenticação (mesma lógica do POST)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autorização não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
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

    // Verificar se é admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem editar usuários" },
        { status: 403 }
      );
    }

    // Obter dados atuais do usuário
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(
      userId
    );

    // Preparar dados de atualização
    const authUpdateData: AuthUpdateData = {};

    if (newEmail) {
      authUpdateData.email = newEmail;
    }

    // CORREÇÃO: Manter metadados existentes e atualizar corretamente
    let currentMetadata: UserMetadata = {};
    if (existingUser?.user?.user_metadata) {
      currentMetadata = existingUser.user.user_metadata as UserMetadata;
    }

    // Atualizar full_name se fornecido
    if (fullName !== undefined) {
      currentMetadata.full_name = fullName;
    }

    // Adicionar outros metadados se fornecidos
    if (metadata) {
      Object.assign(currentMetadata, metadata);
    }

    // Sempre incluir user_metadata para garantir sincronização
    authUpdateData.user_metadata = currentMetadata;

    console.log("🔐 Atualizando no Auth:", authUpdateData);

    // Atualizar no Auth
    const { data: authResult, error: authUpdateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, authUpdateData);

    if (authUpdateError) {
      console.error("❌ Erro ao atualizar no Auth:", authUpdateError);
      return NextResponse.json(
        {
          error: "Falha ao atualizar no sistema de autenticação",
          details: authUpdateError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Auth atualizado:", {
      email: authResult.user?.email,
      metadata: authResult.user?.user_metadata,
    });

    // Atualizar no banco de dados
    const profileUpdateData: ProfileUpdateData = {
      updated_at: new Date().toISOString(),
    };

    if (newEmail) {
      profileUpdateData.email = newEmail;
    }

    // CORREÇÃO: Garantir que full_name seja sincronizado
    if (fullName !== undefined) {
      profileUpdateData.full_name = fullName;
    } else if (currentMetadata.full_name) {
      // Se não foi fornecido fullName mas está nos metadados, usar dos metadados
      profileUpdateData.full_name = currentMetadata.full_name;
    }

    // Adicionar outros campos do metadata
    if (metadata) {
      const allowedProfileFields = [
        "graduacao",
        "tipo_sanguineo",
        "validade_certificacao",
        "avatar_url",
        "status",
        "role",
      ] as const;

      allowedProfileFields.forEach((field) => {
        const value = metadata[field];
        if (value !== undefined) {
          if (
            (field === "graduacao" ||
              field === "tipo_sanguineo" ||
              field === "validade_certificacao" ||
              field === "avatar_url" ||
              field === "role") &&
            (typeof value === "string" || value === null)
          ) {
            profileUpdateData[field] = value as string | null;
          } else if (
            field === "status" &&
            (typeof value === "boolean" || value === null)
          ) {
            profileUpdateData[field] = value as boolean | null;
          }
        }
      });
    }

    console.log("💾 Atualizando perfil:", profileUpdateData);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update(profileUpdateData)
      .eq("id", userId);

    if (profileError) {
      console.error("❌ Erro ao atualizar perfil:", profileError);
      return NextResponse.json(
        {
          error: "Falha ao atualizar perfil",
          details: profileError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: {
        userId,
        newEmail,
        fullName,
        updatedAt: new Date().toISOString(),
        authUpdate: {
          email: authResult.user?.email,
          user_metadata: authResult.user?.user_metadata,
        },
        profileUpdate: profileUpdateData,
      },
    });
  } catch (error: unknown) {
    console.error("💥 ERRO na API PATCH:", error);
    return NextResponse.json(
      {
        error: "Falha na atualização",
        details: error instanceof Error ? error.message : "Erro desconhecido",
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
      "Access-Control-Allow-Methods": "POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
