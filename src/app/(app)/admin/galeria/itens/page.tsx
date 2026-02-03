"use client";

import { useState, useEffect, useCallback } from "react";
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
  RiSearchFill,
  RiCalendarFill,
  RiRefreshFill,
  RiAlertFill,
  RiStarFill,
} from "react-icons/ri";

import {
  type Item,
  type Categoria,
  type TipoItemFilter,
  type StatusFilter,
  deleteItem,
  getItensAdmin,
  getCategoriasAdmin,
} from "@/app/actions/gallery";

// Interfaces
interface Filtros {
  busca: string;
  categoria: string;
  tipo: TipoItemFilter;
  status: StatusFilter;
}

interface DeleteDialogState {
  open: boolean;
  item: Item | null;
  loading: boolean;
}

// Componente ImageThumbnail
const ImageThumbnail = ({
  src,
  alt,
  tipo,
}: {
  src: string | null;
  alt: string;
  tipo: "foto" | "video";
}) => {
  const [imageError, setImageError] = useState(false);

  if (tipo === "video") {
    return (
      <div className="w-12 h-12 rounded flex items-center justify-center bg-purple-100 flex-shrink-0">
        <RiVideoFill className="w-6 h-6 text-purple-500" />
      </div>
    );
  }

  if (!src || imageError) {
    return (
      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
        <RiImageFill className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded overflow-hidden relative bg-gray-200 flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        width={48}
        height={48}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default function ItensGaleriaPage() {
  const [itens, setItens] = useState<Item[]>([]);
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

  // Buscar Itens
  const fetchItens = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getItensAdmin({
        search: filtros.busca || undefined,
        categoria_id:
          filtros.categoria !== "all" ? filtros.categoria : undefined,
        tipo: filtros.tipo !== "all" ? filtros.tipo : undefined,
        status: filtros.status !== "all" ? filtros.status : undefined,
      });

      if (result.success && result.data) {
        setItens(result.data);
      } else {
        toast.error(result.error || "Erro ao carregar itens");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar itens");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtros]);

  // Buscar Categorias (para o filtro)
  const fetchCategorias = useCallback(async () => {
    try {
      const result = await getCategoriasAdmin({ status: "ativo" });
      if (result.success && result.data) {
        setCategorias(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchItens();
    fetchCategorias();
  }, [fetchItens, fetchCategorias]);

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;

    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }));
      const result = await deleteItem(deleteDialog.item.id);

      if (result.success) {
        toast.success("Item excluído com sucesso!");
        setDeleteDialog({ open: false, item: null, loading: false });
        fetchItens(); // Refresh list
      } else {
        toast.error(result.error || "Erro ao excluir item");
        setDeleteDialog((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir item");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItens();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Itens da Galeria</h1>
          <p className="text-gray-500 text-sm">
            Gerencie todas as mídias cadastradas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RiRefreshFill
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <Link href="/admin/galeria/itens/criar">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <RiAddFill className="w-4 h-4 mr-2" /> Novo Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <RiSearchFill className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por título..."
                className="pl-9"
                value={filtros.busca}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, busca: e.target.value }))
                }
              />
            </div>

            <Select
              value={filtros.categoria}
              onValueChange={(v) =>
                setFiltros((prev) => ({ ...prev, categoria: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filtros.tipo}
              onValueChange={(v) =>
                setFiltros((prev) => ({ ...prev, tipo: v as TipoItemFilter }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="foto">Fotos</SelectItem>
                <SelectItem value="video">Vídeos</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.status}
              onValueChange={(v) =>
                setFiltros((prev) => ({ ...prev, status: v as StatusFilter }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RiImageFill className="text-gray-500" />
            Lista de Itens ({itens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <Skeleton className="w-12 h-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : itens.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <RiImageFill className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Nenhum item encontrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {itens.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ImageThumbnail
                      src={item.thumbnail_url || item.arquivo_url}
                      alt={item.titulo}
                      tipo={item.tipo}
                    />

                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {item.titulo}
                        </h4>
                        {item.destaque && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          >
                            <RiStarFill className="w-3 h-3 mr-1" /> Destaque
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          {item.tipo === "foto" ? (
                            <RiImageFill className="w-3 h-3" />
                          ) : (
                            <RiVideoFill className="w-3 h-3" />
                          )}
                          {item.tipo === "foto" ? "Foto" : "Vídeo"}
                        </span>
                        <span>•</span>
                        <span
                          className={
                            item.status ? "text-green-600" : "text-gray-400"
                          }
                        >
                          {item.status ? "Ativo" : "Inativo"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <RiCalendarFill className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/galeria/itens/${item.id}`}>
                        <Button variant="ghost" size="icon">
                          <RiEditFill className="w-4 h-4 text-blue-600" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-50"
                        onClick={() =>
                          setDeleteDialog({ open: true, item, loading: false })
                        }
                      >
                        <RiDeleteBinFill className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Exclusão */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog((prev) => ({ ...prev, open: false }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <RiAlertFill /> Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o item{" "}
              <strong>{deleteDialog.item?.titulo}</strong>?
              <br />
              Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog((prev) => ({ ...prev, open: false }))
              }
              disabled={deleteDialog.loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDialog.loading}
            >
              {deleteDialog.loading ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
