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

const usePermissions = () => {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: "admin" | "agent";
  } | null>(null);
  const [loading, setLoading] = useState(true);

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

      if (!isAdmin && session.user.id !== agentId) {
        toast.error("Você só pode visualizar seu próprio perfil");
        router.push("/perfil");
        return;
      }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasUnsavedChanges) {
      toast.info("Nenhuma alteração foi feita para salvar");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Salvando alterações...");

    try {
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        validationErrors.forEach((error) => toast.error(error));
        toast.dismiss(toastId);
        setSaving(false);
        return;
      }

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

      const changes: string[] = [];

      if (isAdmin) {
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

        if (formData.status !== originalData?.status) {
          const success = await updateAgentStatus(agentId, formData.status);
          if (!success) {
            setSaving(false);
            return;
          }
          changes.push("status");
        }
      } else {
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

      toast.success("Alterações salvas com sucesso!", {
        id: toastId,
        description:
          changes.length > 0
            ? `Campos atualizados: ${changes.join(", ")}`
            : "Perfil atualizado",
        duration: 6000,
      });

      setFormData((prev) => ({
        ...prev,
        avatar_url: finalAvatarUrl || "",
        avatar_file: null,
      }));
      setAvatarFile(null);
      setOriginalData(formData);
      setHasUnsavedChanges(false);

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

  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
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
        <div className="container mx-auto px-4 max-w-7xl">
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
              <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 h-12 px-6">
                <RiArrowLeftLine className="w-5 h-5 mr-2" />
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
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-800 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
                  {isEditingOwnProfile ? "EDITAR MEU PERFIL" : "EDITAR AGENTE"}
                </h1>
                <p className="text-gray-600 text-lg">
                  {isEditingOwnProfile ? (
                    <>
                      Editando seu próprio perfil • Matrícula:{" "}
                      <strong className="text-navy-700">
                        {agent.matricula}
                      </strong>
                    </>
                  ) : (
                    <>
                      Editando:{" "}
                      <strong className="text-navy-700">
                        {agent.full_name || "Agente"}
                      </strong>{" "}
                      • Matrícula:{" "}
                      <strong className="text-navy-700">
                        {agent.matricula}
                      </strong>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge
                  className={
                    isAdmin
                      ? "bg-purple-500 text-white text-sm py-2 px-4 rounded-full"
                      : "bg-blue-500 text-white text-sm py-2 px-4 rounded-full"
                  }
                >
                  {isAdmin ? (
                    <>
                      <RiShieldUserLine className="w-4 h-4 mr-2" /> ADMIN
                    </>
                  ) : (
                    <>
                      <RiUserLine className="w-4 h-4 mr-2" /> AGENTE
                    </>
                  )}
                </Badge>

                {isEditingOwnProfile && (
                  <Badge className="bg-green-500 text-white text-sm py-2 px-4 rounded-full">
                    <RiEditLine className="w-4 h-4 mr-2" /> MEU PERFIL
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
                    em &quot;Salvar Alterações&quot; para aplicar as mudanças.
                    {avatarFile && (
                      <span className="block mt-2 font-semibold text-yellow-900">
                        📸 Nova foto será enviada ao salvar
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link href={isAdmin ? "/admin/agentes" : "/perfil"}>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 h-12 px-5 rounded-xl"
              >
                <RiArrowLeftLine className="w-5 h-5 mr-2" />
                {isAdmin ? "Voltar para Lista" : "Voltar ao Perfil"}
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
                    {isEditingOwnProfile
                      ? "Editar Meu Perfil"
                      : "Editar Dados do Agente"}
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
                        {avatarFile && (
                          <Badge className="ml-3 bg-blue-100 text-blue-800 text-sm py-1 px-3">
                            Nova foto selecionada
                          </Badge>
                        )}
                      </Label>
                      <FileUpload
                        type="avatar"
                        onFileChange={handleAvatarUrlChange}
                        onFileSelected={handleFileSelected}
                        currentFile={currentAvatarUrl}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-blue-500 transition-all duration-300"
                        userId={agent.matricula}
                        autoUpload={false}
                      />
                      {avatarFile && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
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
                          value={formData.matricula}
                          onChange={handleInputChange}
                          placeholder="Número da matrícula"
                          className="pl-12 text-lg py-3 h-14 font-mono border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                          disabled={saving || !isAdmin}
                          readOnly={!isAdmin}
                        />
                      </div>
                      {!isAdmin && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            <RiAlertLine className="inline w-4 h-4 mr-1" />
                            Apenas administradores podem alterar a matrícula
                          </p>
                        </div>
                      )}
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
                          value={formData.full_name}
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
                        <RiMailLine className="w-5 h-5 mr-2 text-navy-500" />
                        Email *
                      </Label>
                      <div className="relative">
                        <RiMailLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@exemplo.com"
                          className="pl-12 text-lg py-3 h-14 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                          disabled={saving || !isAdmin}
                          readOnly={!isAdmin}
                        />
                      </div>
                      {!isAdmin && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            <RiAlertLine className="inline w-4 h-4 mr-1" />
                            Para alterar o email, entre em contato com um
                            administrador
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Graduação e Tipo Sanguíneo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700">
                          Graduação
                        </Label>
                        <Select
                          value={formData.graduacao}
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
                          value={formData.tipo_sanguineo}
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-14 justify-start text-left text-base border-2 rounded-xl hover:border-blue-500 px-4"
                              disabled={saving}
                            >
                              <RiCalendar2Line className="mr-3 h-5 w-5 text-navy-500" />
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
                              className="rounded-xl border shadow-2xl"
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        {formData.validade_certificacao && (
                          <div className="flex items-center justify-between text-sm mt-3 px-1">
                            <span className="text-gray-600">
                              Selecionado:{" "}
                              {formatDate(formData.validade_certificacao)}
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
                          value={formData.role}
                          onValueChange={handleRoleChange}
                          disabled={saving || !isAdmin}
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
                        {!isAdmin && (
                          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <RiLockLine className="inline w-4 h-4 mr-1" />
                              Apenas administradores podem alterar o tipo de
                              usuário
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-10">
                      <Button
                        type="submit"
                        disabled={saving || !hasUnsavedChanges}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 h-14 text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
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

                      <Link href={isAdmin ? "/admin/agentes" : "/perfil"}>
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

                    {/* Zona de Perigo (Apenas Admin) */}
                    {isAdmin && !isEditingOwnProfile && (
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
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Status e Permissões */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="pb-6 px-6 pt-6">
                <CardTitle className="flex items-center text-xl text-gray-800">
                  <RiShieldKeyholeLine className="w-6 h-6 mr-3 text-navy-600" />
                  Status e Permissões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                  <Label className="text-base font-semibold text-gray-700 cursor-pointer">
                    Agente Ativo na PAC
                  </Label>
                  <Switch
                    checked={formData.status}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("status", checked)
                    }
                    disabled={saving || !isAdmin}
                    className="scale-110"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">
                    Tipo de Acesso
                  </Label>
                  <div className="space-y-2">
                    {(["agent", "admin"] as const).map((role) => (
                      <label
                        key={role}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                          formData.role === role
                            ? "bg-blue-50 border-2 border-blue-200"
                            : "hover:bg-gray-50 border border-gray-200"
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
                          className="text-blue-600 focus:ring-blue-600 scale-125"
                          disabled={saving || !isAdmin}
                        />
                        <span className="text-base capitalize">
                          {role === "agent" ? "Agente" : "Administrador"}
                        </span>
                        {role === "admin" && (
                          <Badge className="bg-purple-100 text-purple-800 text-sm border-purple-200 py-1 px-2 ml-auto">
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
                        {formatDate(formData.validade_certificacao)}
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
