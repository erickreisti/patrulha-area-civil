// src/app/(app)/admin/noticias/[id]/page.tsx - PADRONIZADO
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  FaHistory,
  FaTrash,
  FaChartBar,
  FaHome,
} from "react-icons/fa";
import {
  NoticiaFormData,
  NoticiaStatus,
  NoticiaWithAutor,
} from "@/types/noticias";

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

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditarNoticiaPage({ params }: PageProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
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

  // Buscar dados da notícia
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar usuário logado
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
        }

        // Buscar notícia com dados do autor
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

        if (!noticiaData) {
          throw new Error("Notícia não encontrada");
        }

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
      } catch (error: any) {
        console.error("❌ Erro ao carregar notícia:", error);
        alert(`Erro ao carregar notícia: ${error.message}`);
        router.push("/admin/noticias");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, supabase, router]);

  // Gerar slug automaticamente a partir do título
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .substring(0, 100);
  };

  // Atualizar slug quando o título mudar
  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value;
    setFormData((prev) => ({
      ...prev,
      titulo,
      slug: generateSlug(titulo),
    }));
  };

  // Manipular mudanças nos campos
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

  // Manipular switch
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Validar formulário
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

    // Validar formato do slug
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug)) {
      errors.push(
        "Slug deve conter apenas letras minúsculas, números e hífens"
      );
    }

    return errors;
  };

  // Salvar alterações
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validar formulário
    const errors = validateForm();
    if (errors.length > 0) {
      alert("Erros no formulário:\n" + errors.join("\n"));
      setSaving(false);
      return;
    }

    try {
      // Verificar se slug já existe (excluindo a notícia atual)
      const { data: existingSlug } = await supabase
        .from("noticias")
        .select("id")
        .eq("slug", formData.slug)
        .neq("id", params.id)
        .single();

      if (existingSlug) {
        alert(
          "Já existe outra notícia com este slug. Por favor, altere o título para gerar um slug único."
        );
        setSaving(false);
        return;
      }

      // Preparar dados para atualização
      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      // Atualizar no banco
      const { error } = await supabase
        .from("noticias")
        .update(updateData)
        .eq("id", params.id);

      if (error) throw error;

      console.log("✅ Notícia atualizada com sucesso");

      // Mostrar mensagem de sucesso
      alert("Notícia atualizada com sucesso!");

      // Redirecionar para a listagem
      router.push("/admin/noticias");
    } catch (error: any) {
      console.error("❌ Erro ao atualizar notícia:", error);
      alert(`Erro ao atualizar notícia: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Excluir notícia
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

      console.log("🗑️ Notícia excluída");
      alert("Notícia excluída com sucesso!");
      router.push("/admin/noticias");
    } catch (error: any) {
      console.error("❌ Erro ao excluir notícia:", error);
      alert(`Erro ao excluir notícia: ${error.message}`);
    }
  };

  // Preview da notícia
  const handlePreview = () => {
    // Em produção, isso abriria a notícia em uma nova aba
    alert(
      "Preview da notícia:\n\n" +
        `Título: ${formData.titulo}\n` +
        `Slug: ${formData.slug}\n` +
        `Status: ${formData.status}\n` +
        `Destaque: ${formData.destaque ? "Sim" : "Não"}\n\n` +
        "Em produção, isso abriria: /noticias/" +
        formData.slug
    );
  };

  // Ver versão pública (se publicada)
  const handleViewPublic = () => {
    if (formData.status === "publicado") {
      window.open(`/noticias/${formData.slug}`, "_blank");
    } else {
      alert(
        "Esta notícia não está publicada. Publique-a primeiro para visualizar publicamente."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
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
          <div className="text-center py-16">
            <FaNewspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Notícia Não Encontrada
            </h2>
            <p className="text-gray-600 mb-6">
              A notícia que você está tentando editar não existe.
            </p>
            <Link href="/admin/noticias">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Notícias
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              EDITAR NOTÍCIA
            </h1>
            <p className="text-gray-600">Editando: {noticia.titulo}</p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            {/* 🔵 AZUL - Ações Administrativas */}
            <Link href="/admin/noticias">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
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
                Voltar ao Site
              </Button>
            </Link>

            <Button
              onClick={handleViewPublic}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              disabled={formData.status !== "publicado"}
            >
              <FaEye className="w-4 h-4 mr-2" />
              Ver Público
            </Button>

            <Button
              onClick={handlePreview}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
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
                  Editar Notícia
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
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-3"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>

                    {/* 🔴 VERMELHO - Ações Destrutivas */}
                    <Button
                      type="button"
                      onClick={handleDelete}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white py-3"
                    >
                      <FaTrash className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>

                    {/* ⚫ CINZA - Navegação Neutra */}
                    <Button
                      type="button"
                      onClick={() => router.push("/admin/noticias")}
                      variant="outline"
                      className="border-slate-700 text-slate-700 hover:bg-slate-100 py-3"
                    >
                      <FaTimes className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Configurações e Informações */}
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

            {/* Categoria e Imagem */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaImage className="w-4 h-4 mr-2 text-navy" />
                  Categoria e Mídia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Categoria */}
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

                {/* Imagem (Placeholder para upload futuro) */}
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
                      className="text-xs border-slate-700 text-slate-700 hover:bg-slate-100"
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

            {/* Informações da Notícia */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaHistory className="w-4 h-4 mr-2 text-navy" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div>
                    <strong>ID:</strong>
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      {noticia.id}
                    </code>
                  </div>
                  <div>
                    <strong>Criada em:</strong>
                    <span className="ml-2 text-gray-600">
                      {new Date(noticia.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <strong>Última atualização:</strong>
                    <span className="ml-2 text-gray-600">
                      {new Date(noticia.updated_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <strong>Autor:</strong>
                    <span className="ml-2 text-gray-600">
                      {noticia.autor?.full_name || "Não definido"}
                    </span>
                  </div>
                </div>
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
