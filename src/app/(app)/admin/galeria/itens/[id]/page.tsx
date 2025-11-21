"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaEye,
  FaEyeSlash,
  FaStar,
} from "react-icons/fa";

interface GaleriaItem {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: "foto" | "video";
  arquivo_url: string;
  thumbnail_url: string | null;
  categoria_id: string;
  status: boolean;
  destaque: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
  galeria_categorias: {
    nome: string;
    tipo: "fotos" | "videos";
  };
}

interface Categoria {
  id: string;
  nome: string;
  tipo: "fotos" | "videos";
}

interface FormData {
  titulo: string;
  descricao: string;
  tipo: "foto" | "video";
  categoria_id: string;
  url: string;
  status: boolean;
  destaque: boolean;
  ordem: number;
}

export default function EditarItemPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<GaleriaItem | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descricao: "",
    tipo: "foto",
    categoria_id: "",
    url: "",
    status: true,
    destaque: false,
    ordem: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const itemId = params.id as string;

  useEffect(() => {
    if (itemId) {
      fetchItem();
      fetchCategorias();
    }
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("galeria_itens")
        .select(
          `
          *,
          galeria_categorias (
            nome,
            tipo
          )
        `
        )
        .eq("id", itemId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setItem(data);
        setFormData({
          titulo: data.titulo || "",
          descricao: data.descricao || "",
          tipo: data.tipo || "foto",
          categoria_id: data.categoria_id || "",
          url: data.arquivo_url || "",
          status: data.status ?? true,
          destaque: data.destaque ?? false,
          ordem: data.ordem || 0,
        });
      }
    } catch (err: any) {
      console.error("Erro ao carregar item:", err);
      alert("Não foi possível carregar o item.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("galeria_categorias")
        .select("id, nome, tipo")
        .eq("status", true)
        .order("ordem", { ascending: true });

      if (fetchError) throw fetchError;
      setCategorias(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar categorias:", err);
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

    if (!formData.url.trim()) {
      newErrors.url = "URL é obrigatória";
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = "URL inválida";
    }

    if (formData.ordem < 0) {
      newErrors.ordem = "Ordem não pode ser negativa";
    }

    setFormErrors(newErrors);
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
      alert("Por favor, corrija os erros no formulário.");
      return;
    }

    try {
      setSaving(true);

      const { data, error: updateError } = await supabase
        .from("galeria_itens")
        .update({
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim() || null,
          tipo: formData.tipo,
          categoria_id: formData.categoria_id,
          arquivo_url: formData.url.trim(),
          status: formData.status,
          destaque: formData.destaque,
          ordem: formData.ordem,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      alert("Item atualizado com sucesso!");

      setTimeout(() => {
        router.push("/admin/galeria/itens");
      }, 1000);
    } catch (err: any) {
      console.error("Erro ao atualizar item:", err);

      if (err.code === "23505") {
        alert("Já existe um item com este título.");
      } else {
        alert("Não foi possível atualizar o item.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTipoChange = (tipo: "foto" | "video") => {
    setFormData((prev) => ({ ...prev, tipo }));
    const categoriaAtual = categorias.find(
      (cat) => cat.id === formData.categoria_id
    );
    if (
      categoriaAtual &&
      categoriaAtual.tipo !== (tipo === "foto" ? "fotos" : "videos")
    ) {
      setFormData((prev) => ({ ...prev, categoria_id: "" }));
    }
  };

  const categoriasFiltradas = categorias.filter(
    (cat) => cat.tipo === (formData.tipo === "foto" ? "fotos" : "videos")
  );

  const openMediaUrl = () => {
    if (formData.url && isValidUrl(formData.url)) {
      window.open(formData.url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando item...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <FaExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Item Não Encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              O item que você está tentando editar não existe.
            </p>
            <Link href="/admin/galeria/itens">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Itens
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
              EDITAR ITEM DA GALERIA
            </h1>
            <p className="text-gray-600">Editando: {item.titulo}</p>
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
                  <FaImage className="w-5 h-5 mr-2 text-blue-600" />
                  Editar Item da Galeria
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
                        formErrors.titulo
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {formErrors.titulo && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaExclamationTriangle className="w-3 h-3" />
                        {formErrors.titulo}
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
                      maxLength={500}
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
                      <Label
                        htmlFor="categoria_id"
                        className="text-sm font-semibold"
                      >
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
                            formErrors.categoria_id
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriasFiltradas.length === 0 ? (
                            <SelectItem value="" disabled>
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
                      {formErrors.categoria_id && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {formErrors.categoria_id}
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

                  {/* URL */}
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-semibold">
                      URL da Mídia *
                    </Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          id="url"
                          value={formData.url}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              url: e.target.value,
                            }))
                          }
                          placeholder={
                            formData.tipo === "foto"
                              ? "https://exemplo.com/imagem.jpg"
                              : "https://youtube.com/watch?v=..."
                          }
                          className={
                            formErrors.url
                              ? "border-red-500 focus:border-red-500 flex-1"
                              : "flex-1"
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={openMediaUrl}
                          disabled={!formData.url || !isValidUrl(formData.url)}
                          className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <FaExternalLinkAlt className="w-4 h-4" />
                        </Button>
                      </div>
                      {formErrors.url && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {formErrors.url}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">
                        {formData.tipo === "foto"
                          ? "URL da imagem (JPG, PNG, WebP)"
                          : "URL do vídeo (YouTube, Vimeo, etc.)"}
                      </p>
                    </div>
                  </div>

                  {/* Preview da Mídia */}
                  {formData.url && isValidUrl(formData.url) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Preview da Mídia
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                        {formData.tipo === "foto" ? (
                          <div className="flex flex-col items-center justify-center text-center">
                            <img
                              src={formData.url}
                              alt="Preview"
                              className="max-w-full max-h-64 object-contain rounded mb-3"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <p className="text-sm text-gray-600 break-all">
                              {formData.url}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <FaVideo className="w-16 h-16 text-purple-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 mb-2">
                              Link de vídeo: {formData.url}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={openMediaUrl}
                              className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                            >
                              <FaExternalLinkAlt className="w-3 h-3 mr-1" />
                              Abrir Vídeo
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Configurações Avançadas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                    {/* Destaque */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Item em Destaque
                      </Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <Switch
                          checked={formData.destaque}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              destaque: checked,
                            }))
                          }
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {formData.destaque ? "Em destaque" : "Normal"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {formData.destaque
                              ? "Destacado na galeria"
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
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 py-3"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={() => router.push("/admin/galeria/itens")}
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
            {/* Informações do Sistema */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">ID:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {item.id}
                  </code>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Criado em:</span>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <FaCalendarAlt className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Última atualização:</span>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <FaCalendarAlt className="w-3 h-3" />
                    {new Date(item.updated_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Categoria atual:</span>
                  <Badge variant="outline" className="bg-gray-100">
                    {item.galeria_categorias?.nome || "N/A"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Tipo atual:</span>
                  <Badge
                    className={
                      item.tipo === "foto"
                        ? "bg-blue-600 text-white"
                        : "bg-purple-600 text-white"
                    }
                  >
                    {item.tipo === "foto" ? "Foto" : "Vídeo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Status Atual */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Status Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    className={
                      item.status
                        ? "bg-green-600 text-white"
                        : "bg-gray-500 text-white"
                    }
                  >
                    {item.status ? (
                      <>
                        <FaEye className="w-3 h-3 mr-1" /> Ativo
                      </>
                    ) : (
                      <>
                        <FaEyeSlash className="w-3 h-3 mr-1" /> Inativo
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Destaque:</span>
                  <Badge
                    className={
                      item.destaque
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-400 text-white"
                    }
                  >
                    {item.destaque ? (
                      <>
                        <FaStar className="w-3 h-3 mr-1" /> Sim
                      </>
                    ) : (
                      "Não"
                    )}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Ordem atual:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {item.ordem}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Ajuda */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FaExclamationTriangle className="w-4 h-4 text-yellow-500" />
                  Dicas de Edição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>
                  • Atualize a <strong>URL</strong> se a mídia foi movida
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
                <p>
                  • Use o botão <strong>🔗</strong> para testar a URL
                </p>
                <p>
                  • Escolha a <strong>categoria</strong> correta para o tipo de
                  mídia
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
