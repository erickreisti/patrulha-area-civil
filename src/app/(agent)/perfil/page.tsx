"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
} from "react-icons/ri";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types";

type ProfileData = UserProfile;

interface CertificationInfo {
  text: string;
  className: string;
  iconColor: string;
  badgeVariant: "default" | "secondary" | "destructive";
}

const InactiveAgentDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto bg-white border-2 border-alert/20 shadow-2xl rounded-xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[85vh] overflow-y-auto">
      <div className="absolute right-3 top-3 opacity-0 pointer-events-none">
        <div className="w-4 h-4" />
      </div>

      <DialogHeader className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-alert/10 p-2.5 rounded-full">
            <RiAlertLine className="w-6 h-6 text-alert" />
          </div>
        </div>
        <DialogTitle className="text-center text-lg font-bold text-alert font-bebas leading-tight">
          AGENTE NÃO VINCULADO À PAC
        </DialogTitle>
        <DialogDescription className="text-center text-slate-700 mt-1 text-sm font-roboto">
          Situação de credencial irregular detectada
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 px-4 py-2">
        <div className="bg-alert/5 border border-alert/20 rounded-lg p-3">
          <p className="text-xs text-slate-800 font-medium text-center font-roboto leading-relaxed">
            <strong className="text-alert">ATENÇÃO:</strong> Você não está mais
            vinculado à <strong>Patrulha Aérea Civil</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-700 font-roboto text-center leading-relaxed">
            <strong className="text-alert">
              DEVOLUÇÃO IMEDIATA OBRIGATÓRIA:
            </strong>{" "}
            Você deve entregar imediatamente sua credencial aos responsáveis.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
            <p className="text-[11px] text-slate-600 text-center font-roboto leading-relaxed">
              <strong className="text-alert">PUNIÇÕES LEGAIS:</strong> A
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
          className="bg-alert hover:bg-alert/90 text-white font-semibold py-2.5 px-6 text-sm transition-all duration-300 hover:scale-105 font-roboto w-full max-w-[280px]"
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

const ActionButton: React.FC<{
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}> = ({ href, icon: Icon, label, onClick }) => {
  const buttonContent = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer bg-navy/90 hover:bg-navy w-full min-h-[44px]"
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-white flex-shrink-0" />}
      <span className="text-xs font-medium text-white whitespace-nowrap">
        {label}
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="w-full">
        {buttonContent}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="w-full">
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
}) => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      window.location.href = "/login";
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="flex flex-col items-center gap-3 mt-4 px-2 w-full max-w-lg mx-auto"
    >
      <div className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-2 w-full">
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

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer bg-red-600/90 hover:bg-red-700 w-full min-h-[44px]"
        >
          <RiLogoutBoxLine className="w-3.5 h-3.5 text-white flex-shrink-0" />
          <span className="text-xs font-medium text-white whitespace-nowrap">
            {isSigningOut ? "Saindo..." : "Sair"}
          </span>
        </motion.div>
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
      </motion.div>
    </motion.div>
  );
};

