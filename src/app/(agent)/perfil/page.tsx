"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
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
import { motion } from "framer-motion";
import {
  RiUserLine,
  RiCheckboxCircleLine,
  RiBarChartLine,
  RiForbidLine,
  RiHomeLine,
  RiLogoutBoxLine,
  RiWhatsappLine,
  RiAlertLine,
  RiCalendarLine,
} from "react-icons/ri";
import type { Profile } from "@/lib/supabase/types";
import { Spinner } from "@/components/ui/spinner";
import { AdminAuthModal } from "@/app/(app)/admin/dashboard/components/layout/AdminAuthModal";

// ========== UTILITÁRIOS ==========

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

const formatMatricula = (
  mat: string | null | undefined,
  uf: string | null | undefined,
): string => {
  if (!mat) return "NÃO DEFINIDA";
  const nums = mat.replace(/\D/g, "");
  let formatted = mat.toUpperCase();
  if (nums.length === 11) {
    formatted = nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return `${formatted} ${uf?.toUpperCase() || "RJ"}`;
};

// ========== SUB-COMPONENTES ==========

const InactiveDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md bg-background-primary border-2 border-pac-alert/30">
      <DialogHeader>
        <div className="flex justify-center mb-4">
          <div className="bg-pac-alert/10 p-3 rounded-full">
            <RiAlertLine className="w-8 h-8 text-pac-alert" />
          </div>
        </div>
        <DialogTitle className="text-center text-pac-alert font-bold">
          AGENTE NÃO VINCULADO
        </DialogTitle>
        <DialogDescription className="text-center">
          Situação de credencial irregular detectada.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="bg-pac-alert/5 p-3 rounded-lg border border-pac-alert/10 text-center">
          <p className="text-xs text-text-secondary">
            <strong className="text-pac-alert block mb-1">
              DEVOLUÇÃO OBRIGATÓRIA
            </strong>
            Por favor, entregue sua credencial imediatamente ao comando
            operacional.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
          <RiWhatsappLine className="text-pac-secondary" /> (21) 99999-9999
        </div>
      </div>

      <Button
        onClick={onClose}
        className="w-full bg-pac-alert hover:bg-pac-alert-dark text-white font-bold"
      >
        CIENTE
      </Button>
    </DialogContent>
  </Dialog>
);

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background-secondary">
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-pac-lg border border-white/20 flex flex-col items-center">
      <Spinner className="w-10 h-10 text-pac-primary mb-4" />
      <p className="text-text-secondary font-medium">Carregando perfil...</p>
    </div>
  </div>
);

// ========== COMPONENTE PRINCIPAL ==========

