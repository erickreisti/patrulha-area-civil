"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
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
} from "react-icons/ri";

// Store & Types
import { useItensAdmin, useGaleriaStats } from "@/lib/stores/useGaleriaStore";
import { deleteItem } from "@/app/actions/gallery";
import type {
  Item,
  TipoItemFilter,
  StatusFilter,
  Categoria,
} from "@/app/actions/gallery/types";

// ============================================
// COMPONENTES LOCAIS
// ============================================

const StatCard = ({
  title,
  value,
  icon,
  description,
  color,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "purple" | "indigo";
  loading: boolean;
}) => {
  const colorStyles = {
    blue: "bg-blue-50/50 text-blue-700 border-blue-100",
    green: "bg-emerald-50/50 text-emerald-700 border-emerald-100",
    purple: "bg-purple-50/50 text-purple-700 border-purple-100",
    indigo: "bg-indigo-50/50 text-indigo-700 border-indigo-100",
  };

  return (
    <Card
      className={`border shadow-sm hover:shadow-md transition-all duration-300 ${colorStyles[color]}`}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-16 bg-current opacity-20 rounded-lg" />
            ) : (
              <h3 className="text-3xl font-black tracking-tight">{value}</h3>
            )}
            <p className="text-xs mt-1 opacity-80 font-medium">{description}</p>
          </div>
          <div className="p-2.5 bg-white/60 rounded-xl backdrop-blur-sm shadow-sm border border-white/40">
            {icon}
          </div>
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
  } = useItensAdmin();

  const { stats, loading: loadingStats, fetchStats } = useGaleriaStats();

  // Estado Local
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: Item | null;
    loading: boolean;
  }>({
    open: false,
    item: null,
    loading: false,
  });

  // Carregar dados iniciais
  useEffect(() => {
    fetchItens();
    fetchCategorias();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler de Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchItens(), fetchStats()]);
    setRefreshing(false);
    toast.success("Dados atualizados com sucesso");
  };

  // Handler de Deleção
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const res = await deleteItem(deleteDialog.item.id);
      if (res.success) {
        toast.success("Item excluído com sucesso");
        fetchItens();
        fetchStats();
        setDeleteDialog({ open: false, item: null, loading: false });
      } else {
        toast.error(res.error || "Erro ao excluir item");
        setDeleteDialog((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      toast.error("Erro desconhecido ao excluir");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-bebas">
              GERENCIAR ITENS
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Gerencie todas as fotos e vídeos da galeria.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
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
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-100 transition-all hover:translate-y-[-1px]">
                <RiAddLine className="mr-2" /> Novo Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Itens"
            value={stats?.total_itens || 0}
            icon={<RiGridLine className="w-5 h-5" />}
            color="blue"
            description="Mídias cadastradas"
            loading={loadingStats}
          />
          <StatCard
            title="Ativos"
            value={stats?.itens_ativos || 0}
            icon={<RiImageLine className="w-5 h-5" />}
            color="green"
            description="Visíveis no site"
            loading={loadingStats}
          />
          <StatCard
            title="Vídeos"
            value={stats?.total_videos || 0}
            icon={<RiVideoLine className="w-5 h-5" />}
            color="purple"
            description="Vídeos na galeria"
            loading={loadingStats}
          />
          <StatCard
            title="Destaques"
            value={stats?.itens_destaque || 0}
            icon={<RiStarFill className="w-5 h-5" />}
            color="indigo"
            description="Itens na home"
            loading={loadingStats}
          />
        </div>

        {/* Filtros */}
        <Card className="border-none shadow-md bg-white mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Busca */}
              <div className="relative md:col-span-4 lg:col-span-5">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar por título..."
                  value={filtros.search}
                  onChange={(e) => setFiltros({ search: e.target.value })}
                  className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white h-10 transition-colors"
                />
              </div>

              {/* Selects */}
              <div className="md:col-span-8 lg:col-span-7 flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <Select
                  value={filtros.categoria_id}
                  onValueChange={(v) => setFiltros({ categoria_id: v })}
                >
                  <SelectTrigger className="w-[160px] border-slate-200 bg-slate-50/50 h-10 text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <RiFolderLine className="text-slate-400" />
                      <SelectValue placeholder="Categoria" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {listaCategorias.map((c: Categoria) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filtros.tipo}
                  onValueChange={(v) =>
                    setFiltros({ tipo: v as TipoItemFilter })
                  }
                >
                  <SelectTrigger className="w-[130px] border-slate-200 bg-slate-50/50 h-10 text-slate-600">
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
                  value={filtros.status}
                  onValueChange={(v) =>
                    setFiltros({ status: v as StatusFilter })
                  }
                >
                  <SelectTrigger className="w-[130px] border-slate-200 bg-slate-50/50 h-10 text-slate-600">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFiltros}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 h-10 w-10"
                  title="Limpar Filtros"
                >
                  <RiDeleteBinLine />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Itens */}
        <Card className="border-none shadow-md overflow-hidden bg-white">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-lg">Itens</span>
              <Badge
                variant="secondary"
                className="bg-white border-slate-200 text-slate-600 shadow-sm"
              >
                {pagination.total}
              </Badge>
            </div>
            <Link href="/admin/galeria/itens/criar">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-100 transition-all hover:translate-y-[-1px]"
              >
                <RiAddLine className="mr-1.5" /> Adicionar Mídia
              </Button>
            </Link>
          </div>

          {loadingList && !refreshing ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <div className="flex-1 space-y-2 py-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : itens.length === 0 ? (
            <div className="text-center py-16 bg-white">
              <div className="bg-slate-50 p-4 rounded-full mb-3 inline-block">
                <RiImageLine className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Nenhum item encontrado
              </h3>
              <p className="text-slate-500 mb-6">
                Tente ajustar os filtros ou adicione uma nova mídia.
              </p>
              <Link href="/admin/galeria/itens/criar">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Adicionar Mídia
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {itens.map((item: Item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group p-4 flex flex-col sm:flex-row gap-5 items-center hover:bg-slate-50/80 transition-all duration-200"
                  >
                    <ImageThumbnail
                      src={item.thumbnail_url || item.arquivo_url}
                      tipo={item.tipo}
                    />

                    <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h4 className="font-bold text-slate-800 truncate text-base">
                          {item.titulo}
                        </h4>
                        {item.destaque && (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 px-1.5 py-0 shadow-none">
                            <RiStarFill className="w-3 h-3 mr-1" /> Destaque
                          </Badge>
                        )}
                        {!item.status && (
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
                          {item.tipo === "foto" ? (
                            <RiImageLine className="text-emerald-500" />
                          ) : (
                            <RiVideoLine className="text-purple-500" />
                          )}
                          {item.tipo === "foto" ? "Foto" : "Vídeo"}
                        </span>

                        {item.galeria_categorias && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1.5">
                              <RiFolderLine className="text-blue-500" />
                              {item.galeria_categorias.nome}
                            </span>
                          </>
                        )}

                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">
                          {new Date(item.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/galeria/itens/${item.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 border-slate-200 hover:bg-white hover:border-emerald-300 hover:text-emerald-600 shadow-sm"
                        >
                          <RiEditLine className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDeleteDialog({ open: true, item, loading: false })
                        }
                        className="h-9 w-9 p-0 border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-center items-center gap-4 bg-slate-50/30">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination({ page: pagination.page - 1 })}
                className="bg-white border-slate-200 shadow-sm"
              >
                Anterior
              </Button>
              <span className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ page: pagination.page + 1 })}
                className="bg-white border-slate-200 shadow-sm"
              >
                Próxima
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
          <DialogContent className="rounded-2xl border-0 shadow-2xl">
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
                className="bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-100"
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
