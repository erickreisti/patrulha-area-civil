// src/app/login/page.tsx - VERSÃO PREMIUM COM LOGO AUMENTADA
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [matricula, setMatricula] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success" | "warning";
    message: string;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Verificar se usuário já está logado
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          window.location.href = "/perfil";
        }
      } catch (error) {
        console.error("Erro ao verificar usuário:", error);
      }
    };

    checkUser();
  }, [router, supabase]);

  const showAlert = (
    type: "error" | "success" | "warning",
    message: string
  ) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
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
    setAlert(null);

    try {
      // Remover formatação da matrícula
      const matriculaLimpa = matricula.replace(/\D/g, "");

      // Garantir que temos 11 dígitos
      if (matriculaLimpa.length !== 11) {
        showAlert("error", "Matrícula deve ter 11 dígitos");
        setLoading(false);
        return;
      }

      // BUSCAR DADOS COMPLETOS DO PERFIL
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("matricula", matricula)
        .single();

      if (profileError || !profile) {
        showAlert("error", "Matrícula não cadastrada no sistema");
        setLoading(false);
        return;
      }

      console.log("✅ Agente encontrado com dados completos:", profile);

      // Mensagem de boas-vindas
      let alertMessage = `Bem-vindo, ${profile.full_name || "Agente"}!`;

      if (!profile.status) {
        alertMessage = `Bem-vindo, ${
          profile.full_name || "Agente"
        }! Sua conta está inativa.`;
        showAlert("warning", alertMessage);
      } else {
        showAlert("success", alertMessage);
      }

      // 🔧 MÉTODO SIMPLIFICADO: Armazenar dados completos no localStorage
      const userData = {
        id: profile.id,
        matricula: profile.matricula,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        graduacao: profile.graduacao,
        validade_certificacao: profile.validade_certificacao,
        tipo_sanguineo: profile.tipo_sanguineo,
        status: profile.status,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      // Salvar dados COMPLETOS no localStorage
      localStorage.setItem("pac_user_data", JSON.stringify(userData));
      console.log("💾 Dados completos salvos no localStorage");

      // Criar sessão local simples para o auth
      const sessionData = {
        user: {
          id: profile.id,
          email: profile.email,
          user_metadata: {
            matricula: profile.matricula,
            full_name: profile.full_name,
            role: profile.role,
          },
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hora
      };

      localStorage.setItem("supabase.auth.token", JSON.stringify(sessionData));

      // Aguardar um pouco para mostrar o alerta
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirecionar para o perfil
      window.location.href = "/perfil";
    } catch (err: any) {
      console.error("Erro no login:", err);
      showAlert("error", "Erro inesperado ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getAlertVariant = () => {
    if (!alert) return "default";
    switch (alert.type) {
      case "error":
        return "destructive";
      case "success":
        return "default";
      case "warning":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-offwhite to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos de Background Premium */}
      <div className="absolute inset-0 bg-grid-blue-500/5 bg-[size:60px_60px]" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md relative z-10">
        {/* Cabeçalho Refinado com Logo Grande */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-6 mb-8 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Logo Grande e Centralizada */}
            <div className="relative">
              <div
                className={`absolute transition-all duration-300 ${
                  isHovered ? "scale-105" : "scale-100"
                }`}
              />
              <div className="relative">
                <Image
                  src="/images/logos/logo.webp"
                  alt="Patrulha Aérea Civil"
                  width={140}
                  height={140}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Texto abaixo da logo */}
            <div className="text-center">
              <h1 className="font-bebas text-3xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent tracking-widest uppercase leading-none mb-2">
                PATRULHA AÉREA CIVIL
              </h1>
              <p className="text-gray-600 text-base font-medium leading-tight">
                Serviço Humanitário de Excelência
              </p>

              {/* Badge de Sistema */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full border border-blue-200 shadow-sm mt-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-blue-700 text-sm font-semibold tracking-wide">
                  Sistema de Autenticação
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Card de Login Premium */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <CardContent className="p-8">
            {/* Header do Card */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bebas text-gray-800 text-center mb-2 tracking-wide">
                ACESSO DO AGENTE
              </h2>
              <p className="text-gray-500 text-sm">
                Entre com suas credenciais de acesso
              </p>
            </div>

            {/* Alert Refinado */}
            {alert && (
              <Alert
                variant={getAlertVariant()}
                className="mb-6 border-l-4 rounded-lg animate-in fade-in duration-500"
                style={{
                  borderLeftColor:
                    alert.type === "error"
                      ? "#ef4444"
                      : alert.type === "warning"
                      ? "#f59e0b"
                      : "#10b981",
                }}
              >
                <AlertDescription className="font-medium">
                  {alert.message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Campo Matrícula Premium */}
              <div className="space-y-3">
                <label className="block text-gray-800 text-sm font-semibold">
                  Matrícula do Agente
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    value={matricula}
                    onChange={handleMatriculaChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full text-base py-3 px-4 font-medium tracking-wider border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-300"
                    required
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">
                  Formato: XXX.XXX.XXX-XX (11 dígitos)
                </p>
              </div>

              {/* Botão Entrar Premium */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                {loading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center relative z-10">
                    <svg
                      className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <span>Entrar no Sistema</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Separador Premium */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/60"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500 font-medium rounded-full border border-gray-200">
                  ou
                </span>
              </div>
            </div>

            {/* Botão Voltar Premium */}
            <Link href="/">
              <Button
                variant="outline"
                className="w-full group bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 font-medium py-3 text-base rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg
                  className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Voltar para o Site
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer Premium */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600 text-xs font-semibold">
              Sistema Online
            </span>
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
          </div>
          <p className="text-gray-400 text-xs">
            Protegido com criptografia • v2.4.1
          </p>
        </div>
      </div>
    </div>
  );
}
