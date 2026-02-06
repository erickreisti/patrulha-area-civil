"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGaleriaDetalhe } from "@/lib/stores/useGaleriaStore";
// CORREÇÃO: Caminho absoluto para evitar erro 'Cannot find module'
import { GaleriaItemCard } from "@/app/(site)/galeria/components/GaleriaItemCard";
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
  RiArrowLeftLine,
  RiImageLine,
  RiVideoLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils/cn";
import type { Item } from "@/app/actions/gallery/types";

export function GaleriaDetalheContent({ slug }: { slug: string }) {
  const {
    categoria,
    itens,
    loading,
    error,
    pagination,
    fetchCategoria,
    fetchItens,
    setFiltros,
    setPagination,
    clearError,
  } = useGaleriaDetalhe();

  // Inicialização
  useEffect(() => {
    const init = async () => {
      clearError();
      await fetchCategoria(slug);
      // Configura o filtro com o slug para buscar os itens corretos
      setFiltros({ categoriaSlug: slug, page: 1, limit: 12 });
    };
    init();
  }, [slug, fetchCategoria, setFiltros, clearError]);

  // Carregar itens quando filtro/paginação mudar
  useEffect(() => {
    // Só busca itens se já tivermos a categoria carregada (para ter o ID se necessário no back, ou apenas slug)
    if (categoria?.id) {
      fetchItens();
    }
  }, [categoria?.id, pagination.page, fetchItens]);

  const handlePageChange = (page: number) => {
    setPagination({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- RENDERIZAÇÃO ---

  // Loading Inicial
  if (loading && !categoria) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 container mx-auto px-4">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="space-y-4 mb-12">
          <Skeleton className="h-10 w-3/4 max-w-xl" />
          <Skeleton className="h-4 w-1/2 max-w-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Erro
  if (error && !categoria) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <RiErrorWarningLine className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Não foi possível carregar
          </h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button asChild variant="outline">
            <Link href="/galeria">Voltar para a Galeria</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!categoria) return null;

  const totalPages = pagination.totalPages || 1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER DA CATEGORIA */}
      <section className="bg-white border-b border-slate-100 pt-24 pb-12 lg:pt-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/patterns/grid.svg')] opacity-[0.03] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <Link
            href="/galeria"
            className="inline-flex items-center gap-2 mb-8 group text-sm font-bold text-slate-500 hover:text-pac-primary transition-colors"
          >
            <RiArrowLeftLine className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Voltar para Galeria
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600 border-0 gap-1.5 px-3 py-1 rounded-full"
              >
                {categoria.tipo === "fotos" ? (
                  <RiImageLine className="w-3.5 h-3.5" />
                ) : (
                  <RiVideoLine className="w-3.5 h-3.5" />
                )}
                {categoria.tipo === "fotos"
                  ? "Álbum de Fotos"
                  : "Galeria de Vídeos"}
              </Badge>
              {categoria.itens_count && (
                <Badge
                  variant="outline"
                  className="text-slate-400 border-slate-200 font-normal rounded-full"
                >
                  {categoria.itens_count}{" "}
                  {categoria.itens_count === 1 ? "item" : "itens"}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight leading-tight">
              {categoria.nome}
            </h1>

            {categoria.descricao && (
              <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
                {categoria.descricao}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* LISTA DE ITENS */}
      <section className="py-12 lg:py-16 container mx-auto px-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-52 w-full rounded-2xl bg-slate-200" />
                  <Skeleton className="h-4 w-3/4 bg-slate-200" />
                </div>
              ))}
            </div>
          ) : itens.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
              >
                {itens.map((item: Item, idx: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <GaleriaItemCard item={item} />
                  </motion.div>
                ))}
              </motion.div>

              {/* PAGINAÇÃO */}
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

                    {Array.from({ length: pagination.totalPages }).map(
                      (_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
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
                        if (Math.abs(page - pagination.page) === 2) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      },
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(
                              pagination.totalPages,
                              pagination.page + 1,
                            ),
                          )
                        }
                        className={
                          pagination.page === pagination.totalPages
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
            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <RiImageLine className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Esta galeria está vazia
              </h3>
              <p className="text-slate-500">
                Nenhum item foi adicionado ainda.
              </p>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
