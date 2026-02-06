"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
import {
  RiUserLine,
  RiCheckboxCircleLine,
  RiForbidLine,
  RiHomeLine,
  RiLogoutBoxLine,
  RiWhatsappLine,
  RiAlertLine,
  RiCalendarLine,
  RiShieldStarLine,
  RiSettings3Line,
} from "react-icons/ri";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";
import { AdminAuthModal } from "@/components/admin/AdminAuthModal";

// ========== UTILITÁRIOS ==========

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Não definida";
  try {
    return new Date(dateString).toLocaleDateString("pt-BR");
  } catch {
    return "Data inválida";
  }
};

const formatMatricula = (mat?: string | null) => {
  if (!mat) return "NÃO DEFINIDA";
  const nums = mat.replace(/\D/g, "");
  let formatted = mat.toUpperCase();
  if (nums.length === 11) {
    formatted = nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return formatted;
};

// ========== SUB-COMPONENTES ==========

const InactiveDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-md bg-white border-2 border-red-100 w-[90%] rounded-xl">
      <DialogHeader>
        <div className="flex justify-center mb-4">
          <div className="bg-red-50 p-3 rounded-full">
            <RiAlertLine className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <DialogTitle className="text-center text-red-600 font-bold uppercase tracking-tight">
          AGENTE NÃO VINCULADO
        </DialogTitle>
        <DialogDescription className="text-center text-slate-600">
          Situação de credencial irregular detectada.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
          <p className="text-xs text-slate-700">
            <strong className="text-red-600 block mb-1 uppercase text-xs">
              DEVOLUÇÃO OBRIGATÓRIA
            </strong>
            Por favor, entregue sua credencial imediatamente ao comando
            operacional.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
          <RiWhatsappLine className="text-green-600" /> (21) 99999-9999
        </div>
      </div>

      <Button
        onClick={onClose}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-lg"
      >
        CIENTE
      </Button>
    </DialogContent>
  </Dialog>
);

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
    <div className="p-4 bg-white rounded-full shadow-lg">
      <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
    </div>
    <p className="text-slate-500 text-sm font-medium animate-pulse">
      Carregando perfil...
    </p>
  </div>
);

// ========== COMPONENTE PRINCIPAL ==========

