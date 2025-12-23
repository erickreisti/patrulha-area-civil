"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUserLine,
  RiCheckboxCircleLine,
  RiEditLine,
  RiErrorWarningLine,
  RiBarChartLine,
  RiForbidLine,
  RiHomeLine,
  RiLogoutBoxLine,
  RiWhatsappLine,
  RiMailLine,
  RiAlertLine,
  RiLockLine,
  RiShieldKeyholeLine,
  RiEyeLine,
  RiEyeOffLine,
  RiSettingsLine,
} from "react-icons/ri";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import type { Profile } from "@/lib/supabase/types";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

type ProfileData = Profile;

interface CertificationInfo {
  text: string;
  className: string;
  iconColor: string;
  badgeVariant: "default" | "secondary" | "destructive";
}

// Sistema de escalabilidade para labels
const getLabelFontSize = () => {
  if (typeof window === "undefined") return "text-[6px]";
  const width = window.innerWidth;
  if (width < 375) return "text-[6px]";
  if (width < 400) return "text-[7px]";
  if (width < 480) return "text-[8px]";
  if (width < 640) return "text-[9px]";
  if (width < 768) return "text-[10px]";
  if (width < 1024) return "text-[11px] sm:text-[12px]";
  return "text-[11px] sm:text-[12px] md:text-[14px]";
};

const getContentFontSize = () => {
  if (typeof window === "undefined") return "text-xs";
  const width = window.innerWidth;
  if (width < 375) return "text-xs";
  if (width < 400) return "text-sm";
  if (width < 480) return "text-base";
  if (width < 640) return "text-lg";
  if (width < 768) return "text-lg sm:text-xl";
  if (width < 1024) return "text-lg sm:text-xl md:text-2xl";
  return "text-lg sm:text-xl md:text-2xl lg:text-3xl";
};

const getSecondaryContentFontSize = () => {
  if (typeof window === "undefined") return "text-[10px]";
  const width = window.innerWidth;
  if (width < 375) return "text-[10px]";
  if (width < 400) return "text-[11px]";
  if (width < 480) return "text-[12px]";
  if (width < 640) return "text-[13px]";
  if (width < 768) return "text-[14px] sm:text-[15px]";
  if (width < 1024) return "text-[14px] sm:text-[15px] md:text-[16px]";
  return "text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px]";
};

// Modal para Agente Inativo
const InactiveAgentDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto bg-white border-2 border-error/20 shadow-2xl rounded-xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[85vh] overflow-y-auto">
      <div className="absolute right-3 top-3 opacity-0 pointer-events-none">
        <div className="w-4 h-4" />
      </div>

      <DialogHeader className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-error/10 p-2.5 rounded-full">
            <RiAlertLine className="w-6 h-6 text-error" />
          </div>
        </div>
        <DialogTitle className="text-center text-lg font-bold text-error font-roboto leading-tight">
          AGENTE NÃO VINCULADO À PAC
        </DialogTitle>
        <DialogDescription className="text-center text-slate-700 mt-1 text-sm font-roboto">
          Situação de credencial irregular detectada
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 px-4 py-2">
        <div className="bg-error/5 border border-error/20 rounded-lg p-3">
          <p className="text-xs text-slate-800 font-medium text-center font-roboto leading-relaxed">
            <strong className="text-error">ATENÇÃO:</strong> Você não está mais
            vinculado à <strong>Patrulha Aérea Civil</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-700 font-roboto text-center leading-relaxed">
            <strong className="text-error">
              DEVOLUÇÃO IMEDIATA OBRIGATÓRIA:
            </strong>{" "}
            Você deve entregar imediatamente sua credencial aos responsáveis.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
            <p className="text-[11px] text-slate-600 text-center font-roboto leading-relaxed">
              <strong className="text-error">PUNIÇÕES LEGAIS:</strong> A
              retenção indevida da credencial sujeita o portador a medidas
              disciplinares e penais conforme o regulamento interno da PAC.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-slate-800 text-center font-roboto">
            CONTATOS OFICIAIS PARA REGULARIZAÇÃO:
          </p>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2">
              <RiWhatsappLine className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="text-left min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 font-roboto truncate">
                  WhatsApp Oficial
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  (21) 99999-9999
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-navy/10 border border-navy/20 rounded-lg p-2">
              <RiMailLine className="w-4 h-4 text-navy flex-shrink-0" />
              <div className="text-left min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 font-roboto truncate">
                  E-mail Oficial
                </p>
                <p className="text-[11px] text-slate-600 font-mono break-all">
                  comando@pac-rj.gov.br
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-3 px-4 pb-4">
        <Button
          onClick={onClose}
          className="bg-error hover:bg-error/90 text-white font-semibold py-2.5 px-6 text-sm transition-all duration-300 hover:scale-105 font-roboto w-full max-w-[280px]"
          size="lg"
        >
          ENTENDI - CLIQUE PARA CONTINUAR
        </Button>
      </div>

      <div className="text-center px-4 pb-3">
        <p className="text-[10px] text-slate-500 font-roboto">
          Esta mensagem permanecerá até a confirmação do entendimento
        </p>
      </div>
    </DialogContent>
  </Dialog>
);

