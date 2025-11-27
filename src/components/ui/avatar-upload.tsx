// src/components/ui/avatar-upload.tsx - VERSÃO FINAL CORRIGIDA
"use client";

import React, { useState, useRef } from "react";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Progress } from "./progress";
import { Upload, X, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
  className?: string;
  userId?: string;
}

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  className,
  userId,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { error: toastError, success: toastSuccess } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Validações
    if (!file.type.startsWith("image/")) {
      toastError("Selecione apenas arquivos de imagem", "Tipo inválido");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toastError("A imagem deve ter no máximo 2MB", "Arquivo muito grande");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar_${userId || "user"}_${Date.now()}.${fileExt}`;

      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20 + 5;
        });
      }, 200);

      // Fazer upload
      const { data, error } = await supabase.storage
        .from("avatares-agentes")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Completar progresso
      setProgress(100);

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatares-agentes").getPublicUrl(data.path);

      setAvatarUrl(publicUrl);
      onAvatarChange(publicUrl);

      toastSuccess("Avatar atualizado com sucesso!", "Sucesso");

      // Resetar progresso
      setTimeout(() => setProgress(0), 1000);
    } catch (error: unknown) {
      console.error("Erro ao fazer upload:", error);
      toastError("Erro ao enviar imagem", "Erro de upload");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setAvatarUrl(undefined);
    onAvatarChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <div className="relative">
        <Avatar className="w-20 h-20 border-2 border-gray-200">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-navy text-white text-lg font-semibold">
            <User className="w-8 h-8" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <div className="text-center">
              <Progress value={progress} className="w-16 h-2 bg-white mb-2" />
              <span className="text-white text-xs">{progress}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border-navy text-navy hover:bg-navy hover:text-white"
          >
            {uploading ? (
              <Loader2
                className="w-4 h-4 mr-2 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            )}
            {uploading
              ? "Enviando..."
              : avatarUrl
              ? "Alterar"
              : "Adicionar Foto"}
          </Button>

          {avatarUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" aria-hidden="true" />
              Remover
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500">JPG, PNG ou WEBP. Máximo 2MB.</p>
      </div>
    </div>
  );
}
