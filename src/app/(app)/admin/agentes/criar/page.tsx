// src/app/(app)/admin/agentes/criar/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
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

// Icons
import {
  RiUserLine,
  RiIdCardLine,
  RiMailLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiAddLine,
  RiInformationLine,
  RiImageLine,
  RiHomeLine,
  RiArrowDownSLine,
  RiDashboardLine,
  RiAlertLine,
  RiCalendar2Line,
  RiUploadLine,
  RiDeleteBinLine,
  RiPhoneLine,
  RiMapPinLine,
  RiCakeLine,
  RiShieldKeyholeLine,
  RiRefreshLine,
} from "react-icons/ri";

// Store
import { useAgentCreate } from "@/lib/stores/useAgentesStore";

// Actions para upload de avatar
import { uploadAgentAvatar } from "@/app/actions/upload/avatar";

// Constantes
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

const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const NOT_SELECTED_VALUE = "not-selected";

// ==================== TIPOS ====================
interface AvatarUploadState {
  file: File | null;
  previewUrl: string | null;
  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
  uploadedUrl: string | null;
}

interface AvatarData {
  url: string;
  path: string;
  fileName: string;
  isTempFile: boolean;
}

// ==================== ANIMAÇÕES ====================
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// ==================== FUNÇÕES UTILITÁRIAS ====================
const formatDateLocal = (dateString?: string | null): string => {
  if (!dateString) return "Selecionar data";
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "Data inválida";
  }
};

const formatPhoneNumber = (phone: string): string => {
  const numbers = phone.replace(/\D/g, "");
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return phone;
};

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

// ==================== COMPONENTE AVATAR UPLOAD CORRIGIDO E REFATORADO ====================
interface AvatarUploadProps {
  currentAvatar?: AvatarData | string;
  onAvatarChange: (data: AvatarData | null) => void;
  matricula: string;
  isLoading: boolean;
}

