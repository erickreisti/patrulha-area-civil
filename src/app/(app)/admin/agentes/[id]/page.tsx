"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  RiMailLine,
  RiShieldKeyholeLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiDeleteBinLine,
  RiCalendarLine,
  RiCloseLine,
  RiAlertLine,
  RiHomeLine,
  RiEditLine,
  RiLockLine,
  RiShieldUserLine,
  RiCalendar2Line,
  RiCheckLine,
  RiErrorWarningLine,
} from "react-icons/ri";

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
  matricula: string;
  full_name: string;
  email: string;
  graduacao: string;
  tipo_sanguineo: string;
  validade_certificacao: string;
  role: "admin" | "agent";
  status: boolean;
  avatar_url: string;
  avatar_file?: File | null;
}

interface ProfileUpdateData {
  full_name: string;
  graduacao: string | null;
  tipo_sanguineo: string | null;
  validade_certificacao: string | null;
  role: "admin" | "agent";
  avatar_url: string | null;
  updated_at: string;
}

// Hook de permissões otimizado
const usePermissions = () => {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: "admin" | "agent";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Criar cliente Supabase uma vez
  const supabase = useMemo(() => createClient(), []);

  const checkCurrentUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: session.user.id,
            role: profile.role,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    checkCurrentUser();
  }, [checkCurrentUser]);

  return {
    loading,
    currentUserRole: currentUser?.role || "agent",
    currentUserId: currentUser?.id || "",
  };
};

