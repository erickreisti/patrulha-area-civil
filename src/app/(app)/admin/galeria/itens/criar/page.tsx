"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  RiCheckLine,
  RiUploadCloud2Line,
  RiCloseLine,
  RiLoader4Line,
  RiAlertLine,
  RiFileTextLine,
  RiSettings3Line,
  RiImageAddLine,
  RiVideoAddLine,
} from "react-icons/ri";

// Actions & Stores
import { createItem } from "@/app/actions/gallery";
import {
  useCategoriasAdmin,
  type Categoria,
} from "@/lib/stores/useGaleriaStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface ItemFormData {
  titulo: string;
  descricao: string;
  tipo: "foto" | "video";
  categoria_id: string | null;
  ordem: number;
  status: boolean;
  destaque: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CriarItemGaleriaPage() {
  const router = useRouter();
  const { isAdmin, hasAdminSession, initialize: initAuth } = useAuthStore();
  const { categorias, fetchCategorias } = useCategoriasAdmin();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [arquivoFile, setArquivoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState<ItemFormData>({
    titulo: "",
    descricao: "",
    tipo: "foto",
    categoria_id: null,
    ordem: 0,
    status: true,
    destaque: false,
  });

  // Limpeza de memória
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Inicialização
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await initAuth();
        if (mounted) await fetchCategorias();
      } catch (error) {
        console.error("Erro init:", error);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [initAuth, fetchCategorias]);

  // Proteção
  useEffect(() => {
    if (checkingAuth) return;
    if (!isAdmin && !hasAdminSession) {
      toast.error("Acesso negado");
      router.replace("/login");
    }
  }, [checkingAuth, isAdmin, hasAdminSession, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;

    const isVideo = formData.tipo === "video";
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    const maxSizeLabel = isVideo ? "100MB" : "10MB";

    // Validação de tipo básico
    if (isVideo && !file.type.startsWith("video/")) {
      return toast.error("Por favor, selecione um arquivo de vídeo válido.");
    }
    if (!isVideo && !file.type.startsWith("image/")) {
      return toast.error("Por favor, selecione um arquivo de imagem válido.");
    }

    if (file.size > maxSize) {
      return toast.error(`Arquivo muito grande. Limite: ${maxSizeLabel}`);
    }

    setArquivoFile(file);

    if (formData.tipo === "foto") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
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

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnailFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!arquivoFile) return toast.error("Selecione um arquivo para upload");
    if (!formData.titulo.trim()) return toast.error("O título é obrigatório");

    setLoading(true);

    try {
      const data = new FormData();
      data.append("titulo", formData.titulo);
      data.append("descricao", formData.descricao);
      data.append("tipo", formData.tipo);
      data.append("categoria_id", formData.categoria_id || "");
      data.append("ordem", String(formData.ordem));
      data.append("status", String(formData.status));
      data.append("destaque", String(formData.destaque));

      data.append("arquivo_file", arquivoFile);
      if (thumbnailFile) data.append("thumbnail_file", thumbnailFile);

      const res = await createItem(data);

      if (res.success) {
        toast.success("Mídia enviada com sucesso!");
        router.push("/admin/galeria/itens");
      } else {
        toast.error(res.error || "Erro ao criar item");
      }
    } catch (error) {
      console.error("Erro Crítico:", error);
      toast.error("Erro interno ao processar upload");
    } finally {
      setLoading(false);
    }
  };

  const categoriasCompativeis = categorias.filter(
    (c: Categoria) =>
      (c.tipo === "fotos" && formData.tipo === "foto") ||
      (c.tipo === "videos" && formData.tipo === "video"),
  );

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <RiLoader4Line className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-slate-500 font-medium animate-pulse">
          Verificando permissões...
        </p>
      </div>
    );
  }

  if (!isAdmin && !hasAdminSession) return null;

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
              NOVA MÍDIA
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Adicione fotos ou vídeos à galeria do sistema.
            </p>
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
            {/* Upload Card Moderno */}
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                  <RiUploadCloud2Line className="text-emerald-600 w-5 h-5" />
                  Arquivo de Mídia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Seleção de Tipo Visual */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        tipo: "foto",
                        categoria_id: null,
                      }));
                      setArquivoFile(null);
                      setPreviewUrl(null);
                    }}
                    className={`relative overflow-hidden rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 border-2 ${
                      formData.tipo === "foto"
                        ? "border-emerald-500 bg-emerald-50/30 text-emerald-800 shadow-md scale-[1.02]"
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 text-slate-500 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full transition-colors ${
                        formData.tipo === "foto"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <RiImageLine className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wide">
                      Foto
                    </span>
                    {formData.tipo === "foto" && (
                      <div className="absolute top-3 right-3 text-emerald-600 animate-in zoom-in">
                        <RiCheckLine />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        tipo: "video",
                        categoria_id: null,
                      }));
                      setArquivoFile(null);
                      setPreviewUrl(null);
                    }}
                    className={`relative overflow-hidden rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 border-2 ${
                      formData.tipo === "video"
                        ? "border-purple-500 bg-purple-50/30 text-purple-800 shadow-md scale-[1.02]"
                        : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50 text-slate-500 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full transition-colors ${
                        formData.tipo === "video"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <RiVideoLine className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wide">
                      Vídeo
                    </span>
                    {formData.tipo === "video" && (
                      <div className="absolute top-3 right-3 text-purple-600 animate-in zoom-in">
                        <RiCheckLine />
                      </div>
                    )}
                  </button>
                </div>

                {/* Área de Upload Drag & Drop */}
                <div
                  className={`relative group w-full min-h-[320px] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 text-center ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/30 scale-[1.01]"
                      : arquivoFile
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

                  <AnimatePresence mode="wait">
                    {arquivoFile ? (
                      // Estado: Arquivo Selecionado
                      <motion.div
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center w-full h-full z-30"
                      >
                        {formData.tipo === "foto" && previewUrl ? (
                          <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-sm border border-slate-200 group-hover:shadow-md transition-shadow bg-white">
                            <Image
                              src={previewUrl}
                              alt="Preview"
                              fill
                              className="object-contain"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <p className="text-white font-medium flex items-center gap-2">
                                <RiImageAddLine /> Clique para trocar
                              </p>
                            </div>
                          </div>
                        ) : (
                          // Preview genérico para Vídeo
                          <div className="w-full h-64 bg-purple-50 rounded-lg flex flex-col items-center justify-center border border-purple-100">
                            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                              <RiVideoLine className="w-10 h-10 text-purple-600" />
                            </div>
                            <p className="text-purple-800 font-medium truncate max-w-[90%] px-4">
                              {arquivoFile.name}
                            </p>
                            <span className="text-xs text-purple-600/70 mt-1">
                              {(arquivoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-2 relative">
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 px-3 py-1 border-0"
                          >
                            <RiCheckLine className="mr-1 w-3 h-3" /> Arquivo
                            Pronto
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 z-40"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setArquivoFile(null);
                              setPreviewUrl(null);
                            }}
                          >
                            <RiCloseLine className="mr-1" /> Remover
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      // Estado: Nenhum Arquivo (Placeholder)
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center pointer-events-none"
                      >
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300">
                          {formData.tipo === "foto" ? (
                            <RiImageAddLine className="w-10 h-10 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                          ) : (
                            <RiVideoAddLine className="w-10 h-10 text-slate-400 group-hover:text-purple-500 transition-colors" />
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">
                          Arraste e solte ou clique aqui
                        </h3>
                        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                          {formData.tipo === "foto"
                            ? "Suporta JPG, PNG e WEBP. Tamanho máximo de 10MB."
                            : "Suporta MP4 e MOV. Tamanho máximo de 100MB."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                            Opcional. Imagem de capa para o vídeo.
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
                              thumbnailFile
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
                                : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600"
                            }`}
                          >
                            {thumbnailFile ? (
                              <>
                                <RiCheckLine className="w-3.5 h-3.5" />{" "}
                                Carregada
                              </>
                            ) : (
                              "Escolher Capa"
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
                    <Label className="text-sm font-semibold text-slate-700">
                      Status Ativo
                    </Label>
                    <p className="text-xs text-slate-500">Visível na galeria</p>
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
                    <Label className="text-sm font-semibold text-slate-700">
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
                    disabled={loading || !arquivoFile}
                    className="w-full h-11 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100/50 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <RiLoader4Line className="mr-2 animate-spin" />{" "}
                        Salvando...
                      </>
                    ) : (
                      <>
                        <RiSaveLine className="mr-2" /> Publicar Item
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
