"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  RiAddLine,
  RiRefreshLine,
  RiArrowLeftLine,
  RiImageLine,
  RiVideoLine,
  RiSearchLine,
  RiFilterLine,
  RiDeleteBinLine,
  RiEditLine,
  RiAlertLine,
  RiStarFill,
  RiGridLine,
  RiFolderLine,
  RiMore2Fill,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine, // ✅ Adicionado
} from "react-icons/ri";

// Store & Types
import {
  useItensAdmin,
  useGaleriaStats,
  GaleriaItem,
  TipoItemFilter,
  StatusFilter,
} from "@/lib/stores/useGaleriaStore";

// --- TIPOS ---

// ✅ CORREÇÃO TS: Usamos Omit para remover a definição original e evitar conflito
interface ExtendedItem extends Omit<GaleriaItem, "galeria_categorias"> {
  galeria_categorias?: {
    nome: string;
  } | null;
}

// ============================================
// COMPONENTES LOCAIS
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

const ImageThumbnail = ({
  src,
  tipo,
}: {
  src: string | null;
  tipo: string;
}) => {
  const [error, setError] = useState(false);

  if (tipo === "video") {
    return (
      <div className="w-16 h-16 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-500 shadow-sm flex-shrink-0">
        <RiVideoLine className="w-6 h-6" />
      </div>
    );
  }

  if (!src || error) {
    return (
      <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm flex-shrink-0">
        <RiImageLine className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 group bg-slate-100">
      <Image
        src={src}
        alt="Thumbnail"
        fill
        sizes="64px"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        onError={() => setError(true)}
      />
    </div>
  );
};

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function ItensGaleriaPage() {
  const router = useRouter();

  // Store Hooks
  const {
    itens,
    loading: loadingList,
    filtros,
    pagination,
    fetchItens,
    fetchCategorias,
    categorias: listaCategorias,
    setFiltros,
    resetFiltros,
    setPagination,
    deleteItem,
  } = useItensAdmin();

  const { stats, loading: loadingStats, fetchStats } = useGaleriaStats();

  const [refreshing, setRefreshing] = useState(false);
  const [localSearch, setLocalSearch] = useState(filtros.search);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: GaleriaItem | null;
    loading: boolean;
  }>({
    open: false,
    item: null,
    loading: false,
  });

  // Init
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchItens(), fetchCategorias(), fetchStats()]);
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
    fetchItens();
  }, [
    filtros.categoria_id,
    filtros.tipo,
    filtros.status,
    filtros.search,
    pagination.page,
    fetchItens,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchItens(), fetchStats()]);
    setRefreshing(false);
    toast.success("Dados atualizados");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    const res = await deleteItem(deleteDialog.item.id);
    if (res.success) {
      toast.success("Item excluído");
      fetchItens();
      fetchStats();
      setDeleteDialog({ open: false, item: null, loading: false });
    } else {
      toast.error(res.error || "Erro ao excluir");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
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
              GERENCIAR ITENS
            </h1>
            <p className="text-slate-500 text-sm">
              Gerencie todas as fotos e vídeos da galeria do sistema.
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

            <Link href="/admin/galeria/itens/criar">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-100 transition-all">
                <RiAddLine className="mr-2" /> Novo Item
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Itens"
            value={stats?.totalItens || 0}
            icon={RiGridLine}
            variant="primary"
            loading={loadingStats}
          />
          <StatCard
            title="Ativos"
            value={stats?.itensAtivos || 0}
            icon={RiImageLine}
            variant="success"
            loading={loadingStats}
          />
          <StatCard
            title="Vídeos"
            value={stats?.totalVideos || 0}
            icon={RiVideoLine}
            variant="purple"
            loading={loadingStats}
          />
          <StatCard
            title="Destaques"
            value={stats?.itensDestaque || 0}
            icon={RiStarFill}
            variant="warning"
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
                  placeholder="Buscar por título..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all h-10 rounded-lg focus:ring-pac-primary"
                />
              </div>

              {/* Filtros Dropdown */}
              <div className="flex flex-wrap gap-3">
                <Select
                  value={filtros.categoria_id || "all"}
                  onValueChange={(v) => setFiltros({ categoria_id: v })}
                >
                  <SelectTrigger className="w-[180px] h-10 border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 truncate">
                      <RiFolderLine className="text-slate-400" />
                      <SelectValue placeholder="Categoria" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {listaCategorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
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
                  <SelectTrigger className="w-[130px] h-10 border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <RiFilterLine className="text-slate-400" />
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
                  <SelectTrigger className="w-[130px] h-10 border-slate-200 rounded-lg">
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

        {/* LISTA DE ITENS */}
        <Card className="border-none shadow-sm bg-white min-h-[400px]">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <RiImageLine className="text-pac-primary" />
                Itens da Galeria
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-white text-slate-600 font-normal border-slate-200"
              >
                Total: {totalItems}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loadingList && !refreshing ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 border rounded-xl border-slate-100"
                  >
                    <Skeleton className="w-16 h-16 rounded-lg bg-slate-100" />
                    <div className="flex-1 space-y-2 py-2">
                      <Skeleton className="h-5 w-1/3 bg-slate-100" />
                      <Skeleton className="h-4 w-1/4 bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : itens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4 border border-slate-100">
                  <RiFolderLine className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">
                  Nenhum item encontrado
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                  Tente ajustar os filtros de busca ou adicione uma nova mídia.
                </p>
                <Link href="/admin/galeria/itens/criar">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Adicionar Mídia
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {itens.map((item) => {
                    const extItem = item as ExtendedItem;
                    return (
                      <motion.div
                        key={extItem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="group p-4 flex flex-col sm:flex-row gap-5 items-center hover:bg-slate-50/50 transition-colors"
                      >
                        <ImageThumbnail
                          src={extItem.thumbnail_url || extItem.url}
                          tipo={extItem.tipo}
                        />

                        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5 w-full">
                          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            <h4
                              className="font-bold text-slate-800 truncate text-base max-w-[200px] sm:max-w-[400px]"
                              title={extItem.titulo}
                            >
                              {extItem.titulo}
                            </h4>
                            {extItem.destaque && (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 px-1.5 py-0 shadow-none">
                                <RiStarFill className="w-3 h-3 mr-1" /> Destaque
                              </Badge>
                            )}
                            {!extItem.status && (
                              <Badge
                                variant="outline"
                                className="text-slate-400 border-slate-300 bg-slate-50"
                              >
                                Inativo
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              {extItem.tipo === "foto" ? (
                                <RiImageLine className="text-emerald-500" />
                              ) : (
                                <RiVideoLine className="text-purple-500" />
                              )}
                              {extItem.tipo === "foto" ? "Foto" : "Vídeo"}
                            </span>

                            {extItem.galeria_categorias?.nome && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-1.5">
                                  <RiFolderLine className="text-blue-500" />
                                  {extItem.galeria_categorias.nome}
                                </span>
                              </>
                            )}

                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400">
                              {new Date(extItem.created_at).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/galeria/itens/${extItem.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 border-slate-200 hover:bg-white hover:border-emerald-300 hover:text-emerald-600 shadow-sm"
                            >
                              <RiEditLine className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-500 shadow-sm"
                              >
                                <RiMore2Fill className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    item,
                                    loading: false,
                                  })
                                }
                                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                              >
                                <RiDeleteBinLine className="mr-2 h-4 w-4" />{" "}
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-center items-center gap-4 bg-slate-50/30">
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
              <span className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination({
                    page: Math.min(pagination.totalPages, pagination.page + 1),
                  })
                }
                className="bg-white border-slate-200 shadow-sm w-28"
              >
                Próxima <RiArrowRightSLine className="ml-1" />
              </Button>
            </div>
          )}
        </Card>

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
                Tem certeza que deseja excluir o item{" "}
                <span className="font-bold text-slate-800 bg-slate-100 px-1 rounded">
                  {deleteDialog.item?.titulo}
                </span>
                ?
                <br />
                <br />
                Essa ação é irreversível e removerá o arquivo do armazenamento.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
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
