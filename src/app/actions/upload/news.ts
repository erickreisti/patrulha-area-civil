"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const STORAGE_BUCKET = "imagens-noticias";

interface UploadResult {
  success: boolean;
  error?: string;
  data?: {
    url: string;
    path: string;
    mediaType: "imagem" | "video";
  };
}

export async function uploadNewsMedia(
  formData: FormData,
): Promise<UploadResult> {
  try {
    const supabaseAdmin = createAdminClient();
    const file = formData.get("file") as File;
    const slug = formData.get("slug") as string;
    const mediaType =
      (formData.get("mediaType") as "imagem" | "video") || "imagem";

    if (!file || !slug) {
      return { success: false, error: "Dados incompletos para upload" };
    }

    // Gerar nome único e seguro
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "tmp";
    const fileName = `${slug}_${Date.now()}.${fileExtension}`;
    const folder = mediaType === "imagem" ? "images" : "videos";
    const filePath = `${folder}/${slug}/${fileName}`;

    // Conversão do arquivo para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
        duplex: "half",
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      throw new Error(uploadError.message);
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    return {
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
        mediaType,
      },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Falha na comunicação com Storage";

    console.error("❌ Erro fatal no upload:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
