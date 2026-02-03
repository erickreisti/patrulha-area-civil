"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiGridLine,
  RiFolderLine,
  RiImageLine,
  RiVideoLine,
  RiSearchLine,
  RiFilterLine,
  RiDeleteBinLine,
  RiEditLine,
  RiRefreshLine,
  RiAlertLine,
} from "react-icons/ri";

// Store
import {
  useItensList,
  useCategoriasList,
  useGaleriaStats,
} from "@/lib/stores/useGaleriaStore";
import { deleteItem, deleteCategoria } from "@/app/actions/gallery";
import type { Item, Categoria } from "@/app/actions/gallery/types";

// ============================================
// TIPOS E COMPONENTES AUXILIARES
// ============================================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "purple" | "amber" | "indigo";
  loading: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  color,
  loading,
}: StatCardProps) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <Card className={`border ${colorClasses[color]} shadow-sm`}>
      <CardContent className="p-4 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <h3 className="text-2xl font-bold">{value}</h3>
          )}
          <p className="text-xs opacity-80 mt-1">{description}</p>
        </div>
        <div className="p-2 bg-white/60 rounded-lg">{icon}</div>
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
      <div className="w-16 h-16 rounded-md bg-purple-100 flex items-center justify-center border border-purple-200 text-purple-600">
        <RiVideoLine className="w-6 h-6" />
      </div>
    );
  }

  if (!src || error) {
    return (
      <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400">
        <RiImageLine className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
      <Image
        src={src}
        alt="Thumbnail"
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

// ============================================
// SUB-COMPONENTES LÓGICOS
// ============================================

function StatsSection() {
  const { stats, loading, fetchStats } = useGaleriaStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards: Array<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: "blue" | "green" | "purple" | "indigo";
    desc: string;
  }> = [
    {
      title: "Itens",
      value: stats?.total_itens || 0,
      icon: <RiGridLine />,
      color: "blue",
      desc: "Total geral",
    },
    {
      title: "Fotos",
      value: stats?.total_fotos || 0,
      icon: <RiImageLine />,
      color: "green",
      desc: "Imagens",
    },
    {
      title: "Vídeos",
      value: stats?.total_videos || 0,
      icon: <RiVideoLine />,
      color: "purple",
      desc: "Vídeos",
    },
    {
      title: "Categorias",
      value: stats?.total_categorias || 0,
      icon: <RiFolderLine />,
      color: "indigo",
      desc: "Total",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <StatCard
            title={c.title}
            value={c.value}
            icon={c.icon}
            description={c.desc}
            color={c.color}
            loading={loading}
          />
        </motion.div>
      ))}
    </div>
  );
}

