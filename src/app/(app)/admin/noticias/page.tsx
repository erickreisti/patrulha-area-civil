"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// UI Components
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

// Icons
import {
  RiNewspaperLine,
  RiAddLine,
  RiSearchLine,
  RiEditLine,
  RiEyeLine,
  RiStarFill,
  RiCalendarLine,
  RiUserLine,
  RiDeleteBinLine,
  RiArchiveLine,
  RiRefreshLine,
  RiImageLine,
  RiVideoLine,
  RiCheckLine,
  RiFilmLine,
  RiFilterLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import type { IconType } from "react-icons";

// Store & Types
import {
  useNoticias,
  NOTICIA_STATUS,
  type StatusFilter,
} from "@/lib/stores/useNoticiasStore";
import type { NoticiaLista } from "@/app/actions/news/noticias";

// ==================== CONFIGURAÇÃO & HELPERS ====================

const formatDate = (dateString: string): string => {
  if (!dateString) return "--/--/--";
  try {
    return format(new Date(dateString), "dd 'de' MMM, yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return `${baseUrl}/storage/v1/object/public/imagens-noticias/${path}`;
};

// Configuração de cores e ícones por status (Seguindo padrão do sistema)
const statusConfig: Record<
  string,
  { label: string; badgeVariant: string; icon: IconType; className: string }
> = {
  [NOTICIA_STATUS.PUBLICADO]: {
    label: "Publicado",
    badgeVariant: "default", // Verde/Padrão
    className:
      "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
    icon: RiCheckLine,
  },
  [NOTICIA_STATUS.RASCUNHO]: {
    label: "Rascunho",
    badgeVariant: "secondary", // Amarelo/Aviso
    className:
      "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
    icon: RiEditLine,
  },
  [NOTICIA_STATUS.ARQUIVADO]: {
    label: "Arquivado",
    badgeVariant: "outline", // Cinza
    className:
      "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
    icon: RiArchiveLine,
  },
};

// ==================== SUB-COMPONENTES ====================

// Card de Estatística (Design unificado com Agentes)
const StatCard = ({
  title,
  value,
  icon,
  iconColor,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string; // ex: "text-blue-600"
  loading: boolean;
}) => (
  <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className={`text-3xl font-bold ${iconColor}`}>{value}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-full bg-opacity-10 ${iconColor.replace("text-", "bg-")}`}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Linha da Notícia (Lista)
const NoticiaRow = ({
  noticia,
  onDelete,
  onToggleStatus,
  onToggleDestaque,
}: {
  noticia: NoticiaLista;
  onDelete: (noticia: NoticiaLista) => void;
  onToggleStatus: (id: string, current: string) => void;
  onToggleDestaque: (id: string, current: boolean) => void;
}) => {
  const [imgError, setImgError] = useState(false);
  const statusInfo =
    statusConfig[noticia.status] || statusConfig[NOTICIA_STATUS.RASCUNHO];
  const isVideo = noticia.tipo_media === "video";
  const imageUrl = getImageUrl(noticia.thumbnail_url || noticia.media_url);

  return (
    <div className="group flex flex-col sm:flex-row gap-5 p-5 bg-white border border-gray-100 rounded-xl hover:border-navy-200 hover:shadow-lg transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-sm group-hover:shadow-md transition-all">
        {!imageUrl || imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
            {isVideo ? <RiFilmLine size={32} /> : <RiImageLine size={32} />}
            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
              Sem Mídia
            </span>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={noticia.titulo}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 200px"
          />
        )}

        {/* Badges sobre a imagem */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {noticia.categoria && (
            <Badge
              variant="secondary"
              className="bg-white/95 text-navy-700 text-[10px] font-bold backdrop-blur-md shadow-sm border-0 px-2"
            >
              {noticia.categoria}
            </Badge>
          )}
        </div>

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
            <div className="bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-sm">
              <RiVideoLine className="w-5 h-5 text-navy-700" />
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
        <div className="space-y-2">
          {/* Tags e Metadados */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`gap-1 px-2 py-0.5 border ${statusInfo.className}`}
            >
              <statusInfo.icon className="w-3.5 h-3.5" />
              {statusInfo.label}
            </Badge>

            {noticia.destaque && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 border hover:bg-amber-200 gap-1 px-2 py-0.5 font-bold">
                <RiStarFill className="w-3.5 h-3.5" /> Destaque
              </Badge>
            )}

            <span className="text-xs text-gray-400 flex items-center ml-auto">
              <RiEyeLine className="mr-1 w-3.5 h-3.5" /> {noticia.views || 0}{" "}
              views
            </span>
          </div>

          <Link href={`/admin/noticias/${noticia.id}`} className="block">
            <h3
              className="text-lg font-bold text-gray-800 leading-tight group-hover:text-navy-600 transition-colors line-clamp-1"
              title={noticia.titulo}
            >
              {noticia.titulo}
            </h3>
          </Link>

          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {noticia.resumo || "Sem resumo disponível para esta publicação."}
          </p>
        </div>

        {/* Rodapé do Card */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 font-medium text-gray-500">
            <RiUserLine className="text-navy-400 w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">
              {noticia.autor?.full_name || "Sistema"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-gray-500">
            <RiCalendarLine className="text-navy-400 w-3.5 h-3.5" />
            {formatDate(noticia.data_publicacao)}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 pt-2 sm:pt-0 sm:pl-4 sm:border-l border-gray-100 sm:w-auto w-full min-w-[120px]">
        {/* Toggle Actions */}
        <div className="flex gap-1 w-full justify-end sm:justify-center">
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 rounded-full transition-all ${noticia.destaque ? "text-amber-500 bg-amber-50 hover:bg-amber-100" : "text-gray-300 hover:text-amber-500 hover:bg-amber-50"}`}
            onClick={() => onToggleDestaque(noticia.id, noticia.destaque)}
            title={noticia.destaque ? "Remover Destaque" : "Destacar"}
          >
            <RiStarFill className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 rounded-full transition-all ${noticia.status === NOTICIA_STATUS.PUBLICADO ? "text-gray-400 hover:text-navy-600 hover:bg-gray-100" : "text-green-600 bg-green-50 hover:bg-green-100"}`}
            onClick={() => onToggleStatus(noticia.id, noticia.status)}
            title={
              noticia.status === NOTICIA_STATUS.PUBLICADO
                ? "Arquivar"
                : "Publicar"
            }
          >
            {noticia.status === NOTICIA_STATUS.PUBLICADO ? (
              <RiArchiveLine className="w-4 h-4" />
            ) : (
              <RiCheckLine className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Main Actions */}
        <div className="flex flex-row sm:flex-col gap-2 w-full">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-gray-200 text-gray-700 hover:border-navy-500 hover:text-navy-600 hover:bg-navy-50 font-medium transition-all h-8 text-xs"
            asChild
          >
            <Link href={`/admin/noticias/${noticia.id}`}>
              <RiEditLine className="mr-1.5 w-3.5 h-3.5" /> Editar
            </Link>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 h-8 text-xs"
            onClick={() => onDelete(noticia)}
            title="Excluir Permanentemente"
          >
            <RiDeleteBinLine className="mr-1.5 w-3.5 h-3.5" /> Excluir
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==================== PÁGINA PRINCIPAL ====================

export default function NoticiasPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    noticia: NoticiaLista | null;
  }>({
    open: false,
    noticia: null,
  });

  const [refreshing, setRefreshing] = useState(false);

  const {
    noticias,
    stats,
    categories,
    loading,
    loadingStats,
    pagination,
    filters,
    error,
    setFilters,
    setPagination,
    fetchNoticias,
    fetchStats,
    fetchCategories,
    excluirNoticia,
    alternarStatus,
    alternarDestaque,
  } = useNoticias();

  // Load Inicial
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchNoticias(), fetchStats(), fetchCategories()]);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh Manual
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchNoticias(), fetchStats()]);
      toast.success("Dados atualizados com sucesso");
    } catch {
      toast.error("Erro ao atualizar dados");
    } finally {
      setRefreshing(false);
    }
  }, [fetchNoticias, fetchStats]);

  // Exclusão
  const handleDelete = async () => {
    if (!deleteDialog.noticia) return;

    const toastId = toast.loading("Excluindo notícia...");
    const res = await excluirNoticia(deleteDialog.noticia.id);

    if (res.success) {
      toast.success("Notícia excluída com sucesso", { id: toastId });
      setDeleteDialog({ open: false, noticia: null });
    } else {
      toast.error(res.error || "Erro ao excluir notícia", { id: toastId });
    }
  };

  // Paginação
  const handlePageChange = (newPage: number) => {
    setPagination({ page: newPage });
    fetchNoticias();
  };

  return (
    // Background consistente com o Dashboard/Agentes
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Cabeçalho & Título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {/* CORREÇÃO AQUI: Removi 'text-transparent' e 'bg-clip-text' e usei cores sólidas do Tailwind */}
              <h1 className="text-3xl font-bold text-slate-900 mb-2 font-bebas tracking-wide">
                GERENCIAMENTO DE NOTÍCIAS
              </h1>
              <p className="text-slate-600">
                Gerencie as publicações, rascunhos e conteúdos do portal.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <RiRefreshLine
                  className={`mr-2 h-4 w-4 ${refreshing || loading ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>

              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 font-bold transition-all"
              >
                <Link href="/admin/noticias/criar">
                  <RiAddLine className="mr-2 h-4 w-4" /> Nova Notícia
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total"
            value={stats?.total || 0}
            icon={<RiNewspaperLine size={24} className="text-blue-600" />}
            iconColor="text-blue-600"
            loading={loadingStats}
          />
          <StatCard
            title="Publicadas"
            value={stats?.published || 0}
            icon={<RiCheckLine size={24} className="text-green-600" />}
            iconColor="text-green-600"
            loading={loadingStats}
          />
          <StatCard
            title="Rascunhos"
            value={stats?.rascunho || 0}
            icon={<RiEditLine size={24} className="text-amber-600" />}
            iconColor="text-amber-600"
            loading={loadingStats}
          />
          <StatCard
            title="Arquivadas"
            value={stats?.arquivado || 0}
            icon={<RiArchiveLine size={24} className="text-slate-600" />}
            iconColor="text-slate-600"
            loading={loadingStats}
          />
          <StatCard
            title="Destaques"
            value={stats?.featured || 0}
            icon={<RiStarFill size={24} className="text-purple-600" />}
            iconColor="text-purple-600"
            loading={loadingStats}
          />
          <StatCard
            title="Vídeos"
            value={stats?.videos || 0}
            icon={<RiVideoLine size={24} className="text-red-600" />}
            iconColor="text-red-600"
            loading={loadingStats}
          />
        </div>

        {/* Alerta de Erro */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 shadow-sm">
                <RiErrorWarningLine className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">
                    Não foi possível carregar as notícias
                  </p>
                  <p className="text-sm">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNoticias()}
                  className="border-red-200 hover:bg-red-100 text-red-700 bg-transparent"
                >
                  Tentar Novamente
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtros */}
        <Card className="mb-8 border-none shadow-xl shadow-gray-200/50">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <RiFilterLine className="w-5 h-5 text-navy-500" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por título ou resumo..."
                  className="pl-10 border-gray-200 focus:border-navy-500 focus:ring-navy-500/20 h-12 rounded-xl transition-all"
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                />
              </div>

              <Select
                value={filters.status}
                onValueChange={(v) => {
                  setFilters({ status: v as StatusFilter });
                  fetchNoticias();
                }}
              >
                <SelectTrigger className="border-gray-200 h-12 rounded-xl focus:ring-navy-500/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="publicado">Publicados</SelectItem>
                  <SelectItem value="rascunho">Rascunhos</SelectItem>
                  <SelectItem value="arquivado">Arquivados</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.categoria}
                onValueChange={(v) => {
                  setFilters({ categoria: v });
                  fetchNoticias();
                }}
              >
                <SelectTrigger className="border-gray-200 h-12 rounded-xl focus:ring-navy-500/20">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Resultados */}
        <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <RiNewspaperLine className="text-navy-500" />
                Resultados
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-white text-gray-600 border-gray-200"
              >
                Total: {pagination.total}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && noticias.length === 0 ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl border-gray-100"
                  >
                    <Skeleton className="h-32 w-full sm:w-48 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : noticias.length === 0 && !error ? (
              <div className="text-center py-24 px-4 bg-white">
                <div className="bg-gray-50 p-6 rounded-full w-fit mx-auto mb-4 border border-gray-100">
                  <RiNewspaperLine className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Nenhuma notícia encontrada
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  Não encontramos resultados para os filtros selecionados.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Link href="/admin/noticias/criar">
                    Criar Primeira Notícia
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 bg-gray-50/30 p-4 space-y-4">
                <AnimatePresence mode="popLayout">
                  {noticias.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <NoticiaRow
                        noticia={item}
                        onDelete={(n) =>
                          setDeleteDialog({ open: true, noticia: n })
                        }
                        onToggleStatus={async (id, current) => {
                          await alternarStatus(id, current);
                        }}
                        onToggleDestaque={async (id, current) => {
                          await alternarDestaque(id, !current);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-100 p-4 bg-white flex justify-center items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="w-28 border-gray-200"
              >
                Anterior
              </Button>
              <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                Pág {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="w-28 border-gray-200"
              >
                Próxima
              </Button>
            </div>
          )}
        </Card>

        {/* Modal de Confirmação de Exclusão */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({ ...prev, open }))
          }
        >
          <AlertDialogContent className="rounded-2xl shadow-2xl border-0 bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2 text-xl font-bold">
                <RiErrorWarningLine className="w-6 h-6" />
                Confirmar Exclusão Permanente
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base pt-2 text-gray-600">
                Você está prestes a excluir a notícia:
                <div className="bg-red-50 border border-red-100 p-3 rounded-lg my-3 font-medium text-red-900 border-l-4 border-l-red-500">
                  {deleteDialog.noticia?.titulo}
                </div>
                <p>
                  Esta ação é <strong>irreversível</strong>. A notícia, imagens
                  e dados de visualização serão removidos permanentemente do
                  banco de dados.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="h-11 px-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white h-11 px-6 rounded-xl shadow-md shadow-red-100 font-bold"
              >
                Sim, Excluir Notícia
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
