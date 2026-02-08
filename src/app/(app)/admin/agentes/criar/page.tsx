"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
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

import {
  RiUserLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiImageAddLine,
  RiCalendarLine,
  RiDeleteBinLine,
  RiPhoneLine,
  RiShieldKeyholeLine,
  RiRefreshLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiUploadCloud2Line,
} from "react-icons/ri";

import { useAgentCreate } from "@/lib/stores/useAgentesStore";
import { uploadAgentAvatar } from "@/app/actions/upload/avatar";

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

const formatDateLocal = (dateString?: string | null): string => {
  if (!dateString) return "Selecionar data";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "Data inválida";
  }
};

const formatPhoneNumber = (phone: string): string => {
  const numbers = phone.replace(/\D/g, "");
  if (numbers.length === 10)
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  if (numbers.length === 11)
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  return phone;
};

const validateMatricula = (m: string) =>
  !m
    ? { valid: false, error: "Obrigatório" }
    : m.length !== 11
      ? { valid: false, error: "Deve ter 11 dígitos" }
      : { valid: true };
const validateEmail = (e: string) =>
  !e
    ? { valid: false, error: "Obrigatório" }
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
      ? { valid: false, error: "Inválido" }
      : { valid: true };
const validateFullName = (n: string) =>
  !n
    ? { valid: false, error: "Obrigatório" }
    : n.length < 2
      ? { valid: false, error: "Muito curto" }
      : { valid: true };

// ==================== COMPONENTE AVATAR UPLOAD CORRIGIDO ====================
function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  onUploadingChange,
  matricula,
  isLoading,
}: {
  currentAvatar?: AvatarData | string;
  onAvatarChange: (data: AvatarData | null) => void;
  onUploadingChange: (isUploading: boolean) => void;
  matricula: string;
  isLoading: boolean;
}) {
  const [uploadState, setUploadState] = useState<AvatarUploadState>({
    file: null,
    previewUrl: null,
    uploadProgress: 0,
    isUploading: false,
    error: null,
    uploadedUrl: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onUploadingChange(uploadState.isUploading);
  }, [uploadState.isUploading, onUploadingChange]);

  useEffect(() => {
    return () => {
      if (uploadState.previewUrl) URL.revokeObjectURL(uploadState.previewUrl);
    };
  }, [uploadState.previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024)
      return toast.error("Arquivo deve ter no máximo 2MB");

    const previewUrl = URL.createObjectURL(file);
    setUploadState({
      file,
      previewUrl,
      uploadProgress: 10,
      isUploading: true,
      error: null,
      uploadedUrl: null,
    });

    try {
      const tempUserId = `temp_${Date.now()}`;
      const uploadMatricula =
        matricula || `temp_${Date.now().toString().substring(8)}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", tempUserId);
      formData.append("matricula", uploadMatricula);
      formData.append("mode", "create");

      const interval = setInterval(() => {
        setUploadState((p) => ({
          ...p,
          uploadProgress: Math.min(p.uploadProgress + 10, 90),
        }));
      }, 200);

      const result = await uploadAgentAvatar(formData);
      clearInterval(interval);

      if (result.success && result.data) {
        setUploadState((p) => ({
          ...p,
          isUploading: false,
          uploadProgress: 100,
          uploadedUrl: result.data!.url,
        }));

        onAvatarChange({
          url: result.data.url ?? "",
          path: result.data.path ?? "",
          fileName: result.data.fileName ?? "",
          isTempFile: true,
        });

        toast.success("Foto carregada com sucesso");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar foto");
      setUploadState((p) => ({
        ...p,
        isUploading: false,
        error: "Falha no upload",
        previewUrl: null,
      }));
    }
  };

  const handleRemove = () => {
    setUploadState({
      file: null,
      previewUrl: null,
      uploadProgress: 0,
      isUploading: false,
      error: null,
      uploadedUrl: null,
    });
    onAvatarChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayUrl =
    uploadState.previewUrl ||
    (typeof currentAvatar === "string" ? currentAvatar : currentAvatar?.url);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 group cursor-pointer ${
          displayUrl
            ? "border-pac-primary shadow-lg shadow-pac-primary/20"
            : "border-slate-200 border-dashed bg-slate-50 hover:border-pac-primary/50"
        }`}
        onClick={() =>
          !uploadState.isUploading &&
          !isLoading &&
          fileInputRef.current?.click()
        }
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
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
            {uploadState.isUploading ? (
              <Spinner className="w-8 h-8 text-pac-primary" />
            ) : (
              <RiUploadCloud2Line className="w-8 h-8 mb-1" />
            )}
            <span className="text-[10px] font-bold uppercase">
              {uploadState.isUploading
                ? `${uploadState.uploadProgress}%`
                : "Enviar Foto"}
            </span>
          </div>
        )}

        {uploadState.isUploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
            <motion.div
              className="h-full bg-pac-primary"
              initial={{ width: 0 }}
              animate={{ width: `${uploadState.uploadProgress}%` }}
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
        disabled={isLoading || uploadState.isUploading}
      />

      {displayUrl && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 text-xs"
        >
          <RiDeleteBinLine className="w-3.5 h-3.5 mr-1.5" /> Remover
        </Button>
      )}
    </div>
  );
}

