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

// ========== UTILITÁRIOS ==========

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "--/--/--";
  try {
    return new Date(dateString).toLocaleDateString("pt-BR");
  } catch {
    return "Inválida";
  }
};

const formatMatricula = (mat?: string | null) => {
  if (!mat) return "NÃO DEFINIDA";

  // Remove tudo que não for número
  const nums = mat.replace(/\D/g, "");

  // Formato: 355.190.683 - 17
  if (nums.length === 11) {
    return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3 - $4");
  }

  return mat.toUpperCase();
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
        <div className="flex justify-center mb-2">
          <div className="bg-red-50 p-2 rounded-full">
            <RiAlertLine className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <DialogTitle className="text-center text-red-600 font-roboto font-bold uppercase tracking-tight text-sm">
          SITUAÇÃO IRREGULAR
        </DialogTitle>
        <DialogDescription className="text-center text-slate-600 text-xs font-sans">
          Entre em contato com o comando.
        </DialogDescription>
      </DialogHeader>
      <Button
        onClick={onClose}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-roboto font-bold h-10 rounded-lg text-xs"
      >
        CIENTE
      </Button>
    </DialogContent>
  </Dialog>
);

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#1e3a8a] gap-3">
    <div className="p-3 bg-white rounded-full shadow-lg">
      <Loader2 className="w-6 h-6 text-[#1e3a8a] animate-spin" />
    </div>
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

  return (
    <div className="min-h-[100dvh] bg-[#1e3a8a] relative flex items-center justify-center p-2 font-sans">
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] relative z-10"
      >
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[20px]">
          {/* --- HEADER --- */}
          <div className="bg-white pt-3 pb-2 px-4 flex flex-col items-center text-center">
            <div className="mb-2">
              <Image
                src="/images/logos/logo.webp"
                alt="PAC Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-[#1a237e] font-roboto font-bold text-sm uppercase leading-tight tracking-wide mb-0.5">
              Patrulha Aérea Civil
            </h1>
            <span className="text-[9px] font-sans text-slate-500 font-semibold uppercase tracking-widest mb-2 block">
              Comando Operacional no Estado do Rio de Janeiro
            </span>

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-roboto font-bold text-black uppercase tracking-wider">
                Identificação
              </span>
              <Image
                src="/images/logos/flag-br.webp"
                alt="Brasil"
                width={26}
                height={18}
                className="shadow-sm rounded-[2px]"
              />
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            {/* 1. NOME */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-sans font-bold text-slate-400 uppercase ml-1 block">
                Nome
              </label>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm text-center">
                <p className="text-lg font-roboto font-black text-slate-800 uppercase leading-none truncate">
                  {user.full_name || "NOME DO AGENTE"}
                </p>
              </div>
            </div>

            {/* 2. MATRÍCULA */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-sans font-bold text-slate-400 uppercase ml-1 block">
                Matrícula
              </label>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm text-center">
                <p className="text-xl font-roboto font-black text-slate-800 tracking-wider leading-none">
                  {formatMatricula(user.matricula)}
                </p>
              </div>
            </div>

            {/* 3. GRID (Dados + Foto) */}
            <div className="grid grid-cols-2 gap-3 items-stretch">
              {/* Coluna Esquerda: Dados */}
              <div className="flex flex-col gap-3 h-full">
                {/* Graduação */}
                <div className="flex-1 flex flex-col">
                  <label className="text-[9px] font-sans font-bold text-slate-400 uppercase mb-0.5 ml-1">
                    Graduação
                  </label>
                  <div className="flex-1 flex items-center justify-center p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm min-h-[45px]">
                    {/* AUMENTADO PARA text-xl */}
                    <span className="text-xl font-roboto font-black text-[#d32f2f] uppercase text-center leading-none">
                      {user.graduacao || "MAJOR - PAC"}
                    </span>
                  </div>
                </div>

                {/* Tipo Sanguíneo */}
                <div className="flex-1 flex flex-col">
                  <label className="text-[9px] font-sans font-bold text-slate-400 uppercase mb-0.5 ml-1">
                    Tipo Sanguíneo
                  </label>
                  <div className="flex-1 flex items-center justify-center p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm min-h-[45px]">
                    {/* MANTIDO text-xl */}
                    <span className="text-xl font-roboto font-black text-[#d32f2f] uppercase">
                      {user.tipo_sanguineo || "AB+"}
                    </span>
                  </div>
                </div>

                {/* Validade */}
                <div className="flex-1 flex flex-col">
                  <label className="text-[9px] font-sans font-bold text-slate-400 uppercase mb-0.5 ml-1">
                    Validade
                  </label>
                  <div className="flex-1 flex items-center justify-center p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm min-h-[45px]">
                    {/* AUMENTADO PARA text-xl e font-black */}
                    <span className="text-xl font-roboto font-black text-slate-800">
                      {formatDate(user.validade_certificacao)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Foto */}
              <div className="flex flex-col h-full">
                <div className="mt-[16px] h-full relative w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Foto"
                      fill
                      className="object-cover object-top"
                      sizes="200px"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <span className="text-xs font-sans font-bold uppercase">
                        Sem Foto
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. UNIDADE */}
            <div className="space-y-0.5 pt-1">
              <label className="text-[10px] font-sans font-bold text-slate-400 uppercase ml-1 block">
                Unidade / Lotação
              </label>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm text-center">
                <p className="text-sm sm:text-base font-roboto font-black text-slate-800 uppercase leading-none truncate">
                  {user.unidade || "SEDE ADMINISTRATIVA"}
                </p>
              </div>
            </div>

            {/* 5. SITUAÇÃO */}
            <div className="pt-1">
              <label className="block text-center text-[9px] font-sans font-bold text-slate-400 uppercase mb-0.5">
                Situação do Patrulheiro
              </label>
              <div
                className={`w-full py-2.5 rounded-lg text-center shadow-sm ${
                  user.status ? "bg-[#2e7d32]" : "bg-[#c62828]"
                }`}
              >
                <h2 className="text-base font-roboto font-black text-white uppercase flex items-center justify-center gap-2">
                  {user.status ? (
                    <>
                      <RiCheckboxCircleLine className="text-white w-4 h-4" />
                      ATIVO
                    </>
                  ) : (
                    <>
                      <RiForbidLine className="text-white w-4 h-4" />
                      INATIVO
                    </>
                  )}
                </h2>
              </div>
            </div>

            {/* 6. AÇÕES */}
            <div className="mt-4 pt-3 grid grid-cols-2 gap-3 border-t border-slate-100">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 text-xs font-sans font-bold uppercase tracking-wide border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg"
              >
                <Link href="/">
                  <RiHomeLine className="mr-2 w-3.5 h-3.5" /> Site
                </Link>
              </Button>

              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!user.admin_2fa_enabled)
                        router.push("/admin/setup-password");
                      else if (hasAdminSession) router.push("/admin/dashboard");
                      else setShowAdminAuth(true);
                    }}
                    className={`flex-1 h-9 text-xs font-sans font-bold uppercase tracking-wide text-white shadow-md transition-all rounded-lg ${
                      !user.admin_2fa_enabled
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    <RiShieldStarLine className="mr-2 w-3.5 h-3.5" />
                    {!user.admin_2fa_enabled ? "Configurar" : "Admin"}
                  </Button>

                  {user.admin_2fa_enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/admin/setup-password")}
                      className="h-9 w-9 p-0 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600"
                    >
                      <RiSettings3Line className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="col-span-2 h-9 text-xs font-sans font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <RiLogoutBoxLine className="mr-2 w-3.5 h-3.5" /> Encerrar Sessão
              </Button>
            </div>
          </CardContent>

          {/* Footer Decorativo */}
          <div className="bg-slate-50 border-t border-slate-200 p-2 text-center">
            <p className="text-[8px] font-roboto font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1 opacity-80">
              <RiShieldStarLine className="w-3 h-3" />
              Documento Digital Oficial
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