function ItensTab({ onDelete }: { onDelete: (item: Item) => void }) {
  const {
    itens,
    loading,
    filtros,
    pagination,
    fetchItens,
    setFiltros,
    resetFiltros,
    setPagination,
  } = useItensList();

  // Carregar categorias apenas para popular o dropdown de filtro
  const { categorias: listaCategorias, fetchCategorias } = useCategoriasList();

  useEffect(() => {
    fetchItens();
    fetchCategorias();
  }, [fetchItens, fetchCategorias]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar item..."
                value={filtros.search}
                onChange={(e) => setFiltros({ search: e.target.value })}
                className="pl-9"
              />
            </div>
            <Select
              value={filtros.categoria_id}
              onValueChange={(v) => setFiltros({ categoria_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {listaCategorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filtros.tipo}
              onValueChange={(v) =>
                setFiltros({ tipo: v as "all" | "foto" | "video" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="foto">Fotos</SelectItem>
                <SelectItem value="video">Vídeos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFiltros}>
              <RiFilterLine className="mr-2" /> Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-700">
            Itens da Galeria ({pagination.total})
          </h3>
          <Link href="/admin/galeria/itens/criar">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <RiAddLine className="mr-1" /> Novo Item
            </Button>
          </Link>
        </div>

        {loading && itens.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : itens.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <RiGridLine className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum item encontrado.</p>
          </div>
        ) : (
          <div className="divide-y">
            <AnimatePresence>
              {itens.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 flex flex-col sm:flex-row gap-4 items-center hover:bg-gray-50 transition-colors"
                >
                  <ImageThumbnail
                    src={item.thumbnail_url || item.arquivo_url}
                    tipo={item.tipo}
                  />

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.titulo}
                      </h4>
                      {item.destaque && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          Destaque
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Badge variant="outline">
                        {item.tipo === "foto" ? "Foto" : "Vídeo"}
                      </Badge>
                      {item.galeria_categorias && (
                        <Badge variant="secondary" className="bg-gray-100">
                          {item.galeria_categorias.nome}
                        </Badge>
                      )}
                      <span>
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/galeria/itens/${item.id}`}>
                      <Button variant="ghost" size="icon" title="Editar">
                        <RiEditLine className="w-4 h-4 text-blue-600" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Excluir"
                      onClick={() => onDelete(item)}
                      className="hover:bg-red-50"
                    >
                      <RiDeleteBinLine className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ page: pagination.page - 1 })}
            >
              Anterior
            </Button>
            <span className="text-sm flex items-center px-2">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ page: pagination.page + 1 })}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoriasTab({ onDelete }: { onDelete: (cat: Categoria) => void }) {
  const {
    categorias,
    loading,
    filtros,
    pagination,
    fetchCategorias,
    setFiltros,
    resetFiltros,
    setPagination,
  } = useCategoriasList();

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar categoria..."
                value={filtros.search}
                onChange={(e) => setFiltros({ search: e.target.value })}
                className="pl-9"
              />
            </div>
            <Select
              value={filtros.tipo}
              onValueChange={(v) =>
                setFiltros({ tipo: v as "all" | "fotos" | "videos" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="fotos">Fotos</SelectItem>
                <SelectItem value="videos">Vídeos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFiltros}>
              <RiFilterLine className="mr-2" /> Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-700">
            Categorias ({pagination.total})
          </h3>
          <Link href="/admin/galeria/categorias/criar">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <RiAddLine className="mr-1" /> Nova Categoria
            </Button>
          </Link>
        </div>

        {loading && categorias.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : categorias.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <RiFolderLine className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhuma categoria encontrada.</p>
          </div>
        ) : (
          <div className="divide-y">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      cat.tipo === "fotos"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    <RiFolderLine className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{cat.nome}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {cat.tipo === "fotos" ? "Fotos" : "Vídeos"}
                      </Badge>
                      {cat.itens_count !== undefined && (
                        <span className="text-xs text-gray-500 flex items-center">
                          {cat.itens_count} itens
                        </span>
                      )}
                      {cat.arquivada && (
                        <Badge variant="secondary" className="text-xs">
                          Arquivada
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/galeria/categorias/${cat.id}`}>
                    <Button variant="ghost" size="icon" title="Editar">
                      <RiEditLine className="w-4 h-4 text-blue-600" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Excluir"
                    onClick={() => onDelete(cat)}
                    className="hover:bg-red-50"
                  >
                    <RiDeleteBinLine className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ page: pagination.page - 1 })}
            >
              Anterior
            </Button>
            <span className="text-sm flex items-center px-2">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ page: pagination.page + 1 })}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// PAGE PRINCIPAL
// ============================================

export default function GaleriaPage() {
  const [activeTab, setActiveTab] = useState("itens");

  // Hook para stats (atualizar após exclusão)
  const { fetchStats } = useGaleriaStats();

  // Hooks das listas para atualizar após exclusão
  const { fetchItens } = useItensList();
  const { fetchCategorias } = useCategoriasList();

  // Estado local para deleção (UI state)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: Item | Categoria | null;
    type: "item" | "categoria" | null;
    loading: boolean;
  }>({
    open: false,
    item: null,
    type: null,
    loading: false,
  });

  const confirmDelete = async () => {
    if (!deleteDialog.item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (deleteDialog.type === "item") {
        const res = await deleteItem(deleteDialog.item.id);
        if (res.success) {
          toast.success("Item excluído com sucesso");
          fetchItens(); // Atualiza via store
        } else {
          toast.error(res.error || "Erro ao excluir");
        }
      } else {
        const res = await deleteCategoria(deleteDialog.item.id);
        if (res.success) {
          toast.success("Categoria excluída com sucesso");
          fetchCategorias(); // Atualiza via store
        } else {
          toast.error(res.error || "Erro ao excluir");
        }
      }

      // Atualiza estatísticas
      fetchStats();

      setDeleteDialog({ open: false, item: null, type: null, loading: false });
    } catch {
      toast.error("Erro desconhecido");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const refreshAll = () => {
    fetchStats();
    fetchItens();
    fetchCategorias();
    toast.success("Dados atualizados");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Gerenciamento da Galeria
            </h1>
            <p className="text-gray-500 mt-1">
              Organize fotos e vídeos da Patrulha Aérea Civil
            </p>
          </div>
          <Button variant="outline" onClick={refreshAll} className="gap-2">
            <RiRefreshLine className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* Estatísticas */}
        <StatsSection />

        {/* Conteúdo Principal */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white p-1 border">
            <TabsTrigger value="itens" className="px-6">
              Itens da Galeria
            </TabsTrigger>
            <TabsTrigger value="categorias" className="px-6">
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itens">
            <ItensTab
              onDelete={(item) =>
                setDeleteDialog({
                  open: true,
                  item,
                  type: "item",
                  loading: false,
                })
              }
            />
          </TabsContent>

          <TabsContent value="categorias">
            <CategoriasTab
              onDelete={(cat) =>
                setDeleteDialog({
                  open: true,
                  item: cat,
                  type: "categoria",
                  loading: false,
                })
              }
            />
          </TabsContent>
        </Tabs>

        {/* Dialog de Exclusão Compartilhado */}
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
                Tem certeza que deseja excluir{" "}
                <strong>
                  {deleteDialog.type === "item"
                    ? (deleteDialog.item as Item)?.titulo
                    : (deleteDialog.item as Categoria)?.nome}
                </strong>
                ?
                <br />
                <br />
                {deleteDialog.type === "categoria" && (
                  <span className="text-amber-600 bg-amber-50 p-2 rounded block border border-amber-200 text-sm">
                    Atenção: A categoria só poderá ser excluída se não contiver
                    itens.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog((prev) => ({ ...prev, open: false }))
                }
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
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
