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
  RiCameraOffLine,
  RiImage2Line,
  RiVideoAddLine,
} from "react-icons/ri";

// Action & Types
import { getCategoriasDestaquePublico } from "@/app/actions/gallery/public";
import type { CategoriaShowcase } from "@/app/actions/gallery/types";

// --- Sub-componentes ---

const SectionHeader = () => (
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
    <p className="text-gray-700 mx-auto leading-relaxed font-medium px-4 text-sm sm:text-base lg:text-xl max-w-4xl">
      Registros visuais das nossas operações, treinamentos e atividades
      especiais
    </p>
  </motion.div>
);

const PlaceholderMedia = ({ tipo }: { tipo: "fotos" | "videos" }) => (
  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-3 p-4">
    <div className="relative">
      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
        {tipo === "fotos" ? (
          <RiImage2Line className="w-8 h-8 text-gray-400" />
        ) : (
          <RiVideoAddLine className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <RiCameraOffLine className="w-6 h-6 text-gray-500 absolute -bottom-1 -right-1 bg-gray-100 rounded-full p-1 shadow-sm" />
    </div>
    <div className="text-center">
      <span className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-1">
        Sem {tipo === "fotos" ? "Fotos" : "Vídeos"}
      </span>
      <span className="text-[10px] text-gray-400">Em breve disponível</span>
    </div>
  </div>
);

const GalleryCard = ({
  categoria,
  index,
}: {
  categoria: CategoriaShowcase;
  index: number;
}) => {
  const [imageError, setImageError] = useState(false);
  const IconTipo = categoria.tipo === "fotos" ? RiImageLine : RiVideoLine;
  const isDisabled = !categoria.itens_count || categoria.arquivada;

  // Função para obter URL da imagem
  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;

    if (url.startsWith("http")) return url;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = "galerias";

    if (url.includes(bucket)) {
      return `${supabaseUrl}/storage/v1/object/public/${url}`;
    } else {
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
    }
  };

  const imageUrl = categoria.capa_url ? getImageUrl(categoria.capa_url) : null;
  const hasImage = !!imageUrl && !imageError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
    >
      <Card className="border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col hover:scale-[1.02]">
        <div className="h-32 sm:h-40 lg:h-48 relative overflow-hidden">
          {hasImage ? (
            <>
              <Image
                src={imageUrl}
                alt={categoria.nome}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImageError(true)}
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            </>
          ) : (
            <PlaceholderMedia tipo={categoria.tipo} />
          )}

          <div className="absolute top-3 right-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-pac-primary text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              <IconTipo className="w-3 h-3" />
              {categoria.tipo === "fotos" ? "Fotos" : "Vídeos"}
            </span>
          </div>

          {/* Contador de itens */}
          {categoria.itens_count > 0 && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                {categoria.itens_count}{" "}
                {categoria.tipo === "fotos" ? "fotos" : "vídeos"}
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg leading-tight line-clamp-1 group-hover:text-pac-primary transition-colors mb-2">
              {categoria.nome}
            </h3>

            {categoria.descricao && (
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                {categoria.descricao}
              </p>
            )}
          </div>

          <div className="w-full mt-4 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full border-pac-primary text-pac-primary hover:bg-pac-primary hover:text-white font-semibold text-xs sm:text-sm transition-all",
                isDisabled &&
                  "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 hover:bg-gray-50 hover:text-gray-400 border-gray-200",
              )}
              disabled={isDisabled}
              asChild={!isDisabled}
            >
              {isDisabled ? (
                <span className="flex items-center justify-center gap-1">
                  <RiCameraOffLine className="w-3 h-3" />
                  {categoria.arquivada ? "Arquivada" : "Em breve"}
                </span>
              ) : (
                <Link href={`/galeria/${categoria.slug}`}>
                  <RiEyeLine className="w-4 h-4 mr-2" /> Visualizar Galeria
                </Link>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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

  if (loading)
    return (
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 bg-gray-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </section>
    );

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 py-12 sm:py-24">
      <div className="container mx-auto px-4 sm:px-8">
        <SectionHeader />

        {error ? (
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={loadData}>
              Tentar Novamente
            </Button>
          </div>
        ) : categorias.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {categorias.map((cat, idx) => (
                <GalleryCard key={cat.id} categoria={cat} index={idx} />
              ))}
            </div>
            <div className="text-center">
              <Button
                size="lg"
                asChild
                className="bg-pac-primary hover:bg-pac-primary-dark rounded-xl px-8 py-6 text-lg shadow-lg transition-transform hover:scale-105"
              >
                <Link href="/galeria" className="flex items-center gap-2">
                  <RiFolderLine className="w-5 h-5" /> Explorar Galeria Completa{" "}
                  <RiArrowRightLine />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white border border-dashed rounded-3xl max-w-lg mx-auto">
            <RiGalleryLine className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-gray-800 font-bold text-xl">
              Galeria em atualização
            </h3>
            <p className="text-gray-500 mb-6">
              Em breve teremos novos registros para você.
            </p>
            <Button variant="outline" asChild>
              <Link href="/galeria">Ver todas as categorias</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
