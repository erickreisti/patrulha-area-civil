import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api/middleware/auth";
import {
  handleApiError,
  createSuccessResponse,
  createValidationError,
} from "@/lib/api/utils/error-handler";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { supabaseAdmin, user: adminUser } = authResult;
    const body = await request.json();

    const { userId, newEmail, fullName, metadata } = body;

    if (!userId) {
      return createValidationError("ID do usuário é obrigatório");
    }

    // Verificar se usuário existe
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !existingUser) {
      throw new Error("Usuário não encontrado");
    }

    // Preparar dados de atualização
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (newEmail) {
      // Verificar se email já existe
      const { data: emailExists } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", newEmail)
        .neq("id", userId)
        .single();

      if (emailExists) {
        return createValidationError("Este email já está em uso");
      }

      updateData.email = newEmail;
    }

    if (fullName !== undefined) {
      updateData.full_name = fullName;
    }

    // Atualizar campos do metadata que existem no perfil
    const allowedFields = [
      "graduacao",
      "tipo_sanguineo",
      "validade_certificacao",
      "avatar_url",
    ];

    if (metadata) {
      allowedFields.forEach((field) => {
        if (metadata[field] !== undefined) {
          updateData[field] = metadata[field];
        }
      });
    }

    // Atualizar no banco
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
    }

    // Atualizar no Auth se necessário
    if (newEmail || fullName !== undefined || metadata) {
      const authUpdateData: any = {};

      if (newEmail) {
        authUpdateData.email = newEmail;
      }

      if (fullName !== undefined || metadata) {
        const currentMetadata = existingUser.metadata || {};
        authUpdateData.user_metadata = {
          ...currentMetadata,
          ...(fullName !== undefined ? { full_name: fullName } : {}),
          ...metadata,
        };
      }

      if (Object.keys(authUpdateData).length > 0) {
        await supabaseAdmin.auth.admin.updateUserById(userId, authUpdateData);
      }
    }

    // Registrar atividade
    await supabaseAdmin.from("system_activities").insert({
      user_id: adminUser.id,
      action_type: "user_update",
      description: `Usuário ${updatedProfile.email} atualizado por ${adminUser.email}`,
      resource_type: "profile",
      resource_id: userId,
      metadata: {
        updated_by: adminUser.id,
        updated_by_email: adminUser.email,
        changes: updateData,
      },
    });

    return createSuccessResponse(
      updatedProfile,
      "Usuário atualizado com sucesso"
    );
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
