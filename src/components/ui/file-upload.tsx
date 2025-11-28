"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Progress } from "./progress";
import { Badge } from "./badge";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  FaUpload,
  FaTimes,
  FaFile,
  FaImage,
  FaVideo,
  FaUser,
  FaCheck,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

// Tipos de upload suportados
type UploadType = "avatar" | "image" | "video" | "file" | "media";
type UploadStatus = "pending" | "uploading" | "completed" | "error";

interface UploadFile {
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  url?: string;
}

interface FileUploadProps {
  // Configurações básicas
  type?: UploadType;
  bucket?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;

  // Callbacks
  onUploadComplete?: (urls: string[]) => void;
  onFileChange?: (url: string) => void;

  // Estado atual
  currentFile?: string;

  // Configurações específicas por tipo
  accept?: string;
  className?: string;
  userId?: string;
}

// Configurações padrão por tipo
const UPLOAD_CONFIGS = {
  avatar: {
    bucket: "avatares-agentes",
    multiple: false,
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB
    accept: "image/*",
  },
  image: {
    bucket: "imagens-noticias",
    multiple: false,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: "image/*",
  },
  video: {
    bucket: "galeria-videos",
    multiple: false,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: "video/*",
  },
  file: {
    bucket: "documentos-oficiais",
    multiple: true,
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: "*/*",
  },
  media: {
    bucket: "galeria-fotos",
    multiple: true,
    maxFiles: 20,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: "image/*,video/*",
  },
} as const;

