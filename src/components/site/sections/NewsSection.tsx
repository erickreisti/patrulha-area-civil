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
import { RiCalendarLine, RiArrowRightLine, RiTimeLine } from "react-icons/ri";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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

// Hook otimizado para notícias - apenas campos necessários
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

const SectionHeader = () => (
  <motion.div
    className="text-center mb-8 sm:mb-12 lg:mb-16"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true, margin: "-50px" }}
  >
    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="w-12 sm:w-16 lg:w-20 h-0.5 sm:h-1 bg-navy"></div>
      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-navy rounded-full flex items-center justify-center shadow-lg">
        <RiCalendarLine className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
      </div>
      <div className="w-12 sm:w-16 lg:w-20 h-0.5 sm:h-1 bg-navy"></div>
    </div>

    <h1
      className={cn(
        "font-bold text-slate-800 mb-4 sm:mb-6 tracking-normal uppercase",
        "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
      )}
    >
      ÚLTIMAS <span className="text-navy">NOTÍCIAS</span>
    </h1>

    <p
      className={cn(
        "text-slate-700 max-w-4xl mx-auto leading-relaxed font-medium px-4",
        "text-sm sm:text-base lg:text-lg",
        "max-w-xs sm:max-w-md lg:max-w-2xl xl:max-w-4xl"
      )}
    >
      Fique por dentro das novidades e atividades da Patrulha Aérea Civil
    </p>
  </motion.div>
);

interface NewsCardProps {
  noticia: Noticia;
  index: number;
}

const NewsCard = ({ noticia, index }: NewsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true, margin: "-50px" }}
  >
    <Card className="border-slate-200 bg-white hover:shadow-xl transition-all duration-300 group hover:scale-105 h-full flex flex-col">
      <CardHeader className="pb-3 sm:pb-4 flex-1">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <Badge
            variant="secondary"
            className="bg-navy/10 text-navy hover:bg-navy/20 border-0 font-roboto text-xs sm:text-sm"
          >
            {noticia.categoria || "Geral"}
          </Badge>
          <div className="flex items-center text-slate-500 text-xs sm:text-sm font-roboto">
            <RiCalendarLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {new Date(noticia.data_publicacao).toLocaleDateString("pt-BR")}
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
            className="p-0 h-auto text-navy hover:text-navy-700 font-roboto flex items-center gap-1 group text-xs sm:text-sm"
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

interface NewsGridProps {
  noticias: Noticia[];
}

const NewsGrid = ({ noticias }: NewsGridProps) => (
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

const CTAButton = () => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    viewport={{ once: true, margin: "-50px" }}
  >
    <Button
      size="lg"
      asChild
      className={cn(
        "bg-navy hover:bg-navy-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl",
        "px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4",
        "text-sm sm:text-base lg:text-lg"
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

export function NewsSection() {
  const { noticias, loading, error } = useNoticias();

  if (loading) {
    return (
      <section className="w-full bg-white py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader />
          <div
            className={cn(
              "grid gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto mb-8 sm:mb-12 lg:mb-16",
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-slate-200 bg-white animate-pulse h-40 sm:h-48 lg:h-56"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-1/4 mb-2 sm:mb-3"></div>
                  <div className="h-4 sm:h-6 bg-slate-200 rounded mb-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 sm:h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <CTAButton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-white py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader />
          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Erro ao carregar notícias: {error}
          </p>
          <CTAButton />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-8 sm:py-12 lg:py-16 xl:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        {noticias.length > 0 ? (
          <>
            <NewsGrid noticias={noticias} />
            <CTAButton />
          </>
        ) : (
          <div className="text-center py-4 sm:py-6 lg:py-8">
            <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Nenhuma notícia publicada ainda.
            </p>
            <CTAButton />
          </div>
        )}
      </div>
    </section>
  );
}
