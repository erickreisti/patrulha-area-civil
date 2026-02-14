"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiRefreshLine,
  RiImageLine,
  RiVideoLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArchiveLine,
  RiInformationLine,
  RiCheckLine,
  RiFileTextLine,
  RiSettings3Line,
  RiLoader4Line,
} from "react-icons/ri";

// Actions e Store
import { createCategoria, generateAvailableSlug } from "@/app/actions/gallery";
import { useAuthStore } from "@/lib/stores/useAuthStore";

// ============================================
// TIPAGEM
// ============================================

interface FormData {
  nome: string;
  slug: string;
  descricao: string;
  tipo: "fotos" | "videos";
  status: boolean;
  ordem: number;
  arquivada: boolean;
}

interface FormErrors {
  nome?: string;
  slug?: string;
  ordem?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function CriarCategoriaPage() {
  const router = useRouter();
  const { isAdmin, hasAdminSession, initialize: initAuth } = useAuthStore();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    slug: "",
    descricao: "",
    tipo: "fotos",
    status: true,
    ordem: 0,
    arquivada: false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Inicialização Auth
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await initAuth();
      } catch (error) {
        console.error("Erro auth:", error);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [initAuth]);

  // Verificar permissões
  useEffect(() => {
    if (checkingAuth) return;
    if (!isAdmin && !hasAdminSession) {
      toast.error("Acesso negado.");
      router.push("/admin/galeria/categorias");
    }
  }, [checkingAuth, isAdmin, hasAdminSession, router]);

  // Gerar slug automaticamente
  const handleNomeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setFormData((prev) => ({ ...prev, nome }));

    if (formErrors.nome) setFormErrors((prev) => ({ ...prev, nome: "" }));

