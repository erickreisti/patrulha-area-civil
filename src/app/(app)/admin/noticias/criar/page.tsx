"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiSaveLine, RiArrowLeftLine, RiLoader3Line } from "react-icons/ri";

// Hook de criação e hook de listagem (para pegar categorias)
import { useNoticiaCriacao, useNoticias } from "@/lib/stores/useNoticiasStore";
import { criarNoticia as criarNoticiaAction } from "@/app/actions/news/noticias";
import { MediaUpload } from "@/app/(app)/admin/noticias/components/MediaUpload";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function CriarNoticiaPage() {
  const router = useRouter();

  // Pegar categorias do store global
  const { categories, fetchCategories } = useNoticias();

  const {
    formData,
    criando,
    hasUnsavedChanges,
    setFormData,
    resetarForm,
    validarForm,
    gerarSlug,
  } = useNoticiaCriacao();

  // Carregar categorias se não existirem
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value, type } = e.target;
      let newValue: string | boolean | number = value;

      if (type === "checkbox") {
        newValue = (e.target as HTMLInputElement).checked;
      } else if (type === "number") {
        newValue = Number(value);
      }

      setFormData({ [name]: newValue });
    },
    [setFormData],
  );

  const [uploadedUrls, setUploadedUrls] = useState<{
    media_url?: string;
    video_url?: string;
    thumbnail_url?: string;
  }>({});

  // Limpar form ao sair
  useEffect(() => {
    return () => {
      if (!criando && !hasUnsavedChanges) resetarForm();
    };
  }, [criando, hasUnsavedChanges, resetarForm]);

  const handleUploadComplete = (url: string, tipo: "imagem" | "video") => {
    if (tipo === "imagem") {
      setUploadedUrls((prev) => ({ ...prev, media_url: url }));
      setFormData({ media_url: url, tipo_media: "imagem" });
    } else {
      setUploadedUrls((prev) => ({ ...prev, video_url: url }));
      setFormData({ video_url: url, tipo_media: "video" });
    }
  };

  const handleMediaRemove = (tipo: "imagem" | "video") => {
    setUploadedUrls((prev) => {
      const newUrls = { ...prev };
      if (tipo === "imagem") delete newUrls.media_url;
      if (tipo === "video") delete newUrls.video_url;
      return newUrls;
    });

    if (tipo === "imagem") {
      setFormData({
        media_url: "",
        tipo_media: formData.video_url ? "video" : "imagem",
      });
    } else {
      setFormData({
        video_url: "",
        tipo_media: formData.media_url ? "imagem" : "video",
      });
    }
    toast.info(`${tipo === "imagem" ? "Imagem" : "Vídeo"} removido`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validarForm();
    if (errors.length > 0) {
      toast.error("Erro de validação", { description: errors.join(", ") });
      return;
    }

    const toastId = toast.loading("Criando notícia...");

    try {
      const finalFormData = {
        ...formData,
        media_url: uploadedUrls.media_url || formData.media_url || null,
        video_url: uploadedUrls.video_url || formData.video_url || null,
        thumbnail_url: uploadedUrls.thumbnail_url || null,
      };

      const result = await criarNoticiaAction(finalFormData);

      if (result.success) {
        toast.success("✅ Notícia criada com sucesso!", { id: toastId });
        setTimeout(() => {
          router.push("/admin/noticias");
          router.refresh();
        }, 1500);
      } else {
        toast.error("❌ Erro ao criar notícia", {
          id: toastId,
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("❌ Erro ao criar notícia", {
        id: toastId,
        description: String(error),
      });
    }
  };

  // Determinar tab ativa
  const activeTab =
    formData.tipo_media === "video"
      ? "video"
      : formData.media_url || uploadedUrls.media_url
        ? "image"
        : "none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
                CRIAR NOVA NOTÍCIA
              </h1>
              <p className="text-gray-600">
                Preencha os dados para criar uma nova notícia
              </p>
            </div>
            <Link href="/admin/noticias">
              <Button variant="outline">
                <RiArrowLeftLine className="mr-2" /> Voltar
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Titulo */}
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        name="titulo"
                        value={formData.titulo}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (e.target.value)
                            setFormData({ slug: gerarSlug(e.target.value) });
                        }}
                        required
                        placeholder="Digite o título..."
                        className="text-lg py-6"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL) *</Label>
                      <div className="flex">
                        <span className="bg-gray-100 border border-r-0 rounded-l-md px-3 flex items-center text-gray-500 text-sm">
                          /noticias/
                        </span>
                        <Input
                          id="slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          required
                          className="rounded-l-none"
                        />
                      </div>
                    </div>

                    {/* Mídia Tabs */}
                    <div className="space-y-2">
                      <Label>Mídia Principal</Label>
                      <Tabs value={activeTab} className="w-full">
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger
                            value="image"
                            onClick={() =>
                              setFormData({ tipo_media: "imagem" })
                            }
                          >
                            Imagem
                          </TabsTrigger>
                          <TabsTrigger
                            value="video"
                            onClick={() => setFormData({ tipo_media: "video" })}
                          >
                            Vídeo
                          </TabsTrigger>
                          <TabsTrigger
                            value="none"
                            onClick={() =>
                              setFormData({
                                tipo_media: "imagem",
                                media_url: "",
                                video_url: "",
                              })
                            }
                          >
                            Sem Mídia
                          </TabsTrigger>
                        </TabsList>

                        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                          <TabsContent value="image" className="mt-0">
                            <MediaUpload
                              slug={formData.slug}
                              tipo="imagem"
                              onFileSelect={() => {}} // Lida internamente
                              onUploadComplete={(url) =>
                                handleUploadComplete(url, "imagem")
                              }
                              onRemove={() => handleMediaRemove("imagem")}
                              currentMedia={
                                formData.media_url || uploadedUrls.media_url
                              }
                              disabled={!formData.slug}
                            />
                          </TabsContent>
                          <TabsContent value="video" className="mt-0 space-y-4">
                            <MediaUpload
                              slug={formData.slug}
                              tipo="video"
                              onFileSelect={() => {}}
                              onUploadComplete={(url) =>
                                handleUploadComplete(url, "video")
                              }
                              onRemove={() => handleMediaRemove("video")}
                              currentMedia={
                                formData.video_url || uploadedUrls.video_url
                              }
                              disabled={!formData.slug}
                            />
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-gray-50 px-2 text-gray-500">
                                  Ou URL externa
                                </span>
                              </div>
                            </div>
                            <Input
                              placeholder="https://youtube.com/..."
                              name="video_url"
                              value={formData.video_url || ""}
                              onChange={handleInputChange}
                            />
                          </TabsContent>
                          <TabsContent
                            value="none"
                            className="mt-0 text-center text-gray-500 text-sm"
                          >
                            Nenhuma mídia será exibida no topo da notícia.
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>

                    {/* Resumo */}
                    <div className="space-y-2">
                      <Label htmlFor="resumo">Resumo *</Label>
                      <Input
                        id="resumo"
                        name="resumo"
                        value={formData.resumo || ""}
                        onChange={handleInputChange}
                        placeholder="Breve descrição..."
                      />
                    </div>

                    {/* Conteudo */}
                    <div className="space-y-2">
                      <Label htmlFor="conteudo">Conteúdo *</Label>
                      <textarea
                        id="conteudo"
                        name="conteudo"
                        value={formData.conteudo}
                        onChange={handleInputChange}
                        rows={10}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Escreva a notícia completa..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Categoria Dinâmica */}
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria</Label>
                        <select
                          id="categoria"
                          name="categoria"
                          value={formData.categoria}
                          onChange={handleInputChange}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data_publicacao">Data</Label>
                        <Input
                          id="data_publicacao"
                          name="data_publicacao"
                          type="date"
                          value={formData.data_publicacao}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="destaque"
                          name="destaque"
                          checked={formData.destaque}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="destaque" className="cursor-pointer">
                          Destacar Notícia
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                          <option value="rascunho">Rascunho</option>
                          <option value="publicado">Publicado</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={criando || !formData.slug}
                      className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                    >
                      {criando ? (
                        <RiLoader3Line className="animate-spin mr-2" />
                      ) : (
                        <RiSaveLine className="mr-2" />
                      )}
                      Criar Notícia
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
