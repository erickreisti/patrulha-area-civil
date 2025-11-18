"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import Image from "next/image";
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
  FaStar,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";

interface GaleriaItem {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: "foto" | "video";
  url: string;
  thumbnail_url: string | null;
  categoria_id: string;
  status: boolean;
  destaque: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
  categorias: {
    nome: string;
    tipo: "fotos" | "videos";
  };
}

interface Categoria {
  id: string;
  nome: string;
  tipo: "fotos" | "videos";
}

export default function EditarItemPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<GaleriaItem | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "foto" as "foto" | "video",
    categoria_id: "",
    url: "",
    status: true,
    destaque: false,
    ordem: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

      const { data, error } = await supabase
        .from("galeria_itens")
        .select(
          `
          *,
          categorias:nome,
          categorias:tipo
        `
        )
        .eq("id", itemId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setItem(data);
        setFormData({
          titulo: data.titulo || "",
          descricao: data.descricao || "",
          tipo: data.tipo || "foto",
          categoria_id: data.categoria_id || "",
          url: data.url || "",
          status: data.status ?? true,
          destaque: data.destaque ?? false,
          ordem: data.ordem || 0,
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar item:", error);
      toast.error("Não foi possível carregar o item.");
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);

      const { data, error } = await supabase
        .from("galeria_itens")
        .update({
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim() || null,
          tipo: formData.tipo,
          categoria_id: formData.categoria_id,
          url: formData.url.trim(),
          status: formData.status,
          destaque: formData.destaque,
          ordem: formData.ordem,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Item atualizado com sucesso!");

      // Redirecionar de volta para a lista
      setTimeout(() => {
        router.push("/admin/galeria/itens");
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao atualizar item:", error);

      if (error.code === "23505") {
        toast.error("Já existe um item com este título.");
      } else {
        toast.error("Não foi possível atualizar o item.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTipoChange = (tipo: "foto" | "video") => {
    setFormData((prev) => ({ ...prev, tipo }));
    // Se a categoria atual não for compatível, limpar
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
      <div className="min-h-screen bg-bg-secondary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FaSpinner className="w-8 h-8 text-navy animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando item...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-bg-secondary py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <FaExclamationTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Item não encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              O item que você está tentando editar não existe.
            </p>
            <Button asChild className="bg-navy hover:bg-navy-600">
              <Link href="/admin/galeria/itens">
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar para a lista
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-navy text-navy hover:bg-navy hover:text-white"
                >
                  <Link href="/admin/galeria/itens">
                    <FaArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Link>
                </Button>
                <Badge
                  variant={item.status ? "default" : "secondary"}
                  className={
                    item.status
                      ? "bg-success hover:bg-success-600"
                      : "bg-gray-400"
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
                {item.destaque && (
                  <Badge className="bg-warning hover:bg-warning-600">
                    <FaStar className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Editar Item da Galeria
              </h1>
              <p className="text-gray-600 mt-2">
                Atualize as informações do item
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  item.tipo === "foto"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }
              >
                {item.tipo === "foto" ? (
                  <>
                    <FaImage className="w-3 h-3 mr-1" /> Foto
                  </>
                ) : (
                  <>
                    <FaVideo className="w-3 h-3 mr-1" /> Vídeo
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-navy">
              <CardHeader className="bg-gradient-to-r from-navy to-navy-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <FaImage className="w-5 h-5" />
                  Informações do Item
                </CardTitle>
                <CardDescription className="text-white/80">
                  Atualize os dados do item da galeria
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="titulo"
                      className="text-sm font-medium text-gray-700"
                    >
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
                        errors.titulo ? "border-error focus:border-error" : ""
                      }
                    />
                    {errors.titulo && (
                      <p className="text-error text-sm flex items-center gap-1">
                        <FaExclamationTriangle className="w-3 h-3" />
                        {errors.titulo}
                      </p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="descricao"
                      className="text-sm font-medium text-gray-700"
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
                      <Label
                        htmlFor="tipo"
                        className="text-sm font-medium text-gray-700"
                      >
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
                        className="text-sm font-medium text-gray-700"
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
                            errors.categoria_id
                              ? "border-error focus:border-error"
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
                      {errors.categoria_id && (
                        <p className="text-error text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {errors.categoria_id}
                        </p>
                      )}
                      {categoriasFiltradas.length === 0 && (
                        <p className="text-warning text-sm">
                          ⚠️ Crie uma categoria para{" "}
                          {formData.tipo === "foto" ? "fotos" : "vídeos"}{" "}
                          primeiro
                        </p>
                      )}
                    </div>
                  </div>

                  {/* URL */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="url"
                      className="text-sm font-medium text-gray-700"
                    >
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
                            errors.url
                              ? "border-error focus:border-error flex-1"
                              : "flex-1"
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={openMediaUrl}
                          disabled={!formData.url || !isValidUrl(formData.url)}
                          className="border-navy text-navy hover:bg-navy hover:text-white"
                        >
                          <FaExternalLinkAlt className="w-4 h-4" />
                        </Button>
                      </div>
                      {errors.url && (
                        <p className="text-error text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {errors.url}
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
                      <Label className="text-sm font-medium text-gray-700">
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
                      <Label
                        htmlFor="ordem"
                        className="text-sm font-medium text-gray-700"
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
                        className={
                          errors.ordem ? "border-error focus:border-error" : ""
                        }
                      />
                      {errors.ordem && (
                        <p className="text-error text-sm flex items-center gap-1">
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
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-gray-700"
                      >
                        Status do Item
                      </Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <Switch
                          id="status"
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
                      <Label
                        htmlFor="destaque"
                        className="text-sm font-medium text-gray-700"
                      >
                        Item em Destaque
                      </Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <Switch
                          id="destaque"
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
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-divider-light">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-success hover:bg-success-600 text-white flex-1"
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
                      className="border-navy text-navy hover:bg-navy hover:text-white"
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
            <Card className="border-0 shadow-navy">
              <CardHeader>
                <CardTitle className="text-lg">
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-divider-light">
                  <span className="text-gray-600">ID:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {item.id}
                  </code>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-divider-light">
                  <span className="text-gray-600">Criado em:</span>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <FaCalendarAlt className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-divider-light">
                  <span className="text-gray-600">Última atualização:</span>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <FaCalendarAlt className="w-3 h-3" />
                    {new Date(item.updated_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-divider-light">
                  <span className="text-gray-600">Categoria atual:</span>
                  <Badge variant="outline" className="bg-gray-100">
                    {item.categorias?.nome || "N/A"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Tipo atual:</span>
                  <Badge
                    variant="outline"
                    className={
                      item.tipo === "foto"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }
                  >
                    {item.tipo === "foto" ? "Foto" : "Vídeo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Status Atual */}
            <Card className="border-0 shadow-navy">
              <CardHeader>
                <CardTitle className="text-lg">Status Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-divider-light">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    variant={item.status ? "default" : "secondary"}
                    className={
                      item.status
                        ? "bg-success hover:bg-success-600"
                        : "bg-gray-400"
                    }
                  >
                    {item.status ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-divider-light">
                  <span className="text-gray-600">Destaque:</span>
                  <Badge
                    variant={item.destaque ? "default" : "secondary"}
                    className={
                      item.destaque
                        ? "bg-warning hover:bg-warning-600"
                        : "bg-gray-100"
                    }
                  >
                    {item.destaque ? "Sim" : "Não"}
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
            <Card className="border-0 shadow-navy">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FaExclamationTriangle className="w-4 h-4 text-warning" />
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
