"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✅ Import obrigatório
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  formatMatricula,
  validateMatricula,
  extractMatriculaNumbers,
} from "@/lib/utils/validation";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginWithServerAction, initialize } = useAuthStore();

  // Estados
  const [matricula, setMatricula] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de controle de fluxo
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 1. Inicialização do Auth Store
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await initialize();
      setTimeout(() => {
        if (mounted) setIsInitialized(true);
      }, 0);
    };
    init();
    return () => {
      mounted = false;
    };
  }, [initialize]);

  // 2. Carregar Matrícula Salva
  useEffect(() => {
    const loadSavedData = () => {
      if (typeof window !== "undefined") {
        try {
          const savedMatricula = localStorage.getItem("saved_matricula");
          if (savedMatricula) {
            setMatricula(savedMatricula);
            setRememberMe(true);
          }
        } catch (e) {
          console.error("Erro ao ler localStorage:", e);
        }
      }
    };

    const timeoutId = setTimeout(loadSavedData, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // 3. Redirecionamento se já autenticado
  useEffect(() => {
    if (isInitialized && isAuthenticated && !isRedirecting) {
      const handleRedirect = () => {
        setIsRedirecting(true);
        toast.success("Sessão restaurada com sucesso!");
        router.replace("/perfil");
      };

      const timeoutId = setTimeout(handleRedirect, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isInitialized, isAuthenticated, router, isRedirecting]);

  // Handlers
  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/\D/g, "");

    // Limite de 11 dígitos
    if (numericValue.length > 11) return;

    if (error) setError(null);
    setMatricula(formatMatricula(inputValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const matriculaNumerica = extractMatriculaNumbers(matricula);

    if (!validateMatricula(matriculaNumerica)) {
      setError("A matrícula deve conter 11 dígitos numéricos.");
      toast.error("Formato inválido", {
        description: "Verifique se digitou todos os números corretamente.",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("saved_matricula", matricula);
        } else {
          localStorage.removeItem("saved_matricula");
        }
      }

      const result = await loginWithServerAction(matriculaNumerica);

      if (result?.success) {
        const isInactive = result.data?.user && !result.data.user.status;

        if (isInactive) {
          toast.warning("Atenção: Conta Inativa", {
            description: "Entre em contato com o comando para regularizar.",
            duration: 5000,
          });
        } else {
          toast.success("Bem-vindo de volta!", {
            icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          });
        }

        setIsRedirecting(true);
        router.replace("/perfil");
      } else {
        const errorMessage = result?.error?.toLowerCase() || "";
        let finalMessage = "Não foi possível realizar o login.";

        if (
          errorMessage.includes("não encontrada") ||
          errorMessage.includes("não existe")
        ) {
          finalMessage = "Matrícula não encontrada no sistema.";
        } else if (errorMessage.includes("inativa")) {
          finalMessage = "Sua conta está inativa/bloqueada.";
        }

        setError(finalMessage);
        toast.error("Falha na autenticação", { description: finalMessage });
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Erro crítico no login:", err);
      setError("Ocorreu um erro inesperado no servidor.");
      toast.error("Erro de conexão", {
        description: "Tente novamente em instantes.",
      });
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // TELA DE LOADING (CORRIGIDA E MELHORADA)
  // ---------------------------------------------------------
  if (!isInitialized || isRedirecting) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          {/* ✅ CORREÇÃO ESLINT: Trocado <img> por <Image />
             ✅ MELHORIA: Aumentado para w-32 (128px), adicionado drop-shadow
             ✅ ANIMAÇÃO: Adicionado efeito de "respiração" (scale)
          */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="relative w-32 h-32 mb-8 filter drop-shadow-xl"
          >
            <Image
              src="/images/logos/logo.webp"
              alt="Brasão Patrulha Aérea Civil"
              fill
              className="object-contain"
              priority // Garante carregamento imediato
              sizes="(max-width: 768px) 128px, 128px"
            />
          </motion.div>

          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />

          <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
            {isRedirecting ? "Autenticando..." : "Carregando Sistema..."}
          </p>
        </motion.div>
      </div>
    );
  }

  const matriculaNumerica = extractMatriculaNumbers(matricula);
  const isFormValid = matriculaNumerica.length === 11;

  // ---------------------------------------------------------
  // TELA DE LOGIN (Principal)
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px]"
      >
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 drop-shadow-xl filter hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/logos/logo.webp"
                alt="Brasão Patrulha Aérea Civil"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 128px, 160px"
                priority
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-2">
            PATRULHA AÉREA CIVIL
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest">
            Comando Operacional Rio de Janeiro
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-8">
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
                <div className="relative group">
                  <input
                    id="matricula"
                    name="matricula"
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    value={matricula}
                    onChange={handleMatriculaChange}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    className={`
                      w-full px-4 py-3.5 bg-slate-50 border rounded-xl text-slate-900 text-lg font-medium tracking-wide
                      transition-all duration-200 ease-in-out
                      placeholder:text-slate-400
                      focus:outline-none focus:bg-white focus:ring-2 focus:ring-offset-1
                      disabled:opacity-60 disabled:cursor-not-allowed
                      ${
                        error
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-200 focus:ring-blue-600 focus:border-blue-600 group-hover:border-blue-300"
                      }
                    `}
                  />
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-red-600 text-sm mt-2 font-medium"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer transition duration-150 ease-in-out"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="remember-me"
                    className="font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Lembrar minha matrícula
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`
                  w-full py-4 px-6 rounded-xl text-white font-bold text-base shadow-lg shadow-blue-500/20
                  transition-all duration-200 transform
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600
                  flex items-center justify-center gap-2
                  ${
                    isLoading || !isFormValid
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 active:translate-y-0"
                  }
                `}
              >
                {isLoading ? "Validando..." : "Acessar Portal"}
              </button>
            </form>
          </div>

          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 group"
            >
              <span>←</span>
              <span className="group-hover:underline">
                Voltar ao site principal
              </span>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          &copy; {new Date().getFullYear()} Patrulha Aérea Civil - Todos os
          direitos reservados.
          <br />
          Sistema de uso exclusivo interno.
        </p>
      </motion.div>
    </div>
  );
}
