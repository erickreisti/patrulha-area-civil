"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils/cn";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  RiGalleryLine,
  RiArrowRightLine,
  RiVideoLine,
  RiImageLine,
  RiFolderLine,
  RiImage2Line,
  RiPlayCircleLine,
  RiYoutubeLine,
} from "react-icons/ri";

// Action & Types
import { getCategoriasDestaquePublico } from "@/app/actions/gallery/public";
import type { CategoriaShowcase } from "@/app/actions/gallery/types";

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

// --- FUNÇÕES AUXILIARES ---

const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== "string" || url.trim() === "") return null;
  if (url.startsWith("http") || url.startsWith("https")) return url;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = "galerias";

  if (!supabaseUrl) return null;

  if (url.includes(bucket)) {
    return `${supabaseUrl}/storage/v1/object/public/${url}`;
  } else {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
  }
};

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
        Acervo Visual
      </span>
      <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/30" />
    </div>

    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight">
      Galeria em <span className="text-pac-primary">Destaque</span>
    </h2>

    <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed">
      Registros visuais das nossas operações, treinamentos e atividades
      especiais em prol da sociedade.
    </p>
  </div>
);

const SkeletonCard = () => (
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

const GalleryCard = ({
  categoria,
  index,
}: {
  categoria: CategoriaShowcase;
  index: number;
}) => {
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const IconTipo = categoria.tipo === "fotos" ? RiImageLine : RiVideoLine;

  const rawUrl = categoria.capa_url;

  const isYouTube = rawUrl?.includes("youtube") || rawUrl?.includes("youtu.be");

  const isVideoFile =
    rawUrl?.endsWith(".mp4") ||
    rawUrl?.endsWith(".webm") ||
    (categoria.tipo === "videos" && !isYouTube && !!rawUrl);

  let displayUrl: string | null = null;
  let mediaType: "image" | "youtube" | "video_internal" | "none" = "image";

  if (isYouTube && rawUrl) {
    const ytId = getYouTubeId(rawUrl);
    if (ytId) {
      displayUrl = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
      mediaType = "youtube";
    }
  } else if (isVideoFile && rawUrl) {
    if (rawUrl.startsWith("http")) {
      displayUrl = rawUrl;
    } else {
      displayUrl = getImageUrl(rawUrl);
    }
    mediaType = displayUrl ? "video_internal" : "none";
  } else {
    if (rawUrl?.startsWith("http")) {
      displayUrl = rawUrl;
    } else {
      displayUrl = getImageUrl(rawUrl);
    }
    mediaType = displayUrl ? "image" : "none";
  }

  const shouldShowMedia = mediaType !== "none" && !hasError;

  // --- HANDLERS DE VÍDEO (Hover Play) ---
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
      videoRef.current.currentTime = 0; // Reset para o início
    }
  };

  return (
    <motion.div variants={cardVariants} className="h-full">
      <Link
        href={`/galeria/${categoria.slug}`}
        className="group h-full block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Card className="border-0 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1 rounded-2xl">
          {/* Área da Mídia */}
          <div className="h-56 relative overflow-hidden bg-slate-100">
            {shouldShowMedia ? (
              <>
                {mediaType === "video_internal" ? (
                  // CAPA DE VÍDEO INTERNO (Controlada por Ref)
                  <div className="w-full h-full relative bg-black">
                    <video
                      ref={videoRef}
                      src={displayUrl!}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
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
                  <>
                    <Image
                      src={displayUrl!}
                      alt={categoria.nome || "Galeria"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={() => setHasError(true)}
                      priority={index < 2}
                    />
                    {mediaType === "youtube" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <div className="bg-red-600/90 p-3 rounded-full shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <RiPlayCircleLine className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  </>
                )}
              </>
            ) : (
              // FALLBACK (Sem Capa)
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                <RiImage2Line className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-xs uppercase font-bold tracking-widest">
                  Sem Capa
                </span>
              </div>
            )}

            {/* Badge de Tipo */}
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-white/90 text-slate-900 backdrop-blur-md border-0 shadow-sm font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 hover:bg-white">
                <IconTipo className="w-3.5 h-3.5 text-pac-primary" />
                {categoria.tipo === "fotos" ? "Fotos" : "Vídeos"}
              </Badge>
            </div>

            {/* Badge YouTube */}
            {mediaType === "youtube" && (
              <div className="absolute bottom-4 right-4 z-10">
                <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white">
                  <RiYoutubeLine size={16} />
                </div>
              </div>
            )}

            {/* Contador */}
            {categoria.itens_count > 0 && (
              <div className="absolute bottom-4 left-4 z-10">
                <span className="text-white text-xs font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                  {categoria.itens_count} itens
                </span>
              </div>
            )}
          </div>

          {/* Conteúdo Textual */}
          <div className="p-6 flex-1 flex flex-col bg-white">
            <div className="flex-1 mb-4">
              <h3 className="font-bold text-lg text-slate-800 leading-snug mb-2 group-hover:text-pac-primary transition-colors line-clamp-1">
                {categoria.nome}
              </h3>
              {categoria.descricao && (
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                  {categoria.descricao}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-pac-primary transition-colors">
                Ver Detalhes
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
};

// --- COMPONENTE PRINCIPAL ---

export function GalleryShowcase() {
  const [categorias, setCategorias] = useState<CategoriaShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCategoriasDestaquePublico();
      if (result.success && result.data) {
        setCategorias(result.data);
      } else {
        throw new Error(result.error || "Falha ao carregar");
      }
    } catch (err) {
      console.error("Erro no showcase da galeria:", err);
      setError("Galeria temporariamente indisponível.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section className="w-full bg-white py-20 lg:py-32 relative overflow-hidden border-t border-slate-100">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader />

        <div className="min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200">
              <RiImage2Line className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">{error}</p>
              <Button variant="outline" onClick={loadData}>
                Tentar Novamente
              </Button>
            </div>
          ) : categorias.length > 0 ? (
            <>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                {categorias.map((cat, idx) => (
                  <GalleryCard key={cat.id} categoria={cat} index={idx} />
                ))}
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Button
                  size="lg"
                  asChild
                  className={cn(
                    "bg-pac-primary hover:bg-pac-primary-dark text-white rounded-full px-10 h-14",
                    "shadow-lg hover:shadow-pac-primary/30 transition-all font-bold tracking-wide text-base group",
                  )}
                >
                  <Link href="/galeria" className="flex items-center gap-3">
                    <RiFolderLine className="w-5 h-5" />
                    Explorar Galeria Completa
                    <RiArrowRightLine className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </>
          ) : (
            <motion.div
              className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <RiGalleryLine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-800 font-bold text-xl mb-2">
                Galeria em Atualização
              </h3>
              <p className="text-slate-500 mb-6">
                Estamos preparando novos registros visuais para você.
              </p>
              <Button variant="outline" asChild>
                <Link href="/galeria">Ver Arquivo Completo</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