export default function AgentPerfil() {
  const router = useRouter();
  const {
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    hasAdminSession,
    logout,
  } = useAuthStore();

  const [showInactive, setShowInactive] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

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

    if (profile && !profile.status && !showInactive && !hasAcknowledged) {
      const timer = setTimeout(() => setShowInactive(true), 500);
      return () => clearTimeout(timer);
    }
  }, [
    isAuthenticated,
    isLoading,
    profile,
    router,
    showInactive,
    hasAcknowledged,
  ]);

  if (isLoading) return <LoadingScreen />;

  if (!profile) return null;

  const user = profile as Profile;

  const isExpired = user.validade_certificacao
    ? new Date(user.validade_certificacao) < new Date()
    : false;

  return (
    <div className="min-h-screen bg-slate-100/50 relative overflow-hidden flex items-center justify-center p-2 sm:p-8 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-70 pointer-events-none" />

      <InactiveDialog
        isOpen={showInactive}
        onClose={() => {
          setShowInactive(false);
          setHasAcknowledged(true);
        }}
      />
      <AdminAuthModal
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <Card className="border-slate-200 shadow-2xl bg-white overflow-hidden rounded-2xl sm:rounded-3xl">
          {/* --- HEADER INSTITUCIONAL --- */}
          <div className="bg-white border-b border-slate-100 py-6 px-4 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-50/50 opacity-30 pointer-events-none" />

            <div className="mb-3 sm:mb-5 relative z-10 filter drop-shadow-md">
              <Image
                src="/images/logos/logo.webp"
                alt="PAC Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="w-16 h-auto sm:w-[120px] object-contain"
                priority
              />
            </div>

            <h1 className="text-slate-900 font-black text-xl sm:text-3xl uppercase tracking-tighter leading-none relative z-10 mb-1">
              Patrulha Aérea Civil
            </h1>

            <div className="relative z-10">
              <span className="text-[10px] sm:text-sm font-bold text-slate-500 tracking-[0.15em] uppercase">
                Comando Operacional do Rio de Janeiro
              </span>
            </div>
          </div>

          <CardContent className="p-4 sm:p-10 bg-white">
            <div className="flex flex-row items-start gap-3 sm:gap-8">
              {/* === COLUNA ESQUERDA: FOTO (35%) === */}
              <div className="w-[35%] sm:w-[30%] flex flex-col items-center flex-shrink-0">
                <div className="relative w-full aspect-[3/4] rounded-lg sm:rounded-2xl overflow-hidden border-[3px] sm:border-[4px] border-slate-100 shadow-lg bg-slate-50 mb-2 sm:mb-4 group ring-1 ring-slate-200">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Agente"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 35vw, 300px"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <RiUserLine className="w-12 h-12 sm:w-28 sm:h-28" />
                    </div>
                  )}
                  {/* Status Overlay */}
                  <div
                    className={`absolute bottom-0 inset-x-0 py-1 sm:py-2.5 text-center text-[10px] sm:text-sm font-black text-white uppercase tracking-widest backdrop-blur-md ${
                      user.status ? "bg-emerald-600/90" : "bg-red-600/90"
                    }`}
                  >
                    {user.status ? "Ativo" : "Inativo"}
                  </div>
                </div>

                <div className="w-full hidden sm:block">
                  <div
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold uppercase tracking-wide shadow-sm ${
                      user.status
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-red-50 border-red-100 text-red-700"
                    }`}
                  >
                    {user.status ? (
                      <RiCheckboxCircleLine className="w-5 h-5" />
                    ) : (
                      <RiForbidLine className="w-5 h-5" />
                    )}
                    {user.status ? "Válida" : "Restrição"}
                  </div>
                </div>
              </div>

              {/* === COLUNA DIREITA: DADOS (65%) === */}
              <div className="flex-1 min-w-0 space-y-3 sm:space-y-5">
                {/* 1. NOME COMPLETO */}
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">
                    Nome Completo
                  </label>
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm sm:text-2xl font-black text-slate-800 uppercase leading-snug break-words">
                      {user.full_name || "PENDENTE DE CADASTRO"}
                    </p>
                  </div>
                </div>

                {/* 2. MATRÍCULA (Destaque) */}
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">
                    Matrícula
                  </label>
                  <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl font-mono text-lg sm:text-2xl font-black text-slate-900 shadow-sm flex items-center justify-center tracking-wider">
                    {formatMatricula(user.matricula)}
                  </div>
                </div>

                {/* 3. GRID DUPLO: GRADUAÇÃO e SANGUE */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  {/* Graduação */}
                  <div className="space-y-0.5 sm:space-y-1.5">
                    <label className="text-[9px] sm:text-xs uppercase font-bold text-slate-400 tracking-wide ml-1">
                      Graduação
                    </label>
                    <div className="p-2 sm:p-3.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-lg font-black text-red-600 uppercase shadow-sm flex items-center justify-center text-center tracking-tight leading-tight">
                      {user.graduacao || "NÃO DEFINIDA"}
                    </div>
                  </div>

                  {/* Tipo Sanguíneo */}
                  <div className="space-y-0.5 sm:space-y-1.5">
                    <label className="text-[9px] sm:text-xs uppercase font-bold text-slate-400 tracking-wide ml-1">
                      Sangue
                    </label>
                    <div className="p-2 sm:p-3.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-lg font-bold text-red-600 text-center shadow-sm flex items-center justify-center">
                      {user.tipo_sanguineo || "--"}
                    </div>
                  </div>
                </div>

                {/* 4. VALIDADE */}
                <div className="space-y-0.5 sm:space-y-1.5">
                  <label className="text-[9px] sm:text-xs uppercase font-bold text-slate-400 tracking-wide ml-1">
                    Validade
                  </label>
                  <div
                    className={`p-2 sm:p-3 border rounded-lg sm:rounded-xl text-xs sm:text-base font-bold flex items-center justify-center gap-1.5 shadow-sm ${
                      isExpired
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-white border-slate-200 text-emerald-600"
                    }`}
                  >
                    <RiCalendarLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {formatDate(user.validade_certificacao)}
                  </div>
                </div>
              </div>
            </div>

            {/* --- Ações (Rodapé do Card) --- */}
            <div className="mt-6 pt-4 grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 border-t border-slate-100">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-10 sm:h-12 text-[10px] sm:text-sm font-bold uppercase tracking-wide border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg sm:rounded-xl"
              >
                <Link href="/">
                  <RiHomeLine className="mr-1.5 w-4 h-4" /> Site
                </Link>
              </Button>

              {isAdmin && (
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!user.admin_2fa_enabled)
                        router.push("/admin/setup-password");
                      else if (hasAdminSession) router.push("/admin/dashboard");
                      else setShowAdminAuth(true);
                    }}
                    className={`flex-1 h-10 sm:h-12 text-[10px] sm:text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all rounded-lg sm:rounded-xl ${
                      !user.admin_2fa_enabled
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    <RiShieldStarLine className="mr-1.5 w-4 h-4" />
                    {!user.admin_2fa_enabled ? "Configurar" : "Admin"}
                  </Button>

                  {user.admin_2fa_enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/admin/setup-password")}
                      className="h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-lg sm:rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600"
                    >
                      <RiSettings3Line className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="col-span-2 h-8 sm:h-10 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <RiLogoutBoxLine className="mr-1.5 w-3.5 h-3.5" /> Sair
              </Button>
            </div>
          </CardContent>

          {/* Footer Card */}
          <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 text-center">
            <p className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 opacity-80">
              <RiShieldStarLine className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Identidade Digital Oficial
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
