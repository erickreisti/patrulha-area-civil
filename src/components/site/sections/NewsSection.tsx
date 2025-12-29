"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RiCalendarLine,
  RiArrowRightLine,
  RiTimeLine,
  RiNewspaperLine,
  RiErrorWarningLine,
  RiEyeLine,
} from "react-icons/ri";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useState, useEffect } from "react";
import { getLatestNews } from "@/app/actions/news/noticias";
import type { NoticiaLista } from "@/lib/stores/useNoticiasStore";

const SectionHeader = () => {
  return (
    <motion.div
      className="text-center mb-8 sm:mb-12 lg:mb-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-8 sm:w-12 lg:w-16 h-0.5 sm:h-1 bg-navy"></div>
        <motion.div
          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-navy rounded-full flex items-center justify-center shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <RiNewspaperLine className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </motion.div>
        <div className="w-8 sm:w-12 lg:w-16 h-0.5 sm:h-1 bg-navy"></div>
      </div>

      <h1
        className={cn(
          "font-bold text-slate-800 mb-4 sm:mb-6 tracking-normal uppercase mx-auto px-2",
          "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
          "max-w-[90vw]"
        )}
      >
        ÚLTIMAS <span className="text-navy">NOTÍCIAS</span>
      </h1>

      <p
        className={cn(
          "text-slate-700 mx-auto leading-relaxed font-medium px-2 sm:px-4",
          "text-sm xs:text-base sm:text-lg lg:text-xl",
          "max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-4xl"
        )}
      >
        Fique por dentro das novidades e atividades da Patrulha Aérea Civil
      </p>
    </motion.div>
  );
};

interface NewsCardProps {
  noticia: NoticiaLista;
  index: number;
}

const NewsCard = ({ noticia, index }: NewsCardProps) => {
  const hasImage = noticia.imagem && noticia.imagem !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
    >
      <Card className="border-slate-200 bg-white hover:shadow-xl transition-all duration-300 group h-full flex flex-col hover:scale-[1.02] overflow-hidden">
        {hasImage && (
          <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url('${noticia.imagem}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge
                variant="secondary"
                className="bg-navy/90 text-white hover:bg-navy border-0 font-roboto text-xs sm:text-sm backdrop-blur-sm"
              >
                {noticia.categoria || "Geral"}
              </Badge>
            </div>
          </div>
        )}

        <CardHeader
          className={`pb-3 sm:pb-4 flex-1 ${!hasImage ? "pt-6" : ""}`}
        >
          {!hasImage && (
            <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-navy/10 text-navy hover:bg-navy/20 border-0 font-roboto text-xs sm:text-sm"
              >
                {noticia.categoria || "Geral"}
              </Badge>
              <div className="flex items-center text-slate-500 text-xs sm:text-sm font-roboto">
                <RiCalendarLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                {new Date(noticia.data_publicacao).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          )}

          <CardTitle
            className={cn(
              "text-slate-800 font-bold leading-tight line-clamp-2",
              "text-base sm:text-lg lg:text-xl",
              hasImage ? "text-white relative z-10" : ""
            )}
          >
            {noticia.titulo}
          </CardTitle>

          {hasImage && (
            <div className="flex items-center text-slate-200 text-xs sm:text-sm font-roboto mt-2">
              <RiCalendarLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              {new Date(noticia.data_publicacao).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4 flex-1">
          <CardDescription
            className={cn(
              "text-slate-600 font-roboto leading-relaxed line-clamp-3",
              "text-xs sm:text-sm lg:text-base"
            )}
          >
            {noticia.resumo || "Leia mais sobre esta notícia..."}
          </CardDescription>

          {noticia.autor && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-navy/10 flex items-center justify-center">
                <RiEyeLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-navy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 font-medium truncate">
                  Por: {noticia.autor.full_name || "Autor"}
                </p>
                {noticia.autor.graduacao && (
                  <p className="text-[10px] text-slate-500 truncate">
                    {noticia.autor.graduacao}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto pt-3 sm:pt-4">
            <Button
              variant="link"
              className="p-0 h-auto text-navy hover:text-navy-700 font-roboto flex items-center gap-1 group text-xs sm:text-sm touch-optimize w-full justify-start"
              asChild
            >
              <Link href={`/noticias/${noticia.slug}`}>
                <span>Ler Notícia Completa</span>
                <RiArrowRightLine className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface NewsGridProps {
  noticias: NoticiaLista[];
}

const NewsGrid = ({ noticias }: NewsGridProps) => {
  if (noticias.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Nenhuma notícia para exibir</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto mb-8 sm:mb-12 lg:mb-16",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {noticias.map((noticia, index) => (
        <NewsCard key={noticia.id} noticia={noticia} index={index} />
      ))}
    </div>
  );
};

const CTAButton = () => {
  return (
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
        className={cn(
          "bg-navy hover:bg-navy-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl",
          "px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4",
          "text-sm sm:text-base lg:text-lg touch-optimize active:scale-95",
          "group"
        )}
      >
        <Link
          href="/noticias"
          className="flex items-center justify-center gap-2 sm:gap-3"
        >
          <RiTimeLine className="w-4 h-4 sm:w-5 sm:h-5" />
          Ver Todas as Notícias
          <RiArrowRightLine className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Button>
    </motion.div>
  );
};

const SkeletonLoader = () => (
  <div
    className={cn(
      "grid gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto mb-8 sm:mb-12 lg:mb-16",
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    )}
  >
    {[1, 2, 3].map((i) => (
      <Card
        key={i}
        className="border-slate-200 bg-white animate-pulse h-64 sm:h-72 lg:h-80"
      >
        <div className="h-40 sm:h-48 bg-slate-200" />
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <div className="h-4 sm:h-5 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 sm:h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div className="h-5 sm:h-6 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 sm:h-5 bg-slate-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-3 sm:h-4 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 sm:h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="mt-4 h-3 sm:h-4 bg-slate-200 rounded w-1/4"></div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) => (
  <motion.div
    className="text-center py-8 sm:py-12"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true, margin: "-100px" }}
  >
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8 max-w-md mx-auto">
      <RiErrorWarningLine className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-red-800 font-bold text-lg sm:text-xl mb-2">
        Erro ao carregar notícias
      </h3>
      <p className="text-red-600 text-sm sm:text-base mb-4">{error}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
          onClick={onRetry}
        >
          Tentar novamente
        </Button>
      )}
    </div>
  </motion.div>
);

const EmptyState = () => (
  <motion.div
    className="text-center py-8 sm:py-12"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true, margin: "-100px" }}
  >
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 max-w-md mx-auto">
      <RiNewspaperLine className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
      <h3 className="text-slate-800 font-bold text-lg sm:text-xl mb-2">
        Nenhuma notícia disponível
      </h3>
      <p className="text-slate-600 text-sm sm:text-base mb-4">
        Em breve teremos novidades para compartilhar.
      </p>
      <Button variant="outline" asChild>
        <Link href="/noticias">Ver todas as notícias</Link>
      </Button>
    </div>
  </motion.div>
);

export function NewsSection() {
  const [noticias, setNoticias] = useState<NoticiaLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNoticias = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getLatestNews(3);

      if (result.success) {
        setNoticias(result.data || []);
      } else {
        setError(result.error || "Erro ao carregar notícias");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  return (
    <section className="w-full bg-white py-8 sm:py-12 lg:py-16 xl:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchNoticias} />
        ) : noticias.length > 0 ? (
          <>
            <NewsGrid noticias={noticias} />
            <CTAButton />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}
