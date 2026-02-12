"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RiStarFill,
  RiPlayFill,
  RiImageLine,
  RiCalendarLine,
  RiYoutubeFill,
  RiFileVideoLine,
} from "react-icons/ri";
import { GaleriaItem } from "@/lib/stores/useGaleriaStore";
import { cn } from "@/lib/utils/cn";

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

const getYouTubeId = (url: string | null | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const isDirectVideoFile = (url: string | null | undefined) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
};

const getFullUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  const path = cleanUrl.includes("galeria/") ? cleanUrl : `galeria/${cleanUrl}`;
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
};

export function GaleriaItemCard({ item }: { item: GaleriaItem }) {
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const youtubeId = getYouTubeId(item.url);
  const isDirectVideo = isDirectVideoFile(item.url);
  const isVideoType = item.tipo === "video" || !!youtubeId || isDirectVideo;
  const fullUrl = getFullUrl(item.url);

  let linkDestino = fullUrl || "#";

  if (!youtubeId && fullUrl) {
    const encodedUrl = encodeURIComponent(fullUrl);
    const mediaType = isVideoType ? "video" : "foto";
    linkDestino = `/galeria/visualizar?url=${encodedUrl}&type=${mediaType}`;
  }

  let thumbnailUrl: string | null = null;
  if (youtubeId) {
    thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  } else if (item.thumbnail_url) {
    thumbnailUrl = getFullUrl(item.thumbnail_url);
  } else if (!isVideoType) {
    thumbnailUrl = fullUrl;
  }

  const IconType = youtubeId
    ? RiYoutubeFill
    : isDirectVideo
      ? RiFileVideoLine
      : RiImageLine;
  const typeLabel = youtubeId ? "YouTube" : isDirectVideo ? "Vídeo" : "Foto";

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
      <Link
        href={linkDestino}
        target="_blank"
        className={cn(
          "block h-full cursor-pointer group",
          !fullUrl && "pointer-events-none cursor-default",
        )}
      >
        <Card className="h-full flex flex-col border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden rounded-2xl">
          <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
            {/* VÍDEO LOCAL (PREVIEW) */}
            {isDirectVideo && !item.thumbnail_url && fullUrl ? (
              <div className="relative w-full h-full bg-black">
                <video
                  ref={videoRef}
                  src={`${fullUrl}#t=0.5`}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  loop={true}
                  preload="metadata"
                  style={{ pointerEvents: "none" }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                {/* Ícone Play Centralizado - SOME NO HOVER */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30">
                    <RiPlayFill className="h-6 w-6 text-white ml-0.5" />
                  </div>
                </div>
              </div>
            ) : /* FOTO OU THUMBNAIL */
            thumbnailUrl && !imageError ? (
              <>
                <Image
                  src={thumbnailUrl}
                  alt={item.titulo || "Mídia da galeria"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {(youtubeId || isDirectVideo) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30">
                      <RiPlayFill className="h-6 w-6 text-white ml-0.5" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                <IconType className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  {isVideoType ? "Vídeo sem Capa" : "Imagem Indisponível"}
                </span>
              </div>
            )}

            {item.destaque && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-amber-500 text-white border-0 shadow-md px-2 py-1 uppercase tracking-wider text-[10px] font-bold gap-1">
                  <RiStarFill className="w-3 h-3" /> Destaque
                </Badge>
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

          <CardContent className="p-5 pb-6 flex-grow flex flex-col">
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
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                {item.descricao}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
