// app/galeria/[slug]/page.tsx - CORRIGIDO COM FRAMER MOTION E TIPOS
"use client";

import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

// ✅ IMPORT CORRETO DO FRAMER MOTION
import { motion } from "framer-motion";

// Remix Icons
import {
  RiArrowLeftLine,
  RiCameraLine,
  RiImageLine,
  RiVideoLine,
  RiCalendarLine,
  RiMapPinLine,
  RiDownloadLine,
  RiPlayLine,
  RiEyeLine,
  RiFolderLine,
  RiStackLine,
} from "react-icons/ri";

// ✅ IMPORTANDO TIPOS DO SEU ARQUIVO
import { GaleriaCategoria, GaleriaItem } from "@/types";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CategoriaGaleriaPage({ params }: PageProps) {
  const [categoria, setCategoria] = useState<GaleriaCategoria | null>(null);
  const [itensDaCategoria, setItensDaCategoria] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Buscar categoria pelo slug
        const { data: categoriaData, error: categoriaError } = await supabase
          .from("galeria_categorias")
          .select("*")
          .eq("slug", params.slug)
          .eq("status", true)
          .single();

        if (categoriaError || !categoriaData) {
          setError("Categoria não encontrada");
          return;
        }

        setCategoria(categoriaData);

        // Buscar itens da categoria
        const { data: itensData, error: itensError } = await supabase
          .from("galeria_itens")
          .select(
            `
            *,
            categoria:galeria_categorias(*)
          `
          )
          .eq("categoria_id", categoriaData.id)
          .eq("status", true)
          .order("ordem", { ascending: true })
          .order("created_at", { ascending: false });

        if (itensError) {
          console.error("Erro ao buscar itens:", itensError);
        }

        setItensDaCategoria((itensData as GaleriaItem[]) || []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Erro ao carregar dados da galeria");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mb-4 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !categoria) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-navy-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-navy-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-navy-500/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-navy-300/5 rounded-full blur-2xl animate-pulse delay-1000" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* ✅ motion.div CORRETO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Button
              variant="ghost"
              asChild
              className="mb-8 text-navy-200 hover:text-white hover:bg-navy-500/20 transition-colors hover:border-navy-300/50 px-4 py-2 rounded-lg border border-navy-300/20"
            >
              <Link href="/galeria">
                <RiArrowLeftLine className="mr-2 h-4 w-4" />
                Voltar para Galeria
              </Link>
            </Button>

            <Badge className="mb-6 bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 px-4 py-2 text-sm font-medium border">
              <RiCameraLine className="w-4 h-4 mr-2" />
              {categoria.tipo === "fotos"
                ? "Galeria de Fotos"
                : "Galeria de Vídeos"}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide leading-tight">
              {categoria.nome}
            </h1>
            <p className="text-lg md:text-xl text-navy-100 max-w-3xl leading-relaxed font-light">
              {categoria.descricao ||
                "Coleção de mídia da Patrulha Aérea Civil"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Conteúdo da Galeria */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-offwhite-100">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Estatísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="border-2 border-navy-100 bg-gradient-to-br from-white to-navy-50/50 backdrop-blur-sm mb-8 shadow-navy">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <div className="text-2xl font-bold text-navy-700 mb-1 font-bebas tracking-wide">
                      {itensDaCategoria.length}{" "}
                      {categoria.tipo === "fotos" ? "Fotos" : "Vídeos"}
                    </div>
                    <div className="text-slate-600 text-sm">
                      nesta categoria
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white font-semibold py-2 px-6 transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/galeria">Explorar Outras Categorias</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Grid de Itens */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bebas tracking-wide text-slate-800 mb-4">
              {categoria.tipo === "fotos" ? "FOTOS" : "VÍDEOS"} DA GALERIA
            </h2>
            <div className="w-20 h-1 bg-navy-600 mx-auto rounded-full"></div>
          </div>

          {itensDaCategoria.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itensDaCategoria.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`group border-2 ${
                      item.tipo === "video"
                        ? "border-slate-200 hover:border-slate-300"
                        : "border-navy-100 hover:border-navy-200"
                    } bg-white/90 backdrop-blur-sm shadow-navy hover:shadow-navy-lg transition-all duration-500 overflow-hidden h-full flex flex-col`}
                  >
                    {/* Thumbnail */}
                    <div
                      className={`relative h-48 bg-gradient-to-br ${
                        item.tipo === "video"
                          ? "from-slate-100 to-slate-200"
                          : "from-navy-50 to-blue-50"
                      } flex items-center justify-center overflow-hidden`}
                    >
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt={item.titulo}
                          width={400}
                          height={192}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="text-center p-4">
                          {item.tipo === "video" ? (
                            <RiVideoLine className="h-12 w-12 text-slate-600/70 mx-auto mb-3" />
                          ) : (
                            <RiImageLine className="h-12 w-12 text-navy-600/70 mx-auto mb-3" />
                          )}
                          <span
                            className={`font-medium text-sm ${
                              item.tipo === "video"
                                ? "text-slate-700"
                                : "text-navy-700"
                            }`}
                          >
                            {item.titulo}
                          </span>
                        </div>
                      )}

                      {item.tipo === "video" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <RiPlayLine className="h-12 w-12 text-white" />
                        </div>
                      )}

                      <Badge
                        variant={
                          item.tipo === "video" ? "secondary" : "default"
                        }
                        className={`absolute top-3 right-3 backdrop-blur-sm text-xs ${
                          item.tipo === "video"
                            ? "bg-slate-100 text-slate-700 border-slate-200"
                            : "bg-navy-100 text-navy-700 border-navy-200"
                        }`}
                      >
                        {item.tipo === "video" ? (
                          <RiVideoLine className="w-2.5 h-2.5 mr-1" />
                        ) : (
                          <RiImageLine className="w-2.5 h-2.5 mr-1" />
                        )}
                        {item.tipo === "video" ? "Vídeo" : "Foto"}
                      </Badge>
                    </div>

                    <CardContent className="p-4 sm:p-6 flex-grow flex flex-col">
                      <h3 className="font-bebas tracking-wide text-lg text-slate-800 mb-2 group-hover:text-navy-600 transition-colors leading-tight">
                        {item.titulo}
                      </h3>

                      {item.descricao && (
                        <p className="text-slate-600 text-sm leading-relaxed mb-3 flex-grow line-clamp-3">
                          {item.descricao}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <div className="flex items-center">
                          <RiCalendarLine className="h-3 w-3 mr-1" />
                          <span>
                            {new Date(item.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                        {item.tipo === "foto" && (
                          <div className="flex items-center">
                            <RiMapPinLine className="h-3 w-3 mr-1" />
                            <span>PAC</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 border-2 ${
                            item.tipo === "video"
                              ? "border-slate-300 text-slate-700 hover:bg-slate-600 hover:text-white"
                              : "border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white"
                          } transition-all duration-300 group/btn text-xs`}
                          asChild
                        >
                          {item.tipo === "video" ? (
                            <a
                              href={item.arquivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                            >
                              Assistir
                              <RiPlayLine className="ml-2 h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </a>
                          ) : (
                            <a
                              href={item.arquivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                            >
                              Visualizar
                              <RiEyeLine className="ml-2 h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </a>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 rounded-full hover:bg-navy-600 hover:text-white transition-all duration-300 border border-slate-200"
                          asChild
                        >
                          <a href={item.arquivo_url} download>
                            <RiDownloadLine className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-offwhite-50 backdrop-blur-sm max-w-md mx-auto">
                <CardContent className="p-8">
                  <RiImageLine className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Nenhum item disponível
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Esta categoria ainda não possui{" "}
                    {categoria.tipo === "fotos" ? "fotos" : "vídeos"}{" "}
                    publicados.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white transition-all duration-300"
                  >
                    <Link href="/galeria">
                      <RiArrowLeftLine className="mr-2 h-4 w-4" />
                      Voltar para Galeria
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-navy-50 via-blue-50 to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-navy-200 bg-gradient-to-br from-white to-navy-50/50 backdrop-blur-sm max-w-4xl mx-auto overflow-hidden shadow-navy-lg">
              <div className="absolute inset-0 bg-grid-navy-900/[0.02] bg-[size:60px_60px]" />
              <CardHeader className="text-center pb-6 pt-8 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-navy-600 to-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-navy">
                  <RiFolderLine className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bebas tracking-wide text-navy-800">
                  MAIS CONTEÚDO VISUAL
                </CardTitle>
                <CardDescription className="text-slate-600 text-sm sm:text-base">
                  Explore nossas outras categorias e descubra mais sobre o
                  trabalho da Patrulha Aérea Civil
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8 relative z-10">
                <Button
                  asChild
                  className="bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white font-semibold py-3 px-8 transition-all duration-300 hover:scale-105 shadow-navy"
                >
                  <Link href="/galeria">
                    <RiStackLine className="mr-2 h-4 w-4" />
                    Ver Todas as Categorias
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
