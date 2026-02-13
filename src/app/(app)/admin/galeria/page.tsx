"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Icons
import {
  RiAddLine,
  RiSearchLine,
  RiFolderLine,
  RiImageLine,
  RiVideoLine,
  RiDeleteBinLine,
  RiMore2Fill,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFilterLine,
  RiEditLine,
  RiEyeLine,
  RiCloseLine,
} from "react-icons/ri";

// Store & Types
import {
  useCategoriasAdmin,
  useItensAdmin,
  useGaleriaStats,
  TipoItemFilter,
  StatusFilter,
  type GaleriaItem,
} from "@/lib/stores/useGaleriaStore";

// --- TIPOS AUXILIARES ---

// ✅ CORREÇÃO TS 2430: Usando Omit para evitar conflito de tipos com GaleriaItem
interface ExtendedItem extends Omit<GaleriaItem, "galeria_categorias"> {
  views?: number;
  galeria_categorias?: {
    nome: string;
  } | null;
}

// --- COMPONENTES AUXILIARES ---

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  loading: boolean;
}) => (
  <Card className="border-none shadow-sm bg-white overflow-hidden relative">
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass}`} />
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        )}
      </div>
      <div
        className={`p-3 rounded-xl ${colorClass.replace(
          "bg-",
          "bg-opacity-10 text-",
        )}`}
      >
        <Icon className={`w-6 h-6 ${colorClass.replace("bg-", "text-")}`} />
      </div>
    </CardContent>
  </Card>
);

// --- PÁGINA PRINCIPAL ---

export default function GaleriaAdminPage() {
  // --- STORE HOOKS ---
  const { categorias, fetchCategorias } = useCategoriasAdmin();

  const {
    itens,
    loading: loadingItens,
    filtros,
    pagination,
    fetchItens,
    setFiltros,
    resetFiltros,
    setPagination,
    deleteItem,
  } = useItensAdmin();

  const { stats, loading: loadingStats, fetchStats } = useGaleriaStats();

  // --- LOCAL STATE ---
  const [localSearch, setLocalSearch] = useState(filtros.search);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchStats(), fetchCategorias()]);
    };
    init();
  }, [fetchStats, fetchCategorias]);

  // --- DEBOUNCE SEARCH ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filtros.search) {
        setFiltros({ search: localSearch });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filtros.search, setFiltros]);

  // --- REACTIVE FETCH ---
  useEffect(() => {
    fetchItens();
  }, [
    filtros.categoria_id,
    filtros.tipo,
    filtros.status,
    filtros.search,
    pagination.page,
    fetchItens,
  ]);

  // --- HANDLERS ---
  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    const toastId = toast.loading("Excluindo item...");
    const res = await deleteItem(deleteDialog.id);

    if (res.success) {
      toast.success("Item excluído com sucesso", { id: toastId });
      fetchStats();
      setDeleteDialog({ open: false, id: null });
    } else {
      toast.error("Erro ao excluir item", { id: toastId });
    }
  };

  const hasActiveFilters =
    filtros.search !== "" ||
    filtros.categoria_id !== "all" ||
    filtros.tipo !== "all" ||
    filtros.status !== "all";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalItems = (pagination as any).total || 0;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight font-bebas mb-1 uppercase">
              Galeria de Mídia
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Gerencie fotos e vídeos, organize categorias e visualize
              estatísticas.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <Link href="/admin/galeria/categorias">
                <RiFolderLine className="mr-2 w-4 h-4" /> Categorias
              </Link>
            </Button>
            <Button
              asChild
              className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold shadow-md shadow-pac-primary/20"
            >
              <Link href="/admin/galeria/itens/criar">
                <RiAddLine className="mr-2 w-4 h-4" /> Novo Item
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Mídias"
            value={
              (stats?.categoriasPorTipo.fotos || 0) +
              (stats?.categoriasPorTipo.videos || 0)
            }
            icon={RiImageLine}
            colorClass="bg-blue-500"
            loading={loadingStats}
          />
          <StatCard
            title="Fotos"
            value={stats?.categoriasPorTipo.fotos || 0}
            icon={RiImageLine}
            colorClass="bg-emerald-500"
            loading={loadingStats}
          />
          <StatCard
            title="Vídeos"
            value={stats?.categoriasPorTipo.videos || 0}
            icon={RiVideoLine}
            colorClass="bg-purple-500"
            loading={loadingStats}
          />
          <StatCard
            title="Categorias Ativas"
            value={stats?.totalCategorias || 0}
            icon={RiFolderLine}
            colorClass="bg-amber-500"
            loading={loadingStats}
          />
        </div>

        {/* FILTROS */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por título..."
                  className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all h-10"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Select
                  value={filtros.categoria_id || "all"}
                  onValueChange={(v) => setFiltros({ categoria_id: v })}
                >
                  <SelectTrigger className="w-[180px] h-10 border-slate-200">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filtros.tipo || "all"}
                  onValueChange={(v) =>
                    setFiltros({ tipo: v as TipoItemFilter })
                  }
                >
                  <SelectTrigger className="w-[130px] h-10 border-slate-200">
                    <div className="flex items-center gap-2">
                      <RiFilterLine className="w-4 h-4 text-slate-400" />
                      <SelectValue placeholder="Tipo" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="foto">Fotos</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filtros.status || "all"}
                  onValueChange={(v) =>
                    setFiltros({ status: v as StatusFilter })
                  }
                >
                  <SelectTrigger className="w-[130px] h-10 border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
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
                    className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Limpar filtros"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GRID DE ITENS */}
        <Card className="border-none shadow-sm bg-white min-h-[400px]">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <RiImageLine className="text-pac-primary" />
                Itens da Galeria
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-600 font-normal"
              >
                Total: {totalItems}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loadingItens ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : itens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                  <RiFolderLine className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">
                  Nenhum item encontrado
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Tente ajustar os filtros de busca ou adicione um novo item.
                </p>
                <Button
                  variant="link"
                  className="text-pac-primary font-bold mt-2"
                  onClick={resetFiltros}
                >
                  Limpar todos os filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {itens.map((item) => {
                    const extItem = item as ExtendedItem;
                    return (
                      <motion.div
                        key={extItem.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-pac-primary/30 transition-all duration-300"
                      >
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          {extItem.tipo === "foto" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={extItem.url}
                              alt={extItem.titulo || "Imagem"}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                              <RiVideoLine className="w-12 h-12 text-white/50" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <Badge
                              className={
                                extItem.status
                                  ? "bg-emerald-500/90 hover:bg-emerald-500"
                                  : "bg-slate-500/90"
                              }
                            >
                              {extItem.status ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>

                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="h-8 w-8 bg-white/90 backdrop-blur shadow-sm hover:bg-white"
                                >
                                  <RiMore2Fill className="text-slate-700" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/galeria/itens/${extItem.id}`}
                                    className="cursor-pointer"
                                  >
                                    <RiEditLine className="mr-2 h-4 w-4" />{" "}
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      id: extItem.id,
                                    })
                                  }
                                >
                                  <RiDeleteBinLine className="mr-2 h-4 w-4" />{" "}
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-slate-200"
                            >
                              {extItem.tipo === "foto" ? "Foto" : "Vídeo"}
                            </Badge>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <RiEyeLine className="w-3 h-3" />{" "}
                              {extItem.views || 0}
                            </span>
                          </div>

                          <h4
                            className="font-bold text-slate-800 text-sm truncate mb-1"
                            title={extItem.titulo}
                          >
                            {extItem.titulo || "Sem título"}
                          </h4>

                          <p className="text-xs text-slate-500 truncate">
                            {extItem.galeria_categorias?.nome ||
                              "Sem Categoria"}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* PAGINAÇÃO */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination({ page: Math.max(1, pagination.page - 1) })
                  }
                  disabled={pagination.page === 1}
                  className="w-28"
                >
                  <RiArrowLeftSLine className="mr-1" /> Anterior
                </Button>
                <span className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-md">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination({
                      page: Math.min(
                        pagination.totalPages,
                        pagination.page + 1,
                      ),
                    })
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="w-28"
                >
                  Próxima <RiArrowRightSLine className="ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DIALOG DE EXCLUSÃO */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, id: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <RiDeleteBinLine /> Excluir Mídia
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este item permanentemente? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDeleteDialog({ open: false, id: null })}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
