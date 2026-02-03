"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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

// Icons
import {
  RiUserLine,
  RiIdCardLine,
  RiMailLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiImageLine,
  RiHomeLine,
  RiArrowDownSLine,
  RiDashboardLine,
  RiAlertLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiCalendar2Line,
  RiShieldKeyholeLine,
  RiShieldUserLine,
  RiUploadLine,
  RiPhoneLine,
  RiCalendarEventLine,
  RiMapPinLine,
} from "react-icons/ri";

// Store CORRETO
import { useAgentEdit } from "@/lib/stores/useAgentesStore";

// Actions
import { deleteAgent } from "@/app/actions/admin/agents/agents";

// ==================== CONSTANTES ====================

// Lista de graduações
const GRADUACOES = [
  "Soldado",
  "Cabo",
  "3º Sargento",
  "2º Sargento",
  "1º Sargento",
  "Subtenente",
  "Cadete",
  "Aspirante",
  "2º Tenente",
  "1º Tenente",
  "Capitão",
  "Major",
  "Tenente-Coronel",
  "Coronel",
  "General de Brigada",
  "General de Divisão",
  "General de Exército",
];

// Tipos sanguíneos
const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// UFs do Brasil
const UFS_BRASIL = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// ==================== FUNÇÕES UTILITÁRIAS ====================

const formatDateLocal = (dateString?: string | null): string => {
  if (!dateString) return "Não informada";
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "Data inválida";
  }
};

// ==================== ANIMAÇÕES ====================

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

// ==================== COMPONENTE AVATAR UPLOAD CORRIGIDO ====================

