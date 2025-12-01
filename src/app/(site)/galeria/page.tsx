"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RiCameraLine,
  RiImageLine,
  RiVideoLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiStackLine,
  RiFolderLine,
  RiSearchLine,
  RiFilterLine,
  RiSortAsc,
  RiEyeLine,
  RiEyeOffLine,
  RiStarFill,
} from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GaleriaCategoria } from "@/types";

// ==================== INTERFACES LOCAIS ====================
interface GaleriaCategoriaComItens extends GaleriaCategoria {
  item_count: number;
  ultima_imagem_url?: string;
  tem_destaque?: boolean;
}

type SortType = "recent" | "oldest" | "popular" | "destaque";

// ==================== COMPONENTE PRINCIPAL ====================
export default function GaleriaPage() {
  const [categorias, setCategorias] = useState<GaleriaCategoriaComItens[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategorias, setTotalCategorias] = useState(0);

  const supabase = createClient();
  const ITEMS_PER_PAGE = 10;

  // Função para buscar categorias
  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);

      // Construir query base para contar total
      let countQuery = supabase
        .from("galeria_categorias")
        .select("*", { count: "exact", head: true })
        .eq("status", true)
        .eq("arquivada", false);

      if (searchTerm) {
        countQuery = countQuery.or(
          `nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`
        );
      }

      if (selectedTipo !== "all") {
        countQuery = countQuery.eq("tipo", selectedTipo);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Erro ao contar categorias:", countError);
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      setTotalCategorias(totalCount);
      setTotalPages(totalPages);

      // Buscar categorias com paginação
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("galeria_categorias")
        .select("*")
        .eq("status", true)
        .eq("arquivada", false)
        .range(from, to);

      if (searchTerm) {
        query = query.or(
          `nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`
        );
      }

      if (selectedTipo !== "all") {
        query = query.eq("tipo", selectedTipo);
      }

      // Aplicar ordenação
      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "destaque":
          query = query.order("ordem", { ascending: true });
          break;
        default:
          query = query
            .order("ordem", { ascending: true })
            .order("nome", { ascending: true });
      }

      const { data: categoriasData, error: categoriasError } = await query;

      if (categoriasError) {
        console.error("Erro ao buscar categorias:", categoriasError);
        throw categoriasError;
      }

      // Processar cada categoria
      const categoriasComItens = await Promise.all(
        (categoriasData || []).map(async (categoria) => {
          // Contar itens da categoria
          const { count } = await supabase
            .from("galeria_itens")
            .select("*", { count: "exact", head: true })
            .eq("categoria_id", categoria.id)
            .eq("status", true);

          // Verificar se há itens em destaque
          const { data: destaqueData } = await supabase
            .from("galeria_itens")
            .select("id")
            .eq("categoria_id", categoria.id)
            .eq("status", true)
            .eq("destaque", true)
            .limit(1);

          // Buscar última imagem para thumbnail
          let ultimaImagemUrl = undefined;
          if (count && count > 0) {
            const { data: ultimoItem } = await supabase
              .from("galeria_itens")
              .select("arquivo_url, thumbnail_url, created_at")
              .eq("categoria_id", categoria.id)
              .eq("status", true)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (ultimoItem) {
              ultimaImagemUrl =
                ultimoItem.thumbnail_url || ultimoItem.arquivo_url;
            }
          }

          return {
            ...categoria,
            item_count: count || 0,
            tem_destaque: !!destaqueData && destaqueData.length > 0,
            ultima_imagem_url: ultimaImagemUrl,
          };
        })
      );

      // Se for ordenação por popularidade, ordenar após buscar contagem
      if (sortBy === "popular") {
        categoriasComItens.sort((a, b) => b.item_count - a.item_count);
      }

      setCategorias(categoriasComItens as GaleriaCategoriaComItens[]);
    } catch (error) {
      console.error("Erro ao carregar galeria:", error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedTipo, sortBy, supabase]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias, page]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedTipo, sortBy, page]);

  // ✅ CALCULAR ESTATÍSTICAS
  const totalFotos = categorias
    .filter((cat) => cat.tipo === "fotos")
    .reduce((sum, cat) => sum + cat.item_count, 0);

  const totalVideos = categorias
    .filter((cat) => cat.tipo === "videos")
    .reduce((sum, cat) => sum + cat.item_count, 0);

  const categoriasComDestaque = categorias.filter(
    (cat) => cat.tem_destaque
  ).length;

  // Loading Skeleton
  if (loading && categorias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton className="h-10 sm:h-12 w-48 sm:w-64 mx-auto mb-3 sm:mb-4" />
            <Skeleton className="h-5 sm:h-6 w-80 sm:w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 sm:h-28 rounded-xl" />
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Skeleton className="h-12 flex-1" />
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 w-full lg:w-auto">
              <Skeleton className="h-12 w-full sm:w-48" />
              <Skeleton className="h-12 w-full sm:w-48" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader className="pb-3 sm:pb-4">
                  <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 sm:mb-6 bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
              <RiCameraLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Galeria de Mídia
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 font-bebas tracking-tight">
              <span className="bg-gradient-to-r from-blue-300 via-white to-indigo-300 bg-clip-text text-transparent">
                GALERIA PAC
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light px-2">
              Registros visuais das operações, treinamentos e projetos da
              <span className="font-semibold text-white">
                {" "}
                Patrulha Aérea Civil
              </span>
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-3xl mx-auto mt-8 sm:mt-10 lg:mt-12"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {totalFotos}
                </div>
                <div className="text-blue-200 text-xs sm:text-sm font-medium">
                  Fotos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {totalVideos}
                </div>
                <div className="text-blue-200 text-xs sm:text-sm font-medium">
                  Vídeos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {categorias.length}
                </div>
                <div className="text-blue-200 text-xs sm:text-sm font-medium">
                  Categorias
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {categoriasComDestaque}
                </div>
                <div className="text-blue-200 text-xs sm:text-sm font-medium">
                  Em Destaque
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filtros e Controles - SELECTS CORRIGIDOS (SEM DESLOCAMENTO) */}
      <section className="py-6 sm:py-8 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full max-w-2xl">
              <div className="relative">
                <RiSearchLine className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Controls - SELECTS CORRIGIDOS (SEM DESLOCAMENTO) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
              {/* Tipo Filter - CORRIGIDO */}
              <Select
                value={selectedTipo}
                onValueChange={(value) => setSelectedTipo(value)}
              >
                <SelectTrigger className="w-full sm:w-48 lg:w-64 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl py-2.5 sm:py-3 bg-white/50 backdrop-blur-sm text-sm sm:text-base">
                  <RiFilterLine className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent
                  className="z-[9999] w-[var(--radix-select-trigger-width)] max-h-[300px] overflow-y-auto"
                  position="popper"
                  sideOffset={5}
                  align="start"
                  avoidCollisions={false}
                >
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="fotos">
                    <div className="flex items-center">
                      <RiImageLine className="w-4 h-4 mr-2" />
                      Fotos
                    </div>
                  </SelectItem>
                  <SelectItem value="videos">
                    <div className="flex items-center">
                      <RiVideoLine className="w-4 h-4 mr-2" />
                      Vídeos
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sort - CORRIGIDO */}
              <Select
                value={sortBy}
                onValueChange={(value: SortType) => setSortBy(value)}
              >
                <SelectTrigger className="w-full sm:w-40 lg:w-48 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl py-2.5 sm:py-3 bg-white/50 backdrop-blur-sm text-sm sm:text-base">
                  <RiSortAsc className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent
                  className="z-[9999] w-[var(--radix-select-trigger-width)]"
                  position="popper"
                  sideOffset={5}
                  align="start"
                  avoidCollisions={false}
                >
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="oldest">Mais Antigas</SelectItem>
                  <SelectItem value="popular">Mais Itens</SelectItem>
                  <SelectItem value="destaque">Em Destaque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-bebas tracking-wide">
                {totalCategorias} CATEGORIAS ENCONTRADAS
              </h2>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                {searchTerm && `Buscando por: "${searchTerm}"`}
                {selectedTipo !== "all" &&
                  ` • Tipo: ${selectedTipo === "fotos" ? "Fotos" : "Vídeos"}`}
                {sortBy && ` • Ordenado por: ${sortBy}`}
              </p>
            </div>

            {categorias.length > 0 && (
              <div className="text-xs sm:text-sm text-slate-500">
                Página {page} de {totalPages} • {totalCategorias} categorias no
                total
              </div>
            )}
          </div>

          {/* Grid de Categorias */}
          <AnimatePresence mode="wait">
            {categorias.length > 0 ? (
              <>
                <motion.div
                  key={`grid-${sortBy}-${selectedTipo}-${page}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
                >
                  {categorias.map((categoria, index) => (
                    <motion.div
                      key={categoria.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GaleriaCard categoria={categoria} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center"
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
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-16"
              >
                <RiFolderLine className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-slate-300 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-bold text-slate-600 mb-3 sm:mb-4">
                  Nenhuma categoria encontrada
                </h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm sm:text-base px-4">
                  {searchTerm || selectedTipo !== "all"
                    ? "Tente ajustar os filtros ou termos de busca."
                    : "Ainda não há categorias cadastradas na galeria."}
                </p>
                {(searchTerm || selectedTipo !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedTipo("all");
                      setPage(1);
                    }}
                    className="mt-4"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-navy-600/5 via-blue-600/5 to-indigo-600/5">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm max-w-4xl mx-auto overflow-hidden">
              <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[size:60px_60px]" />
              <CardHeader className="text-center pb-4 sm:pb-6 pt-6 sm:pt-8 relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-navy-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <RiCameraLine className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bebas tracking-wide text-slate-800">
                  TEM FOTOS OU VÍDEOS?
                </CardTitle>
                <CardDescription className="text-slate-600 text-base sm:text-lg">
                  Contribua com nossa galeria documentando o trabalho da PAC
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6 sm:pb-8 relative z-10">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    <Link href="/contato">Enviar Material</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <Link href="/galeria">
                      <RiImageLine className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      Explorar Galeria
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ==================== COMPONENTE DE CARD DE GALERIA ====================
function GaleriaCard({ categoria }: { categoria: GaleriaCategoriaComItens }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isActive = categoria.status && !categoria.arquivada;

  return (
    <Card className="group border-2 border-slate-200/60 hover:border-navy-300/50 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col">
      {/* Image Container */}
      <div className="relative h-40 sm:h-44 lg:h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {categoria.ultima_imagem_url && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-200 animate-pulse" />
            )}
            <Image
              src={categoria.ultima_imagem_url}
              alt={categoria.nome}
              fill
              className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            {categoria.tipo === "videos" ? (
              <RiVideoLine className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" />
            ) : (
              <RiImageLine className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" />
            )}
          </div>
        )}

        {/* Overlay com badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2">
          {/* Status Badge */}
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="backdrop-blur-sm text-xs"
          >
            {isActive ? (
              <RiEyeLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            ) : (
              <RiEyeOffLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            )}
            {isActive ? "Ativa" : "Arquivada"}
          </Badge>

          {/* Tipo Badge */}
          <Badge
            className={`backdrop-blur-sm text-xs ${
              categoria.tipo === "videos"
                ? "bg-slate-600 hover:bg-slate-700 text-white"
                : "bg-navy-600 hover:bg-navy-700 text-white"
            }`}
          >
            {categoria.tipo === "videos" ? (
              <RiVideoLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            ) : (
              <RiImageLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            )}
            {categoria.tipo === "videos" ? "Vídeos" : "Fotos"}
          </Badge>

          {/* Destaque Badge */}
          {categoria.tem_destaque && (
            <Badge className="backdrop-blur-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs">
              <RiStarFill className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              Destaque
            </Badge>
          )}
        </div>

        {/* Item Count Badge */}
        <Badge className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 backdrop-blur-sm text-slate-700 border-0 text-xs">
          <RiStackLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
          {categoria.item_count} {categoria.item_count === 1 ? "item" : "itens"}
        </Badge>
      </div>

      <CardHeader className="pb-3 sm:pb-4 flex-grow px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-navy-600 transition-colors duration-300 font-bebas tracking-wide">
          {categoria.nome}
        </CardTitle>

        <CardDescription className="text-slate-600 leading-relaxed line-clamp-3 text-xs sm:text-sm mt-2">
          {categoria.descricao || "Categoria de mídia da Patrulha Aérea Civil"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 mt-auto px-4 sm:px-6">
        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 sm:mb-4">
          <div className="flex items-center">
            <RiCalendarLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs">
              {new Date(categoria.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <div className="text-xs font-medium">Ordem: {categoria.ordem}</div>
        </div>

        {/* Action Button */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className={`w-full border-navy-200 text-navy-700 hover:bg-navy-600 hover:text-white hover:border-navy-600 transition-all duration-300 group/btn text-xs sm:text-sm ${
            categoria.item_count === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={categoria.item_count === 0}
        >
          <Link href={`/galeria/${categoria.slug}`}>
            {categoria.item_count === 0 ? "Sem itens" : "Ver Galeria"}
            {categoria.item_count > 0 && (
              <RiArrowRightLine className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
            )}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
