"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
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

// Icons
import {
  RiNewspaperLine,
  RiSearchLine,
  RiCalendarLine,
  RiTimeLine,
  RiArrowRightLine,
  RiStarFill,
  RiFilterLine,
  RiSortAsc,
  RiVideoLine,
  RiCloseLine,
} from "react-icons/ri";

// Store & Types
import { useNoticiasBasico, type SortBy } from "@/lib/stores/useNoticiasStore";
import type { NoticiaLista } from "@/app/actions/news/noticias";

// --- CONSTANTES ---

const SORT_OPTIONS = [
  { value: "recent", label: "Mais Recentes" },
  { value: "oldest", label: "Mais Antigas" },
  { value: "popular", label: "Mais Populares" },
  { value: "titulo", label: "Ordem Alfabética" },
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: "6", label: "6 por página" },
  { value: "12", label: "12 por página" },
  { value: "24", label: "24 por página" },
];

// --- HELPERS ---

const formatDate = (dateString: string): string => {
  if (!dateString) return "--/--/--";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/imagens-noticias/${url}`;
};

// --- COMPONENTES ---

function NewsCard({
  noticia,
  index,
}: {
  noticia: NoticiaLista;
  index: number;
}) {
  const imageUrl = getImageUrl(noticia.thumbnail_url || noticia.media_url);
  const hasImage = !!imageUrl;
  const isVideo = noticia.tipo_media === "video";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="group h-full flex flex-col border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white hover:-translate-y-1">
        {/* Imagem de Capa */}
        <div className="relative h-52 bg-slate-100 overflow-hidden">
          {hasImage ? (
            <Image
              src={imageUrl!}
              alt={noticia.titulo}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <RiNewspaperLine className="h-16 w-16 opacity-50" />
            </div>
          )}

          {/* Gradiente Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <Badge
              variant="secondary"
              className="bg-white/90 text-slate-800 hover:bg-white backdrop-blur-md shadow-sm border-0 font-bold px-2.5"
            >
              {noticia.categoria || "Geral"}
            </Badge>
            {isVideo && (
              <Badge className="bg-red-600 text-white border-0 shadow-sm flex items-center gap-1">
                <RiVideoLine className="w-3 h-3" /> Vídeo
              </Badge>
            )}
          </div>

          {noticia.destaque && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-amber-500 text-white border-0 shadow-md flex items-center gap-1">
                <RiStarFill className="w-3 h-3" /> Destaque
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex-1 flex flex-col p-6">
          {/* Metadados */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-3">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <RiCalendarLine className="w-3.5 h-3.5" />
              {formatDate(noticia.data_publicacao)}
            </div>
            <div className="flex items-center gap-1">
              <RiTimeLine className="w-3.5 h-3.5" />
              {Math.ceil((noticia.resumo?.length || 0) / 200)} min leitura
            </div>
          </div>

          {/* Título */}
          <Link
            href={`/noticias/${noticia.slug}`}
            className="block group/link mb-3"
          >
            <h3 className="text-xl font-bold text-slate-800 leading-snug line-clamp-2 group-hover/link:text-emerald-600 transition-colors">
              {noticia.titulo}
            </h3>
          </Link>

          {/* Resumo */}
          <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
            {noticia.resumo || "Clique para ler a matéria completa."}
          </p>

          {/* Botão */}
          <div className="pt-4 border-t border-slate-100 mt-auto">
            <Button
              asChild
              variant="link"
              className="text-emerald-600 hover:text-emerald-700 p-0 h-auto font-bold text-sm w-full justify-between group/btn no-underline hover:no-underline"
            >
              <Link href={`/noticias/${noticia.slug}`}>
                Ler Completo
                <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-full group-hover/btn:bg-emerald-100 transition-colors">
                  <RiArrowRightLine className="w-4 h-4 transition-transform group-hover/btn:-rotate-45" />
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card
          key={i}
          className="border-none shadow-sm h-[450px] bg-white rounded-xl overflow-hidden"
        >
          {/* Imagem Skeleton */}
          <div className="h-52 bg-slate-200 animate-pulse" />

          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
            </div>
            <div className="h-7 bg-slate-200 rounded w-full animate-pulse" />
            <div className="h-7 bg-slate-200 rounded w-2/3 animate-pulse" />
            <div className="h-20 bg-slate-200 rounded w-full animate-pulse mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---

export default function NoticiasPage() {
  const [localSearch, setLocalSearch] = useState("");

  const {
    noticias,
    loading,
    filters,
    pagination,
    categories,
    setFilters,
    setPagination,
    fetchNoticias,
    fetchCategories,
  } = useNoticiasBasico();

  // Inicialização
  useEffect(() => {
    fetchNoticias();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilters({ search: localSearch });
        fetchNoticias();
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const handleCategoriaChange = (value: string) => {
    setFilters({ categoria: value });
    fetchNoticias();
  };

  const handleSortChange = (value: string) => {
    setFilters({ sortBy: value as SortBy });
    fetchNoticias();
  };

  const handleItemsPerPageChange = (value: string) => {
    setPagination({ limit: Number(value), page: 1 });
    fetchNoticias();
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ page: newPage });
    fetchNoticias();
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setFilters({
      search: "",
      categoria: "all",
      sortBy: "recent",
    });
    fetchNoticias();
  };

  const hasActiveFilters =
    filters.search ||
    filters.categoria !== "all" ||
    filters.sortBy !== "recent";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Hero */}
      <section className="relative bg-slate-900 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-6 px-4 py-1.5 text-sm font-medium rounded-full">
              Portal de Comunicação
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Notícias e{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Atualizações
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              Fique por dentro das operações, treinamentos e comunicados
              oficiais da Patrulha Aérea Civil.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Barra de Ferramentas (Sticky) */}
      <div className="sticky top-[70px] z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm transition-all">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            {/* Busca */}
            <div className="relative w-full lg:max-w-md group">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Pesquisar por título, resumo..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 h-11 rounded-xl transition-all"
              />
            </div>

            {/* Filtros */}
            <div className="flex w-full lg:w-auto gap-3 overflow-x-auto pb-2 lg:pb-0 items-center no-scrollbar">
              <Select
                value={filters.categoria}
                onValueChange={handleCategoriaChange}
              >
                <SelectTrigger className="w-[160px] h-11 bg-white border-slate-200 rounded-xl hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2 text-slate-600 truncate">
                    <RiFilterLine className="w-4 h-4" />
                    <SelectValue placeholder="Categoria" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {/* Correção do erro de tipagem no map */}
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[160px] h-11 bg-white border-slate-200 rounded-xl hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2 text-slate-600">
                    <RiSortAsc className="w-4 h-4" />
                    <SelectValue placeholder="Ordenar" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(pagination.limit)}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-[140px] h-11 bg-white border-slate-200 rounded-xl hover:border-emerald-300 transition-colors">
                  <SelectValue placeholder="Qtd" />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearFilters}
                  className="h-11 w-11 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex-shrink-0"
                  title="Limpar filtros"
                >
                  <RiCloseLine className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Resultados */}
      <section className="py-12 container mx-auto px-4 max-w-7xl min-h-[600px]">
        {loading ? (
          <SkeletonGrid />
        ) : noticias.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              {noticias.map((noticia, index) => (
                <NewsCard key={noticia.id} noticia={noticia} index={index} />
              ))}
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pb-12">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="w-32 border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 bg-white"
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 py-2 font-bold text-sm text-slate-600 bg-white rounded-lg border border-slate-200 shadow-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="w-32 border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 bg-white"
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-white p-8 rounded-full shadow-sm mb-6 border border-slate-100">
              <RiNewspaperLine className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              Nenhuma notícia encontrada
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Não encontramos resultados para sua busca. Tente ajustar os
              filtros ou pesquisar por outro termo.
            </p>
            <Button
              variant="outline"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold px-8 h-12 rounded-xl"
              onClick={handleClearFilters}
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
