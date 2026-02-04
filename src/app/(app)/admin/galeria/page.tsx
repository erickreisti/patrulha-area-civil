"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RiStarFill,
} from "react-icons/ri";

// Store & Types
import {
  useGaleriaStats,
  useItensAdmin,
  useCategoriasAdmin,
} from "@/lib/stores/useGaleriaStore";
import type {
  Item,
  Categoria,
  TipoItemFilter,
  TipoCategoriaFilter,
  StatusFilter,
} from "@/app/actions/gallery/types";

// ============================================
// COMPONENTES DE UI
// ============================================

const StatCard = ({
  title,
  value,
  icon,
  loading,
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
  className?: string;
}) => (
  <Card
    className={`border-none shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
  >
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
          {title}
        </p>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <h3 className="text-3xl font-black text-slate-800">{value}</h3>
        )}
      </div>
      <div className="p-3 bg-white/40 rounded-xl backdrop-blur-sm text-slate-800 shadow-sm border border-white/20">
        {icon}
      </div>
    </CardContent>
  </Card>
);

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
      <div className="w-20 h-20 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-500 shadow-sm flex-shrink-0">
        <RiVideoLine className="w-8 h-8" />
      </div>
    );
  }

  if (!src || error) {
    return (
      <div className="w-20 h-20 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm flex-shrink-0">
        <RiImageLine className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 group bg-slate-100">
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

const EmptyState = ({
  message,
  icon: Icon,
}: {
  message: string;
  icon: React.ElementType;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
    <div className="bg-white p-4 rounded-full mb-3 shadow-sm border border-slate-100">
      <Icon className="w-8 h-8 opacity-50" />
    </div>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

// ============================================
// SEÇÕES
// ============================================

function StatsSection() {
  const { stats, loading, fetchStats } = useGaleriaStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Itens"
        value={stats?.total_itens || 0}
        icon={<RiGridLine size={24} />}
        loading={loading}
        className="bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-900"
      />
      <StatCard
        title="Fotos"
        value={stats?.total_fotos || 0}
        icon={<RiImageLine size={24} />}
        loading={loading}
        className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-900"
      />
      <StatCard
        title="Vídeos"
        value={stats?.total_videos || 0}
        icon={<RiVideoLine size={24} />}
        loading={loading}
        className="bg-gradient-to-br from-purple-50 to-purple-100/50 text-purple-900"
      />
      <StatCard
        title="Categorias"
        value={stats?.total_categorias || 0}
        icon={<RiFolderLine size={24} />}
        loading={loading}
        className="bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-900"
      />
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
    fetchCategorias,
    categorias: listaCategorias,
    setFiltros,
    setPagination,
  } = useItensAdmin();

  useEffect(() => {
    fetchItens();
    fetchCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Busca */}
            <div className="relative md:col-span-4 lg:col-span-5">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por título..."
                value={filtros.search}
                onChange={(e) => setFiltros({ search: e.target.value })}
                className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all h-10"
              />
            </div>

            {/* Selects */}
            <div className="md:col-span-8 lg:col-span-7 flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <Select
                value={filtros.categoria_id}
                onValueChange={(v) => setFiltros({ categoria_id: v })}
              >
                <SelectTrigger className="w-[160px] border-slate-200 bg-slate-50/50 h-10">
                  <div className="flex items-center gap-2 truncate text-slate-600">
                    <RiFolderLine className="text-slate-400" />
                    <SelectValue placeholder="Categoria" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {listaCategorias.map((c: Categoria) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filtros.tipo}
                onValueChange={(v) => setFiltros({ tipo: v as TipoItemFilter })}
              >
                <SelectTrigger className="w-[130px] border-slate-200 bg-slate-50/50 h-10">
                  <div className="flex items-center gap-2 text-slate-600">
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
                onValueChange={(v) => setFiltros({ status: v as StatusFilter })}
              >
                <SelectTrigger className="w-[130px] border-slate-200 bg-slate-50/50 h-10">
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
                onClick={() =>
                  setFiltros({
                    search: "",
                    categoria_id: "all",
                    tipo: "all",
                    status: "all",
                  })
                }
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

        {loading && itens.length === 0 ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded-xl" />
                <div className="flex-1 space-y-2 py-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : itens.length === 0 ? (
          <EmptyState
            message="Nenhum item encontrado com os filtros atuais."
            icon={RiImageLine}
          />
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
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
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
                      onClick={() => onDelete(item)}
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
    setPagination,
  } = useCategoriasAdmin();

  useEffect(() => {
    fetchCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="border-none shadow-md bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar categoria..."
                value={filtros.search}
                onChange={(e) => setFiltros({ search: e.target.value })}
                className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white h-10"
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
              onClick={() => setFiltros({ search: "", tipo: "all" })}
              className="border-slate-200 text-slate-500 hover:bg-slate-50 h-10"
            >
              <RiFilterLine className="mr-2" /> Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="border-none shadow-md overflow-hidden bg-white">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-lg">Categorias</span>
            <Badge
              variant="secondary"
              className="bg-white border-slate-200 text-slate-600 shadow-sm"
            >
              {pagination.total}
            </Badge>
          </div>
          <Link href="/admin/galeria/categorias/criar">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-100 transition-all hover:translate-y-[-1px]"
            >
              <RiAddLine className="mr-1.5" /> Nova Categoria
            </Button>
          </Link>
        </div>

        {loading && categorias.length === 0 ? (
          <div className="p-8 space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : categorias.length === 0 ? (
          <EmptyState
            message="Nenhuma categoria encontrada."
            icon={RiFolderLine}
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {categorias.map((cat: Categoria) => (
              <div
                key={cat.id}
                className="group p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl shadow-sm ${
                      cat.tipo === "fotos"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    <RiFolderLine className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">
                      {cat.nome}
                    </h4>
                    <div className="flex gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold border-0 ${cat.tipo === "fotos" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
                      >
                        {cat.tipo === "fotos" ? "Fotos" : "Vídeos"}
                      </Badge>
                      {cat.itens_count !== undefined && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                          {cat.itens_count} itens
                        </span>
                      )}
                      {cat.arquivada && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-slate-100 text-slate-500 border-slate-200"
                        >
                          Arquivada
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/galeria/categorias/${cat.id}`}>
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
                    onClick={() => onDelete(cat)}
                    className="h-9 w-9 p-0 border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação Categorias */}
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
    </div>
  );
}

