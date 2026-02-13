"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  RiArrowRightLine,
  RiNewspaperLine,
  RiVideoLine,
  RiPlayCircleLine,
  RiYoutubeLine,
  RiImageLine,
} from "react-icons/ri";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Store & Types
import { useNoticiasBasico } from "@/lib/stores/useNoticiasStore";
import { cn } from "@/lib/utils/cn";
import type { NoticiaLista } from "@/app/actions/news/noticias";

// --- TIPOS ---

interface NewsCardProps {
  noticia: NoticiaLista;
  index: number;
}

// --- VARIANTES DE ANIMAÇÃO ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// --- HELPERS ---

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// --- SUB-COMPONENTES ---

const SectionHeader = () => (
  <div className="text-center mb-16 space-y-4">
    <div className="flex items-center justify-center gap-4 mb-2">
      <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/30" />
      <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
        Informativo Oficial
      </span>
      <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/30" />
    </div>

    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight">
      Últimas <span className="text-pac-primary">Notícias</span>
    </h2>

    <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed">
      Acompanhe as ações, eventos e comunicados oficiais da Patrulha Aérea Civil
      em tempo real.
    </p>
  </div>
);

// SKELETON (Estilo Gallery)
function SkeletonCard() {
  return (
    <Card className="border-0 bg-white rounded-2xl overflow-hidden h-full flex flex-col shadow-sm">
      <div className="h-56 bg-slate-100 animate-pulse" />
      <div className="p-5 space-y-3 flex-1">
        <div className="h-6 bg-slate-100 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
        <div className="pt-4 mt-auto">
          <div className="h-9 bg-slate-100 rounded-lg w-full animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

// NEWS CARD (Design estilo Gallery + Lógica de Vídeo News)
function NewsCard({ noticia }: NewsCardProps) {
  const [imgError, setImgError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = "imagens-noticias";
    if (url.includes(bucket))
      return `${supabaseUrl}/storage/v1/object/public/${url}`;
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
  };

  // --- LÓGICA DE DETECÇÃO DE MÍDIA ---
  const isVideo = noticia.tipo_media === "video";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoUrlExternal = (noticia as any).video_url as string | null;
  const isYouTube = isVideo && !!videoUrlExternal;
  const isInternalVideo = isVideo && !videoUrlExternal && !!noticia.media_url;

  let displayUrl: string | null = null;
  let mediaType: "image" | "youtube" | "video_internal" | "none" = "image";

  if (isYouTube && videoUrlExternal) {
    const ytId = getYouTubeId(videoUrlExternal);
    if (ytId) {
      displayUrl = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
      mediaType = "youtube";
    }
  } else if (isInternalVideo && noticia.media_url) {
    displayUrl = getImageUrl(noticia.media_url);
    mediaType = "video_internal";
  } else if (noticia.media_url || noticia.thumbnail_url) {
    displayUrl = getImageUrl(noticia.thumbnail_url || noticia.media_url);
    mediaType = "image";
  } else {
    mediaType = "none";
  }

  const shouldShowMedia = mediaType !== "none" && !imgError;

  // --- HANDLERS ---
  const handleMouseEnter = () => {
    if (mediaType === "video_internal" && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  const handleMouseLeave = () => {
    if (mediaType === "video_internal" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div variants={cardVariants} className="h-full">
      <Link
        href={`/noticias/${noticia.slug}`}
        className="block h-full group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Card className="border-0 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1 rounded-2xl">
          {/* --- CAPA --- */}
          <div className="h-56 relative overflow-hidden bg-slate-100">
            {shouldShowMedia ? (
              <>
                {mediaType === "video_internal" ? (
                  <div className="w-full h-full relative bg-black">
                    <video
                      ref={videoRef}
                      src={displayUrl!}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                      <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full border border-white/50 shadow-lg">
                        <RiPlayCircleLine className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image
                      src={displayUrl!}
                      alt={noticia.titulo}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={() => setImgError(true)}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {mediaType === "youtube" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <div className="bg-red-600/90 p-3 rounded-full shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <RiPlayCircleLine className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                    {mediaType !== "youtube" && (
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                <RiNewspaperLine className="w-12 h-12 opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
                  Sem Imagem
                </span>
              </div>
            )}

            {/* --- BADGES (Posicionamento igual ao Gallery) --- */}

            {/* Badge Categoria (Top Right) */}
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-white/90 text-slate-900 backdrop-blur-md border-0 shadow-sm font-bold uppercase tracking-wider text-[10px] hover:bg-white">
                {noticia.categoria || "Geral"}
              </Badge>
            </div>

            {/* Badge Destaque (Top Left) */}
            {noticia.destaque && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-amber-500 text-white border-0 text-[10px] font-bold shadow-sm uppercase tracking-wider">
                  Destaque
                </Badge>
              </div>
            )}

            {/* Badge Data (Bottom Left) */}
            <div className="absolute bottom-4 left-4 z-10">
              <span className="text-white text-xs font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                {formatDate(noticia.data_publicacao)}
              </span>
            </div>

            {/* Badge Tipo Mídia (Bottom Right) */}
            {isVideo && (
              <div className="absolute bottom-4 right-4 z-10">
                <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white shadow-sm">
                  {mediaType === "youtube" ? (
                    <RiYoutubeLine size={16} />
                  ) : (
                    <RiVideoLine size={16} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* --- CONTEÚDO --- */}
          <div className="p-6 flex-1 flex flex-col bg-white">
            <div className="flex-1 mb-4">
              <h3 className="font-bold text-lg text-slate-800 leading-snug mb-2 group-hover:text-pac-primary transition-colors line-clamp-2">
                {noticia.titulo}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                {noticia.resumo ||
                  "Clique para conferir os detalhes completos desta notícia."}
              </p>
            </div>

            {/* Footer do Card */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-pac-primary transition-colors">
                Ler Matéria
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-pac-primary group-hover:text-white transition-all">
                <RiArrowRightLine className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export function NewsSection() {
  const { noticias, loading, setFilters, setPagination, fetchNoticias } =
    useNoticiasBasico();

  useEffect(() => {
    setFilters({
      search: "",
      categoria: "all",
      status: "publicado",
      destaque: "all",
      tipo_media: "all",
      sortBy: "recent",
      sortOrder: "desc",
    });

    if (setPagination) {
      setPagination({
        page: 1,
        limit: 3,
        total: 0,
        totalPages: 1,
      });
    }

    fetchNoticias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestNews = noticias ? noticias.slice(0, 3) : [];

  return (
    <section className="w-full bg-white py-20 lg:py-32 relative overflow-hidden border-t border-slate-100">
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader />

        {/* Grid de Notícias */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            // Conteúdo Real (Anima quando entra)
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {latestNews.map((noticia: NoticiaLista, index: number) => (
                <NewsCard key={noticia.id} noticia={noticia} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <RiNewspaperLine className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-800 font-bold text-xl mb-2">
                Sem Atualizações
              </h3>
              <p className="text-slate-500 text-sm">
                Não há notícias publicadas no momento.
              </p>
            </motion.div>
          )}
        </div>

        {/* Botão Ver Todas */}
        {latestNews.length > 0 && !loading && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button
              asChild
              size="lg"
              className={cn(
                "bg-pac-primary hover:bg-pac-primary-dark text-white rounded-full px-10 h-14",
                "shadow-lg hover:shadow-pac-primary/30 transition-all font-bold tracking-wide text-base group",
              )}
            >
              <Link
                href="/noticias"
                className="flex items-center justify-center gap-3"
              >
                <RiImageLine className="w-5 h-5" />
                Portal de Notícias
                <RiArrowRightLine className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
