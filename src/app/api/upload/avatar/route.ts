// app/api/upload/avatar/route.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // 🔒 Validações de segurança
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo: 2MB" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Apenas imagens são permitidas" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou GIF" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `avatar_${userId || "user"}_${Date.now()}.${fileExt}`;

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("🔄 Fazendo upload do avatar...", {
      fileName,
      size: file.size,
      type: file.type,
    });

    // 🔒 Upload seguro com admin client
    const { data, error } = await supabase.storage
      .from("avatares-agentes")
      .upload(fileName, buffer, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type,
      });

    if (error) {
      console.error("❌ Erro no upload:", error);
      throw error;
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatares-agentes").getPublicUrl(data.path);

    console.log("✅ Upload realizado com sucesso:", publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
      fileName: fileName,
    });
  } catch (error: unknown) {
    console.error("💥 Erro no upload de avatar:", error);

    // Tratamento de erros específicos do Supabase
    if (
      error instanceof Error &&
      error.message?.includes("The resource already exists")
    ) {
      return NextResponse.json(
        { error: "Já existe um arquivo com este nome" },
        { status: 409 }
      );
    }

    if (
      error instanceof Error &&
      error.message?.includes("Payload too large")
    ) {
      return NextResponse.json(
        { error: "Arquivo muito grande" },
        { status: 413 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno no servidor",
      },
      { status: 500 }
    );
  }
}
