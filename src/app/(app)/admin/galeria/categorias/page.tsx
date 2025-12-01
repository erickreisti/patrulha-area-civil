// src/app/(app)/admin/galeria/categorias/page.tsx - VERSÃO CORRIGIDA
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
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiImageLine,
  RiVideoLine,
  RiEyeLine,
  RiEyeOffLine,
  RiSearchLine,
  RiFilterLine,
  RiCalendarLine,
  RiBarChartLine,
  RiHomeLine,
  RiFolderLine,
  RiRefreshLine,
  RiAlertLine,
} from "react-icons/ri";

interface Categoria {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: "fotos" | "videos";
  status: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
  itens_count?: number;
}

interface Filtros {
  busca: string;
  tipo: string;
  status: string;
}

interface DeleteDialogState {
  open: boolean;
  categoria: Categoria | null;
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

export default function CategoriasGaleriaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: "",
    tipo: "all",
    status: "all",
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    categoria: null,
    loading: false,
  });

  const supabase = createClient();

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      let query = supabase
        .from("galeria_categorias")
        .select("*")
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });

      if (filtros.busca) {
        query = query.ilike("nome", `%${filtros.busca}%`);
      }

      if (filtros.tipo !== "all") {
        query = query.eq("tipo", filtros.tipo);
      }

      if (filtros.status !== "all") {
        query = query.eq("status", filtros.status === "ativo");
      }

      const { data: categoriasData, error: categoriasError } = await query;

      if (categoriasError) throw categoriasError;

      if (categoriasData && categoriasData.length > 0) {
        const categoriasComContagem = await Promise.all(
          categoriasData.map(async (categoria) => {
            const { count, error: countError } = await supabase
              .from("galeria_itens")
              .select("*", { count: "exact", head: true })
              .eq("categoria_id", categoria.id);

            if (countError) {
              console.error(
                `Erro ao contar itens da categoria ${categoria.nome}:`,
                countError
              );
              return { ...categoria, itens_count: 0 };
            }

            return {
              ...categoria,
              itens_count: count || 0,
            };
          })
        );

        setCategorias(categoriasComContagem);
      } else {
        setCategorias([]);
      }
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      toast.error("Erro ao carregar categorias da galeria");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtros, supabase]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleDeleteClick = (categoria: Categoria) => {
    setDeleteDialog({
      open: true,
      categoria,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.categoria) return;

    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }));

      if (
        deleteDialog.categoria.itens_count &&
        deleteDialog.categoria.itens_count > 0
      ) {
        toast.error(
          `Não é possível excluir a categoria "${deleteDialog.categoria.nome}" porque existem ${deleteDialog.categoria.itens_count} itens associados a ela.`
        );
        setDeleteDialog({ open: false, categoria: null, loading: false });
        return;
      }

      const { error: deleteError } = await supabase
        .from("galeria_categorias")
        .delete()
        .eq("id", deleteDialog.categoria.id);

      if (deleteError) throw deleteError;

      toast.success("Categoria excluída com sucesso!");
      setDeleteDialog({ open: false, categoria: null, loading: false });
      fetchCategorias();
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      toast.error("Erro ao excluir categoria");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleFiltroChange = (key: keyof Filtros, value: string) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const aplicarFiltros = () => {
    fetchCategorias();
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      tipo: "all",
      status: "all",
    });
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "fotos" ? (
      <Badge className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
        <RiImageLine className="w-3 h-3 mr-1" />
        Fotos
      </Badge>
    ) : (
      <Badge className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">
        <RiVideoLine className="w-3 h-3 mr-1" />
        Vídeos
      </Badge>
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
        <RiEyeLine className="w-3 h-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-gray-500 text-white transition-colors duration-300"
      >
        <RiEyeOffLine className="w-3 h-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  const stats = {
    total: categorias.length,
    fotos: categorias.filter((c) => c.tipo === "fotos").length,
    videos: categorias.filter((c) => c.tipo === "videos").length,
    ativos: categorias.filter((c) => c.status).length,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header - TÍTULO E DESCRIÇÃO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
            GERENCIAR CATEGORIAS
          </h1>
          <p className="text-gray-600">Organize fotos e vídeos em categorias</p>
        </motion.div>

        {/* ✅ BOTÕES ABAIXO DO HEADER */}
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
                setRefreshing(true);
                fetchCategorias();
              }}
              disabled={refreshing}
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

          {/* Botão Nova Categoria */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/admin/galeria/categorias/criar">
              <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                <RiAddLine className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </Link>
          </motion.div>

          {/* Botões de Navegação */}
          {[
            {
              href: "/admin/dashboard",
              icon: RiBarChartLine,
              label: "Dashboard",
              className:
                "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
            },
            {
              href: "/admin/galeria/itens",
              icon: RiImageLine,
              label: "Ver Itens",
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
          ].map((button, index) => (
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={<RiFolderLine className="w-6 h-6" />}
            description="Categorias cadastradas"
            color="blue"
            delay={0}
            loading={loading}
          />
          <StatCard
            title="Fotos"
            value={stats.fotos}
            icon={<RiImageLine className="w-6 h-6" />}
            description="Para imagens"
            color="green"
            delay={1}
            loading={loading}
          />
          <StatCard
            title="Vídeos"
            value={stats.videos}
            icon={<RiVideoLine className="w-6 h-6" />}
            description="Para vídeos"
            color="purple"
            delay={2}
            loading={loading}
          />
          <StatCard
            title="Ativas"
            value={stats.ativos}
            icon={<RiEyeLine className="w-6 h-6" />}
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
                <RiFilterLine className="w-5 h-5 text-navy-600" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-300" />
                    <Input
                      placeholder="Buscar por nome..."
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
                    value={filtros.tipo}
                    onValueChange={(value) => handleFiltroChange("tipo", value)}
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                      <SelectValue placeholder="Todos tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos tipos</SelectItem>
                      <SelectItem value="fotos">Fotos</SelectItem>
                      <SelectItem value="videos">Vídeos</SelectItem>
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
                    <RiFilterLine className="w-4 h-4 mr-2" />
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
                    {categorias.length} categorias encontradas
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabela de Categorias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <RiFolderLine className="w-5 h-5 mr-2 text-navy-600" />
                Lista de Categorias ({categorias.length})
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
              ) : categorias.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <RiFolderLine className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {Object.values(filtros).some(
                      (val) => val !== "" && val !== "all"
                    )
                      ? "Nenhuma categoria encontrada com os filtros aplicados"
                      : "Nenhuma categoria cadastrada"}
                  </p>
                  {!Object.values(filtros).some(
                    (val) => val !== "" && val !== "all"
                  ) && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/admin/galeria/categorias/criar">
                        <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                          <RiAddLine className="w-4 h-4 mr-2" />
                          Adicionar Primeira Categoria
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
                  className="overflow-x-auto"
                >
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {[
                          "Nome",
                          "Tipo",
                          "Status",
                          "Itens",
                          "Ordem",
                          "Criado em",
                          "Ações",
                        ].map((header, index) => (
                          <motion.th
                            key={header}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-left py-4 px-4 font-semibold text-gray-700"
                          >
                            {header}
                          </motion.th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {categorias.map((categoria) => (
                          <motion.tr
                            key={categoria.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            whileHover={{
                              backgroundColor: "rgba(0, 0, 0, 0.02)",
                            }}
                            className="border-b border-gray-100 transition-colors duration-300"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <motion.div
                                  className="p-2 bg-blue-100 rounded-lg"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                  }}
                                >
                                  <RiFolderLine className="w-5 h-5 text-blue-600" />
                                </motion.div>
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {categoria.nome}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {categoria.slug}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              {getTipoBadge(categoria.tipo)}
                            </td>

                            <td className="py-4 px-4">
                              {getStatusBadge(categoria.status)}
                            </td>

                            <td className="py-4 px-4">
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 transition-colors duration-300"
                              >
                                {categoria.itens_count || 0} itens
                              </Badge>
                            </td>

                            <td className="py-4 px-4">
                              <motion.span
                                className="font-mono text-sm bg-gray-100 px-2 py-1 rounded transition-colors duration-300"
                                whileHover={{ scale: 1.05 }}
                              >
                                {categoria.ordem}
                              </motion.span>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <RiCalendarLine className="w-4 h-4 text-gray-400 transition-colors duration-300" />
                                <span className="text-sm text-gray-600">
                                  {new Date(
                                    categoria.created_at
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
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
                                    onClick={() => handleDeleteClick(categoria)}
                                    disabled={
                                      !!(
                                        categoria.itens_count &&
                                        categoria.itens_count > 0
                                      )
                                    }
                                    className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                                  >
                                    <RiDeleteBinLine className="w-3 h-3 mr-1" />
                                    Excluir
                                  </Button>
                                </motion.div>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
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
                  <RiAlertLine className="w-5 h-5" />
                  Confirmar Exclusão
                </DialogTitle>
                <DialogDescription>
                  {deleteDialog.categoria?.itens_count &&
                  deleteDialog.categoria.itens_count > 0 ? (
                    <>
                      Não é possível excluir a categoria{" "}
                      <strong>
                        &quot;{deleteDialog.categoria?.nome}&quot;
                      </strong>{" "}
                      porque existem{" "}
                      <strong>
                        {deleteDialog.categoria.itens_count} itens
                      </strong>{" "}
                      associados a ela.
                      <br />
                      <span className="text-red-600 font-medium">
                        Transfira ou exclua os itens antes de remover a
                        categoria.
                      </span>
                    </>
                  ) : (
                    <>
                      Tem certeza que deseja excluir a categoria{" "}
                      <strong>
                        &quot;{deleteDialog.categoria?.nome}&quot;
                      </strong>
                      ?
                      <br />
                      <span className="text-red-600 font-medium">
                        Esta ação não pode ser desfeita.
                      </span>
                    </>
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
                        categoria: null,
                        loading: false,
                      })
                    }
                    className="w-full border-gray-700 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                    disabled={deleteDialog.loading}
                  >
                    Cancelar
                  </Button>
                </motion.div>
                {!deleteDialog.categoria?.itens_count ||
                deleteDialog.categoria.itens_count === 0 ? (
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
                            <RiRefreshLine className="w-4 h-4 mr-2" />
                          </motion.div>
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <RiDeleteBinLine className="w-4 h-4 mr-2" />
                          Excluir Categoria
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : null}
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
