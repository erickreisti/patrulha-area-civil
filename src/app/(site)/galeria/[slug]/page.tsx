"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paginacao } from "@/app/(app)/admin/galeria/components/Paginacao";

// Icons
import { RiArrowLeftLine, RiStarFill, RiImageLine } from "react-icons/ri";

// Store & Local Components
import {
  useCategoriaSelecionada,
  useItensList,
} from "@/lib/stores/useGaleriaStore";
import { GaleriaItemCard } from "../components/GaleriaItemCard";

// Opções
const ITEMS_PER_PAGE_OPTIONS = ["12", "24", "36", "48", "60"];

export default function CategoriaGaleriaPage() {
  const params = useParams();
  const slug = params.slug as string;

  // 1. Hook da Categoria
  const {
    categoria,
    loading: loadingCategoria,
    error: errorCategoria,
    fetchCategoriaPorSlug,
    clearError: clearErrorCategoria,
  } = useCategoriaSelecionada();

  // 2. Hook da Lista de Itens
  const {
    itens,
    loading: loadingItens,
    error: errorItens,
    filtros,
    pagination,
    fetchItens,
    setFiltros,
    clearError: clearErrorItens,
    setPagination,
  } = useItensList();

  const [selectedDestaque, setSelectedDestaque] = useState<
    "all" | "true" | "false"
  >("all");
  const initialLoadRef = useRef(false);

  // --- Efeitos ---

  // Carregar Categoria pelo Slug
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        initialLoadRef.current = true;
        await fetchCategoriaPorSlug(slug);
      } catch (error) {
        console.error(error);
        notFound();
      }
    };
    load();
    return () => {
      clearErrorCategoria();
      clearErrorItens();
      initialLoadRef.current = false;
    };
  }, [slug, fetchCategoriaPorSlug, clearErrorCategoria, clearErrorItens]);

  // Configurar Filtros quando a categoria carrega
  useEffect(() => {
    if (categoria?.id) {
      setFiltros({
        categoria_id: categoria.id,
        status: "ativo",
        tipo: categoria.tipo === "fotos" ? "foto" : "video",
        page: 1,
      });
    }
  }, [categoria, setFiltros]);

  // Buscar Itens (Debounce)
  useEffect(() => {
    if (!categoria?.id || !initialLoadRef.current) return;

    const timer = setTimeout(() => {
      fetchItens();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    categoria?.id,
    fetchItens,
    filtros.search,
    filtros.destaque,
    filtros.limit,
    filtros.page,
  ]);

  // --- Handlers ---

  const handlePageChange = (page: number) => setPagination({ page });

  const handleLimitChange = (val: string) =>
    setPagination({ limit: Number(val), page: 1 });

  const handleDestaqueChange = (val: "all" | "true" | "false") => {
    setSelectedDestaque(val);
    setFiltros({ destaque: val === "all" ? undefined : val, page: 1 });
  };

  // --- Renderização ---

  // Loading Inicial da Categoria
  if ((loadingCategoria && !categoria) || !categoria) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <p className="text-slate-500">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  // Erro Crítico
  if (errorCategoria) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">Erro ao carregar</h2>
            <p className="text-slate-600">{errorCategoria}</p>
            <Link href="/galeria">
              <Button variant="outline">Voltar para Galeria</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header da Categoria */}
      <section className="bg-navy-900 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/galeria" className="inline-block mb-8">
            <Button
              variant="ghost"
              className="text-blue-100 hover:text-white hover:bg-white/10"
            >
              <RiArrowLeftLine className="mr-2" /> Voltar para Galeria
            </Button>
          </Link>

          <Badge className="mb-4 bg-blue-500/20 text-blue-100 border-blue-500/30">
            {categoria.tipo === "fotos"
              ? "Galeria de Fotos"
              : "Galeria de Vídeos"}
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-bebas tracking-wide">
            {categoria.nome}
          </h1>

          <p className="text-lg text-blue-100 max-w-2xl font-light">
            {categoria.descricao || "Coleção de mídia da Patrulha Aérea Civil"}
          </p>
        </div>
      </section>

      {/* Área de Conteúdo */}
      <section className="py-12 container mx-auto px-4">
        {/* Barra de Controles */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Seletor de Limite */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 hidden sm:inline">
                Mostrar:
              </span>
              <Select
                value={pagination.limit.toString()}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt} por página
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block" />

            {/* Filtro de Destaque */}
            <div className="flex gap-2">
              <Badge
                variant={selectedDestaque === "all" ? "default" : "outline"}
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => handleDestaqueChange("all")}
              >
                Todos
              </Badge>
              <Badge
                variant={selectedDestaque === "true" ? "default" : "outline"}
                className="cursor-pointer hover:bg-amber-50 border-amber-200 text-amber-700"
                onClick={() => handleDestaqueChange("true")}
              >
                <RiStarFill className="mr-1 w-3 h-3" /> Destaques
              </Badge>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            Encontrados: <strong>{pagination.total}</strong>
          </div>
        </div>

        {/* Grid de Itens */}
        <AnimatePresence mode="wait">
          {loadingItens ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border p-4 space-y-4"
                >
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : errorItens ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
              <p className="text-red-600 mb-4">{errorItens}</p>
              <Button variant="outline" onClick={() => fetchItens()}>
                Tentar Novamente
              </Button>
            </div>
          ) : itens.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
              <RiImageLine className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600">
                Nenhum item encontrado
              </h3>
              <p className="text-slate-400 mt-2">Tente limpar os filtros.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {itens.map((item, idx) => (
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
          )}
        </AnimatePresence>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Paginacao
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </div>
  );
}
