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
} from "react-icons/ri";
import { FileUpload } from "@/components/ui/file-upload";

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

// Função helper para verificar se é admin
async function checkIsAdmin(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  return profile && profile.role === "admin" && profile.status === true;
}

export default function CriarItemGaleriaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");

  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descricao: "",
    tipo: "foto",
    categoria_id: "",
    ordem: 0,
    status: true,
    destaque: false,
  });

  // Verificar se usuário é admin
  useEffect(() => {
    async function verifyAdmin() {
      const adminStatus = await checkIsAdmin(supabase);
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        toast.error("Acesso negado. Apenas administradores podem criar itens.");
        setTimeout(() => {
          router.push("/admin/galeria/itens");
        }, 2000);
      }
    }

    verifyAdmin();
  }, [supabase, router]);

  const fetchCategorias = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("galeria_categorias")
        .select("id, nome, tipo")
        .eq("status", true)
        .eq("arquivada", false)
        .order("ordem", { ascending: true });

      if (fetchError) throw fetchError;
      setCategorias(data || []);
    } catch (err: unknown) {
      console.error("Erro ao carregar categorias:", err);
      toast.error("Erro ao carregar categorias");
    }
  }, [supabase]);

  useEffect(() => {
    if (isAdmin) {
      fetchCategorias();
    }
  }, [fetchCategorias, isAdmin]);

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
    setMediaUrl("");
  };

  const handleMediaUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      setMediaUrl(urls[0]);
      toast.success("Mídia carregada com sucesso!");
    }
  };

  const handleMediaFileChange = (url: string) => {
    setMediaUrl(url);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.titulo.trim()) {
      errors.push("Título é obrigatório");
    } else if (formData.titulo.length < 3) {
      errors.push("Título deve ter pelo menos 3 caracteres");
    } else if (formData.titulo.length > 200) {
      errors.push("Título não pode ter mais de 200 caracteres");
    }

    if (!formData.categoria_id) {
      errors.push("Categoria é obrigatória");
    }

    if (!mediaUrl) {
      errors.push("É necessário fazer upload de uma mídia");
    }

    if (formData.descricao.length > 500) {
      errors.push("Descrição não pode ter mais de 500 caracteres");
    }

    if (formData.ordem < 0 || formData.ordem > 999) {
      errors.push("Ordem deve ser entre 0 e 999");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar novamente se é admin antes de prosseguir
    const adminCheck = await checkIsAdmin(supabase);
    if (!adminCheck) {
      setErrors(["Acesso negado. Apenas administradores podem criar itens."]);
      toast.error("Permissão negada");
      return;
    }

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
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrors(["Usuário não autenticado"]);
        setLoading(false);
        return;
      }

      // Verificação adicional de permissão
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin" || !profile.status) {
        setErrors(["Acesso negado. Permissão de administrador necessária."]);
        setLoading(false);
        return;
      }

      const { data: itemData, error: insertError } = await supabase
        .from("galeria_itens")
        .insert([
          {
            titulo: formData.titulo.trim(),
            descricao: formData.descricao.trim() || null,
            tipo: formData.tipo,
            categoria_id: formData.categoria_id,
            arquivo_url: mediaUrl,
            thumbnail_url: formData.tipo === "video" ? null : mediaUrl,
            status: formData.status,
            destaque: formData.destaque,
            ordem: formData.ordem,
            autor_id: user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        // Type assertion para acessar propriedades específicas do erro
        const error = insertError as { code?: string; message?: string };

        if (error.code === "23505") {
          toast.error("Já existe um item com este título.");
          setErrors(["Já existe um item com este título na galeria"]);
        } else if (error.code === "23503") {
          toast.error("Categoria não encontrada.");
          setErrors(["Categoria selecionada não existe mais"]);
        } else if (error.code === "42501") {
          toast.error("Você não tem permissão para criar itens.");
          setErrors(["Permissão negada. Verifique se você é administrador."]);
        } else {
          toast.error("Erro ao criar item");
          setErrors([
            "Erro interno ao salvar o item: " +
              (error.message || "Erro desconhecido"),
          ]);
        }
        throw insertError;
      }

      // Log de atividade
      await supabase.from("system_activities").insert([
        {
          user_id: user.id,
          action_type: "create",
          description: `Criou novo item da galeria: "${formData.titulo}"`,
          resource_type: "galeria_item",
          resource_id: itemData.id,
          metadata: {
            tipo: formData.tipo,
            categoria_id: formData.categoria_id,
            url: mediaUrl,
            destaque: formData.destaque,
          },
        },
      ]);

      toast.success("Item criado com sucesso!");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin/galeria/itens");
      }, 1500);
    } catch (err: unknown) {
      console.error("Erro ao criar item:", err);
      // Se não for um erro que já tratamos acima
      if (!errors.length) {
        setErrors(["Erro interno ao salvar o item"]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Se não for admin, mostrar mensagem de acesso negado
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 flex items-center justify-center">
        <Card className="border-0 shadow-lg max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              <RiAlertLine className="w-12 h-12 mx-auto mb-4" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Apenas administradores podem criar itens na galeria.
            </p>
            <Button
              onClick={() => router.push("/admin/galeria/itens")}
              className="w-full"
            >
              <RiArrowLeftLine className="w-4 h-4 mr-2" />
              Voltar para Itens
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se ainda está verificando admin
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const categoriasFiltradas = categorias.filter(
    (cat) => cat.tipo === (formData.tipo === "foto" ? "fotos" : "videos")
  );

  const uploadType = formData.tipo === "foto" ? "media" : "video";
  const acceptTypes = formData.tipo === "foto" ? "image/*" : "video/*";
  const bucket = formData.tipo === "foto" ? "galeria-fotos" : "galeria-videos";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header com botões abaixo */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn}
          className="mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
              NOVO ITEM DA GALERIA
            </h1>
            <p className="text-gray-600">
              Adicione novas fotos ou vídeos à galeria
            </p>
          </div>

          {/* Botões de Navegação - ABAIXO DO HEADER */}
          <div className="flex flex-wrap gap-3 mt-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/admin/galeria/itens">
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <RiArrowLeftLine className="w-4 h-4 mr-2" />
                  Voltar para Itens
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/admin/dashboard">
                <Button
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                >
                  <RiBarChartLine className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/perfil">
                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  <RiUserLine className="w-4 h-4 mr-2" />
                  Meu Perfil
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white"
                >
                  <RiHomeLine className="w-4 h-4 mr-2" />
                  Voltar ao Site
                </Button>
              </Link>
            </motion.div>
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
              <Card className="border-0 shadow-lg hover:shadow-xl">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <RiImageLine className="w-5 h-5 mr-2 text-navy-600" />
                    Novo Item da Galeria
                    <Badge className="ml-2 bg-green-600">Admin</Badge>
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
                        required
                        maxLength={200}
                      />
                      <p
                        className={`text-sm ${
                          formData.titulo.length > 180
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
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
                        maxLength={500}
                        className="resize-none"
                      />
                      <p
                        className={`text-sm ${
                          formData.descricao.length > 450
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
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
                              className={`w-full ${
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
                              className={`w-full ${
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
                          disabled={categoriasFiltradas.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                categoriasFiltradas.length === 0
                                  ? "Crie uma categoria primeiro"
                                  : "Selecione uma categoria"
                              }
                            />
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

                    {/* Upload de Mídia */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">
                        {formData.tipo === "foto"
                          ? "Upload de Foto"
                          : "Upload de Vídeo"}{" "}
                        *
                      </Label>

                      <FileUpload
                        type={uploadType}
                        bucket={bucket}
                        multiple={false}
                        maxFiles={1}
                        onUploadComplete={handleMediaUploadComplete}
                        onFileChange={handleMediaFileChange}
                        currentFile={mediaUrl}
                        accept={acceptTypes}
                        className="w-full"
                      />

                      {mediaUrl && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <RiCheckLine className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-800">
                                Mídia carregada com sucesso!
                              </p>
                              <p className="text-xs text-green-600 truncate">
                                {mediaUrl}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setMediaUrl("")}
                              className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <RiCloseLine className="w-3 h-3" />
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      <p className="text-xs text-gray-500">
                        {formData.tipo === "foto"
                          ? "Formatos: JPG, PNG, WEBP. Máximo 5MB."
                          : "Formatos: MP4, AVI, MOV. Máximo 50MB. Recomendado: MP4"}
                      </p>
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
                          max="999"
                          step="1"
                          value={formData.ordem}
                          onChange={handleInputChange}
                        />
                        <p className="text-gray-500 text-sm">
                          Número menor aparece primeiro (0-999)
                        </p>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Status do Item
                        </Label>
                        <motion.div
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 hover:shadow-sm"
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
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 hover:shadow-sm"
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
                                ? "Destacado na página inicial"
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
                          disabled={
                            loading ||
                            categoriasFiltradas.length === 0 ||
                            !mediaUrl ||
                            !isAdmin
                          }
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 disabled:opacity-50"
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
                          className="w-full border-gray-600 text-gray-600 hover:bg-gray-100 hover:text-gray-900 py-3"
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
              <Card className="border-0 shadow-lg hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Resumo do Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Permissão:</span>
                    <Badge className="bg-green-600 text-white">
                      {isAdmin ? "Admin ✓" : "Não Admin ✗"}
                    </Badge>
                  </div>

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
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {formData.ordem}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-gray-200 pt-4">
                    <span className="text-gray-600">Mídia:</span>
                    <span className="text-sm font-medium">
                      {mediaUrl ? "✅ Carregada" : "⏳ Aguardando"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="text-sm font-medium">
                      {formData.categoria_id
                        ? categorias.find((c) => c.id === formData.categoria_id)
                            ?.nome || "Selecionada"
                        : "❌ Não selecionada"}
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
              <Card className="border-0 shadow-lg hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Informações Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-start gap-2">
                    <RiAlertLine className="w-3 h-3 text-red-600 mt-0.5" />
                    <span>
                      <strong>Apenas administradores</strong> podem criar itens
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5" />
                    <span>
                      Campos com <strong>*</strong> são obrigatórios
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5" />
                    <span>
                      <strong>Título:</strong> Máximo 200 caracteres
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5" />
                    <span>
                      <strong>Descrição:</strong> Máximo 500 caracteres
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5" />
                    <span>
                      <strong>Ordem:</strong> Menor número = primeiro lugar
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5" />
                    <span>
                      <strong>Destaques</strong> aparecem em posição especial
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5" />
                    <span>
                      <strong>Itens inativos</strong> não aparecem no site
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
              <Card className="border-0 shadow-lg hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-gray-800">
                    <RiFolderLine className="w-4 h-4 mr-2 text-blue-600" />
                    Categorias Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoriasFiltradas.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="mb-2">
                          <RiAlertLine className="w-8 h-8 text-amber-400 mx-auto" />
                        </div>
                        <p className="text-sm text-amber-600">
                          Nenhuma categoria disponível para{" "}
                          {formData.tipo === "foto" ? "fotos" : "vídeos"}
                        </p>
                        <Button
                          type="button"
                          variant="link"
                          className="text-blue-600 text-xs mt-2"
                          onClick={() =>
                            router.push("/admin/galeria/categorias")
                          }
                        >
                          Criar nova categoria →
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-3">
                          Categorias disponíveis:
                        </p>
                        {categoriasFiltradas.map((categoria) => (
                          <motion.div
                            key={categoria.id}
                            className={`flex items-center justify-between p-3 rounded cursor-pointer ${
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
                            <div className="flex items-center">
                              {formData.categoria_id === categoria.id && (
                                <RiCheckLine className="w-4 h-4 text-green-600 mr-2" />
                              )}
                              <span className="text-sm font-medium">
                                {categoria.nome}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={
                                categoria.tipo === "fotos"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }
                            >
                              {categoria.tipo === "fotos" ? "Fotos" : "Vídeos"}
                            </Badge>
                          </motion.div>
                        ))}
                      </>
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
