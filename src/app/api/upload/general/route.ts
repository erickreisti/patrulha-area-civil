// app/api/upload/general/route.ts
import { createAdminClient } from "@/lib/supabase/admin-client";
import { NextRequest, NextResponse } from "next/server";

// Interface para as configurações de upload
interface UploadConfig {
  bucket: string;
  maxSize: number;
  allowedTypes: string[];
}

// Configurações por tipo de upload
const UPLOAD_CONFIGS: Record<string, UploadConfig> = {
  image: {
    bucket: "imagens-noticias",
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  video: {
    bucket: "galeria-videos",
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
    ],
  },
  file: {
    bucket: "documentos-oficiais",
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["*"], // Qualquer tipo, mas validar extensões
  },
  media: {
    bucket: "galeria-fotos",
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const bucket = formData.get("bucket") as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: "Arquivo e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    // 🔒 SOLUÇÃO: Acessar config de forma segura sem any
    const config = UPLOAD_CONFIGS[type];
    if (!config) {
      return NextResponse.json(
        { error: "Tipo de upload inválido. Use: image, video, file ou media" },
        { status: 400 }
      );
    }

    const targetBucket = bucket || config.bucket;

    // 🔒 Validações de segurança
    if (file.size > config.maxSize) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande. Máximo: ${
            config.maxSize / 1024 / 1024
          }MB`,
        },
        { status: 400 }
      );
    }

    if (
      config.allowedTypes[0] !== "*" &&
      !config.allowedTypes.includes(file.type)
    ) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não permitido. Tipos permitidos: ${config.allowedTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // 🔒 Validação adicional para documentos
    if (type === "file") {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const dangerousExtensions = ["exe", "bat", "cmd", "sh", "js", "vbs"];
      if (fileExt && dangerousExtensions.includes(fileExt)) {
        return NextResponse.json(
          { error: "Tipo de arquivo potencialmente perigoso não permitido" },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
    const fileName = `${type}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("🔄 Fazendo upload geral...", {
      fileName,
      type,
      bucket: targetBucket,
      size: file.size,
    });

    // 🔒 Upload seguro
    const { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(fileName, buffer, {
        cacheControl: "3600",
        contentType: file.type,
      });

    if (error) {
      console.error("❌ Erro no upload geral:", error);
      throw error;
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(targetBucket).getPublicUrl(data.path);

    console.log("✅ Upload geral realizado:", publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
      fileName: fileName,
      bucket: targetBucket,
    });
  } catch (error: unknown) {
    console.error("💥 Erro no upload geral:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno no servidor",
      },
      { status: 500 }
    );
  }
}
