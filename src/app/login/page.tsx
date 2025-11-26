"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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

  const router = useRouter();
  const supabase = createClient();

  // Verificar se usuário já está logado
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          window.location.href = "/perfil";
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };
    checkUser();
  }, [supabase]);

  const showAlert = (
    type: "error" | "success" | "warning",
    message: string
  ) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const formatMatricula = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6
      )}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
      6,
      9
    )}-${numbers.slice(9, 11)}`;
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
      const matriculaLimpa = matricula.replace(/\D/g, "");

      if (matriculaLimpa.length !== 11) {
        showAlert("error", "Matrícula deve ter 11 dígitos");
        setLoading(false);
        return;
      }

      console.log("🔍 Buscando perfil com matrícula:", matriculaLimpa);

      // ✅ BUSCAR PERFIL COM HEADERS CORRETOS
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("matricula", matriculaLimpa)
        .single();

      if (profileError) {
        console.error("❌ Erro ao buscar perfil:", profileError);

        if (profileError.code === "406") {
          showAlert(
            "error",
            "Erro de configuração do servidor. Contate o administrador."
          );
        } else if (profileError.code === "PGRST116") {
          showAlert("error", "Matrícula não encontrada no sistema");
        } else {
          showAlert("error", "Erro ao acessar o banco de dados");
        }

        setLoading(false);
        return;
      }

      if (!profile) {
        showAlert("error", "Matrícula não cadastrada no sistema");
        setLoading(false);
        return;
      }

      console.log("✅ Perfil encontrado:", profile);

      if (!profile.status) {
        showAlert("error", "Sua conta está inativa. Contate o administrador.");
        setLoading(false);
        return;
      }

      // ✅ LOGIN AUTOMÁTICO COM MATRÍCULA COMO SENHA
      console.log("🔐 Tentando login com:", {
        email: profile.email,
        password: matriculaLimpa,
      });

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: profile.email,
          password: matriculaLimpa,
        });

      if (authError) {
        console.error("❌ Erro no login:", authError);

        if (authError.message.includes("Invalid login credentials")) {
          showAlert(
            "error",
            "Credenciais inválidas. A senha pode estar incorreta."
          );
        } else {
          showAlert("error", "Erro interno no login. Tente novamente.");
        }

        setLoading(false);
        return;
      }

      console.log("✅ Login bem-sucedido:", authData.user);

      // Salvar dados no localStorage
      localStorage.setItem("pac_user_data", JSON.stringify(profile));

      const welcomeMessage =
        profile.role === "admin"
          ? `Bem-vindo, Administrador ${profile.full_name || ""}!`
          : `Bem-vindo, ${profile.full_name || "Agente"}!`;

      showAlert("success", welcomeMessage);

      // Redirecionar após breve delay
      setTimeout(() => {
        window.location.href = "/perfil";
      }, 1500);
    } catch (err: any) {
      console.error("💥 Erro inesperado no login:", err);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animations */}
      <motion.div
        className="absolute inset-0 bg-grid-blue-500/5 bg-[size:60px_60px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-indigo-400/5 rounded-full blur-3xl"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-6 mb-8 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="relative w-32 h-32"
            >
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                fill
                className="object-contain drop-shadow-lg"
                priority
                sizes="128px"
              />
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="font-bebas text-3xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent tracking-widest uppercase leading-none mb-2">
                PATRULHA AÉREA CIVIL
              </h1>
              <p className="text-gray-600 text-base font-medium leading-tight">
                Serviço Humanitário de Excelência
              </p>

              <motion.div
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full border border-blue-200 shadow-sm mt-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-blue-700 text-sm font-semibold tracking-wide">
                  Sistema de Autenticação
                </span>
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Card de Login */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-2xl overflow-hidden">
            <CardContent className="p-8">
              {/* Header do Card */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
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
                </motion.div>
                <h2 className="text-2xl font-bebas text-gray-800 text-center mb-2 tracking-wide">
                  ACESSO DO AGENTE
                </h2>
                <p className="text-gray-500 text-sm">
                  Digite sua matrícula para acessar o sistema
                </p>
              </motion.div>

              {/* Alert */}
              <AnimatePresence>
                {alert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                  >
                    <Alert
                      variant={getAlertVariant()}
                      className="border-l-4 rounded-lg"
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
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Campo Matrícula */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
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
                    <motion.div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      whileHover={{ scale: 1.1 }}
                    >
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
                    </motion.div>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Formato: XXX.XXX.XXX-XX (11 dígitos)
                  </p>
                </motion.div>

                {/* Botão Entrar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%]"
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                    />

                    {loading ? (
                      <div className="flex items-center justify-center relative z-10">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="rounded-full h-5 w-5 border-b-2 border-white mr-3"
                        />
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center relative z-10">
                        <motion.svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          initial={{ x: 0 }}
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </motion.svg>
                        <span>Entrar no Sistema</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Separador */}
              <motion.div
                className="relative my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/60"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-gray-500 font-medium rounded-full border border-gray-200">
                    ou
                  </span>
                </div>
              </motion.div>

              {/* Botão Voltar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full group bg-white/80 backdrop-blur-sm hover:bg-gray-50 border-2 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 font-medium py-3 text-base rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <motion.svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ x: 0 }}
                      whileHover={{ x: -2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </motion.svg>
                    Voltar para o Site
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.div
              className="w-1 h-1 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-green-600 text-xs font-semibold">
              Sistema Seguro
            </span>
            <motion.div
              className="w-1 h-1 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </div>
          <p className="text-gray-400 text-xs">Autenticação Direta • v2.4.1</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
