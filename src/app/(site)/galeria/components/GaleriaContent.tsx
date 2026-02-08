"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGaleriaPublica, Categoria } from "@/lib/stores/useGaleriaStore";
import { GaleriaCard } from "./GaleriaCard";
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
} from "react-icons/ri";

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

export function GaleriaContent() {
  const {
    categorias,
    loading,
    error,
    pagination,
    fetchCategorias,
    setPagination,
  } = useGaleriaPublica();
  const [localSearch, setLocalSearch] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {}, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [localSearch]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const filteredCategorias = categorias.filter((cat: Categoria) => {
    const matchesSearch = localSearch
      ? cat.nome.toLowerCase().includes(localSearch.toLowerCase())
      : true;
    const matchesTipo =
      selectedTipo !== "all" ? cat.tipo === selectedTipo : true;
    return matchesSearch && matchesTipo;
  });

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
      <div className="sticky top-[80px] z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-md group">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-pac-primary transition-colors" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-pac-primary focus:ring-pac-primary/20 h-11 rounded-xl transition-all placeholder:text-slate-400"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-1 transition-colors"
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
                <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white border-slate-200 rounded-xl hover:border-pac-primary/50 transition-colors">
                  <div className="flex items-center gap-2 text-slate-600">
                    <RiFilterLine className="w-4 h-4 shrink-0" />
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
                <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white border-slate-200 rounded-xl hover:border-pac-primary/50 transition-colors">
                  <div className="flex items-center gap-2 text-slate-600">
                    <RiSortAsc className="w-4 h-4 shrink-0" />
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
              {(localSearch ||
                selectedTipo !== "all" ||
                selectedSort !== "recent") && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-slate-500 hover:text-red-600 hover:bg-red-50 h-11 px-4 rounded-xl transition-colors font-medium"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 container mx-auto px-4 min-h-[600px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-slate-200 bg-white h-[300px]"
              >
                <Skeleton className="h-48 w-full bg-slate-100" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-slate-100" />
                  <Skeleton className="h-4 w-1/2 bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <RiGalleryLine className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Erro ao carregar galeria
            </h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button
              onClick={() => fetchCategorias()}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16"
              >
                {currentData.map((categoria) => (
                  <GaleriaCard
                    key={categoria.id}
                    categoria={{
                      ...categoria,
                      descricao: categoria.descricao || undefined,
                    }}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
            {totalPages > 1 && (
              <Pagination className="justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, pagination.page - 1))
                      }
                      className={
                        pagination.page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-slate-100 hover:text-pac-primary"
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
                              "cursor-pointer transition-all",
                              page === pagination.page
                                ? "bg-pac-primary text-white hover:bg-pac-primary hover:text-white shadow-md"
                                : "hover:bg-slate-100 hover:text-pac-primary",
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
                          : "cursor-pointer hover:bg-slate-100 hover:text-pac-primary"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-white p-8 rounded-full shadow-sm mb-6 border border-slate-100">
              <RiSearchLine className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Não encontramos álbuns com os termos pesquisados.
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-pac-primary text-pac-primary hover:bg-pac-primary/5"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
