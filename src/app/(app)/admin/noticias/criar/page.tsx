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
import Link from "next/link";
import {
  FaNewspaper,
  FaSave,
  FaArrowLeft,
  FaCalendarAlt,
  FaImage,
  FaChartBar,
  FaHome,
  FaTimes,
} from "react-icons/fa";

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

    // Validar formulário
    const errors = validateForm();
    if (errors.length > 0) {
      alert("Erros no formulário:\n" + errors.join("\n"));
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
        alert("Já existe outra notícia com este slug. Altere o título.");
        setLoading(false);
        return;
      }

      // Buscar usuário atual para o autor_id
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Usuário não autenticado");
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
      alert("Notícia criada com sucesso!");

      // Redirecionar para a listagem
      setTimeout(() => {
        router.push("/admin/noticias");
      }, 1000);
    } catch (error: unknown) {
      console.error("❌ Erro ao criar notícia:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      alert(`Erro ao criar notícia: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              NOVA NOTÍCIA
            </h1>
            <p className="text-gray-600">
              Crie uma nova notícia para o site da Patrulha Aérea Civil
            </p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Link href="/admin/noticias">
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

            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-700 hover:bg-gray-100"
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
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center text-xl">
                  <FaNewspaper className="w-5 h-5 mr-2 text-blue-800" />
                  Criar Nova Notícia
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
                      <FaImage className="w-3 h-3" />
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
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 py-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Criar Notícia
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => router.push("/admin/noticias")}
                      variant="outline"
                      className="border-gray-700 text-gray-700 hover:bg-gray-100 py-3"
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
            {/* Imagem de Capa */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaImage className="w-4 h-4 mr-2 text-blue-800" />
                  Imagem de Capa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FaImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload de imagem (em desenvolvimento)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-xs border-gray-700 text-gray-700 hover:bg-gray-100"
                  >
                    Selecionar Imagem
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Sistema de upload será implementado em breve
                </p>
              </CardContent>
            </Card>

            {/* Configurações de Publicação */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-blue-800" />
                  Publicação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Data de Publicação */}
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

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Status</Label>
                  <div className="space-y-2">
                    {(["rascunho", "publicado", "arquivado"] as const).map(
                      (status) => (
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
                                status: e.target.value as typeof status,
                              }))
                            }
                            className="text-blue-600 focus:ring-blue-600"
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
                      )
                    )}
                  </div>
                </div>

                {/* Destaque */}
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

            {/* Categoria */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Preview Rápido */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Preview Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Título:</strong> {formData.titulo || "Não definido"}
                  </p>
                  <p>
                    <strong>Slug:</strong> {formData.slug || "Não definido"}
                  </p>
                  <p>
                    <strong>Categoria:</strong> {formData.categoria}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <Badge
                      className={`ml-2 ${
                        formData.status === "rascunho"
                          ? "bg-yellow-500"
                          : formData.status === "publicado"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      } text-white text-xs`}
                    >
                      {formData.status.toUpperCase()}
                    </Badge>
                  </p>
                  {formData.destaque && (
                    <p>
                      <strong>Destaque:</strong>
                      <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                        ⭐ DESTAQUE
                      </Badge>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
