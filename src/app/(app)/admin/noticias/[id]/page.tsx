"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiNewspaperLine,
  RiSaveLine,
  RiArrowLeftLine,
  RiDeleteBinLine,
} from "react-icons/ri";

// Hooks
import { useNoticiaEdicao, useNoticias } from "@/lib/stores/useNoticiasStore";
import { MediaUpload } from "@/app/(app)/admin/noticias/components/MediaUpload";
import {
  deletarNoticia,
  type UpdateNoticiaInput,
} from "@/app/actions/news/noticias";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function EditarNoticiaPage() {
  const params = useParams();
  const router = useRouter();
  const noticiaId = params.id as string;

  // Pegar categorias do store global
  const { categories, fetchCategories } = useNoticias();

  const {
    noticia,
    carregando,
    salvando,
    formData,
    hasUnsavedChanges,
    setCampo,
    setMedia,
    setHasUnsavedChanges,
    validarForm,
    salvar,
  } = useNoticiaEdicao(noticiaId);

  const [isDeleting, setIsDeleting] = useState(false);

  // Carregar categorias
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  // Prevenir perda de dados
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Você tem alterações não salvas.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handlers de Mídia
  const handleMediaSelect = useCallback(
    (file: File, tipo: "imagem" | "video") => {
      setMedia(file, tipo === "imagem" ? "image" : "video");
      setHasUnsavedChanges(true);
    },
    [setMedia, setHasUnsavedChanges],
  );

  const handleUploadComplete = useCallback(
    (url: string, tipo: "imagem" | "video") => {
      if (tipo === "imagem") {
        setCampo("media_url", url);
        setCampo("tipo_media", "imagem");
      } else {
        setCampo("video_url", url);
        setCampo("tipo_media", "video");
      }
      setHasUnsavedChanges(true);
      toast.success("Upload concluído!");
    },
    [setCampo, setHasUnsavedChanges],
  );

  const handleMediaRemove = useCallback(
    (tipo: "imagem" | "video") => {
      if (tipo === "imagem") setCampo("media_url", "");
      else setCampo("video_url", "");
      setHasUnsavedChanges(true);
      toast.info("Mídia removida");
    },
    [setCampo, setHasUnsavedChanges],
  );

  // Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validarForm();
    if (errors.length > 0) {
      toast.error("Erro de validação", { description: errors.join(", ") });
      return;
    }

    if (!hasUnsavedChanges) {
      toast.info("Nenhuma alteração para salvar");
      return;
    }

    const toastId = toast.loading("Atualizando...");

    try {
      const result = await salvar();
      if (result.success) {
        setHasUnsavedChanges(false);
        toast.success("✅ Notícia atualizada!", { id: toastId });
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast.error("Erro ao atualizar", {
          id: toastId,
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Erro crítico", { id: toastId, description: String(error) });
    }
  };

  const handleDeleteNoticia = async () => {
    if (!noticia || !window.confirm(`Excluir "${noticia.titulo}"?`)) return;
    setIsDeleting(true);
    const toastId = toast.loading("Excluindo...");

    try {
      const result = await deletarNoticia(noticia.id);
      if (result.success) {
        toast.success("Excluída com sucesso", { id: toastId });
        setTimeout(() => {
          router.push("/admin/noticias");
          router.refresh();
        }, 1500);
      } else {
        toast.error("Erro ao excluir", { id: toastId });
        setIsDeleting(false);
      }
    } catch {
      toast.error("Erro desconhecido", { id: toastId });
      setIsDeleting(false);
    }
  };

  if (carregando || !noticia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 animate-spin text-navy-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-bebas tracking-wide">
                EDITAR NOTÍCIA
              </h1>
              <p className="text-gray-600">
                Editando: <strong>{noticia.titulo}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Badge
                className={
                  noticia.status === "publicado"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }
              >
                {noticia.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Upload */}
                    <div className="space-y-2">
                      <Label>Mídia</Label>
                      <MediaUpload
                        slug={formData.slug || noticia.slug}
                        tipo={
                          formData.tipo_media === "video" ? "video" : "imagem"
                        }
                        onFileSelect={(f, t) => handleMediaSelect(f, t)}
                        onUploadComplete={(u, t) => handleUploadComplete(u, t)}
                        onRemove={() =>
                          handleMediaRemove(
                            formData.tipo_media === "video"
                              ? "video"
                              : "imagem",
                          )
                        }
                        currentMedia={
                          formData.tipo_media === "video"
                            ? formData.video_url
                            : formData.media_url
                        }
                        disabled={salvando}
                        uploadImmediately
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo || ""}
                        onChange={(e) => {
                          setCampo("titulo", e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug || ""}
                        onChange={(e) => {
                          setCampo("slug", e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resumo">Resumo</Label>
                      <Textarea
                        id="resumo"
                        value={formData.resumo || ""}
                        onChange={(e) => {
                          setCampo("resumo", e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conteudo">Conteúdo</Label>
                      <Textarea
                        id="conteudo"
                        value={formData.conteudo || ""}
                        onChange={(e) => {
                          setCampo("conteudo", e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        rows={10}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={
                            formData.categoria ||
                            noticia.categoria ||
                            "Operações"
                          }
                          onValueChange={(v) => {
                            setCampo("categoria", v);
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={formData.status || noticia.status}
                          onValueChange={(v) => {
                            setCampo(
                              "status",
                              v as UpdateNoticiaInput["status"],
                            );
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rascunho">Rascunho</SelectItem>
                            <SelectItem value="publicado">Publicado</SelectItem>
                            <SelectItem value="arquivado">Arquivado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Switch
                        checked={formData.destaque || false}
                        onCheckedChange={(c) => {
                          setCampo("destaque", c);
                          setHasUnsavedChanges(true);
                        }}
                      />
                      <Label>Destacar Notícia</Label>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={!hasUnsavedChanges || salvando}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {salvando ? (
                          <Spinner className="mr-2" />
                        ) : (
                          <RiSaveLine className="mr-2" />
                        )}{" "}
                        Salvar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/noticias")}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteNoticia}
                        disabled={isDeleting}
                      >
                        <RiDeleteBinLine />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-700">
                    <RiNewspaperLine className="mr-2" /> Informações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                  <p>
                    <strong>ID:</strong>{" "}
                    <span className="font-mono bg-gray-100 px-1 rounded">
                      {noticia.id.slice(0, 8)}...
                    </span>
                  </p>
                  <p>
                    <strong>Criado em:</strong>{" "}
                    {new Date(noticia.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Autor:</strong>{" "}
                    {noticia.autor?.full_name || "Desconhecido"}
                  </p>
                  <p>
                    <strong>Visualizações:</strong> {noticia.views}
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Link href="/admin/noticias">
                  <Button variant="ghost">
                    <RiArrowLeftLine className="mr-2" /> Voltar para lista
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
