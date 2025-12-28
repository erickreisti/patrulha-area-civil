"use client";

import { useState } from "react";
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
} from "react-icons/ri";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminAuthModal({ isOpen, onClose }: AdminAuthModalProps) {
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { user, profile, setAdminSession } = useAuthStore();

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
      console.log("🔍 [AdminModal] Iniciando autenticação admin...");
      console.log("🔍 [AdminModal] Dados para autenticação:", {
        userId: user.id,
        userEmail: user.email,
        profileId: profile.id,
        matricula: profile.matricula,
      });

      // ✅ IMPORTAR e CHAMAR A NOVA SERVER ACTION
      const { authenticateAdminSession } = await import(
        "@/app/actions/auth/admin"
      );

      const result = await authenticateAdminSession(
        user.id,
        user.email || "",
        adminPassword
      );

      console.log("🔍 [AdminModal] Resultado da autenticação:", result);

      if (result.success) {
        // ✅ Atualizar estado local
        setAdminSession(true);

        setSuccessMessage(result.message || "Autenticação bem-sucedida!");
        setAdminPassword("");

        // ✅ Redirecionar com FORÇA para garantir que os cookies sejam lidos
        setTimeout(() => {
          console.log("✅ [AdminModal] Redirecionando para dashboard...");
          // Forçar navegação completa (não usar router.push)
          window.location.href = "/admin/dashboard";
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

            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value);
                setError("");
                setSuccessMessage("");
              }}
              placeholder="Digite sua senha administrativa"
              disabled={loading}
              className={`w-full text-lg ${
                error
                  ? "border-error focus:ring-error"
                  : successMessage
                  ? "border-green-500 focus:ring-green-500"
                  : "border-slate-300"
              }`}
              autoFocus
            />

            {error && (
              <div className="flex items-center gap-2 mt-2 text-error text-sm animate-fadeIn">
                <RiErrorWarningLine className="w-4 h-4" />
                <span className="font-roboto">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 mt-2 text-green-600 text-sm animate-fadeIn">
                <RiCheckLine className="w-4 h-4" />
                <span className="font-roboto">{successMessage}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading || !!successMessage}
              className={`flex-1 ${
                successMessage
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-navy hover:bg-navy/90"
              } text-white font-semibold py-2.5 text-sm transition-all font-roboto`}
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Verificando...
                </>
              ) : successMessage ? (
                "Redirecionando..."
              ) : (
                "Acessar Painel Admin"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || !!successMessage}
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
}

// Adicione este CSS para animação
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

// Adicione estilos ao componente
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
