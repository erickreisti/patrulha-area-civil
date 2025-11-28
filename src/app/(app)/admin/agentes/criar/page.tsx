"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; // ✅ Adicionado Sonner
import Link from "next/link";
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaShieldAlt,
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaKey,
  FaInfo,
  FaImage,
  FaChartBar,
  FaHome,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

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

export default function CriarAgentePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "destructive" | "warning" | "default";
    title: string;
    message: string;
    show: boolean;
  }>({
    type: "default",
    title: "",
    message: "",
    show: false,
  });

  const [formData, setFormData] = useState<FormData>({
    matricula: "",
    email: "",
    full_name: "",
    graduacao: "",
    tipo_sanguineo: "",
    validade_certificacao: "",
    role: "agent",
    avatar_url: "",
  });

  // Função para mostrar alerta
  const showAlert = (
    type: "success" | "destructive" | "warning",
    title: string,
    message: string
  ) => {
    setAlert({
      type,
      title,
      message,
      show: true,
    });
  };

  // Função para fechar alerta
  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, show: false }));
  };

  // Auto-fechar alertas de sucesso após 5 segundos
  useEffect(() => {
    if (alert.show && alert.type === "success") {
      const timer = setTimeout(() => {
        closeAlert();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show, alert.type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para atualizar avatar usando FileUpload
  const handleAvatarChange = (avatarUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar_url: avatarUrl,
    }));
  };

  // Função para atualizar a data
  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      validade_certificacao: date ? date.toISOString().split("T")[0] : "",
    }));
    setDateOpen(false);
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "Selecionar data";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    closeAlert();

    try {
      // Validações
      if (!formData.matricula || !formData.email || !formData.full_name) {
        throw new Error("Matrícula, email e nome são obrigatórios");
      }

      if (!/^\d{11}$/.test(formData.matricula)) {
        throw new Error(
          "Matrícula deve conter exatamente 11 dígitos numéricos"
        );
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Email inválido");
      }

      console.log("🔄 Iniciando criação do agente...", formData);

      // ✅ Toast de loading
      const toastId = toast.loading("Cadastrando agente...");

      // Chamar a API route para criar o agente
      const response = await fetch("/api/admin/agents", {
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

      // ✅ Toast de sucesso
      toast.success("Agente criado com sucesso!", {
        id: toastId,
        description: `O agente ${formData.full_name} foi cadastrado no sistema.`,
        duration: 5000,
      });

      // Mostrar alerta de sucesso (mantido para compatibilidade)
      showAlert(
        "success",
        "Agente criado com sucesso!",
        `O agente ${formData.full_name} foi cadastrado no sistema e receberá um email para definir sua senha.`
      );

      // Limpar formulário
      setFormData({
        matricula: "",
        email: "",
        full_name: "",
        graduacao: "",
        tipo_sanguineo: "",
        validade_certificacao: "",
        role: "agent",
        avatar_url: "",
      });

      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push("/admin/agentes");
        router.refresh();
      }, 3000);
    } catch (err: unknown) {
      console.error("💥 Erro completo:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      // ✅ Toast de erro
      toast.error("Erro ao criar agente", {
        description: errorMessage,
        duration: 6000,
      });

      // Mostrar alerta de erro (mantido para compatibilidade)
      showAlert("destructive", "Erro ao criar agente", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton para quando estiver carregando
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Alertas (mantidos para compatibilidade) */}
        {alert.show && (
          <div className="mb-6 animate-fade-in">
            <Alert variant={alert.type} className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeAlert}
                className="absolute right-2 top-2 h-6 w-6 p-0"
              >
                <FaTimes className="h-3 w-3" />
              </Button>

              {alert.type === "success" && (
                <FaCheckCircle className="h-4 w-4 text-green-600" />
              )}
              {alert.type === "destructive" && (
                <FaExclamationCircle className="h-4 w-4 text-red-600" />
              )}
              {alert.type === "warning" && (
                <FaExclamationTriangle className="h-4 w-4 text-yellow-600" />
              )}

              <AlertTitle className="flex items-center gap-2">
                {alert.title}
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              CADASTRAR NOVO AGENTE
            </h1>
            <p className="text-gray-600">
              Preencha os dados para cadastrar um novo agente no sistema
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaChartBar className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-700 hover:bg-gray-100"
              >
                <FaHome className="w-4 h-4 mr-2" />
                Voltar ao Site
              </Button>
            </Link>

            <Link href="/admin/agentes">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Lista
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaUser className="w-5 h-5 mr-2 text-blue-800" />
                  Dados do Agente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Upload de Avatar usando FileUpload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Foto do Agente
                    </Label>
                    <FileUpload
                      type="avatar"
                      onFileChange={handleAvatarChange}
                      currentFile={formData.avatar_url}
                      className="p-4 border border-gray-200 rounded-lg bg-white"
                      userId={formData.matricula}
                    />
                  </div>

                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matrícula */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="matricula"
                        className="text-sm font-medium text-gray-700"
                      >
                        Matrícula *
                      </Label>
                      <div className="relative">
                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="matricula"
                          type="text"
                          name="matricula"
                          value={formData.matricula}
                          onChange={handleChange}
                          placeholder="00000000000"
                          maxLength={11}
                          required
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        11 dígitos numéricos
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email *
                      </Label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="agente@pac.org.br"
                          required
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="full_name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Nome Completo *
                    </Label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="full_name"
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Nome completo do agente"
                        required
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Graduação e Tipo Sanguíneo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Graduação - USANDO SELECT MODERNO */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="graduacao"
                        className="text-sm font-medium text-gray-700"
                      >
                        Graduação
                      </Label>
                      <Select
                        value={formData.graduacao}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, graduacao: value }))
                        }
                        disabled={loading}
                      >
                        <SelectTrigger className="w-full">
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
                    </div>

                    {/* Tipo Sanguíneo - USANDO SELECT MODERNO */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="tipo_sanguineo"
                        className="text-sm font-medium text-gray-700"
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
                        <SelectTrigger className="w-full">
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
                    </div>
                  </div>

                  {/* Validade da Certificação e Tipo de Usuário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Validade da Certificação - USANDO DATE PICKER */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Validade da Certificação
                      </Label>
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal"
                            disabled={loading}
                          >
                            {formData.validade_certificacao
                              ? formatDate(formData.validade_certificacao)
                              : "Selecionar data"}
                            <FaChevronDown className="w-4 h-4" />
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
                    </div>

                    {/* Tipo de Usuário - USANDO SELECT MODERNO */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="text-sm font-medium text-gray-700"
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent">Agente</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Cadastrando...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Cadastrar Agente
                        </>
                      )}
                    </Button>

                    <Link href="/admin/agentes" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={loading}
                      >
                        <FaArrowLeft className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informações */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <FaInfo className="w-4 h-4 mr-2 text-blue-800" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <FaPlus className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>O agente receberá um email para definir sua senha</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FaIdCard className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>A matrícula deve conter exatamente 11 dígitos</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FaShieldAlt className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p>Administradores têm acesso total ao sistema</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FaUser className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p>Agentes têm acesso apenas ao seu perfil</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FaImage className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                  <p>
                    A foto de perfil é opcional e pode ser adicionada depois
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <FaKey className="w-4 h-4 mr-2 text-blue-800" />
                  Senha Inicial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Senha padrão:</strong> pac12345
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    O agente deverá alterar esta senha no primeiro acesso
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
