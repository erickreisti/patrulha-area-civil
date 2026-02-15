"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Importe o Link
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RiShieldKeyholeLine,
  RiLockPasswordLine,
  RiTimerLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowLeftLine, // Ícone para voltar
} from "react-icons/ri";
import { Loader2 } from "lucide-react";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminAuthModal({ isOpen, onClose }: AdminAuthModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { verifyAdminAccess } = useAuthStore();
  const router = useRouter();

  // 1. Ao abrir, verifica se existe cooldown ativo
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPassword(false);
      const stored = localStorage.getItem("admin_cooldown");
      if (stored) {
        const releaseTime = parseInt(stored, 10);
        const now = Date.now();
        if (releaseTime > now) {
          setCooldown(Math.ceil((releaseTime - now) / 1000));
        } else {
          localStorage.removeItem("admin_cooldown");
          setCooldown(0);
        }
      }
    }
  }, [isOpen]);

  // 2. Timer regressivo
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("admin_cooldown");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setIsLoading(true);

    try {
      const result = await verifyAdminAccess(password);

      if (result.success) {
        onClose();
        router.push("/admin/dashboard");
      } else {
        toast.error("Senha incorreta");
        setPassword("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao verificar credenciais");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-white rounded-2xl border border-slate-100 shadow-2xl p-6">
        <DialogHeader className="items-center text-center space-y-4">
          <div
            className={`p-4 rounded-full transition-colors duration-300 ${cooldown > 0 ? "bg-orange-50" : "bg-pac-primary/5"}`}
          >
            {cooldown > 0 ? (
              <RiTimerLine className="w-8 h-8 text-orange-500 animate-pulse" />
            ) : (
              <RiShieldKeyholeLine className="w-8 h-8 text-pac-primary" />
            )}
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
              {cooldown > 0 ? "Aguarde um momento" : "Área Restrita"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              {cooldown > 0
                ? "Muitas tentativas. Por segurança, aguarde o tempo acabar."
                : "Esta área exige privilégios de administrador."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {cooldown > 0 ? (
          // --- ESTADO DE BLOQUEIO ---
          <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter">
              00:{cooldown.toString().padStart(2, "0")}
            </div>
            <p className="text-xs text-orange-600 font-bold uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
              Bloqueio de Segurança
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full mt-4 rounded-xl h-11 border-slate-200"
            >
              Fechar Janela
            </Button>
          </div>
        ) : (
          // --- ESTADO DE FORMULÁRIO ---
          <form
            onSubmit={handleVerify}
            className="space-y-5 mt-2 animate-in slide-in-from-bottom-2 duration-300"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-1 uppercase tracking-wide">
                Senha de Acesso
              </label>
              <div className="relative group">
                <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pac-primary transition-colors w-5 h-5" />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-pac-primary focus:ring-4 focus:ring-pac-primary/10 rounded-xl transition-all text-base"
                  autoFocus
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="h-12 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-pac-primary hover:bg-pac-primary-dark h-12 rounded-xl font-bold text-white shadow-lg shadow-pac-primary/20 hover:shadow-xl hover:shadow-pac-primary/30 transition-all"
                disabled={isLoading || !password}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Entrar"
                )}
              </Button>
            </div>

            {/* Link para voltar ao site público */}
            <div className="text-center pt-2 border-t border-slate-100 mt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-pac-primary transition-colors group"
                onClick={onClose} // Fecha o modal ao clicar
              >
                <RiArrowLeftLine className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                Voltar para o site público
              </Link>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
