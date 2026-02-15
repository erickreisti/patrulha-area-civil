"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link"; // Importe adicionado
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2, Timer } from "lucide-react";
import {
  formatMatricula,
  validateMatricula,
  extractMatriculaNumbers,
} from "@/lib/utils/validation";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginWithServerAction, initialize } = useAuthStore();

  const [matricula, setMatricula] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // 1. Inicialização + Verificação de Cooldown
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await initialize();

      const storedCooldown = localStorage.getItem("login_cooldown");
      if (storedCooldown) {
        const releaseTime = parseInt(storedCooldown, 10);
        const now = Date.now();
        if (releaseTime > now) {
          setCooldown(Math.ceil((releaseTime - now) / 1000));
        } else {
          localStorage.removeItem("login_cooldown");
        }
      }

      setTimeout(() => {
        if (mounted) setIsInitialized(true);
      }, 0);
    };
    init();
    return () => {
      mounted = false;
    };
  }, [initialize]);

  // 2. Timer Regressivo
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("login_cooldown");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 3. Carregar Matrícula Salva
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("saved_matricula");
      if (saved) {
        setTimeout(() => {
          setMatricula(saved);
          setRememberMe(true);
        }, 0);
      }
    }
  }, []);

  // 4. Redirecionamento Automático
  useEffect(() => {
    if (isInitialized && isAuthenticated && !isRedirecting) {
      setTimeout(() => {
        setIsRedirecting(true);
        router.replace("/perfil");
      }, 0);
    }
  }, [isInitialized, isAuthenticated, router, isRedirecting]);

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) return;
    if (error) setError(null);
    setMatricula(formatMatricula(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    const nums = extractMatriculaNumbers(matricula);
    if (!validateMatricula(nums)) {
      setError("A matrícula deve conter 11 dígitos.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (rememberMe) localStorage.setItem("saved_matricula", matricula);
      else localStorage.removeItem("saved_matricula");

      const res = await loginWithServerAction(nums);

      if (res?.success) {
        toast.success("Bem-vindo de volta!", {
          icon: <CheckCircle2 className="text-green-600" />,
        });
        setIsRedirecting(true);
        router.replace("/perfil");
      } else {
        const msg = res?.error?.toLowerCase() || "";
        let finalMsg = "Erro no login.";
        if (msg.includes("não encontrada"))
          finalMsg = "Matrícula não encontrada.";
        else if (msg.includes("inativa")) finalMsg = "Conta inativa.";

        setError(finalMsg);
        toast.error(finalMsg);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Erro de conexão.");
      setIsLoading(false);
    }
  };

  if (!isInitialized || isRedirecting) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-32 h-32 mb-8 animate-pulse">
            <Image
              src="/images/logos/logo.webp"
              alt="Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 640px) 128px, 160px"
            />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-semibold text-slate-500 uppercase">
            {isRedirecting ? "Autenticando..." : "Carregando..."}
          </p>
        </motion.div>
      </div>
    );
  }

  const isFormValid = extractMatriculaNumbers(matricula).length === 11;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        <div className="text-center mb-6">
          {/* Link envolvendo a imagem para voltar à Home */}
          <Link href="/" title="Voltar para a página inicial">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-2 drop-shadow-xl hover:scale-105 transition-transform cursor-pointer">
              <Image
                src="/images/logos/logo.webp"
                alt="Logo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 128px, 160px"
              />
            </div>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-pac-primary tracking-tight mb-2">
            PATRULHA AÉREA CIVIL
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Comando Operacional no Estado do Rio de Janeiro
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Portal do Agente
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Identifique-se para acessar o sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="matricula"
                className="block text-sm font-semibold text-slate-700"
              >
                Matrícula
              </label>
              <div className="relative">
                <input
                  id="matricula"
                  type="text"
                  inputMode="numeric"
                  value={matricula}
                  onChange={handleMatriculaChange}
                  disabled={isLoading || cooldown > 0}
                  placeholder="000.000.000-00"
                  className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl text-lg font-medium outline-none transition-all
                    ${
                      error
                        ? "border-red-300 focus:ring-red-500"
                        : "border-slate-200 focus:ring-blue-600"
                    }
                    disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm mt-2 font-medium"
                  >
                    <AlertCircle className="h-4 w-4" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || cooldown > 0}
                className="h-4 w-4 text-blue-600 rounded border-slate-300"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-slate-600 cursor-pointer"
              >
                Lembrar matrícula
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid || cooldown > 0}
              className={`w-full py-4 px-6 rounded-xl text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2
                ${
                  isLoading || !isFormValid || cooldown > 0
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5"
                }`}
            >
              {cooldown > 0 ? (
                <>
                  <Timer className="h-5 w-5 animate-pulse" />
                  Aguarde {cooldown}s...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Validando...
                </>
              ) : (
                "Acessar Portal"
              )}
            </button>
          </form>

          {cooldown > 0 && (
            <p className="text-xs text-center text-orange-500 mt-3 font-medium bg-orange-50 p-2 rounded-lg">
              Por segurança, aguarde o tempo para novo login.
            </p>
          )}
        </div>

        <div className="mt-8 text-center text-xs font-medium text-slate-400">
          &copy; {new Date().getFullYear()} Patrulha Aérea Civil - Todos os
          direitos reservados.
        </div>
      </motion.div>
    </div>
  );
}
