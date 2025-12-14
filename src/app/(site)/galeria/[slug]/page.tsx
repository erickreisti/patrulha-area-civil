"use client";

import { use } from "react";
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
  RiCameraLine,
  RiImageLine,
  RiCalendarLine,
  RiDownloadLine,
  RiPlayLine,
  RiEyeLine,
  RiFolderLine,
  RiStackLine,
  RiStarFill,
  RiFilterLine,
  RiSortAsc,
  RiSparklingFill,
  RiListOrdered,
  RiFireLine,
  RiEye2Line,
  RiCameraOffLine,
  RiVideoLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { toast } from "sonner";
import type { GaleriaCategoria, GaleriaItem } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Configurações
const ITEMS_PER_PAGE_OPTIONS = [
  { value: "12", label: "12 por página" },
  { value: "24", label: "24 por página" },
  { value: "36", label: "36 por página" },
  { value: "48", label: "48 por página" },
  { value: "60", label: "60 por página" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Mais Recentes", icon: RiSparklingFill },
  { value: "oldest", label: "Mais Antigas", icon: RiCalendarLine },
  { value: "name", label: "Nome A-Z", icon: RiListOrdered },
  { value: "destaque", label: "Em Destaque", icon: RiStarFill },
  { value: "popular", label: "Mais Populares", icon: RiFireLine },
];

// URLs de fallback seguras
const FALLBACK_IMAGE_FOTO = "/images/fallback-foto.jpg";
const FALLBACK_IMAGE_VIDEO = "/images/fallback-video.jpg";

export default function CategoriaGaleriaPage({ params }: PageProps) {
  // Desembrulhar params usando use()
  const { slug } = use(params);

  const [categoria, setCategoria] = useState<GaleriaCategoria | null>(null);
  const [itens, setItens] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar erros de imagem - CHAVE PARA EVITAR LOOPS
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Filtros locais
  const [filters, setFilters] = useState({
    page: 1,
    totalPages: 1,
    totalItens: 0,
    filterDestaque: "all" as "all" | "destaque",
    sortBy: "destaque" as "recent" | "oldest" | "name" | "destaque" | "popular",
    itemsPerPage: 12,
  });

  // Inicialização do Supabase
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupabase(createClient());
    }
  }, []);

  // Buscar dados da categoria
  const fetchData = useCallback(async () => {
    if (!supabase || !categoria) return;

    try {
      setLoading(true);
      // Resetar erros de imagem quando buscar novos dados
      setImageErrors({});

      // Contar total de itens
      let countQuery = supabase
        .from("galeria_itens")
        .select("*", { count: "exact", head: true })
        .eq("categoria_id", categoria.id)
        .eq("status", true);

      if (filters.filterDestaque === "destaque") {
        countQuery = countQuery.eq("destaque", true);
      }

      const { count } = await countQuery;
      const totalCount = count || 0;
      const calculatedTotalPages =
        Math.ceil(totalCount / filters.itemsPerPage) || 1;

      // Buscar itens com paginação
      const from = (filters.page - 1) * filters.itemsPerPage;
      const to = from + filters.itemsPerPage - 1;

      let query = supabase
        .from("galeria_itens")
        .select("*")
        .eq("categoria_id", categoria.id)
        .eq("status", true)
        .range(from, to);

      // Aplicar filtros
      if (filters.filterDestaque === "destaque") {
        query = query.eq("destaque", true);
      }

      // Aplicar ordenação
      switch (filters.sortBy) {
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
        case "popular":
          query = query.order("views", { ascending: false });
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data: itensData, error: itensError } = await query;

      if (itensError) {
        console.error("Erro ao buscar itens:", itensError);
        toast.error("Erro ao carregar itens da galeria");
        return;
      }

      setItens(itensData || []);
      setFilters((prev) => ({
        ...prev,
        totalPages: calculatedTotalPages,
        totalItens: totalCount,
      }));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar galeria");
    } finally {
      setLoading(false);
    }
  }, [
    supabase,
    categoria,
    filters.filterDestaque,
    filters.sortBy,
    filters.itemsPerPage,
    filters.page,
  ]);

  // Primeira busca: carregar categoria
  useEffect(() => {
    async function loadCategoria() {
      if (!supabase || !slug) return;

      try {
        const { data, error } = await supabase
          .from("galeria_categorias")
          .select("*")
          .eq("slug", slug)
          .eq("status", true)
          .eq("arquivada", false)
          .single();

        if (error || !data) {
          setError("Categoria não encontrada");
          return;
        }

        setCategoria(data);
      } catch (err) {
        console.error("Erro ao carregar categoria:", err);
        setError("Erro ao carregar categoria");
      }
    }

    if (supabase && slug) {
      loadCategoria();
    }
  }, [supabase, slug]);

  // Segunda busca: carregar itens quando categoria estiver carregada
  useEffect(() => {
    if (categoria && supabase) {
      fetchData();
    }
  }, [categoria, supabase, fetchData]);

  // Handler para mudanças de filtro - EVITA LOOPS
  const handleFilterChange = useCallback(
    (
      type: "filterDestaque" | "sortBy" | "itemsPerPage",
      value:
        | "all"
        | "destaque"
        | "recent"
        | "oldest"
        | "name"
        | "destaque"
        | "popular"
        | number
    ) => {
      setFilters((prev) => {
        if (type === "filterDestaque" && prev.filterDestaque === value) {
          return prev;
        }
        if (type === "sortBy" && prev.sortBy === value) {
          return prev;
        }
        if (type === "itemsPerPage" && prev.itemsPerPage === value) {
          return prev;
        }

        return {
          ...prev,
          [type]: value,
          page: 1,
        };
      });
    },
    []
  );

  // ============================================
  // FUNÇÕES CRÍTICAS PARA TRATAMENTO DE IMAGENS
  // ============================================

  // Registrar erro de imagem - IMPEDE NOVAS TENTATIVAS
  const handleImageError = useCallback((itemId: string) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  }, []);

  // Gerar placeholder baseado no tipo de conteúdo
  const getPlaceholderForItem = useCallback((item: GaleriaItem) => {
    const isVideo = item.tipo === "video";
    const isDestaque = item.destaque;

    return (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${
          isVideo
            ? "bg-gradient-to-br from-slate-800 to-slate-900"
            : isDestaque
            ? "bg-gradient-to-br from-amber-900/80 to-orange-900/80"
            : "bg-gradient-to-br from-navy-800 to-blue-900"
        }`}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isVideo
              ? "bg-gradient-to-r from-blue-500 to-purple-600"
              : isDestaque
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-navy-500 to-blue-600"
          }`}
        >
          {isVideo ? (
            <RiVideoLine className="h-8 w-8 text-white" />
          ) : (
            <RiCameraOffLine className="h-8 w-8 text-white" />
          )}
        </div>
        <div className="text-center">
          <p className="text-white font-semibold mb-1 text-sm">
            {isVideo ? "Vídeo não disponível" : "Imagem não disponível"}
          </p>
          <p className="text-white/70 text-xs">{item.titulo}</p>
        </div>
        <RiErrorWarningLine className="absolute top-3 left-3 h-5 w-5 text-amber-300" />
      </div>
    );
  }, []);

  // Obter URL da imagem com tratamento de erros
  const getImageUrl = useCallback(
    (item: GaleriaItem): string => {
      const url = item.thumbnail_url || item.arquivo_url;

      if (!url) {
        return item.tipo === "video"
          ? FALLBACK_IMAGE_VIDEO
          : FALLBACK_IMAGE_FOTO;
      }

      // Se já for uma URL completa
      if (url.startsWith("http")) {
        return url;
      }

      // Se for uma URL do Supabase Storage
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        return item.tipo === "video"
          ? FALLBACK_IMAGE_VIDEO
          : FALLBACK_IMAGE_FOTO;
      }

      const bucket =
        categoria?.tipo === "fotos" ? "galeria-fotos" : "galeria-videos";

      if (url.includes("/")) {
        if (url.includes(bucket)) {
          return `${supabaseUrl}/storage/v1/object/public/${url}`;
        } else {
          return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
        }
      }

      return item.tipo === "video" ? FALLBACK_IMAGE_VIDEO : FALLBACK_IMAGE_FOTO;
    },
    [categoria]
  );

  // Função para renderizar a imagem ou placeholder
  const renderImageOrPlaceholder = useCallback(
    (item: GaleriaItem) => {
      // PASSO 1: Verificar se já temos erro registrado para este item
      if (imageErrors[item.id]) {
        return getPlaceholderForItem(item);
      }

      const imageUrl = getImageUrl(item);
      const isVideo = item.tipo === "video";

      // PASSO 2: Tentar carregar a imagem real
      return (
        <>
          <Image
            src={imageUrl}
            alt={item.titulo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => handleImageError(item.id)} // <-- CHAVE: Só uma tentativa
            priority={false} // Não priorizar para evitar bloqueios
            loading="lazy"
          />

          {/* Badge de Destaque */}
          {item.destaque && !imageErrors[item.id] && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <RiStarFill className="w-3 h-3 mr-1" />
                Destaque
              </Badge>
            </div>
          )}

          {/* Overlay para vídeo */}
          {isVideo && !imageErrors[item.id] && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <RiPlayLine className="h-7 w-7 text-white" />
              </div>
            </div>
          )}
        </>
      );
    },
    [imageErrors, getImageUrl, getPlaceholderForItem, handleImageError]
  );

  // Handlers específicos
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilterDestaqueChange = (value: "all" | "destaque") => {
    handleFilterChange("filterDestaque", value);
  };

  const handleSortChange = (
    value: "recent" | "oldest" | "name" | "destaque" | "popular"
  ) => {
    handleFilterChange("sortBy", value);
  };

  const handleItemsPerPageChange = (value: string) => {
    handleFilterChange("itemsPerPage", Number(value));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      totalPages: filters.totalPages,
      totalItens: filters.totalItens,
      filterDestaque: "all",
      sortBy: "destaque",
      itemsPerPage: 12,
    });
  };

  // Helper functions
  const getSortLabel = (sortBy: string): string => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sortBy);
    return option ? option.label : "Relevância";
  };

  // Estatísticas
  const itensEmDestaque = itens.filter((item) => item.destaque).length;
  const totalFotos = itens.filter((item) => item.tipo === "foto").length;
  const totalVideos = itens.filter((item) => item.tipo === "video").length;

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
                        {filters.totalItens}
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

                {/* Filtros - Estilo aprimorado */}
                <div className="mt-6 pt-6 border-t border-navy-100">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    {/* Filtros rápidos */}
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          filters.filterDestaque === "all"
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer hover:bg-navy-100 transition-colors text-sm px-3 py-1"
                        onClick={() => handleFilterDestaqueChange("all")}
                      >
                        Todos ({filters.totalItens})
                      </Badge>
                      <Badge
                        variant={
                          filters.filterDestaque === "destaque"
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer hover:bg-amber-100 transition-colors text-sm px-3 py-1"
                        onClick={() => handleFilterDestaqueChange("destaque")}
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
                          value={filters.sortBy}
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
                          value={filters.itemsPerPage.toString()}
                          onValueChange={handleItemsPerPageChange}
                        >
                          <SelectTrigger className="w-full border-2 border-slate-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-lg px-3 py-2 text-sm bg-white">
                            <SelectValue
                              placeholder={`${filters.itemsPerPage} por página`}
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

                  {/* Indicadores de filtros ativos */}
                  {(filters.filterDestaque !== "all" ||
                    filters.sortBy !== "destaque") && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-navy-50">
                      {filters.filterDestaque !== "all" && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-green-50 border-green-200 text-green-700"
                        >
                          <RiFilterLine className="w-3 h-3" />
                          Somente em destaque
                          <button
                            onClick={() => handleFilterDestaqueChange("all")}
                            className="ml-1 hover:text-green-900 w-3 h-3 flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </Badge>
                      )}
                      {filters.sortBy !== "destaque" && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-purple-50 border-purple-200 text-purple-700"
                        >
                          <RiSortAsc className="w-3 h-3" />
                          {getSortLabel(filters.sortBy)}
                          <button
                            onClick={() => handleSortChange("destaque")}
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
                        Limpar filtros
                      </Button>
                    </div>
                  )}
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
                {itens.map((item, index) => {
                  return (
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
                        {/* Thumbnail - COM FALLBACK AUTOMÁTICO */}
                        <div
                          className={`relative h-48 w-full ${
                            imageErrors[item.id]
                              ? ""
                              : item.tipo === "video"
                              ? "bg-gradient-to-br from-slate-100 to-slate-200"
                              : "bg-gradient-to-br from-navy-50 to-blue-50"
                          } flex items-center justify-center overflow-hidden`}
                        >
                          <div className="relative w-full h-full">
                            {renderImageOrPlaceholder(item)}
                          </div>
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
                            <div className="flex items-center gap-2">
                              {item.views && item.views > 0 && (
                                <span className="flex items-center">
                                  <RiEye2Line className="w-3 h-3 mr-1" />
                                  {item.views}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {item.tipo === "video" ? "Vídeo" : "Foto"}
                              </Badge>
                            </div>
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
                  );
                })}
              </div>

              {/* Paginação - Estilo aprimorado */}
              {filters.totalPages > 1 && (
                <Pagination className="mt-12">
                  <PaginationContent className="flex-wrap">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(filters.page - 1, 1))
                        }
                        className={
                          filters.page === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Primeira página */}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(1)}
                        isActive={filters.page === 1}
                        className="cursor-pointer"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>

                    {/* Elipsis após primeira página */}
                    {filters.page > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Páginas do meio */}
                    {Array.from({ length: filters.totalPages }, (_, i) => i + 1)
                      .filter((page) => page > 1 && page < filters.totalPages)
                      .filter((page) => Math.abs(page - filters.page) <= 1)
                      .map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={filters.page === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    {/* Elipsis antes da última página */}
                    {filters.page < filters.totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Última página */}
                    {filters.totalPages > 1 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(filters.totalPages)}
                          isActive={filters.page === filters.totalPages}
                          className="cursor-pointer"
                        >
                          {filters.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(filters.page + 1, filters.totalPages)
                          )
                        }
                        className={
                          filters.page === filters.totalPages
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
                    {filters.filterDestaque === "destaque"
                      ? "Nenhum item em destaque"
                      : "Nenhum item disponível"}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {filters.filterDestaque === "destaque"
                      ? "Esta categoria ainda não possui itens em destaque."
                      : `Esta categoria ainda não possui ${
                          categoria.tipo === "fotos" ? "fotos" : "vídeos"
                        } publicados.`}
                  </p>
                  {filters.filterDestaque !== "all" && (
                    <Button
                      variant="outline"
                      className="border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white transition-all duration-300"
                      onClick={() => handleFilterDestaqueChange("all")}
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
