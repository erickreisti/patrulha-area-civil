"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  RiNewspaperLine,
  RiSearchLine,
  RiCalendarLine,
  RiUserLine,
  RiTimeLine,
  RiArrowRightLine,
  RiStarFill,
  RiEyeLine,
  RiEyeOffLine,
  RiFilterLine,
  RiSortAsc,
  RiMailLine,
  RiNotificationLine,
  RiStackLine,
  RiSortDesc,
  RiFireLine,
} from "react-icons/ri";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useNoticiasStore, NoticiaLista } from "@/lib/stores/useNoticiasStore";
import { getNews, getNewsStats } from "@/app/actions/news";

// ==================== CONFIGURAÇÕES ====================
const ITEMS_PER_PAGE_OPTIONS = [
  { value: "6", label: "6 por página" },
  { value: "10", label: "10 por página" },
  { value: "20", label: "20 por página" },
  { value: "30", label: "30 por página" },
  { value: "50", label: "50 por página" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Mais Recentes", icon: RiSortDesc },
  { value: "oldest", label: "Mais Antigas", icon: RiSortAsc },
  { value: "destaque", label: "Em Destaque", icon: RiStarFill },
  { value: "popular", label: "Mais Populares", icon: RiFireLine },
];

// ==================== COMPONENTE PRINCIPAL ====================
export default function NoticiasPage() {
  const router = useRouter();

  // Usar o store de notícias
  const {
    noticias,
    loadingLista,
    filtros,
    totalCount,
    categoriasDisponiveis,
    stats,
    setSearchTerm,
    setCategoria,
    setSortBy,
    setItemsPerPage,
    setCurrentPage,
    clearFilters,
    setNoticias,
    setCategoriasDisponiveis,
    setStats,
    setTotalCount,
    setLoadingLista,
  } = useNoticiasStore();

  // Estado local para busca com debounce
  const [localSearch, setLocalSearch] = useState(filtros.searchTerm);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Função para ordenar notícias
  const sortNoticias = useCallback(
    (noticiasList: NoticiaLista[], sortBy: string) => {
      if (sortBy === "recent") {
        return [...noticiasList].sort(
          (a, b) =>
            new Date(b.data_publicacao).getTime() -
            new Date(a.data_publicacao).getTime()
        );
      } else if (sortBy === "oldest") {
        return [...noticiasList].sort(
          (a, b) =>
            new Date(a.data_publicacao).getTime() -
            new Date(b.data_publicacao).getTime()
        );
      } else if (sortBy === "destaque") {
        return [...noticiasList].sort(
          (a, b) =>
            (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0) ||
            new Date(b.data_publicacao).getTime() -
              new Date(a.data_publicacao).getTime()
        );
      } else if (sortBy === "popular") {
        return [...noticiasList].sort(
          (a, b) =>
            (b.views || 0) - (a.views || 0) ||
            new Date(b.data_publicacao).getTime() -
              new Date(a.data_publicacao).getTime()
        );
      }
      return noticiasList;
    },
    []
  );

  // Função para buscar notícias
  const fetchNoticias = useCallback(async () => {
    setLoadingLista(true);
    try {
      const options = {
        limit: filtros.itemsPerPage,
        page: filtros.currentPage,
        search: filtros.searchTerm || undefined,
        category: filtros.categoria !== "all" ? filtros.categoria : undefined,
        featured: filtros.sortBy === "destaque" ? true : undefined,
      };

      const result = await getNews(options);

      if (result.success) {
        let sortedNoticias = result.data;

        // Ordenar localmente se necessário
        if (filtros.sortBy === "popular" || filtros.sortBy === "oldest") {
          sortedNoticias = sortNoticias(result.data, filtros.sortBy);
        }

        setNoticias(sortedNoticias);
        setTotalCount(result.pagination.total);

        // Extrair categorias únicas das notícias
        const categoriasUnicas = Array.from(
          new Set(
            result.data
              .map((n) => n.categoria)
              .filter(
                (cat): cat is string =>
                  cat !== null && cat !== undefined && cat.trim() !== ""
              )
          )
        );

        const categoriasOptions = [
          { value: "all", label: "Todas categorias" },
          ...categoriasUnicas.map((cat) => ({
            value: cat,
            label: cat,
          })),
        ];

        setCategoriasDisponiveis(categoriasOptions);
      }
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
      setNoticias([]);
      setTotalCount(0);
      setCategoriasDisponiveis([{ value: "all", label: "Todas categorias" }]);
    } finally {
      setLoadingLista(false);
    }
  }, [
    filtros,
    setNoticias,
    setCategoriasDisponiveis,
    setTotalCount,
    setLoadingLista,
    sortNoticias,
  ]);

  // Função para buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const result = await getNewsStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  }, [setStats]);

  // Debounce para busca
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setSearchTerm(localSearch);
      setCurrentPage(1);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localSearch, setSearchTerm, setCurrentPage]);

  // Buscar notícias quando filtros mudam
  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  // Buscar estatísticas no início
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Calcular total de páginas
  const totalPages = Math.max(1, Math.ceil(totalCount / filtros.itemsPerPage));

  // Função para formatar nome do autor
  const formatAuthorName = (name?: string | null) => {
    if (!name) return "Autor";
    const firstName = name.split(" ")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  // Função para corrigir URL da imagem
  const getImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith("http")) return url;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = "imagens-noticias";

    if (url.includes("/") && !url.startsWith("http")) {
      if (url.includes(bucket)) {
        return `${supabaseUrl}/storage/v1/object/public/${url}`;
      } else {
        return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
      }
    }

    return url;
  };

  // Loading Skeleton
  if (loadingLista && noticias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton className="h-10 sm:h-12 w-48 sm:w-64 mx-auto mb-3 sm:mb-4" />
            <Skeleton className="h-5 sm:h-6 w-80 sm:w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: filtros.itemsPerPage }).map((_, i) => (
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
      <section className="relative bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white pt-16 pb-16 sm:pb-20 lg:pb-24 overflow-hidden">
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
              <RiNewspaperLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Centro de Notícias
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 font-bebas tracking-tight">
              <span className="bg-gradient-to-r from-blue-300 via-white to-indigo-300 bg-clip-text text-transparent">
                NOTÍCIAS PAC
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light px-2">
              Fique por dentro de todas as operações, treinamentos e projetos da
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
              className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-2xl mx-auto mt-8 sm:mt-10 lg:mt-12"
            >
              {[
                { value: stats.total, label: "Total" },
                { value: stats.published, label: "Publicadas" },
                { value: stats.featured, label: "Em Destaque" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Seção de Filtros */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 relative z-50">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full max-w-2xl">
              <div className="relative">
                <RiSearchLine className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder="Buscar em notícias..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                />
                {localSearch && (
                  <button
                    onClick={() => {
                      setLocalSearch("");
                      setSearchTerm("");
                    }}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors w-4 h-4 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
              {/* Category Filter */}
              <div className="min-w-[200px]">
                <Select
                  value={filtros.categoria}
                  onValueChange={(value) => {
                    setCategoria(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48 lg:w-64 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl py-2.5 sm:py-3 bg-white/50 backdrop-blur-sm text-sm sm:text-base">
                    <div className="flex items-center">
                      <RiFilterLine className="w-4 h-4 mr-2 text-slate-500" />
                      <SelectValue placeholder="Filtrar por categoria" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white shadow-xl border-slate-200">
                    {categoriasDisponiveis.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="min-w-[180px]">
                <Select
                  value={filtros.sortBy}
                  onValueChange={(
                    value: "recent" | "oldest" | "destaque" | "popular"
                  ) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40 lg:w-48 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl py-2.5 sm:py-3 bg-white/50 backdrop-blur-sm text-sm sm:text-base">
                    <div className="flex items-center">
                      <RiSortAsc className="w-4 h-4 mr-2 text-slate-500" />
                      <SelectValue placeholder="Ordenar por" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white shadow-xl border-slate-200">
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
                      >
                        <div className="flex items-center">
                          <option.icon className="w-4 h-4 mr-2" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items per Page */}
              <div className="min-w-[160px]">
                <Select
                  value={filtros.itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-36 lg:w-40 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl py-2.5 sm:py-3 bg-white/50 backdrop-blur-sm text-sm sm:text-base">
                    <SelectValue
                      placeholder={`${filtros.itemsPerPage} por página`}
                    >
                      {filtros.itemsPerPage} por página
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white shadow-xl border-slate-200">
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Indicadores de filtros ativos */}
          {(filtros.searchTerm ||
            filtros.categoria !== "all" ||
            filtros.sortBy !== "recent") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filtros.searchTerm && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700"
                >
                  Busca: &quot;{filtros.searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-blue-900 w-3 h-3 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </Badge>
              )}
              {filtros.categoria !== "all" && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-50 border-green-200 text-green-700"
                >
                  <RiFilterLine className="w-3 h-3" />
                  {
                    categoriasDisponiveis.find(
                      (c) => c.value === filtros.categoria
                    )?.label
                  }
                  <button
                    onClick={() => setCategoria("all")}
                    className="ml-1 hover:text-green-900 w-3 h-3 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </Badge>
              )}
              {filtros.sortBy !== "recent" && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-purple-50 border-purple-200 text-purple-700"
                >
                  <RiSortAsc className="w-3 h-3" />
                  {SORT_OPTIONS.find(
                    (option) => option.value === filtros.sortBy
                  )?.label || filtros.sortBy}
                  <button
                    onClick={() => setSortBy("recent")}
                    className="ml-1 hover:text-purple-900 w-3 h-3 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearFilters();
                  setLocalSearch("");
                }}
                className="h-6 text-xs"
              >
                Limpar todos
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-bebas tracking-wide">
                {totalCount} NOTÍCIAS ENCONTRADAS
              </h2>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                {filtros.searchTerm && `Buscando por: "${filtros.searchTerm}"`}
                {filtros.categoria !== "all" &&
                  ` • Categoria: ${
                    categoriasDisponiveis.find(
                      (c) => c.value === filtros.categoria
                    )?.label
                  }`}
              </p>
            </div>

            {noticias.length > 0 && (
              <div className="text-xs sm:text-sm text-slate-500">
                Página {filtros.currentPage} de {totalPages} • {totalCount}{" "}
                resultados
                <span className="ml-2 font-medium">
                  • {filtros.itemsPerPage} por página
                </span>
              </div>
            )}
          </div>

          {/* Grid de Notícias */}
          <AnimatePresence mode="wait">
            {loadingLista ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: filtros.itemsPerPage }).map((_, i) => (
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
            ) : noticias.length > 0 ? (
              <motion.div
                key={`grid-${filtros.currentPage}-${filtros.categoria}-${filtros.searchTerm}-${filtros.itemsPerPage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
              >
                {noticias.map((noticia, index) => (
                  <motion.div
                    key={noticia.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NewsCard
                      noticia={noticia}
                      formatAuthorName={formatAuthorName}
                      getImageUrl={getImageUrl}
                      isFirst={index === 0}
                      router={router}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-16"
              >
                <RiNewspaperLine className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-slate-300 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-bold text-slate-600 mb-3 sm:mb-4">
                  Nenhuma notícia encontrada
                </h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm sm:text-base px-4">
                  {filtros.searchTerm || filtros.categoria !== "all"
                    ? "Tente ajustar os filtros ou termos de busca."
                    : "Ainda não há notícias publicadas. Volte em breve!"}
                </p>
                {(filtros.searchTerm ||
                  filtros.categoria !== "all" ||
                  filtros.sortBy !== "recent") && (
                  <Button
                    onClick={() => {
                      clearFilters();
                      setLocalSearch("");
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Limpar todos os filtros
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination className="mb-8 sm:mb-12">
              <PaginationContent className="flex-wrap">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage(Math.max(filtros.currentPage - 1, 1))
                    }
                    className={
                      filtros.currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Primeira página */}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(1)}
                    isActive={filtros.currentPage === 1}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {/* Elipsis após primeira página */}
                {filtros.currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Páginas do meio */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page > 1 && page < totalPages)
                  .filter((page) => Math.abs(page - filtros.currentPage) <= 1)
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={filtros.currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                {/* Elipsis antes da última página */}
                {filtros.currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Última página */}
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(totalPages)}
                      isActive={filtros.currentPage === totalPages}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(
                        Math.min(filtros.currentPage + 1, totalPages)
                      )
                    }
                    className={
                      filtros.currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      {/* Newsletter */}
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
                  <RiMailLine className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bebas tracking-wide text-slate-800">
                  RECEBA NOSSAS NOTÍCIAS
                </CardTitle>
                <CardDescription className="text-slate-600 text-base sm:text-lg">
                  Fique por dentro de todas as atualizações da PAC
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6 sm:pb-8 relative z-10">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    className="flex-1 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-300 bg-white/50 text-sm sm:text-base"
                  />
                  <Button className="bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base">
                    <RiNotificationLine className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Cadastrar
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

// ==================== COMPONENTE DE CARD DE NOTÍCIA ====================
interface NewsCardProps {
  noticia: NoticiaLista;
  formatAuthorName: (name?: string | null) => string;
  getImageUrl: (url: string | null | undefined) => string | null;
  isFirst?: boolean;
  router: ReturnType<typeof useRouter>;
}

function NewsCard({
  noticia,
  formatAuthorName,
  getImageUrl,
  isFirst = false,
  router,
}: NewsCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const readingTime = Math.ceil((noticia.resumo?.length || 0) / 1000);
  const isPublished = noticia.status === "publicado";
  const imageUrl = getImageUrl(noticia.imagem);

  // Helper para obter nome do autor
  const getAuthorName = () => {
    const name = noticia.autor?.full_name;
    return name ? formatAuthorName(name) : "Autor";
  };

  // Função para lidar com clique no card
  const handleCardClick = () => {
    if (isPublished && noticia.slug) {
      router.push(`/noticias/${noticia.slug}`);
    }
  };

  // Função para lidar com clique no botão
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  return (
    <Card
      className="group border-2 border-slate-200/60 hover:border-navy-300/50 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative h-40 sm:h-44 lg:h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {imageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-200 animate-pulse" />
            )}
            <Image
              src={imageUrl}
              alt={noticia.titulo}
              fill
              className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={isFirst}
              loading={isFirst ? "eager" : "lazy"}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <RiNewspaperLine className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
          </div>
        )}

        {/* Overlay com badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2">
          {/* Status Badge */}
          <Badge
            variant={isPublished ? "default" : "secondary"}
            className="backdrop-blur-sm text-xs"
          >
            {isPublished ? (
              <RiEyeLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            ) : (
              <RiEyeOffLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            )}
            {isPublished ? "Publicado" : "Rascunho"}
          </Badge>

          {/* Destaque Badge */}
          {noticia.destaque && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white backdrop-blur-sm text-xs">
              <RiStarFill className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              Destaque
            </Badge>
          )}
        </div>

        {/* Category Badge */}
        <Badge className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 backdrop-blur-sm text-slate-700 border-0 text-xs">
          <RiStackLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
          {noticia.categoria || "Geral"}
        </Badge>
      </div>

      <CardHeader className="pb-3 sm:pb-4 flex-grow px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-navy-600 transition-colors duration-300 font-bebas tracking-wide">
          {noticia.titulo}
        </CardTitle>

        <CardDescription className="text-slate-600 leading-relaxed line-clamp-3 text-xs sm:text-sm mt-2">
          {noticia.resumo || "Leia mais sobre esta notícia..."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 mt-auto px-4 sm:px-6">
        {/* Meta Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 mb-3 sm:mb-4 gap-2 sm:gap-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center">
              <RiUserLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs font-medium">{getAuthorName()}</span>
            </div>
            <div className="flex items-center">
              <RiCalendarLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs">
                {new Date(noticia.data_publicacao).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>

          <div className="flex items-center text-xs font-medium">
            <RiTimeLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {readingTime} min
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleButtonClick}
          variant="outline"
          size="sm"
          className="w-full border-navy-200 text-navy-700 hover:bg-navy-600 hover:text-white hover:border-navy-600 transition-all duration-300 group/btn text-xs sm:text-sm"
        >
          Ler Notícia
          <RiArrowRightLine className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
