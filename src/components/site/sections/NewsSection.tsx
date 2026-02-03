"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RiCalendarLine,
  RiArrowRightLine,
  RiTimeLine,
  RiNewspaperLine,
  RiEyeLine,
  RiExternalLinkLine,
  RiStarFill,
} from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useNoticiasBasico } from "@/lib/stores/useNoticiasStore";
import { cn } from "@/lib/utils/cn";
import type { NoticiaLista } from "@/app/actions/news/noticias";

// Tipo para autor estendido
interface AutorComGraduacao {
  full_name?: string | null;
  graduacao?: string | null;
}

// Componente Skeleton
function SkeletonCard() {
  return (
    <Card className="border-gray-200 bg-white overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <CardHeader className="pb-3 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
        <div className="mt-4 h-4 bg-gray-200 rounded w-24 animate-pulse" />
      </CardContent>
    </Card>
  );
}

// Componente NewsCard
interface NewsCardProps {
  noticia: NoticiaLista;
  index: number;
}

function NewsCard({ noticia, index }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = "imagens-noticias";

    if (url.includes(bucket)) {
      return `${supabaseUrl}/storage/v1/object/public/${url}`;
    } else {
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
    }
  };

  const imageUrl = getImageUrl(noticia.media_url);
  const hasImage = !!imageUrl;

  // Extrair graduação do autor com tipo seguro
  const autor = noticia.autor as AutorComGraduacao;
  const autorGraduacao = autor?.graduacao || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
    >
      {/* ALTERADO: Removido o Link que envolvia o Card. 
        O Card agora é apenas um container visual.
      */}
      <Card className="border-gray-200 bg-white hover:shadow-xl transition-all duration-300 group h-full flex flex-col hover:scale-[1.02] overflow-hidden relative">
        {noticia.destaque && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 text-xs">
              <RiStarFill className="w-3 h-3 mr-1" />
              Destaque
            </Badge>
          </div>
        )}

        {hasImage ? (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={imageUrl}
              alt={noticia.titulo}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge
                variant="secondary"
                className="bg-pac-primary/90 text-white hover:bg-pac-primary border-0 text-xs backdrop-blur-sm"
              >
                {noticia.categoria || "Geral"}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <RiNewspaperLine className="w-16 h-16 text-gray-300" />
          </div>
        )}

        <CardHeader className={cn("pb-3 flex-1", hasImage ? "pt-4" : "pt-6")}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            {!hasImage && (
              <Badge
                variant="secondary"
                className="bg-pac-primary/10 text-pac-primary hover:bg-pac-primary/20 border-0 text-xs"
              >
                {noticia.categoria || "Geral"}
              </Badge>
            )}
            <div
              className={cn(
                "flex items-center text-xs",
                hasImage ? "text-white/90" : "text-gray-500",
              )}
            >
              <RiCalendarLine className="w-3 h-3 mr-1 flex-shrink-0" />
              {formatDate(noticia.data_publicacao)}
              <span className="mx-2">•</span>
              <RiEyeLine className="w-3 h-3 mr-1" />
              {noticia.views} visualizações
            </div>
          </div>

          <CardTitle
            className={cn(
              "font-bold leading-tight line-clamp-2 text-lg group-hover:text-pac-primary transition-colors",
              hasImage ? "text-white group-hover:text-white" : "text-gray-800",
            )}
          >
            {noticia.titulo}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          <p
            className={cn(
              "leading-relaxed line-clamp-3 text-sm",
              hasImage ? "text-white/80" : "text-gray-600",
            )}
          >
            {noticia.resumo || "Leia mais sobre esta notícia..."}
          </p>

          {noticia.autor && (
            <div
              className={cn(
                "flex items-center gap-2 pt-2 border-t",
                hasImage ? "border-gray-700/30" : "border-gray-100",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center",
                  hasImage ? "bg-white/20" : "bg-pac-primary/10",
                )}
              >
                <RiExternalLinkLine
                  className={cn(
                    "w-3.5 h-3.5",
                    hasImage ? "text-white" : "text-pac-primary",
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-medium truncate",
                    hasImage ? "text-white/90" : "text-gray-700",
                  )}
                >
                  Por: {noticia.autor.full_name || "Autor"}
                </p>
                {autorGraduacao && (
                  <p
                    className={cn(
                      "text-[10px] truncate",
                      hasImage ? "text-white/70" : "text-gray-500",
                    )}
                  >
                    {autorGraduacao}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4">
            {/* ALTERADO: Botão com asChild para usar Link do Next.js corretamente.
              Isso garante que apenas o clique neste botão navegue.
            */}
            <Button
              asChild
              variant={hasImage ? "secondary" : "link"}
              className={cn(
                "flex items-center gap-1 text-sm w-full justify-start p-0 h-auto font-semibold cursor-pointer",
                hasImage
                  ? "text-white hover:text-white bg-white/20 hover:bg-white/30 px-3 py-2 rounded-md" // Ajustado estilo quando tem imagem
                  : "text-pac-primary hover:text-pac-primary-dark",
              )}
            >
              <Link href={`/noticias/${noticia.slug}`}>
                Ler Notícia Completa
                <RiArrowRightLine className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente principal
export function NewsSection() {
  const { noticias, loading, setFiltros, fetchNoticias } = useNoticiasBasico();

  // useEffect com dependência vazia para rodar apenas uma vez
  useEffect(() => {
    setFiltros({
      search: "",
      categoria: "all",
      status: "publicado",
      destaque: "all",
      tipo_media: "all",
      sortBy: "recent",
      sortOrder: "desc",
      page: 1,
      limit: 3,
    });

    fetchNoticias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestNews = noticias.slice(0, 3);

  return (
    <section className="w-full bg-white py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 uppercase tracking-tight">
            ÚLTIMAS <span className="text-pac-primary">NOTÍCIAS</span>
          </h1>

          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Fique por dentro das novidades e atividades da Patrulha Aérea Civil
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : latestNews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {latestNews.map((noticia: NoticiaLista, index: number) => (
                <NewsCard key={noticia.id} noticia={noticia} index={index} />
              ))}
            </div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Button
                size="lg"
                asChild
                className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl px-8 py-4 text-lg group"
              >
                <Link
                  href="/noticias"
                  className="flex items-center justify-center gap-3"
                >
                  <RiTimeLine className="w-5 h-5" />
                  Ver Todas as Notícias
                  <RiArrowRightLine className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <RiNewspaperLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-800 font-bold text-xl mb-2">
                Nenhuma notícia disponível
              </h3>
              <p className="text-gray-600 mb-4">
                Em breve teremos novidades para compartilhar.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
