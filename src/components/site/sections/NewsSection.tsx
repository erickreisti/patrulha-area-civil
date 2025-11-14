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

const ULTIMAS_NOTICIAS = [
  {
    id: 1,
    slug: "operacao-resgate-florestal",
    titulo: "Operação de Resgate em Área Florestal",
    resumo:
      "Equipe da PAC realiza resgate de excursionistas na Serra do Mar com sucesso total",
    categoria: "Operações",
    dataPublicacao: "2024-01-15",
  },
  {
    id: 2,
    slug: "treinamento-capacitacao",
    titulo: "Novo Programa de Treinamento",
    resumo:
      "Capacitação em técnicas avançadas de busca e salvamento para novos voluntários",
    categoria: "Treinamento",
    dataPublicacao: "2024-01-10",
  },
  {
    id: 3,
    slug: "parceria-folared",
    titulo: "PAC Fortalece Parceria com FOLARED",
    resumo:
      "Cooperação internacional para resposta a emergências em grande escala",
    categoria: "Cooperação",
    dataPublicacao: "2024-01-05",
  },
];

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

const NewsCard = ({
  noticia,
  index,
}: {
  noticia: (typeof ULTIMAS_NOTICIAS)[0];
  index: number;
}) => (
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
            {new Date(noticia.dataPublicacao).toLocaleDateString("pt-BR")}
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

const NewsGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
    {ULTIMAS_NOTICIAS.map((noticia, index) => (
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
  return (
    <section className="w-full bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <SectionHeader />
        <NewsGrid />
        <CTAButton />
      </div>
    </section>
  );
}
