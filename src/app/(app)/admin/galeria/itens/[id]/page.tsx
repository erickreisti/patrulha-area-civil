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
  RiCheckLine,
} from "react-icons/ri";
import { FileUpload } from "@/components/ui/file-upload";

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

// ✅ Mesma função verificadora de admin
async function checkIsAdmin(
  supabase: ReturnType<typeof createClient>
): Promise<boolean> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Erro na autenticação:", authError?.message);
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("❌ Erro ao buscar perfil:", profileError.message);
      return false;
    }

    if (!profile) {
      console.log("❌ Perfil não encontrado");
      return false;
    }

    return profile.role === "admin" && profile.status === true;
  } catch (error) {
    console.error("💥 Erro inesperado ao verificar admin:", error);
    return false;
  }
}

export default function EditarItemPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [item, setItem] = useState<GaleriaItem | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");

  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descricao: "",
    tipo: "foto",
    categoria_id: "",
    status: true,
    destaque: false,
    ordem: 0,
  });

  const itemId = params.id as string;

  // Verificar se usuário é admin
  useEffect(() => {
    async function verifyAdmin() {
      const adminStatus = await checkIsAdmin(supabase);
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        toast.error(
          "Acesso negado. Apenas administradores podem editar itens."
        );
        setTimeout(() => {
          router.push("/admin/galeria/itens");
        }, 2000);
      }
    }

    verifyAdmin();
  }, [supabase, router]);

  const fetchItem = useCallback(async () => {
    if (!isAdmin) return;

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

      if (fetchError) throw fetchError;

      if (data) {
        setItem(data);
        setMediaUrl(data.arquivo_url);
        setFormData({
          titulo: data.titulo || "",
          descricao: data.descricao || "",
          tipo: data.tipo || "foto",
          categoria_id: data.categoria_id || "",
          status: data.status ?? true,
          destaque: data.destaque ?? false,
          ordem: data.ordem || 0,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar item:", error);
      toast.error("Não foi possível carregar o item.");
    } finally {
      setLoading(false);
    }
  }, [itemId, supabase, isAdmin]);

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
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    }
  }, [supabase]);

  useEffect(() => {
    if (itemId && isAdmin === true) {
      fetchItem();
      fetchCategorias();
    }
  }, [itemId, fetchItem, fetchCategorias, isAdmin]);

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
      errors.push("É necessário ter uma mídia");
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

    // Verificar se é admin
    const adminCheck = await checkIsAdmin(supabase);
    if (!adminCheck) {
      toast.error("Acesso negado. Apenas administradores podem editar itens.");
      setErrors(["Permissão negada. Você precisa ser administrador."]);
      return;
    }

    setSaving(true);
    setErrors([]);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrors(["Usuário não autenticado"]);
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("galeria_itens")
        .update({
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim() || null,
          tipo: formData.tipo,
          categoria_id: formData.categoria_id,
          arquivo_url: mediaUrl,
          thumbnail_url: formData.tipo === "video" ? null : mediaUrl,
          status: formData.status,
          destaque: formData.destaque,
          ordem: formData.ordem,
        })
        .eq("id", itemId)
        .select()
        .single();

      if (updateError) {
        console.error("Erro ao atualizar:", updateError);
        throw updateError;
      }

      // Log de atividade
      await supabase.from("system_activities").insert([
        {
          user_id: user.id,
          action_type: "update",
          description: `Atualizou item da galeria: "${formData.titulo}"`,
          resource_type: "galeria_item",
          resource_id: itemId,
          metadata: {
            tipo: formData.tipo,
            categoria_id: formData.categoria_id,
            destaque: formData.destaque,
          },
        },
      ]);

      toast.success("Item atualizado com sucesso!");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin/galeria/itens");
      }, 1500);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);

      if (error && typeof error === "object" && "code" in error) {
        const supabaseError = error as { code: string; message: string };
        if (supabaseError.code === "23505") {
          toast.error("Já existe um item com este título.");
          setErrors(["Já existe um item com este título"]);
        } else if (supabaseError.code === "23503") {
          toast.error("Categoria não encontrada.");
          setErrors(["Categoria não encontrada"]);
        } else if (supabaseError.code === "42501") {
          toast.error("Você não tem permissão para atualizar itens.");
          setErrors(["Permissão negada. Verifique se você é administrador."]);
        } else {
          toast.error("Erro ao atualizar item: " + supabaseError.message);
          setErrors(["Erro interno: " + supabaseError.message]);
        }
      } else {
        toast.error("Erro ao atualizar item");
        setErrors(["Erro interno ao atualizar o item"]);
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

  const handleMediaUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      setMediaUrl(urls[0]);
      toast.success("Mídia atualizada com sucesso!");
    }
  };

  const handleMediaFileChange = (url: string) => {
    setMediaUrl(url);
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
              Apenas administradores podem editar itens na galeria.
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
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                Voltar para Itens
              </Button>
            </Link>
          </motion.div>
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
              EDITAR ITEM DA GALERIA
            </h1>
            <p className="text-gray-600">Editando: {item.titulo}</p>
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
              <Card className="border-0 shadow-lg hover:shadow-xl">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <RiImageLine className="w-5 h-5 mr-2 text-navy-600" />
                    Editar Item da Galeria
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
                        value={formData.titulo}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            titulo: e.target.value,
                          }))
                        }
                        placeholder="Ex: Treinamento de Resgate Aéreo"
                        maxLength={200}
                      />
                      <p className="text-gray-500 text-sm">
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
                        className="resize-none"
                      />
                      <p className="text-gray-500 text-sm">
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
                        >
                          <SelectTrigger>
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

                    {/* ✅ Upload de Mídia COM FileUpload COMPONENT */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">
                        {formData.tipo === "foto"
                          ? "Upload de Foto"
                          : "Upload de Vídeo"}
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
                          : "Formatos: MP4, AVI, MOV. Máximo 50MB."}
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
                          type="number"
                          min="0"
                          max="999"
                          value={formData.ordem}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              ordem: parseInt(e.target.value) || 0,
                            }))
                          }
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
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 hover:shadow-sm"
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
                          disabled={saving}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 disabled:opacity-50"
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
            {/* Informações do Sistema */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
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
                      <RiCalendarLine className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
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
            </motion.div>

            {/* Status Atual */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl">
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
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
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
              <Card className="border-0 shadow-lg hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                    <RiAlertLine className="w-4 h-4 text-amber-500" />
                    Dicas de Edição
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5" />
                    <span>
                      Atualize a <strong>mídia</strong> se necessário
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5" />
                    <span>
                      <strong>Itens inativos</strong> não aparecem no site
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
                      A <strong>ordem</strong> define a posição na listagem
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RiCheckLine className="w-3 h-3 text-green-600 mt-0.5" />
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
