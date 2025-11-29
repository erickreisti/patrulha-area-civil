"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiNewspaperFill,
  RiSaveFill,
  RiArrowLeftFill,
  RiCalendarFill,
  RiImageFill,
  RiBarChartFill,
  RiHomeFill,
  RiCloseFill,
  RiLink,
  RiCheckFill,
  RiAlertFill,
  RiStarFill,
} from "react-icons/ri";

// Categorias pré-definidas
const CATEGORIAS = [
  "Operações",
  "Treinamento",
  "Cooperação",
  "Projetos Sociais",
  "Equipamentos",
  "Eventos",
  "Comunicação",
];

export default function CriarNoticiaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    slug: "",
    conteudo: "",
    resumo: "",
    categoria: "Operações",
    destaque: false,
    data_publicacao: new Date().toISOString().split("T")[0],
    status: "rascunho" as "rascunho" | "publicado" | "arquivado",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Gerar slug automaticamente
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

    if (!formData.titulo.trim()) {
      errors.push("Título é obrigatório");
    }

    if (!formData.slug.trim()) {
      errors.push("Slug é obrigatório");
    }

    if (!formData.resumo.trim()) {
      errors.push("Resumo é obrigatório");
    }

    if (!formData.conteudo.trim()) {
      errors.push("Conteúdo é obrigatório");
    }

    if (formData.slug.length < 3) {
      errors.push("Slug deve ter pelo menos 3 caracteres");
    }

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
    setLoading(true);
    setErrors([]);

    // Validar formulário
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // Verificar se slug já existe
      const { data: existingSlug } = await supabase
        .from("noticias")
        .select("id")
        .eq("slug", formData.slug)
        .single();

      if (existingSlug) {
        setErrors(["Já existe outra notícia com este slug. Altere o título."]);
        setLoading(false);
        return;
      }

      // Buscar usuário atual para o autor_id
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrors(["Usuário não autenticado"]);
        setLoading(false);
        return;
      }

      console.log("🔄 Criando nova notícia...", formData);

      // Criar notícia
      const { error } = await supabase.from("noticias").insert([
        {
          titulo: formData.titulo.trim(),
          slug: formData.slug.trim(),
          conteudo: formData.conteudo.trim(),
          resumo: formData.resumo.trim(),
          imagem: null,
          categoria: formData.categoria,
          autor_id: user.id,
          destaque: formData.destaque,
          data_publicacao: formData.data_publicacao,
          status: formData.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("❌ Erro ao criar notícia:", error);
        throw error;
      }

      console.log("✅ Notícia criada com sucesso!");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin/noticias");
      }, 1500);
    } catch (error: unknown) {
      console.error("❌ Erro ao criar notícia:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setErrors([`Erro ao criar notícia: ${errorMessage}`]);
    } finally {
      setLoading(false);
    }
  };

  const navigationButtons = [
    {
      href: "/admin/noticias",
      icon: RiArrowLeftFill,
      label: "Voltar",
      className:
        "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
    {
      href: "/admin/dashboard",
      icon: RiBarChartFill,
      label: "Dashboard",
      className:
        "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeFill,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
  ];

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
              NOVA NOTÍCIA
            </h1>
            <p className="text-gray-600">
              Crie uma nova notícia para o site da Patrulha Aérea Civil
            </p>
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
                      <RiAlertFill className="w-5 h-5 text-red-500" />
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
                      <RiCheckFill className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-green-800">Sucesso!</p>
                      <p className="text-sm text-green-600">
                        Notícia criada com sucesso. Redirecionando...
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
                    <RiNewspaperFill className="w-5 h-5 mr-2 text-navy-600" />
                    Criar Nova Notícia
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="w-full text-lg py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 transition-colors duration-300">
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
                          <RiLink className="w-3 h-3" />
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
                      <div className="flex items-center gap-2 text-xs text-gray-500 transition-colors duration-300">
                        <RiLink className="w-3 h-3" />
                        <span>
                          URL: https://seusite.com/noticias/{formData.slug}
                        </span>
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
                        className="w-full resize-none transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 transition-colors duration-300">
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
                        className="w-full resize-none font-mono text-sm transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 transition-colors duration-300">
                        {formData.conteudo.length} caracteres
                      </p>
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
                          disabled={loading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <RiSaveFill className="w-4 h-4 mr-2" />
                              </motion.div>
                              Criando...
                            </>
                          ) : (
                            <>
                              <RiSaveFill className="w-4 h-4 mr-2" />
                              Criar Notícia
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
                          onClick={() => router.push("/admin/noticias")}
                          variant="outline"
                          className="w-full border-gray-600 text-gray-600 hover:bg-gray-100 hover:text-gray-900 py-3 transition-all duration-300"
                        >
                          <RiCloseFill className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Configurações */}
          <div className="space-y-6">
            {/* Imagem de Capa */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-gray-800">
                    <RiImageFill className="w-4 h-4 mr-2 text-blue-600" />
                    Imagem de Capa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-300 hover:border-blue-500 hover:bg-blue-50">
                    <RiImageFill className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload de imagem (em desenvolvimento)
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-xs border-gray-700 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                    >
                      Selecionar Imagem
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 transition-colors duration-300">
                    Sistema de upload será implementado em breve
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Configurações de Publicação */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-gray-800">
                    <RiCalendarFill className="w-4 h-4 mr-2 text-blue-600" />
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
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(
                        value: "rascunho" | "publicado" | "arquivado"
                      ) => setFormData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="transition-all duration-300 hover:border-blue-500 focus:ring-blue-500">
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
                    <div>
                      <Label
                        htmlFor="destaque"
                        className="text-sm font-semibold text-gray-700 cursor-pointer"
                      >
                        Notícia em Destaque
                      </Label>
                      <p className="text-xs text-gray-500">
                        {formData.destaque
                          ? "⭐ Destacada no site"
                          : "Listagem normal"}
                      </p>
                    </div>
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
              transition={{ delay: 0.5 }}
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
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500 focus:ring-blue-500">
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

            {/* Preview Rápido */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Preview Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Título:</span>
                      <span className="font-medium">
                        {formData.titulo || "Não definido"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slug:</span>
                      <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {formData.slug || "Não definido"}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span>Categoria:</span>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        {formData.categoria}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge
                        className={
                          formData.status === "rascunho"
                            ? "bg-yellow-500 text-white"
                            : formData.status === "publicado"
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }
                      >
                        {formData.status.toUpperCase()}
                      </Badge>
                    </div>
                    {formData.destaque && (
                      <div className="flex justify-between">
                        <span>Destaque:</span>
                        <Badge className="bg-yellow-500 text-white animate-pulse">
                          <RiStarFill className="w-3 h-3 mr-1" />
                          DESTAQUE
                        </Badge>
                      </div>
                    )}
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
