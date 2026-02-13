"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  RiCalendarLine,
  RiArrowRightLine,
  RiTimeLine,
  RiNewspaperLine,
  RiEyeLine,
  RiUser3Line,
  RiVideoLine,
  RiPlayCircleLine,
  RiYoutubeLine,
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

interface AutorComGraduacao {
  full_name?: string | null;
  graduacao?: string | null;
}

interface NewsCardProps {
  noticia: NoticiaLista;
  index: number;
}

// --- VARIANTES DE ANIMAÇÃO ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
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

// 1. Header da Seção
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

// 2. Skeleton
function SkeletonCard() {
  return (
    <Card className="border-0 bg-white rounded-2xl overflow-hidden h-full flex flex-col shadow-sm">
      <div className="h-56 bg-slate-200 animate-pulse" />
      <div className="p-6 space-y-4 flex-1">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded-full w-24 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded-full w-16 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 rounded w-full animate-pulse" />
          <div className="h-6 bg-slate-200 rounded w-2/3 animate-pulse" />
        </div>
        <div className="h-20 bg-slate-100 rounded-xl w-full animate-pulse" />
        <div className="pt-4 mt-auto border-t border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

// 3. Card de Notícia Premium (Atualizado com Hover Play)
function NewsCard({ noticia }: NewsCardProps) {
  const [imgError, setImgError] = useState(false);
  // Ref para controlar o vídeo
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

  const autor = noticia.autor as AutorComGraduacao;

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

  // --- HANDLERS DE VÍDEO ---
  const handleMouseEnter = () => {
    if (mediaType === "video_internal" && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Captura erro se o usuário sair do mouse muito rápido antes de carregar
        });
      }
    }
  };

  const handleMouseLeave = () => {
    if (mediaType === "video_internal" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Opcional: Reseta para o início
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
        <Card className="h-full flex flex-col border-0 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          {/* --- ÁREA DE CAPA / MÍDIA --- */}
          <div className="relative h-56 w-full overflow-hidden bg-slate-100">
            {shouldShowMedia ? (
              <>
                {mediaType === "video_internal" ? (
                  // CAPA DE VÍDEO INTERNO (Controlada por Ref)
                  <div className="w-full h-full relative bg-black">
                    <video
                      ref={videoRef}
                      src={displayUrl!}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      // REMOVIDO AUTOPLAY: Agora toca no hover
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                    {/* Ícone Play Central (Desaparece no Hover quando toca) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                      <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full border border-white/50 shadow-lg">
                        <RiPlayCircleLine className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    </div>
                  </div>
                ) : (
                  // CAPA DE IMAGEM OU YOUTUBE
                  <div className="relative w-full h-full">
                    <Image
                      src={displayUrl!}
                      alt={noticia.titulo}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={() => setImgError(true)}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Overlay YouTube */}
                    {mediaType === "youtube" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <div className="bg-red-600/90 p-3 rounded-full shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <RiPlayCircleLine className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Gradiente apenas para imagens estáticas */}
                    {mediaType !== "youtube" && (
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </div>
                )}
              </>
            ) : (
              // FALLBACK (Sem Capa)
              <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                {isVideo ? (
                  <RiVideoLine className="w-12 h-12 opacity-50" />
                ) : (
                  <RiNewspaperLine className="w-12 h-12 opacity-50" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
                  {isVideo ? "Vídeo" : "Sem Imagem"}
                </span>
              </div>
            )}

            {/* Badges Flutuantes */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <Badge className="bg-white/90 text-slate-800 hover:bg-white backdrop-blur-sm border-0 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {noticia.categoria || "Geral"}
              </Badge>
              {noticia.destaque && (
                <Badge className="bg-amber-500 text-white border-0 text-[10px] font-bold shadow-sm uppercase tracking-wider">
                  Destaque
                </Badge>
              )}
            </div>

            {/* Badge de tipo de mídia (canto inferior direito) */}
            {isVideo && (
              <div className="absolute bottom-3 right-3 z-10">
                <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white">
                  {mediaType === "youtube" ? (
                    <RiYoutubeLine size={16} />
                  ) : (
                    <RiVideoLine size={16} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col flex-1 p-6">
            {/* Metadados */}
            <div className="flex items-center justify-between mb-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5 text-pac-primary">
                <RiCalendarLine className="w-4 h-4" />
                <span>{formatDate(noticia.data_publicacao)}</span>
              </div>
              <div className="flex items-center gap-1">
                <RiEyeLine className="w-4 h-4" />
                <span>{noticia.views || 0}</span>
              </div>
            </div>

            {/* Título */}
            <h3 className="font-bold text-lg leading-snug text-slate-800 mb-3 group-hover:text-pac-primary transition-colors line-clamp-2">
              {noticia.titulo}
            </h3>

            {/* Resumo */}
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6 flex-1">
              {noticia.resumo ||
                "Confira os detalhes completos desta notícia clicando aqui."}
            </p>

            {/* Footer do Card */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <RiUser3Line className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px]">
                  {autor?.full_name || "Ascom PAC"}
                </span>
              </div>

              <span className="text-xs font-bold text-pac-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ler Mais <RiArrowRightLine className="w-3 h-3" />
              </span>
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
    // Resetar filtros para mostrar apenas as mais recentes na Home
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
    <section className="w-full bg-slate-50 py-20 lg:py-32 relative overflow-hidden">
      {/* Background Decorativo (Pattern) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader />

        {/* Grid de Notícias */}
        <motion.div
          className="min-h-[400px]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestNews.map((noticia: NoticiaLista, index: number) => (
                <NewsCard key={noticia.id} noticia={noticia} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-12 max-w-lg mx-auto shadow-sm">
                <div className="bg-slate-50 p-6 rounded-full w-fit mx-auto mb-6">
                  <RiNewspaperLine className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-xl mb-2">
                  Sem Atualizações
                </h3>
                <p className="text-slate-500 text-sm">
                  Não há notícias publicadas no momento.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Botão Ver Todas */}
        {latestNews.length > 0 && (
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
                <RiTimeLine className="w-5 h-5" />
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
