"use client";

import { useState, useEffect, useCallback } from "react";
// Removido useRouter pois não é mais necessário com o componente Link
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  RiNewspaperLine,
  RiSearchLine,
  RiCalendarLine,
  RiTimeLine,
  RiArrowRightLine,
  RiStarFill,
  RiFilterLine,
  RiSortAsc,
  RiSparklingFill,
  RiListOrdered,
  RiGridFill,
} from "react-icons/ri";
import Link from "next/link"; // ADICIONADO AQUI
import Image from "next/image";
import { motion } from "framer-motion"; // Removido AnimatePresence não utilizado
import { useNoticiasBasico, type SortBy } from "@/lib/stores/useNoticiasStore";
import type { NoticiaLista } from "@/app/actions/news/noticias";
import { cn } from "@/lib/utils/cn";

// --- Interfaces e Constantes ---

interface NewsCardProps {
  noticia: NoticiaLista;
  index: number;
}

interface CategoryItem {
  value: string;
  label: string;
}

const SORT_OPTIONS: Array<{
  value: SortBy;
  label: string;
  icon: React.ElementType;
}> = [
  { value: "recent", label: "Mais Recentes", icon: RiSparklingFill },
  { value: "oldest", label: "Mais Antigas", icon: RiCalendarLine },
  { value: "titulo", label: "Nome A-Z", icon: RiListOrdered },
  { value: "popular", label: "Mais Populares", icon: RiGridFill },
  { value: "destaque", label: "Em Destaque", icon: RiStarFill },
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: "6", label: "6 por página" },
  { value: "12", label: "12 por página" },
  { value: "24", label: "24 por página" },
];

// --- Componentes Auxiliares ---

function NewsCard({ noticia, index }: NewsCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const readingTime = Math.ceil((noticia.resumo?.length || 0) / 1000);
  const isPublished = noticia.status === "publicado";
  const imageUrl = noticia.media_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      {/* Card é apenas visual, não é link */}
      <Card className="group h-full flex flex-col border-gray-200 bg-white hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={noticia.titulo}
              fill
              className={cn(
                "object-cover transition-transform duration-700 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <RiNewspaperLine className="h-12 w-12" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-white/90 text-pac-primary hover:bg-white backdrop-blur-sm shadow-sm">
              {noticia.categoria || "Geral"}
            </Badge>
            {noticia.destaque && (
              <Badge className="bg-amber-500 text-white border-0 shadow-sm">
                <RiStarFill className="w-3 h-3 mr-1" /> Destaque
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <RiCalendarLine className="w-3 h-3 mr-1" />
              {new Date(noticia.data_publicacao).toLocaleDateString("pt-BR")}
            </div>
            {!isPublished && (
              <Badge variant="secondary" className="text-[10px] h-5">
                Rascunho
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-pac-primary transition-colors">
            {noticia.titulo}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 pt-2 flex-1 flex flex-col">
          <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
            {noticia.resumo}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center text-xs text-gray-500 font-medium">
              <RiTimeLine className="w-3 h-3 mr-1" />
              {readingTime} min leitura
            </div>

            {/* Botão com Link - A única parte clicável */}
            <Button
              asChild
              variant="link"
              className="text-pac-primary hover:text-pac-primary-dark p-0 h-auto font-semibold text-sm cursor-pointer"
            >
              <Link href={`/noticias/${noticia.slug}`}>
                Ler Completo
                <RiArrowRightLine className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="border-gray-100 shadow-sm h-96">
          <div className="h-48 bg-gray-200 animate-pulse" />
          <CardContent className="p-5 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-20 bg-gray-200 rounded w-full animate-pulse mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// --- Componente Principal ---

export default function NoticiasPage() {
  const [localSearch, setLocalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    noticias,
    loading,
    filtros,
    totalCount,
    categoriasDisponiveis,
    setSearchTerm,
    setCategoria,
    setSortBy,
    setItemsPerPage,
    setCurrentPage,
    clearFilters,
    fetchNoticias,
    fetchStats,
  } = useNoticiasBasico();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(localSearch), 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Sync search to store
  useEffect(() => {
    if (debouncedSearch !== filtros.searchTerm) {
      setSearchTerm(debouncedSearch);
      setCurrentPage(1);
    }
  }, [debouncedSearch, setSearchTerm, setCurrentPage, filtros.searchTerm]);

  // Initial loads
  useEffect(() => {
    fetchNoticias();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoriaChange = useCallback(
    (value: string) => {
      setCategoria(value);
      setCurrentPage(1);
    },
    [setCategoria, setCurrentPage],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setSortBy(value as SortBy);
      setCurrentPage(1);
    },
    [setSortBy, setCurrentPage],
  );

  const handleItemsPerPageChange = useCallback(
    (value: string) => {
      setItemsPerPage(Number(value));
      setCurrentPage(1);
    },
    [setItemsPerPage, setCurrentPage],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / (filtros.itemsPerPage || 10)),
  );
  const hasActiveFilters =
    filtros.searchTerm ||
    filtros.categoria !== "all" ||
    filtros.sortBy !== "recent";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simplificado e Limpo */}
      <section className="bg-white border-b border-gray-200 pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Notícias e <span className="text-pac-primary">Atualizações</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Acompanhe as últimas operações, treinamentos e comunicados oficiais
            da Patrulha Aérea Civil.
          </p>
        </div>
      </section>

      {/* Barra de Filtros */}
      <div className="sticky top-[80px] z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:max-w-md">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Pesquisar notícias..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 focus:border-pac-primary focus:ring-pac-primary/20"
              />
            </div>

            <div className="flex w-full md:w-auto gap-3 overflow-x-auto pb-2 md:pb-0">
              <Select
                value={filtros.categoria}
                onValueChange={handleCategoriaChange}
              >
                <SelectTrigger className="w-[180px] bg-gray-50">
                  <RiFilterLine className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasDisponiveis.map((c: CategoryItem) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtros.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] bg-gray-50">
                  <RiSortAsc className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Ordenar" />
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
                value={String(filtros.itemsPerPage)}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-[140px] bg-gray-50">
                  <SelectValue placeholder="Por página" />
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
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-red-600"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Notícias */}
      <section className="py-12 container mx-auto px-4">
        {loading ? (
          <SkeletonGrid />
        ) : noticias.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {noticias.map((noticia, index) => (
                <NewsCard key={noticia.id} noticia={noticia} index={index} />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={filtros.currentPage === 1}
                  onClick={() => setCurrentPage(filtros.currentPage - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 font-medium text-gray-600">
                  Página {filtros.currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={filtros.currentPage === totalPages}
                  onClick={() => setCurrentPage(filtros.currentPage + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <RiNewspaperLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600">
              Nenhuma notícia encontrada
            </h3>
            <p className="text-gray-500">
              Tente buscar por outro termo ou limpar os filtros.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
