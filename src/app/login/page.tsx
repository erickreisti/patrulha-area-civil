"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Toaster, toastHelpers } from "@/components/ui/sonner";
import {
  formatMatricula,
  validateMatricula,
  extractMatriculaNumbers,
} from "@/lib/utils/validation";
import { ROUTES } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [matricula, setMatricula] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar o auth store
  useEffect(() => {
    useAuthStore
      .getState()
      .initialize()
      .then(() => setIsInitialized(true));
  }, []);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    router.replace(ROUTES.PROTECTED.PROFILE);
  }, [isAuthenticated, router, isInitialized]);

  // Carregar matrícula salva
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMatricula = localStorage.getItem("saved_matricula");
      if (savedMatricula) {
        setMatricula(savedMatricula);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const matriculaNumerica = extractMatriculaNumbers(matricula);

    // Validação da matrícula
    if (!validateMatricula(matriculaNumerica)) {
      setError("A matrícula deve ter 11 dígitos");
      return;
    }

    setIsLoading(true);

    try {
      // Gerenciar "Lembrar-me"
      if (rememberMe) {
        localStorage.setItem("saved_matricula", matricula);
      } else {
        localStorage.removeItem("saved_matricula");
      }

      // Simular processamento
      await new Promise((resolve) => setTimeout(resolve, 800));

      const result = await login(matriculaNumerica);

      if (result?.success) {
        // Toast de sucesso
        toastHelpers.login.success("Login realizado com sucesso!");

        // Verificar status do usuário
        if (result.data?.user && !result.data.user.status) {
          toastHelpers.security.warning(
            "Sua conta está inativa. Entre em contato com o comando."
          );
        }

        // Redirecionar com delay
        setTimeout(() => {
          router.replace(ROUTES.PROTECTED.PROFILE);
        }, 2500);
      } else {
        // Mensagens de erro específicas
        const errorMessage = result?.error?.toLowerCase() || "";
        let finalMessage = result?.error || "Erro ao fazer login";

        if (
          errorMessage.includes("não encontrada") ||
          errorMessage.includes("não existe") ||
          errorMessage.includes("inexistente")
        ) {
          finalMessage =
            "Matrícula não encontrada. Você não faz parte da PAC - Patrulha Aérea Civil";
        }

        toastHelpers.login.error(finalMessage);
        setError(finalMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toastHelpers.login.error(errorMessage);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMatricula(formatMatricula(e.target.value));
  };

  const isFormValid = extractMatriculaNumbers(matricula).length === 11;

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-40 h-40">
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 160px) 100vw, 160px"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Patrulha Aérea Civil
          </h1>
          <p className="text-lg text-gray-600 uppercase tracking-wider font-medium">
            Comando Operacional no Estado do Rio de Janeiro
          </p>
        </div>

        {/* Card de Login */}
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Portal do Agente
            </h2>
            <p className="text-gray-600">Acesse sua conta com sua matrícula</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Matrícula */}
            <div>
              <label
                htmlFor="matricula"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Matrícula
              </label>
              <div className="relative">
                <input
                  id="matricula"
                  name="matricula"
                  type="text"
                  required
                  value={matricula}
                  onChange={handleMatriculaChange}
                  placeholder="XXX.XXX.XXX-XX"
                  maxLength={14}
                  disabled={isLoading}
                  autoComplete="username"
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    placeholder-gray-500 text-gray-900 text-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error ? "border-red-300" : "border-gray-300"}
                  `}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  </div>
                )}
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Digite sua matrícula no formato: XXX.XXX.XXX-XX
                </p>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Lembrar minha matrícula
              </label>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`
                w-full py-3 px-4 text-lg font-medium rounded-lg
                text-white bg-blue-600 hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
                flex items-center justify-center
              `}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Autenticando...
                </>
              ) : (
                "Entrar no Portal"
              )}
            </button>

            {/* Voltar ao site */}
            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Voltar ao site principal
              </Link>
            </div>
          </form>
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Sistema exclusivo para agentes cadastrados</p>
          <p className="mt-1">
            © {new Date().getFullYear()} Patrulha Aérea Civil.
          </p>
        </div>
      </div>

      <Toaster />
    </>
  );
}
