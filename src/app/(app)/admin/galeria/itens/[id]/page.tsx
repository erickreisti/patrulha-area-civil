"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  RiEyeLine,
  RiEyeOffLine,
  RiStarLine,
  RiCheckLine,
  RiLoader4Line,
  RiUploadCloud2Line,
  RiFileTextLine,
  RiSettings3Line,
  RiImageAddLine,
  RiVideoAddLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiAlertLine,
} from "react-icons/ri";

// Actions & Store
import {
  getItemById,
  updateItem,
  getCategoriasAdmin,
} from "@/app/actions/gallery";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import type { Item, Categoria } from "@/app/actions/gallery/types";

interface FormDataState {
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function EditarItemPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, hasAdminSession, initialize: initAuth } = useAuthStore();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [item, setItem] = useState<Item | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Estados de Upload
  const [novoArquivo, setNovoArquivo] = useState<File | null>(null);
  const [novaThumbnail, setNovaThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState<FormDataState>({
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

  // Inicialização Auth
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await initAuth();
      } catch (error) {
        console.error("Erro auth:", error);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [initAuth]);

  // Proteção
  useEffect(() => {
    if (checkingAuth) return;
    if (!isAdmin && !hasAdminSession) {
      toast.error("Acesso negado.");
      router.replace("/admin/galeria/itens");
    }
  }, [checkingAuth, isAdmin, hasAdminSession, router]);

  // Carregar Dados
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
        // Define o preview inicial com a imagem existente
        if (d.tipo === "foto") {
          setPreviewUrl(d.arquivo_url);
        }
      } else {
        toast.error("Item não encontrado");
        router.push("/admin/galeria/itens");
      }

      if (catRes.success && catRes.data) {
        setCategorias(catRes.data);
      }
    } catch (error) {
      console.error("Erro fetch:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [itemId, router]);

  useEffect(() => {
    if (!checkingAuth && (isAdmin || hasAdminSession)) {
      fetchData();
    }
  }, [checkingAuth, isAdmin, hasAdminSession, fetchData]);

  // --- Handlers de Arquivo ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;

    const isVideo = formData.tipo === "video";
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    const maxSizeLabel = isVideo ? "100MB" : "10MB";

    if (isVideo && !file.type.startsWith("video/")) {
      return toast.error("Selecione um arquivo de vídeo válido.");
    }
    if (!isVideo && !file.type.startsWith("image/")) {
      return toast.error("Selecione um arquivo de imagem válido.");
    }

    if (file.size > maxSize) {
      return toast.error(`Arquivo muito grande. Limite: ${maxSizeLabel}`);
    }

    setNovoArquivo(file);

    // Atualiza preview se for foto
    if (formData.tipo === "foto") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null); // Vídeo não tem preview local simples
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleRemoveNewFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNovoArquivo(null);
    // Restaura o preview original se for foto
    if (formData.tipo === "foto") {
      setPreviewUrl(formData.arquivo_url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNovaThumbnail(file);
  };

  // --- Submit ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.titulo.trim()) {
      toast.error("Título é obrigatório");
      setSaving(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("titulo", formData.titulo);
      data.append("descricao", formData.descricao);
      data.append("tipo", formData.tipo);
      data.append("categoria_id", formData.categoria_id || "");
      data.append("ordem", String(formData.ordem));
      data.append("status", String(formData.status));
      data.append("destaque", String(formData.destaque));

      if (novoArquivo) data.append("arquivo_file", novoArquivo);
      if (novaThumbnail) data.append("thumbnail_file", novaThumbnail);

      const res = await updateItem(itemId, data);

      if (res.success) {
        toast.success("Item atualizado com sucesso!");
        router.push("/admin/galeria/itens");
      } else {
        toast.error(res.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro crítico:", error);
      toast.error("Erro interno");
    } finally {
      setSaving(false);
    }
  };

  const categoriasCompativeis = categorias.filter(
    (c) =>
      (c.tipo === "fotos" && formData.tipo === "foto") ||
      (c.tipo === "videos" && formData.tipo === "video"),
  );

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <RiLoader4Line className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-slate-500 font-medium animate-pulse">
          {checkingAuth ? "Verificando permissões..." : "Carregando dados..."}
        </p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight font-bebas mb-1">
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
          {/* Coluna Principal */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            {/* Card de Arquivo (Visual Novo) */}
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                  <RiUploadCloud2Line className="text-emerald-600 w-5 h-5" />
                  Arquivo de Mídia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* --- SEÇÃO DO ARQUIVO ATUAL E UPLOAD --- */}
                {/* Visualização de Tipo (Apenas Informativo) */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`relative overflow-hidden rounded-xl p-4 flex flex-col items-center justify-center gap-3 border-2 transition-all opacity-100 cursor-default ${
                      formData.tipo === "foto"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm"
                        : "border-slate-100 bg-slate-50 text-slate-400 opacity-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full ${
                        formData.tipo === "foto"
                          ? "bg-emerald-100"
                          : "bg-slate-200"
                      }`}
                    >
                      <RiImageLine className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wide">
                      Foto
                    </span>
                    {formData.tipo === "foto" && (
                      <div className="absolute top-3 right-3 text-emerald-600">
                        <RiCheckLine />
                      </div>
                    )}
                  </div>

                  <div
                    className={`relative overflow-hidden rounded-xl p-4 flex flex-col items-center justify-center gap-3 border-2 transition-all opacity-100 cursor-default ${
                      formData.tipo === "video"
                        ? "border-purple-500 bg-purple-50/50 text-purple-700 shadow-sm"
                        : "border-slate-100 bg-slate-50 text-slate-400 opacity-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full ${
                        formData.tipo === "video"
                          ? "bg-purple-100"
                          : "bg-slate-200"
                      }`}
                    >
                      <RiVideoLine className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wide">
                      Vídeo
                    </span>
                    {formData.tipo === "video" && (
                      <div className="absolute top-3 right-3 text-purple-600">
                        <RiCheckLine />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropzone / Preview Area */}
                <div
                  className={`relative group w-full min-h-[320px] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 text-center ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/30 scale-[1.01]"
                      : novoArquivo
                        ? "border-emerald-200 bg-emerald-50/10"
                        : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    accept={formData.tipo === "foto" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                  />

                  {/* Container de Preview (Atual ou Novo) */}
                  <div className="flex flex-col items-center w-full h-full z-10 relative pointer-events-none">
                    {/* --- PREVIEW DE FOTO --- */}
                    {formData.tipo === "foto" && previewUrl ? (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-sm border border-slate-200 bg-white group-hover:shadow-md transition-shadow">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          // ✅ FIX 1: Sizes para otimização
                          sizes="(max-width: 768px) 100vw, 600px"
                          // ✅ FIX 2: Priority para LCP
                          priority
                          className="object-contain"
                        />
                        {/* Overlay "Trocar Imagem" */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-medium flex items-center gap-2">
                            <RiImageAddLine /> Arraste ou clique para trocar
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* --- PREVIEW DE VÍDEO --- */}
                    {formData.tipo === "video" && (
                      <div className="w-full h-64 bg-purple-50 rounded-lg flex flex-col items-center justify-center border border-purple-100 group-hover:bg-purple-100/50 transition-colors">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                          {novoArquivo ? (
                            <RiVideoAddLine className="w-10 h-10 text-emerald-600" />
                          ) : (
                            <RiVideoLine className="w-10 h-10 text-purple-600" />
                          )}
                        </div>
                        <p className="text-purple-900 font-medium truncate max-w-[90%] px-4">
                          {novoArquivo
                            ? novoArquivo.name
                            : "Vídeo Atual (Salvo)"}
                        </p>
                        <span className="text-xs text-purple-600/70 mt-1">
                          {novoArquivo
                            ? `${(novoArquivo.size / (1024 * 1024)).toFixed(2)} MB (Novo)`
                            : "Arquivo no servidor"}
                        </span>

                        {!novoArquivo && (
                          <div className="mt-4 pointer-events-auto">
                            <a
                              href={formData.arquivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-purple-100"
                            >
                              <RiExternalLinkLine /> Visualizar Original
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- BARRA DE STATUS / AÇÕES DO ARQUIVO --- */}
                    <div className="mt-4 flex items-center gap-2 pointer-events-auto">
                      {novoArquivo ? (
                        <>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 px-3 py-1 border-0"
                          >
                            <RiCheckLine className="mr-1 w-3 h-3" /> Novo
                            Arquivo Selecionado
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                            onClick={handleRemoveNewFile}
                          >
                            <RiCloseLine className="mr-1 w-3.5 h-3.5" />
                            Cancelar Troca
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-slate-500 border-slate-200"
                          >
                            Arquivo Atual Mantido
                          </Badge>
                          {formData.tipo === "foto" && (
                            <a
                              href={formData.arquivo_url}
                              target="_blank"
                              className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Ver original <RiExternalLinkLine />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload de Thumbnail Opcional (apenas para vídeos) */}
                <AnimatePresence>
                  {formData.tipo === "video" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 overflow-hidden"
                    >
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                          <RiImageLine className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm font-semibold text-slate-700 mb-0.5 block">
                            Thumbnail Personalizada
                          </Label>
                          <p className="text-xs text-slate-500">
                            Opcional. Substitui a capa atual do vídeo.
                          </p>
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            id="thumb-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailChange}
                          />
                          <Label
                            htmlFor="thumb-upload"
                            className={`h-9 px-4 flex items-center gap-2 rounded-lg text-xs font-bold uppercase tracking-wide cursor-pointer transition-all border shadow-sm ${
                              novaThumbnail
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
                                : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600"
                            }`}
                          >
                            {novaThumbnail ? (
                              <>
                                <RiCheckLine className="w-3.5 h-3.5" /> Capa
                                Selecionada
                              </>
                            ) : (
                              "Trocar Capa"
                            )}
                          </Label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Detalhes Card */}
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                  <RiFileTextLine className="text-blue-500 w-5 h-5" /> Detalhes
                  do Item
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="titulo"
                    className="text-slate-700 font-medium"
                  >
                    Título <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    placeholder="Ex: Treinamento de Resgate em Altura"
                    className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Categoria
                    </Label>
                    <Select
                      value={formData.categoria_id || "sem_categoria"}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          categoria_id: v === "sem_categoria" ? null : v,
                        })
                      }
                    >
                      <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sem_categoria">
                          Sem Categoria
                        </SelectItem>
                        {categoriasCompativeis.map((cat: Categoria) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {categoriasCompativeis.length === 0 && (
                      <p className="text-[11px] text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-100 flex items-center gap-1.5">
                        <RiAlertLine className="w-3 h-3" /> Nenhuma categoria
                        compatível.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Ordem</Label>
                    <Input
                      type="number"
                      value={formData.ordem}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ordem: Number(e.target.value),
                        })
                      }
                      className="h-11 border-slate-200 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">
                    Descrição
                  </Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    rows={4}
                    placeholder="Descrição opcional sobre a mídia..."
                    className="resize-none border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coluna Lateral */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-none shadow-lg bg-white sticky top-6 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                <CardTitle className="text-sm font-bold uppercase text-slate-700 tracking-wide flex items-center gap-2">
                  <RiSettings3Line className="w-4 h-4" /> Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
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
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
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

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full h-11 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100/50 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <RiLoader4Line className="mr-2 animate-spin" />{" "}
                        Salvando...
                      </>
                    ) : (
                      <>
                        <RiSaveLine className="mr-2" /> Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
