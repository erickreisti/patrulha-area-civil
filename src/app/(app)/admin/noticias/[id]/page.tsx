// src/app/(app)/admin/noticias/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiNewspaperLine,
  RiSaveLine,
  RiArrowLeftLine,
  RiCalendarLine,
  RiImageLine,
  RiBarChartLine,
  RiHomeLine,
  RiCheckLine,
  RiAlertLine,
  RiUserLine,
  RiExternalLinkLine,
  RiStarFill,
  RiDeleteBinLine,
} from "react-icons/ri";

// Import do store
import { useNoticiaEdit } from "@/lib/stores/useNoticiasStore";

const CATEGORIAS = [
  "Operações",
  "Treinamento",
  "Cooperação",
  "Projetos Sociais",
  "Equipamentos",
  "Eventos",
  "Comunicação",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// Função auxiliar para criar um evento simulado
const createInputChangeEvent = (
  name: string,
  value: string | boolean | Date
): React.ChangeEvent<HTMLInputElement> => {
  const event = {
    target: {
      name,
      value:
        typeof value === "boolean" || value instanceof Date
          ? value.toString()
          : value,
    },
    currentTarget: {
      name,
      value:
        typeof value === "boolean" || value instanceof Date
          ? value.toString()
          : value,
    },
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 3,
    isTrusted: false,
    nativeEvent: {} as Event,
    persist: () => {},
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    preventDefault: () => {},
    stopPropagation: () => {},
    timeStamp: Date.now(),
    type: "change",
  } as React.ChangeEvent<HTMLInputElement>;

  return event;
};

export default function EditarNoticiaPage() {
  const params = useParams();
  const router = useRouter();
  const noticiaId = params.id as string;

  const {
    noticiaDetalhe,
    loading,
    saving,
    formData,
    errors,
    hasUnsavedChanges,
    handleInputChange,
    handleSubmit,
    setHasUnsavedChanges,
  } = useNoticiaEdit(noticiaId);

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Configurar beforeunload para prevenir navegação durante operações
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "Você tem alterações não salvas. Tem certeza que deseja sair?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Limpar erros quando o usuário começa a digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(errors).length > 0) {
        // Limpar erros após 3 segundos
        Object.keys(errors).forEach((key) => {
          const value = formData[key as keyof typeof formData];
          const event = createInputChangeEvent(key, value || "");
          handleInputChange(event);
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [errors, formData, handleInputChange]);

  const handleImageUpload = (imageUrl: string | null) => {
    const event = createInputChangeEvent("imagem", imageUrl || "");
    handleInputChange(event);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasUnsavedChanges) {
      toast.info("Nenhuma alteração foi feita para salvar");
      return;
    }

    setSubmitStatus("loading");
    const toastId = toast.loading("Atualizando notícia...");

    const result = await handleSubmit();

    if (result.success) {
      setSubmitStatus("success");
      setHasUnsavedChanges(false);

      toast.success("✅ Notícia atualizada com sucesso!", {
        id: toastId,
        description: "As alterações foram salvas no sistema.",
        duration: 5000,
      });

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      setSubmitStatus("error");
      toast.error("❌ Erro ao atualizar notícia", {
        id: toastId,
        description: result.error || "Tente novamente",
        duration: 6000,
      });
    }
  };

  // Função para lidar com mudanças no Switch
  const handleSwitchChange = (checked: boolean) => {
    const event = createInputChangeEvent("destaque", checked);
    handleInputChange(event);
  };

  // Função para lidar com mudanças no Select
  const handleSelectChange = (name: string, value: string) => {
    const event = createInputChangeEvent(name, value);
    handleInputChange(event);
  };

  // Botões de navegação
  const navigationButtons = [
    {
      href: "/admin/noticias",
      icon: RiArrowLeftLine,
      label: "Voltar para Lista",
      className:
        "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
    {
      href: "/admin/dashboard",
      icon: RiBarChartLine,
      label: "Dashboard",
      className:
        "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
  ];

  // Loading durante carregamento
  if (loading || !noticiaDetalhe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-16">
            <Spinner className="w-8 h-8 mx-auto mb-4 text-navy-600 animate-spin" />
            <p className="text-gray-600">Carregando dados da notícia...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Título e Status */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-800 mb-3 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
                  EDITAR NOTÍCIA
                </h1>
                <p className="text-gray-600 text-lg">
                  Editando:{" "}
                  <strong className="text-navy-700">
                    {noticiaDetalhe.titulo}
                  </strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge
                  className={
                    noticiaDetalhe.status === "publicado"
                      ? "bg-green-500 text-white text-sm py-2 px-4 rounded-full"
                      : noticiaDetalhe.status === "rascunho"
                      ? "bg-yellow-500 text-white text-sm py-2 px-4 rounded-full"
                      : "bg-gray-500 text-white text-sm py-2 px-4 rounded-full"
                  }
                >
                  {noticiaDetalhe.status === "publicado" ? (
                    <>
                      <RiCheckLine className="w-4 h-4 mr-2" /> PUBLICADO
                    </>
                  ) : noticiaDetalhe.status === "rascunho" ? (
                    <>
                      <RiAlertLine className="w-4 h-4 mr-2" /> RASCUNHO
                    </>
                  ) : (
                    <>
                      <RiAlertLine className="w-4 h-4 mr-2" /> ARQUIVADO
                    </>
                  )}
                </Badge>

                {noticiaDetalhe.destaque && (
                  <Badge className="bg-yellow-500 text-white text-sm py-2 px-4 rounded-full">
                    <RiStarFill className="w-4 h-4 mr-2" />
                    DESTAQUE
                  </Badge>
                )}
              </div>
            </div>

            {/* Status da operação */}
            {submitStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="bg-green-50 border-green-200 rounded-xl p-4">
                  <RiCheckLine className="h-5 w-5 text-green-600" />
                  <AlertDescription className="ml-3 text-green-800">
                    <strong>✅ Notícia atualizada com sucesso!</strong>{" "}
                    Recarregando página...
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {submitStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="bg-red-50 border-red-200 rounded-xl p-4">
                  <RiAlertLine className="h-5 w-5 text-red-600" />
                  <AlertDescription className="ml-3 text-red-800">
                    <strong>❌ Erro ao atualizar notícia.</strong> Tente
                    novamente ou verifique os dados.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <Alert className="bg-yellow-50 border-yellow-200 rounded-xl p-5">
                  <RiAlertLine className="h-6 w-6 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-base ml-3">
                    <strong>⚠️ Você tem alterações não salvas.</strong> Clique
                    em &quot;Salvar Alterações&quot; para aplicar as mudanças.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-wrap gap-3">
            {navigationButtons.map((button, index) => (
              <motion.div
                key={button.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={button.href}>
                  <Button
                    variant="outline"
                    className={`transition-all duration-300 ${button.className} h-11 px-4`}
                    disabled={saving}
                  >
                    <button.icon className="w-4 h-4 mr-2" />
                    {button.label}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="border-b border-gray-200 pb-6">
                  <CardTitle className="flex items-center text-2xl text-gray-800">
                    <RiNewspaperLine className="w-6 h-6 mr-3 text-navy-600" />
                    Dados da Notícia
                    {hasUnsavedChanges && (
                      <Badge
                        variant="outline"
                        className="ml-3 bg-yellow-100 text-yellow-800 border-yellow-300 text-sm py-1 px-3"
                      >
                        Alterações Pendentes
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleFormSubmit} className="space-y-8">
                    {/* Upload de Imagem */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                      <Label className="text-base font-semibold text-gray-700 flex items-center">
                        <RiImageLine className="w-5 h-5 mr-2 text-navy-500" />
                        Imagem da Notícia
                      </Label>
                      <FileUpload
                        type="image"
                        onFileChange={handleImageUpload}
                        currentFile={formData.imagem || undefined}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-blue-500 transition-all duration-300"
                      />
                      {errors.imagem && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        >
                          <RiAlertLine className="w-3 h-3" />
                          {errors.imagem}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Título */}
                    <motion.div variants={fadeInUp} className="space-y-3">
                      <Label
                        htmlFor="titulo"
                        className="text-base font-semibold text-gray-700 flex items-center"
                      >
                        <RiNewspaperLine className="w-5 h-5 mr-2 text-navy-500" />
                        Título da Notícia *
                      </Label>
                      <Input
                        id="titulo"
                        type="text"
                        name="titulo"
                        value={formData.titulo || ""}
                        onChange={handleInputChange}
                        placeholder="Digite o título da notícia..."
                        required
                        className={`text-lg py-3 h-14 transition-all duration-300 focus:ring-3 border-2 rounded-xl ${
                          errors.titulo
                            ? "border-red-500 focus:ring-red-200"
                            : "focus:ring-blue-500 border-gray-300"
                        }`}
                        disabled={saving}
                      />
                      {errors.titulo && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        >
                          <RiAlertLine className="w-3 h-3" />
                          {errors.titulo}
                        </motion.p>
                      )}
                      <p className="text-sm text-gray-500">
                        {formData.titulo?.length || 0}/200 caracteres
                      </p>
                    </motion.div>

                    {/* Slug */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.1 }}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="slug"
                        className="text-base font-semibold text-gray-700 flex items-center"
                      >
                        <RiExternalLinkLine className="w-5 h-5 mr-2 text-navy-500" />
                        Slug (URL) *
                      </Label>
                      <div className="flex items-center">
                        <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-600 text-sm">
                          /noticias/
                        </span>
                        <Input
                          id="slug"
                          type="text"
                          name="slug"
                          value={formData.slug || ""}
                          onChange={handleInputChange}
                          placeholder="slug-da-noticia"
                          required
                          className={`flex-1 rounded-l-none text-lg py-3 h-14 transition-all duration-300 focus:ring-3 border-2 border-l-0 rounded-xl ${
                            errors.slug
                              ? "border-red-500 focus:ring-red-200"
                              : "focus:ring-blue-500 border-gray-300"
                          }`}
                          disabled={saving}
                        />
                      </div>
                      {errors.slug && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        >
                          <RiAlertLine className="w-3 h-3" />
                          {errors.slug}
                        </motion.p>
                      )}
                      <p className="text-sm text-gray-500">
                        URL: https://pac.org.br/noticias/{formData.slug}
                      </p>
                    </motion.div>

                    {/* Resumo */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="resumo"
                        className="text-base font-semibold text-gray-700"
                      >
                        Resumo *
                      </Label>
                      <Textarea
                        id="resumo"
                        name="resumo"
                        value={formData.resumo || ""}
                        onChange={handleInputChange}
                        placeholder="Digite um resumo breve da notícia..."
                        rows={3}
                        required
                        className={`text-lg transition-all duration-300 focus:ring-3 border-2 rounded-xl ${
                          errors.resumo
                            ? "border-red-500 focus:ring-red-200"
                            : "focus:ring-blue-500 border-gray-300"
                        }`}
                        disabled={saving}
                      />
                      {errors.resumo && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        >
                          <RiAlertLine className="w-3 h-3" />
                          {errors.resumo}
                        </motion.p>
                      )}
                      <p className="text-sm text-gray-500">
                        {formData.resumo?.length || 0}/300 caracteres
                      </p>
                    </motion.div>

                    {/* Conteúdo */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="conteudo"
                        className="text-base font-semibold text-gray-700"
                      >
                        Conteúdo Completo *
                      </Label>
                      <Textarea
                        id="conteudo"
                        name="conteudo"
                        value={formData.conteudo || ""}
                        onChange={handleInputChange}
                        placeholder="Digite o conteúdo completo da notícia..."
                        rows={12}
                        required
                        className={`font-mono text-lg transition-all duration-300 focus:ring-3 border-2 rounded-xl ${
                          errors.conteudo
                            ? "border-red-500 focus:ring-red-200"
                            : "focus:ring-blue-500 border-gray-300"
                        }`}
                        disabled={saving}
                      />
                      {errors.conteudo && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        >
                          <RiAlertLine className="w-3 h-3" />
                          {errors.conteudo}
                        </motion.p>
                      )}
                      <p className="text-sm text-gray-500">
                        {formData.conteudo?.length || 0} caracteres
                      </p>
                    </motion.div>

                    {/* Categoria e Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Categoria */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.4 }}
                        className="space-y-3"
                      >
                        <Label
                          htmlFor="categoria"
                          className="text-base font-semibold text-gray-700"
                        >
                          Categoria
                        </Label>
                        <Select
                          value={formData.categoria || "Operações"}
                          onValueChange={(value) =>
                            handleSelectChange("categoria", value)
                          }
                          disabled={saving}
                        >
                          <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIAS.map((categoria) => (
                              <SelectItem key={categoria} value={categoria}>
                                {categoria}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      {/* Data de Publicação */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                      >
                        <Label
                          htmlFor="data_publicacao"
                          className="text-base font-semibold text-gray-700 flex items-center"
                        >
                          <RiCalendarLine className="w-5 h-5 mr-2 text-navy-500" />
                          Data de Publicação
                        </Label>
                        <Input
                          id="data_publicacao"
                          type="date"
                          name="data_publicacao"
                          value={formData.data_publicacao || ""}
                          onChange={handleInputChange}
                          className="text-lg py-3 h-14 transition-all duration-300 focus:ring-3 border-2 rounded-xl focus:ring-blue-500 border-gray-300"
                          disabled={saving}
                        />
                      </motion.div>
                    </div>

                    {/* Status e Destaque */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Status */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.6 }}
                        className="space-y-3"
                      >
                        <Label
                          htmlFor="status"
                          className="text-base font-semibold text-gray-700"
                        >
                          Status
                        </Label>
                        <Select
                          value={formData.status || "rascunho"}
                          onValueChange={(value) =>
                            handleSelectChange("status", value)
                          }
                          disabled={saving}
                        >
                          <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="rascunho"
                              className="text-base py-3"
                            >
                              Rascunho
                            </SelectItem>
                            <SelectItem
                              value="publicado"
                              className="text-base py-3"
                            >
                              Publicado
                            </SelectItem>
                            <SelectItem
                              value="arquivado"
                              className="text-base py-3"
                            >
                              Arquivado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>

                      {/* Destaque */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.7 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                          <div>
                            <Label
                              htmlFor="destaque"
                              className="text-base font-semibold text-gray-700 cursor-pointer flex items-center"
                            >
                              <RiStarFill className="w-5 h-5 mr-2 text-yellow-500" />
                              Notícia em Destaque
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Destaque esta notícia no site principal
                            </p>
                          </div>
                          <Switch
                            checked={formData.destaque || false}
                            onCheckedChange={handleSwitchChange}
                            disabled={saving}
                            className="scale-110"
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Botões de Ação */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.9 }}
                      className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          type="submit"
                          disabled={saving || !hasUnsavedChanges}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 h-14 text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
                        >
                          {saving ? (
                            <>
                              <Spinner className="w-5 h-5 mr-3" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <RiSaveLine className="w-5 h-5 mr-3" />
                              {hasUnsavedChanges
                                ? "Salvar Alterações"
                                : "Nenhuma Alteração"}
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Link href="/admin/noticias">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-gray-600 text-gray-600 hover:bg-gray-100 hover:text-gray-900 py-4 h-14 text-lg transition-all duration-300 rounded-xl"
                            disabled={saving}
                          >
                            <RiArrowLeftLine className="w-5 h-5 mr-3" />
                            Cancelar
                          </Button>
                        </Link>
                      </motion.div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Informações */}
          <div className="space-y-8">
            {/* Informações da Notícia */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <RiUserLine className="w-6 h-6 mr-3 text-navy-600" />
                    Informações da Notícia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">ID:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                        {noticiaDetalhe.id}
                      </code>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Autor:</span>
                      <span className="font-medium text-right">
                        {noticiaDetalhe.autor?.full_name || "Não definido"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Criada em:</span>
                      <span className="font-medium">
                        {new Date(noticiaDetalhe.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Última atualização:</span>
                      <span className="font-medium">
                        {new Date(noticiaDetalhe.updated_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Visualizações:</span>
                      <Badge className="bg-blue-500 text-white">
                        {noticiaDetalhe.views} visualizações
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Status Atual */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl text-gray-800">
                    Status Atual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Status:</span>
                      <Badge
                        className={
                          noticiaDetalhe.status === "publicado"
                            ? "bg-green-500 text-white"
                            : noticiaDetalhe.status === "rascunho"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-500 text-white"
                        }
                      >
                        {noticiaDetalhe.status === "publicado"
                          ? "PUBLICADO"
                          : noticiaDetalhe.status === "rascunho"
                          ? "RASCUNHO"
                          : "ARQUIVADO"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Destaque:</span>
                      <Badge
                        className={
                          noticiaDetalhe.destaque
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-400 text-white"
                        }
                      >
                        {noticiaDetalhe.destaque ? (
                          <>
                            <RiStarFill className="w-3 h-3 mr-1" /> SIM
                          </>
                        ) : (
                          "NÃO"
                        )}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">URL Pública:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `/noticias/${noticiaDetalhe.slug}`,
                            "_blank"
                          )
                        }
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <RiExternalLinkLine className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ações Rápidas */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl text-gray-800">
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    onClick={() =>
                      window.open(`/noticias/${noticiaDetalhe.slug}`, "_blank")
                    }
                    disabled={noticiaDetalhe.status !== "publicado"}
                  >
                    <RiExternalLinkLine className="w-4 h-4 mr-2" />
                    Ver Público
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={() =>
                      router.push(
                        `/admin/noticias/${noticiaDetalhe.id}/duplicar`
                      )
                    }
                    disabled={saving}
                  >
                    <RiSaveLine className="w-4 h-4 mr-2" />
                    Duplicar Notícia
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() => {
                      if (
                        confirm(
                          "Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita."
                        )
                      ) {
                        // Implementar exclusão
                        toast.error(
                          "Funcionalidade de exclusão não implementada"
                        );
                      }
                    }}
                    disabled={saving}
                  >
                    <RiDeleteBinLine className="w-4 h-4 mr-2" />
                    Excluir Notícia
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