// ============================================
// PAGE PRINCIPAL
// ============================================

export default function GaleriaPage() {
  const [activeTab, setActiveTab] = useState("itens");
  const { fetchStats } = useGaleriaStats();
  const { fetchItens, deleteItem } = useItensAdmin();
  const { fetchCategorias, deleteCategoria } = useCategoriasAdmin();

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
          fetchItens();
        } else {
          toast.error(res.error || "Erro ao excluir");
        }
      } else {
        const res = await deleteCategoria(deleteDialog.item.id);
        if (res.success) {
          toast.success("Categoria excluída com sucesso");
          fetchCategorias();
        } else {
          toast.error(res.error || "Erro ao excluir");
        }
      }
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
    toast.success("Dados atualizados com sucesso");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-bebas">
              GERENCIAMENTO DA GALERIA
            </h1>
            <p className="text-slate-500 mt-1">
              Organize fotos e vídeos do portal da PAC.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refreshAll}
            className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 shadow-sm"
          >
            <RiRefreshLine className="w-4 h-4" />
            Atualizar Dados
          </Button>
        </motion.div>

        {/* Estatísticas */}
        <StatsSection />

        {/* Conteúdo Principal */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-slate-100/50 p-1 border border-slate-200 rounded-xl w-full md:w-auto inline-flex h-auto">
            <TabsTrigger
              value="itens"
              className="px-6 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-slate-500 transition-all flex-1 md:flex-none"
            >
              <RiGridLine className="mr-2 w-4 h-4" /> Itens da Galeria
            </TabsTrigger>
            <TabsTrigger
              value="categorias"
              className="px-6 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-slate-500 transition-all flex-1 md:flex-none"
            >
              <RiFolderLine className="mr-2 w-4 h-4" /> Categorias
            </TabsTrigger>
          </TabsList>

          {/* ✅ CORREÇÃO: Removido AnimatePresence que envolvia TabsContent */}
          <div className="mt-6">
            <TabsContent value="itens" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            </TabsContent>

            <TabsContent value="categorias" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>

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
                Você está prestes a excluir:
                <div className="bg-red-50 border border-red-100 p-3 rounded-lg my-3 font-medium text-red-800">
                  {deleteDialog.type === "item"
                    ? (deleteDialog.item as Item)?.titulo
                    : (deleteDialog.item as Categoria)?.nome}
                </div>
                Esta ação é irreversível.
                {deleteDialog.type === "categoria" && (
                  <p className="mt-3 text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200 text-sm font-medium flex gap-2 items-center">
                    <RiAlertLine /> A categoria só pode ser excluída se estiver
                    vazia.
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog((prev) => ({ ...prev, open: false }))
                }
                className="rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
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
