"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RiStarFill,
  RiPlayFill,
  // RiVideoLine removido pois não estava sendo usado
  RiImageLine,
  RiCalendarLine,
  RiEyeLine,
  RiDownloadLine,
  RiYoutubeFill,
  RiFileVideoLine,
} from "react-icons/ri";
import { GaleriaItem } from "@/lib/stores/useGaleriaStore";
import { cn } from "@/lib/utils/cn";

// --- FUNÇÕES AUXILIARES ---

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "--/--/----";
  }
};

// Detecta se é YouTube
const getYouTubeId = (url: string | null | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Detecta se é um arquivo de vídeo direto (MP4, WEBM, OGG, MOV)
const isDirectVideoFile = (url: string | null | undefined) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
};

// Gera a URL completa (Supabase ou Externa)
const getFullUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  const path = cleanUrl.includes("galeria/") ? cleanUrl : `galeria/${cleanUrl}`;
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
};

// --- COMPONENTE ---

export function GaleriaItemCard({ item }: { item: GaleriaItem }) {
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Identificação do Tipo de Mídia
  const youtubeId = getYouTubeId(item.url);
  const isDirectVideo = isDirectVideoFile(item.url);
  // Usa !! para garantir booleano
  const isVideoType = item.tipo === "video" || !!youtubeId || isDirectVideo;

  // 2. Definição da Fonte da Mídia
  const fullUrl = getFullUrl(item.url);

  // URL da Thumbnail (prioridade: Youtube Thumb > Storage Thumb > Null)
  let thumbnailUrl: string | null = null;

  if (youtubeId) {
    thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  } else if (item.thumbnail_url) {
    thumbnailUrl = getFullUrl(item.thumbnail_url);
  } else if (!isVideoType) {
    // Se for foto, a própria foto é a thumbnail
    thumbnailUrl = fullUrl;
  }

  // 3. Controle de Ícones e Labels
  const IconType = youtubeId
    ? RiYoutubeFill
    : isDirectVideo
      ? RiFileVideoLine
      : RiImageLine;

  const typeLabel = youtubeId ? "YouTube" : isDirectVideo ? "Vídeo" : "Foto";

  // 4. Efeitos de Mouse para Vídeo Local
  const handleMouseEnter = () => {
    if (isDirectVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (isDirectVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="group h-full flex flex-col border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden rounded-2xl">
        {/* --- ÁREA VISUAL (Capa ou Vídeo) --- */}
        <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
          {/* CENÁRIO A: VÍDEO MP4 DIRETO (Sem thumbnail manual) */}
          {isDirectVideo && !item.thumbnail_url && fullUrl ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={`${fullUrl}#t=0.5`}
                className="w-full h-full object-cover"
                muted
                playsInline
                loop={true}
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>
          ) : /* CENÁRIO B: FOTO OU YOUTUBE */
          thumbnailUrl && !imageError ? (
            <Image
              src={thumbnailUrl}
              alt={item.titulo || "Mídia da galeria"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            /* CENÁRIO C: FALLBACK */
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
              <IconType className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                {isVideoType ? "Vídeo sem Capa" : "Imagem Indisponível"}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {item.destaque && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-amber-500 text-white border-0 shadow-md px-2 py-1 uppercase tracking-wider text-[10px] font-bold gap-1">
                <RiStarFill className="w-3 h-3" /> Destaque
              </Badge>
            </div>
          )}

          {isVideoType && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300">
                <RiPlayFill className="h-6 w-6 text-white ml-0.5" />
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3 z-10">
            <Badge
              className={cn(
                "backdrop-blur-md border-0 text-white shadow-sm px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold gap-1.5",
                youtubeId
                  ? "bg-red-600/90"
                  : isDirectVideo
                    ? "bg-purple-600/90"
                    : "bg-pac-primary/90",
              )}
            >
              <IconType className="w-3.5 h-3.5" />
              {typeLabel}
            </Badge>
          </div>
        </div>

        {/* --- CONTEÚDO DE TEXTO --- */}
        <CardContent className="p-5 flex-grow flex flex-col">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <RiCalendarLine className="w-3.5 h-3.5 text-pac-primary" />
            {formatDate(item.created_at)}
          </div>
          {item.titulo && (
            <h3 className="font-black text-lg text-slate-800 mb-2 leading-tight line-clamp-2 group-hover:text-pac-primary transition-colors uppercase tracking-tight">
              {item.titulo}
            </h3>
          )}
          {item.descricao && (
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
              {item.descricao}
            </p>
          )}
        </CardContent>

        {/* --- RODAPÉ --- */}
        <CardFooter className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-200 text-slate-600 font-bold hover:bg-pac-primary hover:text-white hover:border-pac-primary transition-all duration-300 rounded-xl"
            asChild
            disabled={!fullUrl}
          >
            <a href={fullUrl || "#"} target="_blank" rel="noopener noreferrer">
              <RiEyeLine className="mr-2 w-4 h-4" /> Ver
            </a>
          </Button>

          {!youtubeId && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all duration-300 rounded-xl"
              asChild
              disabled={!fullUrl}
            >
              <a
                href={fullUrl || "#"}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <RiDownloadLine className="mr-2 w-4 h-4" /> Baixar
              </a>
            </Button>
          )}

          {youtubeId && <div className="hidden" />}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