function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  matricula,
  isLoading,
}: AvatarUploadProps) {
  const [uploadState, setUploadState] = useState<AvatarUploadState>({
    file: null,
    previewUrl: null,
    uploadProgress: 0,
    isUploading: false,
    error: null,
    uploadedUrl: null,
  });

  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para limpar preview URL de forma segura
  const clearPreviewUrl = useCallback((url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, []);

  // Inicialização
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      // Limpar URL do preview quando o componente desmontar
      clearPreviewUrl(uploadState.previewUrl);
    };
  }, [uploadState.previewUrl, clearPreviewUrl]);

  // Efeito para limpar preview quando avatar for removido
  useEffect(() => {
    if (!currentAvatar && uploadState.previewUrl) {
      clearPreviewUrl(uploadState.previewUrl);
      setUploadState((prev) => ({
        ...prev,
        previewUrl: null,
        file: null,
        uploadedUrl: null,
      }));
    }
  }, [currentAvatar, uploadState.previewUrl, clearPreviewUrl]);

  // Loading state
  if (!mounted) {
    return (
      <div className="space-y-4">
        <Label className="text-base font-semibold text-gray-700 flex items-center">
          <RiImageLine className="w-5 h-5 mr-2 text-navy-500" />
          Foto do Agente
          <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
            Opcional
          </Badge>
        </Label>
        <div className="p-6 border-2 border-dashed rounded-xl border-gray-300 bg-gray-50">
          <div className="text-center space-y-3">
            <Spinner className="w-8 h-8 mx-auto text-navy-600" />
            <p className="text-sm text-gray-600">Carregando componente...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFileSelect = () => {
    if (fileInputRef.current && !uploadState.isUploading && !isLoading) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações do arquivo
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    // Validação de tamanho
    if (file.size > MAX_SIZE) {
      toast.error("Arquivo muito grande. Máximo: 2MB");
      return;
    }

    // Validação de tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF");
      return;
    }

    // Criar preview URL
    const previewUrl = URL.createObjectURL(file);

    // Limpar preview anterior se existir
    if (uploadState.previewUrl) {
      clearPreviewUrl(uploadState.previewUrl);
    }

    // Estado inicial do upload
    setUploadState({
      file,
      previewUrl,
      uploadProgress: 10,
      isUploading: true,
      error: null,
      uploadedUrl: null,
    });

    const toastId = toast.loading("Enviando imagem...");

    try {
      // ID temporário para criação
      const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      // Usar matrícula se disponível, senão usar prefixo temporário
      const uploadMatricula =
        matricula || `temp_${Date.now().toString().substring(8)}`;

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadState((prev) => {
          if (prev.uploadProgress >= 90) {
            clearInterval(progressInterval);
            return { ...prev, uploadProgress: 90 };
          }
          return { ...prev, uploadProgress: prev.uploadProgress + 10 };
        });
      }, 200);

      // FAZER UPLOAD
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", tempUserId);
      formData.append("matricula", uploadMatricula);
      formData.append("mode", "create");

      const result = await uploadAgentAvatar(formData);

      clearInterval(progressInterval);
      setUploadState((prev) => ({ ...prev, uploadProgress: 100 }));

      if (result.success && result.data) {
        toast.success("✅ Avatar carregado com sucesso!", {
          id: toastId,
          description: "Imagem será vinculada ao criar o agente",
        });

        // ✅ Passar dados COMPLETOS do avatar
        const avatarData: AvatarData = {
          url: result.data!.url,
          path: result.data!.path,
          fileName: result.data!.fileName,
          isTempFile: result.data!.isTempFile || true,
        };

        // Limpar preview local
        clearPreviewUrl(previewUrl);

        // Atualizar estado
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          uploadedUrl: result.data!.url,
          previewUrl: null, // Limpar preview pois agora temos URL do servidor
        }));

        // Notificar componente pai
        onAvatarChange(avatarData);

        // Limpar progresso após delay
        setTimeout(() => {
          setUploadState((prev) => ({ ...prev, uploadProgress: 0 }));
        }, 500);
      } else {
        throw new Error(result.error || "Erro no upload");
      }
    } catch (error) {
      console.error("❌ Erro no upload:", error);

      // Limpar preview em caso de erro
      clearPreviewUrl(previewUrl);

      toast.error("Erro ao enviar imagem", {
        id: toastId,
        description: error instanceof Error ? error.message : "Tente novamente",
      });

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: "Erro no upload",
        previewUrl: null,
      }));
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      // Limpar preview URL se existir
      if (uploadState.previewUrl) {
        clearPreviewUrl(uploadState.previewUrl);
      }

      // Determinar qual URL remover
      let avatarUrlToRemove: string | null = null;

      if (typeof currentAvatar === "object" && currentAvatar?.url) {
        avatarUrlToRemove = currentAvatar.url;
      } else if (typeof currentAvatar === "string") {
        avatarUrlToRemove = currentAvatar;
      } else if (uploadState.uploadedUrl) {
        avatarUrlToRemove = uploadState.uploadedUrl;
      }

      // Se houver URL carregada, tentar remover do servidor
      if (avatarUrlToRemove) {
        const toastId = toast.loading("Removendo imagem...");

        try {
          const { removeAgentAvatar } =
            await import("@/app/actions/upload/avatar");

          const formData = new FormData();
          formData.append("userId", "temp_placeholder");
          formData.append("avatarUrl", avatarUrlToRemove);
          formData.append("matricula", matricula || "temp_upload");
          formData.append("mode", "create");

          const result = await removeAgentAvatar(formData);

          if (result.success) {
            toast.success("✅ Imagem removida", { id: toastId });
          } else {
            toast.warning("⚠️ Imagem removida localmente", {
              id: toastId,
              description: "Não foi possível remover do servidor",
            });
          }
        } catch (serverError) {
          console.warn(
            "⚠️ Não foi possível remover avatar do servidor:",
            serverError,
          );
          toast.warning("⚠️ Imagem removida localmente", {
            description: "Erro ao remover do servidor",
          });
        }
      }

      // Limpar estado local COMPLETAMENTE
      setUploadState({
        file: null,
        previewUrl: null,
        uploadProgress: 0,
        isUploading: false,
        error: null,
        uploadedUrl: null,
      });

      // Notificar componente pai
      onAvatarChange(null);

      // Limpar input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Se não havia URL para remover do servidor, apenas mostrar mensagem
      if (!avatarUrlToRemove) {
        toast.success("Pré-visualização removida");
      }
    } catch (error) {
      console.error("❌ Erro ao remover avatar:", error);
      toast.error("Erro ao remover imagem");
    }
  };

  // Determinar qual imagem mostrar
  const displayAvatar =
    typeof currentAvatar === "string"
      ? currentAvatar
      : currentAvatar?.url || uploadState.previewUrl;

  const isUploadingOrLoading = uploadState.isUploading || isLoading;
  const hasAvatar = !!displayAvatar;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold text-gray-700 flex items-center">
          <RiImageLine className="w-5 h-5 mr-2 text-navy-500" />
          Foto do Agente
          <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
            Opcional
          </Badge>
        </Label>
        {hasAvatar && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploadingOrLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
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
        disabled={isUploadingOrLoading}
      />

      <div
        className={`relative p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${
          isUploadingOrLoading
            ? "border-gray-300 bg-gray-50 cursor-not-allowed"
            : hasAvatar
              ? "border-blue-500 bg-blue-50 cursor-pointer hover:border-blue-600"
              : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 bg-white cursor-pointer"
        }`}
        onClick={handleFileSelect}
        role="button"
        aria-label="Selecionar ou alterar foto do agente"
        tabIndex={isUploadingOrLoading ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || (e.key === " " && !isUploadingOrLoading)) {
            e.preventDefault();
            handleFileSelect();
          }
        }}
      >
        {uploadState.isUploading ? (
          <div className="text-center space-y-3">
            <Spinner className="w-8 h-8 mx-auto text-navy-600" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Enviando imagem...</p>
              <Progress value={uploadState.uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500">
                {uploadState.uploadProgress}%
              </p>
            </div>
          </div>
        ) : hasAvatar ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={displayAvatar}
                alt="Avatar do agente"
                fill
                className="object-cover"
                sizes="128px"
                priority={false}
                onError={(e) => {
                  console.error("Erro ao carregar imagem:", displayAvatar);
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/avatars/default/default-agent.webp";
                }}
              />
            </div>
            <p className="text-sm text-gray-600">Clique para alterar a foto</p>
            {typeof currentAvatar === "object" && currentAvatar?.isTempFile && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                ⏳ Temporário
              </Badge>
            )}
            {!currentAvatar && uploadState.previewUrl && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                👁️ Pré-visualização
              </Badge>
            )}
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600">
              <RiUploadLine className="w-10 h-10" />
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
              <p className="mt-1 text-blue-500">
                ⚡ Pode fazer upload antes de preencher a matrícula
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Informações e status */}
      <div className="space-y-2">
        {uploadState.error && (
          <Alert variant="destructive" className="p-3">
            <RiAlertLine className="h-4 w-4" />
            <AlertDescription className="text-sm ml-2">
              {uploadState.error}
            </AlertDescription>
          </Alert>
        )}

        {hasAvatar && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {typeof currentAvatar === "object" && currentAvatar?.isTempFile
                ? "✅ Imagem carregada (será vinculada ao criar)"
                : "✅ Imagem pronta"}
            </span>
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="text-red-600 hover:text-red-800 text-sm underline"
              disabled={isUploadingOrLoading}
            >
              Remover foto
            </button>
          </div>
        )}

        {!matricula && hasAvatar && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <RiAlertLine className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-700 ml-2">
              Preencha a matrícula para que a imagem seja salva corretamente
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL CORRIGIDO ====================
export default function CriarAgentePage() {
  const router = useRouter();
  const [dateOpen, setDateOpen] = useState(false);
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);

  // USANDO O STORE
  const {
    formData,
    saving,
    hasUnsavedChanges,
    setFormData,
    resetFormData,
    createAgent: createAgentInStore,
    validateForm,
    generateMatricula,
  } = useAgentCreate();

  // Configurar beforeunload para prevenir navegação
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "telefone") {
      const formatted = formatPhoneNumber(value);
      setFormData({ [name]: formatted });
    } else {
      setFormData({ [name]: value });
    }

    // Validação em tempo real
    if (name === "matricula") {
      const validation = validateMatricula(value);
      updateFieldError(name, validation);
    } else if (name === "email") {
      const validation = validateEmail(value);
      updateFieldError(name, validation);
    } else if (name === "full_name") {
      const validation = validateFullName(value);
      updateFieldError(name, validation);
    }
  };

  const updateFieldError = useCallback(
    (field: string, validation: { valid: boolean; error?: string }) => {
      if (!validation.valid && validation.error) {
        setFieldErrors((prev) => ({ ...prev, [field]: validation.error! }));
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [],
  );

  const handleAvatarChange = useCallback((data: AvatarData | null) => {
    setAvatarData(data);
  }, []);

  const handleDateSelect = useCallback(
    (
      date: Date | undefined,
      field: "validade_certificacao" | "data_nascimento",
    ) => {
      const dateString = date ? format(date, "yyyy-MM-dd") : "";
      setFormData({ [field]: dateString || null });

      if (field === "validade_certificacao") {
        setDateOpen(false);
      } else {
        setBirthDateOpen(false);
      }
    },
    [setFormData],
  );

  const handleRoleChange = useCallback(
    (value: "agent" | "admin") => {
      setFormData({ role: value });
      toast.info(
        value === "admin"
          ? "Tipo alterado para ADMINISTRADOR"
          : "Tipo alterado para AGENTE",
        { duration: 3000 },
      );
    },
    [setFormData],
  );

  const handleSwitchChange = useCallback(
    (checked: boolean) => {
      setFormData({ status: checked });
      toast.info(
        checked ? "Status alterado para ATIVO" : "Status alterado para INATIVO",
        { duration: 3000 },
      );
    },
    [setFormData],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
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

    // Validações do store
    const storeValidationErrors = validateForm();
    if (storeValidationErrors.length > 0) {
      storeValidationErrors.forEach((error) => toast.error(error));
      return;
    }

    const toastId = toast.loading(
      `Cadastrando agente ${formData.full_name}...`,
      {
        description: "Criando conta e configurando perfil",
      },
    );

    try {
      const agentData = {
        matricula: formData.matricula || "",
        email: formData.email || "",
        full_name: formData.full_name || "",
        role: formData.role || "agent",
        status: formData.status ?? true,
        graduacao:
          formData.graduacao === NOT_SELECTED_VALUE ? null : formData.graduacao,
        tipo_sanguineo:
          formData.tipo_sanguineo === NOT_SELECTED_VALUE
            ? null
            : formData.tipo_sanguineo,
        validade_certificacao: formData.validade_certificacao,
        avatar_url: avatarData?.url || null,
        uf: formData.uf === NOT_SELECTED_VALUE ? null : formData.uf,
        data_nascimento: formData.data_nascimento,
        telefone: formData.telefone,
      };

      console.log("📤 Enviando dados para criação:", {
        ...agentData,
        hasAvatar: !!avatarData,
        avatarUrl: avatarData?.url?.substring(0, 50) + "...",
        isTempFile: avatarData?.isTempFile,
      });

      const result = await createAgentInStore(agentData);

      if (result.success && result.data) {
        toast.success("✅ Agente criado com sucesso!", {
          id: toastId,
          description: `O agente ${formData.full_name} foi cadastrado no sistema com sucesso.`,
          duration: 5000,
        });

        // ✅ Resetar estados
        setAvatarData(null);
        resetFormData();
        setFieldErrors({});

        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push("/admin/agentes");
          router.refresh();
        }, 2000);
      } else {
        throw new Error(result.error || "Erro ao criar agente");
      }
    } catch (error) {
      console.error("Erro ao criar agente:", error);
      toast.error("❌ Falha ao criar agente", {
        id: toastId,
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        duration: 6000,
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

  const isLoading = saving;

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
                  CADASTRAR NOVO AGENTE
                </h1>
                <p className="text-gray-600 text-lg">
                  Preencha os dados para cadastrar um novo agente no sistema
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="bg-green-500 text-white text-sm py-2 px-4 rounded-full">
                  <RiAddLine className="w-4 h-4 mr-2" /> NOVO CADASTRO
                </Badge>
                {isLoading && (
                  <Badge className="bg-yellow-500 text-white text-sm py-2 px-4 rounded-full">
                    <Spinner className="w-3 h-3 mr-1" /> PROCESSANDO
                  </Badge>
                )}
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
                    em &quot;Cadastrar Agente&quot; para salvar as alterações.
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
                    <Badge
                      variant="outline"
                      className="ml-3 bg-green-100 text-green-800 border-green-300 text-sm py-1 px-3"
                    >
                      Novo Cadastro
                    </Badge>
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
                    {/* Upload de Avatar - CORRIGIDO */}
                    <motion.div variants={fadeInUp}>
                      <AvatarUpload
                        currentAvatar={avatarData || undefined}
                        onAvatarChange={handleAvatarChange}
                        matricula={formData.matricula || ""}
                        isLoading={isLoading}
                      />
                    </motion.div>

                    {/* Seção 1: Dados Básicos */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-navy-700 border-b pb-2">
                        Dados Básicos
                      </h3>

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
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              type="button"
                              onClick={generateMatricula}
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-300 h-14 px-5"
                              disabled={isLoading}
                            >
                              <RiRefreshLine className="w-5 h-5 mr-2" />
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

                    {/* Seção 2: Dados Adicionais */}
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
                            <Badge className="ml-2 bg-gray-100 text-gray-800 text-xs">
                              Opcional
                            </Badge>
                          </Label>
                          <Select
                            value={formData.uf || NOT_SELECTED_VALUE}
                            onValueChange={(value) => {
                              setFormData({
                                uf: value === NOT_SELECTED_VALUE ? null : value,
                              });
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                              <SelectValue placeholder="Selecione a UF" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NOT_SELECTED_VALUE}>
                                Não informada
                              </SelectItem>
                              {UFS_BRASIL.map((uf) => (
                                <SelectItem key={uf} value={uf}>
                                  {uf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            <Badge className="ml-2 bg-gray-100 text-gray-800 text-xs">
                              Opcional
                            </Badge>
                          </Label>
                          <div className="relative">
                            <RiPhoneLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-300" />
                            <Input
                              id="telefone"
                              type="text"
                              name="telefone"
                              value={formData.telefone || ""}
                              onChange={handleInputChange}
                              placeholder="(00) 00000-0000"
                              maxLength={15}
                              className="pl-12 text-lg py-3 h-14 transition-all duration-300 focus:ring-3 focus:ring-blue-500 border-2 border-gray-300 rounded-xl"
                              disabled={isLoading}
                            />
                          </div>
                        </motion.div>

                        {/* Data de Nascimento */}
                        <motion.div
                          variants={fadeInUp}
                          transition={{ delay: 0.6 }}
                          className="space-y-3"
                        >
                          <Label className="text-base font-semibold text-gray-700 flex items-center">
                            <RiCakeLine className="w-5 h-5 mr-2 text-navy-500" />
                            Data de Nascimento
                            <Badge className="ml-2 bg-gray-100 text-gray-800 text-xs">
                              Opcional
                            </Badge>
                          </Label>
                          <Popover
                            open={birthDateOpen}
                            onOpenChange={setBirthDateOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-14 justify-between text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500 px-4"
                                disabled={isLoading}
                                type="button"
                              >
                                <div className="flex items-center">
                                  <RiCalendar2Line className="w-5 h-5 mr-3 text-navy-500" />
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
                                disabled={(date) => date > new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                          {formData.data_nascimento && (
                            <div className="flex items-center justify-between text-sm mt-2 px-1">
                              <span className="text-gray-600">
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
                            <Badge className="ml-2 bg-gray-100 text-gray-800 text-xs">
                              Opcional
                            </Badge>
                          </Label>
                          <Select
                            value={formData.graduacao || NOT_SELECTED_VALUE}
                            onValueChange={(value) => {
                              setFormData({
                                graduacao:
                                  value === NOT_SELECTED_VALUE ? null : value,
                              });
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                              <SelectValue placeholder="Selecione uma graduação" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NOT_SELECTED_VALUE}>
                                Não informada
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
                            <Badge className="ml-2 bg-gray-100 text-gray-800 text-xs">
                              Opcional
                            </Badge>
                          </Label>
                          <Select
                            value={
                              formData.tipo_sanguineo || NOT_SELECTED_VALUE
                            }
                            onValueChange={(value) => {
                              setFormData({
                                tipo_sanguineo:
                                  value === NOT_SELECTED_VALUE ? null : value,
                              });
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-14 text-base border-2 rounded-xl transition-all duration-300 hover:border-blue-500">
                              <SelectValue placeholder="Selecione o tipo sanguíneo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NOT_SELECTED_VALUE}>
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
                            <Badge className="ml-2 bg-gray-100 text-gray-800 text-xs">
                              Opcional
                            </Badge>
                          </Label>
                          <Popover open={dateOpen} onOpenChange={setDateOpen}>
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
                            Tipo de Usuário *
                          </Label>
                          <Select
                            value={formData.role || "agent"}
                            onValueChange={handleRoleChange}
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
                                <div className="flex items-center">
                                  <RiUserLine className="w-5 h-5 mr-2" />
                                  Agente
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="admin"
                                className="text-base py-3"
                              >
                                <div className="flex items-center">
                                  <RiShieldKeyholeLine className="w-5 h-5 mr-2" />
                                  Administrador
                                </div>
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
                      className="flex gap-4 pt-8 border-t border-gray-200 mt-8"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 h-14 text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
                        >
                          {isLoading ? (
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
                            disabled={isLoading}
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
                      A foto de perfil será carregada imediatamente ao
                      selecionar
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
                      <span className="font-medium">Telefone:</span>
                      <span className="font-medium text-right text-green-600">
                        {formData.telefone || "Não informado"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">UF:</span>
                      <Badge className="bg-blue-100 text-blue-700 text-sm py-1 px-2">
                        {formData.uf === NOT_SELECTED_VALUE || !formData.uf
                          ? "Não informada"
                          : formData.uf}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Data Nasc.:</span>
                      <span className="font-medium text-right text-purple-600">
                        {formData.data_nascimento
                          ? formatDateLocal(formData.data_nascimento)
                          : "Não informada"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Graduação:</span>
                      <Badge className="bg-blue-100 text-blue-700 text-sm py-1 px-2">
                        {formData.graduacao === NOT_SELECTED_VALUE ||
                        !formData.graduacao
                          ? "Não definida"
                          : formData.graduacao}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Avatar:</span>
                      <Badge
                        className={`${
                          avatarData ? "bg-green-500" : "bg-gray-500"
                        } text-white text-sm py-1 px-3`}
                      >
                        {avatarData ? "✅ Carregado" : "❌ Sem imagem"}
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