export default function EditarAgentePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    loading: permissionsLoading,
    currentUserRole,
    currentUserId,
  } = usePermissions();

  // Criar cliente Supabase uma vez com useMemo
  const supabase = useMemo(() => createClient(), []);

  const [formData, setFormData] = useState<FormData>({
    matricula: "",
    full_name: "",
    email: "",
    graduacao: "",
    tipo_sanguineo: "",
    validade_certificacao: "",
    role: "agent",
    status: true,
    avatar_url: "",
    avatar_file: null,
  });

  const isAdmin = currentUserRole === "admin";
  const isEditingOwnProfile = currentUserId === agentId;

  // ========== FUNÇÕES DE API ==========

  const updateUserEmail = async (
    userId: string,
    newEmail: string,
    oldEmail: string
  ): Promise<boolean> => {
    const toastId = toast.loading("Atualizando email...");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.", { id: toastId });
        return false;
      }

      const response = await fetch("/api/admin/update-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          newEmail: newEmail.trim(),
          oldEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMsg = result.error || "Falha na atualização do email";
        if (result.details) {
          errorMsg += `: ${result.details}`;
        }

        toast.error("Falha ao atualizar email", {
          id: toastId,
          description: errorMsg,
          duration: 8000,
        });

        return false;
      }

      toast.success("Email atualizado com sucesso!", {
        id: toastId,
        description: "O email foi atualizado em todos os sistemas",
        duration: 6000,
      });

      return true;
    } catch (err: unknown) {
      console.error("💥 Erro ao atualizar email:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      toast.error("Erro ao atualizar email", {
        id: toastId,
        description: errorMessage,
        duration: 8000,
      });

      return false;
    }
  };

  const updateAgentStatus = async (
    userId: string,
    status: boolean
  ): Promise<boolean> => {
    const toastId = toast.loading(
      `Atualizando status para ${status ? "ativo" : "inativo"}...`
    );

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.", { id: toastId });
        return false;
      }

      const response = await fetch(`/api/admin/agentes/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMsg = result.error || "Falha na atualização do status";
        if (result.details) {
          errorMsg += `: ${result.details}`;
        }

        toast.error("Falha ao atualizar status", {
          id: toastId,
          description: errorMsg,
          duration: 8000,
        });

        return false;
      }

      toast.success(
        `Status ${status ? "ativado" : "desativado"} com sucesso!`,
        {
          id: toastId,
          description: `O agente foi ${
            status ? "ativado" : "desativado"
          } no sistema`,
          duration: 6000,
        }
      );

      return true;
    } catch (err: unknown) {
      console.error("💥 Erro ao atualizar status:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      toast.error("Erro ao atualizar status", {
        id: toastId,
        description: errorMessage,
        duration: 8000,
      });

      return false;
    }
  };

  const updateAgentMatricula = async (
    userId: string,
    matricula: string
  ): Promise<boolean> => {
    const toastId = toast.loading("Atualizando matrícula...");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.", { id: toastId });
        return false;
      }

      const response = await fetch(`/api/admin/agentes/${userId}/matricula`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ matricula: matricula.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMsg = result.error || "Falha na atualização da matrícula";
        if (result.details) {
          errorMsg += `: ${result.details}`;
        }

        toast.error("Falha ao atualizar matrícula", {
          id: toastId,
          description: errorMsg,
          duration: 8000,
        });

        return false;
      }

      toast.success("Matrícula atualizada com sucesso!", {
        id: toastId,
        description: "A matrícula foi atualizada no sistema",
        duration: 6000,
      });

      return true;
    } catch (err: unknown) {
      console.error("💥 Erro ao atualizar matrícula:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      toast.error("Erro ao atualizar matrícula", {
        id: toastId,
        description: errorMessage,
        duration: 8000,
      });

      return false;
    }
  };

  const deleteAgent = async (userId: string): Promise<boolean> => {
    setIsDeleting(true);
    const toastId = toast.loading("Excluindo agente permanentemente...", {
      description: "Esta ação não pode ser desfeita...",
    });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.", { id: toastId });
        setIsDeleting(false);
        return false;
      }

      const response = await fetch(`/api/admin/agentes/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMsg = result.error || "Falha na exclusão";
        if (result.details) {
          errorMsg += `: ${result.details}`;
        }
        throw new Error(errorMsg);
      }

      toast.success("Agente excluído permanentemente!", {
        id: toastId,
        description: "Agente removido completamente do sistema",
        duration: 6000,
      });

      return true;
    } catch (err: unknown) {
      console.error("💥 Erro ao excluir agente:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      toast.error("Falha na exclusão", {
        id: toastId,
        description: errorMessage,
        duration: 8000,
      });

      setIsDeleting(false);
      return false;
    }
  };

  // ========== FUNÇÕES AUXILIARES ==========

  const uploadAvatar = async (file: File): Promise<string> => {
    const toastId = toast.loading("Enviando foto...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", agentId);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro no upload");
      }

      const result = await response.json();

      toast.success("Foto enviada com sucesso!", {
        id: toastId,
        description: "A foto foi atualizada no sistema",
        duration: 6000,
      });

      return result.url;
    } catch (error) {
      console.error("❌ Erro no upload do avatar:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro no envio da foto";

      toast.error("Erro ao enviar foto", {
        id: toastId,
        description: errorMessage,
        duration: 8000,
      });

      throw error;
    }
  };

  const fetchAgent = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Você precisa estar logado para acessar esta página");
        router.push("/login");
        return;
      }

      // Verificar o role do usuário atual
      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", session.user.id)
        .single();

      if (profileError || !currentProfile) {
        console.error("❌ Erro ao verificar perfil:", profileError);
        toast.error("Erro ao verificar suas permissões");
        router.push("/login");
        return;
      }

      const isAdmin = currentProfile.role === "admin";

      // Se não for admin e não for o próprio perfil, bloquear
      if (!isAdmin && session.user.id !== agentId) {
        toast.error("Você só pode visualizar seu próprio perfil");
        router.push("/perfil");
        return;
      }

      // Buscar o agente
      const { data: agent, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", agentId)
        .single();

      if (fetchError) {
        console.error("❌ Erro detalhado ao buscar agente:", fetchError);

        if (fetchError.code === "PGRST116") {
          toast.error("Agente não encontrado no sistema");
          if (isAdmin) {
            router.push("/admin/agentes");
          } else {
            router.push("/perfil");
          }
          return;
        }

        throw fetchError;
      }

      if (agent) {
        setAgent(agent);

        const newFormData = {
          matricula: agent.matricula || "",
          full_name: agent.full_name || "",
          email: agent.email || "",
          graduacao: agent.graduacao || "",
          tipo_sanguineo: agent.tipo_sanguineo || "",
          validade_certificacao: agent.validade_certificacao || "",
          role: agent.role,
          status: agent.status,
          avatar_url: agent.avatar_url || "",
          avatar_file: null,
        };

        setFormData(newFormData);
        setOriginalData(newFormData);
        setHasUnsavedChanges(false);
        setAvatarFile(null);
      }
    } catch (error: unknown) {
      console.error("💥 Erro ao carregar dados do agente:", error);
      toast.error("Erro ao carregar dados do agente");
      router.push(isAdmin ? "/admin/agentes" : "/perfil");
    } finally {
      setLoading(false);
    }
  }, [agentId, supabase, router, isAdmin]);

  const checkForChanges = useCallback(
    (newData: FormData) => {
      if (!originalData) return false;

      const hasFormChanges =
        newData.matricula !== originalData.matricula ||
        newData.full_name !== originalData.full_name ||
        newData.email !== originalData.email ||
        newData.graduacao !== originalData.graduacao ||
        newData.tipo_sanguineo !== originalData.tipo_sanguineo ||
        newData.validade_certificacao !== originalData.validade_certificacao ||
        newData.role !== originalData.role ||
        newData.status !== originalData.status;

      const hasAvatarChanges =
        newData.avatar_file !== null ||
        newData.avatar_url !== originalData.avatar_url;

      return hasFormChanges || hasAvatarChanges;
    },
    [originalData]
  );

  useEffect(() => {
    if (agentId && !permissionsLoading) {
      // Verificar se usuário tem permissão
      if (!isAdmin && !isEditingOwnProfile) {
        toast.error("Você não tem permissão para editar este agente");
        router.push("/perfil");
        return;
      }
      fetchAgent();
    }
  }, [
    agentId,
    permissionsLoading,
    isAdmin,
    isEditingOwnProfile,
    fetchAgent,
    router,
  ]);

  useEffect(() => {
    if (originalData) {
      const hasChanges = checkForChanges(formData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, originalData, checkForChanges]);

  // ========== HANDLERS DO FORMULÁRIO ==========

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSwitchChange = (name: keyof FormData, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));

    if (name === "status") {
      toast.info(
        checked
          ? "Status alterado para ATIVO - lembre-se de salvar"
          : "Status alterado para INATIVO - lembre-se de salvar",
        {
          duration: 3000,
        }
      );
    }
  };

  const handleRoleChange = (value: "agent" | "admin") => {
    if (!isAdmin && value !== formData.role) {
      toast.error("Apenas administradores podem alterar o tipo de usuário");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      role: value,
    }));

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
    setFormData((prev) => ({
      ...prev,
      graduacao: value,
    }));
  };

  const handleTipoSanguineoChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tipo_sanguineo: value,
    }));
  };

  const handleFileSelected = async (file: File | null) => {
    setAvatarFile(file);

    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar_file: file,
      }));

      toast.info("Foto selecionada - será enviada ao salvar", {
        description: "Clique em 'Salvar Alterações' para enviar a foto",
        duration: 4000,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        avatar_file: null,
        avatar_url: "",
      }));
    }
  };

  const handleAvatarUrlChange = async (avatarUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      avatar_url: avatarUrl || "",
      avatar_file: null,
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    const dateString = date ? format(date, "yyyy-MM-dd") : "";
    setFormData((prev) => ({
      ...prev,
      validade_certificacao: dateString,
    }));

    if (date) {
      toast.info(
        `Data selecionada: ${format(date, "dd/MM/yyyy", { locale: ptBR })}`,
        {
          duration: 3000,
        }
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Selecionar data";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const getCertificationStatus = () => {
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
      (certDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
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

  // ========== VALIDAÇÕES ==========

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.matricula.trim()) {
      errors.push("Matrícula é obrigatória");
    }

    if (!formData.full_name.trim()) {
      errors.push("Nome completo é obrigatório");
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.push("Email válido é obrigatório");
    }

    return errors;
  };

  // ========== HANDLE SUBMIT (SALVAR) ==========

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasUnsavedChanges) {
      toast.info("Nenhuma alteração foi feita para salvar");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Salvando alterações...");

    try {
      // 1. Validações básicas
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        validationErrors.forEach((error) => toast.error(error));
        toast.dismiss(toastId);
        setSaving(false);
        return;
      }

      // 2. Processar upload do avatar (se houver)
      let finalAvatarUrl = formData.avatar_url;
      if (avatarFile) {
        try {
          const uploadedUrl = await uploadAvatar(avatarFile);
          finalAvatarUrl = uploadedUrl || "";
        } catch (err) {
          console.error("❌ Erro ao enviar foto:", err);
          const errorMessage =
            err instanceof Error ? err.message : "Erro desconhecido";
          toast.error("Erro ao enviar foto", {
            id: toastId,
            description: `A foto não pôde ser enviada: ${errorMessage}`,
          });
          setSaving(false);
          return;
        }
      }

      // 3. Verificar quais campos foram alterados e usar APIs apropriadas
      const changes: string[] = [];

      // Campos que precisam de APIs específicas (apenas admin pode alterar)
      if (isAdmin) {
        // Matrícula alterada
        if (formData.matricula !== originalData?.matricula) {
          const success = await updateAgentMatricula(
            agentId,
            formData.matricula
          );
          if (!success) {
            setSaving(false);
            return;
          }
          changes.push("matrícula");
        }

        // Email alterado
        if (formData.email !== originalData?.email) {
          const success = await updateUserEmail(
            agentId,
            formData.email,
            originalData?.email || ""
          );
          if (!success) {
            setSaving(false);
            return;
          }
          changes.push("email");
        }

        // Status alterado
        if (formData.status !== originalData?.status) {
          const success = await updateAgentStatus(agentId, formData.status);
          if (!success) {
            setSaving(false);
            return;
          }
          changes.push("status");
        }
      } else {
        // Agente comum tentando alterar campos restritos
        const restrictedChanges = {
          matricula: formData.matricula !== originalData?.matricula,
          email: formData.email !== originalData?.email,
          role: formData.role !== originalData?.role,
          status: formData.status !== originalData?.status,
        };

        const hasRestrictedChanges =
          Object.values(restrictedChanges).some(Boolean);

        if (hasRestrictedChanges) {
          toast.error("Apenas administradores podem alterar esses campos", {
            id: toastId,
            description:
              "Entre em contato com um administrador para alterar matrícula, email, tipo ou status",
          });
          setSaving(false);
          return;
        }
      }

      // 4. Atualizar outros campos via cliente (permitido por RLS para alguns campos)
      // Nota: RLS só permite UPDATE para admin, então agentes comuns NÃO podem atualizar nada via cliente
      if (isAdmin) {
        const updateData: ProfileUpdateData = {
          full_name: formData.full_name.trim(),
          graduacao: formData.graduacao || null,
          tipo_sanguineo: formData.tipo_sanguineo || null,
          validade_certificacao: formData.validade_certificacao || null,
          role: formData.role,
          avatar_url: finalAvatarUrl || null,
          updated_at: new Date().toISOString(),
        };
        console.log("🔄 Atualizando perfil via cliente (admin):", updateData);

        const { error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", agentId);

        if (updateError) {
          console.error("❌ Erro ao atualizar perfil:", updateError);
          throw updateError;
        }
      }

      // 5. Sucesso!
      toast.success("Alterações salvas com sucesso!", {
        id: toastId,
        description:
          changes.length > 0
            ? `Campos atualizados: ${changes.join(", ")}`
            : "Perfil atualizado",
        duration: 6000,
      });

      // 6. Resetar estado
      setFormData((prev) => ({
        ...prev,
        avatar_url: finalAvatarUrl || "",
        avatar_file: null,
      }));
      setAvatarFile(null);
      setOriginalData(formData);
      setHasUnsavedChanges(false);

      // 7. Recarregar dados
      setTimeout(() => {
        fetchAgent();
      }, 1000);
    } catch (err: unknown) {
      console.error("💥 Erro ao salvar alterações:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      toast.error("Falha ao salvar alterações", {
        id: toastId,
        description: errorMessage,
        duration: 8000,
      });
    } finally {
      setSaving(false);
    }
  };

  // ========== HANDLE DELETE ==========

  const handleHardDelete = async () => {
    if (!agent) return;

    if (!isAdmin) {
      toast.error("Apenas administradores podem excluir agentes");
      return;
    }

    if (isEditingOwnProfile) {
      toast.error("Administradores não podem se excluir");
      return;
    }

    const success = await deleteAgent(agentId);
    if (success) {
      setDeleteDialogOpen(false);
      setTimeout(() => {
        router.push("/admin/agentes");
        router.refresh();
      }, 1500);
    }
  };

  // ========== RENDER ==========

  if (loading || permissionsLoading) {
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
            <Link href={isAdmin ? "/admin/agentes" : "/perfil"}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                {isAdmin
                  ? "Voltar para Lista de Agentes"
                  : "Voltar ao Meu Perfil"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentAvatarUrl = agent.avatar_url || "";
  const certStatus = getCertificationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
                  {isEditingOwnProfile ? "EDITAR MEU PERFIL" : "EDITAR AGENTE"}
                </h1>
                <p className="text-gray-600">
                  {isEditingOwnProfile ? (
                    <>
                      Editando seu próprio perfil • Matrícula:{" "}
                      <strong>{agent.matricula}</strong>
                    </>
                  ) : (
                    <>
                      Editando: <strong>{agent.full_name || "Agente"}</strong> •
                      Matrícula: <strong>{agent.matricula}</strong>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className={
                    isAdmin
                      ? "bg-purple-500 text-white"
                      : "bg-blue-500 text-white"
                  }
                >
                  {isAdmin ? (
                    <>
                      <RiShieldUserLine className="w-3 h-3 mr-1" /> ADMIN
                    </>
                  ) : (
                    <>
                      <RiUserLine className="w-3 h-3 mr-1" /> AGENTE
                    </>
                  )}
                </Badge>

                {isEditingOwnProfile && (
                  <Badge className="bg-green-500 text-white">
                    <RiEditLine className="w-3 h-3 mr-1" /> MEU PERFIL
                  </Badge>
                )}
              </div>
            </div>

            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <Alert className="bg-yellow-50 border-yellow-200">
                  <RiAlertLine className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Você tem alterações não salvas. Clique em &quot;Salvar
                    Alterações &quot; para aplicar as mudanças.
                    {avatarFile && (
                      <span className="block mt-1 font-semibold">
                        📸 Nova foto será enviada ao salvar
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={isAdmin ? "/admin/agentes" : "/perfil"}>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                {isAdmin ? "Voltar para Lista" : "Voltar ao Perfil"}
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-300"
              >
                <RiHomeLine className="w-4 h-4 mr-2" />
                Voltar ao Site
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <RiUserLine className="w-5 h-5 mr-2 text-navy-600" />
                    {isEditingOwnProfile
                      ? "Editar Meu Perfil"
                      : "Editar Dados do Agente"}
                    {hasUnsavedChanges && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300"
                      >
                        Alterações Pendentes
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-700">
                        Foto do Agente
                        {avatarFile && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                            Nova foto selecionada
                          </Badge>
                        )}
                      </Label>
                      <FileUpload
                        type="avatar"
                        onFileChange={handleAvatarUrlChange}
                        onFileSelected={handleFileSelected}
                        currentFile={currentAvatarUrl}
                        className="p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-500 transition-colors duration-300"
                        userId={agent.matricula}
                        autoUpload={false}
                      />
                      {avatarFile && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700">
                            📸 <strong>Nova foto selecionada:</strong>{" "}
                            {avatarFile.name}
                            <span className="block text-xs text-blue-600 mt-1">
                              Será enviada quando você clicar em &quot;Salvar
                              Alterações&quot;
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Matrícula */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="matricula"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Matrícula *
                        <Badge className="ml-2 text-xs bg-purple-100 text-purple-800">
                          Única
                        </Badge>
                      </Label>
                      <div className="relative">
                        <RiIdCardLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          name="matricula"
                          value={formData.matricula}
                          onChange={handleInputChange}
                          placeholder="Número da matrícula"
                          className="pl-10 text-lg py-3 font-mono"
                          required
                          disabled={saving || !isAdmin}
                          readOnly={!isAdmin}
                        />
                      </div>
                      {!isAdmin && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs text-yellow-700">
                            <RiAlertLine className="inline w-3 h-3 mr-1" />
                            Apenas administradores podem alterar a matrícula
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Nome Completo */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="full_name"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Nome Completo *
                      </Label>
                      <div className="relative">
                        <RiUserLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          placeholder="Nome completo do agente"
                          className="pl-10 text-lg py-3"
                          required
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Email *
                      </Label>
                      <div className="relative">
                        <RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@exemplo.com"
                          className="pl-10 text-lg py-3"
                          required
                          disabled={saving || !isAdmin}
                          readOnly={!isAdmin}
                        />
                      </div>
                      {!isAdmin && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs text-yellow-700">
                            <RiAlertLine className="inline w-3 h-3 mr-1" />
                            Para alterar o email, entre em contato com um
                            administrador
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Graduação e Tipo Sanguíneo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="graduacao"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Graduação
                        </Label>
                        <Select
                          value={formData.graduacao}
                          onValueChange={handleGraduacaoChange}
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
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="tipo_sanguineo"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Tipo Sanguíneo
                        </Label>
                        <Select
                          value={formData.tipo_sanguineo}
                          onValueChange={handleTipoSanguineoChange}
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
                      </div>
                    </div>

                    {/* Validade Certificação e Tipo de Usuário */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Validade da Certificação
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal transition-all duration-300 hover:border-blue-500"
                              disabled={saving}
                            >
                              <RiCalendar2Line className="mr-2 h-4 w-4" />
                              {formData.validade_certificacao ? (
                                formatDate(formData.validade_certificacao)
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
                              className="rounded-md border shadow-lg bg-white"
                              disabled={(date) => {
                                // Desabilitar datas passadas
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              classNames={{
                                root: "w-full",
                                months:
                                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                month: "space-y-4",
                                caption:
                                  "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium",
                                nav: "space-x-1 flex items-center",
                                nav_button: cn(
                                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                                ),
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                head_cell:
                                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: cn(
                                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                                ),
                                day_range_end: "day-range-end",
                                day_selected:
                                  "bg-navy-600 text-primary-foreground hover:bg-navy-600 hover:text-primary-foreground focus:bg-navy-600 focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground",
                                day_outside:
                                  "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                                day_disabled:
                                  "text-muted-foreground opacity-50",
                                day_range_middle:
                                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        {formData.validade_certificacao && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600">
                              Selecionado:{" "}
                              {formatDate(formData.validade_certificacao)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDateSelect(undefined)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                            >
                              Limpar
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="role"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Tipo de Usuário
                        </Label>
                        <Select
                          value={formData.role}
                          onValueChange={handleRoleChange}
                          disabled={saving || !isAdmin}
                        >
                          <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">Agente</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        {!isAdmin && (
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                            <p className="text-xs text-gray-600">
                              <RiLockLine className="inline w-3 h-3 mr-1" />
                              Apenas administradores podem alterar o tipo de
                              usuário
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                      <Button
                        type="submit"
                        disabled={saving || !hasUnsavedChanges}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Spinner className="w-4 h-4 mr-2" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <RiSaveLine className="w-4 h-4 mr-2" />
                            {hasUnsavedChanges
                              ? "Salvar Alterações"
                              : "Nenhuma Alteração"}
                          </>
                        )}
                      </Button>

                      <Link href={isAdmin ? "/admin/agentes" : "/perfil"}>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-gray-600 text-gray-600 hover:bg-gray-100 hover:text-gray-900 py-3 transition-all duration-300"
                          disabled={saving}
                        >
                          <RiCloseLine className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </Link>
                    </div>

                    {/* Zona de Perigo (Apenas Admin) */}
                    {isAdmin && !isEditingOwnProfile && (
                      <div className="pt-4 border-t border-red-200">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <Label className="text-sm font-semibold text-red-700 block mb-2">
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
                                className="w-full border-red-700 text-red-700 hover:bg-red-700 hover:text-white py-2 transition-colors duration-300"
                                size="sm"
                                disabled={isDeleting}
                              >
                                <RiDeleteBinLine className="w-4 h-4 mr-2" />
                                {isDeleting
                                  ? "Excluindo..."
                                  : "Excluir Permanentemente"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-600">
                                  🚨 EXCLUSÃO PERMANENTE
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div className="space-y-3">
                                    <div className="font-semibold text-gray-900">
                                      Tem certeza que deseja excluir
                                      permanentemente este agente?
                                    </div>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                                      <div className="text-sm">
                                        <strong>Nome:</strong>{" "}
                                        {agent.full_name || "Agente sem nome"}
                                      </div>
                                      <div className="text-sm">
                                        <strong>Matrícula:</strong>{" "}
                                        {agent.matricula}
                                      </div>
                                      <div className="text-sm">
                                        <strong>Email:</strong> {agent.email}
                                      </div>
                                    </div>
                                    <div className="text-red-600 font-semibold">
                                      ⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA!
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
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
                                          O perfil será excluído do banco de
                                          dados
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
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleHardDelete}
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  {isDeleting ? (
                                    <>
                                      <Spinner className="w-4 h-4 mr-2" />
                                      Excluindo...
                                    </>
                                  ) : (
                                    "Sim, excluir permanentemente"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <p className="text-xs text-red-600 mt-2">
                            Esta ação não pode ser desfeita. O agente será
                            removido permanentemente do sistema.
                          </p>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status e Permissões */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-gray-800">
                  <RiShieldKeyholeLine className="w-4 h-4 mr-2 text-navy-600" />
                  Status e Permissões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <Label className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Agente Ativo na PAC
                  </Label>
                  <Switch
                    checked={formData.status}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("status", checked)
                    }
                    disabled={saving || !isAdmin}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Tipo de Acesso
                  </Label>
                  <div className="space-y-2">
                    {(["agent", "admin"] as const).map((role) => (
                      <label
                        key={role}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-300 ${
                          formData.role === role
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        } ${
                          !isAdmin
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={formData.role === role}
                          onChange={(e) =>
                            handleRoleChange(
                              e.target.value as "agent" | "admin"
                            )
                          }
                          className="text-blue-600 focus:ring-blue-600"
                          disabled={saving || !isAdmin}
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

            {/* Status da Certificação */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-gray-800">
                  <RiCalendarLine className="w-4 h-4 mr-2 text-navy-600" />
                  Status da Certificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gray-50 rounded-lg border space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Badge className={`${certStatus.color} text-white text-sm`}>
                      {certStatus.icon && (
                        <span className="mr-1">{certStatus.icon}</span>
                      )}
                      {certStatus.text}
                    </Badge>
                  </div>

                  {formData.validade_certificacao && (
                    <>
                      <p className="text-sm text-gray-600">
                        <strong>Validade:</strong>{" "}
                        {formatDate(formData.validade_certificacao)}
                      </p>

                      {certStatus.status === "expirada" && (
                        <Alert className="bg-red-50 border-red-200">
                          <RiErrorWarningLine className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800 text-sm">
                            Certificação expirada! Renove para manter o acesso
                            ao sistema.
                          </AlertDescription>
                        </Alert>
                      )}

                      {certStatus.status === "proximo-expiracao" && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <RiAlertLine className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800 text-sm">
                            Certificação próxima do vencimento. Renove em breve.
                          </AlertDescription>
                        </Alert>
                      )}

                      {certStatus.status === "valida" && (
                        <Alert className="bg-green-50 border-green-200">
                          <RiCheckLine className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800 text-sm">
                            Certificação válida. Tudo em ordem!
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}

                  {!formData.validade_certificacao && (
                    <Alert className="bg-gray-50 border-gray-200">
                      <RiAlertLine className="h-4 w-4 text-gray-600" />
                      <AlertDescription className="text-gray-800 text-sm">
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

// Função cn helper (se não tiver importada)
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
