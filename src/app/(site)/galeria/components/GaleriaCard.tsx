"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  RiImageLine,
  RiVideoLine,
  RiCalendarLine,
  RiImage2Line,
  RiEyeOffLine,
  RiPlayFill,
} from "react-icons/ri";
import { cn } from "@/lib/utils/cn";
import { Categoria } from "@/lib/stores/useGaleriaStore";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- FUNÇÕES AUXILIARES ---

const getYouTubeId = (url: string | null | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const isDirectVideoFile = (url: string | null | undefined) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url);
};

const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== "string" || url.trim() === "") return null;
  if (url.startsWith("http")) return url;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = "galerias";
  if (!supabaseUrl) return null;

  if (
    url.includes(bucket) ||
    url.includes("galeria-fotos") ||
    url.includes("galeria-videos")
  )
    return `${supabaseUrl}/storage/v1/object/public/${url}`;

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
};

// --- COMPONENTE ---

export function GaleriaCard({ categoria }: { categoria: Categoria }) {
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- LÓGICA MESTRA DE CAPA ---
  const urlParaCapa = useMemo(() => {
    if (categoria.capa_url) return categoria.capa_url;

    // @ts-expect-error: itens pode vir do join
    const itens = categoria.itens || categoria.galeria_itens;
    const primeiroItem = itens?.[0];

    if (primeiroItem) {
      const urlDoItem = primeiroItem.arquivo_url || primeiroItem.url;
      if (primeiroItem.tipo === "video") {
        return primeiroItem.thumbnail_url || urlDoItem;
      }
      return urlDoItem;
    }
    return null;
  }, [categoria]);

  // Identificação do Tipo de Mídia
  const youtubeId = getYouTubeId(urlParaCapa);
  const isDirectVideo = isDirectVideoFile(urlParaCapa);
  const fullUrl = getImageUrl(urlParaCapa);

  let displayUrl = fullUrl;
  if (youtubeId) {
    displayUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }

  const IconTipo = categoria.tipo === "videos" ? RiVideoLine : RiImageLine;
  const isPrivate = !categoria.status || categoria.arquivada;

  // Efeitos de Mouse (Play no Hover)
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
      variants={cardVariants}
      className="h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* LINK ENVOLVENDO O CARD INTEIRO */}
      <Link
        href={`/galeria/${categoria.slug}`}
        className="block h-full cursor-pointer group"
      >
        <Card className="h-full flex flex-col border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden rounded-2xl">
          {/* --- ÁREA DA CAPA --- */}
          <div className="relative h-56 bg-slate-100 overflow-hidden">
            {isDirectVideo && fullUrl ? (
              <div className="relative w-full h-full bg-black">
                <video
                  ref={videoRef}
                  src={`${fullUrl}#t=0.5`}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  // Pointer events none garante que o clique passe para o Link e não tente pausar o vídeo
                  style={{ pointerEvents: "none" }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <RiPlayFill className="h-6 w-6 text-white ml-0.5" />
                  </div>
                </div>
              </div>
            ) : displayUrl && !imageError ? (
              <Image
                src={displayUrl}
                alt={categoria.nome}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                <RiImage2Line className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Sem Capa
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

            <div className="absolute top-3 left-3 z-10">
              <Badge
                className={cn(
                  "backdrop-blur-md border-0 text-white shadow-sm px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold",
                  categoria.tipo === "videos"
                    ? "bg-purple-600/90"
                    : "bg-pac-primary/90",
                )}
              >
                <IconTipo className="w-3.5 h-3.5 mr-1.5" />
                {categoria.tipo === "videos" ? "Vídeo" : "Fotos"}
              </Badge>
            </div>

            {isPrivate && (
              <div className="absolute top-3 right-3 z-10">
                <Badge
                  variant="destructive"
                  className="text-[10px] uppercase tracking-wider"
                >
                  <RiEyeOffLine className="w-3 h-3 mr-1" /> Privado
                </Badge>
              </div>
            )}
          </div>

          {/* --- HEADER --- */}
          <CardHeader className="px-6 pt-5 pb-2">
            <div className="flex items-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              <RiCalendarLine className="w-3.5 h-3.5 mr-1.5 text-pac-primary" />
              {new Date(categoria.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
            <h3 className="text-lg font-black text-slate-800 leading-tight line-clamp-2 group-hover:text-pac-primary transition-colors uppercase tracking-tight">
              {categoria.nome}
            </h3>
          </CardHeader>

          {/* --- CONTENT --- */}
          <CardContent className="px-6 py-2 pb-6 flex-grow">
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {categoria.descricao ||
                "Confira os registros oficiais desta operação."}
            </p>
          </CardContent>

          {/* FOOTER REMOVIDO: O card inteiro agora é o botão */}
        </Card>
      </Link>
    </motion.div>
  );
}
