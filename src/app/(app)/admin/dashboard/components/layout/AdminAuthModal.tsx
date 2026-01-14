// src/app/(app)/admin/dashboard/components/layout/AdminAuthModal.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  RiShieldKeyholeLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLockPasswordLine,
  RiArrowRightLine,
  RiCloseLine,
} from "react-icons/ri";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminAuthModal({ isOpen, onClose }: AdminAuthModalProps) {
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  const { user, profile, verifyAdminAccess } = useAuthStore();

  // Limpar estados quando o modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setAdminPassword("");
      setError("");
      setSuccessMessage("");
      setShowPassword(false);
      setLoading(false);
      setCountdown(3);
    }
  }, [isOpen]);

  // Contador para redirecionamento
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (successMessage && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [successMessage, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      setError("Usuário não autenticado");
      return;
    }

    if (!adminPassword.trim()) {
      setError("Digite a senha de administrador");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Verificar se o admin já configurou a senha
      if (!profile.admin_2fa_enabled) {
        setError("Configure sua senha administrativa primeiro");
        setLoading(false);
        return;
      }

      const result = await verifyAdminAccess(adminPassword);

      if (result.success) {
        setSuccessMessage(result.message || "Autenticação bem-sucedida!");
        setAdminPassword("");

        // Iniciar contagem regressiva para redirecionamento
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              window.location.href = "/admin/dashboard";
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
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

  // Definindo os tipos corretamente para as animações
  const fadeInUp: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const, // Corrigido: usando 'as const' para tipo literal
      },
    },
  };

  const messageVariants: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: "0.5rem",
      marginBottom: "0.5rem",
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn" as const,
      },
    },
  };

  const successVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[420px] mx-auto bg-gradient-to-b from-white to-gray-50/90 border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-4"
        >
          {/* Cabeçalho com gradiente */}
          <div className="relative bg-gradient-to-r from-navy-600 to-navy-800 text-white py-6 px-6 rounded-t-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <DialogHeader className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <RiShieldKeyholeLine className="w-8 h-8" />
                </div>
              </div>

              <DialogTitle className="text-center text-2xl font-bold tracking-tight">
                Acesso Administrativo
              </DialogTitle>

              <DialogDescription className="text-center text-blue-100/80 mt-1 text-sm">
                Segunda camada de segurança
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Conteúdo principal */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
            {/* Campo de senha */}
            <motion.div variants={fadeInUp} transition={{ delay: 0.1 }}>
              <div className="mb-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <RiLockPasswordLine className="w-4 h-4 text-navy-600" />
                  <span className="text-sm font-semibold">
                    Senha Administrativa
                  </span>
                </div>
              </div>

              <div className="relative group">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setError("");
                    setSuccessMessage("");
                  }}
                  placeholder="Digite sua senha administrativa"
                  disabled={loading || !!successMessage}
                  className={`w-full h-12 text-base pl-4 pr-12 transition-all duration-300 rounded-xl border-2 ${
                    error
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : successMessage
                      ? "border-green-500 focus:ring-2 focus:ring-green-200"
                      : "border-gray-300 focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                  } ${loading || successMessage ? "bg-gray-50" : "bg-white"}`}
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  disabled={loading || !!successMessage}
                >
                  {showPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Mensagens de status */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={messageVariants}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                      <RiErrorWarningLine className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-700 text-sm">
                        Erro de autenticação
                      </p>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={successVariants}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-full">
                      <RiCheckLine className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-green-800 text-lg">
                        ✅ Autenticação bem-sucedida!
                      </p>
                      <p className="text-green-700 text-sm">
                        Redirecionando para o Painel Administrativo
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                        <Spinner className="w-4 h-4 text-green-600 animate-spin" />
                        <span className="text-green-700 font-semibold">
                          {countdown} segundo{countdown !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {profile?.admin_2fa_enabled === false && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={messageVariants}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                      <RiErrorWarningLine className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-700 text-sm">
                        Configuração necessária
                      </p>
                      <p className="text-amber-600 text-sm mt-1">
                        Configure sua senha administrativa primeiro
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botões de ação */}
            <motion.div
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Button
                type="submit"
                disabled={
                  loading ||
                  !!successMessage ||
                  profile?.admin_2fa_enabled === false
                }
                className={`flex-1 h-12 rounded-xl font-semibold text-base transition-all duration-300 relative overflow-hidden group ${
                  successMessage
                    ? "bg-gradient-to-r from-green-600 to-emerald-700 cursor-wait hover:from-green-700 hover:to-emerald-800"
                    : profile?.admin_2fa_enabled === false
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 shadow-lg hover:shadow-xl"
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Spinner className="w-5 h-5 animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : successMessage ? (
                    <span>Redirecionando...</span>
                  ) : profile?.admin_2fa_enabled === false ? (
                    <span>Configurar senha</span>
                  ) : (
                    <>
                      <span>Acessar Painel</span>
                      <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || !!successMessage}
                className="flex-1 h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold transition-colors duration-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <RiCloseLine className="w-5 h-5" />
                  <span>Cancelar</span>
                </div>
              </Button>
            </motion.div>
          </form>

          {/* Rodapé informativo */}
          <motion.div
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="px-6 pb-6 pt-2"
          >
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">
                  Sessão administrativa válida por 2 horas
                </span>
              </div>

              {profile?.role === "admin" && profile?.admin_2fa_enabled && (
                <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                  <div className="bg-green-100 p-1.5 rounded-full">
                    <RiCheckLine className="w-3 h-3" />
                  </div>
                  <span className="font-medium">
                    Senha administrativa configurada
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-center text-xs text-gray-500">
                Para segurança do sistema, todas as ações administrativas são
                registradas em log.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