export default function CriarAgentePage() {
  const router = useRouter();
  const [dateOpen, setDateOpen] = useState(false);
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

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
    setFormData({
      [name]: name === "telefone" ? formatPhoneNumber(value) : value,
    });

    let validation: { valid: boolean; error?: string } = { valid: true };
    if (name === "matricula") validation = validateMatricula(value);
    else if (name === "email") validation = validateEmail(value);
    else if (name === "full_name") validation = validateFullName(value);

    if (!validation.valid && validation.error) {
      setFieldErrors((p) => ({ ...p, [name]: validation.error! }));
    } else {
      setFieldErrors((p) => {
        const newErr = { ...p };
        delete newErr[name];
        return newErr;
      });
    }
  };

  const handleDateSelect = (
    date: Date | undefined,
    field: "validade_certificacao" | "data_nascimento",
  ) => {
    setFormData({ [field]: date ? format(date, "yyyy-MM-dd") : null });
    if (field === "validade_certificacao") setDateOpen(false);
    else setBirthDateOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAvatarUploading) {
      return toast.warning("Aguarde o upload da imagem terminar.");
    }

    const errors: Record<string, string> = {};
    if (!validateMatricula(formData.matricula || "").valid)
      errors.matricula = "Inválido";
    if (!validateEmail(formData.email || "").valid) errors.email = "Inválido";
    if (!validateFullName(formData.full_name || "").valid)
      errors.full_name = "Inválido";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return toast.error("Verifique os campos obrigatórios");
    }

    const storeErrors = validateForm();
    if (storeErrors.length > 0) {
      storeErrors.forEach((err: string) => toast.error(err));
      return;
    }

    try {
      const result = await createAgentInStore({
        ...formData,
        matricula: formData.matricula!,
        email: formData.email!,
        full_name: formData.full_name!,
        role: formData.role || "agent",
        avatar_url: avatarData?.url || null,
        uf: formData.uf === NOT_SELECTED_VALUE ? null : formData.uf,
        graduacao:
          formData.graduacao === NOT_SELECTED_VALUE ? null : formData.graduacao,
        tipo_sanguineo:
          formData.tipo_sanguineo === NOT_SELECTED_VALUE
            ? null
            : formData.tipo_sanguineo,
      });

      if (result.success) {
        toast.success("Agente criado com sucesso!");
        resetFormData();
        setAvatarData(null);
        router.push("/admin/agentes");
      } else {
        toast.error(result.error || "Erro ao criar agente");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao salvar");
    }
  };

  const isSaveDisabled = saving || isAvatarUploading;

  // Garante que matricula passada para o componente é sempre string
  const safeMatricula = formData.matricula ?? "";

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
                Novo Agente
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Cadastro de efetivo
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
              disabled={isSaveDisabled}
              className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold shadow-md shadow-pac-primary/20"
            >
              {saving ? (
                <Spinner className="w-4 h-4 mr-2" />
              ) : (
                <RiSaveLine className="w-4 h-4 mr-2" />
              )}
              {isAvatarUploading ? "Enviando foto..." : "Salvar Cadastro"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                    <Label
                      htmlFor="full_name"
                      className="text-slate-700 font-semibold"
                    >
                      Nome Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name || ""}
                      onChange={handleInputChange}
                      className={`h-11 ${fieldErrors.full_name ? "border-red-500 focus:ring-red-200" : ""}`}
                      placeholder="Ex: João da Silva"
                    />
                    {fieldErrors.full_name && (
                      <p className="text-xs text-red-500 font-medium">
                        {fieldErrors.full_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 font-semibold"
                    >
                      Email Institucional{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      className={`h-11 ${fieldErrors.email ? "border-red-500 focus:ring-red-200" : ""}`}
                      placeholder="nome@patrulha.org"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500 font-medium">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="telefone"
                      className="text-slate-700 font-semibold"
                    >
                      Telefone / WhatsApp
                    </Label>
                    <div className="relative">
                      <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="telefone"
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
                    <Label className="text-slate-700 font-semibold">
                      Data de Nascimento
                    </Label>
                    <Popover
                      open={birthDateOpen}
                      onOpenChange={setBirthDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full h-11 justify-start text-left font-normal ${!formData.data_nascimento && "text-slate-400"}`}
                        >
                          <RiCalendarLine className="mr-2 h-4 w-4" />
                          {formData.data_nascimento
                            ? formatDateLocal(formData.data_nascimento)
                            : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
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
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <div className="space-y-2">
                  <Label
                    htmlFor="matricula"
                    className="text-slate-700 font-semibold"
                  >
                    Matrícula (11 Dígitos){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="matricula"
                      name="matricula"
                      value={formData.matricula || ""}
                      onChange={handleInputChange}
                      className={`h-11 font-mono tracking-wide ${fieldErrors.matricula ? "border-red-500" : ""}`}
                      placeholder="00000000000"
                      maxLength={11}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateMatricula}
                      className="h-11 px-4 border-slate-200 text-pac-primary hover:bg-pac-primary/5 hover:border-pac-primary"
                    >
                      <RiRefreshLine className="w-4 h-4 mr-2" /> Gerar
                    </Button>
                  </div>
                  {fieldErrors.matricula && (
                    <p className="text-xs text-red-500 font-medium">
                      {fieldErrors.matricula}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">
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
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NOT_SELECTED_VALUE}>
                          Não informada
                        </SelectItem>
                        {GRADUACOES.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">
                      UF de Registro
                    </Label>
                    <Select
                      value={formData.uf || NOT_SELECTED_VALUE}
                      onValueChange={(v) =>
                        setFormData({ uf: v === NOT_SELECTED_VALUE ? null : v })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione..." />
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
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">
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
                        <SelectValue placeholder="Selecione..." />
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
                    <Label className="text-slate-700 font-semibold">
                      Validade Certificação
                    </Label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full h-11 justify-start text-left font-normal ${!formData.validade_certificacao && "text-slate-400"}`}
                        >
                          <RiCalendarLine className="mr-2 h-4 w-4" />
                          {formData.validade_certificacao
                            ? formatDateLocal(formData.validade_certificacao)
                            : "Indefinida"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            formData.validade_certificacao
                              ? new Date(formData.validade_certificacao)
                              : undefined
                          }
                          onSelect={(date) =>
                            handleDateSelect(date, "validade_certificacao")
                          }
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-6 pt-8 flex flex-col items-center">
                <AvatarUpload
                  currentAvatar={avatarData || undefined}
                  onAvatarChange={setAvatarData}
                  onUploadingChange={setIsAvatarUploading}
                  matricula={safeMatricula}
                  isLoading={saving}
                />

                <Separator className="my-6" />

                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="status"
                      className="font-semibold text-slate-700"
                    >
                      Status Ativo
                    </Label>
                    <Switch
                      id="status"
                      checked={formData.status ?? true}
                      onCheckedChange={(c) => setFormData({ status: c })}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Desative para impedir o acesso deste agente ao sistema.
                  </p>

                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">
                      Nível de Acesso
                    </Label>
                    <Select
                      value={formData.role || "agent"}
                      onValueChange={(v: "admin" | "agent") =>
                        setFormData({ role: v })
                      }
                    >
                      <SelectTrigger className="h-10 bg-slate-50">
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

            <Card className="bg-pac-primary/5 border-pac-primary/20 shadow-none">
              <CardContent className="p-5">
                <h4 className="text-pac-primary font-bold text-sm uppercase mb-3 flex items-center">
                  <RiCheckLine className="mr-1" /> Resumo do Cadastro
                </h4>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex justify-between">
                    <span>Nome:</span>
                    <span className="font-medium text-slate-800">
                      {formData.full_name || "-"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Matrícula:</span>
                    <span className="font-medium text-slate-800 font-mono">
                      {formData.matricula || "-"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Função:</span>
                    <span className="font-medium text-slate-800">
                      {formData.role === "admin" ? "Admin" : "Agente"}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
