"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";

// Components UI
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons
import {
  RiImageLine,
  RiCloseLine,
  RiUploadCloud2Line,
  RiErrorWarningLine,
  RiCheckLine,
  RiYoutubeLine,
  RiLinkM,
  RiFilmLine,
  RiPlayCircleLine,
} from "react-icons/ri";

// Actions
import { uploadNewsMedia } from "@/app/actions/upload/news";

// Tipo exportado para consistência
export type MediaTypeOptions = "imagem" | "video_interno" | "video_externo";

interface MediaUploadProps {
  slug: string;
  // CORREÇÃO: Tipagem explícita para os 3 estados possíveis
  currentType: MediaTypeOptions;
  currentUrl: string | null;
  onMediaChange: (type: MediaTypeOptions, url: string | null) => void;
  disabled?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function MediaUpload({
  slug,
  currentType,
  currentUrl,
  onMediaChange,
  disabled = false,
}: MediaUploadProps) {
  // Lógica para definir qual aba iniciar aberta baseada no tipo atual
  const getInitialTab = () => {
    if (currentType === "video_externo") return "video_link";
    if (currentType === "video_interno") return "video_upload";
    return "imagem";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // Sincroniza a aba se o tipo mudar externamente
  useEffect(() => {
    setActiveTab(getInitialTab());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentType]);

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPERS ---

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL("image/jpeg", 0.7);
        resolve(url);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`
      : null;
  };

  // --- EFEITOS ---

  useEffect(() => {
    if (!currentUrl) {
      setPreviewUrl(null);
      return;
    }

    if (currentType === "imagem") {
      setPreviewUrl(currentUrl);
    } else if (currentType === "video_externo") {
      setPreviewUrl(getYouTubeThumbnail(currentUrl));
    } else {
      // Vídeo interno já salvo: não temos thumb fácil sem baixar o vídeo.
      setPreviewUrl(null);
    }
  }, [currentType, currentUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // --- HANDLERS ---

  const handleFileSelect = () => {
    if (!slug) {
      toast.error("Preencha o título da notícia primeiro.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleUpload = async (file: File, type: "imagem" | "video") => {
    setUploadState({ isUploading: true, error: null, progress: 10 });

    try {
      if (type === "imagem") {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      } else {
        const thumb = await generateVideoThumbnail(file);
        setPreviewUrl(thumb);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", slug);
      formData.append("mediaType", type);

      const progressInterval = setInterval(() => {
        setUploadState((prev) => ({
          ...prev,
          progress: prev.progress < 90 ? prev.progress + 10 : prev.progress,
        }));
      }, 300);

      const result = await uploadNewsMedia(formData);
      clearInterval(progressInterval);

      if (!result.success) throw new Error(result.error);

      setUploadState({ isUploading: false, progress: 100, error: null });

      onMediaChange(
        type === "imagem" ? "imagem" : "video_interno",
        result.data!.url,
      );

      toast.success(
        `${type === "imagem" ? "Imagem" : "Vídeo"} enviado com sucesso!`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setUploadState({ isUploading: false, progress: 0, error: msg });
      toast.error(msg);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (activeTab === "imagem") {
      if (!file.type.startsWith("image/")) {
        toast.error("Selecione um arquivo de imagem (JPG, PNG, WEBP).");
        return;
      }
      handleUpload(file, "imagem");
    } else if (activeTab === "video_upload") {
      if (!file.type.startsWith("video/")) {
        toast.error("Selecione um arquivo de vídeo (MP4, WebM).");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Vídeo muito grande. Máximo 100MB.");
        return;
      }
      handleUpload(file, "video");
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewUrl(getYouTubeThumbnail(url));
    onMediaChange("video_externo", url);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onMediaChange("imagem", null); // Reset para estado limpo (imagem null)
    setUploadState({ isUploading: false, progress: 0, error: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isUploaded = !!currentUrl && !uploadState.isUploading;

  return (
    <div className="w-full space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          if (
            (val === "imagem" && currentType !== "imagem") ||
            (val === "video_link" && currentType !== "video_externo") ||
            (val === "video_upload" && currentType !== "video_interno")
          ) {
            // Limpa o preview se trocar para uma aba que não corresponde ao dado salvo
            // Isso evita mostrar uma imagem enquanto está na aba de vídeo
            setPreviewUrl(null);
          }
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl mb-4">
          <TabsTrigger
            value="imagem"
            disabled={disabled}
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-pac-primary data-[state=active]:shadow-sm font-medium transition-all text-xs sm:text-sm"
          >
            <RiImageLine className="mr-2 h-4 w-4" /> Imagem
          </TabsTrigger>
          <TabsTrigger
            value="video_upload"
            disabled={disabled}
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-pac-primary data-[state=active]:shadow-sm font-medium transition-all text-xs sm:text-sm"
          >
            <RiUploadCloud2Line className="mr-2 h-4 w-4" /> Vídeo (Upload)
          </TabsTrigger>
          <TabsTrigger
            value="video_link"
            disabled={disabled}
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-pac-primary data-[state=active]:shadow-sm font-medium transition-all text-xs sm:text-sm"
          >
            <RiYoutubeLine className="mr-2 h-4 w-4" /> YouTube
          </TabsTrigger>
        </TabsList>

        {/* --- ÁREA DE UPLOAD (IMAGEM E VÍDEO INTERNO) --- */}
        {(activeTab === "imagem" || activeTab === "video_upload") && (
          <TabsContent
            value={activeTab}
            className="mt-0 animate-in fade-in zoom-in-95 duration-200"
          >
            {previewUrl || (currentUrl && activeTab === "video_upload") ? (
              // MODO VISUALIZAÇÃO
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm group">
                <div className="relative aspect-video flex items-center justify-center">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain opacity-90"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 p-8">
                      <RiFilmLine size={48} />
                      <span className="text-xs mt-2 font-medium">
                        Vídeo Armazenado
                      </span>
                    </div>
                  )}

                  {activeTab === "video_upload" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <RiPlayCircleLine className="w-16 h-16 text-white opacity-80 drop-shadow-lg" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 z-20">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-lg shadow-sm hover:scale-105 transition-transform"
                      onClick={handleRemove}
                      disabled={uploadState.isUploading}
                    >
                      <RiCloseLine className="h-4 w-4" />
                    </Button>
                  </div>

                  {isUploaded && (
                    <div className="absolute top-3 left-3 z-20">
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 pl-1.5 pr-2.5 shadow-md">
                        <RiCheckLine className="w-3.5 h-3.5" /> Salvo
                      </Badge>
                    </div>
                  )}
                </div>

                {uploadState.isUploading && (
                  <div className="p-4 border-t border-slate-700 bg-slate-800">
                    <div className="flex justify-between mb-1 text-xs font-bold text-slate-300">
                      <span>ENVIANDO...</span>
                      <span>{uploadState.progress}%</span>
                    </div>
                    <Progress
                      value={uploadState.progress}
                      className="h-1.5 bg-slate-600"
                    />
                  </div>
                )}
              </div>
            ) : (
              // MODO DROPZONE
              <div
                onClick={handleFileSelect}
                className={`
                  relative p-10 border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 group
                  ${!slug ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed" : "border-slate-300 bg-white hover:border-pac-primary/50 hover:bg-blue-50/50 hover:shadow-sm"}
                  ${disabled ? "pointer-events-none opacity-50" : ""}
                `}
              >
                <div className="p-4 bg-blue-50 text-pac-primary rounded-full group-hover:scale-110 transition-transform pointer-events-none">
                  {activeTab === "imagem" ? (
                    <RiImageLine size={32} />
                  ) : (
                    <RiUploadCloud2Line size={32} />
                  )}
                </div>

                <div className="pointer-events-none">
                  <p className="text-sm font-bold text-slate-700">
                    {!slug
                      ? "Preencha o título primeiro"
                      : `Clique para selecionar ${activeTab === "imagem" ? "a imagem" : "o vídeo"}`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeTab === "imagem"
                      ? "JPG, PNG, WEBP (Max 5MB)"
                      : "MP4, WebM (Max 100MB)"}
                  </p>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={
                activeTab === "imagem" ? "image/*" : "video/mp4,video/webm"
              }
              className="hidden"
            />
          </TabsContent>
        )}

        {/* --- ÁREA DE LINK (YOUTUBE) --- */}
        <TabsContent
          value="video_link"
          className="mt-0 space-y-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-purple-900 text-sm flex gap-3 items-start">
              <RiYoutubeLine className="w-5 h-5 mt-0.5 flex-shrink-0 text-purple-600" />
              <div>
                <p className="font-bold">Vídeo Externo</p>
                <p className="opacity-90 text-xs mt-1">
                  Cole o link do YouTube ou Vimeo. A capa será gerada
                  automaticamente.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="video-url"
                className="text-slate-700 font-bold text-xs uppercase tracking-wide ml-1"
              >
                URL do Vídeo
              </Label>
              <div className="relative">
                <RiLinkM className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="video-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="pl-10 h-12 border-slate-200 focus:ring-pac-primary rounded-xl text-base"
                  // CORREÇÃO: Evita undefined no value
                  value={
                    currentType === "video_externo" ? currentUrl || "" : ""
                  }
                  onChange={handleLinkChange}
                  disabled={!slug || disabled}
                />
              </div>
            </div>

            {previewUrl && (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-black shadow-md aspect-video animate-in slide-in-from-bottom-2">
                <Image
                  src={previewUrl}
                  alt="YouTube Thumbnail"
                  fill
                  className="object-cover opacity-90"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <RiYoutubeLine
                    size={64}
                    className="text-red-600 drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                  />
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-red-600 hover:bg-red-700 text-white border-0">
                    YouTube Detectado
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {uploadState.error && (
        <Alert className="bg-red-50 border-red-200 text-red-700 mt-2">
          <RiErrorWarningLine className="h-4 w-4" />
          <AlertDescription className="ml-2 font-medium">
            {uploadState.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
