"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  RiGalleryLine,
  RiArrowRightLine,
  RiEyeLine,
  RiVideoLine,
  RiImageLine,
  RiFolderLine,
} from "react-icons/ri";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";

// Interface para categorias da galeria - ACEITAR null
interface CategoriaGaleria {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: "fotos" | "videos";
  ordem: number;
  status: boolean;
  itemCount: number;
}

// Hook otimizado para galeria
function useGaleria() {
  const [categorias, setCategorias] = useState<CategoriaGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategorias() {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: categoriasData, error: categoriasError } = await supabase
          .from("galeria_categorias")
          .select(
            `
            id, 
            nome, 
            slug, 
            descricao, 
            tipo, 
            ordem, 
            status
          `
          )
          .eq("status", true)
          .order("ordem", { ascending: true })
          .limit(3);

        if (categoriasError) throw categoriasError;

        // Buscar contagem de itens para cada categoria
        const categoriasComContagem = await Promise.all(
          (categoriasData || []).map(async (categoria) => {
            const { count } = await supabase
              .from("galeria_itens")
              .select("*", { count: "exact", head: true })
              .eq("categoria_id", categoria.id)
              .eq("status", true);

            return {
              ...categoria,
              itemCount: count || 0,
            };
          })
        );

        // Filtrar categorias com itens
        const categoriasFiltradas = categoriasComContagem.filter(
          (cat) => cat.itemCount > 0
        );

        setCategorias(categoriasFiltradas);
      } catch (err: unknown) {
        console.error("Erro ao carregar categorias:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchCategorias();
  }, []);

  return { categorias, loading, error };
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
          <RiGalleryLine className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
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
        GALERIA EM <span className="text-navy">DESTAQUE</span>
      </h1>

      <p
        className={cn(
          "text-slate-700 mx-auto leading-relaxed font-medium px-2 sm:px-4",
          "text-sm xs:text-base sm:text-lg lg:text-xl",
          "max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-4xl"
        )}
      >
        Registros visuais das nossas operações, treinamentos e atividades
        especiais
      </p>
    </motion.div>
  );
};

interface GalleryCardProps {
  categoria: CategoriaGaleria;
  index: number;
}

const GalleryCard = ({ categoria, index }: GalleryCardProps) => {
  const ref = useRef(null);
  const IconTipo = categoria.tipo === "fotos" ? RiImageLine : RiVideoLine;
  const labelTipo = categoria.tipo === "fotos" ? "Fotos" : "Vídeos";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Card className="border-slate-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col hover:scale-[1.02]">
        <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
          <div className="text-center p-4 z-10">
            <IconTipo className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-800/50 mx-auto mb-2 sm:mb-3" />
            <span className="text-slate-800 font-roboto text-sm sm:text-base lg:text-lg font-semibold">
              {categoria.nome}
            </span>
          </div>
          <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-all duration-300 flex items-center justify-center">
            <RiEyeLine className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Badge de tipo */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm text-navy text-xs font-bold px-2 py-1 rounded-full">
              {labelTipo}
            </span>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-navy rounded-full flex-shrink-0"></div>
            <span className="text-xs sm:text-sm lg:text-base font-medium text-navy uppercase tracking-wide">
              {categoria.tipo === "fotos"
                ? "Galeria de Fotos"
                : "Galeria de Vídeos"}
            </span>
            <span className="text-xs sm:text-sm text-slate-500 ml-auto">
              {categoria.itemCount} itens
            </span>
          </div>

          <h3 className="font-bold text-slate-800 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 leading-tight">
            {categoria.nome}
          </h3>

          {categoria.descricao && (
            <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-1">
              {categoria.descricao}
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 mt-auto text-xs sm:text-sm touch-optimize active:scale-95"
          >
            <Link
              href={`/galeria/${categoria.slug}`}
              className="flex items-center justify-center gap-2"
            >
              <RiEyeLine className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Ver Galeria</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface GalleryGridProps {
  categorias: CategoriaGaleria[];
}

const GalleryGrid = ({ categorias }: GalleryGridProps) => {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto mb-8 sm:mb-12 lg:mb-16",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {categorias.map((categoria, index) => (
        <GalleryCard key={categoria.id} categoria={categoria} index={index} />
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
          href="/galeria"
          className="flex items-center justify-center gap-2 sm:gap-3"
        >
          <RiFolderLine className="w-4 h-4 sm:w-5 sm:h-5" />
          Explorar Galeria Completa
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
        className="border-slate-200 bg-white animate-pulse h-56 sm:h-64 lg:h-72"
      >
        <div className="h-32 sm:h-40 lg:h-48 bg-slate-200"></div>
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-3 sm:h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 sm:h-4 bg-slate-200 rounded w-1/3 ml-auto"></div>
          </div>
          <div className="h-4 sm:h-6 bg-slate-200 rounded mb-2 sm:mb-3"></div>
          <div className="h-3 sm:h-4 bg-slate-200 rounded w-3/4 mb-3 sm:mb-4"></div>
          <div className="h-8 sm:h-9 bg-slate-200 rounded"></div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export function GalleryShowcase() {
  const { categorias, loading, error } = useGaleria();

  return (
    <section className="w-full bg-offwhite py-8 sm:py-12 lg:py-16 xl:py-20 overflow-hidden">
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
                Erro ao carregar galeria
              </h3>
              <p className="text-red-600 text-sm sm:text-base">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </div>
          </motion.div>
        ) : categorias.length > 0 ? (
          <>
            <GalleryGrid categorias={categorias} />
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
              <RiGalleryLine className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-slate-800 font-bold text-lg sm:text-xl mb-2">
                Galeria em construção
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mb-4">
                Em breve teremos conteúdo visual disponível.
              </p>
              <Button
                variant="outline"
                className="border-navy text-navy hover:bg-navy hover:text-white"
                asChild
              >
                <Link href="/galeria">Visitar Galeria</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