// Modal de Autenticação Admin
const AdminAuthModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { verifyAdminAccess } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminPassword.trim()) {
      setError("Digite a senha de administrador");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await verifyAdminAccess(adminPassword);

      console.log("🔍 [AdminModal] Resultado da autenticação:", result);

      if (result.success) {
        console.log(
          "✅ [AdminModal] Autenticação bem-sucedida, redirecionando..."
        );
        router.push("/admin/dashboard");
        onClose();
      } else {
        setError(result.error || "Senha de administrador incorreta");
      }
    } catch (err) {
      console.error("❌ [AdminModal] Erro:", err);
      setError("Erro na autenticação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto bg-white border-2 border-navy/20 shadow-2xl rounded-xl">
        <DialogHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-navy/10 p-2.5 rounded-full">
              <RiShieldKeyholeLine className="w-6 h-6 text-navy" />
            </div>
          </div>

          <DialogTitle className="text-center text-lg font-bold text-navy font-roboto">
            AUTENTICAÇÃO ADMINISTRATIVA
          </DialogTitle>

          <DialogDescription className="text-center text-slate-700 mt-1 text-sm font-roboto">
            Acesso restrito ao Painel Administrativo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-roboto">
              Senha Administrativa
            </label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setError("");
                }}
                placeholder="Digite sua senha administrativa"
                disabled={loading}
                className={`w-full text-lg pr-10 ${
                  error ? "border-error focus:ring-error" : "border-slate-300"
                }`}
                autoFocus
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                disabled={loading}
              >
                {showPassword ? (
                  <RiEyeOffLine className="w-5 h-5" />
                ) : (
                  <RiEyeLine className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-2 text-error text-sm">
                <RiErrorWarningLine className="w-4 h-4" />
                <span className="font-roboto">{error}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-navy hover:bg-navy/90 text-white font-semibold py-2.5 text-sm transition-all font-roboto"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Verificando...
                </>
              ) : (
                "Acessar Painel Admin"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-roboto"
            >
              Cancelar
            </Button>
          </div>
        </form>

        <div className="text-center px-4 pb-3">
          <p className="text-[10px] text-slate-500 font-roboto">
            Esta autenticação é adicional à senha padrão do sistema
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BaseLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-navy to-navy-700 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
    <div className="absolute top-0 left-0 w-72 h-72 bg-navy-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-error/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
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
          <Spinner className="size-8 text-navy" />
        </div>
        <p className="text-slate-600 text-lg font-roboto">
          Carregando informações...
        </p>
      </motion.div>
    </div>
  </BaseLayout>
);

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Não definida";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleDateString("pt-BR");
  } catch {
    return "Data inválida";
  }
};

