"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
  PaginationEllipsis,
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
  RiCalendarLine,
  RiDownloadLine,
  RiPlayLine,
  RiEyeLine,
  RiStarFill,
  RiFilterLine,
  RiSparklingFill,
  RiListOrdered,
  RiFireLine,
  RiEye2Line,
  RiCameraOffLine,
  RiVideoLine,
  RiImageLine,
} from "react-icons/ri";
import { useGaleriaStore } from "@/lib/stores/useGaleriaStore";
import type { ItemGaleria } from "@/app/actions/gallery/galeria";

// Configurações
const ITEMS_PER_PAGE_OPTIONS = [
  { value: "12", label: "12 por página" },
  { value: "24", label: "24 por página" },
  { value: "36", label: "36 por página" },
  { value: "48", label: "48 por página" },
  { value: "60", label: "60 por página" },
];

const SORT_OPTIONS = [
  { value: "destaque", label: "Em Destaque", icon: RiStarFill },
  { value: "recent", label: "Mais Recentes", icon: RiSparklingFill },
  { value: "oldest", label: "Mais Antigas", icon: RiCalendarLine },
  { value: "name", label: "Nome A-Z", icon: RiListOrdered },
  { value: "popular", label: "Mais Populares", icon: RiFireLine },
];

// URLs de fallback
const FALLBACK_IMAGE_FOTO = "/images/fallback-foto.jpg";
const FALLBACK_IMAGE_VIDEO = "/images/fallback-video.jpg";

