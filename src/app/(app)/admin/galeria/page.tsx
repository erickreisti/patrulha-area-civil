"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiBarChartLine,
  RiHomeLine,
  RiUserLine,
  RiRefreshLine,
  RiAlertLine,
  RiGridLine,
  RiFolderLine,
  RiImageLine,
  RiVideoLine,
  RiEyeLine,
  RiArchiveLine,
  RiEditLine,
  RiDeleteBinLine,
} from "react-icons/ri";

// Types
import { GaleriaItem, GaleriaCategoria } from "@/types";

// Utils
import {
  calcularEstatisticas,
  getTipoBadge,
  getStatusBadge,
  getDestaqueBadge,
  getCategoriaTipoBadge,
} from "./utils/galeriaUtils";

// Hooks
import { useGaleriaData, type Filtros } from "./hooks/useGaleriaData";

// Components
import { StatCard } from "./components/StatCard";
import { FiltrosItens } from "./components/FiltrosItens";
import { Paginacao } from "./components/Paginacao";
import { ImageWithFallback } from "./components/ImageWithFallback";

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

  // ✅ AGORA usando o hook real para pegar dados do banco
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

  // Calcular estatísticas com dados reais
  const stats = useMemo(() => {
    return calcularEstatisticas(itens, categorias, totalItens);
  }, [itens, categorias, totalItens]);

  // Função para atualizar dados
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchItens(currentPage, filtros), fetchCategorias()]);
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast.error("Erro ao atualizar dados");
    } finally {
      setRefreshing(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchItens(1, filtros), fetchCategorias()]);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    loadInitialData();
  }, [fetchItens, fetchCategorias, filtros]); // Executar apenas no mount

  // Atualizar itens quando filtros ou página mudarem
  useEffect(() => {
    if (currentPage > 0) {
      fetchItens(currentPage, filtros);
    }
  }, [currentPage, filtros, fetchItens]);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para excluir item (mock - implementar lógica real depois)
  const handleDelete = async () => {
    if (!deleteDialog.item || !deleteDialog.type) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      // TODO: Implementar lógica real de exclusão
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        deleteDialog.type === "item"
          ? "Item excluído com sucesso!"
          : "Categoria excluída com sucesso!"
      );

      // Recarregar dados após exclusão
      await refreshData();

      setDeleteDialog({
        open: false,
        item: null,
        type: null,
        loading: false,
      });
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir. Tente novamente.");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const navigationButtons = [
    {
      href: "/admin/dashboard",
      icon: RiBarChartLine,
      label: "Dashboard",
      className:
        "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    },
    {
      href: "/perfil",
      icon: RiUserLine,
      label: "Meu Perfil",
      className:
        "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const statCardsData = [
    {
      title: "Total Itens",
      value: stats.totalItens,
      icon: <RiGridLine className="w-6 h-6" />,
      description: "Total na galeria",
      color: "blue" as const,
      delay: 0,
    },
    {
      title: "Fotos",
      value: stats.fotos,
      icon: <RiImageLine className="w-6 h-6" />,
      description: "Nesta página",
      color: "green" as const,
      delay: 1,
    },
    {
      title: "Vídeos",
      value: stats.videos,
      icon: <RiVideoLine className="w-6 h-6" />,
      description: "Nesta página",
      color: "purple" as const,
      delay: 2,
    },
    {
      title: "Ativos",
      value: stats.ativos,
      icon: <RiEyeLine className="w-6 h-6" />,
      description: "Visíveis no site",
      color: "amber" as const,
      delay: 3,
    },
    {
      title: "Cat. Ativas",
      value: stats.categoriasAtivas,
      icon: <RiFolderLine className="w-6 h-6" />,
      description: "Categorias visíveis",
      color: "green" as const,
      delay: 4,
    },
    {
      title: "Cat. Arquivadas",
      value: stats.categoriasArquivadas,
      icon: <RiArchiveLine className="w-6 h-6" />,
      description: "Categorias ocultas",
      color: "indigo" as const,
      delay: 5,
    },
    {
      title: "Total Categorias",
      value: stats.totalCategorias,
      icon: <RiFolderLine className="w-6 h-6" />,
      description: "Inclui arquivadas",
      color: "indigo" as const,
      delay: 6,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
            GERENCIAMENTO DA GALERIA
          </h1>
          <p className="text-gray-600">
            Gerencie fotos, vídeos e categorias da galeria da Patrulha Aérea
            Civil
          </p>
        </motion.div>

        {/* Botões de Navegação */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={refreshData}
              disabled={refreshing || loading}
              variant="outline"
              className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50 transition-colors duration-300"
            >
              <motion.div
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{
                  duration: 1,
                  repeat: refreshing ? Infinity : 0,
                }}
              >
                <RiRefreshLine
                  className={`w-4 h-4 ${
                    refreshing ? "text-blue-600" : "text-gray-600"
                  }`}
                />
              </motion.div>
              {refreshing ? "Atualizando..." : "Atualizar Lista"}
            </Button>
          </motion.div>

          {/* Botões de Navegação */}
          {navigationButtons.map((button, index) => (
            <motion.div
              key={button.href}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={button.href}>
                <Button
                  variant="outline"
                  className={`transition-all duration-300 ${button.className}`}
                >
                  <button.icon className="w-4 h-4 mr-2" />
                  {button.label}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
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
                <RiGridLine className="w-4 h-4" />
                Itens da Galeria ({stats.totalItens})
              </TabsTrigger>
              <TabsTrigger
                value="categorias"
                className="flex items-center gap-2 data-[state=active]:bg-navy-600 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md transition-all duration-300"
              >
                <RiFolderLine className="w-4 h-4" />
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

              {/* Lista de Itens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center text-gray-800">
                      <RiGridLine className="w-5 h-5 mr-2 text-navy-600" />
                      Lista de Itens ({itens.length} de {totalItens})
                    </CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/admin/galeria/itens/criar">
                        <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                          <RiAddLine className="w-4 h-4 mr-2" />
                          Novo Item
                        </Button>
                      </Link>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                          >
                            <div className="flex items-center space-x-4 p-4 border rounded-lg">
                              <Skeleton className="h-12 w-12 rounded-lg bg-gray-200" />
                              <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[250px] bg-gray-200" />
                                <Skeleton className="h-4 w-[200px] bg-gray-200" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : itens.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-12"
                      >
                        <RiGridLine className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          Nenhum item encontrado
                        </h3>
                        <p className="text-gray-500 mb-6">
                          {filtros.busca ||
                          filtros.categoria !== "all" ||
                          filtros.tipo !== "all" ||
                          filtros.status !== "all"
                            ? "Tente ajustar os filtros de busca"
                            : "Cadastre o primeiro item da galeria"}
                        </p>
                        {!filtros.busca &&
                          filtros.categoria === "all" &&
                          filtros.tipo === "all" &&
                          filtros.status === "all" && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Link href="/admin/galeria/itens/criar">
                                <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                                  <RiAddLine className="w-4 h-4 mr-2" />
                                  Cadastrar Primeiro Item
                                </Button>
                              </Link>
                            </motion.div>
                          )}
                      </motion.div>
                    ) : (
                      <>
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-4 mb-6"
                        >
                          <AnimatePresence>
                            {itens.map((item) => (
                              <motion.div
                                key={item.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                whileHover={{
                                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                                }}
                                className="border border-gray-200 rounded-lg transition-colors duration-300"
                              >
                                <Card className="border-0 shadow-none">
                                  <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                      <div className="flex items-start space-x-4 flex-1">
                                        <ImageWithFallback
                                          src={
                                            item.thumbnail_url ||
                                            item.arquivo_url
                                          }
                                          alt={item.titulo}
                                          tipo={item.tipo}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                              {item.titulo}
                                            </h3>
                                            {getStatusBadge(item.status)}
                                            {getTipoBadge(item.tipo)}
                                            {getDestaqueBadge(item.destaque)}
                                          </div>
                                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {item.descricao || "Sem descrição"}
                                          </p>
                                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            <span>Ordem: {item.ordem}</span>
                                            <span>•</span>
                                            {item.categoria_id && (
                                              <>
                                                <span>
                                                  Categoria:{" "}
                                                  {categorias.find(
                                                    (c) =>
                                                      c.id === item.categoria_id
                                                  )?.nome || "Não encontrada"}
                                                </span>
                                                <span>•</span>
                                              </>
                                            )}
                                            <span>
                                              Criado:{" "}
                                              {new Date(
                                                item.created_at
                                              ).toLocaleDateString("pt-BR")}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 sm:ml-4">
                                        <motion.div
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <Link
                                            href={`/admin/galeria/itens/${item.id}`}
                                          >
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-300"
                                            >
                                              <RiEditLine className="w-3 h-3 mr-1" />
                                              Editar
                                            </Button>
                                          </Link>
                                        </motion.div>

                                        <motion.div
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-300"
                                            onClick={() => {
                                              setDeleteDialog({
                                                open: true,
                                                item,
                                                type: "item",
                                                loading: false,
                                              });
                                            }}
                                          >
                                            <RiDeleteBinLine className="w-3 h-3 mr-1" />
                                            Excluir
                                          </Button>
                                        </motion.div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </AnimatePresence>
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
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab de Categorias */}
            <TabsContent value="categorias" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center text-gray-800">
                      <RiFolderLine className="w-5 h-5 mr-2 text-navy-600" />
                      Categorias da Galeria ({categorias.length})
                    </CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/admin/galeria/categorias/criar">
                        <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                          <RiAddLine className="w-4 h-4 mr-2" />
                          Nova Categoria
                        </Button>
                      </Link>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                          >
                            <div className="flex items-center space-x-4 p-4 border rounded-lg">
                              <Skeleton className="h-12 w-12 rounded-lg bg-gray-200" />
                              <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[250px] bg-gray-200" />
                                <Skeleton className="h-4 w-[200px] bg-gray-200" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : categorias.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-12"
                      >
                        <RiFolderLine className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          Nenhuma categoria cadastrada
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Crie categorias para organizar seus itens da galeria
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link href="/admin/galeria/categorias/criar">
                            <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                              <RiAddLine className="w-4 h-4 mr-2" />
                              Criar Primeira Categoria
                            </Button>
                          </Link>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                      >
                        <AnimatePresence>
                          {categorias.map((categoria) => (
                            <motion.div
                              key={categoria.id}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              whileHover={{
                                backgroundColor: "rgba(0, 0, 0, 0.02)",
                              }}
                              className="border border-gray-200 rounded-lg transition-colors duration-300"
                            >
                              <Card className="border-0 shadow-none">
                                <CardContent className="p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start space-x-4 flex-1">
                                      <div
                                        className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                          categoria.tipo === "fotos"
                                            ? "bg-blue-100"
                                            : "bg-purple-100"
                                        }`}
                                      >
                                        <RiFolderLine
                                          className={`w-8 h-8 ${
                                            categoria.tipo === "fotos"
                                              ? "text-blue-600"
                                              : "text-purple-600"
                                          }`}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                          <h3 className="font-semibold text-gray-800">
                                            {categoria.nome}
                                          </h3>
                                          {getStatusBadge(
                                            categoria.status,
                                            categoria.arquivada
                                          )}
                                          {getCategoriaTipoBadge(
                                            categoria.tipo
                                          )}
                                          {(categoria.itens_count || 0) > 0 && (
                                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                              {categoria.itens_count || 0} itens
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                          {categoria.descricao ||
                                            "Sem descrição"}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                          <span>Ordem: {categoria.ordem}</span>
                                          <span>•</span>
                                          <span>Slug: {categoria.slug}</span>
                                          <span>•</span>
                                          <span>
                                            Criado:{" "}
                                            {new Date(
                                              categoria.created_at
                                            ).toLocaleDateString("pt-BR")}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 sm:ml-4">
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Link
                                          href={`/admin/galeria/categorias/${categoria.id}`}
                                        >
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-300"
                                          >
                                            <RiEditLine className="w-3 h-3 mr-1" />
                                            Editar
                                          </Button>
                                        </Link>
                                      </motion.div>

                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-300"
                                          onClick={() => {
                                            setDeleteDialog({
                                              open: true,
                                              item: categoria,
                                              type: "categoria",
                                              loading: false,
                                            });
                                          }}
                                        >
                                          <RiDeleteBinLine className="w-3 h-3 mr-1" />
                                          Excluir
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
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
                <RiAlertLine className="w-5 h-5" />
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
                onClick={handleDelete}
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
