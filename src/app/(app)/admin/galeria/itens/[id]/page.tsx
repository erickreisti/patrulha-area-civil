"use client";

import { useState, useEffect, useCallback } from "react";
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
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
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
  RiCalendarLine,
  RiEyeLine,
  RiEyeOffLine,
  RiStarLine,
  RiExternalLinkLine,
  RiCheckLine,
} from "react-icons/ri";

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

export default function EditarItemPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<GaleriaItem | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const itemId = params.id as string;

  const fetchItem = useCallback(async () => {
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
    } catch (err: unknown) {
      console.error("Erro ao carregar item:", err);
      toast.error("Não foi possível carregar o item.");
    } finally {
      setLoading(false);
    }
  }, [itemId, supabase]);

  const fetchCategorias = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("galeria_categorias")
        .select("id, nome, tipo")
        .eq("status", true)
        .order("ordem", { ascending: true });

      if (fetchError) throw fetchError;
      setCategorias(data || []);
    } catch (err: unknown) {
      console.error("Erro ao carregar categorias:", err);
      toast.error("Erro ao carregar categorias");
    }
  }, [supabase]);

  useEffect(() => {
    if (itemId) {
      fetchItem();
      fetchCategorias();
    }
  }, [itemId, fetchItem, fetchCategorias]);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.titulo.trim()) {
      errors.push("Título é obrigatório");
    } else if (formData.titulo.length < 3) {
      errors.push("Título deve ter pelo menos 3 caracteres");
    }

    if (!formData.categoria_id) {
      errors.push("Categoria é obrigatória");
    }

    if (!formData.url.trim()) {
      errors.push("URL é obrigatória");
    } else if (!isValidUrl(formData.url)) {
      errors.push("URL inválida");
    }

    if (formData.ordem < 0) {
      errors.push("Ordem não pode ser negativa");
    }

    return errors;
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
    setSaving(true);
    setErrors([]);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
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

      toast.success("Item atualizado com sucesso!");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin/galeria/itens");
      }, 1500);
    } catch (err: unknown) {
      console.error("Erro ao atualizar item:", err);
      const error = err as { code?: string; message: string };

      if (error.code === "23505") {
        toast.error("Já existe um item com este título.");
      } else {
        toast.error("Erro ao atualizar item");
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

  const navigationButtons = [
    {
      href: "/admin/galeria/itens",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"
            />
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <RiAlertLine className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Item Não Encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              O item que você está tentando editar não existe.
            </p>
            <Link href="/admin/galeria/itens">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                Voltar para Itens
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

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
              EDITAR ITEM DA GALERIA
            </h1>
            <p className="text-gray-600">Editando: {item.titulo}</p>
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
                      <RiAlertLine className="w-5 h-5 text-red-500" />
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
                      <RiCheckLine className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-green-800">Sucesso!</p>
                      <p className="text-sm text-green-600">
                        Item atualizado com sucesso. Redirecionando...
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
                    <RiImageLine className="w-5 h-5 mr-2 text-navy-600" />
                    Editar Item da Galeria
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
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-gray-500 text-sm transition-colors duration-300">
                        {formData.titulo.length}/200 caracteres
                      </p>
                    </motion.div>

                    {/* Descrição */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.1 }}
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
                        placeholder="Descreva o conteúdo deste item..."
                        rows={4}
                        maxLength={500}
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <p className="text-gray-500 text-sm transition-colors duration-300">
                        {formData.descricao.length}/500 caracteres
                      </p>
                    </motion.div>

                    {/* Tipo e Categoria */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {/* Tipo */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Tipo de Mídia *
                        </Label>
                        <div className="flex space-x-2">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1"
                          >
                            <Button
                              type="button"
                              variant={
                                formData.tipo === "foto" ? "default" : "outline"
                              }
                              className={`w-full transition-all duration-300 ${
                                formData.tipo === "foto"
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                              }`}
                              onClick={() => handleTipoChange("foto")}
                            >
                              <RiImageLine className="w-4 h-4 mr-2" />
                              Foto
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1"
                          >
                            <Button
                              type="button"
                              variant={
                                formData.tipo === "video"
                                  ? "default"
                                  : "outline"
                              }
                              className={`w-full transition-all duration-300 ${
                                formData.tipo === "video"
                                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                                  : "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                              }`}
                              onClick={() => handleTipoChange("video")}
                            >
                              <RiVideoLine className="w-4 h-4 mr-2" />
                              Vídeo
                            </Button>
                          </motion.div>
                        </div>
                      </div>

                      {/* Categoria */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="categoria_id"
                          className="text-sm font-semibold text-gray-700"
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
                          <SelectTrigger className="transition-all duration-300 hover:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriasFiltradas.length === 0 ? (
                              <SelectItem
                                value="no-category"
                                disabled
                                className="text-gray-500"
                              >
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
                        {categoriasFiltradas.length === 0 && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-amber-600"
                          >
                            ⚠️ Crie uma categoria para{" "}
                            {formData.tipo === "foto" ? "fotos" : "vídeos"}{" "}
                            primeiro
                          </motion.p>
                        )}
                      </div>
                    </motion.div>

                    {/* URL */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label
                        htmlFor="url"
                        className="text-sm font-semibold text-gray-700"
                      >
                        URL da Mídia *
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-600 text-sm transition-colors duration-300">
                            <RiExternalLinkLine className="w-3 h-3" />
                          </span>
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
                            className="flex-1 rounded-l-none transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                          />
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              type="button"
                              variant="outline"
                              onClick={openMediaUrl}
                              disabled={
                                !formData.url || !isValidUrl(formData.url)
                              }
                              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-l-none transition-colors duration-300"
                            >
                              <RiExternalLinkLine className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                        <p className="text-gray-500 text-sm transition-colors duration-300">
                          {formData.tipo === "foto"
                            ? "URL da imagem (JPG, PNG, WebP)"
                            : "URL do vídeo (YouTube, Vimeo, etc.)"}
                        </p>
                      </div>
                    </motion.div>

                    {/* Preview da Mídia */}
                    {formData.url && isValidUrl(formData.url) && (
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-semibold text-gray-700">
                          Preview da Mídia
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 transition-all duration-300 hover:shadow-md">
                          {formData.tipo === "foto" ? (
                            <div className="flex flex-col items-center justify-center text-center">
                              <motion.div
                                className="relative w-full max-h-64 mb-3"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Image
                                  src={formData.url}
                                  alt="Preview"
                                  width={400}
                                  height={256}
                                  className="max-w-full max-h-64 object-contain rounded transition-transform duration-300"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                  }}
                                />
                              </motion.div>
                              <p className="text-sm text-gray-600 break-all">
                                {formData.url}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <RiVideoLine className="w-16 h-16 text-purple-400 mx-auto mb-3" />
                              </motion.div>
                              <p className="text-sm text-gray-600 mb-2">
                                Link de vídeo: {formData.url}
                              </p>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={openMediaUrl}
                                  className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white transition-colors duration-300"
                                >
                                  <RiExternalLinkLine className="w-3 h-3 mr-1" />
                                  Abrir Vídeo
                                </Button>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Configurações Avançadas */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-gray-500 text-sm transition-colors duration-300">
                          Número menor aparece primeiro
                        </p>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Status do Item
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
                                  Ativo
                                </>
                              ) : (
                                <>
                                  <RiEyeOffLine className="w-4 h-4 text-gray-600" />
                                  Inativo
                                </>
                              )}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {formData.status
                                ? "Visível no site"
                                : "Oculto no site"}
                            </p>
                          </div>
                        </motion.div>
                      </div>

                      {/* Destaque */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Item em Destaque
                        </Label>
                        <motion.div
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border transition-all duration-300 hover:bg-gray-100 hover:shadow-sm"
                          whileHover={{ scale: 1.02 }}
                        >
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
                            <p className="font-medium text-gray-800 flex items-center gap-2">
                              {formData.destaque ? (
                                <>
                                  <RiStarLine className="w-4 h-4 text-yellow-500" />
                                  Em destaque
                                </>
                              ) : (
                                "Normal"
                              )}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {formData.destaque
                                ? "Destacado na galeria"
                                : "Listagem normal"}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Botões de Ação */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.6 }}
                      className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          type="submit"
                          disabled={saving}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <RiRefreshLine className="w-4 h-4 mr-2" />
                              </motion.div>
                              Salvando...
                            </>
                          ) : (
                            <>
                              <RiSaveLine className="w-4 h-4 mr-2" />
                              Salvar Alterações
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
                          disabled={saving}
                          onClick={() => router.push("/admin/galeria/itens")}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações do Sistema */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Informações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">ID:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded transition-colors duration-300">
                      {item.id}
                    </code>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Criado em:</span>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <RiCalendarLine className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Última atualização:</span>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <RiCalendarLine className="w-3 h-3" />
                      {new Date(item.updated_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Categoria atual:</span>
                    <Badge
                      variant="outline"
                      className="bg-gray-100 transition-colors duration-300"
                    >
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
            </motion.div>

            {/* Status Atual */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Status Atual
                  </CardTitle>
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
                          <RiEyeLine className="w-3 h-3 mr-1" /> Ativo
                        </>
                      ) : (
                        <>
                          <RiEyeOffLine className="w-3 h-3 mr-1" /> Inativo
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
                          <RiStarLine className="w-3 h-3 mr-1" /> Sim
                        </>
                      ) : (
                        "Não"
                      )}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Ordem atual:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded transition-colors duration-300">
                      {item.ordem}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ajuda */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                    <RiAlertLine className="w-4 h-4 text-amber-500" />
                    Dicas de Edição
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Atualize a <strong>URL</strong> se a mídia foi movida
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Itens inativos</strong> não aparecem no site
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Destaques</strong> aparecem em posição especial
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
                      Use o botão <strong>🔗</strong> para testar a URL
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Escolha a <strong>categoria</strong> correta
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
