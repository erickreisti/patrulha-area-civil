"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiRefreshLine,
  RiImageLine,
  RiVideoLine,
  RiAlertLine,
  RiCloseLine,
  RiBarChartLine,
  RiHomeLine,
  RiUserLine,
  RiFolderLine,
  RiCheckLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";

interface FormData {
  nome: string;
  slug: string;
  descricao: string;
  tipo: "fotos" | "videos";
  status: boolean;
  ordem: number;
}

interface FormErrors {
  nome?: string;
  slug?: string;
  ordem?: string;
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

const slideInRight = {
  hidden: { opacity: 0, x: 20 },
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

export default function CriarCategoriaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    slug: "",
    descricao: "",
    tipo: "fotos",
    status: true,
    ordem: 0,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    } else if (formData.nome.length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug é obrigatório";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug deve conter apenas letras minúsculas, números e hífens";
    }

    if (formData.ordem < 0) {
      newErrors.ordem = "Ordem não pode ser negativa";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário.");
      return;
    }

    try {
      setLoading(true);

      const { error: insertError } = await supabase
        .from("galeria_categorias")
        .insert([
          {
            nome: formData.nome.trim(),
            slug: formData.slug.trim().toLowerCase(),
            descricao: formData.descricao.trim() || null,
            tipo: formData.tipo,
            status: formData.status,
            ordem: formData.ordem,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast.success("Categoria criada com sucesso!");

      // Redirecionar para a lista
      setTimeout(() => {
        router.push("/admin/galeria/categorias");
      }, 1000);
    } catch (error: unknown) {
      console.error("Erro ao criar categoria:", error);

      if (error && typeof error === "object" && "code" in error) {
        const supabaseError = error as { code: string };
        if (supabaseError.code === "23505") {
          toast.error("Já existe uma categoria com este nome ou slug.");
        } else {
          toast.error("Não foi possível criar a categoria.");
        }
      } else {
        toast.error("Não foi possível criar a categoria.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (nome: string): string => {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setFormData((prev) => ({
      ...prev,
      nome,
      slug: generateSlug(nome),
    }));
    if (formErrors.nome) {
      setFormErrors((prev) => ({ ...prev, nome: "" }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase();
    setFormData((prev) => ({ ...prev, slug }));
    if (formErrors.slug) {
      setFormErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  const navigationButtons = [
    {
      href: "/admin/galeria/categorias",
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
              CRIAR CATEGORIA
            </h1>
            <p className="text-gray-600">
              Adicione uma nova categoria para organizar a galeria
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
                    <RiFolderLine className="w-5 h-5 mr-2 text-navy-600" />
                    Nova Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nome */}
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label
                        htmlFor="nome"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Nome da Categoria *
                      </Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={handleNomeChange}
                        placeholder="Ex: Eventos Especiais, Treinamentos, etc."
                        className={`transition-all duration-300 ${
                          formErrors.nome
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "focus:ring-blue-500"
                        }`}
                      />
                      {formErrors.nome && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-600 text-sm flex items-center gap-1"
                        >
                          <RiAlertLine className="w-3 h-3" />
                          {formErrors.nome}
                        </motion.p>
                      )}
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
                          /galeria/
                        </span>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={handleSlugChange}
                          placeholder="ex: eventos-especiais"
                          className={`flex-1 rounded-l-none transition-all duration-300 ${
                            formErrors.slug
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "focus:ring-blue-500"
                          }`}
                        />
                      </div>
                      {formErrors.slug && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-600 text-sm flex items-center gap-1"
                        >
                          <RiAlertLine className="w-3 h-3" />
                          {formErrors.slug}
                        </motion.p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          URL: https://seusite.com/galeria/{formData.slug}
                        </span>
                      </div>
                    </motion.div>

                    {/* Tipo */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">
                        Tipo de Conteúdo *
                      </Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value: "fotos" | "videos") =>
                          setFormData((prev) => ({ ...prev, tipo: value }))
                        }
                      >
                        <SelectTrigger className="transition-all duration-300 hover:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fotos">
                            <div className="flex items-center gap-2">
                              <RiImageLine className="w-4 h-4 text-blue-600" />
                              <span>Fotos</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="videos">
                            <div className="flex items-center gap-2">
                              <RiVideoLine className="w-4 h-4 text-purple-600" />
                              <span>Vídeos</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Descrição */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label
                        htmlFor="descricao"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Descrição
                      </Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            descricao: e.target.value,
                          }))
                        }
                        placeholder="Descreva o propósito desta categoria..."
                        rows={4}
                        maxLength={500}
                        className="transition-all duration-300 focus:ring-blue-500 resize-none"
                      />
                      <p className="text-gray-500 text-sm transition-colors duration-300">
                        {formData.descricao.length}/500 caracteres
                      </p>
                    </motion.div>

                    {/* Ordem e Status */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {/* Ordem */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="ordem"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Ordem de Exibição
                        </Label>
                        <Input
                          id="ordem"
                          type="number"
                          min="0"
                          value={formData.ordem}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              ordem: parseInt(e.target.value) || 0,
                            }))
                          }
                          className={`transition-all duration-300 ${
                            formErrors.ordem
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "focus:ring-blue-500"
                          }`}
                        />
                        {formErrors.ordem && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 text-sm flex items-center gap-1"
                          >
                            <RiAlertLine className="w-3 h-3" />
                            {formErrors.ordem}
                          </motion.p>
                        )}
                        <p className="text-gray-500 text-sm transition-colors duration-300">
                          Número menor aparece primeiro
                        </p>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Status da Categoria
                        </Label>
                        <motion.div
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border transition-all duration-300 hover:bg-gray-100 hover:shadow-sm"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Switch
                            checked={formData.status}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                status: checked,
                              }))
                            }
                          />
                          <div>
                            <p className="font-medium text-gray-800 flex items-center gap-2">
                              {formData.status ? (
                                <>
                                  <RiEyeLine className="w-4 h-4 text-green-600" />
                                  Ativa
                                </>
                              ) : (
                                <>
                                  <RiEyeOffLine className="w-4 h-4 text-gray-600" />
                                  Inativa
                                </>
                              )}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {formData.status
                                ? "Visível no site"
                                : "Oculta no site"}
                            </p>
                          </div>
                        </motion.div>
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
                          disabled={loading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <RiRefreshLine className="w-4 h-4 mr-2" />
                              </motion.div>
                              Criando...
                            </>
                          ) : (
                            <>
                              <RiSaveLine className="w-4 h-4 mr-2" />
                              Criar Categoria
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
                          variant="outline"
                          disabled={loading}
                          onClick={() =>
                            router.push("/admin/galeria/categorias")
                          }
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

          {/* Informações e Ajuda */}
          <div className="space-y-6">
            {/* Status */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideInRight}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Tipo:</span>
                    <Badge
                      className={
                        formData.tipo === "fotos"
                          ? "bg-blue-600 text-white"
                          : "bg-purple-600 text-white"
                      }
                    >
                      {formData.tipo === "fotos" ? "Fotos" : "Vídeos"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      className={
                        formData.status
                          ? "bg-green-600 text-white"
                          : "bg-gray-500 text-white"
                      }
                    >
                      {formData.status ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Ordem:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded transition-colors duration-300">
                      {formData.ordem}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ajuda */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideInRight}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                    <RiAlertLine className="w-4 h-4 text-amber-500" />
                    Informações Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Campos com <strong>*</strong> são obrigatórios
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      O <strong>slug</strong> deve ser único e será usado na URL
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Categorias <strong>inativas</strong> não aparecem no site
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      A <strong>ordem</strong> define a posição na listagem
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Escolha o <strong>tipo</strong> correto para organizar o
                      conteúdo
                    </span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
