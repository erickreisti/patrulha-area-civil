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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (successMessage && countdown > 0) {
      interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
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
      if (!profile.admin_2fa_enabled) {
        setError("Configure sua senha administrativa primeiro");
        setLoading(false);
        return;
      }

      const result = await verifyAdminAccess(adminPassword);

      if (result.success) {
        setSuccessMessage(result.message || "Autenticação bem-sucedida!");
        setAdminPassword("");

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

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[420px] mx-auto bg-background-primary border border-border-light shadow-pac-xl rounded-2xl overflow-hidden p-0">
        {/* Cabeçalho */}
        <div className="relative bg-pac-primary text-white py-6 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <DialogHeader className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-4 shadow-inner">
              <RiShieldKeyholeLine className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-center text-xl font-bold tracking-tight text-white">
              Acesso Administrativo
            </DialogTitle>
            <DialogDescription className="text-center text-pac-primary-pale/80 mt-1 text-sm">
              Segunda camada de segurança
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 bg-background-primary"
        >
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <RiLockPasswordLine className="w-4 h-4 text-pac-primary" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Senha Administrativa
              </span>
            </div>

            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setError("");
                }}
                placeholder="Digite sua senha"
                disabled={loading || !!successMessage}
                className={`w-full h-12 text-base pl-4 pr-12 rounded-xl border-2 transition-all ${
                  error
                    ? "border-pac-alert focus:ring-pac-alert/20"
                    : successMessage
                      ? "border-pac-secondary focus:ring-pac-secondary/20"
                      : "border-border-DEFAULT focus:border-pac-primary focus:ring-pac-primary/10"
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-pac-primary transition-colors p-1"
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

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-pac-alert/10 border border-pac-alert/20 rounded-lg p-3 flex items-start gap-3"
              >
                <RiErrorWarningLine className="w-5 h-5 text-pac-alert flex-shrink-0 mt-0.5" />
                <p className="text-sm text-pac-alert font-medium">{error}</p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-pac-secondary/10 border border-pac-secondary/20 rounded-lg p-4 text-center space-y-2"
              >
                <div className="inline-flex bg-pac-secondary text-white p-2 rounded-full mb-1">
                  <RiCheckLine className="w-6 h-6" />
                </div>
                <p className="font-bold text-pac-secondary-dark">
                  Acesso Autorizado!
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                  <Spinner className="w-4 h-4 text-pac-secondary" />
                  <span>Entrando em {countdown}s...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={
                loading ||
                !!successMessage ||
                profile?.admin_2fa_enabled === false
              }
              className={`flex-1 h-12 rounded-xl font-bold uppercase tracking-wide transition-all shadow-md ${
                successMessage
                  ? "bg-pac-secondary hover:bg-pac-secondary-dark text-white"
                  : "bg-pac-primary hover:bg-pac-primary-dark text-white"
              }`}
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" /> Verificando...
                </>
              ) : successMessage ? (
                "Redirecionando..."
              ) : (
                <>
                  Acessar Painel <RiArrowRightLine className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || !!successMessage}
              className="flex-1 h-12 rounded-xl border-border-DEFAULT text-text-secondary hover:bg-background-secondary font-semibold"
            >
              Cancelar
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-background-secondary px-6 py-4 text-center border-t border-border-light">
          <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">
            Monitoramento de Segurança Ativo • IP Registrado
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
