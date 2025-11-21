"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaVideo,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChartBar,
  FaHome,
  FaUser,
  FaFolder,
} from "react-icons/fa";

interface Categoria {
  id: string;
  nome: string;
  tipo: "fotos" | "videos";
  status: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
  itens_count?: number;
}

export default function CategoriasGaleriaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: "",
    tipo: "all",
    status: "all",
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoria: Categoria | null;
    loading: boolean;
  }>({
    open: false,
    categoria: null,
    loading: false,
  });

  const { success, error } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("galeria_categorias")
        .select(
          `
          *,
          galeria_itens(count)
        `
        )
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

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Processar dados para incluir contagem de itens
      const categoriasComContagem = (data || []).map((categoria) => ({
        ...categoria,
        itens_count: categoria.galeria_itens?.[0]?.count || 0,
      }));

      setCategorias(categoriasComContagem);
    } catch (err: any) {
      console.error("Erro ao carregar categorias:", err);
      error("Erro ao carregar categorias da galeria");
    } finally {
      setLoading(false);
    }
  };

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

      // Verificar se a categoria tem itens associados
      if (
        deleteDialog.categoria.itens_count &&
        deleteDialog.categoria.itens_count > 0
      ) {
        error(
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

      success("Categoria excluída com sucesso!");
      setDeleteDialog({ open: false, categoria: null, loading: false });
      fetchCategorias();
    } catch (err: any) {
      console.error("Erro ao excluir categoria:", err);
      error("Erro ao excluir categoria");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleFiltroChange = (key: string, value: string) => {
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
    setTimeout(() => fetchCategorias(), 100);
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "fotos" ? (
      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
        <FaImage className="w-3 h-3 mr-1" />
        Fotos
      </Badge>
    ) : (
      <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
        <FaVideo className="w-3 h-3 mr-1" />
        Vídeos
      </Badge>
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-600 hover:bg-green-700 text-white">
        <FaEye className="w-3 h-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-500 text-white">
        <FaEyeSlash className="w-3 h-3 mr-1" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              GERENCIAR CATEGORIAS DA GALERIA
            </h1>
            <p className="text-gray-600">
              Gerencie categorias para organizar fotos e vídeos da galeria
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                <FaChartBar className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/admin/galeria/itens">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaImage className="w-4 h-4 mr-2" />
                Ver Itens
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-700 hover:bg-slate-100"
              >
                <FaHome className="w-4 h-4 mr-2" />
                Voltar ao Site
              </Button>
            </Link>

            <Link href="/admin/galeria/categorias/criar">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <FaPlus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaFolder className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fotos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.fotos}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaImage className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vídeos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.videos}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaVideo className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.ativos}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaEye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-0 shadow-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaFilter className="w-5 h-5 text-navy" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={filtros.busca}
                    onChange={(e) =>
                      handleFiltroChange("busca", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Select
                  value={filtros.tipo}
                  onValueChange={(value) => handleFiltroChange("tipo", value)}
                >
                  <SelectTrigger>
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
                  onValueChange={(value) => handleFiltroChange("status", value)}
                >
                  <SelectTrigger>
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
              <Button
                onClick={aplicarFiltros}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FaFilter className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </Button>

              <Button
                variant="outline"
                onClick={limparFiltros}
                className="border-slate-700 text-slate-700 hover:bg-slate-100"
              >
                Limpar Filtros
              </Button>

              <div className="flex-1 text-right">
                <span className="text-sm text-gray-600">
                  {categorias.length} categorias encontradas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Categorias */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaFolder className="w-5 h-5 mr-2 text-navy" />
              Lista de Categorias ({categorias.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando categorias...</p>
              </div>
            ) : categorias.length === 0 ? (
              <div className="text-center py-8">
                <FaFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {Object.values(filtros).some(
                    (val) => val !== "" && val !== "all"
                  )
                    ? "Nenhuma categoria encontrada com os filtros aplicados"
                    : "Nenhuma categoria cadastrada"}
                </p>
                {!Object.values(filtros).some(
                  (val) => val !== "" && val !== "all"
                ) && (
                  <Link href="/admin/galeria/categorias/criar">
                    <Button className="bg-green-600 hover:bg-green-700 text-white mt-4">
                      <FaPlus className="w-4 h-4 mr-2" />
                      Adicionar Primeira Categoria
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Itens
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Ordem
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Criado em
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((categoria) => (
                      <tr
                        key={categoria.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FaFolder className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {categoria.nome}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {getTipoBadge(categoria.tipo)}
                        </td>

                        <td className="py-3 px-4">
                          {getStatusBadge(categoria.status)}
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700"
                          >
                            {categoria.itens_count || 0} itens
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {categoria.ordem}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(
                                categoria.created_at
                              ).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            <Link
                              href={`/admin/galeria/categorias/${categoria.id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                              >
                                <FaEdit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            </Link>

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
                              className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaTrash className="w-3 h-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

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
                <FaExclamationTriangle className="w-5 h-5" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription>
                {deleteDialog.categoria?.itens_count &&
                deleteDialog.categoria.itens_count > 0 ? (
                  <>
                    Não é possível excluir a categoria{" "}
                    <strong>"{deleteDialog.categoria?.nome}"</strong> porque
                    existem{" "}
                    <strong>{deleteDialog.categoria.itens_count} itens</strong>{" "}
                    associados a ela.
                    <br />
                    <span className="text-red-600 font-medium">
                      Transfira ou exclua os itens antes de remover a categoria.
                    </span>
                  </>
                ) : (
                  <>
                    Tem certeza que deseja excluir a categoria{" "}
                    <strong>"{deleteDialog.categoria?.nome}"</strong>?
                    <br />
                    <span className="text-red-600 font-medium">
                      Esta ação não pode ser desfeita.
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog({
                    open: false,
                    categoria: null,
                    loading: false,
                  })
                }
                className="flex-1 border-slate-700 text-slate-700 hover:bg-slate-100"
                disabled={deleteDialog.loading}
              >
                Cancelar
              </Button>
              {!deleteDialog.categoria?.itens_count ||
              deleteDialog.categoria.itens_count === 0 ? (
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={deleteDialog.loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteDialog.loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <FaTrash className="w-4 h-4 mr-2" />
                      Excluir Categoria
                    </>
                  )}
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
