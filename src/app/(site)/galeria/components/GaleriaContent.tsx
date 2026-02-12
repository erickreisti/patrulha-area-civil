"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useGaleriaPublica, Categoria } from "@/lib/stores/useGaleriaStore";
import { GaleriaCard } from "./GaleriaCard";
import { SearchAndFilter } from "./SearchAndFilter"; // <--- IMPORTANTE
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

export function GaleriaContent() {
  const {
    categorias,
    loading,
    error,
    pagination,
    fetchCategorias,
    setPagination,
  } = useGaleriaPublica();

  // LER FILTROS DA URL (Gerenciados pelo SearchAndFilter)
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const tipo = searchParams.get("tipo") || "all";

  // Buscar dados iniciais (Store)
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Filtragem no Cliente (baseada na URL)
  const filteredCategorias = categorias.filter((cat: Categoria) => {
    const matchesSearch = search
      ? cat.nome.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesTipo = tipo !== "all" ? cat.tipo === tipo : true;
    return matchesSearch && matchesTipo;
  });

  // Ordenação (Padrão: Mais recente)
  const sortedCategorias = [...filteredCategorias].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Paginação Lógica
  const itemsPerPage = 12;
  const totalPages = Math.ceil(sortedCategorias.length / itemsPerPage);

  // Ajuste de segurança: se a página na URL/Store for maior que o total, volta pra 1
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
    <>
      {/* AQUI ESTÁ A MUDANÇA PRINCIPAL:
          Usamos o componente SearchAndFilter isolado, que tem o estilo correto
      */}
      <SearchAndFilter initialSearch={search} initialTipo={tipo} />

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
                    // Lógica simples de paginação para exibir
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
    </>
  );
}
