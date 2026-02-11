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
  RiHomeLine,
  RiLogoutBoxLine,
  RiAlertLine,
  RiShieldStarLine,
  RiSettings3Line,
  RiCheckboxCircleLine,
  RiForbidLine,
} from "react-icons/ri";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";
import { AdminAuthModal } from "@/components/admin/AdminAuthModal";

// ========== UTILITÁRIOS (Mantidos iguais) ==========
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "--/--/--";
  try {
    return new Date(dateString).toLocaleDateString("pt-BR");
  } catch {
    return "Inválida";
  }
};

const formatMatricula = (mat?: string | null) => {
  if (!mat) return "NÃO DEF.";
  const nums = mat.replace(/\D/g, "");
  let formatted = mat.toUpperCase();
  if (nums.length === 11) {
    formatted = nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return formatted;
};

// ========== SUB-COMPONENTES (Mantidos iguais) ==========
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
        <div className="flex justify-center mb-2">
          <div className="bg-red-50 p-2 rounded-full">
            <RiAlertLine className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <DialogTitle className="text-center text-red-600 font-bold uppercase tracking-tight text-sm">
          AGENTE NÃO VINCULADO
        </DialogTitle>
        <DialogDescription className="text-center text-slate-600 text-xs">
          Situação irregular detectada.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-1">
        <div className="bg-red-50 p-2 rounded-lg border border-red-100 text-center">
          <p className="text-[10px] text-slate-700">
            <strong className="text-red-600 block mb-0.5 uppercase text-[10px]">
              DEVOLUÇÃO OBRIGATÓRIA
            </strong>
            Entregue sua credencial ao comando.
          </p>
        </div>
      </div>
      <Button
        onClick={onClose}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-10 rounded-lg text-xs"
      >
        CIENTE
      </Button>
    </DialogContent>
  </Dialog>
);

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
    <div className="p-3 bg-white rounded-full shadow-lg">
      <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
    </div>
    <p className="text-slate-500 text-xs font-medium animate-pulse">
      Carregando...
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
    <div className="min-h-[100dvh] bg-slate-100/50 relative overflow-hidden flex items-center justify-center p-2 sm:p-4 font-sans">
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        // Largura máxima aumenta em telas grandes para dar espaço à altura
        className="w-full max-w-[340px] sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl relative z-10"
      >
        <Card className="border-slate-200 shadow-xl bg-white overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[2rem]">
          {/* --- HEADER --- */}
          <div className="bg-white border-b border-slate-100 py-3 sm:py-4 md:py-6 px-4 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-50/50 opacity-30 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-1 sm:mb-2">
                <Image
                  src="/images/logos/logo.webp"
                  alt="PAC Logo"
                  width={0}
                  height={0}
                  sizes="100px"
                  className="w-10 sm:w-14 md:w-20 h-auto object-contain"
                  priority
                />
                <div className="text-left">
                  <h1 className="text-pac-primary font-black text-sm sm:text-lg md:text-2xl lg:text-3xl uppercase tracking-tighter leading-none">
                    Patrulha Aérea Civil
                  </h1>
                  <span className="text-[7px] sm:text-[10px] md:text-sm font-bold text-slate-500 tracking-wide uppercase leading-none block mt-0.5 sm:mt-1">
                    Comando Operacional no Estado do Rio de Janeiro{" "}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1 bg-slate-50 px-3 py-0.5 sm:py-1 sm:px-4 rounded-full border border-slate-100">
                <span className="text-[8px] sm:text-[10px] md:text-xs font-black text-pac-primary uppercase tracking-widest">
                  Identificação
                </span>
                <Image
                  src="/images/logos/flag-br.webp"
                  alt="BR"
                  width={24}
                  height={16}
                  className="w-4 sm:w-5 md:w-6 h-auto rounded-[1px]"
                />
              </div>
            </div>
          </div>

          {/* --- CONTEÚDO --- */}
          <CardContent className="p-3 sm:p-5 md:p-8 lg:p-10 bg-white space-y-3 sm:space-y-5 md:space-y-6">
            {/* 1. NOME E MATRÍCULA */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[8px] sm:text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">
                  Nome Completo
                </label>
                <div className="p-2 sm:p-3 md:p-4 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-100 shadow-sm text-center">
                  <p className="text-sm sm:text-lg md:text-2xl font-black text-slate-800 uppercase leading-tight truncate">
                    {user.full_name || "PENDENTE"}
                  </p>
                </div>
              </div>

              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[8px] sm:text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">
                  Matrícula
                </label>
                <div className="p-1.5 sm:p-3 md:p-4 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-100 shadow-sm text-center">
                  <p className="font-mono text-sm sm:text-xl md:text-3xl font-black text-slate-800 tracking-widest leading-none">
                    {formatMatricula(user.matricula)}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. GRID DADOS + FOTO */}
            {/* MANTIDA A PROPORÇÃO: gap aumenta, mas as colunas são iguais */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-8 lg:gap-10 items-stretch h-auto">
              {/* Lado Esquerdo: Dados */}
              <div className="flex flex-col gap-2 sm:gap-4 md:gap-5 lg:gap-6 justify-between h-full">
                {/* Graduação */}
                <div className="space-y-0.5 sm:space-y-1 flex-1">
                  <label className="text-[8px] sm:text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-wide ml-1 truncate">
                    Graduação
                  </label>
                  <div className="h-full flex items-center justify-center p-1.5 sm:p-3 md:p-5 lg:p-8 xl:p-10 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl shadow-sm text-center">
                    <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-red-600 uppercase leading-none">
                      {user.graduacao || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Fator RH */}
                <div className="space-y-0.5 sm:space-y-1 flex-1">
                  <label className="text-[8px] sm:text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-wide ml-1 truncate">
                    Fator RH
                  </label>
                  <div className="h-full flex items-center justify-center p-1.5 sm:p-3 md:p-5 lg:p-8 xl:p-10 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl shadow-sm text-center">
                    <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-red-600 uppercase leading-none">
                      {user.tipo_sanguineo || "--"}
                    </span>
                  </div>
                </div>

                {/* Validade */}
                <div className="space-y-0.5 sm:space-y-1 flex-1">
                  <label className="text-[8px] sm:text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-wide ml-1 truncate">
                    Validade
                  </label>
                  <div className="h-full flex items-center justify-center p-1.5 sm:p-3 md:p-5 lg:p-8 xl:p-10 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl shadow-sm text-center">
                    <span
                      className={`text-xs sm:text-base md:text-xl lg:text-2xl font-bold leading-none ${isExpired ? "text-red-600" : "text-emerald-700"}`}
                    >
                      {formatDate(user.validade_certificacao)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Foto */}
              <div className="relative mt-3.5 w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt="Agente"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 400px, 500px"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300 bg-slate-50">
                    <RiUserLine className="w-12 h-12 sm:w-20 sm:h-20 md:w-32 md:h-32 lg:w-40 lg:h-40" />
                  </div>
                )}
              </div>
            </div>

            {/* 3. UNIDADE */}
            <div className="space-y-0.5 mt-2 sm:mt-4 md:mt-6">
              <label className="text-[8px] sm:text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">
                Unidade
              </label>
              <div className="p-2 sm:p-3 md:p-5 bg-white border border-slate-100 rounded-lg sm:rounded-xl shadow-sm text-center md:text-left">
                <span className="text-xs sm:text-base md:text-xl font-bold text-slate-800 uppercase tracking-wide leading-tight">
                  {user.unidade || "Sede Administrativa"}
                </span>
              </div>
            </div>

            {/* 4. STATUS */}
            <div className="space-y-1 sm:space-y-2 md:space-y-3 pt-1 sm:pt-2 md:pt-4">
              <div
                className={`w-full py-2 sm:py-3 md:py-4 lg:py-6 rounded-lg sm:rounded-xl text-center border shadow-sm ${
                  user.status
                    ? "bg-emerald-600 border-emerald-700 text-white"
                    : "bg-red-600 border-red-700 text-white"
                }`}
              >
                <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
                  {user.status ? (
                    <>
                      <RiCheckboxCircleLine className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />{" "}
                      ATIVO
                    </>
                  ) : (
                    <>
                      <RiForbidLine className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />{" "}
                      INATIVO
                    </>
                  )}
                </h2>
              </div>
            </div>

            {/* --- Ações (Rodapé) --- */}
            <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 pt-3 sm:pt-4 md:pt-6 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 border-t border-slate-100">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 sm:h-10 md:h-12 lg:h-14 text-[10px] sm:text-xs md:text-sm font-bold uppercase border-slate-200 text-slate-600 rounded-lg sm:rounded-xl"
              >
                <Link href="/">
                  <RiHomeLine className="mr-1 sm:mr-1.5 md:mr-2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />{" "}
                  Site
                </Link>
              </Button>

              {isAdmin && (
                <div className="flex gap-1 sm:gap-2 md:gap-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!user.admin_2fa_enabled)
                        router.push("/admin/setup-password");
                      else if (hasAdminSession) router.push("/admin/dashboard");
                      else setShowAdminAuth(true);
                    }}
                    className={`flex-1 h-9 sm:h-10 md:h-12 lg:h-14 text-[10px] sm:text-xs md:text-sm font-bold uppercase text-white shadow-sm rounded-lg sm:rounded-xl ${
                      !user.admin_2fa_enabled ? "bg-amber-600" : "bg-slate-900"
                    }`}
                  >
                    {!user.admin_2fa_enabled ? "Config" : "Admin"}
                  </Button>

                  {user.admin_2fa_enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/admin/setup-password")}
                      className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 p-0 rounded-lg sm:rounded-xl border-slate-200 text-slate-600"
                    >
                      <RiSettings3Line className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                    </Button>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="col-span-2 h-8 sm:h-9 md:h-10 lg:h-12 text-[10px] sm:text-xs md:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 rounded-lg sm:rounded-xl"
              >
                <RiLogoutBoxLine className="mr-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />{" "}
                Encerrar Sessão
              </Button>
            </div>
          </CardContent>

          <div className="bg-slate-50 border-t border-slate-200 p-2 sm:p-3 md:p-4 text-center">
            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1 opacity-70">
              <RiShieldStarLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />{" "}
              Oficial
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
