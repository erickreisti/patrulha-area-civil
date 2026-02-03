"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiRefreshLine,
  RiImageLine,
  RiVideoLine,
  RiAlertLine,
  RiEyeLine,
  RiEyeOffLine,
  RiStarLine,
  RiCheckLine,
} from "react-icons/ri";

// Actions e Tipos
import { getItemById, updateItem } from "@/app/actions/gallery";
import { getCategoriasAdmin } from "@/app/actions/gallery";
import type { ItemGaleria, Categoria } from "@/app/actions/gallery";
import { useAuthStore } from "@/lib/stores/useAuthStore";

// ============================================
// TIPAGEM
// ============================================

interface FormData {
  titulo: string;
  descricao: string;
  tipo: "foto" | "video";
  categoria_id: string | null;
  status: boolean;
  destaque: boolean;
  ordem: number;
  arquivo_url: string;
  thumbnail_url?: string;
}

interface UpdateItemData {
  titulo: string;
  descricao: string;
  tipo: "foto" | "video";
  categoria_id: string | null;
  status: boolean;
  destaque: boolean;
  ordem: number;
  arquivo_file?: File;
  thumbnail_file?: File;
}

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function EditarItemPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, hasAdminSession } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<ItemGaleria | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Arquivos para upload
  const [novoArquivo, setNovoArquivo] = useState<File | null>(null);
  const [novaThumbnail, setNovaThumbnail] = useState<File | null>(null);

  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descricao: "",
    tipo: "foto",
    categoria_id: null,
    status: true,
    destaque: false,
    ordem: 0,
    arquivo_url: "",
  });

  const itemId = typeof params.id === "string" ? params.id : "";

  // 1. Verificar Permissões
  useEffect(() => {
    if (isAdmin === false || !hasAdminSession) {
      toast.error("Acesso negado.");
      router.push("/admin/galeria/itens");
    }
  }, [isAdmin, hasAdminSession, router]);

  // 2. Carregar Dados
  const fetchData = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const [itemRes, catRes] = await Promise.all([
        getItemById(itemId),
        getCategoriasAdmin({ status: "ativo" }),
      ]);

      if (itemRes.success && itemRes.data) {
        const d = itemRes.data;
        setItem(d);
        setFormData({
          titulo: d.titulo,
          descricao: d.descricao || "",
          tipo: d.tipo, // Aqui garantimos que o tipo vem do banco
          categoria_id: d.categoria_id,
          status: d.status,
          destaque: d.destaque,
          ordem: d.ordem,
          arquivo_url: d.arquivo_url,
          thumbnail_url: d.thumbnail_url || undefined,
        });
      } else {
        toast.error("Item não encontrado");
        router.push("/admin/galeria/itens");
      }

      if (catRes.success && catRes.data) {
        setCategorias(catRes.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [itemId, router]);

  useEffect(() => {
    if (hasAdminSession) fetchData();
  }, [fetchData, hasAdminSession]);

  // 3. Handlers de Arquivo
  const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNovoArquivo(file);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNovaThumbnail(file);
  };

  // 4. Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    // Validação básica
    if (!formData.titulo.trim()) {
      setErrors(["Título é obrigatório"]);
      setSaving(false);
      return;
    }

    try {
      // Prepara o objeto para a Server Action
      // A Server Action usará 'tipo' para decidir o bucket correto (galeria-fotos ou galeria-videos)
      const payload: UpdateItemData = {
        ...formData,
        arquivo_file: novoArquivo || undefined,
        thumbnail_file: novaThumbnail || undefined,
      };

      const res = await updateItem(itemId, payload);

      if (res.success) {
        setShowSuccess(true);
        toast.success("Item atualizado!");
        setTimeout(() => router.push("/admin/galeria/itens"), 1500);
      } else {
        setErrors([res.error || "Erro ao salvar"]);
        toast.error("Erro ao salvar");
      }
    } catch (error) {
      console.error(error);
      setErrors(["Erro interno"]);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RiRefreshLine className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );

  if (!item) return null;

  // Filtrar categorias para mostrar apenas as compatíveis com o tipo do item
  const categoriasFiltradas = categorias.filter(
    (c) =>
      (c.tipo === "fotos" && formData.tipo === "foto") ||
      (c.tipo === "videos" && formData.tipo === "video"),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Editar Item</h1>
              <p className="text-gray-500">ID: {item.id}</p>
            </div>
            <Link href="/admin/galeria/itens">
              <Button variant="outline">
                <RiArrowLeftLine className="mr-2" /> Voltar
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feedback de Erro/Sucesso */}
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-center gap-3 text-red-800">
                <RiAlertLine className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Erro ao salvar:</p>
                  <ul className="list-disc list-inside text-sm">
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 flex items-center gap-3 text-green-800">
                <RiCheckLine className="w-5 h-5" />
                <p>Salvo com sucesso! Redirecionando...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Coluna Principal (Formulário) */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiImageLine className="text-blue-600" /> Detalhes do Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        titulo: e.target.value,
                      }))
                    }
                    placeholder="Título do item"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                </div>

                {/* Tipo e Categoria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Mídia</Label>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                      {formData.tipo === "foto" ? (
                        <RiImageLine />
                      ) : (
                        <RiVideoLine />
                      )}
                      <span className="capitalize">{formData.tipo}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Fixo
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      O tipo de mídia não pode ser alterado após criação.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={formData.categoria_id || "sem_categoria"}
                      onValueChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          categoria_id: v === "sem_categoria" ? null : v,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sem_categoria">
                          Sem Categoria
                        </SelectItem>
                        {categoriasFiltradas.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Área de Arquivo */}
                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-lg">Arquivo de Mídia</Label>

                  {/* Arquivo Atual */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded border">
                        {formData.tipo === "foto" ? (
                          <RiImageLine />
                        ) : (
                          <RiVideoLine />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          Arquivo Atual
                        </p>
                        <a
                          href={formData.arquivo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                        >
                          Visualizar arquivo
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Substituir Arquivo */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">
                      Substituir Arquivo (Opcional)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept={
                          formData.tipo === "foto" ? "image/*" : "video/*"
                        }
                        onChange={handleArquivoChange}
                      />
                      {novoArquivo && (
                        <RiCheckLine className="text-green-600" />
                      )}
                    </div>
                  </div>

                  {/* Thumbnail (Apenas Vídeo) */}
                  {formData.tipo === "video" && (
                    <div className="space-y-2 pt-2">
                      <Label>Thumbnail (Opcional)</Label>
                      {formData.thumbnail_url && (
                        <p className="text-xs text-gray-500 mb-1">
                          Atual:{" "}
                          <a
                            href={formData.thumbnail_url}
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            Link
                          </a>
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                        />
                        {novaThumbnail && (
                          <RiCheckLine className="text-green-600" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar (Configurações) */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Switch */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      {formData.status ? (
                        <RiEyeLine className="text-green-600" />
                      ) : (
                        <RiEyeOffLine className="text-gray-400" />
                      )}
                      Status
                    </Label>
                    <span className="text-xs text-gray-500">
                      {formData.status ? "Visível no site" : "Oculto"}
                    </span>
                  </div>
                  <Switch
                    checked={formData.status}
                    onCheckedChange={(c) =>
                      setFormData((prev) => ({ ...prev, status: c }))
                    }
                  />
                </div>

                {/* Destaque Switch */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <RiStarLine
                        className={
                          formData.destaque
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }
                      />
                      Destaque
                    </Label>
                    <span className="text-xs text-gray-500">
                      Exibir na home
                    </span>
                  </div>
                  <Switch
                    checked={formData.destaque}
                    onCheckedChange={(c) =>
                      setFormData((prev) => ({ ...prev, destaque: c }))
                    }
                  />
                </div>

                {/* Ordem Input */}
                <div className="space-y-2">
                  <Label>Ordem de Exibição</Label>
                  <Input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ordem: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Criado em:</span>
                    <span>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <span className="font-mono">{item.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700"
              disabled={saving}
            >
              {saving ? (
                <>
                  <RiRefreshLine className="mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <RiSaveLine className="mr-2" /> Salvar Alterações
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/admin/galeria/itens")}
              disabled={saving}
            >
              Cancelar
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
