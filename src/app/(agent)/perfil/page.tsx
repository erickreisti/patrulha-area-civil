"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  RiUserLine,
  RiCheckboxCircleLine,
  RiEditLine,
  RiErrorWarningLine,
  RiRefreshLine,
  RiBarChartLine,
  RiForbidLine,
  RiHomeLine,
  RiLogoutBoxRLine,
  RiWhatsappLine,
  RiMailLine,
  RiAlertLine,
} from "react-icons/ri";

// SCHEMA COMPLETO CORRIGIDO com todos os campos do banco
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

interface CacheData {
  data: ProfileData;
  timestamp: number;
  version: string;
}

// Componente Dialog personalizado para agente inativo
const InactiveAgentDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog open={isOpen} onOpenChange={() => {}}>
    <DialogContent className="sm:max-w-md bg-white border-2 border-alert/20 shadow-2xl rounded-xl">
      <div className="absolute right-4 top-4 opacity-0 pointer-events-none">
        <div className="w-4 h-4" />
      </div>

      <DialogHeader>
        <div className="flex items-center justify-center mb-4">
          <div className="bg-alert/10 p-3 rounded-full">
            <RiAlertLine className="w-8 h-8 text-alert" />
          </div>
        </div>
        <DialogTitle className="text-center text-xl font-bold text-alert font-bebas">
          AGENTE NÃO VINCULADO À PAC
        </DialogTitle>
        <DialogDescription className="text-center text-slate-700 mt-2 font-roboto">
          Situação de credencial irregular detectada
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="bg-alert/5 border border-alert/20 rounded-lg p-4">
          <p className="text-sm text-slate-800 font-medium text-center font-roboto">
            <strong className="text-alert">ATENÇÃO:</strong> Você não está mais
            vinculado à<strong> Patrulha Aérea Civil</strong>.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-slate-700 font-roboto text-center">
            <strong className="text-alert">
              DEVOLUÇÃO IMEDIATA OBRIGATÓRIA:
            </strong>
            Você deve entregar imediatamente sua credencial aos responsáveis.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-600 text-center font-roboto">
              <strong className="text-alert">PUNIÇÕES LEGAIS:</strong> A
              retenção indevida da credencial sujeita o portador a medidas
              disciplinares e penais conforme o regulamento interno da PAC.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-sm font-semibold text-slate-800 text-center font-roboto">
            CONTATOS OFICIAIS PARA REGULARIZAÇÃO:
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <RiWhatsappLine className="w-5 h-5 text-green-600" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800 font-roboto">
                  WhatsApp Oficial
                </p>
                <p className="text-xs text-slate-600 font-mono">
                  (21) 99999-9999
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 bg-navy/10 border border-navy/20 rounded-lg p-3">
              <RiMailLine className="w-5 h-5 text-navy" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800 font-roboto">
                  E-mail Oficial
                </p>
                <p className="text-xs text-slate-600 font-mono">
                  comando@pac-rj.gov.br
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={onClose}
          className="bg-alert hover:bg-alert/90 text-white font-semibold py-3 px-8 text-lg transition-all duration-300 hover:scale-105 font-roboto"
          size="lg"
        >
          ENTENDI - CLIQUE PARA CONTINUAR
        </Button>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 font-roboto">
          Esta mensagem permanecerá até a confirmação do entendimento
        </p>
      </div>
    </DialogContent>
  </Dialog>
);

const useProfileCache = () => {
  const CACHE_KEY = "pac_user_data";
  const CACHE_VERSION = "1.0.0";
  const CACHE_DURATION = 5 * 60 * 1000;

  const getFromCache = useCallback((): ProfileData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const cacheData: CacheData = JSON.parse(cached);
      if (cacheData.version !== CACHE_VERSION) return null;
      if (Date.now() - cacheData.timestamp > CACHE_DURATION) return null;
      const validatedData = profileSchema.parse(cacheData.data);
      return validatedData;
    } catch {
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
    } catch (error) {
      console.error("Erro ao salvar cache:", error);
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
          if (attempt === maxRetries - 1) break;
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      throw lastError!;
    },
    []
  );
  return { executeWithRetry };
};

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
        <RiErrorWarningLine className="w-16 h-16 text-alert mx-auto mb-6" />
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
            <RiRefreshLine className="w-5 h-5 mr-3 relative z-10" />
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

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Não definida";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data inválida";
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

