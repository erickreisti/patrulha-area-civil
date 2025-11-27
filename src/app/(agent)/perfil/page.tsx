"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  FaUser,
  FaCheckCircle,
  FaCalendarAlt,
  FaEdit,
  FaCamera,
  FaExclamationTriangle,
  FaSync,
  FaShieldAlt,
  FaChartBar,
  FaBan,
  FaHome,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { z } from "zod";

// =============================================
// SCHEMAS DE VALIDAÇÃO CORRIGIDOS
// =============================================

const profileSchema = z.object({
  id: z.string().uuid(),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  email: z.string().email("Email inválido"),
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  avatar_url: z.string().nullable().optional(),
  graduacao: z.string().nullable().optional(),
  validade_certificacao: z.string().nullable().optional(),
  tipo_sanguineo: z.string().nullable().optional(),
  status: z.boolean().default(true),
  role: z.enum(["admin", "agent"]).default("agent"),
  created_at: z.string(),
  updated_at: z.string(),
});

type ProfileData = z.infer<typeof profileSchema>;

interface CertificationInfo {
  text: string;
  className: string;
  iconColor: string;
  badgeVariant: "default" | "secondary" | "destructive";
}

// =============================================
// INTERFACES E TIPOS
// =============================================

interface CacheData {
  data: ProfileData;
  timestamp: number;
  version: string;
}

// =============================================
// HOOKS PERSONALIZADOS
// =============================================

const useProfileCache = () => {
  const CACHE_KEY = "pac_user_data";
  const CACHE_VERSION = "1.0.0";
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  const getFromCache = useCallback((): ProfileData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData: CacheData = JSON.parse(cached);

      if (cacheData.version !== CACHE_VERSION) return null;
      if (Date.now() - cacheData.timestamp > CACHE_DURATION) return null;

      const validatedData = profileSchema.parse(cacheData.data);
      console.log("✅ Dados carregados do cache:", validatedData);
      return validatedData;
    } catch (error) {
      console.error("❌ Erro ao carregar cache:", error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, [CACHE_DURATION]);

  const setToCache = useCallback((data: ProfileData) => {
    try {
      const validatedData = profileSchema.parse(data);
      const cacheData: CacheData = {
        data: validatedData,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log("✅ Dados salvos no cache:", validatedData);
    } catch (error) {
      console.error("❌ Erro ao salvar cache:", error);
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  return { getFromCache, setToCache, clearCache };
};

const useRetryWithBackoff = () => {
  const executeWithRetry = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      maxRetries = 3,
      baseDelay = 1000
    ): Promise<T> => {
      let lastError: Error;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error as Error;
          console.warn(`Tentativa ${attempt + 1} falhou:`, error);

          if (attempt === maxRetries - 1) break;

          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      throw lastError!;
    },
    []
  );

  return { executeWithRetry };
};

// =============================================
// COMPONENTES DE UI
// =============================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-3">
    <div className="relative w-6 h-6">
      <motion.div
        className="absolute inset-0 border-2 border-navy/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 border-2 border-transparent border-t-navy rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
    <span className="text-slate-700 font-medium">Carregando...</span>
  </div>
);

const BaseLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-navy to-navy-700 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
    <div className="absolute top-0 left-0 w-72 h-72 bg-navy-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-alert/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
    {children}
  </div>
);

const LoadingState = () => (
  <BaseLayout>
    <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-white/20"
      >
        <div className="flex justify-center mb-6">
          <LoadingSpinner />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3 font-bebas">
          Carregando Perfil
        </h2>
        <p className="text-slate-600 text-lg font-roboto">
          Buscando suas informações...
        </p>
      </motion.div>
    </div>
  </BaseLayout>
);

const ErrorState = ({
  error,
  onRetry,
  onSignOut,
}: {
  error: string | null;
  onRetry: () => void;
  onSignOut: () => void;
}) => (
  <BaseLayout>
    <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-white/20"
      >
        <FaExclamationTriangle className="w-16 h-16 text-alert mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-3 font-bebas">
          {error ? "Erro ao Carregar" : "Perfil Não Encontrado"}
        </h2>
        <p className="text-slate-600 text-lg mb-6 font-roboto">
          {error || "Não foi possível carregar os dados do perfil."}
        </p>
        <div className="flex flex-col gap-4">
          <Button
            onClick={onRetry}
            className="bg-navy hover:bg-navy-700 text-white py-3 text-lg font-semibold font-roboto transition-all duration-300 hover:scale-105 group relative overflow-hidden"
            size="lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <FaSync className="w-5 h-5 mr-3 relative z-10" />
            <span className="relative z-10">Tentar Novamente</span>
          </Button>
          <Button
            onClick={onSignOut}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 py-3 text-lg font-roboto transition-all duration-300 hover:scale-105"
            size="lg"
          >
            Fazer Login Novamente
          </Button>
        </div>
      </motion.div>
    </div>
  </BaseLayout>
);

// =============================================
// UTILITÁRIOS
// =============================================

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Não definida";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    return date.toLocaleDateString("pt-BR");
  } catch {
    return "Data inválida";
  }
};

