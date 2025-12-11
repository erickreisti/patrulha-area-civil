"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Progress } from "./progress";
import { Badge } from "./badge";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/utils/utils";
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

type UploadType = "avatar" | "image" | "video" | "file" | "media";
type UploadStatus = "pending" | "uploading" | "completed" | "error";

interface UploadFile {
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  url?: string;
  preview?: string;
}

interface FileUploadProps {
  type?: UploadType;
  bucket?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  onUploadComplete?: (urls: string[]) => void;
  onFileChange?: (url: string | null) => void;
  onFileSelected?: (file: File | null) => void;
  currentFile?: string;
  accept?: string;
  className?: string;
  userId?: string;
  autoUpload?: boolean;
}

const UPLOAD_CONFIGS = {
  avatar: {
    bucket: "avatares-agentes",
    multiple: false,
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
    accept: "image/*" as const,
  },
  image: {
    bucket: "imagens-noticias",
    multiple: false,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: "image/*" as const,
  },
  video: {
    bucket: "galeria-videos",
    multiple: false,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    accept: "video/*" as const,
  },
  file: {
    bucket: "documentos-oficiais",
    multiple: true,
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    accept: "*/*" as const,
  },
  media: {
    bucket: "galeria-fotos",
    multiple: true,
    maxFiles: 20,
    maxSize: 5 * 1024 * 1024,
    accept: "image/*,video/*" as const,
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
  onFileSelected,
  currentFile,
  accept,
  className,
  userId,
  autoUpload = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(currentFile || "");

  const uploadFileToAPI = useCallback(
    async (file: File, uploadType: UploadType): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint =
        uploadType === "avatar" ? "/api/upload/avatar" : "/api/upload/general";

      if (uploadType === "avatar" && userId) {
        formData.append("userId", userId);
      }

      if (uploadType !== "avatar") {
        formData.append("type", uploadType);
        if (bucket) {
          formData.append("bucket", bucket);
        }
      }

      console.log(`🔄 Enviando ${uploadType} para API...`, {
        endpoint,
        fileName: file.name,
        size: file.size,
        type: file.type,
      });

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Upload falhou com status ${response.status}`
        );
      }

      const result = await response.json();
      console.log("✅ Upload via API bem-sucedido:", result.url);
      return result.url;
    },
    [bucket, userId]
  );

  const createLocalPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        resolve("");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          resolve("");
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsDataURL(file);
    });
  };

  const config = {
    ...UPLOAD_CONFIGS[type],
    bucket: bucket || UPLOAD_CONFIGS[type].bucket,
    multiple: multiple ?? UPLOAD_CONFIGS[type].multiple,
    maxFiles: maxFiles ?? UPLOAD_CONFIGS[type].maxFiles,
    maxSize: maxSize ?? UPLOAD_CONFIGS[type].maxSize,
    accept: accept ?? UPLOAD_CONFIGS[type].accept,
  };

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

  const uploadFileAutomatically = useCallback(
    async (uploadFile: UploadFile) => {
      setIsUploading(true);

      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadFile.file
              ? { ...f, status: "uploading", progress: 0 }
              : f
          )
        );

        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === uploadFile.file
                ? { ...f, progress: Math.min(f.progress + 20, 90) }
                : f
            )
          );
        }, 200);

        const publicUrl = await uploadFileToAPI(uploadFile.file, type);

        clearInterval(progressInterval);

        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadFile.file ? { ...f, progress: 100 } : f
          )
        );

        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadFile.file
              ? { ...f, status: "completed", url: publicUrl }
              : f
          )
        );

        setCurrentAvatarUrl(publicUrl);
        if (onFileChange) {
          onFileChange(publicUrl);
        }

        toast.success("Upload realizado com sucesso!");
      } catch (error: unknown) {
        console.error("❌ Erro no upload:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro desconhecido no upload";

        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadFile.file
              ? {
                  ...f,
                  status: "error",
                  error: errorMessage,
                  progress: 0,
                }
              : f
          )
        );
        toast.error("Erro ao fazer upload", {
          description: errorMessage,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [type, onFileChange, uploadFileToAPI]
  );

  const handleFileProcessing = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error("Erro de validação", { description: error });
        return null;
      }

      let preview = "";
      try {
        preview = await createLocalPreview(file);
      } catch {
        preview = "";
      }

      const uploadFile: UploadFile = {
        file,
        progress: 0,
        status: "pending",
        preview,
      };

      if (autoUpload && type === "avatar") {
        await uploadFileAutomatically(uploadFile);
      }

      return uploadFile;
    },
    [autoUpload, type, validateFile, uploadFileAutomatically]
  );

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      if (shouldUseSingleMode) {
        const file = newFiles[0];

        const uploadFile = await handleFileProcessing(file);
        if (!uploadFile) return;

        setFiles([uploadFile]);

        if (onFileSelected) {
          onFileSelected(file);
        }

        if (autoUpload && type === "avatar") {
          await uploadFileAutomatically(uploadFile);
        }
      } else {
        const validatedFiles: UploadFile[] = [];

        for (const file of newFiles) {
          if (files.length + validatedFiles.length >= config.maxFiles) {
            toast.error("Limite de arquivos", {
              description: `Máximo de ${config.maxFiles} arquivos permitido.`,
            });
            break;
          }

          const uploadFile = await handleFileProcessing(file);
          if (uploadFile) {
            validatedFiles.push(uploadFile);
          }
        }

        if (validatedFiles.length > 0) {
          setFiles((prev) => [...prev, ...validatedFiles]);

          if (onFileSelected && validatedFiles.length === 1) {
            onFileSelected(validatedFiles[0].file);
          }
        }
      }
    },
    [
      shouldUseSingleMode,
      files.length,
      config.maxFiles,
      autoUpload,
      type,
      uploadFileAutomatically,
      handleFileProcessing,
      onFileSelected,
    ]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
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
      onFileChange?.(null);
      onFileSelected?.(null);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    if (shouldUseSingleMode) {
      setCurrentAvatarUrl("");
      onFileChange?.(null);
      onFileSelected?.(null);
    }
  };

  const uploadManually = async (): Promise<string[]> => {
    setIsUploading(true);
    const urls: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.status === "pending" || file.status === "error") {
          try {
            setFiles((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, status: "uploading", progress: 0 } : f
              )
            );

            const progressInterval = setInterval(() => {
              setFiles((prev) =>
                prev.map((f, idx) =>
                  idx === i
                    ? { ...f, progress: Math.min(f.progress + 10, 90) }
                    : f
                )
              );
            }, 200);

            const publicUrl = await uploadFileToAPI(file.file, type);

            clearInterval(progressInterval);

            setFiles((prev) =>
              prev.map((f, idx) => (idx === i ? { ...f, progress: 100 } : f))
            );

            setFiles((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, status: "completed", url: publicUrl } : f
              )
            );

            urls.push(publicUrl);
            successCount++;

            if (shouldUseSingleMode) {
              onFileChange?.(publicUrl);
              setCurrentAvatarUrl(publicUrl);
            }
          } catch (error) {
            console.error(`Erro ao fazer upload do arquivo ${i}:`, error);
            errorCount++;
          }
        } else if (file.status === "completed" && file.url) {
          urls.push(file.url);
          successCount++;
        }
      }

      if (urls.length > 0) {
        onUploadComplete?.(urls);

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
      toast.error("Erro no processo de upload", {
        description: "Ocorreu um erro durante o upload dos arquivos.",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

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

  if (type === "avatar") {
    const currentUploadFile = files[0];

    const displayUrl =
      currentUploadFile?.preview ||
      currentUploadFile?.url ||
      currentAvatarUrl ||
      "";

    const hasCurrentFile = !!displayUrl;
    const isUploading = currentUploadFile?.status === "uploading";
    const isPending = currentUploadFile?.status === "pending";
    const hasError = currentUploadFile?.status === "error";
    const isCompleted = currentUploadFile?.status === "completed";

    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-gray-200">
            <AvatarImage
              src={displayUrl || undefined}
              alt="Avatar do agente"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <AvatarFallback className="bg-navy text-white text-lg font-semibold">
              <FaUser className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="text-center text-white">
                {currentUploadFile && (
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
              </div>
            </div>
          )}

          {currentUploadFile && (
            <>
              {isCompleted && !autoUpload && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <span className="text-xs text-white">!</span>
                </div>
              )}
              {isCompleted && autoUpload && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                  <FaCheck className="w-3 h-3 text-white" />
                </div>
              )}
              {hasError && (
                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                  <FaExclamationCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </>
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
                : hasCurrentFile
                ? "Alterar Foto"
                : "Selecionar Foto"}
            </Button>

            {hasCurrentFile && (
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

          {currentUploadFile && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="truncate max-w-[120px]">
                  {currentUploadFile.file.name}
                </span>
                <span>{formatFileSize(currentUploadFile.file.size)}</span>
              </div>
              {isUploading && (
                <Progress
                  value={currentUploadFile.progress}
                  className="h-1.5 bg-gray-200"
                />
              )}
              {!autoUpload && isPending && (
                <p className="text-xs text-yellow-600 font-medium">
                  ⚠️ Foto selecionada - será enviada ao salvar
                </p>
              )}
              {hasError && currentUploadFile.error && (
                <p className="text-xs text-red-600 font-medium">
                  {currentUploadFile.error}
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500">
            JPG, PNG ou WEBP. Máximo {config.maxSize / 1024 / 1024}MB.
            {!autoUpload && " (Upload ao salvar)"}
          </p>
        </div>
      </div>
    );
  }

  const hasFiles = files.length > 0;
  const completedFiles = files.filter((f) => f.status === "completed").length;
  const totalFiles = files.length;
  const canUpload =
    hasFiles &&
    !isUploading &&
    files.some((f) => f.status === "pending" || f.status === "error");

  return (
    <div className={cn("space-y-4", className)}>
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
              {!autoUpload && (
                <p className="text-blue-600 font-medium">
                  ⚠️ Upload será feito ao salvar
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
                      {!autoUpload && file.status === "pending" && (
                        <p className="text-xs text-yellow-600 font-medium">
                          ⚠️ Aguardando upload manual
                        </p>
                      )}
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

          {(config.multiple || files.length > 0) && autoUpload && (
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
                  onClick={uploadManually}
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
