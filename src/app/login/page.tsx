// src/app/login/page.tsx - VERSÃO CORRIGIDA
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [matricula, setMatricula] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success" | "warning";
    message: string;
  } | null>(null);
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
          window.location.href = "/agent/perfil";
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
        .select("*") // ✅ BUSCAR TODOS OS CAMPOS
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
      window.location.href = "/agent/perfil";
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

          {/* Alert do Shadcn */}
          {alert && (
            <Alert variant={getAlertVariant()} className="mb-4">
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo Matrícula */}
            <div className="space-y-2">
              <label className="block text-gray-800 text-sm font-semibold">
                Matrícula do Agente
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={matricula}
                  onChange={handleMatriculaChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full text-base py-3 px-4 font-medium tracking-wider"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-gray-500 text-xs">
                Formato: XXX.XXX.XXX-XX (11 dígitos)
              </p>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-light hover:bg-navy text-white font-semibold py-3.5 text-lg rounded-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Entrando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
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
          <Link href="/">
            <Button
              variant="outline"
              className="w-full border-gray-200 text-gray-600 hover:text-navy-light hover:border-navy-light hover:bg-navy-light/10 font-medium py-3 text-base rounded-xl transition-all duration-300"
            >
              Voltar para o Site
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
