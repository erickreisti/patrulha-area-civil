"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  RiSaveLine,
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiSettings3Line,
  RiAlertLine,
  RiImageLine,
} from "react-icons/ri";

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Hooks
import { useNoticiaEdit, useNoticias } from "@/lib/stores/useNoticiasStore";
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

  const { categories, fetchCategories } = useNoticias();

  const {
    noticia,
    loading,
    saving,
    formData,
    hasUnsavedChanges,
    setFormData,
    updateNoticia,
    validateForm,
  } = useNoticiaEdit(noticiaId);

  const [isDeleting, setIsDeleting] = useState(false);

  // Carregar categorias
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  // Prevenir saída sem salvar
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

  // Handlers Simplificados (setFormData já ativa hasUnsavedChanges no store)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleUploadComplete = (url: string, tipo: "imagem" | "video") => {
    if (tipo === "imagem") {
      setFormData({ media_url: url, tipo_media: "imagem" });
    } else {
      setFormData({ video_url: url, tipo_media: "video" });
    }
    toast.success("Upload concluído!");
  };

  const handleMediaRemove = () => {
    if (formData.tipo_media === "imagem") {
      setFormData({ media_url: "" });
    } else {
      setFormData({ video_url: "" });
    }
    toast.info("Mídia removida");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast.error("Verifique o formulário", { description: errors.join(", ") });
      return;
    }

    if (!hasUnsavedChanges) {
      toast.info("Nenhuma alteração para salvar");
      return;
    }

    const toastId = toast.loading("Salvando alterações...");

    // Casting seguro para o tipo esperado pela Action
    const result = await updateNoticia(formData as UpdateNoticiaInput);

    if (result.success) {
      toast.success("✅ Notícia atualizada!", { id: toastId });
      router.refresh();
    } else {
      toast.error("Erro ao atualizar", {
        id: toastId,
        description: result.error,
      });
    }
  };

  const handleDeleteNoticia = async () => {
    if (!noticia) return;
    setIsDeleting(true);
    const toastId = toast.loading("Excluindo notícia...");

    const result = await deletarNoticia(noticia.id);
    if (result.success) {
      toast.success("Excluída com sucesso", { id: toastId });
      router.push("/admin/noticias");
    } else {
      toast.error("Erro ao excluir", { id: toastId });
      setIsDeleting(false);
    }
  };

  if (loading || !noticia) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Spinner className="w-10 h-10 animate-spin text-slate-600 mb-4" />
        <p className="text-slate-500 font-medium">Carregando notícia...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900 font-bebas tracking-wide">
                  EDITAR NOTÍCIA
                </h1>
                <Badge
                  className={
                    noticia.status === "publicado"
                      ? "bg-emerald-500"
                      : noticia.status === "rascunho"
                        ? "bg-amber-500"
                        : "bg-slate-500"
                  }
                >
                  {noticia.status?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-slate-600">
                Editando: <strong>{noticia.titulo}</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/admin/noticias">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                >
                  <RiArrowLeftLine className="mr-2" /> Voltar
                </Button>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isDeleting}
                    className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300"
                  >
                    <RiDeleteBinLine className="mr-2" /> Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                      <RiAlertLine /> Tem certeza?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A notícia{" "}
                      <strong>{noticia.titulo}</strong> será permanentemente
                      removida.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteNoticia}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sim, Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-none shadow-xl">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg text-slate-800">
                      Conteúdo Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Mídia */}
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-semibold flex items-center gap-2">
                        <RiImageLine /> Mídia de Capa
                      </Label>
                      <MediaUpload
                        slug={formData.slug || noticia.slug}
                        tipo={
                          formData.tipo_media === "video" ? "video" : "imagem"
                        }
                        onFileSelect={() => {}}
                        onUploadComplete={(url) =>
                          handleUploadComplete(
                            url,
                            formData.tipo_media === "video"
                              ? "video"
                              : "imagem",
                          )
                        }
                        onRemove={handleMediaRemove}
                        currentMedia={
                          formData.tipo_media === "video"
                            ? formData.video_url
                            : formData.media_url
                        }
                        uploadImmediately
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="titulo"
                        className="text-slate-700 font-semibold"
                      >
                        Título
                      </Label>
                      <Input
                        id="titulo"
                        name="titulo"
                        value={formData.titulo || ""}
                        onChange={handleInputChange}
                        className="text-lg border-slate-200 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="slug"
                        className="text-slate-700 font-semibold"
                      >
                        Slug
                      </Label>
                      <Input
                        id="slug"
                        name="slug"
                        value={formData.slug || ""}
                        onChange={handleInputChange}
                        className="bg-slate-50 border-slate-200 text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="resumo"
                        className="text-slate-700 font-semibold"
                      >
                        Resumo
                      </Label>
                      <Textarea
                        id="resumo"
                        name="resumo"
                        value={formData.resumo || ""}
                        onChange={handleInputChange}
                        className="h-24 resize-none border-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="conteudo"
                        className="text-slate-700 font-semibold"
                      >
                        Conteúdo Completo
                      </Label>
                      <Textarea
                        id="conteudo"
                        name="conteudo"
                        value={formData.conteudo || ""}
                        onChange={handleInputChange}
                        rows={12}
                        className="min-h-[300px] border-slate-200 leading-relaxed"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-none shadow-xl sticky top-6">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <RiSettings3Line className="text-slate-500" />{" "}
                      Configurações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">
                        Status da Publicação
                      </Label>
                      <Select
                        value={formData.status || "rascunho"}
                        onValueChange={(v) => {
                          setFormData({
                            status: v as UpdateNoticiaInput["status"],
                          });
                        }}
                      >
                        <SelectTrigger className="w-full border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rascunho">📝 Rascunho</SelectItem>
                          <SelectItem value="publicado">
                            ✅ Publicado
                          </SelectItem>
                          <SelectItem value="arquivado">
                            🗄️ Arquivado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">
                        Categoria
                      </Label>
                      <Select
                        value={formData.categoria || "Operações"}
                        onValueChange={(v) => {
                          setFormData({ categoria: v });
                        }}
                      >
                        <SelectTrigger className="w-full border-slate-200">
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

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <Label
                        htmlFor="destaque"
                        className="cursor-pointer font-semibold text-slate-700"
                      >
                        Destaque
                      </Label>
                      <Switch
                        id="destaque"
                        checked={formData.destaque || false}
                        onCheckedChange={(c) => {
                          setFormData({ destaque: c });
                        }}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!hasUnsavedChanges || saving}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 shadow-md shadow-emerald-100 mt-4"
                    >
                      {saving ? (
                        <Spinner className="mr-2 text-white" />
                      ) : (
                        <RiSaveLine className="mr-2" />
                      )}
                      Salvar Alterações
                    </Button>

                    <div className="text-xs text-center text-slate-400 mt-2">
                      {hasUnsavedChanges
                        ? "⚠️ Alterações pendentes"
                        : "✅ Tudo salvo"}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
