"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiUserLine,
  RiIdCardLine,
  RiMailLine,
  RiShieldKeyholeLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiAddLine,
  RiInformationLine,
  RiImageLine,
  RiBarChartLine,
  RiHomeLine,
  RiArrowDownSLine,
  RiEditLine,
  RiErrorWarningLine,
  RiAlertLine,
} from "react-icons/ri";

// IMPORT DO STORE
import { useAgentCreate, GRADUACOES, TIPOS_SANGUINEOS } from "@/lib/stores";

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

export default function CriarAgentePage() {
  const router = useRouter();
  const supabase = createClient();
  const [authLoading, setAuthLoading] = useState(true);
  const [dateOpen, setDateOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // USANDO O STORE
  const {
    saving,
    formData,
    createAgent,
    setFormData,
    resetFormData,
    validateForm,
    generateMatricula,
  } = useAgentCreate();

  // Verificar autenticação e permissões
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Sessão expirada", {
            description: "Faça login novamente para acessar esta página.",
          });
          router.push("/login");
          return;
        }

        setCurrentSession(session);

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, full_name, status")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("❌ Erro ao buscar perfil:", error);
          toast.error("Erro ao verificar permissões");
          router.push("/login");
          return;
        }

        if (!profile || profile.role !== "admin") {
          toast.error("Acesso restrito", {
            description: "Apenas administradores podem criar agentes.",
          });
          router.push("/perfil");
          return;
        }

        if (!profile.status) {
          toast.error("Conta inativa", {
            description:
              "Sua conta está inativa. Entre em contato com o administrador.",
          });
          router.push("/login");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("💥 Erro na verificação de autenticação:", error);
        toast.error("Erro de autenticação");
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    // Converter null para undefined para o FileUpload
    setFormData({ avatar_url: avatarUrl || undefined });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData({
      validade_certificacao: date
        ? date.toISOString().split("T")[0]
        : undefined,
    });
    setDateOpen(false);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Selecionar data";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentSession) {
      toast.error("Sessão expirada", {
        description: "Faça login novamente para continuar.",
      });
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      toast.error("Acesso negado", {
        description: "Apenas administradores podem criar agentes.",
      });
      return;
    }

    // Validações
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    const toastId = toast.loading(
      `Cadastrando agente ${formData.full_name}...`,
      {
        description: "Criando conta e configurando perfil",
      }
    );

    try {
      const result = await createAgent({
        matricula: formData.matricula || "",
        email: formData.email || "",
        full_name: formData.full_name || "",
        graduacao: formData.graduacao || null,
        tipo_sanguineo: formData.tipo_sanguineo || null,
        validade_certificacao: formData.validade_certificacao || null,
        role: formData.role || "agent",
        status: true,
        avatar_url: formData.avatar_url || null,
      });

      if (result.success) {
        toast.success("✅ Agente criado com sucesso!", {
          id: toastId,
          description: `O agente ${formData.full_name} foi cadastrado no sistema com sucesso.`,
          duration: 5000,
          action: {
            label: "Ver Agentes",
            onClick: () => {
              router.push("/admin/agentes");
              router.refresh();
            },
          },
        });

        // Limpar formulário
        resetFormData();

        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push("/admin/agentes");
          router.refresh();
        }, 3000);
      } else {
        throw new Error(result.error || "Erro ao criar agente");
      }
    } catch (err: unknown) {
      console.error("💥 Erro completo:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao criar agente";

      toast.error("❌ Falha ao criar agente", {
        id: toastId,
        description: errorMessage,
        duration: 6000,
        icon: <RiErrorWarningLine className="w-5 h-5 text-red-500" />,
      });
    }
  };

  // Botões de navegação
  const navigationButtons = [
    {
      href: "/admin/agentes",
      icon: RiArrowLeftLine,
      label: "Voltar para Lista",
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
      icon: RiEditLine,
      label: "Meu Perfil",
      className:
        "border-green-600 text-green-600 hover:bg-green-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
  ];

  // Converter null para undefined para o FileUpload
  const currentAvatarUrl = formData.avatar_url || undefined;

  // Loading durante verificação de autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"
            />
            <p className="text-gray-600">Verificando permissões...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não for admin, mostrar mensagem
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-red-200">
                <CardTitle className="flex items-center text-xl text-gray-800">
                  <RiAlertLine className="w-6 h-6 mr-2 text-red-500" />
                  Acesso Restrito
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <RiShieldKeyholeLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Permissão Insuficiente
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Apenas administradores podem criar novos agentes no sistema.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {navigationButtons.map((button, index) => (
                    <motion.div
                      key={button.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
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
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading skeleton durante criação
  if (saving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <Spinner className="w-8 h-8 mx-auto mb-4 text-navy-600" />
            <p className="text-gray-600">Criando novo agente...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Título e Descrição */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-3 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
              CADASTRAR NOVO AGENTE
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Preencha os dados para cadastrar um novo agente no sistema
            </p>
            <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200 w-fit">
              <RiShieldKeyholeLine className="w-4 h-4 mr-2" />
              <span>Usuário autenticado como administrador</span>
            </div>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-wrap gap-3">
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
                    className={`transition-all duration-300 ${button.className} h-11 px-4`}
                  >
                    <button.icon className="w-4 h-4 mr-2" />
                    {button.label}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="border-b border-gray-200 pb-6">
                  <CardTitle className="flex items-center text-2xl text-gray-800">
                    <RiUserLine className="w-6 h-6 mr-3 text-navy-600" />
                    Dados do Agente
                    <Badge
                      variant="outline"
                      className="ml-3 bg-green-100 text-green-800 border-green-300 text-sm py-1 px-3"
                    >
                      Novo Cadastro
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Upload de Avatar */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                      <Label className="text-base font-semibold text-gray-700 flex items-center">
                        <RiImageLine className="w-5 h-5 mr-2 text-navy-500" />
                        Foto do Agente
                      </Label>
                      <FileUpload
                        type="avatar"
                        onFileChange={handleAvatarChange}
                        currentFile={currentAvatarUrl}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-blue-500 transition-all duration-300"
                        userId={formData.matricula || "new"}
                      />
                    </motion.div>

                    {/* Matrícula com Gerador */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.1 }}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="matricula"
                        className="text-base font-semibold text-gray-700 flex items-center"
                      >
                        <RiIdCardLine className="w-5 h-5 mr-2 text-navy-500" />
                        Matrícula *
                        <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                          Única
                        </Badge>
                      </Label>
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <RiIdCardLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-300" />
                          <Input
                            id="matricula"
                            type="text"
                            name="matricula"
                            value={formData.matricula || ""}
                            onChange={handleInputChange}
                            placeholder="00000000000"
                            maxLength={11}
                            required
                            className="pl-12 text-lg py-3 h-14 transition-all duration-300 focus:ring-3 focus:ring-blue-500 border-2 rounded-xl"
                            disabled={saving}
                          />
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="button"
                            onClick={generateMatricula}
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-300 h-14 px-5"
                            disabled={saving}
                          >
                            <RiAddLine className="w-5 h-5 mr-2" />
                            Gerar
                          </Button>
                        </motion.div>
                      </div>
                      <p className="text-sm text-gray-500 pl-1">
                        11 dígitos numéricos
                      </p>
                    </motion.div>

                    {/* Nome Completo */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="full_name"
                        className="text-base font-semibold text-gray-700 flex items-center"
                      >
                        <RiUserLine className="w-5 h-5 mr-2 text-navy-500" />
                        Nome Completo *
                      </Label>
                      <div className="relative">
                        <RiUserLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-300" />
                        <Input
                          id="full_name"
                          type="text"
                          name="full_name"
                          value={formData.full_name || ""}
                          onChange={handleInputChange}
                          placeholder="Nome completo do agente"
                          required
                          className="pl-12 text-lg py-3 h-14 transition-all duration-300 focus:ring-3 focus:ring-blue-500 border-2 rounded-xl"
                          disabled={saving}
                        />
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="email"
                        className="text-base font-semibold text-gray-700 flex items-center"
                      >
                        <RiMailLine className="w-5 h-5 mr-2 text-navy-500" />
                        Email *
                      </Label>
                      <div className="relative">
                        <RiMailLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-300" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          placeholder="agente@pac.org.br"
                          required
                          className="pl-12 text-lg py-3 h-14 transition-all duration-300 focus:ring-3 focus:ring-blue-500 border-2 rounded-xl"
                          disabled={saving}
                        />
                      </div>
                    </motion.div>

                    {/* Graduação e Tipo Sanguíneo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Graduação */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.4 }}
                        className="space-y-3"
                      >
                        <Label
                          htmlFor="graduacao"
                          className="text-base font-semibold text-gray-700"
                        >
                          Graduação
                        </Label>
                        <Select
                          value={formData.graduacao || ""}
                          onValueChange={(value) =>
                            setFormData({ graduacao: value })
                          }
                          disabled={saving}
                        >
                          <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                            <SelectValue placeholder="Selecione uma graduação" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADUACOES.map((graduacao) => (
                              <SelectItem key={graduacao} value={graduacao}>
                                {graduacao}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      {/* Tipo Sanguíneo */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                      >
                        <Label
                          htmlFor="tipo_sanguineo"
                          className="text-base font-semibold text-gray-700"
                        >
                          Tipo Sanguíneo
                        </Label>
                        <Select
                          value={formData.tipo_sanguineo || ""}
                          onValueChange={(value) =>
                            setFormData({ tipo_sanguineo: value })
                          }
                          disabled={saving}
                        >
                          <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                            <SelectValue placeholder="Selecione o tipo sanguíneo" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_SANGUINEOS.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    {/* Validade da Certificação e Tipo de Usuário */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Validade da Certificação */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.6 }}
                        className="space-y-3"
                      >
                        <Label className="text-base font-semibold text-gray-700">
                          Validade da Certificação
                        </Label>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-14 justify-between text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500 px-4"
                              disabled={saving}
                            >
                              <div className="flex items-center">
                                <RiArrowDownSLine className="w-5 h-5 mr-3 text-navy-500" />
                                {formData.validade_certificacao
                                  ? formatDate(formData.validade_certificacao)
                                  : "Selecionar data"}
                              </div>
                              <RiArrowDownSLine className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                formData.validade_certificacao
                                  ? new Date(formData.validade_certificacao)
                                  : undefined
                              }
                              onSelect={handleDateSelect}
                              initialFocus
                              locale={ptBR}
                              className="rounded-xl border shadow-2xl"
                            />
                          </PopoverContent>
                        </Popover>
                        {formData.validade_certificacao && (
                          <div className="flex items-center justify-between text-sm mt-2 px-1">
                            <span className="text-gray-600">
                              Selecionado:{" "}
                              {formatDate(formData.validade_certificacao)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDateSelect(undefined)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-3 rounded-lg"
                            >
                              Limpar
                            </Button>
                          </div>
                        )}
                      </motion.div>

                      {/* Tipo de Usuário */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.7 }}
                        className="space-y-3"
                      >
                        <Label
                          htmlFor="role"
                          className="text-base font-semibold text-gray-700"
                        >
                          Tipo de Usuário
                        </Label>
                        <Select
                          value={formData.role || "agent"}
                          onValueChange={(value: "agent" | "admin") =>
                            setFormData({ role: value })
                          }
                          disabled={saving}
                        >
                          <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="agent"
                              className="text-base py-3"
                            >
                              Agente
                            </SelectItem>
                            <SelectItem
                              value="admin"
                              className="text-base py-3"
                            >
                              Administrador
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    {/* Botões de Ação */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.8 }}
                      className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          type="submit"
                          disabled={saving}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 h-14 text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
                        >
                          {saving ? (
                            <>
                              <Spinner className="w-5 h-5 mr-3" />
                              Cadastrando...
                            </>
                          ) : (
                            <>
                              <RiSaveLine className="w-5 h-5 mr-3" />
                              Cadastrar Agente
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Link href="/admin/agentes">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-gray-600 text-gray-600 hover:bg-gray-100 hover:text-gray-900 py-4 h-14 text-lg transition-all duration-300 rounded-xl"
                            disabled={saving}
                          >
                            <RiArrowLeftLine className="w-5 h-5 mr-3" />
                            Cancelar
                          </Button>
                        </Link>
                      </motion.div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Informações */}
          <div className="space-y-8">
            {/* Informações Importantes */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <RiInformationLine className="w-6 h-6 mr-3 text-navy-600" />
                    Informações Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 transition-all duration-300 hover:bg-blue-100 hover:border-blue-300">
                    <RiAddLine className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      O sistema criará uma conta automaticamente para o agente
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 transition-all duration-300 hover:bg-blue-100 hover:border-blue-300">
                    <RiIdCardLine className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      A matrícula deve conter exatamente 11 dígitos
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 transition-all duration-300 hover:bg-blue-100 hover:border-blue-300">
                    <RiShieldKeyholeLine className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      Administradores têm acesso total ao sistema
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 transition-all duration-300 hover:bg-blue-100 hover:border-blue-300">
                    <RiUserLine className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      Agentes têm acesso apenas ao seu perfil
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 transition-all duration-300 hover:bg-blue-100 hover:border-blue-300">
                    <RiImageLine className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      A foto de perfil é opcional e pode ser adicionada depois
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Preview Rápido */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl text-gray-800">
                    Preview Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Matrícula:</span>
                      <span className="font-bold font-mono text-navy-600">
                        {formData.matricula || "Não definida"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Nome:</span>
                      <span className="font-bold text-right max-w-[120px] truncate text-navy-600">
                        {formData.full_name || "Não definido"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Email:</span>
                      <span className="font-medium text-right max-w-[120px] truncate text-blue-600">
                        {formData.email || "Não definido"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Graduação:</span>
                      <Badge className="bg-blue-100 text-blue-700 text-sm py-1 px-2">
                        {formData.graduacao || "Não definida"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Tipo:</span>
                      <Badge
                        className={
                          formData.role === "admin"
                            ? "bg-purple-500 text-white text-sm py-1 px-3"
                            : "bg-blue-500 text-white text-sm py-1 px-3"
                        }
                      >
                        {formData.role === "admin" ? "ADMIN" : "AGENTE"}
                      </Badge>
                    </div>
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