// Componente de Item da Galeria
function GaleriaItemCard({ item }: { item: ItemGaleria }) {
  const [imageError, setImageError] = useState(false);
  const isVideo = item.tipo === "video";
  const imageUrl =
    item.thumbnail_url ||
    item.arquivo_url ||
    (isVideo ? FALLBACK_IMAGE_VIDEO : FALLBACK_IMAGE_FOTO);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <Card className="group border-2 border-navy-100 hover:border-navy-200 bg-white/90 backdrop-blur-sm shadow-navy hover:shadow-navy-lg transition-all duration-500 overflow-hidden h-full flex flex-col">
      <div className="relative h-48 w-full bg-gradient-to-br from-navy-50 to-blue-50 flex items-center justify-center overflow-hidden">
        {!imageError ? (
          <>
            <Image
              src={imageUrl}
              alt={item.titulo}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              onError={handleImageError}
              loading="lazy"
            />
            {item.destaque && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                  <RiStarFill className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
              </div>
            )}
            {isVideo && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <RiPlayLine className="h-7 w-7 text-white" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
              {isVideo ? (
                <RiVideoLine className="h-8 w-8 text-white" />
              ) : (
                <RiCameraOffLine className="h-8 w-8 text-white" />
              )}
            </div>
            <p className="text-white font-semibold text-sm">
              {isVideo ? "Vídeo" : "Imagem"} não disponível
            </p>
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
            <span>{new Date(item.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.views && item.views > 0 && (
              <span className="flex items-center">
                <RiEye2Line className="w-3 h-3 mr-1" />
                {item.views}
              </span>
            )}
            <Badge variant="outline" className="text-xs">
              {isVideo ? "Vídeo" : "Foto"}
            </Badge>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 border-2 ${
              isVideo
                ? "border-slate-300 text-slate-700 hover:bg-slate-600 hover:text-white"
                : "border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white"
            } transition-all duration-300 group/btn text-xs`}
            asChild
          >
            {isVideo ? (
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
  );
}

// Componente Principal da Página
export default function CategoriaGaleriaPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const {
    categoriaAtual,
    itens,
    loadingItens,
    errorItens,
    filtrosItens,
    fetchCategoriaPorSlug,
    fetchItensPorCategoria,
    setSortByItens,
    setDestaqueItens,
    setCurrentPageItens,
    setItemsPerPageItens,
    clearItens,
  } = useGaleriaStore();

  // Usar useRef para controlar o ciclo de dependências
  const initialLoadRef = useRef(false);
  const categoriaIdRef = useRef<string | null>(null);

  // Buscar categoria quando slug mudar
  useEffect(() => {
    if (!slug) return;

    const loadCategoria = async () => {
      try {
        initialLoadRef.current = true;
        const categoria = await fetchCategoriaPorSlug(slug);

        if (!categoria) {
          notFound();
        }
      } catch (error) {
        console.error("Erro ao carregar categoria:", error);
        notFound();
      }
    };

    loadCategoria();

    // Limpar estado quando desmontar
    return () => {
      clearItens();
      initialLoadRef.current = false;
    };
  }, [slug, fetchCategoriaPorSlug, clearItens, router]);

  // Buscar itens quando categoria estiver carregada
  useEffect(() => {
    if (!categoriaAtual?.id) return;

    // Evitar loop: só buscar se o categoriaId mudou OU é o primeiro carregamento
    if (
      categoriaIdRef.current !== categoriaAtual.id ||
      !initialLoadRef.current
    ) {
      categoriaIdRef.current = categoriaAtual.id;
      fetchItensPorCategoria(categoriaAtual.id);
    }
  }, [categoriaAtual?.id, fetchItensPorCategoria]);

  // Efeito separado para buscar itens quando os filtros mudam (exceto na primeira carga)
  useEffect(() => {
    if (!categoriaAtual?.id || !initialLoadRef.current) return;

    // Debounce para evitar múltiplas chamadas rápidas
    const timer = setTimeout(() => {
      fetchItensPorCategoria(categoriaAtual.id);
    }, 300);

    return () => clearTimeout(timer);
    // Dependências específicas - não incluir fetchItensPorCategoria
  }, [
    categoriaAtual?.id,
    filtrosItens.sortBy,
    filtrosItens.destaque,
    filtrosItens.currentPage,
    filtrosItens.itemsPerPage,
    fetchItensPorCategoria,
  ]);

  // Calcular total de páginas
  const totalPages = useMemo(
    () =>
      Math.max(1, Math.ceil(filtrosItens.total / filtrosItens.itemsPerPage)),
    [filtrosItens.total, filtrosItens.itemsPerPage]
  );

  // Handlers
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPageItens(page);
    },
    [setCurrentPageItens]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setSortByItens(
        value as "destaque" | "recent" | "oldest" | "name" | "popular"
      );
    },
    [setSortByItens]
  );

  const handleItemsPerPageChange = useCallback(
    (value: string) => {
      setItemsPerPageItens(Number(value));
    },
    [setItemsPerPageItens]
  );

  // Estatísticas
  const itensEmDestaque = useMemo(
    () => itens.filter((item) => item.destaque).length,
    [itens]
  );

  const totalFotos = useMemo(
    () => itens.filter((item) => item.tipo === "foto").length,
    [itens]
  );

  const totalVideos = useMemo(
    () => itens.filter((item) => item.tipo === "video").length,
    [itens]
  );

  // Loading ou categoria não encontrada
  if ((loadingItens && !categoriaAtual) || !categoriaAtual) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mb-4 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <p className="mt-4 text-slate-600">Carregando categoria...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (errorItens) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erro ao carregar categoria
          </h1>
          <p className="mb-4">{errorItens}</p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/galeria">
                <RiArrowLeftLine className="mr-2" />
                Voltar para Galeria
              </Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (slug) {
                  fetchCategoriaPorSlug(slug);
                }
              }}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white pt-32 pb-20 overflow-hidden">
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
              className="mb-8 text-navy-200 hover:text-white hover:bg-navy-500/20 px-4 py-2 rounded-lg border border-navy-300/20"
            >
              <Link href="/galeria">
                <RiArrowLeftLine className="mr-2 h-4 w-4" />
                Voltar para Galeria
              </Link>
            </Button>

            <Badge className="mb-6 bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 px-4 py-2 text-sm font-medium border">
              {categoriaAtual.tipo === "fotos"
                ? "Galeria de Fotos"
                : "Galeria de Vídeos"}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide leading-tight">
              {categoriaAtual.nome}
            </h1>
            <p className="text-lg md:text-xl text-navy-100 max-w-3xl leading-relaxed font-light">
              {categoriaAtual.descricao ||
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
                        {filtrosItens.total}
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
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    {/* Filtros rápidos */}
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          filtrosItens.destaque === null ? "default" : "outline"
                        }
                        className="cursor-pointer hover:bg-navy-100 transition-colors text-sm px-3 py-1"
                        onClick={() => setDestaqueItens(null)}
                      >
                        Todos ({filtrosItens.total})
                      </Badge>
                      <Badge
                        variant={
                          filtrosItens.destaque === true ? "default" : "outline"
                        }
                        className="cursor-pointer hover:bg-amber-100 transition-colors text-sm px-3 py-1"
                        onClick={() => setDestaqueItens(true)}
                      >
                        <RiStarFill className="w-3 h-3 mr-1" />
                        Em Destaque ({itensEmDestaque})
                      </Badge>
                    </div>

                    {/* Controles de ordenação e paginação */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      {/* Ordenação */}
                      <div className="min-w-[160px]">
                        <Select
                          value={filtrosItens.sortBy}
                          onValueChange={handleSortChange}
                        >
                          <SelectTrigger className="w-full border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-lg px-3 py-2 text-sm bg-white">
                            <div className="flex items-center">
                              <RiFilterLine className="w-4 h-4 mr-2 text-slate-500" />
                              <SelectValue placeholder="Ordenar por" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {SORT_OPTIONS.map((option) => {
                              const Icon = option.icon;
                              return (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Itens por página */}
                      <div className="min-w-[140px]">
                        <Select
                          value={filtrosItens.itemsPerPage.toString()}
                          onValueChange={handleItemsPerPageChange}
                        >
                          <SelectTrigger className="w-full border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-lg px-3 py-2 text-sm bg-white">
                            <SelectValue
                              placeholder={`${filtrosItens.itemsPerPage} por página`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Grid de Itens */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bebas tracking-wide text-slate-800 mb-4">
              {categoriaAtual.tipo === "fotos" ? "FOTOS" : "VÍDEOS"} DA GALERIA
            </h2>
            <div className="w-20 h-1 bg-navy-600 mx-auto rounded-full"></div>
          </div>

          {loadingItens ? (
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
                    <GaleriaItemCard item={item} />
                  </motion.div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <Pagination className="mt-12">
                  <PaginationContent className="flex-wrap">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(
                            Math.max(filtrosItens.currentPage - 1, 1)
                          )
                        }
                        className={
                          filtrosItens.currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - filtrosItens.currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && page - array[index - 1] > 1 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={filtrosItens.currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </div>
                      ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(filtrosItens.currentPage + 1, totalPages)
                          )
                        }
                        className={
                          filtrosItens.currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
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
                    {filtrosItens.destaque
                      ? "Nenhum item em destaque"
                      : "Nenhum item disponível"}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {filtrosItens.destaque
                      ? "Esta categoria ainda não possui itens em destaque."
                      : `Esta categoria ainda não possui ${
                          categoriaAtual.tipo === "fotos" ? "fotos" : "vídeos"
                        } publicados.`}
                  </p>
                  {filtrosItens.destaque && (
                    <Button
                      variant="outline"
                      className="border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white transition-all duration-300"
                      onClick={() => setDestaqueItens(null)}
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
    </div>
  );
}
