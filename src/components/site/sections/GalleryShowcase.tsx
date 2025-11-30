// src/components/site/sections/GalleryShowcase.tsx - ATUALIZADO COM SUBQUERY
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  RiGalleryLine,
  RiArrowRightLine,
  RiEyeLine,
  RiVideoLine,
  RiImageLine,
} from "react-icons/ri";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Interface para categorias da galeria
interface CategoriaGaleria {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  tipo: "fotos" | "videos";
  ordem: number;
  status: boolean;
  itemCount: number;
}

// Interface para resposta da subquery
interface CategoriaWithCount {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  tipo: "fotos" | "videos";
  ordem: number;
  status: boolean;
  galeria_itens: { count: number }[];
}

// Hook otimizado para galeria com SUBQUERY
function useGaleria() {
  const [categorias, setCategorias] = useState<CategoriaGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategorias() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Query OTIMIZADA com SUBQUERY - apenas 1 requisição ao banco
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
            status,
            galeria_itens!inner(count)
          `
          )
          .eq("status", true)
          .eq("galeria_itens.status", true)
          .order("ordem", { ascending: true });

        if (categoriasError) throw categoriasError;

        // Transformar os dados para a interface esperada
        const categoriasFormatadas: CategoriaGaleria[] = (
          (categoriasData as CategoriaWithCount[]) || []
        ).map((categoria) => ({
          id: categoria.id,
          nome: categoria.nome,
          slug: categoria.slug,
          descricao: categoria.descricao,
          tipo: categoria.tipo,
          ordem: categoria.ordem,
          status: categoria.status,
          itemCount: categoria.galeria_itens[0]?.count || 0,
        }));

        setCategorias(categoriasFormatadas);
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

const SectionHeader = () => (
  <motion.div
    className="text-center mb-12 xs:mb-14 sm:mb-16"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true, margin: "-50px" }}
  >
    <div className="flex items-center justify-center gap-3 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
      <div className="w-12 xs:w-14 sm:w-16 h-0.5 xs:h-1 bg-navy"></div>
      <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-navy rounded-full flex items-center justify-center shadow-lg">
        <RiGalleryLine className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="w-12 xs:w-14 sm:w-16 h-0.5 xs:h-1 bg-navy"></div>
    </div>

    <h1
      className={cn(
        "font-bold text-slate-800 mb-4 xs:mb-5 sm:mb-6 tracking-normal uppercase",
        "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
      )}
    >
      GALERIA EM <span className="text-navy">DESTAQUE</span>
    </h1>

    <p
      className={cn(
        "text-slate-700 max-w-4xl mx-auto leading-relaxed font-medium px-4",
        "text-sm xs:text-base sm:text-lg",
        "max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl"
      )}
    >
      Registros visuais das nossas operações, treinamentos e atividades
      especiais
    </p>
  </motion.div>
);

interface GalleryCardProps {
  categoria: CategoriaGaleria;
  index: number;
}

const GalleryCard = ({ categoria, index }: GalleryCardProps) => {
  const IconTipo = categoria.tipo === "fotos" ? RiImageLine : RiVideoLine;
  const labelTipo = categoria.tipo === "fotos" ? "Fotos" : "Vídeos";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Card className="border-slate-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group hover:scale-105 h-full flex flex-col">
        <div className="h-40 xs:h-44 sm:h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
          <div className="text-center p-4 z-10">
            <IconTipo className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-slate-800/50 mx-auto mb-2 xs:mb-3" />
            <span className="text-slate-800 font-roboto text-xs xs:text-sm">
              {categoria.nome}
            </span>
          </div>
          <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-all duration-300 flex items-center justify-center">
            <RiEyeLine className="w-6 h-6 xs:w-8 xs:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        <CardContent className="p-4 xs:p-5 sm:p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-navy rounded-full"></div>
            <span className="text-xs xs:text-sm font-medium text-navy uppercase tracking-wide">
              {labelTipo}
            </span>
            <span className="text-xs text-slate-500">
              {categoria.itemCount || 0} itens
            </span>
          </div>

          <h3 className="font-bold text-slate-800 text-base xs:text-lg mb-3 xs:mb-4 leading-tight">
            {categoria.nome}
          </h3>

          {categoria.descricao && (
            <p className="text-slate-600 text-xs xs:text-sm mb-3 xs:mb-4 line-clamp-2 flex-1">
              {categoria.descricao}
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 mt-auto"
          >
            <Link
              href={`/galeria/${categoria.slug}`}
              className="flex items-center justify-center gap-2"
            >
              <RiEyeLine className="w-3 h-3 xs:w-4 xs:h-4" />
              <span className="text-xs xs:text-sm">Ver Galeria</span>
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

const GalleryGrid = ({ categorias }: GalleryGridProps) => (
  <div
    className={cn(
      "grid gap-4 xs:gap-5 sm:gap-6 max-w-6xl mx-auto mb-12 xs:mb-14 sm:mb-16",
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    )}
  >
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
    viewport={{ once: true, margin: "-50px" }}
  >
    <Button
      size="lg"
      asChild
      className={cn(
        "bg-navy hover:bg-navy-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl",
        "px-6 xs:px-8 py-3 xs:py-4",
        "text-sm xs:text-base"
      )}
    >
      <Link
        href="/galeria"
        className="flex items-center justify-center gap-2 xs:gap-3"
      >
        <RiGalleryLine className="w-4 h-4 xs:w-5 xs:h-5" />
        Explorar Galeria Completa
        <RiArrowRightLine className="w-4 h-4 xs:w-5 xs:h-5 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </Button>
  </motion.div>
);

export function GalleryShowcase() {
  const { categorias, loading, error } = useGaleria();

  if (loading) {
    return (
      <section className="w-full bg-offwhite py-12 xs:py-14 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 xs:px-4 sm:px-5 lg:px-6">
          <SectionHeader />
          <div
            className={cn(
              "grid gap-4 xs:gap-5 sm:gap-6 max-w-6xl mx-auto mb-12 xs:mb-14 sm:mb-16",
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-slate-200 bg-white animate-pulse h-64 xs:h-72 sm:h-80"
              >
                <div className="h-40 xs:h-44 sm:h-48 bg-slate-200"></div>
                <CardContent className="p-4 xs:p-5 sm:p-6">
                  <div className="h-3 xs:h-4 bg-slate-200 rounded w-1/4 mb-3 xs:mb-4"></div>
                  <div className="h-4 xs:h-6 bg-slate-200 rounded mb-2 xs:mb-3"></div>
                  <div className="h-3 xs:h-4 bg-slate-200 rounded w-3/4 mb-3 xs:mb-4"></div>
                  <div className="h-8 xs:h-9 bg-slate-200 rounded"></div>
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
      <section className="w-full bg-offwhite py-12 xs:py-14 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 text-center">
          <SectionHeader />
          <p className="text-red-600 mb-6 xs:mb-8 text-sm xs:text-base">
            Erro ao carregar galeria: {error}
          </p>
          <CTAButton />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-offwhite py-12 xs:py-14 sm:py-16 lg:py-20">
      <div className="container mx-auto px-3 xs:px-4 sm:px-5 lg:px-6">
        <SectionHeader />
        {categorias.length > 0 ? (
          <>
            <GalleryGrid categorias={categorias} />
            <CTAButton />
          </>
        ) : (
          <div className="text-center py-6 xs:py-8">
            <p className="text-slate-600 mb-6 xs:mb-8 text-sm xs:text-base">
              Nenhuma categoria disponível no momento.
            </p>
            <CTAButton />
          </div>
        )}
      </div>
    </section>
  );
}
