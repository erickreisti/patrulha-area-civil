"use client";

import { useEffect, Suspense } from "react"; // 1. Adicione Suspense aqui
import { useSearchParams } from "next/navigation";
import { useGaleriaPublica, Categoria } from "@/lib/stores/useGaleriaStore";
import { GaleriaCard } from "./GaleriaCard";
import { SearchAndFilter } from "./SearchAndFilter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils/cn";
import { RiGalleryLine } from "react-icons/ri";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// Componente Wrapper para lidar com SearchParams
function GaleriaFiltersWrapper() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const tipo = searchParams.get("tipo") || "all";

  return <SearchAndFilter initialSearch={search} initialTipo={tipo} />;
}

// Componente Principal
export function GaleriaContent() {
  const {
    categorias,
    loading,
    error,
    pagination,
    fetchCategorias,
    setPagination,
  } = useGaleriaPublica();

  // Precisamos ler os params aqui também para filtrar a lista localmente
  // MAS, para evitar o erro de build, vamos mover a lógica de leitura para dentro de um hook ou usar Suspense na página pai.
  // Como estamos "use client", a maneira mais segura é tratar o searchParams dentro de um Suspense.

  // Vamos criar um componente interno ou usar o hook de forma segura:
  return (
    <>
      {/* 2. Envolva o componente de filtro em Suspense */}
      <Suspense fallback={<div className="h-20 bg-slate-50 animate-pulse" />}>
        <GaleriaFiltersWrapper />
      </Suspense>

      <GaleriaList
        categorias={categorias}
        loading={loading}
        error={error}
        pagination={pagination}
        fetchCategorias={fetchCategorias}
        setPagination={setPagination}
      />
    </>
  );
}

// Separamos a lista para isolar o uso de searchParams
function GaleriaList({
  categorias,
  loading,
  error,
  pagination,
  fetchCategorias,
  setPagination,
}: any) {
  // Agora usamos useSearchParams aqui dentro também, mas como este componente
  // será renderizado após o Suspense (ou precisamos de outro Suspense),
  // o ideal é garantir que TODO componente que usa useSearchParams esteja em Suspense.

  return (
    <Suspense fallback={<SkeletonGrid />}>
      <GaleriaListContent
        categorias={categorias}
        loading={loading}
        error={error}
        pagination={pagination}
        fetchCategorias={fetchCategorias}
        setPagination={setPagination}
      />
    </Suspense>
  );
}

function GaleriaListContent({
  categorias,
  loading,
  error,
  pagination,
  fetchCategorias,
  setPagination,
}: any) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const tipo = searchParams.get("tipo") || "all";

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const filteredCategorias = categorias.filter((cat: Categoria) => {
    const matchesSearch = search
      ? cat.nome.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesTipo = tipo !== "all" ? cat.tipo === tipo : true;
    return matchesSearch && matchesTipo;
  });

  const sortedCategorias = [...filteredCategorias].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const itemsPerPage = 12;
  const totalPages = Math.ceil(sortedCategorias.length / itemsPerPage);

  useEffect(() => {
    if (pagination.page > totalPages && totalPages > 0) {
      setPagination({ page: 1 });
    }
  }, [totalPages, pagination.page, setPagination]);

  const currentData = sortedCategorias.slice(
    (pagination.page - 1) * itemsPerPage,
    pagination.page * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setPagination({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="py-12 container mx-auto px-4 min-h-[600px]">
      {loading ? (
        <SkeletonGrid />
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
              key={`${tipo}-${search}-${pagination.page}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16"
            >
              {currentData.map((categoria) => (
                <GaleriaCard key={categoria.id} categoria={categoria} />
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
                    className={cn(
                      pagination.page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-slate-100 hover:text-pac-primary",
                    )}
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
                  if (Math.abs(page - pagination.page) === 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(
                        Math.min(totalPages, pagination.page + 1),
                      )
                    }
                    className={cn(
                      pagination.page === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-slate-100 hover:text-pac-primary",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="bg-white p-8 rounded-full shadow-sm mb-6 border border-slate-100">
            <RiGalleryLine className="w-16 h-16 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            Nenhum álbum encontrado
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Não encontramos galerias com os termos pesquisados.
          </p>
        </div>
      )}
    </section>
  );
}

function SkeletonGrid() {
  return (
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
  );
}
