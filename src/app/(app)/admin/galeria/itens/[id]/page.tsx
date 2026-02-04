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
  RiImageLine,
  RiVideoLine,
  RiFolderLine,
  RiEyeLine,
  RiEyeOffLine,
  RiStarLine,
  RiCheckLine,
  RiLoader4Line,
} from "react-icons/ri";

// Actions & Store
import {
  getItemById,
  updateItem,
  getCategoriasAdmin,
} from "@/app/actions/gallery";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import type { Item, Categoria } from "@/app/actions/gallery/types";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function EditarItemPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, hasAdminSession } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [item, setItem] = useState<Item | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

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

  const itemId = params.id as string;

  // 1. Permissões
  useEffect(() => {
    if (isAdmin === false || !hasAdminSession) {
      toast.error("Acesso negado.");
      router.push("/admin/galeria/itens");
    }
  }, [isAdmin, hasAdminSession, router]);

  // 2. Data Fetching
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
          tipo: d.tipo,
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

  // 3. Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.titulo.trim()) {
      toast.error("Título é obrigatório");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria_id: formData.categoria_id,
        status: formData.status,
        destaque: formData.destaque,
        ordem: formData.ordem,
        // Arquivos são opcionais na edição
        arquivo_file: novoArquivo || undefined,
        thumbnail_file: novaThumbnail || undefined,
      };

      const res = await updateItem(itemId, payload);

      if (res.success) {
        toast.success("Item atualizado com sucesso!");
        router.push("/admin/galeria/itens");
      } else {
        toast.error(res.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro interno");
    } finally {
      setSaving(false);
    }
  };

  // Filtra categorias compatíveis
  const categoriasCompativeis = categorias.filter(
    (c) =>
      (c.tipo === "fotos" && formData.tipo === "foto") ||
      (c.tipo === "videos" && formData.tipo === "video"),
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <RiLoader4Line className="animate-spin w-10 h-10 text-emerald-600" />
          <p className="text-slate-500 font-medium">Carregando dados...</p>
        </div>
      </div>
    );

  if (!item) return null;

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
              EDITAR MÍDIA
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-slate-500 border-slate-300 bg-white font-mono text-[10px]"
              >
                ID: {item.id.split("-")[0]}...
              </Badge>
              <span className="text-slate-400 text-sm">•</span>
              <p className="text-slate-500 font-medium text-sm">
                Editando:{" "}
                <span className="text-slate-700 font-bold">
                  {formData.titulo}
                </span>
              </p>
            </div>
          </div>
          <Link href="/admin/galeria/itens">
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
          {/* Principal */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <RiFolderLine className="text-emerald-600" /> Detalhes Básicos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    className="h-11 border-slate-200 focus-visible:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <div className="flex items-center gap-2 h-11 px-3 border rounded-md bg-slate-50 text-slate-500">
                      {formData.tipo === "foto" ? (
                        <RiImageLine />
                      ) : (
                        <RiVideoLine />
                      )}
                      <span className="capitalize">{formData.tipo}</span>
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        Fixo
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={formData.categoria_id || "sem_categoria"}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          categoria_id: v === "sem_categoria" ? null : v,
                        })
                      }
                    >
                      <SelectTrigger className="h-11 border-slate-200">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sem_categoria">
                          Sem Categoria
                        </SelectItem>
                        {categoriasCompativeis.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    rows={3}
                    className="resize-none border-slate-200 focus-visible:ring-emerald-500/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mídia */}
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold text-slate-800">
                  Arquivo de Mídia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center text-slate-400">
                    {formData.tipo === "foto" ? (
                      <RiImageLine size={24} />
                    ) : (
                      <RiVideoLine size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 mb-1">
                      Arquivo Atual
                    </p>
                    <a
                      href={formData.arquivo_url}
                      target="_blank"
                      className="text-xs text-blue-600 hover:underline truncate block"
                    >
                      {formData.arquivo_url}
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Substituir Arquivo (Opcional)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept={formData.tipo === "foto" ? "image/*" : "video/*"}
                      onChange={(e) =>
                        setNovoArquivo(e.target.files?.[0] || null)
                      }
                      className="file:text-emerald-700 file:bg-emerald-50 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-3 file:text-sm file:font-semibold hover:file:bg-emerald-100 cursor-pointer"
                    />
                    {novoArquivo && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
                        <RiCheckLine className="mr-1 w-3 h-3" /> Novo
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Thumbnail para Vídeo */}
                {formData.tipo === "video" && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 mt-4">
                    <Label className="block mb-1">Thumbnail (Opcional)</Label>
                    {formData.thumbnail_url && !novaThumbnail && (
                      <p className="text-xs text-slate-500 mb-2">
                        Possui capa personalizada.
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setNovaThumbnail(e.target.files?.[0] || null)
                        }
                        className="file:text-purple-700 file:bg-purple-50 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-3 file:text-sm file:font-semibold hover:file:bg-purple-100 cursor-pointer"
                      />
                      {novaThumbnail && (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">
                          <RiCheckLine className="mr-1 w-3 h-3" /> Nova Capa
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Configurações */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4">
                <CardTitle className="text-sm font-bold uppercase text-slate-700 tracking-wide">
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      {formData.status ? (
                        <RiEyeLine className="text-emerald-500" />
                      ) : (
                        <RiEyeOffLine className="text-slate-400" />
                      )}
                      Status Ativo
                    </Label>
                    <p className="text-xs text-slate-500">
                      Visível na galeria pública
                    </p>
                  </div>
                  <Switch
                    checked={formData.status}
                    onCheckedChange={(c) =>
                      setFormData({ ...formData, status: c })
                    }
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <RiStarLine
                        className={
                          formData.destaque
                            ? "text-amber-500"
                            : "text-slate-400"
                        }
                      />
                      Destaque
                    </Label>
                    <p className="text-xs text-slate-500">
                      Exibir na home page
                    </p>
                  </div>
                  <Switch
                    checked={formData.destaque}
                    onCheckedChange={(c) =>
                      setFormData({ ...formData, destaque: c })
                    }
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ordem: Number(e.target.value),
                      })
                    }
                    className="h-11 border-slate-200"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all hover:translate-y-[-1px]"
            >
              {saving ? (
                <>
                  <RiLoader4Line className="mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <RiSaveLine className="mr-2" /> Salvar Alterações
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