export default function AgentPerfil() {
  const {
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    hasAdminSession,
    logout,
  } = useAuthStore();
  const router = useRouter();
  const [showInactive, setShowInactive] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && !useAuthStore.getState().user && !isLoading) {
      initialized.current = true;
      useAuthStore.getState().initialize();
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
    // Verifica status e exibe modal apenas uma vez
    if (profile && !profile.status && !showInactive) {
      const timer = setTimeout(() => setShowInactive(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, profile, router, showInactive]);

  if (isLoading) return <LoadingScreen />;

  const user = profile as Profile;
  if (!user) return null;

  const isExpired = user.validade_certificacao
    ? new Date(user.validade_certificacao) < new Date()
    : false;

  return (
    <div className="min-h-screen bg-background-secondary relative overflow-hidden flex items-center justify-center p-4">
      {/* Background FX */}
      <div className="absolute inset-0 bg-grid-pac-primary/[0.03] bg-[size:40px_40px]" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl pointer-events-none" />

      <InactiveDialog
        isOpen={showInactive}
        onClose={() => setShowInactive(false)}
      />
      <AdminAuthModal
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="border-border-light shadow-pac-xl bg-background-primary overflow-hidden">
          {/* Header Institucional */}
          <div className="bg-pac-primary/5 border-b border-border-light p-6 flex flex-col items-center text-center">
            {/* CORREÇÃO AQUI: Tamanho explícito para evitar warning de preload */}
            <div className="mb-3 drop-shadow-md">
              <Image
                src="/images/logos/logo.webp"
                alt="PAC Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-pac-primary font-black text-xl uppercase tracking-tighter leading-none">
              Patrulha Aérea Civil
            </h1>
            <span className="text-[10px] font-bold text-text-tertiary tracking-[0.2em] uppercase mt-1">
              Comando Operacional • RJ
            </span>
          </div>

          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Coluna Esquerda: Foto e Status */}
              <div className="flex flex-col items-center md:w-1/3">
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border-[3px] border-background-primary shadow-pac-md bg-background-secondary mb-4 group">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Agente"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                      // CORREÇÃO: Sizes ajustados para o grid real
                      sizes="(max-width: 768px) 100vw, 200px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-text-muted">
                      <RiUserLine className="w-16 h-16" />
                    </div>
                  )}
                  {/* Status Overlay */}
                  <div
                    className={`absolute bottom-0 inset-x-0 py-1.5 text-center text-[10px] font-black text-white uppercase tracking-widest ${
                      user.status ? "bg-pac-secondary" : "bg-pac-alert"
                    }`}
                  >
                    {user.status ? "Ativo" : "Inativo"}
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <div
                    className={`flex items-center justify-center gap-2 p-2 rounded border text-xs font-bold ${
                      user.status
                        ? "bg-pac-secondary/10 border-pac-secondary/20 text-pac-secondary-dark"
                        : "bg-pac-alert/10 border-pac-alert/20 text-pac-alert-dark"
                    }`}
                  >
                    {user.status ? (
                      <RiCheckboxCircleLine className="w-4 h-4" />
                    ) : (
                      <RiForbidLine className="w-4 h-4" />
                    )}
                    {user.status
                      ? "CREDENCIAIS VÁLIDAS"
                      : "RESTRIÇÃO OPERACIONAL"}
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Dados */}
              <div className="flex-1 space-y-5">
                {/* Bloco Nome */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted tracking-wide">
                    Nome de Guerra / Completo
                  </label>
                  <div className="p-3 bg-background-secondary/50 rounded-lg border border-border-light">
                    <p className="text-lg font-black text-pac-primary uppercase leading-tight">
                      {user.full_name || "PENDENTE DE CADASTRO"}
                    </p>
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-wide">
                      Matrícula
                    </label>
                    <div className="p-2 bg-background-primary border border-border-light rounded font-mono text-sm font-bold text-text-primary">
                      {formatMatricula(user.matricula, user.uf)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-wide">
                      Tipo Sanguíneo
                    </label>
                    <div className="p-2 bg-background-primary border border-border-light rounded text-sm font-bold text-pac-alert text-center">
                      {user.tipo_sanguineo || "--"}
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-wide">
                      Graduação
                    </label>
                    <div className="p-2 bg-background-primary border border-border-light rounded text-sm font-bold text-pac-primary-dark uppercase">
                      {user.graduacao || "NÃO DEFINIDA"}
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-wide">
                      Validade
                    </label>
                    <div
                      className={`p-2 border rounded text-sm font-bold flex items-center justify-center gap-2 ${
                        isExpired
                          ? "bg-pac-alert/5 border-pac-alert/30 text-pac-alert"
                          : "bg-pac-secondary/5 border-pac-secondary/30 text-pac-secondary-dark"
                      }`}
                    >
                      <RiCalendarLine className="w-4 h-4" />
                      {formatDate(user.validade_certificacao)}
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 text-xs font-bold uppercase tracking-wide border-pac-primary text-pac-primary hover:bg-pac-primary/5"
                  >
                    <Link href="/">
                      <RiHomeLine className="mr-2 w-4 h-4" /> Voltar ao Site
                    </Link>
                  </Button>

                  {isAdmin && (
                    <Button
                      onClick={() => {
                        if (!user.admin_2fa_enabled)
                          router.push("/admin/setup-password");
                        else if (hasAdminSession)
                          router.push("/admin/dashboard");
                        else setShowAdminAuth(true);
                      }}
                      className="h-10 text-xs font-bold uppercase tracking-wide bg-pac-primary hover:bg-pac-primary-dark text-white"
                    >
                      <RiBarChartLine className="mr-2 w-4 h-4" /> Painel Admin
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="sm:col-span-2 h-8 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-pac-alert hover:bg-transparent"
                  >
                    <RiLogoutBoxLine className="mr-1 w-3 h-3" /> Encerrar Sessão
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Footer Card */}
          <div className="bg-background-secondary border-t border-border-light p-2 text-center">
            <p className="text-[9px] font-bold text-text-tertiary uppercase opacity-60">
              Documento Digital Oficial • Uso Pessoal e Intransferível
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
