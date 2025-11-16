// src/components/site/sections/NewsSection.tsx - ATUALIZADO
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
import { FaCalendar, FaArrowRight, FaClock } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import { useNoticias } from "@/hooks/useNoticias";

const SectionHeader = () => (
  <motion.div
    className="text-center mb-16"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
  >
    <div className="flex items-center justify-center gap-4 mb-6">
      <div className="w-16 h-1 bg-navy-light"></div>
      <div className="w-12 h-12 bg-navy-light rounded-full flex items-center justify-center shadow-lg">
        <FaCalendar className="h-6 w-6 text-white" />
      </div>
      <div className="w-16 h-1 bg-navy-light"></div>
    </div>

    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 tracking-normal uppercase">
      ÚLTIMAS <span className="text-navy-dark">NOTÍCIAS</span>
    </h1>

    <p className="text-lg text-gray-800 max-w-4xl mx-auto leading-relaxed font-medium">
      Fique por dentro das novidades e atividades da Patrulha Aérea Civil
    </p>
  </motion.div>
);

const NewsCard = ({ noticia, index }: { noticia: any; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
  >
    <Card className="border-gray-200 bg-white hover:shadow-xl transition-all duration-300 group hover:scale-105">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="secondary"
            className="bg-navy-light/10 text-navy-light hover:bg-navy-light/20 border-0 font-roboto text-xs"
          >
            {noticia.categoria}
          </Badge>
          <div className="flex items-center text-gray-500 text-xs font-roboto">
            <FaCalendar className="h-3 w-3 mr-1" />
            {new Date(noticia.data_publicacao).toLocaleDateString("pt-BR")}
          </div>
        </div>
        <CardTitle className="text-gray-800 text-lg font-bold leading-tight line-clamp-2">
          {noticia.titulo}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-gray-600 font-roboto text-sm leading-relaxed line-clamp-3">
          {noticia.resumo}
        </CardDescription>
        <Button
          variant="link"
          className="p-0 h-auto text-navy-light hover:text-navy-dark font-roboto text-sm flex items-center gap-1 group"
          asChild
        >
          <Link href={`/noticias/${noticia.slug}`}>
            Ler Mais
            <FaArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const NewsGrid = ({ noticias }: { noticias: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
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
    viewport={{ once: true }}
  >
    <Button
      size="lg"
      asChild
      className="bg-navy hover:bg-navy-dark text-white px-8 py-4 font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
    >
      <Link href="/noticias" className="flex items-center justify-center gap-3">
        <FaClock className="h-5 w-5" />
        Ver Todas as Notícias
        <FaArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </Button>
  </motion.div>
);

export function NewsSection() {
  const { noticias, loading, error } = useNoticias();

  if (loading) {
    return (
      <section className="w-full bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <SectionHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-gray-200 bg-white animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <section className="w-full bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <SectionHeader />
          <p className="text-red-600 mb-8">
            Erro ao carregar notícias: {error}
          </p>
          <CTAButton />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <SectionHeader />
        {noticias.length > 0 ? (
          <>
            <NewsGrid noticias={noticias} />
            <CTAButton />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-8">
              Nenhuma notícia publicada ainda.
            </p>
            <CTAButton />
          </div>
        )}
      </div>
    </section>
  );
}
