"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { format, isValid } from "date-fns";
import { toast } from "sonner";

// --- IMPORTAÇÕES DO REACT DATEPICKER ---
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";

// Registra o locale
registerLocale("pt-BR", ptBR);

// Components UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  RiArrowLeftLine,
  RiSaveLine,
  RiDeleteBinLine,
  RiShieldKeyholeLine,
  RiShieldUserLine,
  RiCalendarLine,
  RiErrorWarningLine,
  RiPhoneLine,
  RiImageAddLine,
  RiUploadCloud2Line,
} from "react-icons/ri";

// Store e Constantes
import {
  useAgentEdit,
  GRADUACOES,
  UFS_BRASIL,
  TIPOS_SANGUINEOS,
  type CreateAgentInput,
} from "@/lib/stores/useAgentesStore";

// Actions
import { deleteAgent } from "@/app/actions/admin/agents/agents";
import {
  uploadAgentAvatar,
  removeAgentAvatar,
} from "@/app/actions/upload/avatar";

// ==================== TIPOS LOCAIS ====================
type AgentFormWithUnidade = Partial<CreateAgentInput> & {
  unidade?: string;
};

// Constante para Selects
const NOT_SELECTED_VALUE = "not-selected";

// ==================== FUNÇÕES UTILITÁRIAS ====================

const formatPhoneNumber = (phone: string): string => {
  const numbers = phone.replace(/\D/g, "");
  if (numbers.length === 10)
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  if (numbers.length === 11)
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  return phone;
};

const dateToString = (date: Date | undefined): string | null => {
  if (!date || !isValid(date)) return null;
  return format(date, "yyyy-MM-dd");
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ==================== COMPONENTE DATEPICKER HÍBRIDO ====================

interface CustomInputButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
}

const CustomInputButton = forwardRef<HTMLButtonElement, CustomInputButtonProps>(
  ({ onClick }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="absolute right-0 top-0 bottom-0 px-3 text-slate-400 hover:text-pac-primary transition-colors flex items-center justify-center outline-none z-10"
    >
      <RiCalendarLine className="w-5 h-5" />
    </button>
  ),
);
CustomInputButton.displayName = "CustomInputButton";

interface SmartDatePickerProps {
  date: string | null | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
}

