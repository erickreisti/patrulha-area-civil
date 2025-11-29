"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  RiNewspaperLine,
  RiSaveLine,
  RiCloseLine,
  RiArrowLeftLine,
  RiEyeLine,
  RiCalendarLine,
  RiImageLine,
  RiDeleteBinLine,
  RiBarChartLine,
  RiHomeLine,
  RiCheckLine,
  RiAlertLine,
  RiUserLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import { NoticiaFormData, NoticiaStatus, NoticiaWithAutor } from "@/types";

const CATEGORIAS = [
  "Operações",
  "Treinamento",
  "Cooperação",
  "Projetos Sociais",
  "Equipamentos",
  "Eventos",
  "Comunicação",
];

interface PageProps {
  params: {
    id: string;
  };
}

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
    },
  },
};

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

export default function EditarNoticiaPage({ params }: PageProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noticia, setNoticia] = useState<NoticiaWithAutor | null>(null);
  const [formData, setFormData] = useState<NoticiaFormData>({
    titulo: "",
    slug: "",
    conteudo: "",
    resumo: "",
    imagem: null,
    categoria: "Operações",
    destaque: false,
    data_publicacao: new Date().toISOString().split("T")[0],
    status: "rascunho",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Componente de placeholder para imagem
  const ImageWithFallback = ({
    src,
    alt,
    className = "w-16 h-16",
  }: {
    src: string | null;
    alt: string;
    className?: string;
  }) => {
    const [imageError, setImageError] = useState(false);

    if (!src || imageError) {
      return (
        <div
          className={`${className} rounded flex items-center justify-center bg-gray-200`}
        >
          <RiImageLine className="w-8 h-8 text-gray-400" />
        </div>
      );
    }

    return (
      <div
        className={`${className} rounded overflow-hidden relative bg-gray-200`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          priority={false}
          loading="lazy"
        />
      </div>
    );
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`🔄 Buscando notícia ID: ${params.id}...`);

      const { data: noticiaData, error } = await supabase
        .from("noticias")
        .select(
          `
          *,
          autor:profiles(full_name, graduacao)
        `
        )
        .eq("id", params.id)
        .single();

      if (error) throw error;
      if (!noticiaData) throw new Error("Notícia não encontrada");

      setNoticia(noticiaData);
      setFormData({
        titulo: noticiaData.titulo,
        slug: noticiaData.slug,
        conteudo: noticiaData.conteudo,
        resumo: noticiaData.resumo,
        imagem: noticiaData.imagem,
        categoria: noticiaData.categoria,
        destaque: noticiaData.destaque,
        data_publicacao: noticiaData.data_publicacao,
        status: noticiaData.status,
      });
    } catch (error: unknown) {
      console.error("❌ Erro ao carregar notícia:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar notícia: ${errorMessage}`);
      router.push("/admin/noticias");
    } finally {
      setLoading(false);
    }
  }, [params.id, supabase, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .substring(0, 100);
  };

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value;
    setFormData((prev) => ({
      ...prev,
      titulo,
      slug: generateSlug(titulo),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.titulo.trim()) errors.push("Título é obrigatório");
    if (!formData.slug.trim()) errors.push("Slug é obrigatório");
    if (!formData.resumo.trim()) errors.push("Resumo é obrigatório");
    if (!formData.conteudo.trim()) errors.push("Conteúdo é obrigatório");
    if (formData.slug.length < 3)
      errors.push("Slug deve ter pelo menos 3 caracteres");

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug)) {
      errors.push(
        "Slug deve conter apenas letras minúsculas, números e hífens"
      );
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      return;
    }

    try {
      const { data: existingSlug } = await supabase
        .from("noticias")
        .select("id")
        .eq("slug", formData.slug)
        .neq("id", params.id)
        .single();

      if (existingSlug) {
        setErrors([
          "Já existe outra notícia com este slug. Por favor, altere o título para gerar um slug único.",
        ]);
        setSaving(false);
        return;
      }

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("noticias")
        .update(updateData)
        .eq("id", params.id);

      if (error) throw error;

      toast.success("Notícia atualizada com sucesso!");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin/noticias");
      }, 1500);
    } catch (error: unknown) {
      console.error("❌ Erro ao atualizar notícia:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setErrors([`Erro ao atualizar notícia: ${errorMessage}`]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("noticias")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      toast.success("Notícia excluída com sucesso!");
      router.push("/admin/noticias");
    } catch (error: unknown) {
      console.error("❌ Erro ao excluir notícia:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao excluir notícia: ${errorMessage}`);
    }
  };

  const handleViewPublic = () => {
    if (formData.status === "publicado") {
      window.open(`/noticias/${formData.slug}`, "_blank");
    } else {
      toast.warning(
        "Esta notícia não está publicada. Publique-a primeiro para visualizar publicamente."
      );
    }
  };

  const navigationButtons = [
    {
      href: "/admin/noticias",
      icon: RiArrowLeftLine,
      label: "Voltar",
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
      href: "/perfil",
      icon: RiUserLine,
      label: "Meu Perfil",
      className:
        "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"
            />
            <p className="text-gray-600">Carregando notícia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <RiNewspaperLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Notícia Não Encontrada
            </h2>
            <p className="text-gray-600 mb-6">
              A notícia que você está tentando editar não existe.
            </p>
            <Link href="/admin/noticias">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                Voltar para Notícias
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
              EDITAR NOTÍCIA
            </h1>
            <p className="text-gray-600">Editando: {noticia.titulo}</p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
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
                    className={`transition-all duration-300 ${button.className}`}
                  >
                    <button.icon className="w-4 h-4 mr-2" />
                    {button.label}
                  </Button>
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleViewPublic}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-300"
                disabled={formData.status !== "publicado"}
              >
                <RiExternalLinkLine className="w-4 h-4 mr-2" />
                Ver Público
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Alertas */}
        <div className="space-y-4 mb-6">
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <RiAlertLine className="w-5 h-5 text-red-500" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-red-800">
                        Erros no formulário
                      </p>
                      <div className="text-sm text-red-600">
                        {errors.map((error, index) => (
                          <p key={index}>• {error}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                    >
                      <RiCheckLine className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-green-800">Sucesso!</p>
                      <p className="text-sm text-green-600">
                        Notícia atualizada com sucesso. Redirecionando...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <RiNewspaperLine className="w-5 h-5 mr-2 text-navy-600" />
                    Editar Notícia
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Preview da Imagem */}
                    {formData.imagem && (
                      <motion.div
                        variants={fadeInUp}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border"
                      >
                        <ImageWithFallback
                          src={formData.imagem}
                          alt="Imagem da notícia"
                          className="w-16 h-16"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Imagem atual
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {formData.imagem}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(formData.imagem!, "_blank")
                            }
                            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            <RiExternalLinkLine className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Título */}
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label
                        htmlFor="titulo"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Título da Notícia *
                      </Label>
                      <Input
                        id="titulo"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleTituloChange}
                        placeholder="Digite o título da notícia..."
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-gray-500 text-sm transition-colors duration-300">
                        {formData.titulo.length}/200 caracteres
                      </p>
                    </motion.div>

                    {/* Slug */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label
                        htmlFor="slug"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Slug (URL) *
                      </Label>
                      <div className="flex items-center">
                        <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-600 text-sm transition-colors duration-300">
                          /noticias/
                        </span>
                        <Input
                          id="slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          placeholder="slug-da-noticia"
                          className="flex-1 rounded-l-none transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Resumo */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <Label
                        htmlFor="resumo"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Resumo *
                      </Label>
                      <Textarea
                        id="resumo"
                        name="resumo"
                        value={formData.resumo}
                        onChange={handleInputChange}
                        placeholder="Digite um resumo breve da notícia..."
                        rows={3}
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 resize-none"
                        required
                      />
                      <p className="text-gray-500 text-sm transition-colors duration-300">
                        {formData.resumo.length}/300 caracteres
                      </p>
                    </motion.div>

                    {/* Conteúdo */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label
                        htmlFor="conteudo"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Conteúdo Completo *
                      </Label>
                      <Textarea
                        id="conteudo"
                        name="conteudo"
                        value={formData.conteudo}
                        onChange={handleInputChange}
                        placeholder="Digite o conteúdo completo da notícia..."
                        rows={12}
                        className="font-mono text-sm transition-all duration-300 focus:ring-2 focus:ring-blue-500 resize-none"
                        required
                      />
                      <p className="text-gray-500 text-sm transition-colors duration-300">
                        {formData.conteudo.length} caracteres
                      </p>
                    </motion.div>

                    {/* URL da Imagem */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.4 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">
                        URL da Imagem
                      </Label>
                      <div className="flex items-center">
                        <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-600 text-sm transition-colors duration-300">
                          <RiExternalLinkLine className="w-3 h-3" />
                        </span>
                        <Input
                          value={formData.imagem || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              imagem: e.target.value || null,
                            }))
                          }
                          placeholder="https://exemplo.com/imagem.jpg"
                          className="flex-1 rounded-l-none transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </motion.div>

                    {/* Botões de Ação */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          type="submit"
                          disabled={saving}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <RiSaveLine className="w-4 h-4 mr-2" />
                              </motion.div>
                              Salvando...
                            </>
                          ) : (
                            <>
                              <RiSaveLine className="w-4 h-4 mr-2" />
                              Salvar Alterações
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          type="button"
                          onClick={handleDelete}
                          variant="outline"
                          className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white py-3 transition-colors duration-300"
                        >
                          <RiDeleteBinLine className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          type="button"
                          onClick={() => router.push("/admin/noticias")}
                          variant="outline"
                          className="w-full border-gray-600 text-gray-600 hover:bg-gray-100 hover:text-gray-900 py-3 transition-all duration-300"
                        >
                          <RiCloseLine className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status e Publicação */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Publicação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Data de Publicação */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="data_publicacao"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Data de Publicação
                    </Label>
                    <Input
                      id="data_publicacao"
                      name="data_publicacao"
                      type="date"
                      value={formData.data_publicacao}
                      onChange={handleInputChange}
                      className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: NoticiaStatus) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="publicado">Publicado</SelectItem>
                        <SelectItem value="arquivado">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Destaque */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border transition-all duration-300 hover:bg-gray-100 hover:shadow-sm">
                    <Label
                      htmlFor="destaque"
                      className="text-sm font-semibold text-gray-700 cursor-pointer"
                    >
                      Notícia em Destaque
                    </Label>
                    <Switch
                      id="destaque"
                      checked={formData.destaque}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, destaque: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Categoria */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoria: value }))
                    }
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </motion.div>

            {/* Informações */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Informações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">ID:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded transition-colors duration-300">
                      {noticia.id}
                    </code>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Criada em:</span>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <RiCalendarLine className="w-3 h-3" />
                      {new Date(noticia.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Última atualização:</span>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <RiCalendarLine className="w-3 h-3" />
                      {new Date(noticia.updated_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Autor:</span>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <RiUserLine className="w-3 h-3" />
                      {noticia.autor?.full_name || "Não definido"}
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
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Status Atual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      className={
                        formData.status === "publicado"
                          ? "bg-green-600 text-white"
                          : formData.status === "rascunho"
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-500 text-white"
                      }
                    >
                      {formData.status === "publicado" ? (
                        <>
                          <RiEyeLine className="w-3 h-3 mr-1" /> Publicado
                        </>
                      ) : formData.status === "rascunho" ? (
                        "Rascunho"
                      ) : (
                        "Arquivado"
                      )}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Destaque:</span>
                    <Badge
                      className={
                        formData.destaque
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-400 text-white"
                      }
                    >
                      {formData.destaque ? (
                        <>
                          <RiCheckLine className="w-3 h-3 mr-1" /> Sim
                        </>
                      ) : (
                        "Não"
                      )}
                    </Badge>
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
