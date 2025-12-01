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
import { Skeleton } from "@/components/ui/skeleton";
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
} from "react-icons/ri";
import { NoticiaWithAutor, NoticiaStatus } from "@/types";

const CATEGORIAS = [
  "Operações",
  "Treinamento",
  "Cooperação",
  "Projetos Sociais",
  "Equipamentos",
  "Eventos",
  "Comunicação",
];

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "purple" | "amber" | "gray";
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
    gray: "from-gray-500 to-gray-600",
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
        sizes="(max-width: 768px) 64px, 64px"
        className="object-cover"
        onError={() => setImageError(true)}
        priority={false}
        loading="lazy"
      />
    </div>
  );
};

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<NoticiaWithAutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<NoticiaStatus | "all">(
    "all"
  );
  const [filterCategoria, setFilterCategoria] = useState<string>("all");
  const [filterDestaque, setFilterDestaque] = useState<
    "all" | "destaque" | "normal"
  >("all");

  const supabase = createClient();

  const fetchNoticias = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      console.log("🔄 Buscando notícias do banco...");

      const { data, error } = await supabase
        .from("noticias")
        .select(
          `
          *,
          autor:profiles(full_name, graduacao)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar notícias:", error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} notícias carregadas`);
      setNoticias(data || []);
    } catch (error) {
      console.error("❌ Erro ao buscar notícias:", error);
      toast.error("Erro ao carregar notícias");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  const filteredNoticias = noticias.filter((noticia) => {
    const matchesSearch =
      noticia.titulo.toLowerCase().includes(search.toLowerCase()) ||
      noticia.resumo?.toLowerCase().includes(search.toLowerCase()) ||
      noticia.conteudo?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || noticia.status === filterStatus;
    const matchesCategoria =
      filterCategoria === "all" || noticia.categoria === filterCategoria;
    const matchesDestaque =
      filterDestaque === "all" ||
      (filterDestaque === "destaque" && noticia.destaque) ||
      (filterDestaque === "normal" && !noticia.destaque);

    return (
      matchesSearch && matchesStatus && matchesCategoria && matchesDestaque
    );
  });

  const toggleNoticiaStatus = async (
    noticiaId: string,
    currentStatus: NoticiaStatus
  ) => {
    try {
      let newStatus: NoticiaStatus;
      if (currentStatus === "rascunho") {
        newStatus = "publicado";
      } else if (currentStatus === "publicado") {
        newStatus = "arquivado";
      } else {
        newStatus = "publicado";
      }

      const { error } = await supabase
        .from("noticias")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noticiaId);

      if (error) throw error;

      setNoticias((prev) =>
        prev.map((noticia) =>
          noticia.id === noticiaId
            ? {
                ...noticia,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : noticia
        )
      );

      toast.success(`Status alterado para ${newStatus}`);
    } catch (error) {
      console.error("❌ Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da notícia");
    }
  };

  const toggleDestaque = async (
    noticiaId: string,
    currentDestaque: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("noticias")
        .update({
          destaque: !currentDestaque,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noticiaId);

      if (error) throw error;

      setNoticias((prev) =>
        prev.map((noticia) =>
          noticia.id === noticiaId
            ? {
                ...noticia,
                destaque: !currentDestaque,
                updated_at: new Date().toISOString(),
              }
            : noticia
        )
      );

      toast.success(
        !currentDestaque ? "Notícia destacada" : "Destaque removido"
      );
    } catch (error) {
      console.error("❌ Erro ao alterar destaque:", error);
      toast.error("Erro ao alterar destaque da notícia");
    }
  };

  const deleteNoticia = async (noticiaId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("noticias")
        .delete()
        .eq("id", noticiaId);

      if (error) throw error;

      setNoticias((prev) => prev.filter((noticia) => noticia.id !== noticiaId));
      toast.success("Notícia excluída com sucesso");
    } catch (error) {
      console.error("❌ Erro ao excluir notícia:", error);
      toast.error("Erro ao excluir notícia");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const stats = {
    total: noticias.length,
    rascunho: noticias.filter((n) => n.status === "rascunho").length,
    publicado: noticias.filter((n) => n.status === "publicado").length,
    arquivado: noticias.filter((n) => n.status === "arquivado").length,
    destaque: noticias.filter((n) => n.destaque).length,
  };

  const getStatusBadge = (status: NoticiaStatus) => {
    const variants = {
      rascunho: "bg-yellow-500 text-white",
      publicado: "bg-green-500 text-white",
      arquivado: "bg-gray-500 text-white",
    };
    return variants[status];
  };

  const getStatusText = (status: NoticiaStatus) => {
    const texts = {
      rascunho: "RASCUNHO",
      publicado: "PUBLICADO",
      arquivado: "ARQUIVADO",
    };
    return texts[status];
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

  const navigationButtons = [
    {
      href: "/admin/dashboard",
      icon: RiBarChartLine,
      label: "Dashboard",
      variant: "outline" as const,
      className:
        "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    },
    {
      href: "/perfil",
      icon: RiUserLine,
      label: "Meu Perfil",
      variant: "outline" as const,
      className:
        "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      variant: "outline" as const,
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
    {
      href: "/admin/noticias/criar",
      icon: RiAddLine,
      label: "Nova Notícia",
      variant: "default" as const,
      className: "bg-green-600 hover:bg-green-700 text-white",
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
              GERENCIAR NOTÍCIAS
            </h1>
            <p className="text-gray-600">
              Crie e gerencie as notícias do site da Patrulha Aérea Civil
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  setRefreshing(true);
                  fetchNoticias();
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
                  <RiRefreshLine
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
              {navigationButtons.map((item, index) => (
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={<RiNewspaperLine className="w-6 h-6" />}
            description="Notícias no sistema"
            color="blue"
            delay={0}
            loading={loading}
          />
          <StatCard
            title="Rascunho"
            value={stats.rascunho}
            icon={<RiEyeOffLine className="w-6 h-6" />}
            description="Aguardando publicação"
            color="amber"
            delay={1}
            loading={loading}
          />
          <StatCard
            title="Publicado"
            value={stats.publicado}
            icon={<RiEyeLine className="w-6 h-6" />}
            description="Disponíveis no site"
            color="green"
            delay={2}
            loading={loading}
          />
          <StatCard
            title="Arquivado"
            value={stats.arquivado}
            icon={<RiArchiveLine className="w-6 h-6" />}
            description="Notícias antigas"
            color="gray"
            delay={3}
            loading={loading}
          />
          <StatCard
            title="Destaque"
            value={stats.destaque}
            icon={<RiStarFill className="w-6 h-6" />}
            description="Em destaque"
            color="purple"
            delay={4}
            loading={loading}
          />
        </div>

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
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
                    <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-300" />
                    <Input
                      type="text"
                      placeholder="Buscar por título, resumo ou conteúdo..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <Select
                    value={filterStatus}
                    onValueChange={(value: NoticiaStatus | "all") =>
                      setFilterStatus(value)
                    }
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
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
                    value={filterCategoria}
                    onValueChange={setFilterCategoria}
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
                <div className="flex-1">
                  <Select
                    value={filterDestaque}
                    onValueChange={(value: "all" | "destaque" | "normal") =>
                      setFilterDestaque(value)
                    }
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                      <SelectValue placeholder="Destaque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="destaque">Em destaque</SelectItem>
                      <SelectItem value="normal">Normais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 text-right">
                  <span className="text-sm text-gray-600 transition-colors duration-300">
                    {filteredNoticias.length} notícias encontradas
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabela de Notícias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <RiNewspaperLine className="w-5 h-5 mr-2 text-navy-600" />
                Lista de Notícias ({filteredNoticias.length})
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
              ) : filteredNoticias.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <RiNewspaperLine className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {noticias.length === 0
                      ? "Nenhuma notícia cadastrada no sistema"
                      : "Nenhuma notícia encontrada com os filtros aplicados"}
                  </p>
                  {noticias.length === 0 && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/admin/noticias/criar">
                        <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                          <RiAddLine className="w-4 h-4 mr-2" />
                          Criar Primeira Notícia
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
                    {filteredNoticias.map((noticia) => (
                      <motion.div
                        key={noticia.id}
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
                                  src={noticia.imagem}
                                  alt={noticia.titulo}
                                  className="w-16 h-16 flex-shrink-0"
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
                                    <h3 className="font-semibold text-gray-800 truncate">
                                      {noticia.titulo}
                                    </h3>
                                    <Badge
                                      className={getStatusBadge(noticia.status)}
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
                                    <Badge
                                      variant="secondary"
                                      className="bg-blue-100 text-blue-700 transition-colors duration-300"
                                    >
                                      {noticia.categoria}
                                    </Badge>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono transition-colors duration-300">
                                      /{noticia.slug}
                                    </code>
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
                                    onClick={() =>
                                      toggleNoticiaStatus(
                                        noticia.id,
                                        noticia.status
                                      )
                                    }
                                    className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-300"
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
                                      toggleDestaque(
                                        noticia.id,
                                        noticia.destaque
                                      )
                                    }
                                    className="w-full sm:w-auto border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300"
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteNoticia(noticia.id)}
                                    className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-300"
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
      </div>
    </div>
  );
}
