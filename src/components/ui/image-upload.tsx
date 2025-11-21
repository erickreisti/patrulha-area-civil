// src/components/ui/image-upload.tsx
"use client";

import React, { useState, useRef } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Progress } from "./progress";
import { Upload, X, Image, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  bucket: string;
  onImageChange: (url: string) => void;
  currentImage?: string;
  maxSize?: number;
  className?: string;
}

export function ImageUpload({
  bucket,
  onImageChange,
  currentImage,
  maxSize = 5 * 1024 * 1024,
  className,
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Validações
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione apenas arquivos de imagem", "Tipo inválido");
      return;
    }

    if (file.size > maxSize) {
      toast.error(
        `A imagem deve ter no máximo ${maxSize / 1024 / 1024}MB`,
        "Arquivo muito grande"
      );
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;

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
        .from(bucket)
        .upload(fileName, file);

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Completar progresso
      setProgress(100);

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      setImageUrl(publicUrl);
      onImageChange(publicUrl);

      toast.success("Imagem carregada com sucesso!", "Sucesso");

      // Resetar progresso
      setTimeout(() => setProgress(0), 1000);
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar imagem", "Erro de upload");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setImageUrl(undefined);
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview da Imagem */}
      {imageUrl && (
        <div className="relative">
          <Card className="border-2 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Imagem carregada
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {imageUrl.split("/").pop()}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Área de Upload */}
      {!imageUrl && (
        <Card
          className={cn(
            "border-2 border-dashed transition-all duration-200 cursor-pointer",
            uploading
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 bg-gray-50"
          )}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <CardContent className="p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            <div className="space-y-3">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-blue-600">
                      Enviando... {progress}%
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mb-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Imagem
                    </Button>
                    <p className="text-sm text-gray-600">
                      ou arraste e solte aqui
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>PNG, JPG, WEBP até {maxSize / 1024 / 1024}MB</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão para trocar imagem */}
      {imageUrl && !uploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Trocar Imagem
        </Button>
      )}
    </div>
  );
}
