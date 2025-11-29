"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUploadLine,
  RiCloseLine,
  RiFileLine,
  RiImageLine,
  RiVideoLine,
  RiUserLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiLoaderLine,
  RiDeleteBinLine,
} from "react-icons/ri";

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
  type?: UploadType;
  bucket?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  onUploadComplete?: (urls: string[]) => void;
  onFileChange?: (url: string) => void;
  currentFile?: string;
  accept?: string;
  className?: string;
  userId?: string;
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
  currentFile,
  accept,
  className,
  userId,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(currentFile || "");

  const supabase = createAdminClient();

  const config = {
    ...UPLOAD_CONFIGS[type],
    bucket: bucket || UPLOAD_CONFIGS[type].bucket,
    multiple: multiple ?? UPLOAD_CONFIGS[type].multiple,
    maxFiles: maxFiles ?? UPLOAD_CONFIGS[type].maxFiles,
    maxSize: maxSize ?? UPLOAD_CONFIGS[type].maxSize,
    accept: accept ?? UPLOAD_CONFIGS[type].accept,
  };

  const shouldUseSingleMode = !config.multiple;

  useEffect(() => {
    if (currentFile !== currentAvatarUrl) {
      setCurrentAvatarUrl(currentFile || "");
    }
  }, [currentFile, currentAvatarUrl]);

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
    async (file: File) => {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `avatar_${userId || "user"}_${Date.now()}.${fileExt}`;

      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: "uploading", progress: 0 } : f
          )
        );

        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, progress: Math.min(f.progress + 20, 90) }
                : f
            )
          );
        }, 200);

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

        setFiles((prev) =>
          prev.map((f) => (f.file === file ? { ...f, progress: 100 } : f))
        );

        const {
          data: { publicUrl },
        } = supabase.storage.from(config.bucket).getPublicUrl(data!.path);

        setFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: "completed", url: publicUrl } : f
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
        toast.error("Erro ao fazer upload", {
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

        if (type === "avatar") {
          uploadFileAutomatically(file);
        }
      } else {
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
      onFileChange?.("");
    }
  };

  const clearFiles = () => {
    setFiles([]);
    if (shouldUseSingleMode) {
      setCurrentAvatarUrl("");
      onFileChange?.("");
    }
  };

  const uploadFile = async (
    file: UploadFile,
    index: number
  ): Promise<string> => {
    const fileExt = file.file.name.split(".").pop()?.toLowerCase() || "jpg";
    let fileName = "";

    switch (type) {
      case "avatar":
        fileName = `avatar_${userId || "user"}_${Date.now()}.${fileExt}`;
        break;
      case "image":
        fileName = `noticia_${Date.now()}.${fileExt}`;
        break;
      case "video":
        fileName = `video_${Date.now()}.${fileExt}`;
        break;
      default:
        fileName = `${Math.random()
          .toString(36)
          .substring(2)}_${Date.now()}.${fileExt}`;
    }

    setFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, status: "uploading", progress: 0 } : f
      )
    );

    const progressInterval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
        )
      );
    }, 200);

    try {
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

      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, progress: 100 } : f))
      );

      const {
        data: { publicUrl },
      } = supabase.storage.from(config.bucket).getPublicUrl(data!.path);

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "completed", url: publicUrl } : f
        )
      );

      if (shouldUseSingleMode) {
        onFileChange?.(publicUrl);
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
            toast.loading(
              `Enviando arquivos... (${successCount + errorCount}/${
                files.length
              })`,
              { id: loadingToastId }
            );
          } catch (error) {
            console.error(`Erro ao fazer upload do arquivo ${i}:`, error);
            errorCount++;
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

      toast.dismiss(loadingToastId);

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
      toast.dismiss(loadingToastId);
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
      return <RiImageLine className="w-4 h-4 text-blue-600" />;
    if (file.type.startsWith("video/"))
      return <RiVideoLine className="w-4 h-4 text-purple-600" />;
    return <RiFileLine className="w-4 h-4 text-gray-600" />;
  };

  const getStatusIcon = (file: UploadFile) => {
    switch (file.status) {
      case "completed":
        return <RiCheckLine className="w-4 h-4 text-green-600" />;
      case "error":
        return <RiErrorWarningLine className="w-4 h-4 text-red-600" />;
      case "uploading":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <RiLoaderLine className="w-4 h-4 text-blue-600" />
          </motion.div>
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

  // Renderização para Avatar
  if (type === "avatar") {
    const currentUploadFile = files[0];
    const displayUrl = currentUploadFile?.url || currentAvatarUrl || "";
    const displayStatus =
      currentUploadFile?.status || (currentAvatarUrl ? "completed" : "pending");

    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-gray-200 shadow-lg">
            <AvatarImage
              src={displayUrl || undefined}
              alt="Avatar do agente"
              className="transition-opacity duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <AvatarFallback className="bg-gradient-to-br from-navy-600 to-navy-800 text-white text-lg font-semibold">
              <RiUserLine className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>

          <AnimatePresence>
            {(displayStatus === "uploading" || displayStatus === "pending") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
              >
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
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <RiLoaderLine className="w-6 h-6 mx-auto" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {displayStatus === "completed" && currentUploadFile && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg"
            >
              <RiCheckLine className="w-3 h-3 text-white" />
            </motion.div>
          )}
          {displayStatus === "error" && currentUploadFile && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 shadow-lg"
            >
              <RiErrorWarningLine className="w-3 h-3 text-white" />
            </motion.div>
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="border-navy-600 text-navy-600 hover:bg-navy-600 hover:text-white transition-colors duration-300"
              >
                {isUploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <RiLoaderLine className="w-4 h-4 mr-2" />
                  </motion.div>
                ) : (
                  <RiUploadLine className="w-4 h-4 mr-2" />
                )}
                {isUploading
                  ? "Enviando..."
                  : displayUrl
                  ? "Alterar Foto"
                  : "Adicionar Foto"}
              </Button>
            </motion.div>

            {displayUrl && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFiles}
                  disabled={isUploading}
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-300"
                >
                  <RiDeleteBinLine className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </motion.div>
            )}
          </div>

          {currentUploadFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1"
            >
              <div className="flex justify-between text-xs text-gray-600">
                <span className="truncate max-w-[120px]">
                  {currentUploadFile.file.name}
                </span>
                <span>{formatFileSize(currentUploadFile.file.size)}</span>
              </div>
              {currentUploadFile.status === "uploading" && (
                <Progress
                  value={currentUploadFile.progress}
                  className="h-1.5 bg-gray-200 transition-all duration-300"
                />
              )}
              {currentUploadFile.error && (
                <p className="text-xs text-red-600 font-medium">
                  {currentUploadFile.error}
                </p>
              )}
            </motion.div>
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
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          className={cn(
            "border-2 border-dashed transition-all duration-300 cursor-pointer",
            "hover:shadow-lg backdrop-blur-sm",
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
              <motion.div
                animate={hasFiles ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className={cn(
                    "p-3 rounded-full inline-flex transition-all duration-300",
                    hasFiles
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  <RiUploadLine className="w-6 h-6" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    className="mb-2 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Selecione os arquivos
                  </Button>
                </motion.div>
                <p className="text-sm text-gray-600">ou arraste e solte aqui</p>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <strong>Tipos permitidos:</strong> {config.accept}
                </p>
                <p>
                  <strong>Tamanho máximo:</strong>{" "}
                  {config.maxSize / 1024 / 1024}MB por arquivo
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
      </motion.div>

      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
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
                        "bg-green-100 text-green-800",
                      "transition-colors duration-300"
                    )}
                  >
                    {completedFiles}/{totalFiles} concluídos
                  </Badge>
                )}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFiles}
                    disabled={isUploading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-300"
                  >
                    <RiDeleteBinLine className="w-4 h-4 mr-1" />
                    Limpar todos
                  </Button>
                </motion.div>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    layout
                  >
                    <Card
                      className={cn(
                        "p-4 transition-all duration-300 border hover:shadow-md",
                        file.status === "error" && "border-red-200 bg-red-50",
                        file.status === "completed" &&
                          "border-green-200 bg-green-50",
                        file.status === "uploading" &&
                          "border-blue-200 bg-blue-50"
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
                                "h-2 transition-all duration-300",
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
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={isUploading}
                            className="flex-shrink-0 ml-2 text-gray-400 hover:text-red-600 transition-colors duration-300"
                          >
                            <RiCloseLine className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {(config.multiple || files.length > 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between pt-4 border-t border-gray-200"
              >
                <div className="text-sm text-gray-600">
                  {isUploading ? (
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <RiLoaderLine className="w-4 h-4 text-blue-600" />
                      </motion.div>
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={clearFiles}
                      disabled={isUploading}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                    >
                      Cancelar
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={uploadAll}
                      disabled={!canUpload}
                      className={cn(
                        "bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300",
                        !canUpload && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isUploading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <RiLoaderLine className="w-4 h-4 mr-2" />
                          </motion.div>
                          Enviando...
                        </>
                      ) : (
                        `Enviar ${files.length} arquivo(s)`
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
