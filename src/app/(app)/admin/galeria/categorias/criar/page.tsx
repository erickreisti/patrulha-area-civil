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
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import {
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaImage,
  FaVideo,
  FaExclamationTriangle,
  FaTimes,
  FaChartBar,
  FaHome,
  FaUser,
} from "react-icons/fa";

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

// Interface para erro do Supabase
interface SupabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

function isSupabaseError(error: unknown): error is SupabaseError {
  return typeof error === "object" && error !== null && "message" in error;
}

export default function CriarCategoriaPage() {
  const router = useRouter();
  const { success, error } = useToast();
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
      error("Por favor, corrija os erros no formulário.");
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

      success("Categoria criada com sucesso!");

      // Redirecionar para a lista
      setTimeout(() => {
        router.push("/admin/galeria/categorias");
      }, 1000);
    } catch (err) {
      console.error("Erro ao criar categoria:", err);

      if (isSupabaseError(err) && err.code === "23505") {
        error("Já existe uma categoria com este nome ou slug.");
      } else {
        error("Não foi possível criar a categoria.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              CRIAR CATEGORIA
            </h1>
            <p className="text-gray-600">
              Adicione uma nova categoria para organizar a galeria
            </p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Link href="/admin/galeria/categorias">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>

            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                <FaChartBar className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/perfil">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaUser className="w-4 h-4 mr-2" />
                Meu Perfil
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                <FaHome className="w-4 h-4 mr-2" />
                Voltar ao Site
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center text-xl">
                  <FaImage className="w-5 h-5 mr-2 text-navy" />
                  Nova Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-semibold">
                      Nome da Categoria *
                    </Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={handleNomeChange}
                      placeholder="Ex: Eventos Especiais, Treinamentos, etc."
                      className={
                        formErrors.nome
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {formErrors.nome && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaExclamationTriangle className="w-3 h-3" />
                        {formErrors.nome}
                      </p>
                    )}
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold">
                      Slug (URL) *
                    </Label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-600">
                        /galeria/
                      </span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        placeholder="ex: eventos-especiais"
                        className={`flex-1 rounded-l-none ${
                          formErrors.slug
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    {formErrors.slug && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaExclamationTriangle className="w-3 h-3" />
                        {formErrors.slug}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        URL: https://seusite.com/galeria/{formData.slug}
                      </span>
                    </div>
                  </div>

                  {/* Tipo */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Tipo de Conteúdo *
                    </Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: "fotos" | "videos") =>
                        setFormData((prev) => ({ ...prev, tipo: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fotos">
                          <div className="flex items-center gap-2">
                            <FaImage className="w-4 h-4 text-blue-600" />
                            <span>Fotos</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="videos">
                          <div className="flex items-center gap-2">
                            <FaVideo className="w-4 h-4 text-purple-600" />
                            <span>Vídeos</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="descricao"
                      className="text-sm font-semibold"
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
                    />
                    <p className="text-gray-500 text-sm">
                      {formData.descricao.length}/500 caracteres
                    </p>
                  </div>

                  {/* Ordem e Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ordem */}
                    <div className="space-y-2">
                      <Label htmlFor="ordem" className="text-sm font-semibold">
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
                        className={
                          formErrors.ordem
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                      />
                      {formErrors.ordem && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {formErrors.ordem}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">
                        Número menor aparece primeiro
                      </p>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Status da Categoria
                      </Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
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
                          <p className="font-medium text-gray-800">
                            {formData.status ? "Ativa" : "Inativa"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {formData.status
                              ? "Visível no site"
                              : "Oculta no site"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 py-3"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Criar Categoria
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={() => router.push("/admin/galeria/categorias")}
                      className="border-slate-700 text-slate-700 hover:bg-slate-100 hover:text-slate-900 py-3"
                    >
                      <FaTimes className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informações e Ajuda */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Configurações</CardTitle>
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
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {formData.ordem}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Ajuda */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FaExclamationTriangle className="w-4 h-4 text-yellow-500" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>
                  • Campos com <strong>*</strong> são obrigatórios
                </p>
                <p>
                  • O <strong>slug</strong> deve ser único e será usado na URL
                </p>
                <p>
                  • Categorias <strong>inativas</strong> não aparecem no site
                </p>
                <p>
                  • A <strong>ordem</strong> define a posição na listagem
                </p>
                <p>
                  • Escolha o <strong>tipo</strong> correto para organizar o
                  conteúdo
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
