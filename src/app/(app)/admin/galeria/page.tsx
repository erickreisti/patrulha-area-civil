"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiAddFill,
  RiBarChartFill,
  RiHomeFill,
  RiUserFill,
  RiRefreshFill,
  RiAlertFill,
  RiGridFill,
  RiFolderFill,
  RiImageFill,
  RiVideoFill,
  RiEyeFill,
  RiArchiveFill,
} from "react-icons/ri";

// Componentes personalizados
import { StatCard, FiltrosItens, Paginacao } from "./components";
import { useGaleriaData, type Filtros } from "./hooks/useGaleriaData";
import { calcularEstatisticas } from "./utils/galeriaUtils";

// Types
import { GaleriaItem, GaleriaCategoria } from "@/types";

interface DeleteDialogState {
  open: boolean;
  item: GaleriaItem | GaleriaCategoria | null;
  type: "item" | "categoria" | null;
  loading: boolean;
}

export default function GaleriaPage() {
  const [activeTab, setActiveTab] = useState("itens");
  const [filtros, setFiltros] = useState<Filtros>({
    busca: "",
    categoria: "all",
    tipo: "all",
    status: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    item: null,
    type: null,
    loading: false,
  });

  const {
    itens,
    categorias,
    loading,
    totalItens,
    totalPages,
    fetchItens,
    fetchCategorias,
    ITEMS_PER_PAGE,
  } = useGaleriaData();

  const stats = useMemo(
    () => calcularEstatisticas(itens, categorias, totalItens),
    [itens, categorias, totalItens]
  );

  const refreshData = useMemo(
    () =>
      async (page = currentPage) => {
        setRefreshing(true);
        try {
          await Promise.all([fetchItens(page, filtros), fetchCategorias()]);
        } catch (error) {
          console.error("Erro ao atualizar dados:", error);
          toast.error("Erro ao atualizar dados");
        } finally {
          setRefreshing(false);
        }
      },
    [currentPage, fetchItens, fetchCategorias, filtros]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    fetchItens(1, filtros);
  }, [filtros, fetchItens]);

  const handleFiltroChange = (key: keyof Filtros, value: string) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const aplicarFiltros = () => {
    setCurrentPage(1);
    fetchItens(1, filtros);
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      categoria: "all",
      tipo: "all",
      status: "all",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchItens(page, filtros);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Array de estatísticas para o StatCard
  const statCardsData = [
    {
      title: "Total Itens",
      value: stats.totalItens,
      icon: <RiImageFill className="w-6 h-6" />,
      description: "Total na galeria",
      color: "blue" as const,
      delay: 0,
    },
    {
      title: "Fotos",
      value: stats.fotos,
      icon: <RiImageFill className="w-6 h-6" />,
      description: "Nesta página",
      color: "green" as const,
      delay: 1,
    },
    {
      title: "Vídeos",
      value: stats.videos,
      icon: <RiVideoFill className="w-6 h-6" />,
      description: "Nesta página",
      color: "purple" as const,
      delay: 2,
    },
    {
      title: "Ativos",
      value: stats.ativos,
      icon: <RiEyeFill className="w-6 h-6" />,
      description: "Visíveis no site",
      color: "amber" as const,
      delay: 3,
    },
    {
      title: "Cat. Ativas",
      value: stats.categoriasAtivas,
      icon: <RiFolderFill className="w-6 h-6" />,
      description: "Categorias visíveis",
      color: "green" as const,
      delay: 4,
    },
    {
      title: "Cat. Arquivadas",
      value: stats.categoriasArquivadas,
      icon: <RiArchiveFill className="w-6 h-6" />,
      description: "Categorias ocultas",
      color: "indigo" as const,
      delay: 5,
    },
    {
      title: "Total Categorias",
      value: stats.totalCategorias,
      icon: <RiFolderFill className="w-6 h-6" />,
      description: "Inclui arquivadas",
      color: "indigo" as const,
      delay: 6,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
              GERENCIAMENTO DA GALERIA
            </h1>
            <p className="text-gray-600">
              Gerencie fotos, vídeos e categorias da galeria da Patrulha Aérea
              Civil
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => refreshData(currentPage)}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50 transition-colors duration-300"
              >
                <motion.div
                  animate={{ rotate: refreshing ? 360 : 0 }}
                  transition={{
                    duration: 1,
                    repeat: refreshing ? Infinity : 0,
                  }}
                >
                  <RiRefreshFill
                    className={`w-4 h-4 ${
                      refreshing ? "text-blue-600" : "text-gray-600"
                    }`}
                  />
                </motion.div>
                <span className="hidden sm:inline">
                  {refreshing ? "Atualizando..." : "Atualizar"}
                </span>
              </Button>
            </motion.div>
            <div className="flex gap-3">
              {[
                {
                  href: "/admin/dashboard",
                  icon: RiBarChartFill,
                  label: "Dashboard",
                  variant: "outline" as const,
                  className:
                    "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
                },
                {
                  href: "/perfil",
                  icon: RiUserFill,
                  label: "Meu Perfil",
                  variant: "outline" as const,
                  className:
                    "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
                },
                {
                  href: "/",
                  icon: RiHomeFill,
                  label: "Voltar ao Site",
                  variant: "outline" as const,
                  className:
                    "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
                },
              ].map((item) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={item.href}>
                    <Button
                      variant={item.variant}
                      className={`transition-all duration-300 ${item.className}`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          {statCardsData.map((stat) => (
            <StatCard key={stat.title} {...stat} loading={loading} />
          ))}
        </div>

        {/* Tabs Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border border-gray-200">
              <TabsTrigger
                value="itens"
                className="flex items-center gap-2 data-[state=active]:bg-navy-600 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md transition-all duration-300"
              >
                <RiGridFill className="w-4 h-4" />
                Itens da Galeria ({stats.totalItens})
              </TabsTrigger>
              <TabsTrigger
                value="categorias"
                className="flex items-center gap-2 data-[state=active]:bg-navy-600 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md transition-all duration-300"
              >
                <RiFolderFill className="w-4 h-4" />
                Categorias ({stats.totalCategorias})
              </TabsTrigger>
            </TabsList>

            {/* Tab de Itens */}
            <TabsContent value="itens" className="space-y-6">
              <FiltrosItens
                filtros={filtros}
                onFiltroChange={handleFiltroChange}
                onAplicarFiltros={aplicarFiltros}
                onLimparFiltros={limparFiltros}
                categorias={categorias}
                itensCount={itens.length}
                totalItens={totalItens}
                currentPage={currentPage}
                totalPages={totalPages}
              />

              {/* Lista de Itens - Componente separado pode ser criado depois */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center text-gray-800">
                      <RiGridFill className="w-5 h-5 mr-2 text-navy-600" />
                      Lista de Itens ({itens.length} de {totalItens})
                    </CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/admin/galeria/itens/criar">
                        <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                          <RiAddFill className="w-4 h-4 mr-2" />
                          Novo Item
                        </Button>
                      </Link>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-4 p-4 border rounded-lg"
                          >
                            <Skeleton className="h-12 w-12 rounded-lg bg-gray-200" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-[250px] bg-gray-200" />
                              <Skeleton className="h-4 w-[200px] bg-gray-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : itens.length === 0 ? (
                      <div className="text-center py-12">
                        <RiImageFill className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Nenhum item encontrado
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {itens.map((item) => (
                          <div
                            key={item.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  {item.tipo === "foto" ? (
                                    <RiImageFill className="w-6 h-6 text-gray-500" />
                                  ) : (
                                    <RiVideoFill className="w-6 h-6 text-gray-500" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800">
                                    {item.titulo}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {item.descricao}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link href={`/admin/galeria/itens/${item.id}`}>
                                  <Button variant="outline" size="sm">
                                    Editar
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setDeleteDialog({
                                      open: true,
                                      item,
                                      type: "item",
                                      loading: false,
                                    });
                                  }}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Paginação */}
              {totalPages > 1 && (
                <Paginacao
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItens}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              )}
            </TabsContent>

            {/* Tab de Categorias */}
            <TabsContent value="categorias" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center text-gray-800">
                      <RiFolderFill className="w-5 h-5 mr-2 text-navy-600" />
                      Categorias da Galeria ({categorias.length})
                    </CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/admin/galeria/categorias/criar">
                        <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                          <RiAddFill className="w-4 h-4 mr-2" />
                          Nova Categoria
                        </Button>
                      </Link>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-4 p-4 border rounded-lg"
                          >
                            <Skeleton className="h-12 w-12 rounded-lg bg-gray-200" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-[250px] bg-gray-200" />
                              <Skeleton className="h-4 w-[200px] bg-gray-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : categorias.length === 0 ? (
                      <div className="text-center py-12">
                        <RiFolderFill className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Nenhuma categoria cadastrada
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categorias.map((categoria) => (
                          <div
                            key={categoria.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                                  <RiFolderFill className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800">
                                    {categoria.nome}
                                    {categoria.arquivada && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        (Arquivada)
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {categoria.descricao}
                                  </p>
                                  <div className="flex gap-2 mt-1">
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                      {categoria.tipo}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                      {categoria.itens_count} itens
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-1 rounded ${
                                        categoria.status
                                          ? "bg-green-100 text-green-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {categoria.status ? "Ativa" : "Inativa"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  href={`/admin/galeria/categorias/${categoria.id}`}
                                >
                                  <Button variant="outline" size="sm">
                                    Editar
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setDeleteDialog({
                                      open: true,
                                      item: categoria,
                                      type: "categoria",
                                      loading: false,
                                    });
                                  }}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <RiAlertFill className="w-5 h-5" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir{" "}
                {deleteDialog.type === "item" ? "o item" : "a categoria"}{" "}
                <strong>
                  &quot;
                  {deleteDialog.type === "item"
                    ? (deleteDialog.item as GaleriaItem)?.titulo
                    : (deleteDialog.item as GaleriaCategoria)?.nome}
                  &quot;
                </strong>
                ?
                <br />
                <span className="text-red-600 font-medium">
                  Esta ação não pode ser desfeita.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog({
                    open: false,
                    item: null,
                    type: null,
                    loading: false,
                  })
                }
                className="w-full sm:w-auto"
                disabled={deleteDialog.loading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  /* função de exclusão */
                }}
                disabled={deleteDialog.loading}
                className="w-full sm:w-auto"
              >
                {deleteDialog.loading ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
