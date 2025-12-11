import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  handleApiError,
  createSuccessResponse,
  createValidationError,
} from "@/lib/utils/error-handler";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = (formData.get("userId") as string) || user.id;

    // Validações
    if (!file) {
      return createValidationError("Nenhum arquivo enviado");
    }

    // Verificar se usuário tem permissão
    if (user.role !== "admin" && userId !== user.id) {
      return NextResponse.json(
        { error: "Você só pode fazer upload do seu próprio avatar" },
        { status: 403 }
      );
    }

    // Validações do arquivo
    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      return createValidationError("Arquivo muito grande. Máximo: 2MB");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return createValidationError("Tipo de arquivo não permitido");
    }

    const supabaseAdmin = createAdminClient();

    // Gerar nome do arquivo
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Converter para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para o storage
    const { data, error } = await supabaseAdmin.storage
      .from("avatares-agentes")
      .upload(fileName, buffer, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("avatares-agentes").getPublicUrl(data.path);

    // Atualizar perfil do usuário com a nova URL
    await supabaseAdmin
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // Registrar atividade se for admin
    if (user.role === "admin" && userId !== user.id) {
      const { data: targetUser } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      await supabaseAdmin.from("system_activities").insert({
        user_id: user.id,
        action_type: "avatar_upload",
        description: `Avatar do agente ${
          targetUser?.full_name || targetUser?.email
        } atualizado`,
        resource_type: "profile",
        resource_id: userId,
        metadata: {
          uploaded_by: user.id,
          uploaded_by_email: user.email,
          target_user_id: userId,
          file_name: fileName,
          file_size: file.size,
        },
      });
    }

    return createSuccessResponse(
      {
        url: publicUrl,
        path: data.path,
        file_name: fileName,
        file_size: file.size,
      },
      "Avatar atualizado com sucesso"
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