export function FileUpload({
  type = "file",
  bucket,
  multiple,
  maxFiles,
  maxSize,
  onUploadComplete,
  onFileChange,
  currentFile,
  accept,
  className,
  userId,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(currentFile || "");

  // 🔐 USAR ADMIN CLIENT PARA UPLOADS (ignora RLS)
  const supabase = createAdminClient();

  // Sincronizar currentFile com estado interno
  useEffect(() => {
    if (currentFile !== currentAvatarUrl) {
      setCurrentAvatarUrl(currentFile || "");
    }
  }, [currentFile, currentAvatarUrl]);

  // Obter configurações baseadas no tipo
  const config = {
    ...UPLOAD_CONFIGS[type],
    bucket: bucket || UPLOAD_CONFIGS[type].bucket,
    multiple: multiple ?? UPLOAD_CONFIGS[type].multiple,
    maxFiles: maxFiles ?? UPLOAD_CONFIGS[type].maxFiles,
    maxSize: maxSize ?? UPLOAD_CONFIGS[type].maxSize,
    accept: accept ?? UPLOAD_CONFIGS[type].accept,
  };

  // Para uploads únicos (avatar, image, video), usar currentFile
  const shouldUseSingleMode = !config.multiple;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > config.maxSize) {
        return `Arquivo muito grande. Máximo: ${
          config.maxSize / 1024 / 1024
        }MB`;
      }

      if (
        config.accept !== "*/*" &&
        !file.type.match(new RegExp(config.accept.replace("*", ".*")))
      ) {
        return `Tipo de arquivo não permitido. Permitidos: ${config.accept}`;
      }

      return null;
    },
    [config.maxSize, config.accept]
  );

  // Upload automático para avatar (sem botão de enviar)
  const uploadFileAutomatically = useCallback(
    async (file: File) => {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `avatar_${userId || "user"}_${Date.now()}.${fileExt}`;

      try {
        console.log(
          "🔄 Iniciando upload automático com admin client...",
          fileName
        );

        // Atualizar estado para uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: "uploading", progress: 0 } : f
          )
        );

        // Simular progresso
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, progress: Math.min(f.progress + 20, 90) }
                : f
            )
          );
        }, 200);

        // 🔐 Fazer upload com admin client (ignora RLS)
        const { data, error } = await supabase.storage
          .from(config.bucket)
          .upload(fileName, file, {
            upsert: true,
            cacheControl: "3600",
          });

        clearInterval(progressInterval);

        if (error) {
          console.error("❌ Erro no upload:", error);
          throw error;
        }

        // Completar progresso
        setFiles((prev) =>
          prev.map((f) => (f.file === file ? { ...f, progress: 100 } : f))
        );

        // Obter URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from(config.bucket).getPublicUrl(data!.path);

        console.log("✅ Upload concluído:", publicUrl);

        // Atualizar estado final
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: "completed", url: publicUrl } : f
          )
        );

        // Atualizar URL atual e chamar callback
        setCurrentAvatarUrl(publicUrl);
        if (onFileChange) {
          onFileChange(publicUrl);
        }

        toast.success("Avatar atualizado com sucesso!");
      } catch (error: unknown) {
        console.error("❌ Erro no upload:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro desconhecido no upload";

        setFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? {
                  ...f,
                  status: "error",
                  error: errorMessage,
                  progress: 0,
                }
              : f
          )
        );
        toast.error("Erro ao fazer upload do avatar", {
          description: errorMessage,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [config.bucket, userId, onFileChange, supabase.storage]
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      if (shouldUseSingleMode) {
        // Modo único: substituir arquivo atual
        const file = newFiles[0];
        const error = validateFile(file);

        if (error) {
          toast.error("Erro de validação", {
            description: error,
          });
          return;
        }

        setFiles([
          {
            file,
            progress: 0,
            status: "pending",
          },
        ]);

        // Upload automático para avatar
        if (type === "avatar") {
          uploadFileAutomatically(file);
        }
      } else {
        // Modo múltiplo: adicionar arquivos
        const validatedFiles: UploadFile[] = [];

        newFiles.forEach((file) => {
          if (files.length + validatedFiles.length >= config.maxFiles) {
            toast.error("Limite de arquivos", {
              description: `Máximo de ${config.maxFiles} arquivos permitido.`,
            });
            return;
          }

          const error = validateFile(file);

          if (error) {
            toast.error("Erro de validação", {
              description: error,
            });
            return;
          }

          validatedFiles.push({
            file,
            progress: 0,
            status: "pending",
          });
        });

        setFiles((prev) => [...prev, ...validatedFiles]);
      }
    },
    [
      shouldUseSingleMode,
      files.length,
      config.maxFiles,
      validateFile,
      type,
      uploadFileAutomatically,
    ]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);

      // Resetar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files);
        addFiles(newFiles);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (shouldUseSingleMode) {
      setCurrentAvatarUrl("");
      if (onFileChange) {
        onFileChange("");
      }
    }
  };

  const clearFiles = () => {
    setFiles([]);
    if (shouldUseSingleMode) {
      setCurrentAvatarUrl("");
      if (onFileChange) {
        onFileChange("");
      }
    }
  };

  const uploadFile = async (
    file: UploadFile,
    index: number
  ): Promise<string> => {
    const fileExt = file.file.name.split(".").pop()?.toLowerCase() || "jpg";
    let fileName = "";

    // Nomeação específica por tipo
    switch (type) {
      case "avatar":
        fileName = `avatar_${userId || "user"}_${Date.now()}.${fileExt}`;
        break;
      default:
        fileName = `${Math.random()
          .toString(36)
          .substring(2)}_${Date.now()}.${fileExt}`;
    }

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
      // 🔐 Usar admin client para upload
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .upload(
          fileName,
          file.file,
          type === "avatar" ? { upsert: true } : undefined
        );

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
      } = supabase.storage.from(config.bucket).getPublicUrl(data!.path);

      // Marcar como completado
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "completed", url: publicUrl } : f
        )
      );

      // Callback para upload único
      if (shouldUseSingleMode && onFileChange) {
        onFileChange(publicUrl);
        setCurrentAvatarUrl(publicUrl);
      }

      return publicUrl;
    } catch (error: unknown) {
      clearInterval(progressInterval);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "error",
                error: errorMessage,
                progress: 0,
              }
            : f
        )
      );
      throw error;
    }
  };

  const uploadAll = async (): Promise<string[]> => {
    if (type === "avatar") {
      // Para avatar, o upload já é automático
      return files.filter((f) => f.url).map((f) => f.url!);
    }

    setIsUploading(true);
    const loadingToastId = toast.loading(
      `Enviando ${files.length} arquivo(s)...`
    );
    const urls: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.status === "pending" || file.status === "error") {
          try {
            const url = await uploadFile(file, i);
            urls.push(url);
            successCount++;

            // Atualiza o toast de loading com progresso
            toast.loading(
              `Enviando arquivos... (${successCount + errorCount}/${
                files.length
              })`,
              { id: loadingToastId }
            );
          } catch (error) {
            console.error(`Erro ao fazer upload do arquivo ${i}:`, error);
            errorCount++;

            // Atualiza o toast de loading com progresso
            toast.loading(
              `Enviando arquivos... (${successCount + errorCount}/${
                files.length
              })`,
              { id: loadingToastId }
            );
          }
        } else if (file.status === "completed" && file.url) {
          urls.push(file.url);
          successCount++;
        }
      }

      // Fecha o toast de loading
      toast.dismiss(loadingToastId);

      if (urls.length > 0 && onUploadComplete) {
        onUploadComplete(urls);

        // Toast final baseado no resultado
        if (errorCount === 0) {
          toast.success("Upload concluído com sucesso!", {
            description: `${successCount} arquivo(s) enviado(s).`,
          });
        } else if (successCount > 0) {
          toast.success("Upload parcialmente concluído", {
            description: `${successCount} de ${files.length} arquivos enviados. ${errorCount} falhas.`,
          });
        } else {
          toast.error("Upload falhou", {
            description: "Nenhum arquivo foi enviado com sucesso.",
          });
        }
      }

      return urls;
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Erro no processo de upload", {
        description: "Ocorreu um erro durante o upload dos arquivos.",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Renderização específica por tipo
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <FaImage className="w-4 h-4 text-blue-600" />;
    if (file.type.startsWith("video/"))
      return <FaVideo className="w-4 h-4 text-purple-600" />;
    return <FaFile className="w-4 h-4 text-gray-600" />;
  };

  const getStatusIcon = (file: UploadFile) => {
    switch (file.status) {
      case "completed":
        return <FaCheck className="w-4 h-4 text-green-600" />;
      case "error":
        return <FaExclamationCircle className="w-4 h-4 text-red-600" />;
      case "uploading":
        return <FaSpinner className="w-4 h-4 text-blue-600 animate-spin" />;
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

  // Renderização para Avatar (modo único com preview especial)
  if (type === "avatar") {
    const currentUploadFile = files[0];
    const displayUrl = currentUploadFile?.url || currentAvatarUrl || "";
    const displayStatus =
      currentUploadFile?.status || (currentAvatarUrl ? "completed" : "pending");

    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-gray-200">
            <AvatarImage
              src={displayUrl || undefined}
              alt="Avatar do agente"
              onError={(e) => {
                // Fallback em caso de erro no carregamento da imagem
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <AvatarFallback className="bg-navy text-white text-lg font-semibold">
              <FaUser className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>

          {/* Overlay de progresso para avatar */}
          {(displayStatus === "uploading" || displayStatus === "pending") && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="text-center text-white">
                {displayStatus === "uploading" && currentUploadFile && (
                  <>
                    <Progress
                      value={currentUploadFile.progress}
                      className="w-16 h-2 bg-white/30 mb-2"
                    />
                    <span className="text-xs block">
                      {currentUploadFile.progress}%
                    </span>
                  </>
                )}
                {displayStatus === "pending" && (
                  <FaSpinner className="w-6 h-6 animate-spin mx-auto" />
                )}
              </div>
            </div>
          )}

          {/* Ícone de status */}
          {displayStatus === "completed" && currentUploadFile && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <FaCheck className="w-3 h-3 text-white" />
            </div>
          )}
          {displayStatus === "error" && currentUploadFile && (
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
              <FaExclamationCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={config.accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="border-navy text-navy hover:bg-navy hover:text-white"
            >
              {isUploading ? (
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FaUpload className="w-4 h-4 mr-2" />
              )}
              {isUploading
                ? "Enviando..."
                : displayUrl
                ? "Alterar Foto"
                : "Adicionar Foto"}
            </Button>

            {displayUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFiles}
                disabled={isUploading}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <FaTimes className="w-4 h-4 mr-2" />
                Remover
              </Button>
            )}
          </div>

          {/* Informações do upload atual */}
          {currentUploadFile && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="truncate max-w-[120px]">
                  {currentUploadFile.file.name}
                </span>
                <span>{formatFileSize(currentUploadFile.file.size)}</span>
              </div>
              {currentUploadFile.status === "uploading" && (
                <Progress
                  value={currentUploadFile.progress}
                  className="h-1.5 bg-gray-200"
                />
              )}
              {currentUploadFile.error && (
                <p className="text-xs text-red-600 font-medium">
                  {currentUploadFile.error}
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500">
            JPG, PNG ou WEBP. Máximo {config.maxSize / 1024 / 1024}MB.
          </p>
        </div>
      </div>
    );
  }

  // Renderização padrão para outros tipos
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
        <CardContent className="p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple={config.multiple}
            accept={config.accept}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              <div
                className={cn(
                  "p-3 rounded-full",
                  hasFiles ? "bg-blue-100" : "bg-gray-100"
                )}
              >
                <FaUpload
                  className={cn(
                    "w-6 h-6",
                    hasFiles ? "text-blue-600" : "text-gray-400"
                  )}
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
                <strong>Tipos permitidos:</strong> {config.accept}
              </p>
              <p>
                <strong>Tamanho máximo:</strong> {config.maxSize / 1024 / 1024}
                MB por arquivo
              </p>
              {config.multiple && (
                <p>
                  <strong>Limite:</strong> {config.maxFiles} arquivos
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Arquivos (apenas para múltiplos) */}
      {hasFiles && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">
                Arquivos selecionados
              </h4>
              {config.multiple && (
                <p className="text-sm text-gray-600">
                  {files.length} de {config.maxFiles} arquivos
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {config.multiple && (
                <Badge
                  variant={
                    completedFiles === totalFiles ? "default" : "secondary"
                  }
                  className={cn(
                    completedFiles === totalFiles &&
                      "bg-green-100 text-green-800"
                  )}
                >
                  {completedFiles}/{totalFiles} concluídos
                </Badge>
              )}
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
                    <FaTimes className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Botões de ação - apenas para tipos que não são avatar */}
          {(config.multiple || files.length > 0) && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-gray-600">
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="w-4 h-4 animate-spin text-blue-600" />
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
                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    `Enviar ${files.length} arquivo(s)`
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
