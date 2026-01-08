// src/components/admin/AdminAuthModal.tsx
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
import {
  RiShieldKeyholeLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiEyeLine,
  RiEyeOffLine,
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
                  setSuccessMessage("");
                }}
                placeholder="Digite sua senha administrativa"
                disabled={loading || !!successMessage}
                className={`w-full text-lg transition-all duration-200 pr-10 ${
                  error
                    ? "border-error focus:ring-error"
                    : successMessage
                    ? "border-green-500 focus:ring-green-500"
                    : "border-slate-300 focus:border-navy focus:ring-navy/20"
                }`}
                autoFocus
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
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

            {error && (
              <div className="flex items-center gap-2 mt-2 text-error text-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
                <RiErrorWarningLine className="w-4 h-4 flex-shrink-0" />
                <span className="font-roboto">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 mt-2 text-green-600 text-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
                <RiCheckLine className="w-4 h-4 flex-shrink-0" />
                <span className="font-roboto">
                  {successMessage} Redirecionando em {countdown}s...
                </span>
                <Spinner className="w-4 h-4 animate-spin" />
              </div>
            )}

            {profile?.admin_2fa_enabled === false && (
              <div className="mt-2 text-warning text-xs bg-warning/10 p-2 rounded-lg">
                <p className="font-medium flex items-center gap-1">
                  <RiErrorWarningLine className="w-3 h-3" />
                  Configure sua senha administrativa primeiro
                </p>
                <p className="text-warning/80 text-[10px] mt-1">
                  Acesse &quot;Configurar Senha Admin&quot; no seu perfil
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="submit"
              disabled={
                loading ||
                !!successMessage ||
                profile?.admin_2fa_enabled === false
              }
              className={`flex-1 transition-all duration-200 font-roboto ${
                successMessage
                  ? "bg-green-600 hover:bg-green-700 cursor-wait"
                  : profile?.admin_2fa_enabled === false
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-navy hover:bg-navy/90"
              }`}
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : successMessage ? (
                `Redirecionando... (${countdown})`
              ) : profile?.admin_2fa_enabled === false ? (
                "Configure a senha primeiro"
              ) : (
                "Acessar Painel Admin"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || !!successMessage}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-roboto transition-colors duration-200"
            >
              Cancelar
            </Button>
          </div>
        </form>

        <div className="text-center px-4 pb-3">
          <p className="text-[10px] text-slate-500 font-roboto">
            Sessão administrativa válida por 2 horas
          </p>
          {profile?.role === "admin" && profile?.admin_2fa_enabled && (
            <p className="text-success text-[10px] mt-1 font-roboto">
              ✅ Senha administrativa configurada
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
