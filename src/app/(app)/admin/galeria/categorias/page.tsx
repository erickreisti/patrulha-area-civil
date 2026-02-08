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
} from "react-icons/ri";

// Store & Types
import {
  useCategoriasAdmin,
  useGaleriaStats,
  Categoria, // Importar interface da Store para compatibilidade
  TipoCategoriaFilter,
} from "@/lib/stores/useGaleriaStore";
import { deleteCategoria } from "@/app/actions/gallery";

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

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function CategoriasGaleriaPage() {
  const router = useRouter();

  // Store Hooks (Agora completos com as propriedades que faltavam)
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

  // Estado Local
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoria: Categoria | null;
    loading: boolean;
  }>({
    open: false,
    categoria: null,
    loading: false,
  });

  // Carregar dados iniciais
  useEffect(() => {
    fetchCategorias();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependências vazias para rodar apenas na montagem ou use [fetchCategorias, fetchStats] se usar useCallback na store

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCategorias(), fetchStats()]);
    setRefreshing(false);
    toast.success("Dados atualizados com sucesso");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.categoria) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const res = await deleteCategoria(deleteDialog.categoria.id);
      if (res.success) {
        toast.success("Categoria excluída com sucesso");
        fetchCategorias();
        fetchStats();
        setDeleteDialog({ open: false, categoria: null, loading: false });
      } else {
        toast.error(res.error || "Erro ao excluir categoria");
        setDeleteDialog((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      toast.error("Erro desconhecido ao excluir");
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

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-bebas">
              GERENCIAR CATEGORIAS
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Organize seus álbuns de fotos e vídeos da galeria.
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
            <Link href="/admin/galeria/categorias/criar">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-100 transition-all hover:translate-y-[-1px]">
                <RiAddLine className="mr-2" /> Nova Categoria
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas (Corrigido acesso às props camelCase) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total"
            value={stats?.totalCategorias || 0}
            icon={<RiFolderLine className="w-5 h-5" />}
            color="blue"
            description="Categorias cadastradas"
            loading={loadingStats}
          />
          <StatCard
            title="Ativas"
            value={stats?.categoriasAtivas || 0}
            icon={<RiEyeLine className="w-5 h-5" />}
            color="green"
            description="Visíveis no site"
            loading={loadingStats}
          />
          <StatCard
            title="Fotos"
            value={stats?.categoriasPorTipo.fotos || 0}
            icon={<RiImageLine className="w-5 h-5" />}
            color="indigo"
            description="Álbuns de fotos"
            loading={loadingStats}
          />
          <StatCard
            title="Vídeos"
            value={stats?.categoriasPorTipo.videos || 0}
            icon={<RiVideoLine className="w-5 h-5" />}
            color="purple"
            description="Álbuns de vídeos"
            loading={loadingStats}
          />
        </div>

        {/* Filtros */}
        <Card className="border-none shadow-md bg-white mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar categoria..."
                  value={filtros.search}
                  onChange={(e) => setFiltros({ search: e.target.value })}
                  className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white h-10 transition-colors"
                />
              </div>
              <Select
                value={filtros.tipo}
                onValueChange={(v) =>
                  setFiltros({ tipo: v as TipoCategoriaFilter })
                }
              >
                <SelectTrigger className="border-slate-200 bg-slate-50/50 h-10 text-slate-600">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  <SelectItem value="fotos">Fotos</SelectItem>
                  <SelectItem value="videos">Vídeos</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={resetFiltros}
                className="border-slate-200 text-slate-500 hover:bg-slate-50 h-10"
              >
                <RiFilterLine className="mr-2" /> Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Categorias */}
        {loadingList && !refreshing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-40 border-none shadow-sm bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/2 rounded-md" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="bg-slate-50 p-4 rounded-full mb-3 inline-block">
              <RiFolderLine className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-slate-500 mb-6">
              Tente ajustar os filtros ou crie uma nova categoria.
            </p>
            <Link href="/admin/galeria/categorias/criar">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Criar Categoria
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {categorias.map((cat: Categoria, index: number) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-emerald-500 group border-slate-100 bg-white">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Header do Card */}
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`p-3 rounded-xl shadow-sm transition-colors ${
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
                          variant={cat.status ? "default" : "secondary"}
                          className={`border-0 shadow-none ${
                            cat.status
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {cat.status ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>

                      {/* Info Principal */}
                      <div className="mb-4 flex-1">
                        <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {cat.nome}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5em] leading-relaxed">
                          {cat.descricao || "Sem descrição definida."}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-5 pb-4 border-b border-slate-100 font-medium">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-slate-600 border border-slate-100">
                          <RiFolderLine /> {cat.itens_count || 0} itens
                        </span>
                        <span className="bg-slate-50 px-2 py-1 rounded text-slate-600 border border-slate-100">
                          Ordem: {cat.ordem}
                        </span>
                        {cat.arquivada && (
                          <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100 ml-auto">
                            Arquivada
                          </span>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 mt-auto">
                        <Link
                          href={`/admin/galeria/categorias/${cat.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200 font-semibold"
                          >
                            <RiEditLine className="mr-1.5 w-4 h-4" /> Editar
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-100"
                          title={cat.status ? "Desativar" : "Ativar"}
                          onClick={() => handleToggleStatus(cat.id, cat.status)}
                        >
                          {cat.status ? <RiEyeOffLine /> : <RiEyeLine />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
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
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ page: pagination.page - 1 })}
              className="bg-white border-slate-200 shadow-sm"
            >
              Anterior
            </Button>
            <span className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-md border border-slate-200 shadow-sm">
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
