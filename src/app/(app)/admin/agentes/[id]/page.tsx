// src/app/(app)/admin/agentes/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  RiUserLine,
  RiIdCardLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiDeleteBinLine,
  RiCalendarLine,
  RiCloseLine,
  RiAlertLine,
  RiHomeLine,
  RiShieldUserLine,
  RiCalendar2Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiDashboardLine,
} from "react-icons/ri";

// IMPORT DO STORE CORRETO - SEM VERIFICAÇÃO EXTRA
import {
  useAgentEdit,
  GRADUACOES,
  TIPOS_SANGUINEOS,
} from "@/lib/stores/useAgentesStore";

// Importar diretamente para exclusão
import { deleteAgent } from "@/app/actions/admin/agents/agents";

interface AgentUpdateData {
  full_name?: string;
  graduacao?: string | null;
  tipo_sanguineo?: string | null;
  validade_certificacao?: string | null;
  avatar_url?: string | null;
  matricula?: string;
  email?: string;
  role?: "agent" | "admin";
  status?: boolean;
}

export default function EditarAgentePage() {
  const params = useParams();
  const agentId = params.id as string;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // USANDO O HOOK CORRETO - SIMPLES COMO A LISTAGEM
  const {
    agent,
    loading,
    saving,
    formData,
    hasUnsavedChanges,
    updateAgent,
    setFormData,
    setHasUnsavedChanges,
    validateForm,
  } = useAgentEdit(agentId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ status: checked });
    toast.info(
      checked
        ? "Status alterado para ATIVO - lembre-se de salvar"
        : "Status alterado para INATIVO - lembre-se de salvar",
      {
        duration: 3000,
      }
    );
  };

  const handleRoleChange = (value: "agent" | "admin") => {
    setFormData({ role: value });
    toast.info(
      value === "admin"
        ? "Tipo alterado para ADMINISTRADOR - lembre-se de salvar"
        : "Tipo alterado para AGENTE - lembre-se de salvar",
      {
        duration: 3000,
      }
    );
  };

  const handleGraduacaoChange = (value: string) => {
    setFormData({ graduacao: value });
  };

  const handleTipoSanguineoChange = (value: string) => {
    setFormData({ tipo_sanguineo: value });
  };

  const handleAvatarUrlChange = (avatarUrl: string | null) => {
    setFormData({ avatar_url: avatarUrl || "" });
  };

  const handleDateSelect = (date: Date | undefined) => {
    const dateString = date ? format(date, "yyyy-MM-dd") : "";
    setFormData({ validade_certificacao: dateString });

    if (date) {
      toast.info(
        `Data selecionada: ${format(date, "dd/MM/yyyy", { locale: ptBR })}`,
        {
          duration: 3000,
        }
      );
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Selecionar data";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const getCurrentCertStatus = () => {
    if (!formData.validade_certificacao) {
      return {
        status: "nao-informada",
        text: "Não informada",
        color: "bg-gray-500",
        icon: <RiAlertLine />,
      };
    }

    const certDate = new Date(formData.validade_certificacao);
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (isNaN(certDate.getTime())) {
      return {
        status: "invalida",
        text: "Data inválida",
        color: "bg-red-500",
        icon: <RiErrorWarningLine />,
      };
    }

    if (certDate < todayStart) {
      return {
        status: "expirada",
        text: "Expirada",
        color: "bg-red-500",
        icon: <RiErrorWarningLine />,
      };
    }

    const daysUntilExpiry = Math.ceil(
      (certDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 30) {
      return {
        status: "proximo-expiracao",
        text: `Expira em ${daysUntilExpiry} dias`,
        color: "bg-yellow-500",
        icon: <RiAlertLine />,
      };
    }

    return {
      status: "valida",
      text: "Válida",
      color: "bg-green-500",
      icon: <RiCheckLine />,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasUnsavedChanges) {
      toast.info("Nenhuma alteração foi feita para salvar");
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    try {
      const updateData: AgentUpdateData = {
        full_name: formData.full_name || "",
        graduacao: formData.graduacao || null,
        tipo_sanguineo: formData.tipo_sanguineo || null,
        validade_certificacao: formData.validade_certificacao || null,
        avatar_url: formData.avatar_url || null,
        matricula: formData.matricula || "",
        email: formData.email || "",
        role: formData.role || "agent",
        status: formData.status ?? true,
      };

      const result = await updateAgent(updateData);

      if (result.success) {
        toast.success("Alterações salvas com sucesso!");
        setHasUnsavedChanges(false);

        // Recarregar a página para mostrar dados atualizados
        window.location.reload();
      } else {
        throw new Error(result.error || "Erro ao atualizar agente");
      }
    } catch (err: unknown) {
      console.error("💥 Erro ao salvar alterações:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      toast.error("Falha ao salvar alterações", {
        description: errorMessage,
        duration: 8000,
      });
    }
  };

  const handleHardDelete = async () => {
    if (!agent) return;

    setIsDeleting(true);
    const toastId = toast.loading("Excluindo agente...");

    try {
      const result = await deleteAgent(agentId);

      if (result.success) {
        toast.success("Agente excluído!", { id: toastId });
        setDeleteDialogOpen(false);
        setTimeout(() => {
          window.location.href = "/admin/agentes";
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      console.error("Erro ao excluir:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Falha na exclusão", {
        id: toastId,
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-16">
            <Spinner className="w-8 h-8 mx-auto mb-4 text-navy-600" />
            <p className="text-gray-600">Carregando dados do agente...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentAvatarUrl = agent.avatar_url || "";
  const certStatus = getCurrentCertStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          {/* Cabeçalho */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-800 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
                  EDITAR AGENTE
                </h1>
                <p className="text-gray-600 text-lg">
                  Editando:{" "}
                  <strong className="text-navy-700">
                    {agent.full_name || "Agente"}
                  </strong>{" "}
                  • Matrícula:{" "}
                  <strong className="text-navy-700">{agent.matricula}</strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge
                  className={
                    agent.role === "admin"
                      ? "bg-purple-500 text-white text-sm py-2 px-4 rounded-full"
                      : "bg-blue-500 text-white text-sm py-2 px-4 rounded-full"
                  }
                >
                  {agent.role === "admin" ? (
                    <>
                      <RiShieldUserLine className="w-4 h-4 mr-2" /> ADMIN
                    </>
                  ) : (
                    <>
                      <RiUserLine className="w-4 h-4 mr-2" /> AGENTE
                    </>
                  )}
                </Badge>

                <Badge
                  className={
                    agent.status
                      ? "bg-green-500 text-white text-sm py-2 px-4 rounded-full"
                      : "bg-red-500 text-white text-sm py-2 px-4 rounded-full"
                  }
                >
                  {agent.status ? "✅ ATIVO" : "❌ INATIVO"}
                </Badge>
              </div>
            </div>

            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <Alert className="bg-yellow-50 border-yellow-200 rounded-xl p-5">
                  <RiAlertLine className="h-6 w-6 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-base ml-3">
                    <strong>⚠️ Você tem alterações não salvas.</strong> Clique
                    em &quot;Salvar Alterações&quot; para aplicar as mudanças.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/admin/agentes">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 h-12 px-5 rounded-xl"
              >
                <RiArrowLeftLine className="w-5 h-5 mr-2" />
                Voltar para Lista
              </Button>
            </Link>

            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 h-12 px-5 rounded-xl"
              >
                <RiDashboardLine className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-300 h-12 px-5 rounded-xl"
              >
                <RiHomeLine className="w-5 h-5 mr-2" />
                Voltar ao Site
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-gray-200 pb-6 px-8 pt-8">
                  <CardTitle className="flex items-center text-2xl text-gray-800">
                    <RiUserLine className="w-6 h-6 mr-3 text-navy-600" />
                    Editar Dados do Agente
                    {hasUnsavedChanges && (
                      <Badge
                        variant="outline"
                        className="ml-4 bg-yellow-100 text-yellow-800 border-yellow-300 text-sm py-1.5 px-4"
                      >
                        Alterações Pendentes
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Upload */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-gray-700 flex items-center mb-3">
                        <RiUserLine className="w-5 h-5 mr-2 text-navy-500" />
                        Foto do Agente
                      </Label>
                      <FileUpload
                        type="avatar"
                        onFileChange={handleAvatarUrlChange}
                        currentFile={currentAvatarUrl}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-blue-500 transition-all duration-300"
                        userId={agent.matricula}
                      />
                    </div>

                    {/* Matrícula */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="matricula"
                        className="text-base font-semibold text-gray-700 flex items-center"
                      >
                        <RiIdCardLine className="w-5 h-5 mr-2 text-navy-500" />
                        Matrícula *
                        <Badge className="ml-3 bg-purple-100 text-purple-800 text-sm py-1 px-2">
                          Única
                        </Badge>
                      </Label>
                      <div className="relative">
                        <RiIdCardLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          name="matricula"
                          value={formData.matricula || ""}
                          onChange={handleInputChange}
                          placeholder="Número da matrícula"
                          className="pl-12 text-lg py-3 h-14 font-mono border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* Nome Completo */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="full_name"
                        className="text-base font-semibold text-gray-700 flex items-center"
                      >
                        <RiUserLine className="w-5 h-5 mr-2 text-navy-500" />
                        Nome Completo *
                      </Label>
                      <div className="relative">
                        <RiUserLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          name="full_name"
                          value={formData.full_name || ""}
                          onChange={handleInputChange}
                          placeholder="Nome completo do agente"
                          className="pl-12 text-lg py-3 h-14 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="email"
                        className="text-base font-semibold text-gray-700 flex items-center"
                      >
                        <RiIdCardLine className="w-5 h-5 mr-2 text-navy-500" />
                        Email *
                      </Label>
                      <div className="relative">
                        <RiIdCardLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          placeholder="email@exemplo.com"
                          className="pl-12 text-lg py-3 h-14 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* Graduação e Tipo Sanguíneo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700">
                          Graduação
                        </Label>
                        <Select
                          value={formData.graduacao || ""}
                          onValueChange={handleGraduacaoChange}
                          disabled={saving}
                        >
                          <SelectTrigger className="h-14 text-base border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            <SelectValue placeholder="Selecione uma graduação" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADUACOES.map((graduacao) => (
                              <SelectItem
                                key={graduacao}
                                value={graduacao}
                                className="text-base py-3 hover:bg-blue-50"
                              >
                                {graduacao}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700">
                          Tipo Sanguíneo
                        </Label>
                        <Select
                          value={formData.tipo_sanguineo || ""}
                          onValueChange={handleTipoSanguineoChange}
                          disabled={saving}
                        >
                          <SelectTrigger className="h-14 text-base border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            <SelectValue placeholder="Selecione o tipo sanguíneo" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_SANGUINEOS.map((tipo) => (
                              <SelectItem
                                key={tipo}
                                value={tipo}
                                className="text-base py-3 hover:bg-blue-50"
                              >
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Validade Certificação e Tipo de Usuário */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700">
                          Validade da Certificação
                        </Label>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-14 justify-start text-left text-base border-2 rounded-xl hover:border-blue-500 px-4"
                              disabled={saving}
                            >
                              <RiCalendar2Line className="mr-3 h-5 w-5 text-navy-500" />
                              {formData.validade_certificacao ? (
                                formatDisplayDate(
                                  formData.validade_certificacao
                                )
                              ) : (
                                <span className="text-gray-400">
                                  Selecionar data
                                </span>
                              )}
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
                          <div className="flex items-center justify-between text-sm mt-3 px-1">
                            <span className="text-gray-600">
                              Selecionado:{" "}
                              {formatDisplayDate(
                                formData.validade_certificacao
                              )}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDateSelect(undefined)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3 rounded-lg"
                            >
                              Limpar
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700">
                          Tipo de Usuário
                        </Label>
                        <Select
                          value={formData.role || "agent"}
                          onValueChange={handleRoleChange}
                          disabled={saving}
                        >
                          <SelectTrigger className="h-14 text-base border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="agent"
                              className="text-base py-3 hover:bg-blue-50"
                            >
                              Agente
                            </SelectItem>
                            <SelectItem
                              value="admin"
                              className="text-base py-3 hover:bg-blue-50"
                            >
                              Administrador
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                        <Label className="text-base font-semibold text-gray-700 cursor-pointer">
                          Agente Ativo na PAC
                        </Label>
                        <Switch
                          checked={formData.status ?? true}
                          onCheckedChange={handleSwitchChange}
                          disabled={saving}
                          className="scale-110"
                        />
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-8 border-t border-gray-200 mt-8">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          type="submit"
                          disabled={saving || !hasUnsavedChanges}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 h-14 text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
                        >
                          {saving ? (
                            <>
                              <Spinner className="w-5 h-5 mr-3" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <RiSaveLine className="w-5 h-5 mr-3" />
                              {hasUnsavedChanges
                                ? "Salvar Alterações"
                                : "Nenhuma Alteração"}
                            </>
                          )}
                        </Button>

                        <Link href="/admin/agentes" className="flex-1">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-gray-600 text-gray-600 hover:bg-gray-100 hover:text-gray-900 py-4 h-14 text-lg transition-all duration-300 rounded-xl"
                            disabled={saving}
                          >
                            <RiCloseLine className="w-5 h-5 mr-3" />
                            Cancelar
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Zona de Perigo (Apenas Admin) */}
                    <div className="pt-8 border-t border-red-200 mt-10">
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <Label className="text-base font-semibold text-red-700 mb-4 flex items-center">
                          <RiAlertLine className="w-5 h-5 mr-2" />
                          ⚠️ Zona de Perigo
                        </Label>

                        <AlertDialog
                          open={deleteDialogOpen}
                          onOpenChange={setDeleteDialogOpen}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full border-red-700 text-red-700 hover:bg-red-700 hover:text-white py-3 h-12 transition-colors duration-300"
                              size="lg"
                              disabled={isDeleting}
                            >
                              <RiDeleteBinLine className="w-5 h-5 mr-2" />
                              {isDeleting
                                ? "Excluindo..."
                                : "Excluir Permanentemente"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                            <AlertDialogHeader className="pb-4">
                              <AlertDialogTitle className="text-red-600 text-2xl flex items-center">
                                <RiAlertLine className="w-6 h-6 mr-2" />
                                🚨 EXCLUSÃO PERMANENTE
                              </AlertDialogTitle>
                              <AlertDialogDescription asChild>
                                <div className="space-y-4 text-base">
                                  <div className="font-semibold text-gray-900">
                                    Tem certeza que deseja excluir
                                    permanentemente este agente?
                                  </div>
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                                    <div>
                                      <strong>Nome:</strong>{" "}
                                      {agent.full_name || "Agente sem nome"}
                                    </div>
                                    <div>
                                      <strong>Matrícula:</strong>{" "}
                                      {agent.matricula}
                                    </div>
                                    <div>
                                      <strong>Email:</strong> {agent.email}
                                    </div>
                                  </div>
                                  <div className="text-red-600 font-bold text-lg">
                                    ⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA!
                                  </div>
                                  <div className="text-gray-600 space-y-2">
                                    <div className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>
                                        O agente será removido do sistema de
                                        autenticação
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>
                                        O perfil será excluído do banco de dados
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>
                                        Todos os dados relacionados serão
                                        apagados
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>
                                        O avatar será removido do storage
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="pt-4">
                              <AlertDialogCancel
                                disabled={isDeleting}
                                className="h-11 rounded-lg"
                              >
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleHardDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white h-11 rounded-lg"
                              >
                                {isDeleting ? (
                                  <>
                                    <Spinner className="w-5 h-5 mr-2" />
                                    Excluindo...
                                  </>
                                ) : (
                                  "Sim, excluir permanentemente"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <p className="text-sm text-red-600 mt-3">
                          Esta ação não pode ser desfeita. O agente será
                          removido permanentemente do sistema.
                        </p>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Status da Certificação */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="pb-6 px-6 pt-6">
                <CardTitle className="flex items-center text-xl text-gray-800">
                  <RiCalendarLine className="w-6 h-6 mr-3 text-navy-600" />
                  Status da Certificação
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-center p-6 bg-gray-50 rounded-xl border space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Badge
                      className={`${certStatus.color} text-white text-base py-2 px-5 rounded-full`}
                    >
                      {certStatus.icon && (
                        <span className="mr-2">{certStatus.icon}</span>
                      )}
                      {certStatus.text}
                    </Badge>
                  </div>

                  {formData.validade_certificacao && (
                    <>
                      <p className="text-base text-gray-600">
                        <strong>Validade:</strong>{" "}
                        {formatDisplayDate(formData.validade_certificacao)}
                      </p>

                      {certStatus.status === "expirada" && (
                        <Alert className="bg-red-50 border-red-200 rounded-lg p-4">
                          <RiErrorWarningLine className="h-5 w-5 text-red-600" />
                          <AlertDescription className="text-red-800 text-base ml-3">
                            Certificação expirada! Renove para manter o acesso
                            ao sistema.
                          </AlertDescription>
                        </Alert>
                      )}

                      {certStatus.status === "proximo-expiracao" && (
                        <Alert className="bg-yellow-50 border-yellow-200 rounded-lg p-4">
                          <RiAlertLine className="h-5 w-5 text-yellow-600" />
                          <AlertDescription className="text-yellow-800 text-base ml-3">
                            Certificação próxima do vencimento. Renove em breve.
                          </AlertDescription>
                        </Alert>
                      )}

                      {certStatus.status === "valida" && (
                        <Alert className="bg-green-50 border-green-200 rounded-lg p-4">
                          <RiCheckLine className="h-5 w-5 text-green-600" />
                          <AlertDescription className="text-green-800 text-base ml-3">
                            Certificação válida. Tudo em ordem!
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}

                  {!formData.validade_certificacao && (
                    <Alert className="bg-gray-50 border-gray-200 rounded-lg p-4">
                      <RiAlertLine className="h-5 w-5 text-gray-600" />
                      <AlertDescription className="text-gray-800 text-base ml-3">
                        Data de validade não informada.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
