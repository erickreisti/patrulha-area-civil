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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  RiNewspaperLine,
  RiAddLine,
  RiSearchLine,
  RiEditLine,
  RiEyeLine,
  RiEyeOffLine,
  RiStarFill,
  RiCalendarLine,
  RiUserLine,
  RiBarChartLine,
  RiDeleteBinLine,
  RiArchiveLine,
  RiRefreshLine,
  RiImageLine,
  RiAlertLine,
  RiVideoLine,
  RiCheckLine,
} from "react-icons/ri";

import { useNoticias, type StatusFilter } from "@/lib/stores/useNoticiasStore";

type NoticiaStatus = "rascunho" | "publicado" | "arquivado";

// Helper para formatar data
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
};

// Helper para cor do status
const getStatusColor = (status: NoticiaStatus): string => {
  switch (status) {
    case "rascunho":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "publicado":
      return "bg-green-100 text-green-800 border-green-200";
    case "arquivado":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper para texto do status
const getStatusText = (status: NoticiaStatus): string => {
  switch (status) {
    case "rascunho":
      return "Rascunho";
    case "publicado":
      return "Publicado";
    case "arquivado":
      return "Arquivado";
    default:
      return "Desconhecido";
  }
};

// Componente StatCard
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

// Componente ImageWithFallback
const ImageWithFallback = ({
  src,
  alt,
  className = "w-16 h-16",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div
        className={`${className} rounded flex items-center justify-center bg-gray-100 border border-gray-200`}
      >
        <RiImageLine className="w-6 h-6 text-gray-300" />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded overflow-hidden relative border border-gray-100 bg-gray-50`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100px, 200px"
        onError={() => setImageError(true)}
        unoptimized={src.startsWith("blob:")}
      />
    </div>
  );
};

export default function NoticiasPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    noticiaId: string | null;
    noticiaTitulo: string;
  }>({ open: false, noticiaId: null, noticiaTitulo: "" });

  const {
    noticias,
    stats,
    categories,
    loading,
    loadingStats,
    pagination,
    filters,
    setFilters,
    fetchNoticias,
    fetchStats,
    fetchCategories,
    excluirNoticia,
    alternarStatus,
    alternarDestaque,
  } = useNoticias();

  useEffect(() => {
    fetchNoticias();
    fetchStats();
    fetchCategories();
  }, [fetchNoticias, fetchStats, fetchCategories]);

  const handleDeleteNoticia = async () => {
    if (!deleteDialog.noticiaId) return;
    const result = await excluirNoticia(deleteDialog.noticiaId);
    if (result.success) {
      toast.success("Notícia excluída com sucesso");
      setDeleteDialog({ open: false, noticiaId: null, noticiaTitulo: "" });
    } else {
      toast.error(result.error || "Erro ao excluir notícia");
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: NoticiaStatus,
  ) => {
    const result = await alternarStatus(id, currentStatus);
    if (result.success) {
      toast.success("Status atualizado com sucesso");
    } else {
      toast.error(result.error || "Erro ao alterar status");
    }
  };

  const handleToggleDestaque = async (id: string, currentDestaque: boolean) => {
    const result = await alternarDestaque(id, currentDestaque);
    if (result.success) {
      toast.success(
        currentDestaque ? "Destaque removido" : "Notícia destacada",
      );
    } else {
      toast.error(result.error || "Erro ao alterar destaque");
    }
  };

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
          <Button
            onClick={() => {
              fetchNoticias();
              fetchStats();
            }}
            disabled={loading || loadingStats}
            variant="outline"
            className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <RiRefreshLine
              className={`w-4 h-4 ${
                loading || loadingStats ? "animate-spin" : ""
              }`}
            />
            Atualizar
          </Button>

          <Link href="/admin/noticias/criar">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <RiAddLine className="w-4 h-4 mr-2" />
              Nova Notícia
            </Button>
          </Link>

          <Link href="/admin/dashboard">
            <Button
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            >
              <RiBarChartLine className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total"
            value={stats?.total || 0}
            icon={<RiNewspaperLine className="w-6 h-6" />}
            description="Notícias"
            color="blue"
            delay={0}
            loading={loadingStats}
          />
          <StatCard
            title="Publicadas"
            value={stats?.published || 0}
            icon={<RiEyeLine className="w-6 h-6" />}
            description="Online"
            color="green"
            delay={1}
            loading={loadingStats}
          />
          <StatCard
            title="Rascunho"
            value={stats?.rascunho || 0}
            icon={<RiEyeOffLine className="w-6 h-6" />}
            description="Pendentes"
            color="amber"
            delay={2}
            loading={loadingStats}
          />
          <StatCard
            title="Arquivadas"
            value={stats?.arquivado || 0}
            icon={<RiArchiveLine className="w-6 h-6" />}
            description="Offline"
            color="gray"
            delay={3}
            loading={loadingStats}
          />
          <StatCard
            title="Destaque"
            value={stats?.featured || 0}
            icon={<RiStarFill className="w-6 h-6" />}
            description="Em destaque"
            color="purple"
            delay={4}
            loading={loadingStats}
          />
          <StatCard
            title="Vídeos"
            value={stats?.videos || 0}
            icon={<RiVideoLine className="w-6 h-6" />}
            description="Notícias vídeo"
            color="red"
            delay={5}
            loading={loadingStats}
          />
        </div>

        {/* Filtros */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <RiSearchLine className="w-5 h-5 text-navy-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por título..."
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.categoria}
                onValueChange={(v) => setFilters({ categoria: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ status: v as StatusFilter })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : noticias.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhuma notícia encontrada.</p>
              </div>
            ) : (
              <div className="divide-y">
                {noticias.map((noticia) => (
                  <div
                    key={noticia.id}
                    className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 items-start group"
                  >
                    <ImageWithFallback
                      src={noticia.thumbnail_url || noticia.media_url}
                      alt={noticia.titulo}
                      className="w-full sm:w-24 h-40 sm:h-24 rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {noticia.destaque && (
                          <RiStarFill className="text-yellow-500 w-4 h-4" />
                        )}
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {noticia.titulo}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(
                            noticia.status as NoticiaStatus,
                          )}
                        >
                          {getStatusText(noticia.status as NoticiaStatus)}
                        </Badge>
                        {noticia.tipo_media === "video" && (
                          <Badge
                            variant="outline"
                            className="border-blue-200 text-blue-700 bg-blue-50"
                          >
                            <RiVideoLine className="w-3 h-3 mr-1" /> Vídeo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {noticia.resumo}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <RiUserLine />{" "}
                          {noticia.autor?.full_name || "Desconhecido"}
                        </span>
                        <span className="flex items-center gap-1">
                          <RiCalendarLine />{" "}
                          {formatDate(noticia.data_publicacao)}
                        </span>
                        <span className="flex items-center gap-1">
                          <RiEyeLine /> {noticia.views}
                        </span>
                        {noticia.categoria && (
                          <Badge variant="outline" className="text-xs">
                            {noticia.categoria}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação na Lista */}
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title={
                            noticia.status === "publicado"
                              ? "Arquivar"
                              : "Publicar"
                          }
                          onClick={() =>
                            handleToggleStatus(
                              noticia.id,
                              noticia.status === "publicado"
                                ? "arquivado"
                                : "publicado",
                            )
                          }
                        >
                          {noticia.status === "publicado" ? (
                            <RiArchiveLine className="w-4 h-4" />
                          ) : (
                            <RiCheckLine className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={
                            noticia.destaque
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                          }
                          title="Destacar"
                          onClick={() =>
                            handleToggleDestaque(noticia.id, noticia.destaque)
                          }
                        >
                          <RiStarFill className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Link
                          href={`/admin/noticias/${noticia.id}`}
                          className="flex-1 sm:flex-none"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-center"
                          >
                            <RiEditLine className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              noticiaId: noticia.id,
                              noticiaTitulo: noticia.titulo,
                            })
                          }
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setFilters({ page: pagination.page - 1 })}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setFilters({ page: pagination.page + 1 })}
            >
              Próxima
            </Button>
          </div>
        )}

        {/* Dialog de Exclusão */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({ ...prev, open }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                <RiAlertLine /> Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a notícia{" "}
                <strong>&quot;{deleteDialog.noticiaTitulo}&quot;</strong>?
                <br />
                <br />
                Essa ação é irreversível.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteNoticia}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