const formatMatricula = (matricula: string | null | undefined): string => {
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
      className: "text-error font-semibold",
      iconColor: "text-error",
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
      className: "text-error font-semibold",
      iconColor: "text-error",
      badgeVariant: "destructive",
    };
  }

  if (certificationDate < today) {
    return {
      text: `EXPIRADA - ${formatDate(profile.validade_certificacao)}`,
      className: "text-error font-semibold",
      iconColor: "text-error",
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
    className: "text-slate-800 font-semibold",
    iconColor: "text-success",
    badgeVariant: "default",
  };
};

const ActionButton: React.FC<{
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}> = ({
  href,
  icon: Icon,
  label,
  onClick,
  disabled = false,
  disabledMessage,
}) => {
  const buttonContent = (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`
        flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 w-full min-h-[44px]
        ${
          disabled
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-navy/90 hover:bg-navy cursor-pointer"
        }
      `}
      title={disabled ? disabledMessage : ""}
    >
      {Icon && (
        <Icon
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            disabled ? "text-white/60" : "text-white"
          }`}
        />
      )}
      <span
        className={`text-xs font-medium whitespace-nowrap font-roboto ${
          disabled ? "text-white/60" : "text-white"
        }`}
      >
        {label}
      </span>
    </motion.div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="w-full">
        {buttonContent}
      </Link>
    );
  }

  return (
    <div onClick={disabled ? undefined : onClick} className="w-full">
      {buttonContent}
    </div>
  );
};

const ActionButtons = ({
  profile,
  isAdmin,
  onSignOut,
  onOpenAdminAuth,
  onSetupPassword,
}: {
  profile: ProfileData;
  isAdmin: boolean;
  onSignOut: () => Promise<{ success: boolean; error?: string }>;
  onOpenAdminAuth: () => void;
  onSetupPassword: () => void;
}) => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const hasRedirected = useRef(false);

  const handleSignOut = async () => {
    if (isSigningOut || hasRedirected.current) return;

    setIsSigningOut(true);
    hasRedirected.current = true;

    try {
      onSignOut().finally(() => {
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 100);
      });
    } catch {
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 100);
    }
  };

  // Se o agente está inativo
  if (!profile.status) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col items-center gap-3 mt-4 px-2 w-full max-w-lg mx-auto"
      >
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-2 w-full max-w-xs">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer bg-red-600/90 hover:bg-red-700 w-full min-h-[44px]"
          >
            {isSigningOut ? (
              <Spinner className="w-3.5 h-3.5 text-white" />
            ) : (
              <RiLogoutBoxLine className="w-3.5 h-3.5 text-white flex-shrink-0" />
            )}
            <span className="text-xs font-medium text-white whitespace-nowrap font-roboto">
              {isSigningOut ? "Saindo..." : "Sair"}
            </span>
          </motion.div>

          <ActionButton href="/" icon={RiHomeLine} label="Voltar ao Site" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-3 w-full"
        >
          <p className="text-white/70 text-[10px] font-roboto">
            Sistema Patrulha Aérea Civil • {new Date().getFullYear()}
          </p>
          <p className="text-error text-xs font-bold mt-1 font-roboto">
            ⚠️ AGENTE INATIVO - ACESSO LIMITADO
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="flex flex-col items-center gap-3 mt-4 px-2 w-full max-w-lg mx-auto"
    >
      <div className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-2 w-full">
        {isAdmin ? (
          <>
            {/* Botão para configuração de senha se não estiver configurada */}
            {!profile.admin_2fa_enabled ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSetupPassword}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer bg-warning/90 hover:bg-warning w-full min-h-[44px]"
              >
                <RiSettingsLine className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span className="text-xs font-medium text-white whitespace-nowrap font-roboto">
                  Configurar Senha
                </span>
              </motion.div>
            ) : (
              <ActionButton
                href={`/admin/agentes/${profile.id}`}
                icon={RiEditLine}
                label="Editar"
              />
            )}

            {/* Botão Dashboard só aparece se senha estiver configurada */}
            {profile.admin_2fa_enabled ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenAdminAuth}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer bg-navy/90 hover:bg-navy w-full min-h-[44px]"
              >
                <RiBarChartLine className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span className="text-xs font-medium text-white whitespace-nowrap font-roboto">
                  Dashboard
                </span>
              </motion.div>
            ) : (
              <div className="opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg bg-slate-400 w-full min-h-[44px]">
                  <RiBarChartLine className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                  <span className="text-xs font-medium text-white/60 whitespace-nowrap font-roboto">
                    Configure Senha
                  </span>
                </div>
              </div>
            )}

            <ActionButton href="/" icon={RiHomeLine} label="Site" />

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer bg-red-600/90 hover:bg-red-700 w-full min-h-[44px]"
            >
              {isSigningOut ? (
                <Spinner className="w-3.5 h-3.5 text-white" />
              ) : (
                <RiLogoutBoxLine className="w-3.5 h-3.5 text-white flex-shrink-0" />
              )}
              <span className="text-xs font-medium text-white whitespace-nowrap font-roboto">
                {isSigningOut ? "Saindo..." : "Sair"}
              </span>
            </motion.div>
          </>
        ) : (
          <>
            <ActionButton href="/" icon={RiHomeLine} label="Site" />
            <div className="col-span-1" />
            <ActionButton
              disabled={true}
              icon={RiLockLine}
              label="Acesso Restrito"
              disabledMessage="Apenas administradores podem editar perfis"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer bg-red-600/90 hover:bg-red-700 w-full min-h-[44px]"
            >
              {isSigningOut ? (
                <Spinner className="w-3.5 h-3.5 text-white" />
              ) : (
                <RiLogoutBoxLine className="w-3.5 h-3.5 text-white flex-shrink-0" />
              )}
              <span className="text-xs font-medium text-white whitespace-nowrap font-roboto">
                {isSigningOut ? "Saindo..." : "Sair"}
              </span>
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center mt-3 w-full"
      >
        <p className="text-white/70 text-[10px] font-roboto">
          Sistema Patrulha Aérea Civil • {new Date().getFullYear()}
        </p>
        {isAdmin && (
          <p
            className={`text-xs font-bold mt-1 font-roboto ${
              profile.admin_2fa_enabled ? "text-success" : "text-warning"
            }`}
          >
            {profile.admin_2fa_enabled
              ? "👑 ADMINISTRADOR - ACESSO COMPLETO"
              : "⚠️ ADMINISTRADOR - CONFIGURE A SENHA"}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function AgentPerfil() {
  const { user, profile, isLoading, isAuthenticated, isAdmin, logout } =
    useAuthStore();
  const router = useRouter();

  const [showInactiveDialog, setShowInactiveDialog] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [labelFontSize, setLabelFontSize] = useState("text-[6px]");
  const [contentFontSize, setContentFontSize] = useState("text-xs");
  const [secondaryContentFontSize, setSecondaryContentFontSize] =
    useState("text-[10px]");

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && !user && !isLoading) {
      initializedRef.current = true;
      const { initialize } = useAuthStore.getState();
      initialize();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading && user) {
      window.location.href = "/login";
      return;
    }
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    const shouldShowDialog = profile && !profile.status;
    if (shouldShowDialog) {
      const timer = setTimeout(() => {
        setShowInactiveDialog(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  useEffect(() => {
    // Verificar se admin precisa configurar senha
    if (isAdmin && profile && !profile.admin_2fa_enabled) {
      console.log("⚠️ [AgentPerfil] Admin precisa configurar senha");
    }
  }, [isAdmin, profile]);

  useEffect(() => {
    const handleResize = () => {
      setLabelFontSize(getLabelFontSize());
      setContentFontSize(getContentFontSize());
      setSecondaryContentFontSize(getSecondaryContentFontSize());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!profile || !isAuthenticated) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-white/20"
          >
            <RiErrorWarningLine className="w-14 h-14 text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-3 font-roboto">
              Acesso Não Autorizado
            </h2>
            <p className="text-slate-600 text-base mb-6 font-roboto">
              Faça login para acessar seu perfil.
            </p>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-navy hover:bg-navy-700 text-white py-3 text-base font-semibold font-roboto transition-all duration-300 hover:scale-105 w-full"
              size="lg"
            >
              Ir para Login
            </Button>
          </motion.div>
        </div>
      </BaseLayout>
    );
  }

  const certificationInfo = getCertificationInfo(profile);
  const labelClass = `${labelFontSize} font-medium text-slate-500 uppercase tracking-wide block font-roboto mb-1`;
  const mainContentClass = `${contentFontSize} font-bold text-slate-800 leading-tight font-roboto text-center break-words px-1 uppercase`;
  const secondaryContentClass = `${secondaryContentFontSize} font-bold text-slate-800 font-mono text-center tracking-wide break-all px-1`;

  const graduationClass = `${contentFontSize} font-bold text-error font-roboto break-words text-center leading-tight uppercase`;
  const bloodTypeClass = `${contentFontSize} font-bold text-error font-roboto text-center leading-tight uppercase`;

  const certificationClass = `${secondaryContentFontSize} font-bold font-roboto ${certificationInfo.className} text-center leading-tight`;

  const handleOpenAdminAuth = () => {
    console.log("🔍 [AgentPerfil] Abrindo modal de autenticação admin");
    setShowAdminAuthModal(true);
  };

  const handleSetupPassword = () => {
    console.log("🔍 [AgentPerfil] Redirecionando para configuração de senha");
    router.push("/admin/setup-password");
  };

  return (
    <BaseLayout>
      <InactiveAgentDialog
        isOpen={showInactiveDialog}
        onClose={() => setShowInactiveDialog(false)}
      />

      <AdminAuthModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
      />

      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative z-20">
        <div className="w-full max-w-xs min-[375px]:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <Card className="relative bg-white rounded-xl shadow-sm overflow-hidden w-full border border-slate-200 mx-auto">
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center pb-2 border-b border-slate-200 mb-3 space-y-1.5"
                >
                  <motion.div whileHover={{ scale: 1.05 }} className="mt-1">
                    <div className="w-16 h-16 min-[375px]:w-20 min-[375px]:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center">
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/logos/logo.webp"
                          alt="Patrulha Aérea Civil"
                          width={128}
                          height={128}
                          className="w-full h-full object-contain"
                          priority={true}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <div className="text-center -mt-1">
                    <h1 className="text-navy text-sm min-[375px]:text-base sm:text-lg md:text-xl font-bold tracking-wide uppercase leading-tight font-roboto">
                      Patrulha Aérea Civil
                    </h1>
                    <p className="text-slate-600 text-[6px] min-[375px]:text-[7px] sm:text-[8px] md:text-[10px] leading-snug font-roboto">
                      COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
                    </p>
                  </div>

                  <div className="text-center">
                    <h2
                      className={`${labelFontSize} font-bold text-slate-700 tracking-wide uppercase font-roboto mb-1`}
                    >
                      Identificação
                    </h2>
                    <div className="flex justify-center">
                      <div className="w-6 h-4 min-[375px]:w-7 min-[375px]:h-5 sm:w-8 sm:h-6 border border-slate-300 rounded overflow-hidden">
                        <Image
                          src="/images/logos/flag-br.webp"
                          alt="Bandeira do Brasil"
                          width={32}
                          height={24}
                          className="w-full h-full object-cover"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="mb-3 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                  <label className={labelClass}>Nome</label>
                  <p className={mainContentClass}>
                    {profile.full_name || "NÃO DEFINIDO"}
                  </p>
                </div>

                <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3 mb-3 items-stretch">
                  <div className="flex flex-col space-y-2">
                    <div className="border border-slate-200 rounded-lg p-2 bg-white flex-1">
                      <label className={labelClass}>Graduação</label>
                      <div className="h-[calc(100%-1.25rem)] flex items-center justify-center">
                        <p className={graduationClass}>
                          {profile.graduacao
                            ? `${profile.graduacao.toUpperCase()}`
                            : "GRADUAÇÃO NÃO DEFINIDA - PAC"}
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-2 bg-white flex-1">
                      <label className={labelClass}>Tipo Sanguíneo</label>
                      <div className="h-[calc(100%-1.25rem)] flex items-center justify-center">
                        <p className={bloodTypeClass}>
                          {profile.tipo_sanguineo || "NÃO DEFINIDO"}
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-2 bg-white flex-1">
                      <label className={labelClass}>Validade</label>
                      <div className="h-[calc(100%-1.25rem)] flex flex-col justify-center items-center">
                        <p className={certificationClass}>
                          {certificationInfo.text}
                        </p>
                        {!profile.status && (
                          <p
                            className={`${labelFontSize} text-error mt-0.5 font-roboto text-center`}
                          >
                            ⚠️ Agente inativo - certificação cancelada
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center w-full">
                    <div className="w-full aspect-[3/4] rounded-md overflow-hidden relative border border-slate-300">
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="Foto de perfil"
                          fill
                          className="object-cover"
                          sizes="(max-width: 374px) 280px, (max-width: 375px) 150px, (max-width: 640px) 200px, (max-width: 768px) 250px, 300px"
                          priority={true}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                          <RiUserLine className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 sm:w-18 sm:h-18 md:w-22 md:h-22" />
                          <span className="text-sm min-[375px]:text-base sm:text-lg font-roboto mt-2">
                            Sem foto
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                  <label className={labelClass}>Matrícula</label>
                  <p className={secondaryContentClass}>
                    {formatMatricula(profile.matricula)} RJ
                  </p>
                </div>

                <div className="mb-3">
                  <label
                    className={`${labelFontSize} font-medium text-slate-500 uppercase tracking-wide block font-roboto mb-1.5 text-center`}
                  >
                    Situação do Patrulheiro
                  </label>
                  <div className="flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-xs"
                    >
                      <div
                        className={`
                          ${secondaryContentFontSize}
                          py-2 min-[375px]:py-2.5 sm:py-3 md:py-4
                          font-bold rounded-lg
                          w-full
                          transition-all duration-300 cursor-default
                          text-center font-roboto
                          ${
                            profile.status
                              ? "bg-gradient-to-r from-success to-success-600 text-white"
                              : "bg-gradient-to-r from-error to-error-600 text-white"
                          }
                        `}
                      >
                        <div className="flex items-center justify-center space-x-1 min-[375px]:space-x-1.5 sm:space-x-2">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={profile.status ? "active" : "inactive"}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {profile.status ? (
                                <RiCheckboxCircleLine className="w-4 h-4 min-[375px]:w-5 min-[375px]:h-5 sm:w-6 sm:h-6" />
                              ) : (
                                <RiForbidLine className="w-4 h-4 min-[375px]:w-5 min-[375px]:h-5 sm:w-6 sm:h-6" />
                              )}
                            </motion.div>
                          </AnimatePresence>
                          <span
                            className={`${contentFontSize} font-black tracking-wider uppercase font-roboto`}
                          >
                            {profile.status ? "ATIVO" : "INATIVO"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  {!profile.status ? (
                    <p
                      className={`${labelFontSize} text-error mt-1.5 text-center font-roboto font-semibold px-1`}
                    >
                      AGENTE INATIVO - ACESSO LIMITADO AO SISTEMA
                    </p>
                  ) : isAdmin ? (
                    <p
                      className={`${labelFontSize} ${
                        profile.admin_2fa_enabled ? "text-navy" : "text-warning"
                      } mt-1.5 text-center font-roboto font-semibold px-1`}
                    >
                      {profile.admin_2fa_enabled
                        ? "ADMINISTRADOR - ACESSO COMPLETO AO SISTEMA"
                        : "ADMINISTRADOR - CONFIGURE A SENHA ADMINISTRATIVA"}
                    </p>
                  ) : (
                    <p
                      className={`${labelFontSize} text-success mt-1.5 text-center font-roboto font-semibold px-1`}
                    >
                      AGENTE ATIVO - ACESSO AO PERFIL
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <ActionButtons
            profile={profile}
            isAdmin={isAdmin}
            onSignOut={logout}
            onOpenAdminAuth={handleOpenAdminAuth}
            onSetupPassword={handleSetupPassword}
          />
        </div>
      </div>
    </BaseLayout>
  );
}
