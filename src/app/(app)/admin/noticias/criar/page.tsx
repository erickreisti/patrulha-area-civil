// src/app/(app)/admin/noticias/criar/page.tsx - PADRONIZADO
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import {
  FaNewspaper,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaLink,
  FaImage,
  FaHome,
  FaChartBar,
} from "react-icons/fa";
import { NoticiaFormData, NoticiaStatus } from "@/types/noticias";

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
  const [user, setUser] = useState<any>(null);
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };

    fetchUser();
  }, [supabase]);

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
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
    setLoading(true);

    const errors = validateForm();
    if (errors.length > 0) {
      alert("Erros no formulário:\n" + errors.join("\n"));
      setLoading(false);
      return;
    }

    try {
      if (!user) throw new Error("Usuário não autenticado");

      const { data: existingSlug } = await supabase
        .from("noticias")
        .select("id")
        .eq("slug", formData.slug)
        .single();

      if (existingSlug) {
        alert(
          "Já existe uma notícia com este slug. Por favor, altere o título para gerar um slug único."
        );
        setLoading(false);
        return;
      }

      const noticiaData = {
        ...formData,
        autor_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("noticias")
        .insert([noticiaData])
        .select()
        .single();

      if (error) throw error;

      if (formData.status === "publicado") {
        router.push("/admin/noticias");
      } else {
        router.push(`/admin/noticias/${data.id}`);
      }
    } catch (error: any) {
      console.error("❌ Erro ao criar notícia:", error);
      alert(`Erro ao criar notícia: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    alert(
      "Preview da notícia:\n\n" +
        `Título: ${formData.titulo}\n` +
        `Slug: ${formData.slug}\n` +
        `Status: ${formData.status}\n` +
        `Destaque: ${formData.destaque ? "Sim" : "Não"}\n\n` +
        "Em produção, isso abriria uma visualização real da notícia."
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              CRIAR NOTÍCIA
            </h1>
            <p className="text-gray-600">
              Preencha os dados para criar uma nova notícia
            </p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            {/* ⚫ CINZA - Navegação Neutra */}
            <Link href="/admin/noticias">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-700 hover:bg-slate-100"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>

            {/* 🟣 ROXO - Funcionalidades Administrativas */}
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                <FaChartBar className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            {/* ⚫ CINZA - Navegação Neutra */}
            <Link href="/">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-700 hover:bg-slate-100"
              >
                <FaHome className="w-4 h-4 mr-2" />
                Site
              </Button>
            </Link>

            <Button
              onClick={handlePreview}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              disabled={!formData.titulo || !formData.conteudo}
            >
              <FaEye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center text-xl">
                  <FaNewspaper className="w-5 h-5 mr-2 text-navy" />
                  Dados da Notícia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="titulo" className="text-sm font-semibold">
                      Título da Notícia *
                    </Label>
                    <Input
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleTituloChange}
                      placeholder="Digite o título da notícia..."
                      className="w-full text-lg py-3"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {formData.titulo.length}/200 caracteres
                    </p>
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold">
                      Slug (URL) *
                    </Label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-600">
                        /noticias/
                      </span>
                      <Input
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="slug-da-noticia"
                        className="flex-1 rounded-l-none"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaLink className="w-3 h-3" />
                      <span>
                        URL: https://seusite.com/noticias/{formData.slug}
                      </span>
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="space-y-2">
                    <Label htmlFor="resumo" className="text-sm font-semibold">
                      Resumo *
                    </Label>
                    <Textarea
                      id="resumo"
                      name="resumo"
                      value={formData.resumo}
                      onChange={handleInputChange}
                      placeholder="Digite um resumo breve da notícia..."
                      rows={3}
                      className="w-full resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {formData.resumo.length}/300 caracteres
                    </p>
                  </div>

                  {/* Conteúdo */}
                  <div className="space-y-2">
                    <Label htmlFor="conteudo" className="text-sm font-semibold">
                      Conteúdo Completo *
                    </Label>
                    <Textarea
                      id="conteudo"
                      name="conteudo"
                      value={formData.conteudo}
                      onChange={handleInputChange}
                      placeholder="Digite o conteúdo completo da notícia..."
                      rows={12}
                      className="w-full resize-none font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {formData.conteudo.length} caracteres
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    {/* 🔵 AZUL - Ações Administrativas */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Salvar Rascunho
                        </>
                      )}
                    </Button>

                    {/* 🟢 Verde para publicação */}
                    <Button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          status: "publicado",
                        }));
                        setTimeout(() => {
                          const form = document.querySelector("form");
                          if (form) form.requestSubmit();
                        }, 100);
                      }}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 py-3"
                    >
                      <FaEye className="w-4 h-4 mr-2" />
                      Publicar Agora
                    </Button>

                    {/* 🔴 VERMELHO - Ações Destrutivas */}
                    <Button
                      type="button"
                      onClick={() => router.push("/admin/noticias")}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white py-3"
                    >
                      <FaTimes className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Configurações */}
          <div className="space-y-6">
            {/* Status e Publicação */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-navy" />
                  Publicação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="data_publicacao"
                    className="text-sm font-semibold"
                  >
                    Data de Publicação
                  </Label>
                  <Input
                    id="data_publicacao"
                    name="data_publicacao"
                    type="date"
                    value={formData.data_publicacao}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Status</Label>
                  <div className="space-y-2">
                    {(
                      ["rascunho", "publicado", "arquivado"] as NoticiaStatus[]
                    ).map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={formData.status === status}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              status: e.target.value as NoticiaStatus,
                            }))
                          }
                          className="text-navy focus:ring-navy"
                        />
                        <span className="text-sm capitalize">{status}</span>
                        {status === "rascunho" && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 text-xs"
                          >
                            Rascunho
                          </Badge>
                        )}
                        {status === "publicado" && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 text-xs"
                          >
                            Público
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="destaque"
                    className="text-sm font-semibold cursor-pointer"
                  >
                    Notícia em Destaque
                  </Label>
                  <Switch
                    id="destaque"
                    checked={formData.destaque}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("destaque", checked)
                    }
                  />
                </div>
                {formData.destaque && (
                  <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    ⭐ Esta notícia será exibida como destaque no site
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Categoria e Imagem */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaImage className="w-4 h-4 mr-2 text-navy" />
                  Categoria e Mídia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-semibold">
                    Categoria
                  </Label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Imagem de Capa
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload de imagem (em desenvolvimento)
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-xs"
                    >
                      Selecionar Imagem
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Sistema de upload será implementado em breve
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Autor */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaUser className="w-4 h-4 mr-2 text-navy" />
                  Autor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-600">
                      Você será registrado como autor desta notícia
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Carregando...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
