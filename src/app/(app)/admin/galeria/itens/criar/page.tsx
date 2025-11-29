"use client";

import { useState, useEffect, useCallback } from "react";
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
  RiStarLine,
  RiExternalLinkLine,
} from "react-icons/ri";

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
  ordem: number;
  status: boolean;
  destaque: boolean;
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

export default function CriarItemGaleriaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descricao: "",
    tipo: "foto",
    categoria_id: "",
    ordem: 0,
    status: true,
    destaque: false,
  });

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
    fetchCategorias();
  }, [fetchCategorias]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ordem" ? Number(value) : value,
    }));
  };

  const handleSwitchChange = (name: keyof FormData, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleTipoChange = (tipo: "foto" | "video") => {
    setFormData((prev) => ({
      ...prev,
      tipo,
      categoria_id: "",
    }));
  };

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

    if (!mediaUrl.trim()) {
      errors.push("URL da mídia é obrigatória");
    }

    if (formData.ordem < 0) {
      errors.push("Ordem não pode ser negativa");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrors(["Usuário não autenticado"]);
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
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

      if (insertError) throw insertError;

      toast.success("Item criado com sucesso!");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin/galeria/itens");
      }, 1500);
    } catch (err: unknown) {
      console.error("Erro ao criar item:", err);
      const error = err as { code?: string; message: string };

      if (error.code === "23505") {
        toast.error("Já existe um item com este título.");
      } else {
        toast.error("Erro ao criar item");
      }
    } finally {
      setLoading(false);
    }
  };

  const categoriasFiltradas = categorias.filter(
    (cat) => cat.tipo === (formData.tipo === "foto" ? "fotos" : "videos")
  );

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
              NOVO ITEM DA GALERIA
            </h1>
            <p className="text-gray-600">
              Adicione novas fotos ou vídeos à galeria
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
                        Item criado com sucesso. Redirecionando...
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
                    Novo Item da Galeria
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
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        placeholder="Ex: Treinamento de Resgate Aéreo"
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        required
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
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleInputChange}
                        placeholder="Descreva o conteúdo deste item..."
                        rows={4}
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 resize-none"
                        maxLength={500}
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
                              <SelectItem value="no-category" disabled>
                                Nenhuma categoria disponível
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

                    {/* URL da Mídia */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">
                        URL da Mídia *
                      </Label>
                      <div className="flex items-center">
                        <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-600 text-sm transition-colors duration-300">
                          <RiExternalLinkLine className="w-3 h-3" />
                        </span>
                        <Input
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          placeholder={
                            formData.tipo === "foto"
                              ? "https://exemplo.com/imagem.jpg"
                              : "https://youtube.com/watch?v=..."
                          }
                          className="flex-1 rounded-l-none transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {mediaUrl && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg transition-all duration-300"
                        >
                          <p className="text-xs text-green-700 flex items-center gap-1">
                            <RiCheckLine className="w-3 h-3" />✅{" "}
                            {formData.tipo === "foto" ? "Imagem" : "Vídeo"}{" "}
                            carregado com sucesso
                          </p>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Configurações Avançadas */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.4 }}
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
                          name="ordem"
                          type="number"
                          min="0"
                          value={formData.ordem}
                          onChange={handleInputChange}
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
                              handleSwitchChange("status", checked)
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
                              handleSwitchChange("destaque", checked)
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
                                ? "Destacado"
                                : "Listagem normal"}
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
                          disabled={loading || categoriasFiltradas.length === 0}
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
                              Criar Item
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
                          onClick={() => router.push("/admin/galeria/itens")}
                          variant="outline"
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
            {/* Status */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
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
                      {formData.destaque ? "⭐ Sim" : "Não"}
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

            {/* Informações */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Informações
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
                      <strong>Fotos:</strong> JPG, PNG, WEBP
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Vídeos:</strong> YouTube, Vimeo, MP4
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Categorias Disponíveis */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-gray-800">
                    <RiFolderLine className="w-4 h-4 mr-2 text-blue-600" />
                    Categorias Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoriasFiltradas.length === 0 ? (
                      <p className="text-sm text-amber-600 text-center py-4">
                        <RiAlertLine className="w-4 h-4 mx-auto mb-1" />
                        Nenhuma categoria disponível para{" "}
                        {formData.tipo === "foto" ? "fotos" : "vídeos"}
                      </p>
                    ) : (
                      categoriasFiltradas.map((categoria) => (
                        <motion.div
                          key={categoria.id}
                          className={`flex items-center justify-between p-3 rounded transition-all duration-300 cursor-pointer ${
                            formData.categoria_id === categoria.id
                              ? "bg-blue-50 border border-blue-200 shadow-md"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              categoria_id: categoria.id,
                            }))
                          }
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
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
