"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/ri";

// Store e Actions
import {
  useCategoriasList,
  useGaleriaStats,
} from "@/lib/stores/useGaleriaStore";
import { deleteCategoria } from "@/app/actions/gallery";
import type { Categoria } from "@/app/actions/gallery/types";

// Componentes Locais (importados do index que criamos)
import { StatCard, FiltrosCategorias, Paginacao } from "../components"; // Ajuste o caminho se necessário (ex: ../../components)

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    toggleCategoriaStatus,
  } = useCategoriasList();

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
  }, [fetchCategorias, fetchStats]);

  // Handler de Refresh Manual
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCategorias(), fetchStats()]);
    setRefreshing(false);
    toast.success("Dados atualizados");
  };

  // Handler de Deleção
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.categoria) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const res = await deleteCategoria(deleteDialog.categoria.id);
      if (res.success) {
        toast.success("Categoria excluída com sucesso");
        fetchCategorias(); // Atualiza lista via store
        fetchStats(); // Atualiza stats via store
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

  // Handler de Status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleCategoriaStatus(id, currentStatus);
    if (res.success) {
      toast.success(`Categoria ${!currentStatus ? "ativada" : "desativada"}`);
    } else {
      toast.error("Erro ao alterar status");
    }
  };

  // Configuração dos Cards de Estatística
  const statCards = [
    {
      title: "Total",
      value: stats?.total_categorias || 0,
      icon: <RiFolderLine />,
      color: "blue" as const,
      desc: "Total de categorias",
    },
    {
      title: "Ativas",
      value: stats?.categorias_ativas || 0,
      icon: <RiEyeLine />,
      color: "green" as const,
      desc: "Visíveis no site",
    },
    {
      title: "Fotos",
      value: stats?.categorias_por_tipo.fotos || 0,
      icon: <RiImageLine />,
      color: "indigo" as const,
      desc: "Categorias de fotos",
    },
    {
      title: "Vídeos",
      value: stats?.categorias_por_tipo.videos || 0,
      icon: <RiVideoLine />,
      color: "purple" as const,
      desc: "Categorias de vídeos",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Gerenciar Categorias
            </h1>
            <p className="text-gray-500 mt-1">
              Organize seus álbuns de fotos e vídeos
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/galeria")}
            >
              <RiArrowLeftLine className="mr-2" /> Voltar
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RiRefreshLine
                className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
            <Link href="/admin/galeria/categorias/criar">
              <Button className="bg-green-600 hover:bg-green-700">
                <RiAddLine className="mr-2" /> Nova Categoria
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.desc}
              color={stat.color}
              delay={i}
              loading={loadingStats}
            />
          ))}
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <FiltrosCategorias
            filtros={{
              busca: filtros.search,
              tipo: filtros.tipo,
              status: filtros.status,
              arquivada: filtros.arquivada,
            }}
            onFiltroChange={(key, value) =>
              setFiltros({ [key === "busca" ? "search" : key]: value })
            }
            onAplicarFiltros={fetchCategorias}
            onLimparFiltros={resetFiltros}
            categoriasCount={categorias.length}
            totalCategorias={pagination.total}
          />
        </div>

        {/* Lista de Categorias */}
        {loadingList && !refreshing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-40">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
            <RiFolderLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-gray-500 mb-6">
              Tente ajustar os filtros ou crie uma nova categoria.
            </p>
            <Link href="/admin/galeria/categorias/criar">
              <Button>Criar Categoria</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {categorias.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-transparent hover:border-l-navy-600 group">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Header do Card */}
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`p-3 rounded-lg ${cat.tipo === "fotos" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}
                        >
                          {cat.tipo === "fotos" ? (
                            <RiImageLine className="w-6 h-6" />
                          ) : (
                            <RiVideoLine className="w-6 h-6" />
                          )}
                        </div>
                        <Badge
                          variant={cat.status ? "default" : "secondary"}
                          className={
                            cat.status
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {cat.status ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>

                      {/* Info Principal */}
                      <div className="mb-4 flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-navy-600 transition-colors">
                          {cat.nome}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em]">
                          {cat.descricao || "Sem descrição definida."}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 pb-4 border-b border-gray-100">
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                          <RiFolderLine /> {cat.itens_count || 0} itens
                        </span>
                        <span className="bg-gray-50 px-2 py-1 rounded">
                          Ordem: {cat.ordem}
                        </span>
                        {cat.arquivada && (
                          <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100">
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
                            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <RiEditLine className="mr-1" /> Editar
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-green-600"
                          title={cat.status ? "Desativar" : "Ativar"}
                          onClick={() => handleToggleStatus(cat.id, cat.status)}
                        >
                          {cat.status ? <RiEyeOffLine /> : <RiEyeLine />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
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
          <Paginacao
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => setPagination({ page })}
          />
        )}

        {/* Dialog de Exclusão */}
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            !open && setDeleteDialog((prev) => ({ ...prev, open: false }))
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <RiAlertLine /> Confirmar Exclusão
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a categoria{" "}
                <strong>{deleteDialog.categoria?.nome}</strong>?
                <br />
                <br />
                Essa ação é irreversível.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog((prev) => ({ ...prev, open: false }))
                }
                disabled={deleteDialog.loading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteDialog.loading}
              >
                {deleteDialog.loading
                  ? "Excluindo..."
                  : "Excluir Definitivamente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