function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  matricula,
  isLoading,
  userId,
}: {
  currentAvatar?: string;
  onAvatarChange: (url: string | null) => void;
  matricula: string;
  isLoading: boolean;
  userId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    if (fileInputRef.current && !uploading && !isLoading) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 2MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.");
      return;
    }

    setUploading(true);
    setProgress(10);

    const toastId = toast.loading("Enviando imagem...", {
      description: "Upload em andamento",
    });

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { uploadAgentAvatar } = await import("@/app/actions/upload/avatar");

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("matricula", matricula);
      formData.append("file", file);
      formData.append("mode", "edit"); // ✅ IMPORTANTE: Modo edição

      const result = await uploadAgentAvatar(formData);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.data?.url) {
        toast.success("✅ Avatar atualizado com sucesso!", {
          id: toastId,
          description: "A imagem foi enviada e salva com sucesso.",
          duration: 4000,
        });

        onAvatarChange(result.data.url);

        // Delay para mostrar progresso completo
        setTimeout(() => setProgress(0), 500);
      } else {
        toast.error(`❌ ${result.error || "Erro no upload"}`, {
          id: toastId,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("❌ Erro ao enviar imagem", {
        id: toastId,
        description: error instanceof Error ? error.message : "Tente novamente",
        duration: 5000,
      });
    } finally {
      setUploading(false);
      setProgress(0);

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatar || uploading || isLoading) return;

    const toastId = toast.loading("Removendo imagem...");

    try {
      const { removeAgentAvatar } = await import("@/app/actions/upload/avatar");

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("avatarUrl", currentAvatar);
      formData.append("matricula", matricula);
      formData.append("mode", "edit"); // ✅ IMPORTANTE: Modo edição

      const result = await removeAgentAvatar(formData);

      if (result.success) {
        toast.success("✅ Avatar removido com sucesso!", { id: toastId });
        onAvatarChange(null);
      } else {
        toast.error(`❌ ${result.error || "Erro ao remover"}`, { id: toastId });
      }
    } catch (error) {
      console.error("Erro ao remover:", error);
      toast.error("❌ Erro ao remover imagem", { id: toastId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold text-gray-700 flex items-center">
          <RiImageLine className="w-5 h-5 mr-2 text-navy-500" />
          Foto do Agente
        </Label>
        {currentAvatar && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={uploading || isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <RiDeleteBinLine className="w-4 h-4 mr-1" />
            Remover
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
        disabled={uploading || isLoading}
      />

      <div
        className={`relative p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${
          uploading || isLoading
            ? "border-gray-300 bg-gray-50"
            : currentAvatar
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 bg-white"
        }`}
        onClick={handleFileSelect}
      >
        {uploading ? (
          <div className="text-center space-y-3">
            <Spinner className="w-8 h-8 mx-auto text-navy-600" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Enviando imagem...</p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500">{progress}%</p>
            </div>
          </div>
        ) : currentAvatar ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={currentAvatar}
                alt="Avatar do agente"
                fill
                className="object-cover"
                sizes="96px"
                onError={(e) => {
                  console.error("Erro ao carregar imagem:", currentAvatar);
                  const target = e.target as HTMLImageElement;
                  target.src = "/default-avatar.png";
                }}
              />
            </div>
            <p className="text-sm text-gray-600">Clique para alterar a foto</p>
            <p className="text-xs text-gray-500">
              Suporta JPG, PNG, WebP, GIF (até 2MB)
            </p>
          </div>
        ) : (
          <div className="text-center space-y-3 cursor-pointer">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600">
              <RiUploadLine className="w-8 h-8" />
            </div>
            <div>
              <p className="font-medium text-gray-700">
                Clique para fazer upload
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ou arraste uma imagem aqui
              </p>
            </div>
            <div className="text-xs text-gray-400">
              <p>Formatos: JPG, PNG, WebP, GIF</p>
              <p>Tamanho máximo: 2MB</p>
            </div>
          </div>
        )}
      </div>

      {currentAvatar && !uploading && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Imagem salva no Supabase Storage
          </p>
        </div>
      )}
    </div>
  );
}

// ==================== VALIDAÇÕES ====================

const validateMatricula = (
  matricula: string,
): { valid: boolean; error?: string } => {
  if (!matricula) return { valid: false, error: "Matrícula é obrigatória" };
  if (matricula.length !== 11)
    return { valid: false, error: "Matrícula deve ter 11 dígitos" };
  if (!/^\d+$/.test(matricula))
    return { valid: false, error: "Apenas números são permitidos" };
  return { valid: true };
};

const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) return { valid: false, error: "Email é obrigatório" };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { valid: false, error: "Email inválido" };
  return { valid: true };
};

const validateFullName = (name: string): { valid: boolean; error?: string } => {
  if (!name) return { valid: false, error: "Nome completo é obrigatório" };
  if (name.length < 2)
    return { valid: false, error: "Nome deve ter pelo menos 2 caracteres" };
  if (name.length > 100) return { valid: false, error: "Nome muito longo" };
  return { valid: true };
};

const validateTelefone = (
  telefone: string,
): { valid: boolean; error?: string } => {
  if (!telefone) return { valid: true }; // Opcional
  const cleaned = telefone.replace(/\D/g, "");
  if (cleaned.length < 10 || cleaned.length > 11)
    return { valid: false, error: "Telefone deve ter 10 ou 11 dígitos" };
  return { valid: true };
};

const validateUF = (uf: string): { valid: boolean; error?: string } => {
  if (!uf) return { valid: true }; // Opcional
  const ufRegex = /^[A-Z]{2}$/;
  if (!ufRegex.test(uf.toUpperCase()))
    return { valid: false, error: "UF deve ter 2 letras maiúsculas (ex: SP)" };
  return { valid: true };
};

// ==================== COMPONENTE PRINCIPAL CORRIGIDO ====================

export default function EditarAgentePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [nascimentoOpen, setNascimentoOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // USANDO O HOOK DO STORE
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

  // Configurar beforeunload para prevenir navegação durante operações
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "Você tem alterações não salvas. Tem certeza que deseja sair?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Limpar erros quando o usuário começa a digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(fieldErrors).length > 0) {
        setFieldErrors({});
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [fieldErrors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Validação em tempo real
    let validation;
    switch (name) {
      case "matricula":
        validation = validateMatricula(value);
        break;
      case "email":
        validation = validateEmail(value);
        break;
      case "full_name":
        validation = validateFullName(value);
        break;
      case "telefone":
        validation = validateTelefone(value);
        break;
      case "uf":
        validation = validateUF(value);
        break;
      default:
        return;
    }

    if (!validation.valid && validation.error) {
      setFieldErrors((prev) => ({ ...prev, [name]: validation.error! }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ status: checked });
    toast.info(
      checked
        ? "Status alterado para ATIVO - lembre-se de salvar"
        : "Status alterado para INATIVO - lembre-se de salvar",
      {
        duration: 3000,
      },
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
      },
    );
  };

  const handleGraduacaoChange = (value: string) => {
    setFormData({ graduacao: value === "not_informed" ? null : value });
  };

  const handleTipoSanguineoChange = (value: string) => {
    setFormData({ tipo_sanguineo: value === "not_informed" ? null : value });
  };

  const handleUFChange = (value: string) => {
    setFormData({ uf: value === "not_informed" ? null : value.toUpperCase() });
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    setFormData({ avatar_url: avatarUrl });
  };

  const handleDateSelect = (date: Date | undefined, field: string) => {
    const dateString = date ? format(date, "yyyy-MM-dd") : "";
    setFormData({ [field]: dateString || null });

    if (field === "validade_certificacao") setCertOpen(false);
    if (field === "data_nascimento") setNascimentoOpen(false);
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
    today.setHours(0, 0, 0, 0);

    if (isNaN(certDate.getTime())) {
      return {
        status: "invalida",
        text: "Data inválida",
        color: "bg-red-500",
        icon: <RiErrorWarningLine />,
      };
    }

    if (certDate < today) {
      return {
        status: "expirada",
        text: "Expirada",
        color: "bg-red-500",
        icon: <RiErrorWarningLine />,
      };
    }

    const daysUntilExpiry = Math.ceil(
      (certDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
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

    // Validações em tempo real antes de enviar
    const validations = [
      {
        field: "matricula",
        value: formData.matricula || "",
        validator: validateMatricula,
      },
      { field: "email", value: formData.email || "", validator: validateEmail },
      {
        field: "full_name",
        value: formData.full_name || "",
        validator: validateFullName,
      },
      {
        field: "telefone",
        value: formData.telefone || "",
        validator: validateTelefone,
      },
      {
        field: "uf",
        value: formData.uf || "",
        validator: validateUF,
      },
    ];

    const newErrors: Record<string, string> = {};
    validations.forEach(({ field, value, validator }) => {
      const validation = validator(value);
      if (!validation.valid && validation.error) {
        newErrors[field] = validation.error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      Object.values(newErrors).forEach((error) => toast.error(error));
      return;
    }

    // Validações do formulário do store
    const storeValidationErrors = validateForm();
    if (storeValidationErrors.length > 0) {
      storeValidationErrors.forEach((error) => toast.error(error));
      return;
    }

    setSubmitStatus("loading");
    const toastId = toast.loading(
      `Atualizando agente ${formData.full_name}...`,
      {
        description: "Salvando alterações no sistema",
      },
    );

    try {
      // Preparar dados para envio
      const updateData = {
        full_name: formData.full_name || "",
        matricula: formData.matricula || "",
        email: formData.email || "",
        role: formData.role || "agent",
        status: formData.status ?? true,
        graduacao: formData.graduacao || null,
        tipo_sanguineo: formData.tipo_sanguineo || null,
        validade_certificacao: formData.validade_certificacao || null,
        avatar_url: formData.avatar_url || null,
        uf: formData.uf || null,
        data_nascimento: formData.data_nascimento || null,
        telefone: formData.telefone || null,
      };

      console.log("📤 Enviando dados de atualização:", {
        ...updateData,
        avatar_url: updateData.avatar_url ? "✅ Com avatar" : "❌ Sem avatar",
      });

      const result = await updateAgent(updateData);

      if (result.success) {
        setSubmitStatus("success");
        toast.success("✅ Agente atualizado com sucesso!", {
          id: toastId,
          description: `O agente ${formData.full_name} foi atualizado no sistema.`,
          duration: 5000,
          action: {
            label: "Ver Lista",
            onClick: () => {
              router.push("/admin/agentes");
              router.refresh();
            },
          },
        });

        setHasUnsavedChanges(false);
        setFieldErrors({});

        // Recarregar a página após 2 segundos
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        throw new Error(result.error || "Erro ao atualizar agente");
      }
    } catch (err: unknown) {
      setSubmitStatus("error");
      console.error("💥 Erro completo:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao atualizar agente";

      toast.error("❌ Falha ao atualizar agente", {
        id: toastId,
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setSubmitStatus("idle");
    }
  };

  const handleHardDelete = async () => {
    if (!agent) return;

    setIsDeleting(true);
    const toastId = toast.loading("Excluindo agente...");

    try {
      const result = await deleteAgent(agentId);

      if (result.success) {
        toast.success("✅ Agente excluído permanentemente!", { id: toastId });
        setDeleteDialogOpen(false);
        setTimeout(() => {
          router.push("/admin/agentes");
          router.refresh();
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      console.error("Erro ao excluir:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("❌ Falha na exclusão", {
        id: toastId,
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Determinar se está carregando/salvando
  const isLoading = loading || saving || submitStatus === "loading";

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
      icon: RiDashboardLine,
      label: "Dashboard",
      className:
        "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
  ];

  // Loading durante carregamento
  if (loading || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-16">
            <Spinner className="w-8 h-8 mx-auto mb-4 text-navy-600 animate-spin" />
            <p className="text-gray-600">Carregando dados do agente...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentAvatarUrl = formData.avatar_url || "";
  const certStatus = getCurrentCertStatus();

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
          {/* Título e Status */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-800 mb-3 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
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

            {/* Status da operação */}
            {submitStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="bg-green-50 border-green-200 rounded-xl p-4">
                  <RiCheckLine className="h-5 w-5 text-green-600" />
                  <AlertDescription className="ml-3 text-green-800">
                    <strong>✅ Agente atualizado com sucesso!</strong>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {submitStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="bg-red-50 border-red-200 rounded-xl p-4">
                  <RiErrorWarningLine className="h-5 w-5 text-red-600" />
                  <AlertDescription className="ml-3 text-red-800">
                    <strong>❌ Erro ao atualizar agente.</strong> Tente
                    novamente ou verifique os dados.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

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
                    disabled={isLoading}
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
                    {hasUnsavedChanges && (
                      <Badge
                        variant="outline"
                        className="ml-3 bg-yellow-100 text-yellow-800 border-yellow-300 text-sm py-1 px-3"
                      >
                        Alterações Pendentes
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Upload de Avatar */}
                    <motion.div variants={fadeInUp}>
                      <AvatarUpload
                        currentAvatar={currentAvatarUrl}
                        onAvatarChange={handleAvatarChange}
                        matricula={agent.matricula}
                        isLoading={isLoading}
                        userId={agent.id}
                      />
                    </motion.div>

                    {/* Seção 1: Dados Básicos */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-navy-700 border-b pb-2">
                        Dados Básicos
                      </h3>

                      {/* Matrícula */}
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
                        <div className="relative">
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
                            className={`pl-12 text-lg py-3 h-14 transition-all duration-300 focus:ring-3 border-2 rounded-xl ${
                              fieldErrors.matricula
                                ? "border-red-500 focus:ring-red-200"
                                : "focus:ring-blue-500 border-gray-300"
                            }`}
                            disabled={isLoading}
                          />
                          {fieldErrors.matricula && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            >
                              <RiAlertLine className="w-3 h-3" />
                              {fieldErrors.matricula}
                            </motion.p>
                          )}
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
                            className={`pl-12 text-lg py-3 h-14 transition-all duration-300 focus:ring-3 border-2 rounded-xl ${
                              fieldErrors.full_name
                                ? "border-red-500 focus:ring-red-200"
                                : "focus:ring-blue-500 border-gray-300"
                            }`}
                            disabled={isLoading}
                          />
                          {fieldErrors.full_name && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            >
                              <RiAlertLine className="w-3 h-3" />
                              {fieldErrors.full_name}
                            </motion.p>
                          )}
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
                            className={`pl-12 text-lg py-3 h-14 transition-all duration-300 focus:ring-3 border-2 rounded-xl ${
                              fieldErrors.email
                                ? "border-red-500 focus:ring-red-200"
                                : "focus:ring-blue-500 border-gray-300"
                            }`}
                            disabled={isLoading}
                          />
                          {fieldErrors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 flex items-center gap-1"
                            >
                              <RiAlertLine className="w-3 h-3" />
                              {fieldErrors.email}
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    </div>

                    {/* Seção 2: Dados Adicionais (NOVOS CAMPOS) */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-navy-700 border-b pb-2">
                        Dados Adicionais
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* UF */}
                        <motion.div
                          variants={fadeInUp}
                          transition={{ delay: 0.4 }}
                          className="space-y-3"
                        >
                          <Label
                            htmlFor="uf"
                            className="text-base font-semibold text-gray-700 flex items-center"
                          >
                            <RiMapPinLine className="w-5 h-5 mr-2 text-navy-500" />
                            UF
                          </Label>
                          <Select
                            value={formData.uf || "not_informed"}
                            onValueChange={handleUFChange}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                              <SelectValue placeholder="Selecione a UF" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_informed">
                                Não informado
                              </SelectItem>
                              {UFS_BRASIL.map((uf) => (
                                <SelectItem key={uf} value={uf}>
                                  {uf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldErrors.uf && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1"
                            >
                              {fieldErrors.uf}
                            </motion.p>
                          )}
                        </motion.div>

                        {/* Telefone */}
                        <motion.div
                          variants={fadeInUp}
                          transition={{ delay: 0.5 }}
                          className="space-y-3"
                        >
                          <Label
                            htmlFor="telefone"
                            className="text-base font-semibold text-gray-700 flex items-center"
                          >
                            <RiPhoneLine className="w-5 h-5 mr-2 text-navy-500" />
                            Telefone
                          </Label>
                          <div className="relative">
                            <RiPhoneLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-300" />
                            <Input
                              id="telefone"
                              type="tel"
                              name="telefone"
                              value={formData.telefone || ""}
                              onChange={handleInputChange}
                              placeholder="(00) 00000-0000"
                              className={`pl-12 text-lg py-3 h-14 transition-all duration-300 focus:ring-3 border-2 rounded-xl ${
                                fieldErrors.telefone
                                  ? "border-red-500 focus:ring-red-200"
                                  : "focus:ring-blue-500 border-gray-300"
                              }`}
                              disabled={isLoading}
                            />
                            {fieldErrors.telefone && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-1"
                              >
                                {fieldErrors.telefone}
                              </motion.p>
                            )}
                          </div>
                        </motion.div>

                        {/* Data de Nascimento */}
                        <motion.div
                          variants={fadeInUp}
                          transition={{ delay: 0.6 }}
                          className="space-y-3"
                        >
                          <Label className="text-base font-semibold text-gray-700 flex items-center">
                            <RiCalendarEventLine className="w-5 h-5 mr-2 text-navy-500" />
                            Data de Nascimento
                          </Label>
                          <Popover
                            open={nascimentoOpen}
                            onOpenChange={setNascimentoOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-14 justify-between text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500 px-4"
                                disabled={isLoading}
                                type="button"
                              >
                                <div className="flex items-center">
                                  <RiCalendarEventLine className="w-5 h-5 mr-3 text-navy-500" />
                                  {formData.data_nascimento
                                    ? formatDateLocal(formData.data_nascimento)
                                    : "Selecionar data"}
                                </div>
                                <RiArrowDownSLine className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  formData.data_nascimento
                                    ? new Date(formData.data_nascimento)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  handleDateSelect(date, "data_nascimento")
                                }
                                initialFocus
                                locale={ptBR}
                                className="rounded-xl border shadow-2xl"
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          {formData.data_nascimento && (
                            <div className="flex items-center justify-between text-sm mt-2 px-1">
                              <span className="text-gray-600">
                                Selecionado:{" "}
                                {formatDateLocal(formData.data_nascimento)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDateSelect(undefined, "data_nascimento")
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-3 rounded-lg"
                                disabled={isLoading}
                              >
                                Limpar
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    {/* Seção 3: Dados Militares */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-navy-700 border-b pb-2">
                        Dados Militares
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Graduação */}
                        <motion.div
                          variants={fadeInUp}
                          transition={{ delay: 0.7 }}
                          className="space-y-3"
                        >
                          <Label
                            htmlFor="graduacao"
                            className="text-base font-semibold text-gray-700"
                          >
                            Graduação
                          </Label>
                          <Select
                            value={formData.graduacao || "not_informed"}
                            onValueChange={handleGraduacaoChange}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                              <SelectValue placeholder="Selecione uma graduação" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_informed">
                                Não informado
                              </SelectItem>
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
                          transition={{ delay: 0.8 }}
                          className="space-y-3"
                        >
                          <Label
                            htmlFor="tipo_sanguineo"
                            className="text-base font-semibold text-gray-700"
                          >
                            Tipo Sanguíneo
                          </Label>
                          <Select
                            value={formData.tipo_sanguineo || "not_informed"}
                            onValueChange={handleTipoSanguineoChange}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                              <SelectValue placeholder="Selecione o tipo sanguíneo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_informed">
                                Não informado
                              </SelectItem>
                              {TIPOS_SANGUINEOS.map((tipo) => (
                                <SelectItem key={tipo} value={tipo}>
                                  {tipo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>
                      </div>
                    </div>

                    {/* Seção 4: Sistema e Validade */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-navy-700 border-b pb-2">
                        Sistema e Validade
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Validade da Certificação */}
                        <motion.div
                          variants={fadeInUp}
                          transition={{ delay: 0.9 }}
                          className="space-y-3"
                        >
                          <Label className="text-base font-semibold text-gray-700">
                            Validade da Certificação
                          </Label>
                          <Popover open={certOpen} onOpenChange={setCertOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-14 justify-between text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500 px-4"
                                disabled={isLoading}
                                type="button"
                              >
                                <div className="flex items-center">
                                  <RiCalendar2Line className="w-5 h-5 mr-3 text-navy-500" />
                                  {formData.validade_certificacao
                                    ? formatDateLocal(
                                        formData.validade_certificacao,
                                      )
                                    : "Selecionar data"}
                                </div>
                                <RiArrowDownSLine className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  formData.validade_certificacao
                                    ? new Date(formData.validade_certificacao)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  handleDateSelect(
                                    date,
                                    "validade_certificacao",
                                  )
                                }
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
                                {formatDateLocal(
                                  formData.validade_certificacao,
                                )}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDateSelect(
                                    undefined,
                                    "validade_certificacao",
                                  )
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-3 rounded-lg"
                                disabled={isLoading}
                              >
                                Limpar
                              </Button>
                            </div>
                          )}
                        </motion.div>

                        {/* Tipo de Usuário */}
                        <motion.div
                          variants={fadeInUp}
                          transition={{ delay: 1.0 }}
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
                              handleRoleChange(value)
                            }
                            disabled={isLoading}
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

                      {/* Status do Agente */}
                      <motion.div
                        variants={fadeInUp}
                        transition={{ delay: 1.1 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                          <div>
                            <Label
                              htmlFor="status"
                              className="text-base font-semibold text-gray-700 cursor-pointer"
                            >
                              Agente Ativo na PAC
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Desative para tornar o agente inativo no sistema
                            </p>
                          </div>
                          <Switch
                            checked={formData.status ?? true}
                            onCheckedChange={handleSwitchChange}
                            disabled={isLoading}
                            className="scale-110"
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Botões de Ação */}
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 1.2 }}
                      className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          type="submit"
                          disabled={isLoading || !hasUnsavedChanges}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 h-14 text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
                        >
                          {isLoading ? (
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
                            disabled={isLoading}
                          >
                            <RiArrowLeftLine className="w-5 h-5 mr-3" />
                            Cancelar
                          </Button>
                        </Link>
                      </motion.div>
                    </motion.div>

                    {/* Zona de Perigo */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.3 }}
                      className="pt-8 border-t border-red-200 mt-10"
                    >
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
                                      {formData.full_name || "Agente sem nome"}
                                    </div>
                                    <div>
                                      <strong>Matrícula:</strong>{" "}
                                      {formData.matricula}
                                    </div>
                                    <div>
                                      <strong>Email:</strong> {formData.email}
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
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Informações */}
          <div className="space-y-8">
            {/* Status da Certificação */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <RiCalendar2Line className="w-6 h-6 mr-3 text-navy-600" />
                    Status da Certificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          {formatDateLocal(formData.validade_certificacao)}
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
                              Certificação próxima do vencimento. Renove em
                              breve.
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
            </motion.div>

            {/* Preview Rápido */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
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
                      <span className="font-medium">UF:</span>
                      <Badge className="bg-blue-100 text-blue-700 text-sm py-1 px-2">
                        {formData.uf || "Não informado"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Telefone:</span>
                      <span className="font-medium text-blue-600">
                        {formData.telefone || "Não informado"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Data Nasc.:</span>
                      <span className="font-medium">
                        {formData.data_nascimento
                          ? formatDateLocal(formData.data_nascimento)
                          : "Não informada"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Graduação:</span>
                      <Badge className="bg-blue-100 text-blue-700 text-sm py-1 px-2">
                        {formData.graduacao || "Não definida"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Status:</span>
                      <Badge
                        className={
                          formData.status
                            ? "bg-green-500 text-white text-sm py-1 px-3"
                            : "bg-red-500 text-white text-sm py-1 px-3"
                        }
                      >
                        {formData.status ? "ATIVO" : "INATIVO"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

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
                    <RiUserLine className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      As alterações serão aplicadas imediatamente após salvar
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 transition-all duration-300 hover:bg-blue-100 hover:border-blue-300">
                    <RiIdCardLine className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      A matrícula deve conter exatamente 11 dígitos
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 transition-all duration-300 hover:bg-blue-100 hover:border-blue-300">
                    <RiMapPinLine className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      UF deve ser o estado de origem (ex: SP, RJ, MG)
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 transition-all duration-300 hover:bg-blue-100 hover:border-blue-300">
                    <RiShieldKeyholeLine className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      Administradores têm acesso total ao sistema
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 transition-all duration-300 hover:bg-blue-100 hover:border-blue-300">
                    <RiImageLine className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      A foto de perfil é opcional (max 2MB)
                    </p>
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
