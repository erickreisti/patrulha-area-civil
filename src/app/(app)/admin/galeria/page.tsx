"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  RiAddFill,
  RiEditFill,
  RiDeleteBinFill,
  RiImageFill,
  RiVideoFill,
  RiEyeFill,
  RiEyeOffFill,
  RiSearchFill,
  RiFilterFill,
  RiCalendarFill,
  RiBarChartFill,
  RiHomeFill,
  RiUserFill,
  RiRefreshFill,
  RiAlertFill,
  RiStarFill,
} from "react-icons/ri";

interface GaleriaItem {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: "foto" | "video";
  arquivo_url: string;
  thumbnail_url: string | null;
  categoria_id: string;
  status: boolean;
  destaque: boolean;
  ordem: number;
  created_at: string;
  autor_id: string;
  galeria_categorias: {
    nome: string;
    tipo: "fotos" | "videos";
  };
}

interface Categoria {
  id: string;
  nome: string;
  tipo: "fotos" | "videos";
}

interface Filtros {
  busca: string;
  categoria: string;
  tipo: string;
  status: string;
}

interface DeleteDialogState {
  open: boolean;
  item: GaleriaItem | null;
  loading: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "purple" | "amber";
  delay: number;
  loading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  color = "blue",
  delay,
  loading = false,
}: StatCardProps) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1 transition-colors duration-300">
                {title}
              </p>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1 bg-gray-200" />
              ) : (
                <motion.p
                  className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: delay * 0.1 + 0.2 }}
                >
                  {value}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 transition-colors duration-300">
                {description}
              </p>
            </div>
            <motion.div
              className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ItensGaleriaPage() {
  const [itens, setItens] = useState<GaleriaItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: "",
    categoria: "all",
    tipo: "all",
    status: "all",
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    item: null,
    loading: false,
  });

  const supabase = createClient();

  const fetchItens = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      let query = supabase
        .from("galeria_itens")
        .select(
          `
          *,
          galeria_categorias (
            nome,
            tipo
          )
        `
        )
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });

      if (filtros.busca) {
        query = query.ilike("titulo", `%${filtros.busca}%`);
      }

      if (filtros.categoria !== "all") {
        query = query.eq("categoria_id", filtros.categoria);
      }

      if (filtros.tipo !== "all") {
        query = query.eq("tipo", filtros.tipo);
      }

      if (filtros.status !== "all") {
        query = query.eq("status", filtros.status === "ativo");
      }

      const { data, error } = await query;

      if (error) throw error;

      setItens(data || []);
    } catch (error: unknown) {
      console.error("Erro ao carregar itens:", error);
      toast.error("Erro ao carregar itens da galeria");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtros, supabase]);

  const fetchCategorias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("galeria_categorias")
        .select("id, nome, tipo")
        .eq("status", true)
        .order("ordem", { ascending: true });

      if (error) throw error;

      setCategorias(data || []);
    } catch (error: unknown) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    }
  }, [supabase]);

  useEffect(() => {
    fetchItens();
    fetchCategorias();
  }, [fetchItens, fetchCategorias]);

  const handleDeleteClick = (item: GaleriaItem) => {
    setDeleteDialog({
      open: true,
      item,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;

    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }));

      const { error } = await supabase
        .from("galeria_itens")
        .delete()
        .eq("id", deleteDialog.item.id);

      if (error) throw error;

      toast.success("Item excluído com sucesso!");
      setDeleteDialog({ open: false, item: null, loading: false });
      fetchItens();
    } catch (error: unknown) {
      console.error("Erro ao excluir item:", error);
      toast.error("Erro ao excluir item");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleFiltroChange = (key: keyof Filtros, value: string) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const aplicarFiltros = () => {
    fetchItens();
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      categoria: "all",
      tipo: "all",
      status: "all",
    });
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "foto" ? (
      <Badge className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
        <RiImageFill className="w-3 h-3 mr-1" />
        Foto
      </Badge>
    ) : (
      <Badge className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">
        <RiVideoFill className="w-3 h-3 mr-1" />
        Vídeo
      </Badge>
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
        <RiEyeFill className="w-3 h-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-gray-500 text-white transition-colors duration-300"
      >
        <RiEyeOffFill className="w-3 h-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  const getDestaqueBadge = (destaque: boolean) => {
    return destaque ? (
      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-300">
        <RiStarFill className="w-3 h-3 mr-1" />
        Destaque
      </Badge>
    ) : null;
  };

  const stats = {
    total: itens.length,
    fotos: itens.filter((i) => i.tipo === "foto").length,
    videos: itens.filter((i) => i.tipo === "video").length,
    ativos: itens.filter((i) => i.status).length,
  };

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

  const ImageWithFallback = ({
    src,
    alt,
    tipo,
  }: {
    src: string | null;
    alt: string;
    tipo: "foto" | "video";
  }) => {
    const [imageError, setImageError] = useState(false);

    if (tipo === "video" || !src) {
      return (
        <div className="w-12 h-12 rounded flex items-center justify-center bg-purple-100">
          <RiVideoFill className="w-6 h-6 text-purple-500" />
        </div>
      );
    }

    if (imageError) {
      return (
        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
          <RiImageFill className="w-5 h-5 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded overflow-hidden relative bg-gray-200">
        <Image
          src={src}
          alt={alt}
          width={48}
          height={48}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          priority={false}
          loading="lazy"
        />
      </div>
    );
  };

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
              GERENCIAR ITENS DA GALERIA
            </h1>
            <p className="text-gray-600">
              Gerencie fotos e vídeos da galeria da Patrulha Aérea Civil
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  setRefreshing(true);
                  fetchItens();
                }}
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
                {
                  href: "/admin/galeria/itens/criar",
                  icon: RiAddFill,
                  label: "Novo Item",
                  variant: "default" as const,
                  className: "bg-green-600 hover:bg-green-700 text-white",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={<RiImageFill className="w-6 h-6" />}
            description="Itens na galeria"
            color="blue"
            delay={0}
            loading={loading}
          />
          <StatCard
            title="Fotos"
            value={stats.fotos}
            icon={<RiImageFill className="w-6 h-6" />}
            description="Imagens"
            color="green"
            delay={1}
            loading={loading}
          />
          <StatCard
            title="Vídeos"
            value={stats.videos}
            icon={<RiVideoFill className="w-6 h-6" />}
            description="Vídeos"
            color="purple"
            delay={2}
            loading={loading}
          />
          <StatCard
            title="Ativos"
            value={stats.ativos}
            icon={<RiEyeFill className="w-6 h-6" />}
            description="Visíveis no site"
            color="amber"
            delay={3}
            loading={loading}
          />
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <RiFilterFill className="w-5 h-5 text-navy-600" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <RiSearchFill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-300" />
                    <Input
                      placeholder="Buscar por título..."
                      value={filtros.busca}
                      onChange={(e) =>
                        handleFiltroChange("busca", e.target.value)
                      }
                      className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <Select
                    value={filtros.categoria}
                    onValueChange={(value) =>
                      handleFiltroChange("categoria", value)
                    }
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                      <SelectValue placeholder="Todas categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filtros.tipo}
                    onValueChange={(value) => handleFiltroChange("tipo", value)}
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                      <SelectValue placeholder="Todos tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos tipos</SelectItem>
                      <SelectItem value="foto">Fotos</SelectItem>
                      <SelectItem value="video">Vídeos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filtros.status}
                    onValueChange={(value) =>
                      handleFiltroChange("status", value)
                    }
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                      <SelectValue placeholder="Todos status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ativo">Ativos</SelectItem>
                      <SelectItem value="inativo">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={aplicarFiltros}
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
                  >
                    <RiFilterFill className="w-4 h-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={limparFiltros}
                    className="border-gray-700 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  >
                    Limpar Filtros
                  </Button>
                </motion.div>

                <div className="flex-1 text-right">
                  <span className="text-sm text-gray-600 transition-colors duration-300">
                    {itens.length} itens encontrados
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabela de Itens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <RiImageFill className="w-5 h-5 mr-2 text-navy-600" />
                Lista de Itens ({itens.length})
              </CardTitle>
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
                  <RiImageFill className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {Object.values(filtros).some(
                      (val) => val !== "" && val !== "all"
                    )
                      ? "Nenhum item encontrado com os filtros aplicados"
                      : "Nenhum item cadastrado na galeria"}
                  </p>
                  {!Object.values(filtros).some(
                    (val) => val !== "" && val !== "all"
                  ) && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/admin/galeria/itens/criar">
                        <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                          <RiAddFill className="w-4 h-4 mr-2" />
                          Adicionar Primeiro Item
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
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
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <ImageWithFallback
                                  src={item.thumbnail_url || item.arquivo_url}
                                  alt={item.titulo}
                                  tipo={item.tipo}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-800">
                                      {item.titulo}
                                    </h3>
                                    {getDestaqueBadge(item.destaque)}
                                  </div>
                                  {item.descricao && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                      {item.descricao}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      {getTipoBadge(item.tipo)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {getStatusBadge(item.status)}
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="bg-blue-100 text-blue-700 transition-colors duration-300"
                                    >
                                      {item.galeria_categorias?.nome || "N/A"}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                      <RiCalendarFill className="w-3 h-3 text-gray-400 transition-colors duration-300" />
                                      <span>
                                        {new Date(
                                          item.created_at
                                        ).toLocaleDateString("pt-BR")}
                                      </span>
                                    </div>
                                    <motion.span
                                      className="font-mono text-sm bg-gray-100 px-2 py-1 rounded transition-colors duration-300"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      Ordem: {item.ordem}
                                    </motion.span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 ml-4">
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
                                      <RiEditFill className="w-3 h-3 mr-1" />
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
                                    onClick={() => handleDeleteClick(item)}
                                    className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-300"
                                  >
                                    <RiDeleteBinFill className="w-3 h-3 mr-1" />
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

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <RiAlertFill className="w-5 h-5" />
                  Confirmar Exclusão
                </DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir o item{" "}
                  <strong>&quot;{deleteDialog.item?.titulo}&quot;</strong>?
                  <br />
                  <span className="text-red-600 font-medium">
                    Esta ação não pode ser desfeita.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    onClick={() =>
                      setDeleteDialog({
                        open: false,
                        item: null,
                        loading: false,
                      })
                    }
                    className="w-full border-gray-700 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                    disabled={deleteDialog.loading}
                  >
                    Cancelar
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    variant="destructive"
                    onClick={handleDeleteConfirm}
                    disabled={deleteDialog.loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
                  >
                    {deleteDialog.loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <RiRefreshFill className="w-4 h-4 mr-2" />
                        </motion.div>
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <RiDeleteBinFill className="w-4 h-4 mr-2" />
                        Excluir Item
                      </>
                    )}
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
