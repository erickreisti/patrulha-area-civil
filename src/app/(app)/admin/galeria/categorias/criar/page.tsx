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
  RiFolderLine,
  RiImageLine,
  RiVideoLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArchiveLine,
  RiInformationLine,
  RiCheckLine,
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
  const { isAdmin, hasAdminSession } = useAuthStore();

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

  // Verificar permissões
  useEffect(() => {
    if (isAdmin === false || !hasAdminSession) {
      toast.error("Acesso negado.");
      router.push("/admin/galeria/categorias");
    }
  }, [isAdmin, hasAdminSession, router]);

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
        router.push("/admin/galeria");
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

  if (!hasAdminSession) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-bebas">
              NOVA CATEGORIA
            </h1>
            <p className="text-slate-500 font-medium">
              Crie um novo álbum para organizar mídias da galeria.
            </p>
          </div>
          <Link href="/admin/galeria">
            <Button
              variant="outline"
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              <RiArrowLeftLine className="mr-2" /> Voltar
            </Button>
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Coluna Principal (Formulário) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <RiFolderLine className="text-emerald-600" /> Informações
                  Básicas
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <form
                  id="categoria-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-slate-700">
                      Nome da Categoria <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={handleNomeChange}
                      placeholder="Ex: Treinamentos 2024"
                      className={`h-11 ${formErrors.nome ? "border-red-500 focus-visible:ring-red-200" : "border-slate-200"}`}
                    />
                    {formErrors.nome && (
                      <p className="text-xs text-red-500 font-medium">
                        {formErrors.nome}
                      </p>
                    )}
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-slate-700">
                      Slug (URL Amigável){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 bg-slate-50 border-r border-slate-200 rounded-l-md px-3 text-sm">
                        /galeria/
                      </div>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        placeholder="ex: treinamentos-2024"
                        className={`pl-24 h-11 ${formErrors.slug ? "border-red-500" : "border-slate-200"}`}
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
                    <Label htmlFor="descricao" className="text-slate-700">
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
                      className="resize-none border-slate-200 focus:border-emerald-500 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Tipo */}
                    <div className="space-y-3">
                      <Label className="text-slate-700">Tipo de Conteúdo</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(v: "fotos" | "videos") =>
                          setFormData((prev) => ({ ...prev, tipo: v }))
                        }
                      >
                        <SelectTrigger className="h-11 border-slate-200">
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
                    <div className="space-y-3">
                      <Label htmlFor="ordem" className="text-slate-700">
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
                        className="h-11 border-slate-200"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-200/50"
                >
                  Cancelar
                </Button>
                <Button
                  form="categoria-form"
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md shadow-emerald-100 transition-all hover:translate-y-[-1px]"
                >
                  {loading ? (
                    <>
                      <RiRefreshLine className="animate-spin mr-2" />{" "}
                      Salvando...
                    </>
                  ) : (
                    <>
                      <RiSaveLine className="mr-2" /> Salvar Categoria
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Coluna Lateral (Configurações) */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Card de Visibilidade */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4">
                <CardTitle className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  Visibilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                {/* Status Switch */}
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-slate-700 cursor-pointer">
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
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-slate-700 cursor-pointer">
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
              </CardContent>
            </Card>

            {/* Card de Dicas */}
            <Card className="border-l-4 border-l-blue-500 shadow-md bg-blue-50/30">
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
        </motion.div>
      </div>
    </div>
  );
}
