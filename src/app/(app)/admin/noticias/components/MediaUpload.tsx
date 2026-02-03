"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageIcon, VideoIcon, X, Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { uploadNewsMedia } from "@/app/actions/upload/news";

interface MediaUploadProps {
  slug: string;
  tipo: "imagem" | "video";
  onFileSelect: (file: File, tipo: "imagem" | "video") => void;
  onUploadComplete?: (url: string, tipo: "imagem" | "video") => void;
  onRemove: () => void;
  currentMedia?: string | null;
  disabled?: boolean;
  fieldLabel?: string;
  uploadImmediately?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedUrl: string | null;
}

export function MediaUpload({
  slug,
  tipo,
  onFileSelect,
  onUploadComplete,
  onRemove,
  currentMedia,
  disabled = false,
  fieldLabel,
  uploadImmediately = true,
}: MediaUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedUrl: null,
  });
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [selectedFileInfo, setSelectedFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFileSelect = () => {
    if (fileInputRef.current && !disabled && !uploadState.isUploading) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (file: File) => {
    if (!slug) {
      toast.error("O slug da notícia é necessário. Digite o título primeiro.");
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      isUploading: true,
      error: null,
      progress: 10,
    }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);
    formData.append("mediaType", tipo);

    // REMOVIDO O .catch() DO FINAL
    toast.promise(() => uploadNewsMedia(formData), {
      loading: `Fazendo upload do(a) ${tipo}...`,
      success: (result) => {
        if (!result.success) {
          throw new Error(result.error || "Erro desconhecido no upload.");
        }

        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
          uploadedUrl: result.data!.url,
        });

        if (onUploadComplete) onUploadComplete(result.data!.url, tipo);
        return `${tipo === "imagem" ? "Imagem" : "Vídeo"} enviado com sucesso!`;
      },
      error: (err) => {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 0,
          error: err.message,
        }));
        return `Erro no upload: ${err.message}`;
      },
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (tipo === "imagem" && !file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }
    if (tipo === "video" && !file.type.startsWith("video/")) {
      toast.error("Por favor, selecione um vídeo válido.");
      return;
    }

    const maxSize = tipo === "imagem" ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `Arquivo muito grande. Máximo permitido: ${maxSize / (1024 * 1024)}MB`,
      );
      return;
    }

    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setSelectedFileInfo({ name: file.name, size: file.size, type: file.type });

    onFileSelect(file, tipo);

    if (uploadImmediately) {
      await handleUpload(file);
    }
  };

  const handleRemove = () => {
    if (localPreview?.startsWith("blob:")) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setSelectedFileInfo(null);
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedUrl: null,
    });
    onRemove();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const showPreview = !!(localPreview || currentMedia);
  const previewUrl = localPreview || currentMedia;
  const isUploaded = !!(uploadState.uploadedUrl || currentMedia);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold flex items-center">
          {tipo === "imagem" ? (
            <ImageIcon className="w-5 h-5 mr-2 text-blue-500" />
          ) : (
            <VideoIcon className="w-5 h-5 mr-2 text-purple-500" />
          )}
          {fieldLabel ||
            (tipo === "imagem" ? "Imagem da Notícia" : "Vídeo da Notícia")}
        </Label>
      </div>

      {uploadState.error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2 flex items-center justify-between w-full">
            {uploadState.error}
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        {showPreview ? (
          <div className="relative rounded-lg border-2 border-blue-200 overflow-hidden bg-gray-50 shadow-sm">
            <div className="relative aspect-video flex items-center justify-center">
              {tipo === "imagem" ? (
                <Image
                  src={previewUrl!}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center">
                  <VideoIcon className="h-12 w-12 text-purple-400 mb-2" />
                  <span className="text-xs font-medium text-gray-500">
                    {selectedFileInfo?.name || "Vídeo selecionado"}
                  </span>
                </div>
              )}

              <div className="absolute top-2 left-2 flex gap-2">
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    isUploaded
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-white"
                  }`}
                >
                  {isUploaded ? "Salvo" : "Pendente"}
                </span>
              </div>

              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
                disabled={uploadState.isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {uploadState.isUploading && (
              <div className="p-3 border-t bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Enviando...</span>
                  <span className="text-xs font-bold text-blue-600">
                    {uploadState.progress}%
                  </span>
                </div>
                <Progress value={uploadState.progress} className="h-1.5" />
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleFileSelect}
            className={`group relative p-10 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
              !slug
                ? "opacity-60 cursor-not-allowed bg-gray-50"
                : "hover:border-blue-500 hover:bg-blue-50"
            } ${disabled ? "pointer-events-none opacity-50" : "border-gray-300"}`}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`p-4 rounded-full mb-4 ${
                  !slug
                    ? "bg-gray-100"
                    : "bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform"
                }`}
              >
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                {!slug
                  ? "Preencha o título para liberar o upload"
                  : "Clique ou arraste para enviar"}
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={tipo === "imagem" ? "image/*" : "video/*"}
        className="hidden"
      />
    </div>
  );
}
