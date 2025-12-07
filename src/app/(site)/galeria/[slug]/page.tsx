"use client";

import { notFound } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiCameraLine,
  RiImageLine,
  RiVideoLine,
  RiCalendarLine,
  RiDownloadLine,
  RiPlayLine,
  RiEyeLine,
  RiFolderLine,
  RiStackLine,
  RiStarFill,
  RiFilterLine,
} from "react-icons/ri";
import { GaleriaCategoria, GaleriaItem, TipoItem } from "@/types";

interface PageProps {
  params: {
    slug: string;
  };
}

type SortType = "recent" | "oldest" | "name" | "destaque";

// Tipo auxiliar para os dados do Supabase
interface SupabaseGaleriaCategoria {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: "fotos" | "videos";
  ordem: number;
  status: boolean;
  created_at: string;
  updated_at: string;
  arquivada: boolean;
}

interface SupabaseGaleriaItem {
  id: string;
  categoria_id: string | null;
  titulo: string;
  descricao: string | null;
  arquivo_url: string;
  tipo: TipoItem;
  thumbnail_url: string | null;
  ordem: number;
  autor_id: string | null;
  status: boolean;
  created_at: string;
  destaque: boolean;
}

export default function CategoriaGaleriaPage({ params }: PageProps) {
  const [categoria, setCategoria] = useState<GaleriaCategoria | null>(null);
  const [itens, setItens] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [filterDestaque, setFilterDestaque] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<SortType>("destaque");

  // 🔥 CORREÇÃO: Inicialização segura do Supabase
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupabase(createClient());
    }
  }, []);

  const ITEMS_PER_PAGE = 12;

  // Buscar dados da categoria
  const fetchData = useCallback(async () => {
    if (!supabase) return;

    try {
      setLoading(true);

      // 1. Buscar categoria pelo slug
      const { data: categoriaData, error: categoriaError } = await supabase
        .from("galeria_categorias")
        .select("*")
        .eq("slug", params.slug)
        .eq("status", true)
        .maybeSingle();

      if (categoriaError || !categoriaData) {
        setError("Categoria não encontrada");
        return;
      }

      // Converter para o tipo correto
      const supabaseCategoria =
        categoriaData as unknown as SupabaseGaleriaCategoria;
      const typedCategoria: GaleriaCategoria = {
        id: supabaseCategoria.id,
        nome: supabaseCategoria.nome,
        slug: supabaseCategoria.slug,
        descricao: supabaseCategoria.descricao || undefined,
        tipo: supabaseCategoria.tipo,
        ordem: supabaseCategoria.ordem,
        status: supabaseCategoria.status,
        arquivada: supabaseCategoria.arquivada,
        created_at: supabaseCategoria.created_at,
        updated_at: supabaseCategoria.updated_at,
      };

      setCategoria(typedCategoria);

      // 2. Contar total de itens da categoria
      let countQuery = supabase
        .from("galeria_itens")
        .select("*", { count: "exact", head: true })
        .eq("categoria_id", typedCategoria.id)
        .eq("status", true);

      if (filterDestaque !== null) {
        countQuery = countQuery.eq("destaque", filterDestaque);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Erro ao contar itens:", countError);
      }

      const totalCount = count || 0;
      const calculatedTotalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
      setTotalItens(totalCount);
      setTotalPages(calculatedTotalPages);

      // 3. Buscar itens com paginação
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("galeria_itens")
        .select("*")
        .eq("categoria_id", typedCategoria.id)
        .eq("status", true)
        .range(from, to);

      // Aplicar filtro de destaque
      if (filterDestaque !== null) {
        query = query.eq("destaque", filterDestaque);
      }

      // Aplicar ordenação
      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "name":
          query = query.order("titulo", { ascending: true });
          break;
        case "destaque":
          query = query.order("destaque", { ascending: false });
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data: itensData, error: itensError } = await query;

      if (itensError) {
        console.error("Erro ao buscar itens:", itensError);
      }

      // Converter para o tipo correto
      const supabaseItens = (itensData ||
        []) as unknown as SupabaseGaleriaItem[];
      const typedItens: GaleriaItem[] = supabaseItens.map((item) => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao || undefined,
        categoria_id: item.categoria_id || undefined,
        tipo: item.tipo,
        arquivo_url: item.arquivo_url,
        thumbnail_url: item.thumbnail_url || undefined,
        ordem: item.ordem,
        autor_id: item.autor_id || undefined,
        status: item.status,
        destaque: item.destaque,
        created_at: item.created_at,
      }));

      setItens(typedItens);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados da galeria");
    } finally {
      setLoading(false);
    }
  }, [params.slug, page, filterDestaque, sortBy, supabase]);

  useEffect(() => {
    if (supabase) {
      fetchData();
    }
  }, [fetchData, supabase]);

  // Resetar página quando mudar filtros
  useEffect(() => {
    setPage(1);
  }, [filterDestaque, sortBy]);

  if (loading && !categoria) {
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

  // Estatísticas da categoria
  const itensEmDestaque = itens.filter((item) => item.destaque).length;
  const totalFotos = itens.filter((item) => item.tipo === "foto").length;
  const totalVideos = itens.filter((item) => item.tipo === "video").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-navy-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-navy-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
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
          {/* Estatísticas e Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="border-2 border-navy-100 bg-gradient-to-br from-white to-navy-50/50 backdrop-blur-sm shadow-navy">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-navy-700 mb-1 font-bebas tracking-wide">
                        {totalItens}
                      </div>
                      <div className="text-slate-600 text-sm">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-navy-700 mb-1 font-bebas tracking-wide">
                        {itensEmDestaque}
                      </div>
                      <div className="text-slate-600 text-sm">Em Destaque</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-navy-700 mb-1 font-bebas tracking-wide">
                        {totalFotos}
                      </div>
                      <div className="text-slate-600 text-sm">Fotos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-navy-700 mb-1 font-bebas tracking-wide">
                        {totalVideos}
                      </div>
                      <div className="text-slate-600 text-sm">Vídeos</div>
                    </div>
                  </div>

                  {/* Botão voltar */}
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white font-semibold py-2 px-6 transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/galeria">Ver Todas Categorias</Link>
                  </Button>
                </div>

                {/* Filtros */}
                <div className="mt-6 pt-6 border-t border-navy-100">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          filterDestaque === null ? "default" : "outline"
                        }
                        className="cursor-pointer hover:bg-navy-100 transition-colors"
                        onClick={() => setFilterDestaque(null)}
                      >
                        Todos ({totalItens})
                      </Badge>
                      <Badge
                        variant={
                          filterDestaque === true ? "default" : "outline"
                        }
                        className="cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => setFilterDestaque(true)}
                      >
                        <RiStarFill className="w-3 h-3 mr-1" />
                        Em Destaque ({itensEmDestaque})
                      </Badge>
                    </div>

                    {/* Ordenação */}
                    <div className="flex items-center gap-2">
                      <RiFilterLine className="w-4 h-4 text-slate-500" />
                      <Select
                        value={sortBy}
                        onValueChange={(value: SortType) => setSortBy(value)}
                      >
                        <SelectTrigger className="border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none min-w-[160px]">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={5}
                          className="w-[var(--radix-select-trigger-width)] z-50"
                          avoidCollisions={true}
                        >
                          <SelectItem value="destaque">Em Destaque</SelectItem>
                          <SelectItem value="recent">Mais Recentes</SelectItem>
                          <SelectItem value="oldest">Mais Antigos</SelectItem>
                          <SelectItem value="name">Ordem Alfabética</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-2 border-slate-200">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : itens.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itens.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`group border-2 ${
                        item.destaque
                          ? "border-amber-200 hover:border-amber-300"
                          : item.tipo === "video"
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
                        {item.thumbnail_url ||
                        (item.tipo === "foto" && item.arquivo_url) ? (
                          <Image
                            src={item.thumbnail_url || item.arquivo_url}
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

                        {/* Badge de Destaque */}
                        {item.destaque && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                              <RiStarFill className="w-3 h-3 mr-1" />
                              Destaque
                            </Badge>
                          </div>
                        )}

                        {/* Overlay para vídeo */}
                        {item.tipo === "video" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <RiPlayLine className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        )}
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
                          <Badge variant="outline" className="text-xs">
                            {item.tipo === "video" ? "Vídeo" : "Foto"}
                          </Badge>
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

              {/* Paginação */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center mt-12"
                >
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setPage((prev) => Math.max(1, prev - 1))
                          }
                          className={
                            page === 1 ? "pointer-events-none opacity-50" : ""
                          }
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum = i + 1;
                          if (totalPages > 5) {
                            if (page <= 3) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = page - 2 + i;
                            }
                          }

                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                isActive={page === pageNum}
                                onClick={() => setPage(pageNum)}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setPage((prev) => Math.min(totalPages, prev + 1))
                          }
                          className={
                            page === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <div className="text-sm text-slate-500 ml-4 flex items-center">
                    Página {page} de {totalPages} • {totalItens} itens no total
                  </div>
                </motion.div>
              )}
            </>
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
                    {filterDestaque === true
                      ? "Nenhum item em destaque"
                      : "Nenhum item disponível"}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {filterDestaque === true
                      ? "Esta categoria ainda não possui itens em destaque."
                      : `Esta categoria ainda não possui ${
                          categoria.tipo === "fotos" ? "fotos" : "vídeos"
                        } publicados.`}
                  </p>
                  {filterDestaque !== null && (
                    <Button
                      variant="outline"
                      className="border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white transition-all duration-300"
                      onClick={() => setFilterDestaque(null)}
                    >
                      Ver todos os itens
                    </Button>
                  )}
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