// Componente principal com layout de duas colunas a partir de 375px
export default function AgentPerfil() {
  const { profile, loading, signOut, isAdmin } = useAuth();
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);

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
    if (!loading && !profile) {
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [profile, loading]);

  if (loading) return <LoadingState />;

  if (!profile) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-white/20"
          >
            <RiErrorWarningLine className="w-14 h-14 text-alert mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-3 font-bebas">
              Perfil Não Encontrado
            </h2>
            <p className="text-slate-600 text-base mb-6 font-roboto">
              Não foi possível carregar seu perfil.
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

  return (
    <BaseLayout>
      <InactiveAgentDialog
        isOpen={showInactiveDialog}
        onClose={() => setShowInactiveDialog(false)}
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
                {/* HEADER - Compacto, logo mais próxima do topo */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center pb-2 border-b border-slate-200 mb-3 space-y-1.5"
                >
                  {/* Logo ainda maior */}
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
                    <h1 className="text-navy text-sm min-[375px]:text-base sm:text-lg md:text-xl font-bold tracking-wide uppercase leading-tight font-bebas">
                      Patrulha Aérea Civil
                    </h1>
                    <p className="text-slate-600 text-[8px] min-[375px]:text-[9px] sm:text-[10px] md:text-xs leading-snug font-roboto">
                      COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
                    </p>
                  </div>

                  {/* Bandeira centralizada */}
                  <div className="text-center">
                    <h2 className="text-[8px] min-[375px]:text-[9px] sm:text-[10px] font-bold text-slate-700 tracking-wide uppercase font-bebas mb-1">
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

                {/* NOME COMPLETO */}
                <div className="mb-3 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                  <label className="text-[10px] min-[375px]:text-xs font-medium text-slate-500 uppercase tracking-wide block font-roboto mb-1">
                    Nome
                  </label>
                  <p className="text-sm min-[375px]:text-base sm:text-lg font-bold text-slate-900 leading-tight font-bebas text-center break-words px-1">
                    {profile.full_name || "NÃO DEFINIDO"}
                  </p>
                </div>
                {/* DUAS COLUNAS A PARTIR DE 375px - AMBAS COM MESMA ALTURA */}
                <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3 mb-3 items-stretch">
                  {/* Coluna da Esquerda - OCUPA MESMA ALTURA DA FOTO */}
                  <div className="flex flex-col space-y-2">
                    {/* Graduação - 1/3 da altura total */}
                    <div className="border border-slate-200 rounded-lg p-2 bg-white flex-1">
                      <label className="text-[10px] min-[375px]:text-xs font-medium text-slate-500 uppercase tracking-wide block font-roboto mb-0.5">
                        Graduação
                      </label>
                      <div className="h-[calc(100%-1.25rem)] flex items-center justify-center">
                        <p className="text-xs min-[375px]:text-sm sm:text-base font-bold text-alert font-bebas break-words text-center leading-tight">
                          {profile.graduacao
                            ? `${profile.graduacao.toUpperCase()}`
                            : "GRADUAÇÃO NÃO DEFINIDA - PAC"}
                        </p>
                      </div>
                    </div>

                    {/* Tipo Sanguíneo - 1/3 da altura total */}
                    <div className="border border-slate-200 rounded-lg p-2 bg-white flex-1">
                      <label className="text-[10px] min-[375px]:text-xs font-medium text-slate-500 uppercase tracking-wide block font-roboto mb-0.5">
                        Tipo Sanguíneo
                      </label>
                      <div className="h-[calc(100%-1.25rem)] flex items-center justify-center">
                        <p className="text-xs min-[375px]:text-sm sm:text-base font-bold text-alert font-bebas text-center leading-tight">
                          {profile.tipo_sanguineo || "NÃO DEFINIDO"}
                        </p>
                      </div>
                    </div>

                    {/* Validade - 1/3 da altura total */}
                    <div className="border border-slate-200 rounded-lg p-2 bg-white flex-1">
                      <label className="text-[10px] min-[375px]:text-xs font-medium text-slate-500 uppercase tracking-wide block font-roboto mb-0.5">
                        Validade
                      </label>
                      <div className="h-[calc(100%-1.25rem)] flex flex-col justify-center items-center">
                        <p
                          className={`text-xs min-[375px]:text-sm sm:text-base font-bold text-slate-900 font-roboto ${certificationInfo.className} text-center leading-tight`}
                        >
                          {certificationInfo.text}
                        </p>
                        {!profile.status && (
                          <p className="text-[8px] min-[375px]:text-[9px] text-alert mt-0.5 font-roboto text-center">
                            ⚠️ Agente inativo - certificação cancelada
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Coluna da Direita - Foto (com aspect-ratio) */}
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
                          <span className="text-sm font-roboto mt-2">
                            Sem foto
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MATRÍCULA */}
                <div className="mb-3 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                  <label className="text-[10px] min-[375px]:text-xs font-medium text-slate-500 uppercase tracking-wide block font-roboto mb-0.5">
                    Matrícula
                  </label>
                  <p className="text-xs min-[375px]:text-sm sm:text-base font-bold text-slate-900 font-mono text-center tracking-wide break-all px-1">
                    {formatMatricula(profile.matricula)} RJ
                  </p>
                </div>

                {/* SITUAÇÃO DO PATRULHEIRO */}
                <div className="mb-3">
                  <label className="text-[10px] min-[375px]:text-xs font-medium text-slate-500 uppercase tracking-wide block font-roboto mb-1.5 text-center">
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
                          text-xs min-[375px]:text-sm
                          py-2 min-[375px]:py-2.5
                          font-bold rounded-lg
                          w-full
                          transition-all duration-300 cursor-default
                          text-center font-bebas
                          ${
                            profile.status
                              ? "bg-gradient-to-r from-success to-success-600 text-white"
                              : "bg-gradient-to-r from-alert to-alert-600 text-white"
                          }
                        `}
                      >
                        <div className="flex items-center justify-center space-x-1 min-[375px]:space-x-1.5">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={profile.status ? "active" : "inactive"}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {profile.status ? (
                                <RiCheckboxCircleLine className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4" />
                              ) : (
                                <RiForbidLine className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4" />
                              )}
                            </motion.div>
                          </AnimatePresence>
                          <span className="text-xs min-[375px]:text-sm sm:text-base font-black tracking-wider">
                            {profile.status ? "ATIVO" : "INATIVO"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  {!profile.status ? (
                    <p className="text-[10px] min-[375px]:text-xs text-alert mt-1.5 text-center font-roboto font-semibold px-1">
                      AGENTE INATIVO - ACESSO LIMITADO AO SISTEMA
                    </p>
                  ) : (
                    <p className="text-[10px] min-[375px]:text-xs text-success mt-1.5 text-center font-roboto font-semibold px-1">
                      AGENTE ATIVO - ACESSO COMPLETO AO SISTEMA
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* BOTÕES DE AÇÃO */}
          <ActionButtons
            profile={profile}
            isAdmin={isAdmin}
            onSignOut={signOut}
          />
        </div>
      </div>
    </BaseLayout>
  );
}
