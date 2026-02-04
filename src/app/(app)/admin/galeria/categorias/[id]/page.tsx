"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

// UI Components
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
  RiArchiveLine,
  RiInformationLine,
  RiCheckLine,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
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

  // 1. Verificar Permissões
  useEffect(() => {
    if (isAdmin === false || !hasAdminSession) {
      toast.error("Acesso negado.");
      router.push("/admin/galeria/categorias");
    }
  }, [isAdmin, hasAdminSession, router]);

  // 2. Carregar Dados
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

  // 3. Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setFormData((prev) => ({ ...prev, slug: val }));
  };

  const handleSwitchChange = (key: keyof FormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked }));
  };

  // 4. Submit
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
        toast.success("Categoria atualizada com sucesso!");
        router.push("/admin/galeria/categorias");
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
      <div className="min-h-screen bg-slate-50/50 py-10 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RiRefreshLine className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="text-slate-500 font-medium">
            Carregando dados da categoria...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-bebas">
              EDITAR CATEGORIA
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-slate-500 border-slate-300 bg-white font-mono text-[10px]"
              >
                ID: {formData.id.split("-")[0]}...
              </Badge>
              <span className="text-slate-400 text-sm">•</span>
              <p className="text-slate-500 font-medium text-sm">
                Editando:{" "}
                <span className="text-slate-700 font-bold">
                  {formData.nome}
                </span>
              </p>
            </div>
          </div>

          <Link href="/admin/galeria/categorias">
            <Button
              variant="outline"
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              <RiArrowLeftLine className="mr-2" /> Voltar
            </Button>
          </Link>
        </motion.div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Coluna Principal (Formulário) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <RiFolderLine className="text-emerald-600" /> Informações
                  Básicas
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-slate-700">
                    Nome da Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: Treinamentos 2024"
                    maxLength={100}
                    required
                    className="h-11 border-slate-200 focus-visible:ring-emerald-500/20"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-slate-700">
                    Slug (URL) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex shadow-sm rounded-md">
                    <span className="bg-slate-50 border border-r-0 border-slate-200 rounded-l-md px-3 flex items-center text-sm text-slate-500 font-medium min-w-fit">
                      /galeria/
                    </span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      className="rounded-l-none font-mono text-sm h-11 border-slate-200 focus-visible:ring-emerald-500/20"
                      required
                    />
                  </div>
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-1 font-medium bg-amber-50 p-2 rounded border border-amber-100 w-fit">
                    <RiAlertLine /> Alterar o slug pode quebrar links externos
                    existentes.
                  </p>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="descricao" className="text-slate-700">
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={500}
                    className="resize-none border-slate-200 focus-visible:ring-emerald-500/20 min-h-[100px]"
                    placeholder="Descreva o conteúdo desta categoria..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Tipo */}
                  <div className="space-y-3">
                    <Label className="text-slate-700">Tipo de Conteúdo</Label>
                    <Select
                      value={formData.tipo}
                      // ✅ CORREÇÃO: Cast explícito para evitar erro de string vs literal
                      onValueChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          tipo: v as "fotos" | "videos",
                        }))
                      }
                    >
                      <SelectTrigger className="h-11 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fotos">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 rounded text-blue-600">
                              <RiImageLine />
                            </div>
                            <span>Álbum de Fotos</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="videos">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-purple-100 rounded text-purple-600">
                              <RiVideoLine />
                            </div>
                            <span>Galeria de Vídeos</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ordem */}
                  <div className="space-y-3">
                    <Label htmlFor="ordem" className="text-slate-700">
                      Ordem de Exibição
                    </Label>
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
                      className="h-11 border-slate-200"
                    />
                  </div>
                </div>
              </CardContent>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  disabled={saving}
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-200/50"
                >
                  <RiCloseLine className="mr-2" /> Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md shadow-emerald-100 transition-all hover:translate-y-[-1px]"
                >
                  {saving ? (
                    <>
                      <RiRefreshLine className="animate-spin mr-2" />{" "}
                      Salvando...
                    </>
                  ) : (
                    <>
                      <RiSaveLine className="mr-2" /> Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Coluna Lateral */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Card de Informações */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="bg-slate-50/50 border-b border-slate-100 p-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  Status da Categoria
                </h3>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-2">
                    <RiFolderLine /> Total de Itens
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 font-bold border-blue-100"
                  >
                    {formData.itens_count || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-2">
                    <RiCalendarLine /> Criado em
                  </span>
                  <span className="font-medium text-slate-700">
                    {formData.created_at
                      ? new Date(formData.created_at).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-slate-500 flex items-center gap-2">
                    <RiRefreshLine /> Atualizado em
                  </span>
                  <span className="font-medium text-slate-700">
                    {formData.updated_at
                      ? new Date(formData.updated_at).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Card de Visibilidade */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="bg-slate-50/50 border-b border-slate-100 p-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  Visibilidade
                </h3>
              </div>
              <CardContent className="p-5 space-y-6">
                {/* Status Switch */}
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-slate-700 cursor-pointer font-semibold">
                      {formData.status ? (
                        <RiEyeLine className="text-emerald-500" />
                      ) : (
                        <RiEyeOffLine className="text-slate-400" />
                      )}
                      Status Ativo
                    </Label>
                    <p className="text-xs text-slate-500">
                      {formData.status
                        ? "Visível no site."
                        : "Oculto (Rascunho)."}
                    </p>
                  </div>
                  <Switch
                    checked={formData.status}
                    onCheckedChange={(c) => handleSwitchChange("status", c)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Arquivada Switch */}
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-slate-700 cursor-pointer font-semibold">
                      {formData.arquivada ? (
                        <RiArchiveLine className="text-amber-500" />
                      ) : (
                        <RiCheckLine className="text-slate-400" />
                      )}
                      Arquivada
                    </Label>
                    <p className="text-xs text-slate-500">
                      Mover para histórico antigo.
                    </p>
                  </div>
                  <Switch
                    checked={formData.arquivada}
                    onCheckedChange={(c) => handleSwitchChange("arquivada", c)}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card de Preview */}
            <Card className="border-l-4 border-l-blue-500 shadow-md bg-blue-50/30">
              <CardContent className="p-5 space-y-3">
                <div className="flex gap-3">
                  <div className="mt-0.5 p-1 bg-blue-100 text-blue-600 rounded-full h-fit shadow-sm">
                    <RiInformationLine size={16} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-blue-900 text-sm">
                      Preview da Categoria
                    </h4>
                    <div className="flex gap-2 mt-2">
                      <Badge
                        className={`border-0 ${formData.tipo === "fotos" ? "bg-blue-600" : "bg-purple-600"}`}
                      >
                        {formData.tipo === "fotos" ? "Fotos" : "Vídeos"}
                      </Badge>
                      <Badge
                        variant={formData.status ? "default" : "destructive"}
                      >
                        {formData.status ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
