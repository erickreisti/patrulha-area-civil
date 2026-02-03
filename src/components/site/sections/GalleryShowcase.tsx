"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Icons
import {
  RiGalleryLine,
  RiArrowRightLine,
  RiEyeLine,
  RiVideoLine,
  RiImageLine,
  RiFolderLine,
} from "react-icons/ri";

// Action & Types
import { getCategoriasDestaquePublico } from "@/app/actions/gallery/public";
import type { CategoriaShowcase } from "@/app/actions/gallery/types";

// --- Sub-componentes ---

const SectionHeader = () => {
  return (
    <motion.div
      className="text-center mb-8 sm:mb-12 lg:mb-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <h1
        className={cn(
          "font-extrabold text-gray-800 mb-4 sm:mb-6 tracking-tight uppercase mx-auto px-2",
          "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
          "max-w-[90vw]",
        )}
      >
        GALERIA EM <span className="text-pac-primary">DESTAQUE</span>
      </h1>

      <p
        className={cn(
          "text-gray-700 mx-auto leading-relaxed font-medium px-2 sm:px-4",
          "text-sm xs:text-base sm:text-lg lg:text-xl",
          "max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-4xl",
        )}
      >
        Registros visuais das nossas operações, treinamentos e atividades
        especiais
      </p>
    </motion.div>
  );
};

interface GalleryCardProps {
  categoria: CategoriaShowcase;
  index: number;
}

const GalleryCard = ({ categoria, index }: GalleryCardProps) => {
  const IconTipo = categoria.tipo === "fotos" ? RiImageLine : RiVideoLine;
  const isDisabled = !categoria.itens_count || categoria.arquivada;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
    >
      <Card className="border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col hover:scale-[1.02]">
        {/* Área da Imagem */}
        <div className="h-32 sm:h-40 lg:h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
          {categoria.capa_url ? (
            <>
              <Image
                src={categoria.capa_url}
                alt={categoria.nome}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Overlay gradiente para contraste do texto/ícone */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <IconTipo className="w-12 h-12 text-gray-400 opacity-50" />
            </div>
          )}

          {/* Badge de Tipo */}
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-pac-primary text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              <IconTipo className="w-3 h-3" />
              {categoria.tipo === "fotos" ? "Fotos" : "Vídeos"}
            </span>
          </div>
        </div>

        {/* Conteúdo do Card */}
        <CardContent className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col">
          <div className="mb-2">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg leading-tight line-clamp-1 group-hover:text-pac-primary transition-colors">
              {categoria.nome}
            </h3>
          </div>

          {categoria.descricao && (
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-1">
              {categoria.descricao}
            </p>
          )}

          {categoria.tem_destaque && (
            <div className="mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full border border-amber-100">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                Destaque
              </span>
            </div>
          )}

          <div className="w-full mt-auto pt-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full border-pac-primary text-pac-primary hover:bg-pac-primary hover:text-white transition-all duration-300 text-xs sm:text-sm font-semibold",
                isDisabled &&
                  "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-400 hover:border-gray-200",
              )}
              disabled={isDisabled}
              asChild={!isDisabled}
            >
              {isDisabled ? (
                <span className="flex items-center justify-center">
                  {categoria.arquivada ? "Arquivada" : "Em breve"}
                </span>
              ) : (
                <Link href={`/galeria/${categoria.slug}`}>
                  <RiEyeLine className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Visualizar Galeria
                </Link>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CTAButton = () => {
  return (
    <motion.div
      className="text-center mt-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Button
        size="lg"
        asChild
        className={cn(
          "bg-pac-primary hover:bg-pac-primary-dark text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-pac-primary/20",
          "px-6 py-6 text-base sm:text-lg",
        )}
      >
        <Link
          href="/galeria"
          className="flex items-center justify-center gap-2 sm:gap-3"
        >
          <RiFolderLine className="w-5 h-5" />
          Explorar Galeria Completa
          <RiArrowRightLine className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Button>
    </motion.div>
  );
};

// --- Componente Principal ---

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
        // Se falhar silenciosamente ou sem dados, apenas não mostra erro crítico se não for necessário
        // Mas aqui vamos logar o erro
        console.warn("Falha ao carregar destaques:", result.error);
        throw new Error(result.error || "Falha ao carregar");
      }
    } catch (err) {
      console.error("Erro no showcase da galeria:", err);
      setError("Não foi possível carregar os destaques no momento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isEmpty = !loading && !error && categorias.length === 0;

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50/50 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-gray-100 h-[380px] overflow-hidden"
              >
                <div className="h-40 bg-gray-200 animate-pulse" />
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded w-full mt-auto animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">{error}</p>
            <Button variant="outline" onClick={loadData}>
              Tentar Novamente
            </Button>
          </div>
        ) : isEmpty ? (
          <motion.div
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 max-w-md mx-auto shadow-sm">
              <RiGalleryLine className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-800 font-bold text-lg mb-2">
                Galeria em atualização
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Estamos selecionando as melhores imagens para você.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/galeria">Ver todas as categorias</Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {categorias.map((categoria, index) => (
                <GalleryCard
                  key={categoria.id}
                  categoria={categoria}
                  index={index}
                />
              ))}
            </div>
            <CTAButton />
          </>
        )}
      </div>
    </section>
  );
}
