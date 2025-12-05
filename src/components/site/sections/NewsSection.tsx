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
} from "react-icons/ri";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Interface para notícias
interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  resumo?: string;
  categoria?: string;
  data_publicacao: string;
  status: string;
}

// Hook otimizado para notícias
function useNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNoticias() {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from("noticias")
          .select(
            "id, titulo, slug, resumo, categoria, data_publicacao, status"
          )
          .eq("status", "publicado")
          .order("data_publicacao", { ascending: false })
          .limit(6);

        if (error) throw error;

        setNoticias(data || []);
      } catch (err: unknown) {
        console.error("Erro ao carregar notícias:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  return { noticias, loading, error };
}

const SectionHeader = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
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
  noticia: Noticia;
  index: number;
}

const NewsCard = ({ noticia, index }: NewsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Card className="border-slate-200 bg-white hover:shadow-xl transition-all duration-300 group h-full flex flex-col hover:scale-[1.02]">
        <CardHeader className="pb-3 sm:pb-4 flex-1">
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
          <CardTitle
            className={cn(
              "text-slate-800 font-bold leading-tight line-clamp-2",
              "text-base sm:text-lg lg:text-xl"
            )}
          >
            {noticia.titulo}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4">
          <CardDescription
            className={cn(
              "text-slate-600 font-roboto leading-relaxed line-clamp-3",
              "text-xs sm:text-sm lg:text-base"
            )}
          >
            {noticia.resumo || "Leia mais sobre esta notícia..."}
          </CardDescription>
          <div className="mt-auto pt-3 sm:pt-4">
            <Button
              variant="link"
              className="p-0 h-auto text-navy hover:text-navy-700 font-roboto flex items-center gap-1 group text-xs sm:text-sm touch-optimize"
              asChild
            >
              <Link href={`/noticias/${noticia.slug}`}>
                <span>Ler Mais</span>
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
  noticias: Noticia[];
}

const NewsGrid = ({ noticias }: NewsGridProps) => {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto mb-8 sm:mb-12 lg:mb-16",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {noticias.slice(0, 3).map((noticia, index) => (
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
          "text-sm sm:text-base lg:text-lg touch-optimize active:scale-95"
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
        className="border-slate-200 bg-white animate-pulse h-48 sm:h-56 lg:h-64"
      >
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

export function NewsSection() {
  const { noticias, loading, error } = useNoticias();

  return (
    <section className="w-full bg-white py-8 sm:py-12 lg:py-16 xl:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <motion.div
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 max-w-md mx-auto">
              <h3 className="text-red-800 font-bold text-lg sm:text-xl mb-2">
                Erro ao carregar notícias
              </h3>
              <p className="text-red-600 text-sm sm:text-base">{error}</p>
            </div>
          </motion.div>
        ) : noticias.length > 0 ? (
          <>
            <NewsGrid noticias={noticias} />
            <CTAButton />
          </>
        ) : (
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
              <p className="text-slate-600 text-sm sm:text-base">
                Em breve teremos novidades para compartilhar.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
