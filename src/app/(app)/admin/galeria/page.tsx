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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RiFolderFill,
  RiGridFill,
} from "react-icons/ri";

// Interfaces locais específicas
interface GaleriaItem {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: "foto" | "video";
  arquivo_url: string;
  thumbnail_url: string | null;
  categoria_id: string | null;
  status: boolean;
  destaque: boolean;
  ordem: number;
  created_at: string;
  autor_id: string | null;
  galeria_categorias: {
    id: string;
    nome: string;
    tipo: "fotos" | "videos";
  } | null;
}

interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
  slug: string;
  tipo: "fotos" | "videos";
  status: boolean;
  ordem: number;
  created_at: string;
  itens_count: number;
}

interface Filtros {
  busca: string;
  categoria: string;
  tipo: string;
  status: string;
}

interface DeleteDialogState {
  open: boolean;
  item: GaleriaItem | Categoria | null;
  type: "item" | "categoria" | null;
  loading: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "purple" | "amber" | "red";
  delay: number;
  loading?: boolean;
}

// Componente de Estatísticas
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
    red: "from-red-500 to-red-600",
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

// Componente principal
export default function GaleriaPage() {
  const [activeTab, setActiveTab] = useState("itens");
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
    type: null,
    loading: false,
  });

  const supabase = createClient();

  // Função para verificar se usuário é admin
  const verificarAdmin = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Você precisa estar autenticado");
        return false;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao verificar perfil:", error);
        toast.error("Erro ao verificar permissões");
        return false;
      }

      return profile?.role === "admin" && profile?.status === true;
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
      return false;
    }
  }, [supabase]);

  // Buscar itens
  const fetchItens = useCallback(async () => {
    try {
      setLoading(true);

      // Verificar se é admin antes de buscar
      const isAdmin = await verificarAdmin();
      if (!isAdmin) {
        setItens([]);
        return;
      }

      let query = supabase
        .from("galeria_itens")
        .select(
          `
          *,
          galeria_categorias (
            id,
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
      if (error) {
        console.error("Erro Supabase:", error);
        throw new Error(`Erro ao carregar itens: ${error.message}`);
      }

      setItens(data || []);
    } catch (error: unknown) {
      console.error("Erro ao carregar itens:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar itens: ${errorMessage}`);
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, [filtros, supabase, verificarAdmin]);

  // Buscar categorias
  const fetchCategorias = useCallback(async () => {
    try {
      // Verificar se é admin antes de buscar
      const isAdmin = await verificarAdmin();
      if (!isAdmin) {
        setCategorias([]);
        return;
      }

      // 1. Buscar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from("galeria_categorias")
        .select("id, nome, descricao, slug, tipo, status, ordem, created_at")
        .order("ordem", { ascending: true });

      if (categoriasError) throw categoriasError;

      // 2. Para cada categoria, contar itens
      const categoriasComCount = await Promise.all(
        (categoriasData || []).map(async (categoria) => {
          const { count, error: countError } = await supabase
            .from("galeria_itens")
            .select("*", { count: "exact", head: true })
            .eq("categoria_id", categoria.id);

          if (countError) {
            console.error(
              `Erro ao contar itens da categoria ${categoria.id}:`,
              countError
            );
            return { ...categoria, itens_count: 0 };
          }

          return { ...categoria, itens_count: count || 0 };
        })
      );

      setCategorias(categoriasComCount);
    } catch (error: unknown) {
      console.error("Erro ao carregar categorias:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar categorias: ${errorMessage}`);
      setCategorias([]);
    }
  }, [supabase, verificarAdmin]);

  // Atualizar dados
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchItens(), fetchCategorias()]);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchItens, fetchCategorias]);

  // Efeito inicial
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Funções de filtro
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

  // Funções de exclusão
  const handleDeleteClick = (
    item: GaleriaItem | Categoria,
    type: "item" | "categoria"
  ) => {
    setDeleteDialog({
      open: true,
      item,
      type,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item || !deleteDialog.type) return;

    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }));

      // Verificar se ainda é admin
      const isAdmin = await verificarAdmin();
      if (!isAdmin) {
        toast.error("Permissão negada. Apenas administradores podem excluir.");
        setDeleteDialog({
          open: false,
          item: null,
          type: null,
          loading: false,
        });
        return;
      }

      if (deleteDialog.type === "item") {
        const { error } = await supabase
          .from("galeria_itens")
          .delete()
          .eq("id", deleteDialog.item.id);

        if (error) throw error;
        toast.success("Item excluído com sucesso!");
      } else {
        // Para categorias, verificar se tem itens primeiro
        const categoria = deleteDialog.item as Categoria;

        if (categoria.itens_count > 0) {
          toast.error("Não é possível excluir categorias que contenham itens.");
          setDeleteDialog({
            open: false,
            item: null,
            type: null,
            loading: false,
          });
          return;
        }

        const { error } = await supabase
          .from("galeria_categorias")
          .delete()
          .eq("id", deleteDialog.item.id);

        if (error) throw error;
        toast.success("Categoria excluída com sucesso!");
      }

      setDeleteDialog({ open: false, item: null, type: null, loading: false });
      refreshData();
    } catch (error: unknown) {
      console.error("Erro ao excluir:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao excluir: ${errorMessage}`);
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  // Funções auxiliares de UI
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

  const getCategoriaTipoBadge = (tipo: string) => {
    return tipo === "fotos" ? (
      <Badge className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
        <RiImageFill className="w-3 h-3 mr-1" />
        Fotos
      </Badge>
    ) : (
      <Badge className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">
        <RiVideoFill className="w-3 h-3 mr-1" />
        Vídeos
      </Badge>
    );
  };

  // Estatísticas
  const stats = {
    total: itens.length,
    fotos: itens.filter((i) => i.tipo === "foto").length,
    videos: itens.filter((i) => i.tipo === "video").length,
    ativos: itens.filter((i) => i.status).length,
    categorias: categorias.length,
    categoriasAtivas: categorias.filter((c) => c.status).length,
  };

  // Variantes de animação
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

  // Componente de imagem com fallback
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
                onClick={refreshData}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Itens"
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
          <StatCard
            title="Categorias"
            value={stats.categorias}
            icon={<RiFolderFill className="w-6 h-6" />}
            description="Total de categorias"
            color="blue"
            delay={4}
            loading={loading}
          />
          <StatCard
            title="Cat. Ativas"
            value={stats.categoriasAtivas}
            icon={<RiEyeFill className="w-6 h-6" />}
            description="Categorias visíveis"
            color="green"
            delay={5}
            loading={loading}
          />
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
            <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border">
              <TabsTrigger value="itens" className="flex items-center gap-2">
                <RiGridFill className="w-4 h-4" />
                Itens da Galeria ({stats.total})
              </TabsTrigger>
              <TabsTrigger
                value="categorias"
                className="flex items-center gap-2"
              >
                <RiFolderFill className="w-4 h-4" />
                Categorias ({stats.categorias})
              </TabsTrigger>
            </TabsList>

            {/* Tab de Itens */}
            <TabsContent value="itens" className="space-y-6">
              {/* Filtros para Itens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <RiFilterFill className="w-5 h-5 text-navy-600" />
                      Filtros e Busca - Itens
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
                            <SelectItem value="all">
                              Todas categorias
                            </SelectItem>
                            {categorias.map((categoria) => (
                              <SelectItem
                                key={categoria.id}
                                value={categoria.id}
                              >
                                {categoria.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select
                          value={filtros.tipo}
                          onValueChange={(value) =>
                            handleFiltroChange("tipo", value)
                          }
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

              {/* Lista de Itens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center text-gray-800">
                      <RiGridFill className="w-5 h-5 mr-2 text-navy-600" />
                      Lista de Itens ({itens.length})
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
                                        src={
                                          item.thumbnail_url || item.arquivo_url
                                        }
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
                                            {item.galeria_categorias?.nome ||
                                              "N/A"}
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
                                          onClick={() => {
                                            handleDeleteClick(item, "item");
                                          }}
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
                        <RiFolderFill className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Nenhuma categoria cadastrada
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link href="/admin/galeria/categorias/criar">
                            <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                              <RiAddFill className="w-4 h-4 mr-2" />
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
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                      <div className="w-12 h-12 rounded flex items-center justify-center bg-blue-100">
                                        <RiFolderFill className="w-6 h-6 text-blue-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h3 className="font-semibold text-gray-800">
                                            {categoria.nome}
                                          </h3>
                                          {getCategoriaTipoBadge(
                                            categoria.tipo
                                          )}
                                          {getStatusBadge(categoria.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                          <div className="flex items-center gap-1">
                                            <RiImageFill className="w-3 h-3 text-gray-400" />
                                            <span>
                                              {categoria.itens_count} itens
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <RiCalendarFill className="w-3 h-3 text-gray-400" />
                                            <span>
                                              {new Date(
                                                categoria.created_at
                                              ).toLocaleDateString("pt-BR")}
                                            </span>
                                          </div>
                                          <motion.span
                                            className="font-mono text-sm bg-gray-100 px-2 py-1 rounded transition-colors duration-300"
                                            whileHover={{ scale: 1.05 }}
                                          >
                                            Ordem: {categoria.ordem}
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
                                          href={`/admin/galeria/categorias/${categoria.id}`}
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
                                          onClick={() =>
                                            handleDeleteClick(
                                              categoria,
                                              "categoria"
                                            )
                                          }
                                          disabled={categoria.itens_count > 0}
                                          className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <RiDeleteBinFill className="w-3 h-3 mr-1" />
                                          Excluir
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </div>
                                  {categoria.itens_count > 0 && (
                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                      <p className="text-sm text-amber-700 flex items-center gap-2">
                                        <RiAlertFill className="w-4 h-4" />
                                        Esta categoria contém{" "}
                                        {categoria.itens_count} itens. Exclua os
                                        itens primeiro ou mova-os para outra
                                        categoria.
                                      </p>
                                    </div>
                                  )}
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
                  Tem certeza que deseja excluir{" "}
                  {deleteDialog.type === "item" ? "o item" : "a categoria"}{" "}
                  <strong>
                    &quot;
                    {deleteDialog.type === "item"
                      ? (deleteDialog.item as GaleriaItem)?.titulo
                      : (deleteDialog.item as Categoria)?.nome}
                    &quot;
                  </strong>
                  ?
                  <br />
                  <span className="text-red-600 font-medium">
                    Esta ação não pode ser desfeita.
                  </span>
                  {deleteDialog.type === "categoria" &&
                    deleteDialog.item &&
                    (deleteDialog.item as Categoria).itens_count > 0 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700">
                          ⚠️ Esta categoria contém{" "}
                          {(deleteDialog.item as Categoria).itens_count} itens.
                          Não é possível excluir categorias que contenham itens.
                        </p>
                      </div>
                    )}
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
                        type: null,
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
                    disabled={
                      deleteDialog.loading ||
                      (deleteDialog.type === "categoria" &&
                        deleteDialog.item !== null &&
                        (deleteDialog.item as Categoria).itens_count > 0)
                    }
                    className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        Excluir{" "}
                        {deleteDialog.type === "item" ? "Item" : "Categoria"}
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
