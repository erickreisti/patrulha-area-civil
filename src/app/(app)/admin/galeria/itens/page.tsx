"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import Image from "next/image";
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
} from "react-icons/fa";

interface GaleriaItem {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: "foto" | "video";
  arquivo_url: string;
  thumbnail_url: string | null;
  categoria_id: string;
  status: boolean;
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

// Componente de Imagem com Placeholder Robusto
interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  tipo: "foto" | "video";
  className?: string;
}

function ImageWithFallback({
  src,
  alt,
  tipo,
  className = "",
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reset states quando a src mudar
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [src]);

  // Se for vídeo ou não tiver src, mostra apenas ícone
  if (tipo === "video" || !src) {
    return (
      <div
        className={`w-12 h-12 rounded flex items-center justify-center ${
          tipo === "video" ? "bg-purple-100" : "bg-gray-200"
        } ${className}`}
      >
        <FaVideo className="w-6 h-6 text-purple-500" />
      </div>
    );
  }

  // Se houve erro ou imagem está quebrada
  if (imageError) {
    return (
      <div
        className={`w-12 h-12 rounded bg-gray-200 flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <FaImage className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <span className="text-xs text-gray-500 block">Erro</span>
        </div>
      </div>
    );
  }

  // Tenta carregar a imagem
  return (
    <div
      className={`w-12 h-12 rounded overflow-hidden relative bg-gray-200 ${className}`}
    >
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={48}
        height={48}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        priority={false}
        loading="lazy"
      />
    </div>
  );
}

export default function ItensGaleriaPage() {
  const [itens, setItens] = useState<GaleriaItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: "",
    categoria: "all",
    tipo: "all",
    status: "all",
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: GaleriaItem | null;
    loading: boolean;
  }>({
    open: false,
    item: null,
    loading: false,
  });

  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchItens();
    fetchCategorias();
  }, []);

  const fetchItens = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("galeria_itens")
        .select(
          `
          *,
          galeria_categorias!inner(nome, tipo)
        `
        )
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });

      // Aplicar filtros
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
    } catch (error: any) {
      console.error("Erro ao carregar itens:", error);
      toast.error("Erro ao carregar itens da galeria");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("galeria_categorias")
        .select("id, nome, tipo")
        .eq("status", true)
        .order("ordem", { ascending: true });

      if (error) throw error;

      setCategorias(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

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
    } catch (error: any) {
      console.error("Erro ao excluir item:", error);
      toast.error("Erro ao excluir item");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleFiltroChange = (key: string, value: string) => {
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
    setTimeout(() => fetchItens(), 100);
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "foto" ? (
      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
        <FaImage className="w-3 h-3 mr-1" />
        Foto
      </Badge>
    ) : (
      <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
        <FaVideo className="w-3 h-3 mr-1" />
        Vídeo
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
    total: itens.length,
    fotos: itens.filter((i) => i.tipo === "foto").length,
    videos: itens.filter((i) => i.tipo === "video").length,
    ativos: itens.filter((i) => i.status).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              GERENCIAR ITENS DA GALERIA
            </h1>
            <p className="text-gray-600">
              Gerencie fotos e vídeos da galeria da Patrulha Aérea Civil
            </p>
          </div>

          {/* Botões de Navegação */}
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

            <Link href="/perfil">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaUser className="w-4 h-4 mr-2" />
                Meu Perfil
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

            <Link href="/admin/galeria/itens/criar">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <FaPlus className="w-4 h-4 mr-2" />
                Novo Item
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
                  <FaImage className="w-6 h-6 text-blue-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Busca */}
              <div className="md:col-span-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por título..."
                    value={filtros.busca}
                    onChange={(e) =>
                      handleFiltroChange("busca", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <Select
                  value={filtros.categoria}
                  onValueChange={(value) =>
                    handleFiltroChange("categoria", value)
                  }
                >
                  <SelectTrigger>
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

              {/* Tipo */}
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
                    <SelectItem value="foto">Fotos</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
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

            {/* Botões de Ação dos Filtros */}
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
                  {itens.length} itens encontrados
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Itens */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaImage className="w-5 h-5 mr-2 text-navy" />
              Lista de Itens ({itens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando itens...</p>
              </div>
            ) : itens.length === 0 ? (
              <div className="text-center py-8">
                <FaImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {Object.values(filtros).some(
                    (val) => val !== "" && val !== "all"
                  )
                    ? "Nenhum item encontrado com os filtros aplicados"
                    : "Nenhum item cadastrado na galeria"}
                </p>
                {!Object.values(filtros).some(
                  (val) => val !== "" && val !== "all"
                ) && (
                  <Link href="/admin/galeria/itens/criar">
                    <Button className="bg-green-600 hover:bg-green-700 text-white mt-4">
                      <FaPlus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Item
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-start space-x-3">
                            <ImageWithFallback
                              src={item.thumbnail_url}
                              alt={item.titulo}
                              tipo={item.tipo}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-800 truncate">
                                {item.titulo}
                              </p>
                              {item.descricao && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {item.descricao}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700"
                          >
                            {item.galeria_categorias?.nome || "N/A"}
                          </Badge>
                        </TableCell>

                        <TableCell>{getTipoBadge(item.tipo)}</TableCell>

                        <TableCell>{getStatusBadge(item.status)}</TableCell>

                        <TableCell>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {item.ordem}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(item.created_at).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            <Link href={`/admin/galeria/itens/${item.id}`}>
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
                              onClick={() => handleDeleteClick(item)}
                              className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <FaTrash className="w-3 h-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                Tem certeza que deseja excluir o item{" "}
                <strong>"{deleteDialog.item?.titulo}"</strong>?
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
                  setDeleteDialog({ open: false, item: null, loading: false })
                }
                className="flex-1 border-slate-700 text-slate-700 hover:bg-slate-100"
                disabled={deleteDialog.loading}
              >
                Cancelar
              </Button>
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
                    Excluir Item
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
