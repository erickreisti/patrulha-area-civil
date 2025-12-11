import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  handleApiError,
  createSuccessResponse,
  createValidationError,
} from "@/lib/utils/error-handler";

// Configurações por tipo de arquivo
const UPLOAD_CONFIGS = {
  news: {
    bucket: "imagens-noticias",
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  gallery: {
    bucket: "galeria-fotos",
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  video: {
    bucket: "galeria-videos",
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ["video/mp4", "video/mpeg", "video/quicktime"],
  },
  document: {
    bucket: "documentos-oficiais",
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return createValidationError("Arquivo e tipo são obrigatórios");
    }

    // Verificar configuração do tipo
    const config = UPLOAD_CONFIGS[type as keyof typeof UPLOAD_CONFIGS];
    if (!config) {
      return createValidationError("Tipo de upload inválido");
    }

    // Verificar permissões
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem fazer upload geral" },
        { status: 403 }
      );
    }

    // Validações do arquivo
    if (file.size > config.maxSize) {
      return createValidationError(
        `Arquivo muito grande. Máximo: ${config.maxSize / 1024 / 1024}MB`
      );
    }

    if (!config.allowedTypes.includes(file.type)) {
      return createValidationError(
        `Tipo de arquivo não permitido. Permitidos: ${config.allowedTypes.join(
          ", "
        )}`
      );
    }

    // Validar extensões perigosas
    const dangerousExtensions = [".exe", ".bat", ".cmd", ".sh", ".js", ".vbs"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (fileExt && dangerousExtensions.includes(`.${fileExt}`)) {
      return createValidationError("Tipo de arquivo potencialmente perigoso");
    }

    const supabaseAdmin = createAdminClient();

    // Gerar nome do arquivo
    const fileName = `${type}/${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Converter para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload
    const { data, error } = await supabaseAdmin.storage
      .from(config.bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(config.bucket).getPublicUrl(data.path);

    // Registrar atividade
    await supabaseAdmin.from("system_activities").insert({
      user_id: user.id,
      action_type: `${type}_upload`,
      description: `Arquivo ${file.name} enviado para ${config.bucket}`,
      resource_type: "storage",
      resource_id: fileName,
      metadata: {
        uploaded_by: user.id,
        uploaded_by_email: user.email,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        bucket: config.bucket,
      },
    });

    return createSuccessResponse(
      {
        url: publicUrl,
        path: data.path,
        bucket: config.bucket,
        file_name: fileName,
        original_name: file.name,
        file_size: file.size,
        file_type: file.type,
      },
      "Arquivo enviado com sucesso"
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