interface InfoSectionProps {
  label: string;
  value: string;
  isTitle?: boolean;
  isAlert?: boolean;
  isMono?: boolean;
  center?: boolean;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  label,
  value,
  isTitle = false,
  isAlert = false,
  isMono = false,
  center = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-1 sm:space-y-2"
  >
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
      }`}
    >
      <p
        className={`
          ${
            isTitle
              ? "text-lg sm:text-xl lg:text-2xl"
              : "text-base sm:text-lg lg:text-xl"
          }
          font-bold leading-tight break-words min-h-[1.2em] font-bebas
          ${isAlert ? "text-alert uppercase" : "text-slate-800"}
          ${isMono ? "font-mono" : ""}
          max-w-full overflow-hidden
        `}
      >
        {value}
      </p>
    </div>
  </motion.div>
);

const CertificationSection = ({
  certificationInfo,
  profile,
}: {
  certificationInfo: CertificationInfo;
  profile: ProfileData;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-1 sm:space-y-2"
  >
    <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block font-roboto">
      Validade
    </label>
    <div className="flex items-center justify-center lg:justify-start">
      <p className="text-base sm:text-lg lg:text-xl font-bold leading-tight break-words min-h-[1.2em] font-bebas text-slate-800 max-w-full overflow-hidden">
        {certificationInfo.text}
      </p>
    </div>
    {!profile.status && (
      <p className="text-xs text-alert mt-1 text-center lg:text-left font-roboto">
        ⚠️ Agente inativo - certificação cancelada
      </p>
    )}
  </motion.div>
);

interface AvatarSectionProps {
  profile: ProfileData;
}

const AvatarSection: React.FC<AvatarSectionProps> = ({ profile }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="space-y-2 sm:space-y-3 w-full max-w-[280px] mx-auto"
  >
    <div className="flex justify-center">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-40 h-52 sm:w-48 sm:h-60 lg:w-56 lg:h-72 xl:w-64 xl:h-80 bg-slate-100 rounded-lg border-4 border-navy shadow-xl flex items-center justify-center overflow-hidden relative">
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
              <RiUserLine className="w-16 h-16 sm:w-20 sm:h-20 mb-2" />
              <span className="text-sm text-center px-2 font-roboto">
                Sem foto
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const StatusSection = ({ profile }: { profile: ProfileData }) => (
  <div className="flex flex-col items-center">
    <div className="text-center w-full">
      <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block mb-3 sm:mb-4 font-roboto">
        Situação do Patrulheiro
      </label>
      <div className="flex justify-center">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <Badge
            className={`
              text-lg sm:text-xl lg:text-2xl 
              px-8 sm:px-12 lg:px-16 
              py-4 sm:py-5 lg:py-6 
              font-extrabold rounded-xl
              min-w-[280px] sm:min-w-[340px] lg:min-w-[400px]
              max-w-[480px] w-full
              transition-all duration-300 cursor-default
              shadow-2xl text-center font-bebas
              border-4
              ${
                profile.status
                  ? "bg-gradient-to-r from-success to-success-600 text-white hover:from-success-600 hover:to-success-700 border-success-700/50 shadow-success/30"
                  : "bg-gradient-to-r from-alert to-alert-600 text-white hover:from-alert-600 hover:to-alert-700 border-alert-700/50 shadow-alert/30"
              }
            `}
          >
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={profile.status ? "active" : "inactive"}
                  initial={{ scale: 0.8, rotate: -180 }}
                  animate={{ scale: 1.2, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  {profile.status ? (
                    <RiCheckboxCircleLine className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                  ) : (
                    <RiForbidLine className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                  )}
                </motion.div>
              </AnimatePresence>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider drop-shadow-lg">
                {profile.status ? "ATIVO" : "INATIVO"}
              </span>
            </div>
          </Badge>
        </motion.div>
      </div>
      {!profile.status && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm sm:text-base text-alert mt-3 max-w-md mx-auto font-roboto px-2 font-semibold bg-alert/10 py-2 rounded-lg border border-alert/20"
        >
          AGENTE INATIVO - ACESSO LIMITADO AO SISTEMA
        </motion.p>
      )}
      {profile.status && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm sm:text-base text-success mt-3 max-w-md mx-auto font-roboto px-2 font-semibold bg-success/10 py-2 rounded-lg border border-success/20"
        >
          AGENTE ATIVO - ACESSO COMPLETO AO SISTEMA
        </motion.p>
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
      className="flex items-center justify-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-all duration-300 cursor-pointer bg-navy/90 hover:bg-navy"
    >
      {Icon && <Icon className="w-3 h-3 text-white" />}
      <span className="text-xs font-medium text-white whitespace-nowrap">
        {label}
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="flex-1 min-w-[100px] max-w-[140px]">
        {buttonContent}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="flex-1 min-w-[100px] max-w-[140px]">
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
    className="flex flex-col items-center gap-2 sm:gap-3 mt-4 sm:mt-6"
  >
    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 w-full max-w-md px-2">
      {isAdmin && (
        <>
          <ActionButton
            href={`/admin/agentes/${profile.id}`}
            icon={RiEditLine}
            label="Editar"
          />
          <ActionButton
            href="/admin/dashboard"
            icon={RiBarChartLine}
            label="Dashboard"
          />
        </>
      )}
      <ActionButton href="/" icon={RiHomeLine} label="Site" />
      <ActionButton onClick={onSignOut} icon={RiLogoutBoxRLine} label="Sair" />
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="text-center mt-2 sm:mt-4"
    >
      <p className="text-white/70 text-xs font-roboto">
        Sistema Patrulha Aérea Civil • {new Date().getFullYear()}
      </p>
    </motion.div>
  </motion.div>
);

export default function AgentPerfil() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);

  const { clearCache } = useProfileCache();
  const { executeWithRetry } = useRetryWithBackoff();

  // FUNÇÃO CORRIGIDA para buscar todos os dados do banco
  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const operation = async (): Promise<ProfileData> => {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Nenhum usuário autenticado encontrado");

        console.log("🔍 Buscando dados do usuário:", user.id);

        // Buscar dados COMPLETOS do banco
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*") // SELECT * para pegar TODOS os campos
          .eq("id", user.id)
          .single();

        console.log("📊 Dados retornados do banco:", profileData);
        console.log("❌ Erro (se houver):", profileError);

        if (profileError) {
          throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
        }

        if (!profileData) {
          throw new Error("Perfil não encontrado no banco de dados");
        }

        // Validar dados com schema
        let validatedData: ProfileData;
        try {
          validatedData = profileSchema.parse(profileData);
        } catch (validationError) {
          console.warn(
            "⚠️ Dados não validados pelo schema, usando fallback:",
            validationError
          );
          // Fallback para garantir que todos os campos existam
          validatedData = {
            id: profileData.id || user.id,
            matricula: profileData.matricula || "NÃO DEFINIDA",
            email: profileData.email || user.email || "email@indefinido.com",
            full_name: profileData.full_name || "Nome não definido",
            avatar_url: profileData.avatar_url || null,
            graduacao: profileData.graduacao || null,
            validade_certificacao: profileData.validade_certificacao || null,
            tipo_sanguineo: profileData.tipo_sanguineo || null,
            status: Boolean(profileData.status),
            role: (profileData.role as "admin" | "agent") || "agent",
            created_at: profileData.created_at || new Date().toISOString(),
            updated_at: profileData.updated_at || new Date().toISOString(),
          };
        }

        console.log("✅ Dados validados:", validatedData);
        return validatedData;
      };

      const userData = await executeWithRetry(operation, 3, 1000);
      setProfile(userData);
      setIsAdmin(userData.role?.toLowerCase().trim() === "admin");

      // Mostrar dialog se agente inativo
      if (!userData.status) {
        setShowInactiveDialog(true);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      console.error("💥 Erro ao carregar perfil:", errorMessage);
      setError(errorMessage);
      clearCache();
    } finally {
      setLoading(false);
    }
  }, [executeWithRetry, clearCache]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, retryCount]);

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
    } catch {
      console.error("Erro ao fazer logout");
    }
  };

  const handleCloseInactiveDialog = () => {
    setShowInactiveDialog(false);
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
    onSignOut,
  }: {
    profile: ProfileData;
    isAdmin: boolean;
    onSignOut: () => void;
  }) => {
    const certificationInfo = getCertificationInfo(profile);

    return (
      <BaseLayout>
        <InactiveAgentDialog
          isOpen={showInactiveDialog}
          onClose={handleCloseInactiveDialog}
        />

        <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative z-20">
          <div className="w-full max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <Card className="relative bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-xl overflow-hidden w-full max-w-sm sm:max-w-md lg:max-w-3xl border border-slate-200/60 mx-2">
                <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none z-0">
                  <div className="w-full h-full max-w-[800px] max-h-[800px] sm:max-w-[800px] sm:max-h-[800px] relative">
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

                <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                  {/* HEADER */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center pb-4 border-b border-slate-200/30 mb-4 space-y-4"
                  >
                    {/* LOGO */}
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 flex items-center justify-center">
                        <div className="relative w-full h-full">
                          <Image
                            src="/images/logos/logo.webp"
                            alt="Patrulha Aérea Civil"
                            width={160}
                            height={160}
                            className="w-full h-full object-contain"
                            priority
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* TÍTULO */}
                    <div className="text-center">
                      <h1 className="text-navy text-xl sm:text-2xl lg:text-3xl font-bold tracking-wide uppercase leading-tight font-bebas">
                        Patrulha Aérea Civil
                      </h1>
                      <p className="text-slate-600 text-[8px] sm:text-sm mt-1 leading-snug font-roboto">
                        COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
                      </p>
                    </div>

                    {/* IDENTIFICAÇÃO E BANDEIRA */}
                    <div className="text-center space-y-2">
                      <h2 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide uppercase font-bebas">
                        Identificação
                      </h2>
                      <div className="w-12 h-8 sm:w-14 sm:h-10 border border-slate-300 rounded flex items-center justify-center justify-self-center overflow-hidden">
                        <Image
                          src="/images/logos/flag-br.webp"
                          alt="Bandeira do Brasil"
                          width={56}
                          height={40}
                          className="w-full h-full object-cover rounded"
                          priority
                        />
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start">
                    {/* LADO ESQUERDO - INFORMAÇÕES */}
                    <div className="flex-1 w-full space-y-3 sm:space-y-4 text-center lg:text-left">
                      <InfoSection
                        label="Nome"
                        value={profile.full_name}
                        isTitle
                      />
                      <InfoSection
                        label="Graduação"
                        value={
                          profile.graduacao
                            ? `${profile.graduacao.toUpperCase()}`
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
                    </div>

                    <div className="w-full lg:w-px lg:h-40 bg-slate-300/10 my-3 lg:my-0" />

                    {/* LADO DIREITO - AVATAR E TIPO SANGUÍNEO */}
                    <div className="flex-1 w-full space-y-3 sm:space-y-4 flex flex-col items-center">
                      <AvatarSection profile={profile} />

                      <div className="w-full text-center">
                        <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block font-roboto mb-1">
                          Tipo Sanguíneo
                        </label>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-alert uppercase font-bebas leading-tight">
                          {profile.tipo_sanguineo || "NÃO DEFINIDO"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="my-4 border-t border-slate-300/30 relative">
                    <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-navy/20 rounded-full" />
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
      onSignOut={handleSignOut}
    />
  );
}
