"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  RiDeleteBinLine,
  RiBarChartLine,
  RiCalendarLine,
  RiCloseLine,
  RiAlertLine,
  RiArrowDownSLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";

// Constantes
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

// Interfaces
interface AgentProfile {
  id: string;
  matricula: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  graduacao: string | null;
  validade_certificacao: string | null;
  tipo_sanguineo: string | null;
  status: boolean;
  role: "admin" | "agent";
  created_at: string;
  updated_at: string;
}

interface FormData {
  full_name: string;
  email: string;
  graduacao: string;
  tipo_sanguineo: string;
  validade_certificacao: string;
  role: "admin" | "agent";
  status: boolean;
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

export default function EditarAgentePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  // Estados
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "agent">(
    "agent"
  );

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    graduacao: "",
    tipo_sanguineo: "",
    validade_certificacao: "",
    role: "agent",
    status: true,
  });

  const supabase = createClient();

  const checkCurrentUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setCurrentUserRole(profile.role);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
    }
  }, [supabase]);

  const fetchAgent = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", agentId)
        .single();

      if (error) throw error;

      setAgent(data);
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        graduacao: data.graduacao || "",
        tipo_sanguineo: data.tipo_sanguineo || "",
        validade_certificacao: data.validade_certificacao || "",
        role: data.role,
        status: data.status,
      });
    } catch (error: unknown) {
      console.error("❌ Erro ao buscar agente:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar agente: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [agentId, supabase]);

  // Efeitos
  useEffect(() => {
    checkCurrentUser();
    if (agentId) {
      fetchAgent();
    }
  }, [agentId, checkCurrentUser, fetchAgent]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.full_name.trim()) {
      errors.push("Nome completo é obrigatório");
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.push("Email válido é obrigatório");
    }

    return errors;
  };

  // Submit Principal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        validationErrors.forEach((error) => toast.error(error));
        setSaving(false);
        return;
      }

      const toastId = toast.loading("Atualizando agente...");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          graduacao: formData.graduacao || null,
          tipo_sanguineo: formData.tipo_sanguineo || null,
          validade_certificacao: formData.validade_certificacao || null,
          role: formData.role,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", agentId);

      if (error) throw error;

      toast.success("Agente atualizado com sucesso!", {
        id: toastId,
        description: `As alterações em ${formData.full_name} foram salvas.`,
        duration: 5000,
      });

      setTimeout(() => {
        router.push("/admin/agentes");
      }, 1500);
    } catch (err: unknown) {
      console.error("❌ Erro ao atualizar agente:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao atualizar agente", {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;

    if (
      !confirm(`Tem certeza que deseja desativar o agente ${agent.full_name}?`)
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: false })
        .eq("id", agentId);

      if (error) throw error;

      toast.success("Agente desativado com sucesso!");
      router.push("/admin/agentes");
    } catch (err: unknown) {
      console.error("❌ Erro ao desativar agente:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao desativar agente", {
        description: errorMessage,
      });
    }
  };

  const getCertificationStatus = () => {
    if (!formData.validade_certificacao) return "Não informada";

    const today = new Date();
    const certDate = new Date(formData.validade_certificacao);

    if (certDate < today) {
      return { status: "expirada", color: "bg-red-500", text: "Expirada" };
    }

    const diffTime = certDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return {
        status: "proximo",
        color: "bg-yellow-500",
        text: "Próximo do vencimento",
      };
    }

    return { status: "valida", color: "bg-green-500", text: "Válida" };
  };

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
  ];

  // Estados de Loading
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
            <p className="text-gray-600">Carregando dados do agente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <RiUserLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Agente Não Encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              O agente que você está tentando editar não existe ou foi removido.
            </p>
            <Link href="/admin/agentes">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                Voltar para Lista de Agentes
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const certStatus = getCertificationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
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
              EDITAR AGENTE
            </h1>
            <p className="text-gray-600">
              Editando: <strong>{agent.full_name || "Agente"}</strong>
            </p>
          </div>

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
                    Editar Dados do Agente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Upload de Avatar */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-700">
                        Foto do Agente
                        {currentUserRole !== "admin" && (
                          <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                            Somente Admin
                          </Badge>
                        )}
                      </Label>
                      <FileUpload
                        type="avatar"
                        onFileChange={handleAvatarChange}
                        currentFile={agent.avatar_url || ""}
                        className="p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-500 transition-colors duration-300"
                        userId={agent.matricula}
                      />
                    </motion.div>

                    {/* Informações Fixas - APENAS MATRÍCULA */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.1 }}
                      className="p-4 bg-blue-50 rounded-lg border border-blue-200 transition-colors duration-300 hover:bg-blue-100"
                    >
                      <div>
                        <Label className="block text-sm font-medium text-gray-500">
                          Matrícula
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <RiIdCardLine className="w-4 h-4 text-gray-400" />
                          <p className="text-lg font-mono font-bold text-gray-800">
                            {agent.matricula}
                          </p>
                        </div>
                      </div>
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
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder="Nome completo do agente"
                          className="pl-10 text-lg py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={saving}
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
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@exemplo.com"
                          className="pl-10 text-lg py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={saving}
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
                          disabled={saving}
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
                          disabled={saving}
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
                              disabled={saving}
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
                          disabled={saving}
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
                          disabled={saving}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <RiSaveLine className="w-4 h-4 mr-2" />
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
                          onClick={handleDelete}
                          variant="outline"
                          className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white py-3 transition-colors duration-300"
                        >
                          <RiDeleteBinLine className="w-4 h-4 mr-2" />
                          Desativar
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
                          >
                            <RiCloseLine className="w-4 h-4 mr-2" />
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status e Permissões */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-gray-800">
                    <RiShieldKeyholeLine className="w-4 h-4 mr-2 text-navy-600" />
                    Status e Permissões
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border transition-all duration-300 hover:bg-gray-100">
                    <Label
                      htmlFor="status"
                      className="text-sm font-semibold text-gray-700 cursor-pointer"
                    >
                      Agente Ativo
                    </Label>
                    <Switch
                      id="status"
                      checked={formData.status}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("status", checked)
                      }
                    />
                  </div>
                  {!formData.status && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 flex items-center">
                        <RiAlertLine className="w-3 h-3 mr-1" />
                        ⚠️ Agente não poderá fazer login
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Tipo de Acesso
                    </Label>
                    <div className="space-y-2">
                      {(["agent", "admin"] as const).map((role) => (
                        <label
                          key={role}
                          className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-300 hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={formData.role === role}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                role: e.target.value as "agent" | "admin",
                              }))
                            }
                            className="text-blue-600 focus:ring-blue-600"
                          />
                          <span className="text-sm capitalize">
                            {role === "agent" ? "Agente" : "Administrador"}
                          </span>
                          {role === "admin" && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs border-purple-200">
                              Acesso Total
                            </Badge>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Status da Certificação */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-gray-800">
                    <RiCalendarLine className="w-4 h-4 mr-2 text-navy-600" />
                    Status da Certificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg border transition-colors duration-300 hover:bg-gray-100">
                    {typeof certStatus === "object" ? (
                      <>
                        <Badge
                          className={`${certStatus.color} text-white text-sm mb-2`}
                        >
                          {certStatus.text}
                        </Badge>
                        <p className="text-sm text-gray-600">
                          Validade:{" "}
                          {new Date(
                            formData.validade_certificacao
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">{certStatus}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Preview Rápido */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Preview Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-3 text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>Nome:</span>
                      <span className="font-medium text-right max-w-[120px] truncate">
                        {formData.full_name || "Não definido"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Email:</span>
                      <span className="font-medium text-right max-w-[120px] truncate">
                        {formData.email || "Não definido"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Matrícula:</span>
                      <span className="font-medium font-mono">
                        {agent.matricula}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Graduação:</span>
                      <span className="font-medium text-right max-w-[120px] truncate">
                        {formData.graduacao || "Não definida"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tipo Sanguíneo:</span>
                      <span className="font-medium">
                        {formData.tipo_sanguineo || "Não informado"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <Badge
                        className={
                          formData.status
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }
                      >
                        {formData.status ? (
                          <>
                            <RiEyeLine className="w-3 h-3 mr-1" /> ATIVO
                          </>
                        ) : (
                          <>
                            <RiEyeOffLine className="w-3 h-3 mr-1" /> INATIVO
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
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
