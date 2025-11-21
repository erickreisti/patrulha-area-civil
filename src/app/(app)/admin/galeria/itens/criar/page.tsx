// src/app/(app)/admin/galeria/itens/criar/page.tsx - COM UPLOAD
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
import { MediaUpload } from "@/components/ui/media-upload";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import {
  FaArrowLeft,
  FaSave,
  FaImage,
  FaVideo,
  FaFolder,
  FaChartBar,
  FaHome,
  FaUser,
} from "react-icons/fa";

interface Categoria {
  id: string;
  nome: string;
  tipo: "fotos" | "videos";
}

export default function CriarItemGaleriaPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "foto" as "foto" | "video",
    categoria_id: "",
    ordem: 0,
    status: true,
    destaque: false,
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("galeria_categorias")
        .select("id, nome, tipo")
        .eq("status", true)
        .order("ordem", { ascending: true });

      if (error) throw error;

      setCategorias(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias", "Erro");
    }
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

  const handleTipoChange = (tipo: "foto" | "video") => {
    setFormData((prev) => ({
      ...prev,
      tipo,
      categoria_id: "", // Limpar categoria quando mudar o tipo
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.titulo.trim()) {
      errors.push("Título é obrigatório");
    }

    if (!formData.categoria_id) {
      errors.push("Categoria é obrigatória");
    }

    if (!mediaUrl) {
      errors.push("Arquivo de mídia é obrigatório");
    }

    if (formData.ordem < 0) {
      errors.push("Ordem não pode ser negativa");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validar formulário
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error("Erros no formulário:\n" + errors.join("\n"), "Validação");
      setLoading(false);
      return;
    }

    try {
      // Buscar usuário atual para o autor_id
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado", "Erro de autenticação");
        setLoading(false);
        return;
      }

      // Determinar o bucket correto baseado no tipo
      const bucket =
        formData.tipo === "foto" ? "galeria-fotos" : "galeria-videos";

      // Criar item da galeria
      const { data, error } = await supabase
        .from("galeria_itens")
        .insert([
          {
            titulo: formData.titulo.trim(),
            descricao: formData.descricao.trim() || null,
            tipo: formData.tipo,
            categoria_id: formData.categoria_id,
            arquivo_url: mediaUrl,
            status: formData.status,
            destaque: formData.destaque,
            ordem: formData.ordem,
            autor_id: user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("Item da galeria criado com sucesso!", "Sucesso");

      // Redirecionar para a listagem
      setTimeout(() => {
        router.push("/admin/galeria/itens");
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao criar item:", error);
      toast.error(`Erro ao criar item: ${error.message}`, "Erro");
    } finally {
      setLoading(false);
    }
  };

  const categoriasFiltradas = categorias.filter(
    (cat) => cat.tipo === (formData.tipo === "foto" ? "fotos" : "videos")
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              NOVO ITEM DA GALERIA
            </h1>
            <p className="text-gray-600">
              Adicione novas fotos ou vídeos à galeria
            </p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Link href="/admin/galeria/itens">
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
                className="border-slate-700 text-slate-700 hover:bg-slate-100"
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
                  <FaImage className="w-5 h-5 mr-2 text-navy" />
                  Novo Item da Galeria
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="titulo" className="text-sm font-semibold">
                      Título do Item *
                    </Label>
                    <Input
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      placeholder="Ex: Treinamento de Resgate Aéreo"
                      className="w-full"
                      required
                    />
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
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      placeholder="Descreva o conteúdo deste item..."
                      rows={4}
                      className="w-full resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.descricao.length}/500 caracteres
                    </p>
                  </div>

                  {/* Tipo e Categoria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tipo */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Tipo de Mídia *
                      </Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={
                            formData.tipo === "foto" ? "default" : "outline"
                          }
                          className={`flex-1 ${
                            formData.tipo === "foto"
                              ? "bg-blue-600 text-white"
                              : "border-blue-600 text-blue-600"
                          }`}
                          onClick={() => handleTipoChange("foto")}
                        >
                          <FaImage className="w-4 h-4 mr-2" />
                          Foto
                        </Button>
                        <Button
                          type="button"
                          variant={
                            formData.tipo === "video" ? "default" : "outline"
                          }
                          className={`flex-1 ${
                            formData.tipo === "video"
                              ? "bg-purple-600 text-white"
                              : "border-purple-600 text-purple-600"
                          }`}
                          onClick={() => handleTipoChange("video")}
                        >
                          <FaVideo className="w-4 h-4 mr-2" />
                          Vídeo
                        </Button>
                      </div>
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="categoria_id"
                        className="text-sm font-semibold"
                      >
                        Categoria *
                      </Label>
                      <select
                        id="categoria_id"
                        name="categoria_id"
                        value={formData.categoria_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {categoriasFiltradas.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </option>
                        ))}
                      </select>
                      {categoriasFiltradas.length === 0 && (
                        <p className="text-xs text-yellow-600">
                          ⚠️ Crie uma categoria para{" "}
                          {formData.tipo === "foto" ? "fotos" : "vídeos"}{" "}
                          primeiro
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Upload de Mídia */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Arquivo de Mídia *
                    </Label>
                    <MediaUpload
                      tipo={formData.tipo}
                      onMediaChange={setMediaUrl}
                      currentMedia={mediaUrl}
                      className="w-full"
                    />
                    {mediaUrl && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-700">
                          ✅ {formData.tipo === "foto" ? "Imagem" : "Vídeo"}{" "}
                          carregado com sucesso
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Configurações Avançadas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ordem */}
                    <div className="space-y-2">
                      <Label htmlFor="ordem" className="text-sm font-semibold">
                        Ordem de Exibição
                      </Label>
                      <Input
                        id="ordem"
                        name="ordem"
                        type="number"
                        min="0"
                        value={formData.ordem}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Número menor aparece primeiro
                      </p>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Status do Item
                      </Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <Switch
                          checked={formData.status}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("status", checked)
                          }
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {formData.status ? "Ativo" : "Inativo"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {formData.status
                              ? "Visível no site"
                              : "Oculto no site"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Destaque */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Item em Destaque
                      </Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <Switch
                          checked={formData.destaque}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("destaque", checked)
                          }
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {formData.destaque ? "Em destaque" : "Normal"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {formData.destaque
                              ? "Destacado"
                              : "Listagem normal"}
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
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Criar Item
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => router.push("/admin/galeria/itens")}
                      variant="outline"
                      className="border-slate-700 text-slate-700 hover:bg-slate-100 py-3"
                    >
                      <FaArrowLeft className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Informações */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tipo:</span>
                  <Badge
                    className={
                      formData.tipo === "foto"
                        ? "bg-blue-600 text-white"
                        : "bg-purple-600 text-white"
                    }
                  >
                    {formData.tipo === "foto" ? "Foto" : "Vídeo"}
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
                    {formData.status ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Destaque:</span>
                  <Badge
                    className={
                      formData.destaque
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-400 text-white"
                    }
                  >
                    {formData.destaque ? "Sim" : "Não"}
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

            {/* Informações */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>
                  • Campos com <strong>*</strong> são obrigatórios
                </p>
                <p>
                  • <strong>Fotos:</strong> JPG, PNG, WEBP até 5MB
                </p>
                <p>
                  • <strong>Vídeos:</strong> MP4, MOV até 50MB
                </p>
                <p>
                  • <strong>Itens inativos</strong> não aparecem no site
                </p>
                <p>
                  • <strong>Destaques</strong> aparecem em posição especial
                </p>
                <p>
                  • A <strong>ordem</strong> define a posição na listagem
                </p>
              </CardContent>
            </Card>

            {/* Categorias Disponíveis */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaFolder className="w-4 h-4 mr-2 text-navy" />
                  Categorias Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoriasFiltradas.length === 0 ? (
                    <p className="text-sm text-yellow-600 text-center py-4">
                      Nenhuma categoria disponível para{" "}
                      {formData.tipo === "foto" ? "fotos" : "vídeos"}
                    </p>
                  ) : (
                    categoriasFiltradas.map((categoria) => (
                      <div
                        key={categoria.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          formData.categoria_id === categoria.id
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {categoria.nome}
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            categoria.tipo === "fotos"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }
                        >
                          {categoria.tipo}
                        </Badge>
                      </div>
                    ))
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
