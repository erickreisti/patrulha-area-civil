"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiImageLine,
  RiVideoLine,
  RiCheckLine,
  RiUploadCloud2Line,
  RiCloseLine,
  RiLoader4Line,
  RiFolderLine,
  RiStarLine,
  RiEyeLine,
  RiEyeOffLine,
  RiAlertLine,
} from "react-icons/ri";

import { createItem } from "@/app/actions/gallery";
import { useCategoriasAdmin } from "@/lib/stores/useGaleriaStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import type { Categoria } from "@/app/actions/gallery/types";

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

  const [formData, setFormData] = useState<ItemFormData>({
    titulo: "",
    descricao: "",
    tipo: "foto",
    categoria_id: null,
    ordem: 0,
    status: true,
    destaque: false,
  });

  // Inicialização
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      console.log("🔄 [Criar] Iniciando verificação de autenticação...");
      try {
        await initAuth();
        if (mounted) await fetchCategorias();
      } catch (error) {
        console.error("❌ [Criar] Erro na inicialização:", error);
      } finally {
        if (mounted) {
          console.log("✅ [Criar] Verificação concluída.");
          setCheckingAuth(false);
        }
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
    console.log("🛡️ [Criar] Auth Status:", { isAdmin, hasAdminSession });
    if (!isAdmin && !hasAdminSession) {
      console.warn("🚫 [Criar] Acesso negado. Redirecionando...");
      toast.error("Acesso negado");
      router.replace("/login");
    }
  }, [checkingAuth, isAdmin, hasAdminSession, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(
      "📁 [Criar] Arquivo selecionado:",
      file.name,
      "Tipo:",
      file.type,
      "Tamanho:",
      file.size,
    );

    const maxSize =
      formData.tipo === "video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    const maxSizeLabel = formData.tipo === "video" ? "100MB" : "10MB";

    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Limite: ${maxSizeLabel}`);
      e.target.value = "";
      return;
    }

    setArquivoFile(file);

    if (formData.tipo === "foto") {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("🖼️ [Criar] Thumbnail selecionada:", file.name);
      setThumbnailFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.group("🚀 [Criar] Iniciando Submit");

    if (!arquivoFile) {
      console.error("❌ Sem arquivo selecionado");
      console.groupEnd();
      return toast.error("Selecione um arquivo para upload");
    }
    if (!formData.titulo.trim()) {
      console.error("❌ Título vazio");
      console.groupEnd();
      return toast.error("O título é obrigatório");
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("titulo", formData.titulo);
      data.append("descricao", formData.descricao);
      data.append("tipo", formData.tipo);
      if (formData.categoria_id)
        data.append("categoria_id", formData.categoria_id);
      data.append("ordem", String(formData.ordem));
      data.append("status", String(formData.status));
      data.append("destaque", String(formData.destaque));

      data.append("arquivo_file", arquivoFile);
      if (thumbnailFile) data.append("thumbnail_file", thumbnailFile);

      // Log do que está sendo enviado
      console.log("📤 Enviando FormData:");
      for (const pair of data.entries()) {
        console.log(
          `   ${pair[0]}:`,
          pair[1] instanceof File ? `File(${pair[1].name})` : pair[1],
        );
      }

      const res = await createItem(data);
      console.log("📥 Resposta do Server Action:", res);

      if (res.success) {
        toast.success("Mídia enviada com sucesso!");
        router.push("/admin/galeria/itens");
      } else {
        console.error("❌ Erro retornado pela API:", res.error);
        toast.error(res.error || "Erro ao criar item");
      }
    } catch (error) {
      console.error("🔥 Erro Crítico (Catch):", error);
      toast.error("Erro interno ao processar upload");
    } finally {
      setLoading(false);
      console.groupEnd();
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
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-bebas">
              NOVA MÍDIA
            </h1>
            <p className="text-slate-500 font-medium">
              Adicione fotos ou vídeos à galeria.
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
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <RiUploadCloud2Line className="text-emerald-600" /> Upload de
                  Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        tipo: "foto",
                        categoria_id: null,
                      }));
                      setArquivoFile(null);
                      setPreviewUrl(null);
                    }}
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                      formData.tipo === "foto"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500"
                        : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <RiImageLine className="w-8 h-8" />
                    <span className="font-bold">Foto</span>
                  </div>
                  <div
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        tipo: "video",
                        categoria_id: null,
                      }));
                      setArquivoFile(null);
                      setPreviewUrl(null);
                    }}
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                      formData.tipo === "video"
                        ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-500"
                        : "border-slate-200 hover:border-purple-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <RiVideoLine className="w-8 h-8" />
                    <span className="font-bold">Vídeo</span>
                  </div>
                </div>

                <div className="relative group">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={formData.tipo === "foto" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                  />
                  <Label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors relative overflow-hidden ${
                      arquivoFile
                        ? "border-emerald-400 bg-emerald-50/30"
                        : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full p-2">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <p className="text-white font-medium">
                            Clique para trocar
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8 shadow-sm z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            setArquivoFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          <RiCloseLine className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          {arquivoFile ? (
                            <RiCheckLine className="w-8 h-8 text-emerald-500" />
                          ) : (
                            <RiUploadCloud2Line className="w-8 h-8 text-emerald-600" />
                          )}
                        </div>
                        <p className="mb-2 text-sm font-semibold text-slate-700">
                          {arquivoFile
                            ? arquivoFile.name
                            : "Clique para selecionar o arquivo"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formData.tipo === "foto"
                            ? "JPG, PNG, WEBP (Max 10MB)"
                            : "MP4, MOV (Max 100MB)"}
                        </p>
                      </div>
                    )}
                  </Label>
                </div>

                {formData.tipo === "video" && (
                  <div className="pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <Label className="mb-2 block text-slate-700 font-medium">
                      Thumbnail Personalizada (Opcional)
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="file:text-purple-700 file:bg-purple-50 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-3 file:text-sm file:font-semibold hover:file:bg-purple-100 cursor-pointer"
                      />
                      {thumbnailFile && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
                          <RiCheckLine className="mr-1 w-3 h-3" /> OK
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <RiFolderLine className="text-emerald-600" /> Detalhes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-slate-700">
                    Título <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    placeholder="Ex: Treinamento de Resgate"
                    className="h-11 border-slate-200 focus-visible:ring-emerald-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Categoria</Label>
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
                        {categoriasCompativeis.map((cat: Categoria) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {categoriasCompativeis.length === 0 && (
                      <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded mt-1 flex items-center gap-1">
                        <RiAlertLine className="w-3 h-3" /> Nenhuma categoria
                        deste tipo disponível.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Ordem</Label>
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
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">Descrição</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    rows={3}
                    placeholder="Descrição opcional..."
                    className="resize-none border-slate-200 focus-visible:ring-emerald-500/20"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={loading || !arquivoFile}
              className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RiLoader4Line className="mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <RiSaveLine className="mr-2" /> Salvar Item
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
