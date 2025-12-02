"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
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
} from "react-icons/ri";

// Opções baseadas no schema
const GRADUACOES = [
  "COMODORO DE BRIGADA - PAC",
  "COMODORO - PAC",
  "VICE COMODORO - PAC",
  "CORONEL - PAC",
  "TENENTE CORONEL - PAC",
  "MAJOR - PAC",
  "CAPITÃO - PAC",
  "1° TENENTE - PAC",
  "2° TENENTE - PAC",
  "ASPIRANTE -a- OFICIAL - PAC",
  "SUBOFICIAL - PAC",
  "1° SARGENTO - PAC",
  "2° SARGENTO - PAC",
  "3° SARGENTO - PAC",
  "CABO - PAC",
  "PATRULHEIRO",
  "AGENTE - PAC",
];

const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface FormData {
  matricula: string;
  email: string;
  full_name: string;
  graduacao: string;
  tipo_sanguineo: string;
  validade_certificacao: string;
  role: "agent" | "admin";
  avatar_url?: string;
}

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
  const [loading, setLoading] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    matricula: "",
    email: "",
    full_name: "",
    graduacao: "",
    tipo_sanguineo: "",
    validade_certificacao: "",
    role: "agent",
    avatar_url: "", // Mantém string vazia
  });

  const generateMatricula = () => {
    const randomNum = Math.floor(10000000000 + Math.random() * 90000000000);
    setFormData((prev) => ({ ...prev, matricula: randomNum.toString() }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔧 CORREÇÃO: Aceitar string | null
  const handleAvatarChange = (avatarUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      avatar_url: avatarUrl || "", // Converte null para string vazia
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      validade_certificacao: date ? date.toISOString().split("T")[0] : "",
    }));
    setDateOpen(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Selecionar data";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.matricula.trim()) {
      errors.push("Matrícula é obrigatória");
    }

    if (!formData.email.trim()) {
      errors.push("Email é obrigatório");
    }

    if (!formData.full_name.trim()) {
      errors.push("Nome completo é obrigatório");
    }

    if (!/^\d{11}$/.test(formData.matricula)) {
      errors.push("Matrícula deve conter exatamente 11 dígitos numéricos");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Email inválido");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        validationErrors.forEach((error) => toast.error(error));
        setLoading(false);
        return;
      }

      console.log("🔄 Enviando dados para API...", formData);

      // Toast de loading
      const toastId = toast.loading(
        `Cadastrando agente ${formData.full_name}...`,
        {
          description: "Criando conta e configurando perfil",
        }
      );

      // Enviar dados para API
      const response = await fetch("/api/admin/agentes/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar agente");
      }

      console.log("✅ Agente criado com sucesso:", result);

      // FEEDBACK DE SUCESSO
      toast.success("✅ Agente criado com sucesso!", {
        id: toastId,
        description: `O agente ${formData.full_name} foi cadastrado no sistema com sucesso.`,
        duration: 3000,
        action: {
          label: "Ver Agentes",
          onClick: () => {
            router.push("/admin/agentes");
            router.refresh();
          },
        },
      });

      // Limpar formulário
      setFormData({
        matricula: "",
        email: "",
        full_name: "",
        graduacao: "",
        tipo_sanguineo: "",
        validade_certificacao: "",
        role: "agent",
        avatar_url: "", // Mantém string vazia
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/admin/agentes");
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      console.error("💥 Erro completo:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao criar agente";

      // Toast de erro
      toast.error("❌ Falha ao criar agente", {
        description: errorMessage,
        duration: 6000,
        icon: <RiErrorWarningLine className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setLoading(false);
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"
            />
            <p className="text-gray-600">Criando novo agente...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Título e Descrição */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
              CADASTRAR NOVO AGENTE
            </h1>
            <p className="text-gray-600">
              Preencha os dados para cadastrar um novo agente no sistema
            </p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3">
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
                    <RiUserLine className="w-5 h-5 mr-2 text-navy-600" />
                    Dados do Agente
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-100 text-green-800 border-green-300"
                    >
                      Novo Cadastro
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Upload de Avatar */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-700">
                        Foto do Agente
                      </Label>
                      <FileUpload
                        type="avatar"
                        onFileChange={handleAvatarChange} // ✅ Corrigido
                        currentFile={formData.avatar_url}
                        className="p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-500 transition-colors duration-300"
                        userId={formData.matricula || "new"}
                      />
                    </motion.div>

                    {/* Matrícula com Gerador */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label
                        htmlFor="matricula"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Matrícula *
                      </Label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <RiIdCardLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-300" />
                          <Input
                            id="matricula"
                            type="text"
                            name="matricula"
                            value={formData.matricula}
                            onChange={handleInputChange}
                            placeholder="00000000000"
                            maxLength={11}
                            required
                            className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
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
                            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-300"
                            disabled={loading}
                          >
                            <RiAddLine className="w-4 h-4 mr-2" />
                            Gerar
                          </Button>
                        </motion.div>
                      </div>
                      <p className="text-xs text-gray-500 transition-colors duration-300">
                        11 dígitos numéricos
                      </p>
                    </motion.div>

                    {/* Nome Completo */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <Label
                        htmlFor="full_name"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Nome Completo *
                      </Label>
                      <div className="relative">
                        <RiUserLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-300" />
                        <Input
                          id="full_name"
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          placeholder="Nome completo do agente"
                          required
                          className="pl-10 text-lg py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Email *
                      </Label>
                      <div className="relative">
                        <RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-300" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="agente@pac.org.br"
                          required
                          className="pl-10 text-lg py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                    </motion.div>

                    {/* Graduação e Tipo Sanguíneo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Graduação */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                      >
                        <Label
                          htmlFor="graduacao"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Graduação
                        </Label>
                        <Select
                          value={formData.graduacao}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              graduacao: value,
                            }))
                          }
                          disabled={loading}
                        >
                          <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
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
                        className="space-y-2"
                      >
                        <Label
                          htmlFor="tipo_sanguineo"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Tipo Sanguíneo
                        </Label>
                        <Select
                          value={formData.tipo_sanguineo}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              tipo_sanguineo: value,
                            }))
                          }
                          disabled={loading}
                        >
                          <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Validade da Certificação */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.6 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-semibold text-gray-700">
                          Validade da Certificação
                        </Label>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal transition-all duration-300 hover:border-blue-500"
                              disabled={loading}
                            >
                              {formData.validade_certificacao
                                ? formatDate(formData.validade_certificacao)
                                : "Selecionar data"}
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
                            />
                          </PopoverContent>
                        </Popover>
                      </motion.div>

                      {/* Tipo de Usuário */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 0.7 }}
                        className="space-y-2"
                      >
                        <Label
                          htmlFor="role"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Tipo de Usuário
                        </Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value: "agent" | "admin") =>
                            setFormData((prev) => ({ ...prev, role: value }))
                          }
                          disabled={loading}
                        >
                          <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">Agente</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    {/* Botões de Ação */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.8 }}
                      className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Spinner className="w-4 h-4 mr-2" />
                              Cadastrando...
                            </>
                          ) : (
                            <>
                              <RiSaveLine className="w-4 h-4 mr-2" />
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
                            className="w-full border-gray-600 text-gray-600 hover:bg-gray-100 hover:text-gray-900 py-3 transition-all duration-300"
                            disabled={loading}
                          >
                            <RiArrowLeftLine className="w-4 h-4 mr-2" />
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
          <div className="space-y-6">
            {/* Informações Importantes */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg text-gray-800">
                    <RiInformationLine className="w-5 h-5 mr-2 text-navy-600" />
                    Informações Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 transition-colors duration-300 hover:bg-blue-100">
                    <RiAddLine className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>
                      O sistema criará uma conta automaticamente para o agente
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 transition-colors duration-300 hover:bg-blue-100">
                    <RiIdCardLine className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p>A matrícula deve conter exatamente 11 dígitos</p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 transition-colors duration-300 hover:bg-blue-100">
                    <RiShieldKeyholeLine className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p>Administradores têm acesso total ao sistema</p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 transition-colors duration-300 hover:bg-blue-100">
                    <RiUserLine className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p>Agentes têm acesso apenas ao seu perfil</p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 transition-colors duration-300 hover:bg-blue-100">
                    <RiImageLine className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                    <p>
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
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Preview Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Matrícula:</span>
                      <span className="font-medium font-mono">
                        {formData.matricula || "Não definida"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nome:</span>
                      <span className="font-medium text-right max-w-[120px] truncate">
                        {formData.full_name || "Não definido"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium text-right max-w-[120px] truncate">
                        {formData.email || "Não definido"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Graduação:</span>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        {formData.graduacao || "Não definida"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <Badge
                        className={
                          formData.role === "admin"
                            ? "bg-purple-500 text-white"
                            : "bg-blue-500 text-white"
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