function SmartDatePicker({ date, onSelect, disabled }: SmartDatePickerProps) {
  const [inputValue, setInputValue] = useState("");
  // Usamos um ref para rastrear a última data recebida via prop
  // Isso evita conflitos entre a digitação do usuário e a atualização via prop
  const lastDateProp = useRef(date);

  useEffect(() => {
    // Só atualiza o input se a prop 'date' mudou externamente
    if (date !== lastDateProp.current) {
      lastDateProp.current = date;
      if (date) {
        const [year, month, day] = date.split("-");
        if (year && month && day) {
          setInputValue(`${day}/${month}/${year}`);
        }
      } else {
        setInputValue("");
      }
    }
    // Se a data já estava carregada na montagem (caso da edição), inicializa o input
    if (date && inputValue === "") {
      const [year, month, day] = date.split("-");
      if (year && month && day) {
        setInputValue(`${day}/${month}/${year}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleRawChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 8) value = value.slice(0, 8);

    if (value.length >= 5) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    setInputValue(value);

    if (value.length === 10) {
      const day = parseInt(value.slice(0, 2), 10);
      const month = parseInt(value.slice(3, 5), 10) - 1;
      const year = parseInt(value.slice(6), 10);

      const parsedDate = new Date(year, month, day);

      if (
        isValid(parsedDate) &&
        parsedDate.getDate() === day &&
        parsedDate.getMonth() === month &&
        year > 1900 &&
        year < 2100
      ) {
        // Atualiza a ref para não sobrescrever o que o usuário acabou de digitar
        const newDateStr = format(parsedDate, "yyyy-MM-dd");
        lastDateProp.current = newDateStr;
        onSelect(parsedDate);
      }
    } else if (value === "") {
      onSelect(undefined);
    }
  };

  const selectedDate = date ? new Date(`${date}T12:00:00`) : null;

  return (
    <div className="relative w-full group">
      <Input
        value={inputValue}
        onChange={handleRawChange}
        disabled={disabled}
        placeholder="DD/MM/AAAA"
        className="pl-3 pr-10 h-11"
      />
      <div className="absolute top-0 right-0">
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => {
            // Atualiza a ref para evitar ciclo
            if (date) {
              lastDateProp.current = format(date, "yyyy-MM-dd");
            }
            onSelect(date || undefined);
          }}
          customInput={<CustomInputButton />}
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          disabled={disabled}
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={100}
          popperClassName="fixed-datepicker-popper"
          popperPlacement="bottom-end"
          withPortal
          portalId="root-portal"
        />
      </div>
      <style jsx global>{`
        .fixed-datepicker-popper {
          z-index: 99999 !important;
        }
        .react-datepicker {
          font-family: inherit;
          border-color: #e2e8f0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .react-datepicker__header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding-top: 0.5rem;
        }
        .react-datepicker__current-month {
          color: #1e293b;
          font-weight: 700;
          text-transform: capitalize;
        }
        .react-datepicker__day-name {
          color: #64748b;
          text-transform: uppercase;
          font-size: 0.7rem;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #1a2873 !important;
          color: white !important;
        }
        .react-datepicker__day:hover {
          background-color: #e2e8f0;
        }
        .react-datepicker__navigation {
          top: 8px;
        }
        .react-datepicker__triangle {
          display: none;
        }
      `}</style>
    </div>
  );
}

// ==================== COMPONENTE AVATAR UPLOAD ====================

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    if (fileInputRef.current && !uploading && !isLoading) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 2MB");
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    const toastId = toast.loading("Enviando imagem...");

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("matricula", matricula);
      formData.append("file", file);
      formData.append("mode", "edit");

      const interval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 90));
      }, 200);

      // Uso direto da Action importada
      const result = await uploadAgentAvatar(formData);
      clearInterval(interval);

      if (result.success && result.data?.url) {
        setUploadProgress(100);
        toast.success("Avatar atualizado!", { id: toastId });
        onAvatarChange(result.data.url);
      } else {
        const errorMsg =
          (result as { error?: string }).error || "Erro no upload";
        toast.error(errorMsg, { id: toastId });
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error("Erro ao enviar imagem", { id: toastId });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatar || uploading || isLoading) return;
    const toastId = toast.loading("Removendo imagem...");

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("avatarUrl", currentAvatar);
      formData.append("matricula", matricula);
      formData.append("mode", "edit");

      // Uso direto da Action importada
      const result = await removeAgentAvatar(formData);
      if (result.success) {
        toast.success("Avatar removido!", { id: toastId });
        onAvatarChange(null);
      } else {
        const errorMsg =
          (result as { error?: string }).error || "Erro ao remover";
        toast.error(errorMsg, { id: toastId });
      }
    } catch {
      toast.error("Erro ao remover imagem", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className={`relative w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 group cursor-pointer ${
          currentAvatar
            ? "border-pac-primary shadow-lg shadow-pac-primary/20"
            : "border-slate-200 border-dashed bg-slate-50 hover:border-pac-primary/50"
        }`}
        onClick={handleFileSelect}
      >
        {currentAvatar ? (
          <>
            <Image
              src={currentAvatar}
              alt="Avatar"
              fill
              className="object-cover"
              sizes="128px"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <RiImageAddLine className="text-white w-8 h-8" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            {uploading ? (
              <Spinner className="w-8 h-8 text-pac-primary" />
            ) : (
              <RiUploadCloud2Line className="w-8 h-8 mb-1" />
            )}
            <span className="text-[10px] font-bold uppercase">
              {uploading ? `${uploadProgress}%` : "Enviar Foto"}
            </span>
          </div>
        )}

        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
            <motion.div
              className="h-full bg-pac-primary"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isLoading || uploading}
      />

      {currentAvatar && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveAvatar}
          disabled={uploading || isLoading}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 text-xs"
        >
          <RiDeleteBinLine className="w-3.5 h-3.5 mr-1.5" /> Remover
        </Button>
      )}
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function EditarAgentePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    agent,
    loading,
    saving,
    formData,
    hasUnsavedChanges,
    updateAgent: updateAgentInStore,
    setFormData,
    setHasUnsavedChanges,
    validateForm,
  } = useAgentEdit(agentId);

  const formDataWithUnidade = formData as AgentFormWithUnidade;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Formata telefone se for o campo telefone
    const newValue = name === "telefone" ? formatPhoneNumber(value) : value;
    setFormData({ [name]: newValue });
  };

  const handleDateSelect = (date: Date | undefined, field: string) => {
    const dateStr = dateToString(date);
    setFormData({ [field]: dateStr });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((err: string) => toast.error(err));
      return;
    }

    const toastId = toast.loading("Salvando alterações...");

    const payload = {
      ...formData,
      full_name: formData.full_name ?? undefined,
      matricula: formData.matricula ?? undefined,
      email: formData.email ?? undefined,
      unidade: formDataWithUnidade.unidade ?? undefined,
    };

    try {
      const result = await updateAgentInStore(payload);
      if (result.success) {
        toast.success("Agente atualizado!", { id: toastId });
        setHasUnsavedChanges(false);
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao salvar", { id: toastId });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(msg, { id: toastId });
    }
  };

  const handleHardDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Excluindo permanentemente...");
    try {
      const result = await deleteAgent(agentId);
      if (result.success) {
        toast.success("Agente removido do sistema", { id: toastId });
        router.push("/admin/agentes");
      } else {
        toast.error((result as { error?: string }).error || "Erro ao excluir", {
          id: toastId,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(msg, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="w-12 h-12 text-pac-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-slate-500 hover:text-pac-primary"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Editar Agente
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {agent.full_name} •{" "}
                <span className="font-mono">{agent.matricula}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/agentes")}
              className="text-slate-600 hidden sm:flex"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !hasUnsavedChanges}
              className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold shadow-md shadow-pac-primary/20"
            >
              {saving ? (
                <Spinner className="w-4 h-4 mr-2" />
              ) : (
                <RiSaveLine className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="bg-amber-50 border-amber-200 text-amber-800 flex items-center">
                <RiErrorWarningLine className="w-5 h-5 mr-3" />
                <AlertDescription>
                  Você tem alterações não salvas neste formulário.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* --- DADOS PESSOAIS --- */}
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <RiUserLine className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">
                        Dados Pessoais
                      </CardTitle>
                      <CardDescription>
                        Informações básicas de identificação
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 grid gap-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        Nome Completo
                      </Label>
                      <Input
                        name="full_name"
                        value={formData.full_name || ""}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        E-mail Institucional
                      </Label>
                      <Input
                        name="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        Telefone
                      </Label>
                      <div className="relative">
                        <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          name="telefone"
                          value={formData.telefone || ""}
                          onChange={handleInputChange}
                          className="pl-10 h-11"
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        Data de Nascimento
                      </Label>
                      <SmartDatePicker
                        date={formData.data_nascimento}
                        onSelect={(date) =>
                          handleDateSelect(date, "data_nascimento")
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados Operacionais */}
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <RiShieldKeyholeLine className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">
                        Dados Operacionais
                      </CardTitle>
                      <CardDescription>
                        Informações de registro e patente
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 grid gap-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        Unidade
                      </Label>
                      <Input
                        name="unidade"
                        value={formDataWithUnidade.unidade || ""}
                        onChange={handleInputChange}
                        className="h-11"
                        placeholder="Ex: SEDE DA PAC"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        Graduação
                      </Label>
                      <Select
                        value={formData.graduacao || NOT_SELECTED_VALUE}
                        onValueChange={(v) =>
                          setFormData({
                            graduacao: v === NOT_SELECTED_VALUE ? null : v,
                          })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_SELECTED_VALUE}>
                            Não informada
                          </SelectItem>
                          {GRADUACOES.map((g: string) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        UF de Registro
                      </Label>
                      <Select
                        value={formData.uf || NOT_SELECTED_VALUE}
                        onValueChange={(v) =>
                          setFormData({
                            uf: v === NOT_SELECTED_VALUE ? null : v,
                          })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_SELECTED_VALUE}>
                            Não informada
                          </SelectItem>
                          {UFS_BRASIL.map((uf: string) => (
                            <SelectItem key={uf} value={uf}>
                              {uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* TIPO SANGUÍNEO */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        Tipo Sanguíneo
                      </Label>
                      <Select
                        value={formData.tipo_sanguineo || NOT_SELECTED_VALUE}
                        onValueChange={(v) =>
                          setFormData({
                            tipo_sanguineo: v === NOT_SELECTED_VALUE ? null : v,
                          })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_SELECTED_VALUE}>
                            Não informado
                          </SelectItem>
                          {TIPOS_SANGUINEOS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        Validade Certificação
                      </Label>
                      <SmartDatePicker
                        date={formData.validade_certificacao}
                        onSelect={(date) =>
                          handleDateSelect(date, "validade_certificacao")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">
                        Nível de Acesso
                      </Label>
                      <Select
                        value={formData.role || "agent"}
                        onValueChange={(v: "admin" | "agent") =>
                          setFormData({ role: v })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent">Agente (Padrão)</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Zona de Perigo */}
              <Card className="border-red-100 bg-red-50/30">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-red-800 font-bold text-sm uppercase tracking-wider">
                      Excluir Agente
                    </h3>
                    <p className="text-xs text-red-600">
                      Esta ação é irreversível e remove todos os dados do
                      servidor.
                    </p>
                  </div>
                  <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="font-bold">
                        <RiDeleteBinLine className="mr-2" /> Excluir Registro
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-black uppercase">
                          Confirmar Exclusão?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O perfil do agente e
                          sua foto serão removidos permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={isDeleting}
                          className="rounded-xl"
                        >
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleHardDelete}
                          disabled={isDeleting}
                          className="bg-red-600 rounded-xl font-bold"
                        >
                          {isDeleting ? "Excluindo..." : "Sim, Confirmar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {/* Foto e Status Card */}
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-6 pt-8 flex flex-col items-center">
                  <AvatarUpload
                    currentAvatar={formData.avatar_url || ""}
                    onAvatarChange={(url) => setFormData({ avatar_url: url })}
                    matricula={agent.matricula}
                    userId={agent.id}
                    isLoading={saving}
                  />

                  <Separator className="my-6" />

                  <div className="w-full flex items-center justify-between">
                    <div className="flex flex-col">
                      <Label className="font-bold text-slate-700">
                        Status Ativo
                      </Label>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        {formData.status
                          ? "Agente em Serviço"
                          : "Agente Inativo"}
                      </span>
                    </div>
                    <Switch
                      checked={formData.status ?? true}
                      onCheckedChange={(v) => setFormData({ status: v })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Resumo Dinâmico */}
              <Card className="bg-pac-primary-light text-white border-0 overflow-hidden relative shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <RiShieldUserLine size={120} />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-slate-200 font-black">
                    Ficha Operacional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-slate-200 font-bold">
                      Identificação
                    </span>
                    <span className="font-bold text-lg leading-tight uppercase text-slate-300 italic truncate">
                      {formData.full_name || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-slate-200 font-bold">
                      Matrícula
                    </span>
                    <span className="font-mono text-xl tracking-wider text-slate-300">
                      {formData.matricula}
                    </span>
                  </div>
                  <div className="pt-2">
                    <div
                      className={`w-fit px-3 py-1 rounded-md text-[10px] font-black uppercase ${formData.role === "admin" ? "bg-purple-500" : "bg-pac-primary-muted"} text-white`}
                    >
                      {formData.role === "admin"
                        ? "Administrador"
                        : "Agente PAC"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
