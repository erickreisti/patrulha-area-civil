"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
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
import { Calendar } from "@/components/ui/calendar";

// Icons
import {
  RiUserLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiDeleteBinLine,
  RiImageLine,
  RiShieldKeyholeLine,
  RiShieldUserLine,
  RiUploadLine,
  RiCalendarEventLine,
  RiCalendar2Line,
} from "react-icons/ri";

// Store e Constantes
import {
  useAgentEdit,
  GRADUACOES,
  UFS_BRASIL,
} from "@/lib/stores/useAgentesStore";

// Actions
import { deleteAgent } from "@/app/actions/admin/agents/agents";

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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
    const toastId = toast.loading("Enviando imagem...");

    try {
      const { uploadAgentAvatar } = await import("@/app/actions/upload/avatar");

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("matricula", matricula);
      formData.append("file", file);
      formData.append("mode", "edit");

      const result = await uploadAgentAvatar(formData);

      if (result.success && result.data?.url) {
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
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      formData.append("mode", "edit");

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
    <div className="space-y-4">
      <div className="flex items-center justify-between w-full">
        <Label className="text-base font-semibold text-gray-700 flex items-center">
          <RiImageLine className="w-5 h-5 mr-2 text-pac-primary" />
          Foto do Agente
        </Label>
        {currentAvatar && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={uploading || isLoading}
            className="text-red-600 h-8"
          >
            <RiDeleteBinLine className="w-4 h-4 mr-1" /> Remover
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
      />

      <div
        className={`relative p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center ${
          currentAvatar
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-500 bg-white"
        }`}
        onClick={handleFileSelect}
      >
        {uploading ? (
          <Spinner className="w-8 h-8 text-pac-primary" />
        ) : currentAvatar ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={currentAvatar}
                alt="Avatar"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-400">
              Clique para alterar
            </p>
          </div>
        ) : (
          <div className="text-center">
            <RiUploadLine className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">Fazer Upload</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function EditarAgentePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [nascimentoOpen, setNascimentoOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
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
    setFormData({ [name]: value });
  };

  const handleDateSelect = (date: Date | undefined, field: string) => {
    const dateString = date ? format(date, "yyyy-MM-dd") : null;
    setFormData({ [field]: dateString });
    if (field === "validade_certificacao") setCertOpen(false);
    if (field === "data_nascimento") setNascimentoOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((err: string) => toast.error(err));
      return;
    }

    const toastId = toast.loading("Salvando alterações...");

    // CORREÇÃO: Criamos um payload sanitizado para remover 'null' de campos obrigatórios
    const payload = {
      ...formData,
      // Campos que não aceitam 'null' na interface de update devem ser convertidos para 'undefined'
      full_name: formData.full_name ?? undefined,
      matricula: formData.matricula ?? undefined,
      email: formData.email ?? undefined,
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
              Ficha do Agente
            </h1>
            <p className="text-slate-500 font-medium">
              {agent.full_name} •{" "}
              <span className="font-mono">{agent.matricula}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
              className="border-slate-300"
            >
              <RiArrowLeftLine className="mr-2" /> Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !hasUnsavedChanges}
              className="bg-pac-primary hover:bg-pac-primary-dark shadow-md shadow-pac-primary/20 font-bold"
            >
              {saving ? (
                <Spinner className="w-4 h-4 mr-2" />
              ) : (
                <RiSaveLine className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <RiUserLine className="text-pac-primary" /> Informações
                  Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">
                      Telefone
                    </Label>
                    <Input
                      name="telefone"
                      value={formData.telefone || ""}
                      onChange={handleInputChange}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">
                      Data de Nascimento
                    </Label>
                    <Popover
                      open={nascimentoOpen}
                      onOpenChange={setNascimentoOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-11 justify-start font-normal border-slate-200"
                        >
                          <RiCalendarEventLine className="mr-2 h-4 w-4 text-slate-400" />
                          {formData.data_nascimento
                            ? formatDateLocal(formData.data_nascimento)
                            : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          locale={ptBR}
                          selected={
                            formData.data_nascimento
                              ? new Date(formData.data_nascimento)
                              : undefined
                          }
                          onSelect={(d) =>
                            handleDateSelect(d, "data_nascimento")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados Operacionais */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <RiShieldKeyholeLine className="text-pac-primary" /> Dados
                  Operacionais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">
                      Graduação
                    </Label>
                    <Select
                      value={formData.graduacao || "not_informed"}
                      onValueChange={(v) =>
                        setFormData({
                          graduacao: v === "not_informed" ? null : v,
                        })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_informed">
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
                      value={formData.uf || "not_informed"}
                      onValueChange={(v) =>
                        setFormData({ uf: v === "not_informed" ? null : v })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_informed">
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
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">
                      Validade Certificação
                    </Label>
                    <Popover open={certOpen} onOpenChange={setCertOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-11 justify-start font-normal border-slate-200"
                        >
                          <RiCalendar2Line className="mr-2 h-4 w-4 text-slate-400" />
                          {formData.validade_certificacao
                            ? formatDateLocal(formData.validade_certificacao)
                            : "Indefinida"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          locale={ptBR}
                          selected={
                            formData.validade_certificacao
                              ? new Date(formData.validade_certificacao)
                              : undefined
                          }
                          onSelect={(d) =>
                            handleDateSelect(d, "validade_certificacao")
                          }
                        />
                      </PopoverContent>
                    </Popover>
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

          <div className="space-y-6">
            {/* Foto e Status Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex flex-col items-center">
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
                      {formData.status ? "Agente em Serviço" : "Agente Inativo"}
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
            <Card className="bg-slate-900 text-white border-0 overflow-hidden relative shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <RiShieldUserLine size={120} />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                  Ficha Operacional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-slate-500 font-bold">
                    Identificação
                  </span>
                  <span className="font-bold text-lg leading-tight uppercase italic truncate">
                    {formData.full_name || "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-slate-500 font-bold">
                    Matrícula
                  </span>
                  <span className="font-mono text-xl tracking-wider text-pac-primary">
                    {formData.matricula}
                  </span>
                </div>
                <div className="pt-2">
                  <div
                    className={`w-fit px-3 py-1 rounded-md text-[10px] font-black uppercase ${formData.role === "admin" ? "bg-purple-500" : "bg-pac-primary"} text-white`}
                  >
                    {formData.role === "admin" ? "Administrador" : "Agente PAC"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
