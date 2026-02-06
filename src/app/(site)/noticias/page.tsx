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
  RiLayoutGridLine,
} from "react-icons/ri";

// Utils & Store
import { useNoticiasBasico, type SortBy } from "@/lib/stores/useNoticiasStore";
import type { NoticiaLista } from "@/app/actions/news/noticias";

// --- CONSTANTES ---

const SORT_OPTIONS = [
  { value: "recent", label: "Mais Recentes" },
  { value: "oldest", label: "Mais Antigas" },
  { value: "popular", label: "Em Alta" },
  { value: "titulo", label: "A-Z" },
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: "6", label: "Exibir: 6 itens" },
  { value: "12", label: "Exibir: 12 itens" },
  { value: "24", label: "Exibir: 24 itens" },
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
      <Card className="group h-full flex flex-col border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white hover:-translate-y-1">
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
            <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
              <RiNewspaperLine className="h-12 w-12 opacity-50" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <Badge
              variant="secondary"
              className="bg-white/90 text-slate-800 hover:bg-white backdrop-blur-md shadow-sm border-0 font-bold px-2.5 uppercase tracking-wider text-[10px]"
            >
              {noticia.categoria || "Geral"}
            </Badge>
            {isVideo && (
              <Badge className="bg-red-600 text-white border-0 shadow-sm flex items-center gap-1 uppercase tracking-wider text-[10px]">
                <RiVideoLine className="w-3 h-3" /> Vídeo
              </Badge>
            )}
          </div>

          {noticia.destaque && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-md flex items-center gap-1 uppercase tracking-wider text-[10px]">
                <RiStarFill className="w-3 h-3" /> Destaque
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-3">
            <div className="flex items-center gap-1.5 text-pac-primary">
              <RiCalendarLine className="w-3.5 h-3.5" />
              {formatDate(noticia.data_publicacao)}
            </div>
            <div className="flex items-center gap-1">
              <RiTimeLine className="w-3.5 h-3.5" />
              {Math.ceil((noticia.resumo?.length || 0) / 200)} min leitura
            </div>
          </div>

          <Link
            href={`/noticias/${noticia.slug}`}
            className="block group/link mb-3"
          >
            <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-2 group-hover/link:text-pac-primary transition-colors">
              {noticia.titulo}
            </h3>
          </Link>

          <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
            {noticia.resumo || "Clique para ler a matéria completa."}
          </p>

          <div className="pt-4 border-t border-slate-100 mt-auto">
            <Button
              asChild
              variant="link"
              className="text-pac-primary hover:text-pac-primary-dark p-0 h-auto font-bold text-sm w-full justify-between group/btn no-underline hover:no-underline"
            >
              <Link href={`/noticias/${noticia.slug}`}>
                Ler Completo
                <span className="bg-pac-primary/10 text-pac-primary p-1.5 rounded-full group-hover/btn:bg-pac-primary group-hover/btn:text-white transition-all duration-300">
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
          className="border border-slate-200 shadow-sm h-[450px] bg-white rounded-xl overflow-hidden"
        >
          <div className="h-52 bg-slate-100 animate-pulse" />
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-16 animate-pulse" />
            </div>
            <div className="h-6 bg-slate-100 rounded w-full animate-pulse" />
            <div className="h-6 bg-slate-100 rounded w-2/3 animate-pulse" />
            <div className="h-20 bg-slate-100 rounded w-full animate-pulse mt-4" />
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

  // --- HANDLERS ---

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

  // --- LÓGICA DE VALUE DO SELECT DE PAGINAÇÃO ---
  // Verifica se o valor atual da store existe nas opções.
  // Se não existir (ex: store tem 10, opções são 6,12,24), usa "6" como fallback visual.
  const currentLimitStr = String(pagination.limit);
  const isValidLimit = ITEMS_PER_PAGE_OPTIONS.some(
    (opt) => opt.value === currentLimitStr,
  );
  const selectValue = isValidLimit ? currentLimitStr : "6";

  const hasActiveFilters =
    filters.search ||
    filters.categoria !== "all" ||
    filters.sortBy !== "recent";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-24 border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
              <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
                Central de Informações
              </span>
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              NOTÍCIAS E <span className="text-pac-primary">ATUALIZAÇÕES</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Fique por dentro das operações, treinamentos e comunicados
              oficiais da Patrulha Aérea Civil.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- BARRA DE FERRAMENTAS (Sticky) --- */}
      <div className="sticky top-[80px] z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm transition-all">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            {/* Busca */}
            <div className="relative w-full lg:max-w-md group">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-pac-primary transition-colors" />
              <Input
                placeholder="Pesquisar por título ou conteúdo..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-pac-primary focus:ring-pac-primary/20 h-11 rounded-xl transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filtros */}
            <div className="flex w-full lg:w-auto gap-3 overflow-x-auto pb-2 lg:pb-0 items-center no-scrollbar">
              {/* CATEGORIA */}
              <Select
                value={filters.categoria}
                onValueChange={handleCategoriaChange}
              >
                <SelectTrigger className="w-[220px] h-11 bg-white border-slate-200 rounded-xl hover:border-pac-primary/50 transition-colors">
                  <div className="flex items-center gap-2 text-slate-600 truncate">
                    <RiFilterLine className="w-4 h-4 shrink-0" />
                    <SelectValue placeholder="Categoria" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ORDENAÇÃO */}
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[170px] h-11 bg-white border-slate-200 rounded-xl hover:border-pac-primary/50 transition-colors">
                  <div className="flex items-center gap-2 text-slate-600">
                    <RiSortAsc className="w-4 h-4 shrink-0" />
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

              {/* QUANTIDADE (CORRIGIDO) */}
              <Select
                value={selectValue}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-[160px] h-11 bg-white border-slate-200 rounded-xl hover:border-pac-primary/50 transition-colors">
                  <div className="flex items-center gap-2 text-slate-600">
                    <RiLayoutGridLine className="w-4 h-4 shrink-0" />
                    <SelectValue placeholder="Qtd por pág" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* LIMPAR */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearFilters}
                  className="h-11 w-11 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex-shrink-0 transition-colors"
                  title="Limpar todos os filtros"
                >
                  <RiCloseLine className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- GRID DE RESULTADOS --- */}
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

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pb-12">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="w-32 border-slate-200 text-slate-600 hover:text-pac-primary hover:border-pac-primary/50 bg-white"
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
                  className="w-32 border-slate-200 text-slate-600 hover:text-pac-primary hover:border-pac-primary/50 bg-white"
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-white p-8 rounded-full shadow-sm mb-6 border border-slate-100">
              <RiSearchLine className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Nenhuma notícia encontrada
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Não encontramos resultados para sua busca. Tente ajustar os
              filtros ou pesquisar por outro termo.
            </p>
            <Button
              variant="outline"
              className="border-pac-primary text-pac-primary hover:bg-pac-primary/5 font-bold px-8 h-12 rounded-xl"
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
