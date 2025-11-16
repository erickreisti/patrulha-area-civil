"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaImages, FaArrowRight, FaEye } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGaleria } from "@/hooks/useGaleria";

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
        <FaImages className="h-6 w-6 text-white" />
      </div>
      <div className="w-16 h-1 bg-navy-light"></div>
    </div>

    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 tracking-normal uppercase">
      GALERIA EM <span className="text-navy-dark">DESTAQUE</span>
    </h1>

    <p className="text-lg text-gray-800 max-w-4xl mx-auto leading-relaxed font-medium">
      Registros visuais das nossas operações, treinamentos e atividades
      especiais
    </p>
  </motion.div>
);

const GalleryCard = ({
  categoria,
  index,
}: {
  categoria: any;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
  >
    <Card className="border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group hover:scale-105">
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
        <div className="text-center p-4 z-10">
          <FaImages className="h-12 w-12 text-gray-800/50 mx-auto mb-3" />
          <span className="text-gray-800 font-roboto text-sm">
            {categoria.nome}
          </span>
        </div>
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-all duration-300 flex items-center justify-center">
          <FaEye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-navy-light rounded-full"></div>
          <span className="text-sm font-medium text-navy-light uppercase tracking-wide">
            {categoria.tipo === "fotos" ? "Fotos" : "Vídeos"}
          </span>
          {categoria.galeria_itens && (
            <span className="text-xs text-gray-500">
              {categoria.galeria_itens[0]?.count || 0} itens
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-800 text-lg mb-4 leading-tight">
          {categoria.nome}
        </h3>

        {categoria.descricao && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {categoria.descricao}
          </p>
        )}

        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full border-navy-light text-navy-light hover:bg-navy-light hover:text-white transition-all duration-300"
        >
          <Link
            href={`/galeria/${categoria.slug}`}
            className="flex items-center justify-center gap-2"
          >
            <FaEye className="h-4 w-4" />
            Ver Galeria
          </Link>
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const GalleryGrid = ({ categorias }: { categorias: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
    {categorias.slice(0, 3).map((categoria, index) => (
      <GalleryCard key={categoria.id} categoria={categoria} index={index} />
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
      <Link href="/galeria" className="flex items-center justify-center gap-3">
        <FaImages className="h-5 w-5" />
        Explorar Galeria Completa
        <FaArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </Button>
  </motion.div>
);

export function GalleryShowcase() {
  const { categorias, loading, error } = useGaleria();

  if (loading) {
    return (
      <section className="w-full bg-offwhite py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <SectionHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-gray-200 bg-white animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
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
      <section className="w-full bg-offwhite py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <SectionHeader />
          <p className="text-red-600 mb-8">Erro ao carregar galeria: {error}</p>
          <CTAButton />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-offwhite py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <SectionHeader />
        {categorias.length > 0 ? (
          <>
            <GalleryGrid categorias={categorias} />
            <CTAButton />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-8">
              Nenhuma categoria disponível no momento.
            </p>
            <CTAButton />
          </div>
        )}
      </div>
    </section>
  );
}