const formatMatricula = (matricula: string | null): string => {
  if (!matricula) return "NÃO DEFINIDA";

  const onlyNumbers = matricula.replace(/\D/g, "");

  if (onlyNumbers.length === 11) {
    return onlyNumbers
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      .toUpperCase();
  }

  return matricula.toUpperCase();
};

const getCertificationInfo = (profile: ProfileData): CertificationInfo => {
  if (!profile.status) {
    return {
      text: "CERTIFICAÇÃO CANCELADA",
      className: "text-alert font-semibold",
      iconColor: "text-alert",
      badgeVariant: "destructive",
    };
  }

  if (!profile.validade_certificacao) {
    return {
      text: "NÃO DEFINIDA",
      className: "text-slate-600",
      iconColor: "text-slate-500",
      badgeVariant: "secondary",
    };
  }

  const certificationDate = new Date(profile.validade_certificacao);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(certificationDate.getTime())) {
    return {
      text: "DATA INVÁLIDA",
      className: "text-alert font-semibold",
      iconColor: "text-alert",
      badgeVariant: "destructive",
    };
  }

  if (certificationDate < today) {
    return {
      text: `EXPIRADA - ${formatDate(profile.validade_certificacao)}`,
      className: "text-alert font-semibold",
      iconColor: "text-alert",
      badgeVariant: "destructive",
    };
  }

  const daysUntilExpiry = Math.ceil(
    (certificationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry <= 30) {
    return {
      text: `EXPIRA EM ${daysUntilExpiry} DIAS - ${formatDate(
        profile.validade_certificacao
      )}`,
      className: "text-warning font-semibold",
      iconColor: "text-warning",
      badgeVariant: "secondary",
    };
  }

  return {
    text: formatDate(profile.validade_certificacao),
    className: "text-success font-semibold",
    iconColor: "text-success",
    badgeVariant: "default",
  };
};

// =============================================
// COMPONENTES DE SEÇÃO
// =============================================

