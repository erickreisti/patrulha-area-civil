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
  RiAlertLine,
  RiCheckLine,
  RiEyeLine,
  RiEyeOffLine,
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

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function CriarCategoriaPage() {
  const router = useRouter();
  const { isAdmin, hasAdminSession } = useAuthStore();

  // CORREÇÃO: Removido fetchCategorias não utilizado
  // const { fetchCategorias } = useCategoriasList();

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
        descricao: formData.descricao || null, // Converter string vazia para null
      });

      if (res.success) {
        toast.success("Categoria criada com sucesso!");
        // Redireciona de volta para a lista (a lista vai recarregar automaticamente)
        setTimeout(() => router.push("/admin/galeria/categorias"), 1000);
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

  if (!hasAdminSession) return null; // Evita flash de conteúdo

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Nova Categoria
              </h1>
              <p className="text-gray-500">
                Crie um novo álbum para organizar mídias
              </p>
            </div>
            <Link href="/admin/galeria/categorias">
              <Button variant="outline">
                <RiArrowLeftLine className="mr-2" /> Voltar
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiFolderLine className="text-blue-600" /> Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Categoria *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={handleNomeChange}
                      placeholder="Ex: Treinamentos 2024"
                      className={formErrors.nome ? "border-red-500" : ""}
                    />
                    {formErrors.nome && (
                      <p className="text-xs text-red-500">{formErrors.nome}</p>
                    )}
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL) *</Label>
                    <div className="relative">
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        placeholder="ex: treinamentos-2024"
                        className={`pl-20 ${formErrors.slug ? "border-red-500" : ""}`}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        /galeria/
                      </div>
                      {slugChecking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <RiRefreshLine className="animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    {formErrors.slug && (
                      <p className="text-xs text-red-500">{formErrors.slug}</p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          descricao: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Opcional: Descreva o conteúdo desta categoria"
                    />
                  </div>

                  {/* Configurações em Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tipo */}
                    <div className="space-y-2">
                      <Label>Tipo de Conteúdo</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(v: "fotos" | "videos") =>
                          setFormData((prev) => ({ ...prev, tipo: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fotos">
                            <div className="flex items-center gap-2">
                              <RiImageLine className="text-blue-500" /> Fotos
                            </div>
                          </SelectItem>
                          <SelectItem value="videos">
                            <div className="flex items-center gap-2">
                              <RiVideoLine className="text-purple-500" /> Vídeos
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ordem */}
                    <div className="space-y-2">
                      <Label htmlFor="ordem">Ordem de Exibição</Label>
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
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <RiRefreshLine className="animate-spin mr-2" />
                      ) : (
                        <RiSaveLine className="mr-2" />
                      )}
                      {loading ? "Criando..." : "Criar Categoria"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar (Configurações) */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status e Visibilidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Switch */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      {formData.status ? (
                        <RiEyeLine className="text-green-600" />
                      ) : (
                        <RiEyeOffLine className="text-gray-400" />
                      )}
                      Status Ativo
                    </Label>
                    <span className="text-xs text-gray-500">
                      {formData.status
                        ? "Visível publicamente"
                        : "Oculto (Rascunho)"}
                    </span>
                  </div>
                  <Switch
                    checked={formData.status}
                    onCheckedChange={(c) =>
                      setFormData((prev) => ({ ...prev, status: c }))
                    }
                  />
                </div>

                {/* Arquivada Switch */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <RiFolderLine
                        className={
                          formData.arquivada
                            ? "text-amber-500"
                            : "text-gray-400"
                        }
                      />
                      Arquivada
                    </Label>
                    <span className="text-xs text-gray-500">
                      Mover para arquivo morto
                    </span>
                  </div>
                  <Switch
                    checked={formData.arquivada}
                    onCheckedChange={(c) =>
                      setFormData((prev) => ({ ...prev, arquivada: c }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4 text-sm text-blue-800 space-y-2">
                <div className="flex gap-2">
                  <RiAlertLine className="w-5 h-5 flex-shrink-0" />
                  <p>
                    <strong>Dica:</strong> O slug é gerado automaticamente, mas
                    você pode editá-lo para melhorar o SEO.
                  </p>
                </div>
                <div className="flex gap-2">
                  <RiCheckLine className="w-5 h-5 flex-shrink-0" />
                  <p>
                    Categorias de vídeo só aceitam itens de vídeo, e vice-versa.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
