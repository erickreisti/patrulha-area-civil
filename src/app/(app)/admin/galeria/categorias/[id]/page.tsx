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

// Icons
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiRefreshLine,
  RiFolderLine,
  RiImageLine,
  RiVideoLine,
  RiAlertLine,
  RiCloseLine,
  RiCalendarLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine,
  RiArchiveLine,
} from "react-icons/ri";

// Actions & Store
import { getCategoriaById, updateCategoria } from "@/app/actions/gallery";
import { useAuthStore } from "@/lib/stores/useAuthStore";

// Tipagem
interface FormData {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  tipo: "fotos" | "videos";
  status: boolean;
  ordem: number;
  arquivada: boolean;
  created_at?: string;
  updated_at?: string;
  itens_count?: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function EditarCategoriaPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, hasAdminSession } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    id: "",
    nome: "",
    slug: "",
    descricao: "",
    tipo: "fotos",
    status: true,
    ordem: 0,
    arquivada: false,
  });

  const categoriaId = params.id as string;

  // 1. Verificar Permissões e Carregar Dados
  useEffect(() => {
    if (isAdmin === false || !hasAdminSession) {
      toast.error("Acesso negado.");
      router.push("/admin/galeria/categorias");
    }
  }, [isAdmin, hasAdminSession, router]);

  const fetchCategoria = useCallback(async () => {
    if (!categoriaId) return;
    try {
      setLoading(true);
      const result = await getCategoriaById(categoriaId);

      if (result.success && result.data) {
        const data = result.data;
        setFormData({
          id: data.id,
          nome: data.nome,
          slug: data.slug,
          descricao: data.descricao || "",
          tipo: data.tipo,
          status: data.status,
          ordem: data.ordem,
          arquivada: data.arquivada,
          created_at: data.created_at,
          updated_at: data.updated_at,
          itens_count: data.itens_count,
        });
      } else {
        toast.error(result.error || "Categoria não encontrada");
        router.push("/admin/galeria/categorias");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [categoriaId, router]);

  useEffect(() => {
    if (hasAdminSession) fetchCategoria();
  }, [fetchCategoria, hasAdminSession]);

  // 2. Handlers Genéricos
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (key: keyof FormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Normaliza slug (apenas letras minúsculas, números e hifens)
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setFormData((prev) => ({ ...prev, slug: val }));
  };

  // 3. Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.slug.trim()) {
      return toast.error("Nome e Slug são obrigatórios");
    }

    try {
      setSaving(true);
      const result = await updateCategoria(categoriaId, {
        ...formData,
        descricao: formData.descricao || null,
      });

      if (result.success) {
        toast.success("Categoria atualizada!");
        setTimeout(() => router.push("/admin/galeria/categorias"), 1000);
      } else {
        toast.error(result.error || "Erro ao atualizar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro interno ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <RiRefreshLine className="w-8 h-8 animate-spin text-navy-600" />
          <p className="text-gray-500">Carregando categoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 font-bebas tracking-wide">
              EDITAR CATEGORIA
            </h1>
            <p className="text-gray-600">ID: {formData.id}</p>
          </div>

          <Link href="/admin/galeria/categorias">
            <Button variant="outline">
              <RiArrowLeftLine className="mr-2" /> Voltar
            </Button>
          </Link>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <RiFolderLine className="text-navy-600" /> Dados Principais
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Categoria *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      maxLength={100}
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL) *</Label>
                    <div className="flex">
                      <span className="bg-gray-100 border border-r-0 rounded-l-md px-3 py-2 text-sm text-gray-500 flex items-center">
                        /galeria/
                      </span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        className="rounded-l-none font-mono text-sm"
                        required
                      />
                    </div>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <RiAlertLine /> Cuidado ao alterar o slug, links antigos
                      podem quebrar.
                    </p>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={500}
                    />
                  </div>

                  {/* Tipo e Ordem */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Tipo de Conteúdo</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(v: "fotos" | "videos") =>
                          setFormData((prev) => ({ ...prev, tipo: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fotos">
                            <div className="flex items-center gap-2">
                              <RiImageLine className="text-blue-500" /> Fotos
                            </div>
                          </SelectItem>
                          <SelectItem value="videos">
                            <div className="flex items-center gap-2">
                              <RiVideoLine className="text-purple-500" /> Vídeos
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ordem">Ordem de Exibição</Label>
                      <Input
                        id="ordem"
                        type="number"
                        min="0"
                        max="999"
                        value={formData.ordem}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ordem: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Botões Mobile/Desktop */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={saving}
                    >
                      {saving ? (
                        <RiRefreshLine className="animate-spin mr-2" />
                      ) : (
                        <RiSaveLine className="mr-2" />
                      )}
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={saving}
                    >
                      <RiCloseLine className="mr-2" /> Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              {/* Card de Info */}
              <Card className="mb-6 border-l-4 border-l-blue-500">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Itens vinculados:</span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      {formData.itens_count || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Criada em:</span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <RiCalendarLine className="w-3 h-3" />
                      {formData.created_at
                        ? new Date(formData.created_at).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Configurações */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visibilidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        {formData.status ? (
                          <RiEyeLine className="text-green-600" />
                        ) : (
                          <RiEyeOffLine className="text-gray-400" />
                        )}
                        Status Ativo
                      </Label>
                      <span className="text-xs text-gray-500">
                        {formData.status ? "Visível no site" : "Oculto"}
                      </span>
                    </div>
                    <Switch
                      checked={formData.status}
                      onCheckedChange={(c) => handleSwitchChange("status", c)}
                    />
                  </div>

                  {/* Arquivada */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        {formData.arquivada ? (
                          <RiArchiveLine className="text-amber-500" />
                        ) : (
                          <RiCheckLine className="text-gray-400" />
                        )}
                        Arquivada
                      </Label>
                      <span className="text-xs text-gray-500">
                        Mover para histórico
                      </span>
                    </div>
                    <Switch
                      checked={formData.arquivada}
                      onCheckedChange={(c) =>
                        handleSwitchChange("arquivada", c)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Card de Resumo (Preview) */}
              <Card className="mt-6 bg-gray-50 border-dashed">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                    Preview da Badge
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge
                      className={
                        formData.tipo === "fotos"
                          ? "bg-blue-600"
                          : "bg-purple-600"
                      }
                    >
                      {formData.tipo === "fotos" ? "Fotos" : "Vídeos"}
                    </Badge>
                    <Badge
                      variant={formData.status ? "default" : "destructive"}
                    >
                      {formData.status ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
