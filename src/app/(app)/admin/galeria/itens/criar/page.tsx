"use client";

import { useState, useEffect } from "react";
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
  FaEye,
  FaEyeSlash,
  FaChartBar,
  FaHome,
  FaUser,
} from "react-icons/fa";

interface Categoria {
  id: string;
  nome: string;
  tipo: "fotos" | "videos";
}

export default function CriarItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "foto" as "foto" | "video",
    categoria_id: "",
    arquivo_url: "",
    status: true,
    ordem: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      toast.error("Erro ao carregar categorias");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = "Título deve ter pelo menos 3 caracteres";
    }

    if (!formData.categoria_id) {
      newErrors.categoria_id = "Categoria é obrigatória";
    }

    if (!formData.arquivo_url.trim()) {
      newErrors.arquivo_url = "URL do arquivo é obrigatória";
    } else if (!isValidUrl(formData.arquivo_url)) {
      newErrors.arquivo_url = "URL inválida";
    }

    if (formData.ordem < 0) {
      newErrors.ordem = "Ordem não pode ser negativa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário.");
      return;
    }

    try {
      setLoading(true);

      // Buscar usuário atual para o autor_id
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("galeria_itens")
        .insert([
          {
            titulo: formData.titulo.trim(),
            descricao: formData.descricao.trim() || null,
            tipo: formData.tipo,
            categoria_id: formData.categoria_id,
            arquivo_url: formData.arquivo_url.trim(),
            status: formData.status,
            ordem: formData.ordem,
            autor_id: user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Item criado com sucesso!");

      // Redirecionar para a lista
      setTimeout(() => {
        router.push("/admin/galeria/itens");
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao criar item:", error);

      if (error.code === "23505") {
        toast.error("Já existe um item com este título.");
      } else {
        toast.error("Não foi possível criar o item.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTipoChange = (tipo: "foto" | "video") => {
    setFormData((prev) => ({ ...prev, tipo, categoria_id: "" }));
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
              ADICIONAR ITEM À GALERIA
            </h1>
            <p className="text-gray-600">
              Adicione novas fotos ou vídeos à galeria da Patrulha Aérea Civil
            </p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            {/* 🔵 AZUL - Ações Administrativas */}
            <Link href="/admin/galeria/itens">
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

            {/* 🔵 AZUL - Ações Administrativas */}
            <Link href="/perfil">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaUser className="w-4 h-4 mr-2" />
                Meu Perfil
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center text-xl">
                  <FaImage className="w-5 h-5 mr-2 text-navy" />
                  Informações do Item
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
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          titulo: e.target.value,
                        }))
                      }
                      placeholder="Ex: Treinamento de Resgate Aéreo, Evento Comunitário, etc."
                      className={
                        errors.titulo
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {errors.titulo && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaExclamationTriangle className="w-3 h-3" />
                        {errors.titulo}
                      </p>
                    )}
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
                      placeholder="Descreva o conteúdo deste item..."
                      rows={4}
                    />
                    <p className="text-gray-500 text-sm">
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
                      <Select
                        value={formData.tipo}
                        onValueChange={(value: "foto" | "video") =>
                          handleTipoChange(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="foto">
                            <div className="flex items-center gap-2">
                              <FaImage className="w-4 h-4 text-blue-600" />
                              <span>Foto</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <FaVideo className="w-4 h-4 text-purple-600" />
                              <span>Vídeo</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Categoria *
                      </Label>
                      <Select
                        value={formData.categoria_id}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            categoria_id: value,
                          }))
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.categoria_id
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriasFiltradas.length === 0 ? (
                            <SelectItem value="no-category" disabled>
                              Nenhuma categoria disponível para{" "}
                              {formData.tipo === "foto" ? "fotos" : "vídeos"}
                            </SelectItem>
                          ) : (
                            categoriasFiltradas.map((categoria) => (
                              <SelectItem
                                key={categoria.id}
                                value={categoria.id}
                              >
                                {categoria.nome}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.categoria_id && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {errors.categoria_id}
                        </p>
                      )}
                      {categoriasFiltradas.length === 0 && (
                        <p className="text-yellow-600 text-sm">
                          ⚠️ Crie uma categoria para{" "}
                          {formData.tipo === "foto" ? "fotos" : "vídeos"}{" "}
                          primeiro
                        </p>
                      )}
                    </div>
                  </div>

                  {/* URL do Arquivo */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="arquivo_url"
                      className="text-sm font-semibold"
                    >
                      URL do Arquivo *
                    </Label>
                    <Input
                      id="arquivo_url"
                      value={formData.arquivo_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          arquivo_url: e.target.value,
                        }))
                      }
                      placeholder={
                        formData.tipo === "foto"
                          ? "https://exemplo.com/imagem.jpg"
                          : "https://youtube.com/watch?v=..."
                      }
                      className={
                        errors.arquivo_url
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {errors.arquivo_url && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaExclamationTriangle className="w-3 h-3" />
                        {errors.arquivo_url}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {formData.tipo === "foto"
                        ? "URL da imagem (JPG, PNG, WebP)"
                        : "URL do vídeo (YouTube, Vimeo, etc.)"}
                    </p>
                  </div>

                  {/* Configurações Avançadas */}
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
                          errors.ordem
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                      />
                      {errors.ordem && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {errors.ordem}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">
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
                            setFormData((prev) => ({
                              ...prev,
                              status: checked,
                            }))
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
                  </div>

                  {/* Preview da URL (se for imagem) */}
                  {formData.tipo === "foto" &&
                    formData.arquivo_url &&
                    isValidUrl(formData.arquivo_url) && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">
                          Preview da Imagem
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex flex-col items-center justify-center text-center">
                            <img
                              src={formData.arquivo_url}
                              alt="Preview"
                              className="max-w-full max-h-48 object-contain rounded mb-3"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <p className="text-sm text-gray-600 break-all">
                              {formData.arquivo_url}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

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
                          Criar Item
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={() => router.push("/admin/galeria/itens")}
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
                  • <strong>Itens inativos</strong> não aparecem no site
                </p>
                <p>
                  • A <strong>ordem</strong> define a posição na listagem
                </p>
                <p>
                  • Escolha a <strong>categoria correta</strong> para o tipo
                </p>
                <p>
                  • URLs devem ser <strong>públicas e acessíveis</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