interface InfoSectionProps {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  isTitle?: boolean;
  isAlert?: boolean;
  isMono?: boolean;
  center?: boolean;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  label,
  value,
  icon: Icon,
  isTitle = false,
  isAlert = false,
  isMono = false,
  center = false,
}) => (
  <div className="space-y-2">
    <label
      className={`text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block ${
        center ? "text-center" : "text-left"
      } font-roboto`}
    >
      {label}
    </label>
    <div
      className={`flex items-center ${
        center ? "justify-center" : "justify-start"
      } space-x-2 sm:space-x-3`}
    >
      {Icon && (
        <Icon
          className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${
            isAlert ? "text-alert" : "text-navy"
          } flex-shrink-0`}
        />
      )}
      <p
        className={`
          ${
            isTitle
              ? "text-2xl sm:text-xl lg:text-3xl xl:text-4xl"
              : "text-base sm:text-lg lg:text-2xl xl:text-3xl"
          }
          font-bold leading-tight break-words min-h-[1.2em] font-bebas
          ${isAlert ? "text-alert uppercase" : "text-slate-800"}
          ${isMono ? "font-mono" : ""}
        `}
      >
        {value}
      </p>
    </div>
  </div>
);

const CertificationSection = ({
  certificationInfo,
  profile,
}: {
  certificationInfo: CertificationInfo;
  profile: ProfileData;
}) => (
  <div className="space-y-2">
    <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block font-roboto">
      Validade da Certificação
    </label>
    <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3">
      <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-navy flex-shrink-0" />
      <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold leading-tight break-words min-h-[1.2em] font-bebas text-slate-800">
        {certificationInfo.text}
      </p>
    </div>
    {!profile.status && (
      <p className="text-xs text-alert mt-1 text-center lg:text-left font-roboto">
        ⚠️ Agente inativo - certificação cancelada automaticamente
      </p>
    )}
  </div>
);

const AdminBadge = () => (
  <div className="flex justify-center lg:justify-start pt-2">
    <Badge className="bg-navy hover:bg-navy-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 font-roboto">
      <FaShieldAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
      ADMINISTRADOR
    </Badge>
  </div>
);

interface AvatarSectionProps {
  profile: ProfileData;
  isAdmin: boolean;
  uploadingAvatar: boolean;
  onCameraClick: () => void;
}

const AvatarSection: React.FC<AvatarSectionProps> = ({
  profile,
  isAdmin,
  uploadingAvatar,
  onCameraClick,
}) => (
  <div className="space-y-3 w-full max-w-xs">
    <div className="flex justify-center">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-36 h-48 sm:w-40 sm:h-52 lg:w-44 lg:h-56 xl:w-48 xl:h-64 bg-slate-100 rounded-lg border-4 border-navy shadow-xl flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 to-slate-100/50" />

          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Foto de perfil"
              fill
              className="object-cover relative z-10"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 relative z-10">
              <FaUser className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 mb-1" />
              <span className="text-xs text-center px-2 font-roboto">
                Sem foto
              </span>
            </div>
          )}

          {uploadingAvatar && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
              <div className="text-center text-white">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                <p className="text-xs">Enviando...</p>
              </div>
            </div>
          )}
        </div>

        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCameraClick}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-xl border-2 border-white z-20 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Alterar foto de perfil"
            aria-label="Alterar foto de perfil"
            onKeyDown={(e) => e.key === "Enter" && onCameraClick()}
          >
            {uploadingAvatar ? (
              <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaCamera className="w-2 h-2 sm:w-3 sm:h-3" />
            )}
          </motion.button>
        )}
      </motion.div>
    </div>
  </div>
);

const StatusSection = ({ profile }: { profile: ProfileData }) => (
  <div className="flex flex-col items-center">
    <div className="text-center w-full">
      <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block mb-2 font-roboto">
        Situação do Patrulheiro
      </label>
      <div className="flex justify-center">
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Badge
            className={`
              text-lg sm:text-xl px-8 sm:px-12 lg:px-16 py-3 sm:py-4 font-bold rounded-lg
              min-w-[280px] sm:min-w-[320px] max-w-[360px] w-full
              transition-all duration-300 cursor-default
              shadow-lg text-center font-roboto border
              ${
                profile.status
                  ? "bg-success text-white hover:bg-success/90 border-success/50"
                  : "bg-alert text-white hover:bg-alert/90 border-alert/50"
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              {profile.status ? (
                <FaCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <FaBan className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
              <span className="text-sm sm:text-base font-bold">
                {profile.status ? "ATIVO" : "INATIVO"}
              </span>
            </div>
          </Badge>
        </motion.div>
      </div>
      {!profile.status && (
        <p className="text-xs text-alert mt-1 max-w-md mx-auto font-roboto">
          ❗ Agente inativo - acesso limitado ao sistema
        </p>
      )}
    </div>
  </div>
);

interface ActionButtonProps {
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  href,
  icon: Icon,
  label,
  onClick,
}) => {
  const buttonContent = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer"
    >
      {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
      <span className="text-xs sm:text-sm font-medium text-white">{label}</span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="flex-1 min-w-[120px] text-center">
        {buttonContent}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="flex-1 min-w-[120px] text-center">
      {buttonContent}
    </div>
  );
};

const ActionButtons = ({
  profile,
  isAdmin,
  onSignOut,
}: {
  profile: ProfileData;
  isAdmin: boolean;
  onSignOut: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 }}
    className="flex flex-col items-center gap-3 mt-6"
  >
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full max-w-2xl">
      {isAdmin && (
        <>
          <ActionButton
            href={`/admin/agentes/${profile.id}`}
            icon={FaEdit}
            label="Editar Perfil"
          />
          <ActionButton
            href="/admin/dashboard"
            icon={FaChartBar}
            label="Dashboard"
          />
        </>
      )}
      <ActionButton href="/" icon={FaHome} label="Voltar ao Site" />
      <ActionButton
        onClick={onSignOut}
        icon={FaSignOutAlt}
        label="Sair do Sistema"
      />
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="text-center mt-4"
    >
      <p className="text-white/70 text-xs sm:text-sm font-roboto">
        Sistema Patrulha Aérea Civil • {new Date().getFullYear()}
      </p>
    </motion.div>
  </motion.div>
);

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export default function AgentPerfil() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { getFromCache, setToCache, clearCache } = useProfileCache();
  const { executeWithRetry } = useRetryWithBackoff();

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const operation = async (): Promise<ProfileData> => {
        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error("Erro de autenticação: " + userError.message);
        }

        if (!user) {
          throw new Error("Nenhum usuário autenticado encontrado");
        }

        console.log("👤 Usuário autenticado:", user.id);

        let userData = getFromCache();

        if (!userData) {
          console.log("🔄 Buscando dados do banco...");
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("❌ Erro ao buscar perfil:", profileError);
            throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
          }

          if (!profileData) {
            throw new Error("Perfil não encontrado no banco de dados");
          }

          console.log("📦 Dados brutos do banco:", profileData);

          try {
            userData = profileSchema.parse(profileData);
          } catch (validationError) {
            console.error("❌ Erro de validação Zod:", validationError);
            userData = {
              ...profileData,
              full_name: profileData.full_name || "Nome não definido",
              matricula: profileData.matricula || "NÃO DEFINIDA",
              email: profileData.email || "email@indefinido.com",
              status: Boolean(profileData.status),
              role: (profileData.role as "admin" | "agent") || "agent",
            } as ProfileData;
          }

          setToCache(userData);
        }

        console.log("✅ Dados do perfil carregados:", {
          full_name: userData.full_name,
          matricula: userData.matricula,
          graduacao: userData.graduacao,
          tipo_sanguineo: userData.tipo_sanguineo,
          validade_certificacao: userData.validade_certificacao,
          status: userData.status,
          role: userData.role,
        });

        return userData;
      };

      const userData = await executeWithRetry(operation, 3, 1000);

      setProfile(userData);
      setIsAdmin(userData.role?.toLowerCase().trim() === "admin");
    } catch (err: unknown) {
      console.error("❌ Erro no fetchProfile:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      clearCache();
    } finally {
      setLoading(false);
    }
  }, [executeWithRetry, getFromCache, setToCache, clearCache]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, retryCount]);

  const handleAvatarUpdate = useCallback(
    async (file: File) => {
      if (!profile) return;

      setUploadingAvatar(true);
      try {
        const supabase = createClient();
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `avatar_${profile.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatares-agentes")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
          });

        let avatarUrl: string;

        if (uploadError) {
          avatarUrl = await handleAvatarBase64(file);
        } else {
          const { data: urlData } = supabase.storage
            .from("avatares-agentes")
            .getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        if (updateError) {
          throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
        }

        const updatedProfile = { ...profile, avatar_url: avatarUrl };
        setProfile(updatedProfile);
        setToCache(updatedProfile);

        alert("✅ Foto de perfil atualizada com sucesso!");
      } catch (err: unknown) {
        console.error("❌ Erro ao atualizar avatar:", err);
        alert("❌ Erro ao atualizar foto. Tente novamente.");
      } finally {
        setUploadingAvatar(false);
      }
    },
    [profile, setToCache]
  );

  const handleAvatarBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const base64Image = e.target?.result as string;
          resolve(base64Image);
        } catch {
          reject(new Error("Erro ao processar imagem."));
        }
      };

      reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
      reader.readAsDataURL(file);
    });
  };

  const handleCameraClick = () => {
    // 🔒 Impede múltiplos cliques ou uploads simultâneos
    if (!isAdmin || uploadingAvatar) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("Por favor, selecione apenas arquivos de imagem.");
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          alert("A imagem deve ter no máximo 2MB.");
          return;
        }

        // ✅ Chamada direta, sem debounce
        handleAvatarUpdate(file);
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      clearCache();
      localStorage.removeItem("supabase.auth.token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !profile)
    return (
      <ErrorState
        error={error}
        onRetry={handleRetry}
        onSignOut={handleSignOut}
      />
    );

  const ProfileContent = ({
    profile,
    isAdmin,
    uploadingAvatar,
    onCameraClick,
    onSignOut,
  }: {
    profile: ProfileData;
    isAdmin: boolean;
    uploadingAvatar: boolean;
    onCameraClick: () => void;
    onSignOut: () => void;
  }) => {
    const certificationInfo = getCertificationInfo(profile);

    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative z-20">
          <div className="w-full max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <Card className="relative bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-xl overflow-hidden w-full max-w-3xl border border-slate-200/60">
                <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none z-0">
                  <div className="w-full h-full max-w-[300px] max-h-[300px] relative">
                    <Image
                      src="/images/logos/logo-pattern.svg"
                      alt="Marca d'água Patrulha Aérea Civil"
                      fill
                      sizes="300px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                <div className="absolute inset-1 border border-slate-300/30 rounded-lg pointer-events-none z-0" />

                <CardContent className="p-2 sm:p-3 lg:p-4 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-between pb-3 lg:pb-4 border-b border-slate-200/30 mb-3 lg:mb-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0"
                    >
                      <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 flex items-center justify-center overflow-visible">
                        <div className="relative w-full h-full max-w-full max-h-full">
                          <Image
                            src="/images/logos/logo.webp"
                            alt="Patrulha Aérea Civil"
                            width={144}
                            height={144}
                            className="w-full h-full object-contain"
                            priority
                          />
                        </div>
                      </div>
                    </motion.div>

                    <div className="flex-1 text-center px-1 min-w-0 mx-1">
                      <h1 className="text-navy text-lg sm:text-xl lg:text-3xl font-bold tracking-wide uppercase leading-tight font-bebas">
                        Patrulha Aérea Civil
                      </h1>
                      <p className="text-slate-600 text-xs mt-0.5 leading-snug font-roboto">
                        COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
                      </p>
                      <div className="mt-0.5">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide uppercase font-bebas">
                          Identificação
                        </h2>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0"
                    >
                      <div className="w-28 h-21 sm:w-32 sm:h-24 lg:w-36 lg:h-27 border border-slate-300 rounded flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/logos/flag-br.webp"
                          alt="Bandeira do Brasil"
                          width={144}
                          height={108}
                          className="w-full h-full object-cover rounded"
                          priority
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  <div className="flex flex-col lg:flex-row gap-0 items-center lg:items-start">
                    <div className="flex-1 w-full space-y-3 text-center lg:text-left pr-0 lg:pr-1">
                      <InfoSection
                        label="Nome Completo"
                        value={profile.full_name || "Nome não definido"}
                        isTitle
                      />
                      <InfoSection
                        label="Graduação"
                        value={
                          profile.graduacao
                            ? `${profile.graduacao.toUpperCase()} - PAC`
                            : "GRADUAÇÃO NÃO DEFINIDA - PAC"
                        }
                        isAlert
                      />
                      <InfoSection
                        label="Matrícula"
                        value={`${formatMatricula(profile.matricula)} RJ`}
                        isMono
                      />
                      <CertificationSection
                        certificationInfo={certificationInfo}
                        profile={profile}
                      />
                      {isAdmin && <AdminBadge />}
                    </div>

                    <div className="hidden lg:block w-px h-16 bg-slate-300/5" />

                    <div className="flex-1 w-full space-y-3 flex flex-col items-center pl-0 lg:pl-1">
                      <AvatarSection
                        profile={profile}
                        isAdmin={isAdmin}
                        uploadingAvatar={uploadingAvatar}
                        onCameraClick={onCameraClick}
                      />
                      <div className="w-full text-center">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block font-roboto">
                          Tipo Sanguíneo
                        </label>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-alert uppercase font-bebas leading-tight">
                          {profile.tipo_sanguineo || "NÃO DEFINIDO"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="my-3 lg:my-4 border-t border-slate-300/30 relative">
                    <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-navy/20 rounded-full" />
                  </div>

                  <StatusSection profile={profile} />
                </CardContent>
              </Card>
            </motion.div>

            <ActionButtons
              profile={profile}
              isAdmin={isAdmin}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      </BaseLayout>
    );
  };

  return (
    <ProfileContent
      profile={profile}
      isAdmin={isAdmin}
      uploadingAvatar={uploadingAvatar}
      onCameraClick={handleCameraClick}
      onSignOut={handleSignOut}
    />
  );
}
