import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Apenas arquivos de imagem são permitidos" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 5MB" },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `avatar_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}.${fileExt}`;

    console.log("🔄 Fazendo upload do avatar...", fileName);

    const { data, error } = await supabaseAdmin.storage
      .from("avatares-agentes")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Erro no upload:", error);
      return NextResponse.json(
        { error: `Erro ao fazer upload: ${error.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("avatares-agentes").getPublicUrl(data.path);

    console.log("✅ Upload concluído:", publicUrl);

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("💥 Erro no servidor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
