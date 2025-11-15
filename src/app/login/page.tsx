// src/app/login/page.tsx - VERSÃO COMPLETA COM LOGS
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Debug das variáveis de ambiente
  useEffect(() => {
    console.log("🔧 === INICIANDO PÁGINA DE LOGIN ===");
    console.log("🔧 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "🔧 Supabase Key:",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + "..."
    );
    console.log("🔧 Client criado:", !!supabase);
  }, []);

  // Verificar se usuário já está logado
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("🔍 Verificando se usuário já está logado...");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          console.log("✅ Usuário já logado, ID:", user.id);
          console.log("🔄 Redirecionando para perfil...");
          window.location.href = "/agent/perfil";
        } else {
          console.log("❌ Nenhum usuário logado");
        }
      } catch (error) {
        console.error("💥 Erro ao verificar usuário:", error);
      }
    };

    checkUser();
  }, [router, supabase]);

  const redirectToProfile = () => {
    console.log("🎯 Redirecionando para página de perfil...");
    window.location.href = "/agent/perfil";
  };

  const formatMatricula = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6
      )}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6,
        9
      )}-${numbers.slice(9, 11)}`;
    }
  };

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMatricula(e.target.value);
    setMatricula(formatted);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔄 === INICIANDO PROCESSO DE LOGIN ===");

      // Remover formatação da matrícula para login
      const matriculaLimpa = matricula.replace(/\D/g, "");
      console.log("📝 Matrícula formatada:", matricula);
      console.log("🔢 Matrícula limpa (11 dígitos):", matriculaLimpa);

      // Garantir que temos 11 dígitos para o email
      if (matriculaLimpa.length !== 11) {
        console.log("❌ Matrícula não tem 11 dígitos");
        setError("Matrícula deve ter 11 dígitos");
        setLoading(false);
        return;
      }

      const email = `${matriculaLimpa}@pac.org.br`;
      console.log("📧 Email gerado para login:", email);

      // TESTE 1: Verificar se o usuário existe na tabela profiles
      console.log("🔍 TESTE 1 - Verificando usuário na tabela profiles...");
      const { data: userCheck, error: checkError } = await supabase
        .from("profiles")
        .select("id, matricula, email, role, status")
        .eq("matricula", matricula)
        .single();

      console.log("📊 Resultado da verificação do profile:", userCheck);
      console.log("❌ Erro na verificação do profile:", checkError);

      if (checkError) {
        console.log("💥 Usuário não encontrado na tabela profiles");
        setError("Matrícula não cadastrada no sistema");
        setLoading(false);
        return;
      }

      console.log("✅ Usuário encontrado no profile:", userCheck);

      // TESTE 2: Verificar se o usuário existe no Auth
      console.log("🔍 TESTE 2 - Verificando usuário no Auth system...");
      const { data: authCheck, error: authCheckError } = await supabase
        .from("auth.users")
        .select("id, email, email_confirmed_at")
        .eq("email", email)
        .single();

      console.log("📊 Resultado da verificação do Auth:", authCheck);
      console.log("❌ Erro na verificação do Auth:", authCheckError);

      console.log("🔐 TESTE 3 - Tentando autenticação...");
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password: senha,
        }
      );

      console.log("📊 Resultado do signInWithPassword - DATA:", data);
      console.log("❌ Resultado do signInWithPassword - ERROR:", authError);

      if (authError) {
        console.error("💥 Erro de autenticação completo:", authError);

        if (authError.message === "Invalid login credentials") {
          console.log(
            "🔑 Credenciais inválidas - senha incorreta ou usuário não existe no Auth"
          );
          setError("Matrícula ou senha incorretas");
        } else if (authError.message.includes("database")) {
          console.log("🗄️ Erro de banco de dados na autenticação");
          setError("Erro de conexão com o sistema. Tente novamente.");
        } else {
          console.log("🚨 Outro erro de autenticação:", authError.message);
          setError(`Erro: ${authError.message}`);
        }
        return;
      }

      if (data.user) {
        console.log("🎉 ✅ LOGIN BEM-SUCEDIDO!");
        console.log("👤 Usuário autenticado:", data.user);
        console.log("🔄 Aguardando 100ms antes do redirecionamento...");

        // Aguardar um pouco para garantir que a sessão está estabelecida
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("🎯 Iniciando redirecionamento para perfil...");
        redirectToProfile();
      } else {
        console.log("❌ Nenhum usuário retornado do auth");
        setError("Erro inesperado no login");
      }
    } catch (err: any) {
      console.error("💥💥 ERRO CATCH NO LOGIN:", err);
      console.error("💥 Stack trace:", err.stack);
      setError("Erro inesperado ao fazer login. Tente novamente.");
    } finally {
      console.log("🏁 Finalizando processo de login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-offwhite to-navy-light/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="relative w-16 h-16">
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                width={64}
                height={64}
                className="object-contain rounded-md"
                priority
              />
            </div>
            <div className="text-left">
              <h1 className="font-bebas text-2xl bg-gradient-to-r from-navy-light to-navy bg-clip-text text-transparent tracking-wider uppercase leading-none">
                PATRULHA AÉREA CIVIL
              </h1>
              <p className="text-gray-600 text-sm leading-tight mt-1">
                Serviço Humanitário de Excelência
              </p>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 bg-navy-light/10 px-4 py-2 rounded-full border border-navy-light/20">
            <span className="text-navy-light text-sm font-medium">
              Sistema de Autenticação
            </span>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bebas text-gray-800 text-center mb-6 tracking-wide">
            ACESSO DO AGENTE
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo Matrícula */}
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">
                Matrícula do Agente
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={matricula}
                  onChange={handleMatriculaChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full border-2 border-gray-200 focus:border-navy-light focus:ring-2 focus:ring-navy-light/20 text-base py-3 px-4 rounded-xl transition-all duration-200 font-medium tracking-wider"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Formato: XXX.XXX.XXX-XX (11 dígitos)
              </p>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-800 text-sm font-semibold">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-navy-light hover:text-navy text-sm font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full border-2 border-gray-200 focus:border-navy-light focus:ring-2 focus:ring-navy-light/20 text-base py-3 px-4 rounded-xl transition-all duration-200 font-medium"
                required
                disabled={loading}
              />
            </div>

            {/* Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-navy-light border-gray-200 rounded focus:ring-navy-light focus:ring-2"
                disabled={loading}
              />
              <label
                htmlFor="remember"
                className="text-gray-600 text-sm font-medium"
              >
                Manter conectado
              </label>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-navy-light to-navy hover:from-navy hover:to-navy-dark text-white font-semibold py-3.5 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-600 font-medium">
                ou
              </span>
            </div>
          </div>

          {/* Botão Voltar */}
          <Link
            href="/"
            className="w-full border-2 border-gray-200 text-gray-600 hover:text-navy-light hover:border-navy-light hover:bg-navy-light/10 font-medium py-3 text-base rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md flex items-center justify-center"
          >
            Voltar para o Site
          </Link>
        </div>
      </div>
    </div>
  );
}
