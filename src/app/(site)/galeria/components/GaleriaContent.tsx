"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGaleriaPublica } from "@/lib/stores/useGaleriaStore";
import { GaleriaCard, ExtendedCategoria } from "./GaleriaCard";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils/cn";
import {
  RiSearchLine,
  RiFilterLine,
  RiSortAsc,
  RiGalleryLine,
  RiCloseLine,
  RiImageLine,
  RiVideoLine,
  RiLayoutGridLine,
} from "react-icons/ri";
import type { IconType } from "react-icons"; // Importando tipo para os ícones

// --- CONFIGURAÇÕES ---
const SORT_OPTIONS = [
  { value: "recent", label: "Mais Recentes" },
  { value: "oldest", label: "Mais Antigas" },
  { value: "name_asc", label: "A-Z" },
  { value: "name_desc", label: "Z-A" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Todos os Tipos", icon: RiGalleryLine },
  { value: "fotos", label: "Fotos", icon: RiImageLine },
  { value: "videos", label: "Vídeos", icon: RiVideoLine },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// --- COMPONENTE PRINCIPAL ---

export function GaleriaContent() {
  const {
    categorias,
    loading,
    error,
    pagination,
    fetchCategorias,
    // setFiltros, // REMOVIDO: Não estamos usando filtragem via API, apenas local
    setPagination,
  } = useGaleriaPublica();

  const [localSearch, setLocalSearch] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Debounce (apenas para evitar processamento excessivo na digitação)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      // Lógica futura se precisar enviar busca para API
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [localSearch]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Filtragem Local
  const filteredCategorias = categorias.filter((cat: ExtendedCategoria) => {
    const matchesSearch = localSearch
      ? cat.nome.toLowerCase().includes(localSearch.toLowerCase())
      : true;
    const matchesTipo =
      selectedTipo !== "all" ? cat.tipo === selectedTipo : true;
    return matchesSearch && matchesTipo;
  });

  // Ordenação Local
  const sortedCategorias = [...filteredCategorias].sort((a, b) => {
    if (selectedSort === "recent")
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    if (selectedSort === "oldest")
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    if (selectedSort === "name_asc") return a.nome.localeCompare(b.nome);
    if (selectedSort === "name_desc") return b.nome.localeCompare(a.nome);
    return 0;
  });

  // Estatísticas
  const totalFotos = categorias
    .filter((c) => c.tipo === "fotos")
    .reduce((acc, curr) => acc + (curr.itens_count || 0), 0);
  const totalVideos = categorias
    .filter((c) => c.tipo === "videos")
    .reduce((acc, curr) => acc + (curr.itens_count || 0), 0);

  // Paginação Local
  const itemsPerPage = 12;
  const totalPages = Math.ceil(sortedCategorias.length / itemsPerPage);
  const currentData = sortedCategorias.slice(
    (pagination.page - 1) * itemsPerPage,
    pagination.page * itemsPerPage,
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setPagination({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setPagination],
  );

  const clearFilters = () => {
    setLocalSearch("");
    setSelectedTipo("all");
    setSelectedSort("recent");
    setPagination({ page: 1 });
  };

  return (
    <>
      {/* HEADER E STATS */}
      <section className="bg-white border-b border-slate-100 pt-24 pb-12 lg:pt-32 lg:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/patterns/grid.svg')] opacity-[0.03] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pac-primary/10 text-pac-primary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-pac-primary animate-pulse" />
              Acervo Digital
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 uppercase tracking-tight">
              Galeria <span className="text-pac-primary">PAC</span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed mb-10">
              Explore nossa coleção completa de registros fotográficos e
              audiovisuais.
            </p>

            {/* Stats Bar */}
            <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <StatItem
                icon={RiImageLine}
                label="Fotos"
                value={totalFotos}
                color="text-blue-600"
                bg="bg-blue-100"
              />
              <div className="w-px h-10 bg-slate-200 hidden sm:block" />
              <StatItem
                icon={RiVideoLine}
                label="Vídeos"
                value={totalVideos}
                color="text-purple-600"
                bg="bg-purple-100"
              />
              <div className="w-px h-10 bg-slate-200 hidden sm:block" />
              <StatItem
                icon={RiLayoutGridLine}
                label="Álbuns"
                value={pagination.total}
                color="text-emerald-600"
                bg="bg-emerald-100"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* BARRA DE FILTROS */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-pac-primary focus:ring-pac-primary/20 rounded-xl h-11"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
              <Select
                value={selectedTipo}
                onValueChange={(val) => {
                  setSelectedTipo(val);
                  setPagination({ page: 1 });
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl bg-white">
                  <div className="flex items-center gap-2 text-slate-600">
                    <RiFilterLine className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4 text-slate-400" />{" "}
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl bg-white">
                  <div className="flex items-center gap-2 text-slate-600">
                    <RiSortAsc className="w-4 h-4" />
                    <SelectValue />
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

              {(localSearch || selectedTipo !== "all") && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-pac-primary hover:bg-pac-primary/10 h-11 px-4 rounded-xl"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE RESULTADOS */}
      <section className="py-12 container mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-slate-200 bg-white"
              >
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <RiGalleryLine className="w-16 h-16 text-red-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">
              Erro ao carregar galeria
            </h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button onClick={() => fetchCategorias()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        ) : currentData.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedTipo}-${selectedSort}-${pagination.page}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
              >
                {currentData.map((categoria: ExtendedCategoria) => (
                  <GaleriaCard key={categoria.id} categoria={categoria} />
                ))}
              </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, pagination.page - 1))
                      }
                      className={
                        pagination.page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - pagination.page) <= 1
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === pagination.page}
                            onClick={() => handlePageChange(page)}
                            className={cn(
                              "cursor-pointer",
                              page === pagination.page &&
                                "bg-pac-primary text-white hover:bg-pac-primary-dark hover:text-white",
                            )}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (Math.abs(page - pagination.page) === 2)
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(totalPages, pagination.page + 1),
                        )
                      }
                      className={
                        pagination.page === totalPages
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
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <RiSearchLine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">
              Nenhum resultado encontrado
            </h3>
            <p className="text-slate-500 mb-6">
              Tente ajustar seus termos de busca.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        )}
      </section>
    </>
  );
}

// --- TIPAGEM E COMPONENTE AUXILIAR CORRIGIDOS ---

interface StatItemProps {
  icon: IconType;
  label: string;
  value: number;
  color: string;
  bg: string;
}

function StatItem({ icon: Icon, label, value, color, bg }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 px-4">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          bg,
          color,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-left">
        <p className="text-xs text-slate-500 font-bold uppercase">{label}</p>
        <p className="text-lg font-black text-slate-800 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
