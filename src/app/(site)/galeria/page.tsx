"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  RiGalleryLine,
  RiCheckLine,
  RiGridFill,
  RiListOrdered,
  RiSparklingFill,
  RiCameraOffLine,
  RiVideoAddLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoriasGaleria } from "@/app/actions/gallery/galeria";
import { toast } from "sonner";
import Image from "next/image";

// ==================== CONFIGURAÇÕES ====================
const ITEMS_PER_PAGE_OPTIONS = [
  { value: "6", label: "6 por página" },
  { value: "10", label: "10 por página" },
  { value: "20", label: "20 por página" },
  { value: "30", label: "30 por página" },
  { value: "50", label: "50 por página" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Mais Recentes", icon: RiSparklingFill },
  { value: "oldest", label: "Mais Antigas", icon: RiCalendarLine },
  { value: "name", label: "Nome A-Z", icon: RiListOrdered },
  { value: "popular", label: "Mais Itens", icon: RiGridFill },
  { value: "destaque", label: "Em Destaque", icon: RiStarFill },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Todos os Tipos", icon: RiGalleryLine },
  { value: "fotos", label: "Fotos", icon: RiImageLine },
  { value: "videos", label: "Vídeos", icon: RiVideoLine },
];

// Interface para categorias
interface CategoriaGaleria {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: "fotos" | "videos";
  ordem: number;
  status: boolean;
  arquivada: boolean;
  created_at: string;
  updated_at: string;
  item_count: number;
  tem_destaque: boolean;
  ultima_imagem_url?: string;
}

// ==================== FUNÇÕES AUXILIARES ====================
function getSortLabel(sortBy: string): string {
  const option = SORT_OPTIONS.find((opt) => opt.value === sortBy);
  return option ? option.label : "Relevância";
}

// ==================== COMPONENTE DE CARD DE GALERIA ====================
function GaleriaCard({ categoria }: { categoria: CategoriaGaleria }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isActive = categoria.status && !categoria.arquivada;

  // Memoizar propriedades da categoria que usamos no placeholder
  const {
    tipo: categoriaTipo,
    tem_destaque: categoriaDestaque,
    nome,
  } = categoria;

  // Função para gerar placeholder baseado no tipo de categoria
  const getPlaceholderForCategoria = useCallback(() => {
    const isVideo = categoriaTipo === "videos";
    const isDestaque = categoriaDestaque;

    return (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${
          isVideo
            ? "bg-gradient-to-br from-purple-800 to-pink-900"
            : isDestaque
            ? "bg-gradient-to-br from-amber-800 to-orange-900"
            : "bg-gradient-to-br from-navy-800 to-blue-900"
        }`}
      >
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3 ${
            isVideo
              ? "bg-gradient-to-r from-purple-500 to-pink-600"
              : isDestaque
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-navy-500 to-blue-600"
          }`}
        >
          {isVideo ? (
            <RiVideoAddLine className="h-6 w-6 text-white" />
          ) : (
            <RiCameraOffLine className="h-6 w-6 text-white" />
          )}
        </div>
        <div className="text-center">
          <p className="text-white font-semibold mb-1 text-xs sm:text-sm">
            {isVideo ? "Vídeos não disponíveis" : "Fotos não disponíveis"}
          </p>
          <p className="text-white/70 text-xs">{nome}</p>
        </div>
        <RiErrorWarningLine className="absolute top-2 left-2 h-4 w-4 text-amber-300" />
      </div>
    );
  }, [categoriaTipo, categoriaDestaque, nome]); // CORRIGIDO: Apenas dependências necessárias

  // Função para renderizar a imagem ou placeholder
  const renderImageOrPlaceholder = useCallback(() => {
    // Se já teve erro, mostra placeholder imediatamente
    if (imageError) {
      return getPlaceholderForCategoria();
    }

    // Se tem URL de imagem, tenta carregar
    if (categoria.ultima_imagem_url) {
      return (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
          )}
          <Image
            src={categoria.ultima_imagem_url}
            alt={categoria.nome}
            fill
            className={`object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)} // SÓ UMA TENTATIVA
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        </>
      );
    }

    // Se não tem URL, mostra placeholder
    return getPlaceholderForCategoria();
  }, [
    categoria.ultima_imagem_url,
    categoria.nome,
    imageLoaded,
    imageError,
    getPlaceholderForCategoria, // Apenas esta função como dependência
  ]); // CORRIGIDO: Removidas dependências desnecessárias

  return (
    <Card className="group border-2 border-slate-200/60 hover:border-navy-300/50 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col">
      {/* Image Container */}
      <div className="relative h-40 sm:h-44 lg:h-48 overflow-hidden">
        {renderImageOrPlaceholder()}

        {/* Overlay com badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2">
          {/* Status Badge */}
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="backdrop-blur-sm text-xs border-0"
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
            className={`backdrop-blur-sm text-xs border-0 ${
              categoria.tipo === "videos"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-gradient-to-r from-navy-600 to-blue-600 text-white"
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
            <Badge className="backdrop-blur-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs border-0">
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
              {new Date(categoria.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="text-xs font-medium bg-slate-100 px-2 py-1 rounded-full">
            Ordem: {categoria.ordem}
          </div>
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
            {categoria.item_count === 0 ? (
              <>
                <RiCheckLine className="w-3 h-3 mr-1.5" />
                Sem itens
              </>
            ) : (
              <>
                Ver Galeria
                <RiArrowRightLine className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </>
            )}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function GaleriaPage() {
  const [categorias, setCategorias] = useState<CategoriaGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCategorias, setTotalCategorias] = useState(0);

  // Estado para busca com debounce
  const [localSearch, setLocalSearch] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Filtros locais
  const [filtros, setFiltros] = useState({
    searchTerm: "",
    tipo: "all" as "all" | "fotos" | "videos",
    sortBy: "recent" as "recent" | "oldest" | "popular" | "destaque" | "name",
    currentPage: 1,
    itemsPerPage: 12,
  });

  // Debounce para busca
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setFiltros((prev) => ({
        ...prev,
        searchTerm: localSearch,
        currentPage: 1,
      }));
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localSearch]);

  // Carregar categorias com server actions
  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getCategoriasGaleria({
        tipo: filtros.tipo,
        search: filtros.searchTerm,
        sortBy: filtros.sortBy,
        limit: filtros.itemsPerPage,
        page: filtros.currentPage,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setCategorias(result.data as CategoriaGaleria[]);
      setTotalCategorias(result.total);
    } catch (err: unknown) {
      console.error("Erro ao carregar categorias:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar galeria";
      setError(errorMessage);
      toast.error("Erro ao carregar categorias da galeria");
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Carregar categorias quando os filtros mudam
  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  // Calcular total de páginas
  const totalPages = Math.max(
    1,
    Math.ceil(totalCategorias / filtros.itemsPerPage)
  );

  // Estatísticas
  const totalFotos = categorias
    .filter((cat) => cat.tipo === "fotos")
    .reduce((sum, cat) => sum + cat.item_count, 0);

  const totalVideos = categorias
    .filter((cat) => cat.tipo === "videos")
    .reduce((sum, cat) => sum + cat.item_count, 0);

  const categoriasComDestaque = categorias.filter(
    (cat) => cat.tem_destaque
  ).length;

  // Handlers para filtros
  const handleTipoChange = (value: string) => {
    setFiltros((prev) => ({
      ...prev,
      tipo: value as "all" | "fotos" | "videos",
      currentPage: 1,
    }));
  };

  const handleSortChange = (value: string) => {
    setFiltros((prev) => ({
      ...prev,
      sortBy: value as "recent" | "oldest" | "popular" | "destaque" | "name",
      currentPage: 1,
    }));
  };

  const handleItemsPerPageChange = (value: string) => {
    setFiltros((prev) => ({
      ...prev,
      itemsPerPage: Number(value),
      currentPage: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFiltros((prev) => ({ ...prev, currentPage: page }));
  };

  const clearFilters = () => {
    setLocalSearch("");
    setFiltros({
      searchTerm: "",
      tipo: "all",
      sortBy: "recent",
      currentPage: 1,
      itemsPerPage: 12,
    });
  };

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
              <RiGalleryLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
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
                <div className="text-blue-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
                  <RiImageLine className="w-3 h-3" />
                  Fotos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {totalVideos}
                </div>
                <div className="text-blue-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
                  <RiVideoLine className="w-3 h-3" />
                  Vídeos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {categorias.length}
                </div>
                <div className="text-blue-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
                  <RiFolderLine className="w-3 h-3" />
                  Categorias
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {categoriasComDestaque}
                </div>
                <div className="text-blue-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
                  <RiStarFill className="w-3 h-3" />
                  Destaques
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Seção de Filtros - Estilo das Notícias */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 relative z-50">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full max-w-2xl">
              <div className="relative">
                <RiSearchLine className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder="Buscar categorias da galeria..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                />
                {localSearch && (
                  <button
                    onClick={() => setLocalSearch("")}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors w-4 h-4 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Controls - Estilo das Notícias */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
              {/* Tipo Filter */}
              <div className="min-w-[200px]">
                <Select value={filtros.tipo} onValueChange={handleTipoChange}>
                  <SelectTrigger className="w-full sm:w-48 lg:w-64 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl py-2.5 sm:py-3 bg-white/50 backdrop-blur-sm text-sm sm:text-base">
                    <div className="flex items-center">
                      <RiFilterLine className="w-4 h-4 mr-2 text-slate-500" />
                      <SelectValue placeholder="Tipo de Galeria" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white shadow-xl border-slate-200">
                    {TYPE_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
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

              {/* Sort */}
              <div className="min-w-[180px]">
                <Select value={filtros.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-40 lg:w-48 border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl py-2.5 sm:py-3 bg-white/50 backdrop-blur-sm text-sm sm:text-base">
                    <div className="flex items-center">
                      <RiSortAsc className="w-4 h-4 mr-2 text-slate-500" />
                      <SelectValue placeholder="Ordenar por" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white shadow-xl border-slate-200">
                    {SORT_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
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

              {/* Items per Page */}
              <div className="min-w-[160px]">
                <Select
                  value={filtros.itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
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

          {/* Indicadores de filtros ativos - Estilo das Notícias */}
          {(filtros.searchTerm ||
            filtros.tipo !== "all" ||
            filtros.sortBy !== "recent") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filtros.searchTerm && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700"
                >
                  Busca: &quot;{filtros.searchTerm}&quot;
                  <button
                    onClick={() => setLocalSearch("")}
                    className="ml-1 hover:text-blue-900 w-3 h-3 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </Badge>
              )}
              {filtros.tipo !== "all" && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-50 border-green-200 text-green-700"
                >
                  <RiFilterLine className="w-3 h-3" />
                  {TYPE_OPTIONS.find((c) => c.value === filtros.tipo)?.label ||
                    filtros.tipo}
                  <button
                    onClick={() => handleTipoChange("all")}
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
                    onClick={() => handleSortChange("recent")}
                    className="ml-1 hover:text-purple-900 w-3 h-3 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
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
                {totalCategorias} CATEGORIAS ENCONTRADAS
              </h2>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                {filtros.searchTerm && `Buscando por: "${filtros.searchTerm}"`}
                {filtros.tipo !== "all" &&
                  ` • Tipo: ${
                    TYPE_OPTIONS.find((c) => c.value === filtros.tipo)?.label
                  }`}
                {filtros.sortBy &&
                  ` • Ordenado por: ${getSortLabel(filtros.sortBy)}`}
              </p>
            </div>

            {categorias.length > 0 && (
              <div className="text-xs sm:text-sm text-slate-500">
                Página {filtros.currentPage} de {totalPages} • {totalCategorias}{" "}
                categorias no total
                <span className="ml-2 font-medium">
                  • {filtros.itemsPerPage} por página
                </span>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <RiGalleryLine className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-red-800 font-bold text-base sm:text-lg mb-1">
                    Erro ao carregar galeria
                  </h3>
                  <p className="text-red-600 text-sm sm:text-base mb-2">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadCategorias}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grid de Categorias */}
          <AnimatePresence mode="wait">
            {loading ? (
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
            ) : categorias.length > 0 ? (
              <>
                <motion.div
                  key={`grid-${filtros.sortBy}-${filtros.tipo}-${filtros.currentPage}`}
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
                      transition={{ delay: index * 0.05 }}
                    >
                      <GaleriaCard categoria={categoria} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Paginação - Estilo das Notícias */}
                {totalPages > 1 && (
                  <Pagination className="mb-8 sm:mb-12">
                    <PaginationContent className="flex-wrap">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(
                              Math.max(filtros.currentPage - 1, 1)
                            )
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
                          onClick={() => handlePageChange(1)}
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
                        .filter(
                          (page) => Math.abs(page - filtros.currentPage) <= 1
                        )
                        .map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
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
                            onClick={() => handlePageChange(totalPages)}
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
                            handlePageChange(
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
                  {filtros.searchTerm || filtros.tipo !== "all"
                    ? "Tente ajustar os filtros ou termos de busca."
                    : "Ainda não há categorias cadastradas na galeria."}
                </p>
                {(filtros.searchTerm || filtros.tipo !== "all") && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4 sm:mt-6"
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
                    <Link href="/contato">
                      <RiCameraLine className="w-4 h-4 mr-2" />
                      Enviar Material
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <Link href="/galeria">
                      <RiGalleryLine className="w-4 h-4 mr-2" />
                      Explorar Tudo
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
