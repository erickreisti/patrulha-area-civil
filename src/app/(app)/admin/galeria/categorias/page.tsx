"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Icons
import {
  RiAddLine,
  RiRefreshLine,
  RiArrowLeftLine,
  RiFolderLine,
  RiImageLine,
  RiVideoLine,
  RiEyeLine,
  RiEyeOffLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAlertLine,
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLayoutGridLine,
} from "react-icons/ri";

// Store & Types
import {
  useCategoriasAdmin,
  useGaleriaStats,
  Categoria,
  TipoCategoriaFilter,
} from "@/lib/stores/useGaleriaStore";
import { deleteCategoria } from "@/app/actions/gallery";

// ============================================
// COMPONENTES LOCAIS (Estilo Dashboard)
// ============================================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  variant: "primary" | "success" | "warning" | "purple" | "blue";
  loading: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  variant,
  loading,
}: StatCardProps) => {
  const variants = {
    primary: "bg-blue-50 text-blue-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-sky-50 text-sky-600",
  };

  return (
    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-8 w-16 bg-slate-100" />
          ) : (
            <h3 className="text-2xl font-black text-slate-800">{value}</h3>
          )}
        </div>
        <div className={`p-3 rounded-xl ${variants[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function CategoriasGaleriaPage() {
  const router = useRouter();

  // Store Hooks
  const {
    categorias,
    loading: loadingList,
    filtros,
    pagination,
    fetchCategorias,
    setFiltros,
    resetFiltros,
    setPagination,
    toggleStatus,
  } = useCategoriasAdmin();

  const { stats, loading: loadingStats, fetchStats } = useGaleriaStats();

  // Local State
  const [refreshing, setRefreshing] = useState(false);
  const [localSearch, setLocalSearch] = useState(filtros.search);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoria: Categoria | null;
    loading: boolean;
  }>({
    open: false,
    categoria: null,
    loading: false,
  });

  // Initial Load
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchCategorias(), fetchStats()]);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filtros.search) {
        setFiltros({ search: localSearch });
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  // Reactive Fetch
  useEffect(() => {
    fetchCategorias();
  }, [filtros, pagination.page, fetchCategorias]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCategorias(), fetchStats()]);
    setRefreshing(false);
    toast.success("Dados atualizados");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.categoria) return;
    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const res = await deleteCategoria(deleteDialog.categoria.id);
      if (res.success) {
        toast.success("Categoria excluída");
        fetchCategorias();
        fetchStats();
        setDeleteDialog({ open: false, categoria: null, loading: false });
      } else {
        toast.error(res.error || "Erro ao excluir");
        setDeleteDialog((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      toast.error("Erro desconhecido");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleStatus(id, currentStatus);
    if (res.success) {
      toast.success(`Categoria ${!currentStatus ? "ativada" : "desativada"}`);
    } else {
      toast.error("Erro ao alterar status");
    }
  };

  const hasActiveFilters = filtros.search !== "" || filtros.tipo !== "all";

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-bebas mb-1">
              GERENCIAR CATEGORIAS
            </h1>
            <p className="text-slate-500 text-sm">
              Organize seus álbuns de fotos e vídeos da galeria.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/galeria")}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <RiArrowLeftLine className="mr-2" /> Voltar
            </Button>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <RiRefreshLine
                className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>

            <Link href="/admin/galeria/categorias/criar">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-100 transition-all">
                <RiAddLine className="mr-2" /> Nova Categoria
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Categorias"
            value={stats?.totalCategorias || 0}
            icon={RiLayoutGridLine}
            variant="primary"
            loading={loadingStats}
          />
          <StatCard
            title="Ativas"
            value={stats?.categoriasAtivas || 0}
            icon={RiEyeLine}
            variant="success"
            loading={loadingStats}
          />
          <StatCard
            title="Álbuns de Fotos"
            value={stats?.categoriasPorTipo.fotos || 0}
            icon={RiImageLine}
            variant="blue"
            loading={loadingStats}
          />
          <StatCard
            title="Álbuns de Vídeos"
            value={stats?.categoriasPorTipo.videos || 0}
            icon={RiVideoLine}
            variant="purple"
            loading={loadingStats}
          />
        </div>

        {/* FILTROS */}
        <Card className="border-none shadow-sm bg-white mb-8">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="relative flex-1">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar categoria..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all h-10 rounded-lg focus:ring-pac-primary"
                />
              </div>

              {/* Filtros Dropdown */}
              <div className="flex flex-wrap gap-3">
                <Select
                  value={filtros.tipo}
                  onValueChange={(v) =>
                    setFiltros({ tipo: v as TipoCategoriaFilter })
                  }
                >
                  <SelectTrigger className="w-[160px] h-10 border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <RiFilterLine className="text-slate-400" />
                      <SelectValue placeholder="Tipo" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Tipos</SelectItem>
                    <SelectItem value="fotos">Fotos</SelectItem>
                    <SelectItem value="videos">Vídeos</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setLocalSearch("");
                      resetFiltros();
                    }}
                    className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    title="Limpar Filtros"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LISTA DE CATEGORIAS */}
        {loadingList && !refreshing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-none shadow-sm bg-white h-48">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
                    <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
                  </div>
                  <Skeleton className="h-6 w-3/4 bg-slate-100" />
                  <Skeleton className="h-4 w-full bg-slate-100" />
                  <div className="pt-4 flex gap-2">
                    <Skeleton className="h-8 flex-1 bg-slate-100" />
                    <Skeleton className="h-8 w-8 bg-slate-100" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-50 p-6 rounded-full mb-4 border border-slate-100">
              <RiFolderLine className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              Tente ajustar os filtros ou crie uma nova categoria.
            </p>
            <Link href="/admin/galeria/categorias/criar">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Criar Categoria
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {categorias.map((cat: Categoria, index: number) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className="h-full border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-white group flex flex-col">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Topo do Card */}
                        <div className="flex justify-between items-start mb-4">
                          <div
                            className={`p-3 rounded-xl transition-colors ${
                              cat.tipo === "fotos"
                                ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                : "bg-purple-50 text-purple-600 group-hover:bg-purple-100"
                            }`}
                          >
                            {cat.tipo === "fotos" ? (
                              <RiImageLine className="w-6 h-6" />
                            ) : (
                              <RiVideoLine className="w-6 h-6" />
                            )}
                          </div>
                          <Badge
                            className={
                              cat.status
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-none border-0"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-none border-0"
                            }
                          >
                            {cat.status ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>

                        {/* Conteúdo */}
                        <div className="mb-6 flex-1">
                          <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-pac-primary transition-colors line-clamp-1">
                            {cat.nome}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed min-h-[40px]">
                            {cat.descricao || "Sem descrição definida."}
                          </p>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-6 font-medium">
                          <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            <RiFolderLine className="text-slate-400" />
                            {cat.itens_count || 0} itens
                          </span>
                          <span className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            Ordem: {cat.ordem}
                          </span>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                          <Link
                            href={`/admin/galeria/categorias/${cat.id}`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-white border-slate-200 hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-700 font-medium"
                            >
                              <RiEditLine className="mr-2 w-4 h-4" /> Editar
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title={cat.status ? "Desativar" : "Ativar"}
                            onClick={() =>
                              handleToggleStatus(cat.id, cat.status)
                            }
                          >
                            {cat.status ? <RiEyeOffLine /> : <RiEyeLine />}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Excluir"
                            disabled={(cat.itens_count || 0) > 0}
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                categoria: cat,
                                loading: false,
                              })
                            }
                          >
                            <RiDeleteBinLine />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination({ page: Math.max(1, pagination.page - 1) })
                  }
                  className="bg-white border-slate-200 shadow-sm w-28"
                >
                  <RiArrowLeftSLine className="mr-1" /> Anterior
                </Button>
                <span className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-md border border-slate-200 shadow-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination({
                      page: Math.min(
                        pagination.totalPages,
                        pagination.page + 1,
                      ),
                    })
                  }
                  className="bg-white border-slate-200 shadow-sm w-28"
                >
                  Próxima <RiArrowRightSLine className="ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Dialog de Exclusão */}
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            !open && setDeleteDialog((prev) => ({ ...prev, open: false }))
          }
        >
          <DialogContent className="rounded-2xl border-0 shadow-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 font-bold text-xl">
                <RiAlertLine className="w-6 h-6" /> Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="pt-2 text-base text-slate-600">
                Tem certeza que deseja excluir a categoria{" "}
                <span className="font-bold text-slate-800 bg-slate-100 px-1 rounded">
                  {deleteDialog.categoria?.nome}
                </span>
                ?
                <br />
                <br />
                Essa ação é irreversível e removerá a categoria do banco de
                dados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog((prev) => ({ ...prev, open: false }))
                }
                disabled={deleteDialog.loading}
                className="rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteDialog.loading}
                className="bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-100 font-bold"
              >
                {deleteDialog.loading ? "Excluindo..." : "Sim, Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
