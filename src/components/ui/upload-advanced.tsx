// src/components/ui/upload-advanced.tsx - VERSÃO FINAL CORRIGIDA
"use client";

import React, { useRef, useCallback, useState } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Progress } from "./progress";
import { Badge } from "./badge";
import {
  X,
  Upload,
  File,
  Image,
  Video,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  url?: string;
}

interface UploadAdvancedProps {
  bucket: string;
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  onUploadComplete?: (urls: string[]) => void;
  className?: string;
  accept?: string;
  maxFiles?: number;
}

export function UploadAdvanced({
  bucket,
  maxSize = 5 * 1024 * 1024,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  multiple = true,
  onUploadComplete,
  className,
  accept = "image/*",
  maxFiles = 10,
}: UploadAdvancedProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();
  const supabase = createClient();

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`;
      }

      if (allowedTypes && !allowedTypes.includes(file.type)) {
        return `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(
          ", "
        )}`;
      }

      return null;
    },
    [maxSize, allowedTypes]
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validatedFiles: UploadFile[] = [];

      newFiles.forEach((file) => {
        const error = validateFile(file);

        if (error) {
          toastError(error, "Erro de validação");
          return;
        }

        validatedFiles.push({
          file,
          progress: 0,
          status: "pending",
        });
      });

      setFiles((prev) => [...prev, ...validatedFiles]);
    },
    [toastError, validateFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      if (files.length + newFiles.length > maxFiles) {
        toastError(
          `Limite de ${maxFiles} arquivos excedido.`,
          "Limite de upload"
        );
        return;
      }

      addFiles(newFiles);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files) {
        const newFiles = Array.from(e.dataTransfer.files);

        if (files.length + newFiles.length > maxFiles) {
          toastError(
            `Limite de ${maxFiles} arquivos excedido.`,
            "Limite de upload"
          );
          return;
        }

        addFiles(newFiles);
      }
    },
    [files.length, maxFiles, toastError, addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const uploadFile = async (
    file: UploadFile,
    index: number
  ): Promise<string> => {
    const fileExt = file.file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2)}_${Date.now()}.${fileExt}`;

    // Atualizar status para uploading
    setFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, status: "uploading", progress: 0 } : f
      )
    );

    // Simular progresso
    const progressInterval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
        )
      );
    }, 200);

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.file);

      clearInterval(progressInterval);

      if (error) {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, status: "error", error: error.message, progress: 0 }
              : f
          )
        );
        throw error;
      }

      // Completar progresso
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, progress: 100 } : f))
      );

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data!.path);

      // Marcar como completado
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "completed", url: publicUrl } : f
        )
      );

      return publicUrl;
    } catch (error) {
      clearInterval(progressInterval);
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "error", progress: 0 } : f
        )
      );
      throw error;
    }
  };

  const uploadAll = async (): Promise<string[]> => {
    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        if (files[i].status === "pending" || files[i].status === "error") {
          try {
            const url = await uploadFile(files[i], i);
            urls.push(url);
          } catch (error) {
            console.error(`Erro ao fazer upload do arquivo ${i}:`, error);
          }
        }
      }

      if (urls.length > 0) {
        toastSuccess(
          `${urls.length} arquivo(s) enviado(s) com sucesso.`,
          "Upload concluído"
        );
        if (onUploadComplete) {
          onUploadComplete(urls);
        }
      }

      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <Image className="w-4 h-4 text-blue-600" aria-hidden="true" />;
    if (file.type.startsWith("video/"))
      return <Video className="w-4 h-4 text-purple-600" aria-hidden="true" />;
    return <File className="w-4 h-4 text-gray-600" aria-hidden="true" />;
  };

  const getStatusIcon = (file: UploadFile) => {
    switch (file.status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-600" aria-hidden="true" />;
      case "error":
        return (
          <AlertCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
        );
      case "uploading":
        return (
          <Loader2
            className="w-4 h-4 text-blue-600 animate-spin"
            aria-hidden="true"
          />
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const hasFiles = files.length > 0;
  const completedFiles = files.filter((f) => f.status === "completed").length;
  const totalFiles = files.length;
  const canUpload =
    hasFiles &&
    !isUploading &&
    files.some((f) => f.status === "pending" || f.status === "error");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Área de Drop */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          "hover:shadow-md",
          hasFiles
            ? "border-blue-500 bg-blue-50/50"
            : "border-gray-300 hover:border-blue-400 bg-gray-50/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              <div
                className={cn(
                  "p-3 rounded-full transition-colors",
                  hasFiles ? "bg-blue-100" : "bg-gray-100"
                )}
              >
                <Upload
                  className={cn(
                    "w-8 h-8 transition-colors",
                    hasFiles ? "text-blue-600" : "text-gray-400"
                  )}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="secondary"
                className="mb-2"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Selecione os arquivos
              </Button>
              <p className="text-sm text-gray-600">ou arraste e solte aqui</p>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>Tipos permitidos:</strong>{" "}
                {allowedTypes.map((t) => t.split("/")[1]).join(", ")}
              </p>
              <p>
                <strong>Tamanho máximo:</strong> {maxSize / 1024 / 1024}MB por
                arquivo
              </p>
              <p>
                <strong>Limite:</strong> {maxFiles} arquivos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Arquivos */}
      {hasFiles && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">
                Arquivos selecionados
              </h4>
              <p className="text-sm text-gray-600">
                {files.length} de {maxFiles} arquivos
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant={
                  completedFiles === totalFiles ? "default" : "secondary"
                }
                className={cn(
                  completedFiles === totalFiles && "bg-green-100 text-green-800"
                )}
              >
                {completedFiles}/{totalFiles} concluídos
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                disabled={isUploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Limpar todos
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {files.map((file, index) => (
              <Card
                key={index}
                className={cn(
                  "p-4 transition-all border",
                  file.status === "error" && "border-red-200 bg-red-50",
                  file.status === "completed" && "border-green-200 bg-green-50",
                  file.status === "uploading" && "border-blue-200 bg-blue-50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-1">
                      {getFileIcon(file.file)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate text-gray-900">
                          {file.file.name}
                        </p>
                        {getStatusIcon(file)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatFileSize(file.file.size)}</span>
                        <span>{file.progress}%</span>
                      </div>
                      <Progress
                        value={file.progress}
                        className={cn(
                          "h-2",
                          file.status === "completed" && "bg-green-200",
                          file.status === "error" && "bg-red-200",
                          file.status === "uploading" && "bg-blue-200"
                        )}
                      />
                      {file.error && (
                        <p className="text-xs text-red-600 font-medium">
                          {file.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    className="flex-shrink-0 ml-2 text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-gray-600">
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <Loader2
                    className="w-4 h-4 animate-spin text-blue-600"
                    aria-hidden="true"
                  />
                  <span>Enviando arquivos...</span>
                </div>
              ) : (
                <span>
                  {completedFiles === totalFiles
                    ? "Todos os arquivos foram enviados"
                    : "Pronto para enviar"}
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={clearFiles}
                disabled={isUploading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={uploadAll}
                disabled={!canUpload}
                className={cn(
                  "bg-blue-600 hover:bg-blue-700 text-white",
                  !canUpload && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2
                      className="w-4 h-4 mr-2 animate-spin"
                      aria-hidden="true"
                    />
                    Enviando...
                  </>
                ) : (
                  `Enviar ${files.length} arquivo(s)`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