    // Debounce simples para gerar slug
    if (nome.length > 2) {
      setSlugChecking(true);
      try {
        const res = await generateAvailableSlug(nome);
        if (res.success && res.slug) {
          setFormData((prev) => ({ ...prev, slug: res.slug! }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSlugChecking(false);
      }
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setFormData((prev) => ({ ...prev, slug }));
    if (formErrors.slug) setFormErrors((prev) => ({ ...prev, slug: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    else if (formData.nome.length < 3) newErrors.nome = "Mínimo 3 caracteres";

    if (!formData.slug.trim()) newErrors.slug = "Slug é obrigatório";
    else if (formData.slug.length < 3) newErrors.slug = "Mínimo 3 caracteres";

    if (formData.ordem < 0 || formData.ordem > 999)
      newErrors.ordem = "Entre 0 e 999";

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Corrija os erros no formulário");
      return;
    }

    setLoading(true);

    try {
      const res = await createCategoria({
        ...formData,
        descricao: formData.descricao || null,
      });

      if (res.success) {
        toast.success("Categoria criada com sucesso!");
        router.push("/admin/galeria/categorias");
      } else {
        toast.error(res.error || "Erro ao criar categoria");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro interno ao criar");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <RiLoader4Line className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-slate-500 font-medium animate-pulse">
          Verificando permissões...
        </p>
      </div>
    );
  }

  if (!isAdmin && !hasAdminSession) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight font-bebas mb-1">
              NOVA CATEGORIA
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Crie um novo álbum para organizar mídias da galeria.
            </p>
          </div>
          <Link href="/admin/galeria/categorias">
            <Button
              variant="outline"
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              <RiArrowLeftLine className="mr-2" /> Voltar
            </Button>
          </Link>
        </motion.div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Coluna Principal (Formulário) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                <CardTitle className="text-sm font-bold uppercase text-slate-700 tracking-wide flex items-center gap-2">
                  <RiFileTextLine className="text-emerald-600 w-4 h-4" />{" "}
                  Informações Básicas
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-slate-700 font-medium">
                    Nome da Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={handleNomeChange}
                    placeholder="Ex: Treinamentos 2024"
                    className={`h-11 bg-slate-50/50 focus:bg-white transition-colors ${
                      formErrors.nome
                        ? "border-red-500 focus-visible:ring-red-200"
                        : "border-slate-200"
                    }`}
                  />
                  {formErrors.nome && (
                    <p className="text-xs text-red-500 font-medium">
                      {formErrors.nome}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-slate-700 font-medium">
                    Slug (URL Amigável) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 bg-slate-100 border-r border-slate-200 rounded-l-md px-3 text-sm">
                      /galeria/
                    </div>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      placeholder="ex: treinamentos-2024"
                      className={`pl-24 h-11 bg-slate-50/50 focus:bg-white transition-colors ${
                        formErrors.slug ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                    {slugChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <RiRefreshLine className="animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                  {formErrors.slug ? (
                    <p className="text-xs text-red-500 font-medium">
                      {formErrors.slug}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Gerado automaticamente a partir do nome.
                    </p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label
                    htmlFor="descricao"
                    className="text-slate-700 font-medium"
                  >
                    Descrição{" "}
                    <span className="text-slate-400 font-normal">
                      (Opcional)
                    </span>
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
                    rows={4}
                    placeholder="Descreva o conteúdo desta categoria..."
                    className="resize-none border-slate-200 bg-slate-50/50 focus:bg-white transition-colors min-h-[100px]"
                  />
                </div>

                {/* Tipo de Conteúdo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Tipo de Conteúdo
                    </Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(v: "fotos" | "videos") =>
                        setFormData((prev) => ({ ...prev, tipo: v }))
                      }
                    >
                      <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fotos">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 rounded text-blue-600">
                              <RiImageLine />
                            </div>
                            <span>Álbum de Fotos</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="videos">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-purple-100 rounded text-purple-600">
                              <RiVideoLine />
                            </div>
                            <span>Galeria de Vídeos</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ordem */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="ordem"
                      className="text-slate-700 font-medium"
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
                          ordem: Number(e.target.value),
                        }))
                      }
                      className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coluna Lateral (Configurações) */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-none shadow-lg bg-white sticky top-6 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                <CardTitle className="text-sm font-bold uppercase text-slate-700 tracking-wide flex items-center gap-2">
                  <RiSettings3Line className="w-4 h-4" /> Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Status Switch */}
                <div className="flex items-center justify-between group">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                      {formData.status ? (
                        <RiEyeLine className="text-emerald-500" />
                      ) : (
                        <RiEyeOffLine className="text-slate-400" />
                      )}
                      Status Ativo
                    </Label>
                    <p className="text-xs text-slate-500">
                      {formData.status
                        ? "Visível no site público."
                        : "Oculto (Rascunho)."}
                    </p>
                  </div>
                  <Switch
                    checked={formData.status}
                    onCheckedChange={(c) =>
                      setFormData((prev) => ({ ...prev, status: c }))
                    }
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Arquivada Switch */}
                <div className="flex items-center justify-between group">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                      <RiArchiveLine
                        className={
                          formData.arquivada
                            ? "text-amber-500"
                            : "text-slate-400"
                        }
                      />
                      Arquivada
                    </Label>
                    <p className="text-xs text-slate-500">
                      Mover para histórico antigo.
                    </p>
                  </div>
                  <Switch
                    checked={formData.arquivada}
                    onCheckedChange={(c) =>
                      setFormData((prev) => ({ ...prev, arquivada: c }))
                    }
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                {/* Botão de Salvar */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100/50 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RiLoader4Line className="animate-spin mr-2" />{" "}
                        Criando...
                      </>
                    ) : (
                      <>
                        <RiSaveLine className="mr-2" /> Criar Categoria
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card de Dicas */}
            <Card className="border-l-4 border-l-blue-500 shadow-md bg-blue-50/30 border-y-0 border-r-0">
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 p-1 bg-blue-100 text-blue-600 rounded-full h-fit">
                    <RiInformationLine size={16} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-blue-900 text-sm">
                      Organização
                    </h4>
                    <p className="text-xs text-blue-800/80 leading-relaxed">
                      Categorias de <strong>Fotos</strong> só aceitam uploads de
                      imagens. Categorias de <strong>Vídeos</strong> aceitam
                      links (YouTube) ou arquivos de vídeo.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-600 rounded-full h-fit">
                    <RiCheckLine size={16} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-emerald-900 text-sm">
                      SEO Friendly
                    </h4>
                    <p className="text-xs text-emerald-800/80 leading-relaxed">
                      O <strong>slug</strong> é usado na URL. Mantenha-o curto e
                      descritivo para melhor indexação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
