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
  const nums = mat.replace(/\D/g, "");
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
        className="w-full bg-red-600 hover:bg-red-700 text-white font-roboto font-bold h-9 rounded-lg text-xs"
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

  // Lógica para tamanho do texto da unidade (Responsivo)
  const unidadeLength = (user.unidade || "").length;
  const unidadeTextSize =
    unidadeLength > 30
      ? "text-[8px]"
      : unidadeLength > 20
        ? "text-[9px]"
        : "text-[11px]";

  return (
    // Aumentei o padding (p-6) para mostrar mais fundo azul
    <div className="min-h-[100dvh] bg-[#1e3a8a] relative flex items-center justify-center p-6 font-sans overflow-hidden">
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
        // Reduzi a largura máxima de 340px para 300px
        className="w-full max-w-[300px] relative z-10"
      >
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[14px]">
          {/* --- HEADER --- */}
          <div className="bg-white px-4 pt-3 pb-1 flex flex-col items-center text-center">
            <div className="mb-1">
              <Image
                src="/images/logos/logo.webp"
                alt="PAC Logo"
                width={80} // Levemente menor
                height={80}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </div>

            <h1 className="text-[#1a237e] font-roboto font-bold text-sm uppercase leading-none tracking-wide mb-0.5">
              Patrulha Aérea Civil
            </h1>
            <span className="text-[7px] font-sans text-slate-500 font-semibold uppercase tracking-widest mb-1 block leading-none">
              Comando Operacional no Estado do Rio de Janeiro
            </span>

            <div className="flex flex-col items-center gap-0">
              <span className="text-[7px] font-roboto font-bold text-black uppercase tracking-wider leading-none mb-1 mt-0.5">
                Identificação
              </span>
              <Image
                src="/images/logos/flag-br.webp"
                alt="Brasil"
                width={22}
                height={15}
                style={{ width: "auto", height: "auto" }}
                className="shadow-sm rounded-[2px]"
              />
            </div>
          </div>

          <CardContent className="pt-1 mt-[-5px] space-y-1">
            {/* 1. NOME */}
            <div className="space-y-[-2px]">
              <label className="text-[7px] font-sans font-bold text-slate-400 uppercase ml-4 block">
                Nome
              </label>
              {/* Reduzi min-h de 50px para 42px */}
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-center min-h-[42px] justify-center items-center flex">
                <p className="text-base font-roboto text-slate-800 uppercase leading-none truncate">
                  {user.full_name || "NOME DO AGENTE"}
                </p>
              </div>
            </div>

            {/* 2. MATRÍCULA */}
            <div className="space-y-[-2px]">
              <label className="text-[7px] font-sans font-bold text-slate-400 uppercase ml-4 block mt-1">
                Matrícula
              </label>
              {/* Reduzi min-h de 50px para 42px */}
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-center min-h-[42px] justify-center items-center flex">
                <p className="text-lg font-roboto text-slate-800 tracking-wider leading-none">
                  {formatMatricula(user.matricula)}
                </p>
              </div>
            </div>

            {/* 3. GRID (Dados + Foto) */}
            <div className="grid grid-cols-2 gap-2 items-stretch mt-1">
              {/* Coluna Esquerda: Dados */}
              <div className="flex flex-col gap-1.5 h-full">
                {/* UNIDADE (Adaptativo) */}
                <div className="flex-1 flex flex-col space-y-[-2px]">
                  <label className="text-[7px] font-sans font-bold text-slate-400 uppercase ml-4 mt-0.5">
                    Unidade
                  </label>
                  {/* Reduzi min-h de 50px para 42px */}
                  <div className="flex-1 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg shadow-sm min-h-[42px]">
                    <span
                      className={`${unidadeTextSize} font-roboto text-slate-800 uppercase text-center leading-tight`}
                    >
                      {user.unidade || "SEDE DA PAC"}
                    </span>
                  </div>
                </div>

                {/* Tipo Sanguíneo */}
                <div className="flex-1 flex flex-col space-y-[-2px]">
                  <label className="text-[7px] font-sans font-bold text-slate-400 uppercase ml-4">
                    Tipo Sanguíneo
                  </label>
                  <div className="flex-1 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg shadow-sm min-h-[42px]">
                    <span className="text-lg font-roboto text-[#d32f2f] uppercase">
                      {user.tipo_sanguineo || "AB+"}
                    </span>
                  </div>
                </div>

                {/* Validade */}
                <div className="flex-1 flex flex-col space-y-[-2px]">
                  <label className="text-[7px] font-sans font-bold text-slate-400 uppercase ml-4 mt-0.5">
                    Validade
                  </label>
                  <div className="flex-1 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg shadow-sm min-h-[42px]">
                    <span className="text-lg font-roboto text-slate-800">
                      {formatDate(user.validade_certificacao)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Foto */}
              <div className="flex flex-col h-full">
                {/* Ajustei a margem superior para alinhar com os labels */}
                <div className="mt-[14px] relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Foto"
                      fill
                      className="object-cover object-top"
                      sizes="150px"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <span className="text-[9px] font-sans font-bold uppercase">
                        Sem Foto
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. GRADUAÇÃO (Antiga Unidade) */}
            <div className="space-y-[-2px] pt-1">
              <label className="text-[7px] font-sans font-bold text-slate-400 uppercase ml-4 block">
                Graduação
              </label>
              {/* Reduzi min-h de 50px para 42px */}
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-center min-h-[42px] justify-center items-center flex">
                <p className="text-base font-roboto font-black text-[#d32f2f] uppercase leading-none truncate">
                  {user.graduacao || "MAJOR"}
                </p>
              </div>
            </div>

            {/* 5. SITUAÇÃO */}
            <div className="pt-3">
              <span className="text-[7px] font-sans text-slate-500 font-semibold uppercase tracking-widest mb-1 leading-none flex justify-center">
                Situação do Patrulheiro
              </span>
              <div
                className={`w-full h-10 flex justify-center items-center py-1 rounded-lg text-center shadow-sm ${
                  user.status ? "bg-[#2e7d32]" : "bg-[#c62828]"
                }`}
              >
                <h2 className="text-sm font-roboto font-black text-white uppercase flex items-center justify-center gap-1.5">
                  {user.status ? (
                    <>
                      <RiCheckboxCircleLine className="text-white w-3 h-3" />
                      ATIVO
                    </>
                  ) : (
                    <>
                      <RiForbidLine className="text-white w-3 h-3" />
                      INATIVO
                    </>
                  )}
                </h2>
              </div>
            </div>

            {/* 6. AÇÕES */}
            <div className="mt-3 pt-2 grid grid-cols-2 gap-2 border-t border-slate-100">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 text-[9px] font-sans font-bold uppercase tracking-wide border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg"
              >
                <Link href="/">
                  <RiHomeLine className="mr-1 w-3 h-3" /> Site
                </Link>
              </Button>

              {isAdmin && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!user.admin_2fa_enabled)
                        router.push("/admin/setup-password");
                      else if (hasAdminSession) router.push("/admin/dashboard");
                      else setShowAdminAuth(true);
                    }}
                    className={`flex-1 h-7 text-[9px] font-sans font-bold uppercase tracking-wide text-white shadow-md transition-all rounded-lg ${
                      !user.admin_2fa_enabled
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    <RiShieldStarLine className="mr-1 w-3 h-3" />
                    {!user.admin_2fa_enabled ? "Config" : "Admin"}
                  </Button>

                  {user.admin_2fa_enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/admin/setup-password")}
                      className="h-7 w-7 p-0 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600"
                    >
                      <RiSettings3Line className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="col-span-2 h-7 text-[9px] font-sans font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <RiLogoutBoxLine className="mr-1 w-3 h-3" /> Encerrar Sessão
              </Button>
            </div>
          </CardContent>

          {/* Footer Minimalista */}
          <div className="bg-slate-50 border-t border-slate-200 p-1 text-center">
            <p className="text-[7px] font-roboto font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1 opacity-80">
              <RiShieldStarLine className="w-2 h-2" />
              Documento Digital
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
