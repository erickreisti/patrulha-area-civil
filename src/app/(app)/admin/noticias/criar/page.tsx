"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  RiSaveLine,
  RiArrowLeftLine,
  RiLoader3Line,
  RiLayoutMasonryLine,
  RiSettings3Line,
  RiUploadCloud2Line,
  RiArticleLine,
  RiLinkM,
  RiVideoLine,
} from "react-icons/ri";

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Hooks & Actions
import { useNoticiaCreate, useNoticias } from "@/lib/stores/useNoticiasStore";
import { MediaUpload } from "@/app/(app)/admin/noticias/components/MediaUpload";
import type { CreateNoticiaInput } from "@/app/actions/news/noticias";

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CriarNoticiaPage() {
  const router = useRouter();
  const { categories, fetchCategories } = useNoticias();

  const {
    formData,
    saving,
    setFormData,
    resetFormData,
    createNoticia,
    validateForm,
    autoGenerateSlug,
  } = useNoticiaCreate();

  const [activeTab, setActiveTab] = useState("conteudo");

  // Carregar categorias
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  // Cleanup
  useEffect(() => {
    return () => {
      resetFormData();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    if (name === "titulo") {
      autoGenerateSlug(value);
    }
  };

  // Upload unificado
  const handleUploadComplete = (
    url: string,
    detectedType: "imagem" | "video",
  ) => {
    if (detectedType === "imagem") {
      setFormData({ media_url: url, tipo_media: "imagem", video_url: null });
    } else {
      setFormData({ video_url: url, tipo_media: "video", media_url: null });
    }
    toast.success(`Mídia (${detectedType}) adicionada com sucesso!`);
  };

  const handleRemoveMedia = () => {
    setFormData({ media_url: null, video_url: null, tipo_media: "imagem" });
    toast.info("Mídia removida.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast.error("Atenção", {
        description: errors[0],
      });
      return;
    }

    const toastId = toast.loading("Publicando notícia...");

    const result = await createNoticia(formData as CreateNoticiaInput);

    if (result.success) {
      toast.success("Notícia criada com sucesso!", { id: toastId });
      router.push("/admin/noticias");
    } else {
      toast.error("Erro ao criar", { id: toastId, description: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 font-bebas tracking-wide mb-1">
              NOVA NOTÍCIA
            </h1>
            <p className="text-slate-500 text-sm">
              Crie conteúdo informativo para o portal da PAC.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link href="/admin/noticias" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
              >
                <RiArrowLeftLine className="mr-2" /> Cancelar
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 md:flex-none bg-pac-primary hover:bg-pac-primary-dark text-white font-bold shadow-md shadow-pac-primary/20 transition-all"
            >
              {saving ? (
                <RiLoader3Line className="animate-spin mr-2" />
              ) : (
                <RiSaveLine className="mr-2" />
              )}
              {saving ? "Salvando..." : "Publicar Notícia"}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal (Esquerda) */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Card className="border-none shadow-sm bg-white overflow-hidden">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <CardHeader className="border-b border-slate-50 pb-0 pt-6 px-6">
                    <TabsList className="bg-slate-50 p-1 rounded-xl w-full flex gap-1 border border-slate-100">
                      <TabsTrigger
                        value="conteudo"
                        className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-pac-primary data-[state=active]:shadow-sm data-[state=active]:font-bold text-slate-500 transition-all duration-300 py-2.5"
                      >
                        <RiArticleLine className="mr-2 w-4 h-4" /> Conteúdo
                      </TabsTrigger>
                      <TabsTrigger
                        value="midia"
                        className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-pac-primary data-[state=active]:shadow-sm data-[state=active]:font-bold text-slate-500 transition-all duration-300 py-2.5"
                      >
                        <RiUploadCloud2Line className="mr-2 w-4 h-4" /> Mídia e
                        Capa
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  <CardContent className="p-8">
                    <TabsContent
                      value="conteudo"
                      className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      {/* Título */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="titulo"
                          className="text-slate-700 font-semibold text-base"
                        >
                          Título da Notícia{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="titulo"
                          name="titulo"
                          value={formData.titulo || ""}
                          onChange={handleInputChange}
                          placeholder="Ex: Operação Verão inicia com sucesso..."
                          className="text-lg py-6 border-slate-200 focus:border-pac-primary focus:ring-pac-primary/20 rounded-xl shadow-sm font-medium"
                        />
                      </div>

                      {/* Slug */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="slug"
                          className="text-slate-700 font-semibold text-sm"
                        >
                          Slug (URL Amigável)
                        </Label>
                        <div className="flex rounded-xl shadow-sm overflow-hidden">
                          <span className="inline-flex items-center px-4 border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium">
                            /noticias/
                          </span>
                          <Input
                            id="slug"
                            name="slug"
                            value={formData.slug || ""}
                            onChange={handleInputChange}
                            className="rounded-l-none border-slate-200 focus:border-pac-primary focus:ring-pac-primary/20"
                          />
                        </div>
                      </div>

                      {/* Resumo */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="resumo"
                          className="text-slate-700 font-semibold text-sm"
                        >
                          Resumo <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="resumo"
                          name="resumo"
                          value={formData.resumo || ""}
                          onChange={handleInputChange}
                          placeholder="Uma breve descrição que aparecerá nos cards de listagem..."
                          className="h-24 resize-none border-slate-200 focus:border-pac-primary focus:ring-pac-primary/20 rounded-xl shadow-sm"
                        />
                      </div>

                      <Separator className="bg-slate-100" />

                      {/* Conteúdo Principal */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="conteudo"
                          className="text-slate-700 font-semibold text-sm"
                        >
                          Conteúdo Completo{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="conteudo"
                          name="conteudo"
                          value={formData.conteudo || ""}
                          onChange={handleInputChange}
                          placeholder="Escreva os detalhes da notícia aqui..."
                          className="min-h-[400px] border-slate-200 focus:border-pac-primary focus:ring-pac-primary/20 leading-relaxed rounded-xl shadow-sm p-4 font-sans text-base"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="midia"
                      className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-800 text-sm flex items-start gap-3">
                        <RiLayoutMasonryLine className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold mb-1">
                            Gerenciamento de Mídia
                          </p>
                          <p className="opacity-90">
                            Você pode enviar imagens (JPG, PNG) ou vídeos (MP4).
                            O sistema detectará automaticamente o formato e
                            ajustará a exibição.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-slate-700 font-bold text-lg flex items-center gap-2">
                          Arquivo de Capa
                        </Label>

                        {/* Componente de Upload Unificado */}
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <MediaUpload
                            slug={formData.slug || "temp"}
                            tipo="imagem"
                            onFileSelect={() => {}}
                            onUploadComplete={(url, type) =>
                              handleUploadComplete(
                                url,
                                type as "imagem" | "video",
                              )
                            }
                            onRemove={handleRemoveMedia}
                            currentMedia={
                              formData.media_url || formData.video_url
                            }
                            disabled={!formData.slug}
                          />
                        </div>

                        {!formData.slug && (
                          <p className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 inline-block">
                            ⚠️ Preencha o título na aba &quot;Conteúdo&quot;
                            para habilitar o upload.
                          </p>
                        )}
                      </div>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-slate-400 font-medium tracking-wider">
                            Ou use um link externo
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="video_url"
                          className="text-slate-700 font-semibold flex items-center gap-2"
                        >
                          <RiLinkM className="text-pac-primary" /> URL de Vídeo
                          (YouTube/Vimeo)
                        </Label>
                        <div className="relative">
                          <RiVideoLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="video_url"
                            name="video_url"
                            placeholder="Ex: https://www.youtube.com/watch?v=..."
                            value={formData.video_url || ""}
                            onChange={(e) => {
                              setFormData({
                                video_url: e.target.value,
                                tipo_media: "video",
                                media_url: null,
                              });
                            }}
                            className="pl-10 border-slate-200 h-12 rounded-xl focus:border-pac-primary focus:ring-pac-primary/20"
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          Cole o link direto do vídeo caso não queira fazer
                          upload.
                        </p>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar (Direita) */}
          <div className="space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-none shadow-sm sticky top-6 bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                  <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
                    <RiSettings3Line className="text-pac-primary" />{" "}
                    Configuração da Publicação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Status */}
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold text-xs uppercase tracking-wide">
                      Status
                    </Label>
                    <Select
                      value={formData.status || "rascunho"}
                      onValueChange={(v) =>
                        setFormData({
                          status: v as CreateNoticiaInput["status"],
                        })
                      }
                    >
                      <SelectTrigger className="w-full border-slate-200 h-11 rounded-lg focus:ring-pac-primary">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">📝 Rascunho</SelectItem>
                        <SelectItem value="publicado">✅ Publicado</SelectItem>
                        <SelectItem value="arquivado">🗄️ Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categoria */}
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold text-xs uppercase tracking-wide">
                      Categoria
                    </Label>
                    <Select
                      value={formData.categoria || "Operações"}
                      onValueChange={(v) => setFormData({ categoria: v })}
                    >
                      <SelectTrigger className="w-full border-slate-200 h-11 rounded-lg focus:ring-pac-primary">
                        <SelectValue placeholder="Selecione a categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Data */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="data_publicacao"
                      className="text-slate-700 font-semibold text-xs uppercase tracking-wide"
                    >
                      Data de Publicação
                    </Label>
                    <Input
                      type="date"
                      id="data_publicacao"
                      name="data_publicacao"
                      value={formData.data_publicacao || ""}
                      onChange={handleInputChange}
                      className="border-slate-200 h-11 rounded-lg focus:ring-pac-primary"
                    />
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Destaque Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex flex-col">
                      <Label
                        htmlFor="destaque"
                        className="cursor-pointer font-bold text-slate-700 text-sm"
                      >
                        Destaque
                      </Label>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
                        Exibir no carrossel
                      </span>
                    </div>
                    <Switch
                      id="destaque"
                      checked={formData.destaque || false}
                      onCheckedChange={(checked) =>
                        setFormData({ destaque: checked })
                      }
                      className="data-[state=checked]:bg-pac-accent-amber"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
