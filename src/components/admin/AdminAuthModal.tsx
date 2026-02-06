"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons
import {
  RiLockPasswordLine,
  RiLoader4Line,
  RiShieldKeyholeLine,
  RiFingerprintLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";

// Store & Actions
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { loginAdmin } from "@/app/actions/auth/login";

interface AdminAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminAuthModal({
  isOpen = false,
  onClose,
}: AdminAuthModalProps) {
  const router = useRouter();
  const { profile, initialize } = useAuthStore();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
    if (isOpen) setShowPassword(false);
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Digite sua senha de administrador");
      return;
    }

    if (!profile?.email) {
      toast.error("Erro de perfil. Tente recarregar a página.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginAdmin({
        email: profile.email,
        password,
      });

      if (result.success) {
        toast.success("Identidade confirmada com sucesso!");
        await initialize();
        if (onClose) onClose();
        setShowModal(false);
        setPassword("");
        router.refresh();
      } else {
        toast.error(result.error || "Senha incorreta");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao validar credenciais");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        if (!open && onClose) onClose();
        if (!open) setShowModal(false);
      }}
    >
      <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-white/80 backdrop-blur-2xl shadow-2xl shadow-slate-900/20 ring-1 ring-white/60">
        {/* Decorative Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none" />

        <div className="p-8 relative z-10">
          <DialogHeader className="flex flex-col items-center space-y-4">
            {/* Ícone com efeito Glass e Glow */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/80 backdrop-blur-md p-4 rounded-full shadow-lg ring-1 ring-white">
                <RiShieldKeyholeLine className="w-8 h-8 text-slate-700" />
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">
                Acesso Restrito
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm max-w-xs mx-auto">
                Esta área requer privilégios elevados. Confirme sua identidade
                para continuar.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            {/* Card do Usuário (Glassmorphism) */}
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-200/60 rounded-xl backdrop-blur-sm">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-200 to-white flex items-center justify-center shadow-sm border border-white">
                <RiFingerprintLine className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Conta Vinculada
                </p>
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="modal-password"
                className="text-slate-700 font-medium ml-1"
              >
                Senha Administrativa
              </Label>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors pointer-events-none">
                  <RiLockPasswordLine className="w-5 h-5" />
                </div>

                <Input
                  id="modal-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-white/60 border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl transition-all duration-300 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 h-12 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl font-medium transition-colors"
                onClick={() => {
                  if (onClose) onClose();
                  setShowModal(false);
                }}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="flex-[2] h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RiLoader4Line className="mr-2 h-5 w-5 animate-spin" />
                    Validando...
                  </>
                ) : (
                  "Confirmar Acesso"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
