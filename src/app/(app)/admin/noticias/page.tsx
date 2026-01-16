"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiNewspaperLine,
  RiAddLine,
  RiSearchLine,
  RiEditLine,
  RiEyeLine,
  RiEyeOffLine,
  RiStarFill,
  RiStarLine,
  RiCalendarLine,
  RiUserLine,
  RiBarChartLine,
  RiHomeLine,
  RiDeleteBinLine,
  RiArchiveLine,
  RiRocketLine,
  RiRefreshLine,
  RiImageLine,
  RiExternalLinkLine,
  RiAlertLine,
} from "react-icons/ri";

// Import do store
import { useNoticias, type NoticiaStatus } from "@/lib/stores/useNoticiasStore";

// Componente de estatísticas
const StatCard = ({
  title,
  value,
  icon,
  description,
  color = "blue",
  delay,
  loading = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color?: "blue" | "green" | "purple" | "amber" | "gray" | "red";
  delay: number;
  loading?: boolean;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
    gray: "from-gray-500 to-gray-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1 bg-gray-200" />
              ) : (
                <motion.p
                  key={value}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1"
                >
                  {value}
                </motion.p>
              )}
              <p className="text-xs text-gray-500">{description}</p>
            </div>
            <div
              className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de placeholder para imagem
const ImageWithFallback = ({
  src,
  alt,
  className = "w-16 h-16",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div
        className={`${className} rounded flex items-center justify-center bg-gray-200`}
      >
        <RiImageLine className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded overflow-hidden relative bg-gray-200`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="64px"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default function NoticiasPage() {
  const {
    // Dados
    stats,
    categoriasDisponiveis,

    // Estados
    loadingLista,
    loadingStats,
    saving,
    error,

    // Filtros
    filtros,
    totalCount,
    paginatedNoticias,
    totalPages,

    // Setters
    setSearchTerm,
    setCategoria,
    setSortBy,
    setSortOrder,
    setItemsPerPage,
    setCurrentPage,
    setStatus,
    setDestaque,
    clearFilters,

    // Ações
    fetchNoticias,
    fetchStats,
    fetchCategorias,
    toggleStatus,
    toggleDestaque,
    deletarNoticia,

    // Utilitários
    formatDate,
    getStatusColor,
    getStatusText,
  } = useNoticias();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    noticiaId: string | null;
    noticiaTitulo: string;
  }>({ open: false, noticiaId: null, noticiaTitulo: "" });
  const [isClient, setIsClient] = useState(false);

  // Inicializar no cliente (com setTimeout para evitar cascading renders)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (isClient) {
      fetchNoticias();
      fetchStats();
      fetchCategorias();
    }
  }, [isClient, fetchNoticias, fetchStats, fetchCategorias]);

  // Tratar erros
  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 5000,
        action: {
          label: "Tentar novamente",
          onClick: () => {
            fetchNoticias();
            fetchStats();
          },
        },
      });
    }
  }, [error, fetchNoticias, fetchStats]);

  // Handler para deletar notícia
  const handleDeleteNoticia = async () => {
    if (!deleteDialog.noticiaId) return;

    const result = await deletarNoticia(deleteDialog.noticiaId);

    if (result.success) {
      toast.success("Notícia excluída com sucesso");
      setDeleteDialog({ open: false, noticiaId: null, noticiaTitulo: "" });
    } else {
      toast.error(result.error || "Erro ao excluir notícia");
    }
  };

  // Handler para alternar status
  const handleToggleStatus = async (
    id: string,
    currentStatus: NoticiaStatus
  ) => {
    const result = await toggleStatus(id, currentStatus);

    if (result.success) {
      toast.success(
        `Notícia ${
          currentStatus === "rascunho"
            ? "publicada"
            : currentStatus === "publicado"
            ? "arquivada"
            : "publicada"
        }`
      );
    } else {
      toast.error(result.error || "Erro ao alterar status");
    }
  };

  // Handler para alternar destaque
  const handleToggleDestaque = async (id: string, currentDestaque: boolean) => {
    const result = await toggleDestaque(id, currentDestaque);

    if (result.success) {
      toast.success(
        currentDestaque ? "Destaque removido" : "Notícia destacada"
      );
    } else {
      toast.error(result.error || "Erro ao alterar destaque");
    }
  };

  // Loading durante SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Spinner className="w-8 h-8" />
          </div>
        </div>
      </div>
    );
  }

  // Botões de navegação
  const navigationButtons = [
    {
      href: "/admin/dashboard",
      icon: RiBarChartLine,
      label: "Dashboard",
      className:
        "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
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
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
            GERENCIAR NOTÍCIAS
          </h1>
          <p className="text-gray-600">
            Crie e gerencie as notícias do site da Patrulha Aérea Civil
          </p>
        </motion.div>

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {/* Botão de Atualizar */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                fetchNoticias();
                fetchStats();
              }}
              disabled={loadingLista || loadingStats}
              variant="outline"
              className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <RiRefreshLine
                className={`w-4 h-4 ${
                  loadingLista || loadingStats ? "animate-spin" : ""
                }`}
              />
              {loadingLista || loadingStats ? "Atualizando..." : "Atualizar"}
            </Button>
          </motion.div>

          {/* Botão Nova Notícia */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/admin/noticias/criar">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <RiAddLine className="w-4 h-4 mr-2" />
                Nova Notícia
              </Button>
            </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={<RiNewspaperLine className="w-6 h-6" />}
            description="Notícias no sistema"
            color="blue"
            delay={0}
            loading={loadingStats}
          />
          <StatCard
            title="Publicadas"
            value={stats.published}
            icon={<RiEyeLine className="w-6 h-6" />}
            description="Disponíveis no site"
            color="green"
            delay={1}
            loading={loadingStats}
          />
          <StatCard
            title="Rascunho"
            value={stats.rascunho}
            icon={<RiEyeOffLine className="w-6 h-6" />}
            description="Aguardando publicação"
            color="amber"
            delay={2}
            loading={loadingStats}
          />
          <StatCard
            title="Arquivadas"
            value={stats.arquivado}
            icon={<RiArchiveLine className="w-6 h-6" />}
            description="Notícias antigas"
            color="gray"
            delay={3}
            loading={loadingStats}
          />
          <StatCard
            title="Destaque"
            value={stats.featured}
            icon={<RiStarFill className="w-6 h-6" />}
            description="Em destaque"
            color="purple"
            delay={4}
            loading={loadingStats}
          />
          <StatCard
            title="Recentes"
            value={stats.recent}
            icon={<RiCalendarLine className="w-6 h-6" />}
            description="Últimos 7 dias"
            color="blue"
            delay={5}
            loading={loadingStats}
          />
        </div>

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg mb-8 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <RiSearchLine className="w-5 h-5 text-navy-600" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Buscar por título, resumo ou conteúdo..."
                      value={filtros.searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      disabled={loadingLista}
                    />
                  </div>
                </div>

                <div>
                  <Select
                    value={filtros.status}
                    onValueChange={(value: NoticiaStatus | "all") =>
                      setStatus(value)
                    }
                    disabled={loadingLista}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="publicado">Publicado</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filtros.categoria}
                    onValueChange={setCategoria}
                    disabled={loadingLista}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasDisponiveis.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Select
                    value={filtros.destaque}
                    onValueChange={(value: "all" | "destaque" | "normal") =>
                      setDestaque(value)
                    }
                    disabled={loadingLista}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Destaque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="destaque">Em destaque</SelectItem>
                      <SelectItem value="normal">Normais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filtros.sortBy}
                    onValueChange={(
                      value:
                        | "data_publicacao"
                        | "created_at"
                        | "views"
                        | "titulo"
                    ) => setSortBy(value)}
                    disabled={loadingLista}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_publicacao">
                        Data de publicação
                      </SelectItem>
                      <SelectItem value="created_at">
                        Data de criação
                      </SelectItem>
                      <SelectItem value="views">Visualizações</SelectItem>
                      <SelectItem value="titulo">Título</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filtros.sortOrder}
                    onValueChange={(value: "asc" | "desc") =>
                      setSortOrder(value)
                    }
                    disabled={loadingLista}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ordem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Decrescente</SelectItem>
                      <SelectItem value="asc">Crescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Mostrando <strong>{paginatedNoticias.length}</strong> de{" "}
                  <strong>{totalCount}</strong> notícias
                  {totalPages > 1 && (
                    <span>
                      {" "}
                      (Página <strong>{filtros.currentPage}</strong> de{" "}
                      <strong>{totalPages}</strong>)
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select
                    value={filtros.itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(parseInt(value))}
                    disabled={loadingLista}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 por página</SelectItem>
                      <SelectItem value="20">20 por página</SelectItem>
                      <SelectItem value="50">50 por página</SelectItem>
                      <SelectItem value="100">100 por página</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={loadingLista}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Notícias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <RiNewspaperLine className="w-5 h-5 mr-2 text-navy-600" />
                Lista de Notícias ({totalCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLista ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : paginatedNoticias.length === 0 ? (
                <div className="text-center py-12">
                  <RiNewspaperLine className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {totalCount === 0
                      ? "Nenhuma notícia cadastrada no sistema"
                      : "Nenhuma notícia encontrada com os filtros aplicados"}
                  </p>
                  {totalCount === 0 && (
                    <Link href="/admin/noticias/criar">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <RiAddLine className="w-4 h-4 mr-2" />
                        Criar Primeira Notícia
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <AnimatePresence>
                      {paginatedNoticias.map((noticia, index) => (
                        <motion.div
                          key={noticia.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="group"
                        >
                          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors hover:shadow-md">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <ImageWithFallback
                                  src={noticia.imagem}
                                  alt={noticia.titulo}
                                  className="w-16 h-16"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    {noticia.destaque && (
                                      <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                        }}
                                      >
                                        <RiStarFill className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                      </motion.div>
                                    )}
                                    <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                      {noticia.titulo}
                                    </h3>
                                    <Badge
                                      className={getStatusColor(noticia.status)}
                                    >
                                      {getStatusText(noticia.status)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                    {noticia.resumo}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <RiUserLine className="w-3 h-3" />
                                      <span>
                                        {noticia.autor?.full_name ||
                                          "Autor não definido"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <RiCalendarLine className="w-3 h-3" />
                                      <span>
                                        {formatDate(noticia.data_publicacao)}
                                      </span>
                                    </div>
                                    {noticia.categoria && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-700"
                                      >
                                        {noticia.categoria}
                                      </Badge>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <RiExternalLinkLine className="w-3 h-3" />
                                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                                        /{noticia.slug}
                                      </code>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <RiEyeLine className="w-3 h-3" />
                                      <span>{noticia.views} visualizações</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 ml-4">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Link href={`/admin/noticias/${noticia.id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                      disabled={saving}
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
                                    onClick={() =>
                                      handleToggleStatus(
                                        noticia.id,
                                        noticia.status
                                      )
                                    }
                                    className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                    disabled={saving}
                                  >
                                    {noticia.status === "rascunho" ? (
                                      <RiRocketLine className="w-3 h-3 mr-1" />
                                    ) : noticia.status === "publicado" ? (
                                      <RiArchiveLine className="w-3 h-3 mr-1" />
                                    ) : (
                                      <RiEyeLine className="w-3 h-3 mr-1" />
                                    )}
                                    {noticia.status === "rascunho"
                                      ? "Publicar"
                                      : noticia.status === "publicado"
                                      ? "Arquivar"
                                      : "Republicar"}
                                  </Button>
                                </motion.div>

                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleToggleDestaque(
                                        noticia.id,
                                        noticia.destaque
                                      )
                                    }
                                    className="w-full sm:w-auto border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                                    disabled={saving}
                                  >
                                    {noticia.destaque ? (
                                      <RiStarLine className="w-3 h-3 mr-1" />
                                    ) : (
                                      <RiStarFill className="w-3 h-3 mr-1" />
                                    )}
                                    {noticia.destaque ? "Remover" : "Destacar"}
                                  </Button>
                                </motion.div>

                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <AlertDialog
                                    open={
                                      deleteDialog.open &&
                                      deleteDialog.noticiaId === noticia.id
                                    }
                                    onOpenChange={(open) =>
                                      setDeleteDialog({
                                        open,
                                        noticiaId: open ? noticia.id : null,
                                        noticiaTitulo: noticia.titulo,
                                      })
                                    }
                                  >
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                        disabled={saving}
                                      >
                                        <RiDeleteBinLine className="w-3 h-3 mr-1" />
                                        Excluir
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                          <RiAlertLine className="w-5 h-5" />
                                          Confirmar exclusão
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir
                                          permanentemente a notícia{" "}
                                          <strong>
                                            &quot;{noticia.titulo}&quot;
                                          </strong>
                                          ?
                                          <br />
                                          <br />
                                          <span className="text-red-500 font-semibold">
                                            ⚠️ Esta ação não pode ser desfeita!
                                          </span>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel disabled={saving}>
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={handleDeleteNoticia}
                                          disabled={saving}
                                          className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                          {saving ? (
                                            <>
                                              <Spinner className="w-4 h-4 mr-2" />
                                              Excluindo...
                                            </>
                                          ) : (
                                            "Sim, excluir permanentemente"
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                      <div className="text-sm text-gray-600">
                        Página <strong>{filtros.currentPage}</strong> de{" "}
                        <strong>{totalPages}</strong>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentPage(Math.max(1, filtros.currentPage - 1))
                          }
                          disabled={filtros.currentPage === 1 || loadingLista}
                        >
                          Anterior
                        </Button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (filtros.currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (filtros.currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = filtros.currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  filtros.currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => setCurrentPage(pageNum)}
                                disabled={loadingLista}
                                className="min-w-[40px]"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}

                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, filtros.currentPage + 1)
                            )
                          }
                          disabled={
                            filtros.currentPage === totalPages || loadingLista
                          }
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
