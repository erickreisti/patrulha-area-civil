"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// UI
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "react-icons/ri";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Store
import {
  useCategoriasAdmin,
  useItensAdmin,
  useGaleriaStats,
  TipoItemFilter,
  StatusFilter,
} from "@/lib/stores/useGaleriaStore";

// Componentes Locais
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}

const StatCard = ({ title, value, icon, color, loading }: StatCardProps) => (
  <Card className={`border-l-4 ${color} shadow-sm`}>
    <CardContent className="p-5 flex justify-between items-center">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        {loading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        )}
      </div>
      <div className={`p-3 rounded-full bg-slate-50 text-slate-500`}>
        {icon}
      </div>
    </CardContent>
  </Card>
);

export default function GaleriaAdminPage() {
  // HOOKS DA STORE
  const {
    categorias,
    fetchCategorias, // Usado para popular o select de categorias
  } = useCategoriasAdmin();

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

  // ESTADO LOCAL (Apenas UI)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  // EFEITOS INICIAIS
  useEffect(() => {
    fetchStats();
    fetchCategorias();
    // fetchItens será chamado automaticamente pelo efeito abaixo quando os filtros mudarem ou na montagem inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ CORREÇÃO 1: Efeito reativo único para buscar itens quando filtros/paginação mudam
  useEffect(() => {
    fetchItens(); // Não passa argumentos, usa o estado da store
  }, [filtros, pagination.page, fetchItens]);

  // HANDLERS
  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    const res = await deleteItem(deleteDialog.id);
    if (res.success) {
      toast.success("Item excluído com sucesso");
      fetchStats(); // Atualiza stats após deletar
      setDeleteDialog({ open: false, id: null });
    } else {
      toast.error("Erro ao excluir item");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight font-bebas">
            GALERIA DE MÍDIA
          </h1>
          <p className="text-slate-500 font-medium">
            Gerencie todas as fotos e vídeos do sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/galeria/categorias">
            <Button variant="outline" className="gap-2">
              <RiFolderLine /> Gerenciar Categorias
            </Button>
          </Link>
          <Link href="/admin/galeria/itens/criar">
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <RiAddLine /> Novo Item
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Itens"
          value={
            (stats?.categoriasPorTipo.fotos || 0) +
            (stats?.categoriasPorTipo.videos || 0)
          }
          icon={<RiImageLine className="w-6 h-6" />}
          color="border-blue-500"
          loading={loadingStats}
        />
        <StatCard
          title="Fotos"
          value={stats?.categoriasPorTipo.fotos || 0}
          icon={<RiImageLine className="w-6 h-6" />}
          color="border-indigo-500"
          loading={loadingStats}
        />
        <StatCard
          title="Vídeos"
          value={stats?.categoriasPorTipo.videos || 0}
          icon={<RiVideoLine className="w-6 h-6" />}
          color="border-purple-500"
          loading={loadingStats}
        />
        <StatCard
          title="Categorias"
          value={stats?.totalCategorias || 0}
          icon={<RiFolderLine className="w-6 h-6" />}
          color="border-emerald-500"
          loading={loadingStats}
        />
      </div>

      {/* FILTROS */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por título..."
              className="pl-10"
              value={filtros.search}
              onChange={(e) => setFiltros({ search: e.target.value })}
            />
          </div>

          {/* ✅ CORREÇÃO 2: Filtro de Categoria conectado diretamente à Store */}
          <Select
            value={filtros.categoria_id || "all"}
            onValueChange={(v) => setFiltros({ categoria_id: v })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por Categoria" />
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

          {/* ✅ CORREÇÃO 3: Filtro de Tipo com valores compatíveis ("all", "foto", "video") */}
          <Select
            value={filtros.tipo || "all"}
            onValueChange={(val) => setFiltros({ tipo: val as TipoItemFilter })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="foto">Fotos</SelectItem>
              <SelectItem value="video">Vídeos</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de Status */}
          <Select
            value={filtros.status || "all"}
            onValueChange={(val) => setFiltros({ status: val as StatusFilter })}
          >
            <SelectTrigger className="w-[150px]">
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
            title="Limpar Filtros"
          >
            <RiDeleteBinLine className="w-5 h-5 text-slate-400 hover:text-red-500" />
          </Button>
        </CardContent>
      </Card>

      {/* LISTA DE ITENS */}
      {filtros.categoria_id === "all" &&
      itens.length === 0 &&
      !filtros.search ? (
        // Estado inicial amigável (opcional, pode remover se quiser mostrar tudo de cara)
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <RiFolderLine className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">
            Galeria Vazia ou Carregando
          </h3>
          <p className="text-slate-500">
            Selecione uma categoria ou adicione itens.
          </p>
        </div>
      ) : loadingItens ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : itens.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500">
            Nenhum item encontrado com os filtros atuais.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {itens.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="overflow-hidden group hover:shadow-lg transition-all">
                    <div className="relative h-48 bg-slate-100 flex items-center justify-center">
                      {item.tipo === "foto" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.titulo || "Imagem"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <RiVideoLine className="w-12 h-12 text-slate-300" />
                      )}

                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 backdrop-blur shadow-sm"
                            >
                              <RiMore2Fill />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/galeria/itens/${item.id}`}
                                className="cursor-pointer"
                              >
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() =>
                                setDeleteDialog({ open: true, id: item.id })
                              }
                            >
                              <RiDeleteBinLine className="mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4
                        className="font-bold text-slate-800 truncate text-sm"
                        title={item.titulo}
                      >
                        {item.titulo || "Sem título"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Ordem: {item.ordem}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Paginação Simples */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination({ page: Math.max(1, pagination.page - 1) })
                }
                disabled={pagination.page === 1}
              >
                <RiArrowLeftSLine className="mr-1" /> Anterior
              </Button>
              <span className="text-sm font-medium text-slate-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination({
                    page: Math.min(pagination.totalPages, pagination.page + 1),
                  })
                }
                disabled={pagination.page === pagination.totalPages}
              >
                Próxima <RiArrowRightSLine className="ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* DIALOG DE EXCLUSÃO */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, id: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Item</DialogTitle>
            <DialogDescription>
              Tem certeza? Esta ação não pode ser desfeita e removerá a mídia
              permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null })}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
