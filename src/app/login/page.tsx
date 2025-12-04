"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Toaster } from "@/components/ui/sonner";
import {
  RiUserLine,
  RiAlertLine,
  RiCheckLine,
  RiLockLine,
  RiLoginCircleLine,
  RiHomeLine,
  RiUserSharedLine,
  RiShieldKeyholeLine,
} from "react-icons/ri";

// Schema de validação
const loginSchema = z.object({
  matricula: z
    .string()
    .min(1, "Matrícula é obrigatória")
    .refine((val) => val.replace(/\D/g, "").length === 11, {
      message: "Matrícula deve ter 11 dígitos",
    }),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Configurações de segurança locais
const SECURITY_CONFIG = {
  MAX_ATTEMPTS: 5,
  LOCK_TIME_MINUTES: 15,
};

// Tipos de status do agente
type AgentStatus = "active" | "inactive" | "suspended" | "not_found";

// Tipos específicos para status
type ProfileStatus =
  | boolean
  | "true"
  | "false"
  | "t"
  | "f"
  | "1"
  | "0"
  | 1
  | 0
  | null
  | undefined;

// 🔐 Função robusta para verificar status - COM TIPOS ESPECÍFICOS
function isProfileActive(status: ProfileStatus): boolean {
  if (status === undefined || status === null) {
    return false;
  }

  // Boolean true
  if (status === true) return true;

  // String 'true' ou 't' ou '1'
  if (typeof status === "string") {
    const normalized = status.toLowerCase().trim();
    return normalized === "true" || normalized === "t" || normalized === "1";
  }

  // Número 1
  if (typeof status === "number") {
    return status === 1;
  }

  return false;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    type: "error" | "success" | "warning" | "info";
    message: string;
  } | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);

  const supabase = createClient();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      matricula: "",
      rememberMe: false,
    },
  });

  const showAlert = useCallback(
    (type: "error" | "success" | "warning" | "info", message: string) => {
      setAlert({ type, message });
      setTimeout(() => setAlert(null), 5000);
    },
    []
  );

  const formatMatricula = useCallback((value: string) => {
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
  }, []);

  const handleMatriculaChange = useCallback(
    (value: string) => {
      const formatted = formatMatricula(value);
      form.setValue("matricula", formatted, { shouldValidate: true });
    },
    [form, formatMatricula]
  );

  // 🔒 Funções de segurança local
  const checkSecurityLock = useCallback(() => {
    const lockData = localStorage.getItem("pac_security_lock");
    if (lockData) {
      try {
        const { attempts, lockUntil } = JSON.parse(lockData);
        setFailedAttempts(attempts);

        if (lockUntil > Date.now()) {
          setIsLocked(true);
          setLockTime(lockUntil);
        }
      } catch (error) {
        console.error("Erro ao ler bloqueio:", error);
        localStorage.removeItem("pac_security_lock");
      }
    }
  }, []);

  const updateSecurityLock = useCallback(
    (increment: boolean = true) => {
      const newAttempts = increment ? failedAttempts + 1 : 0;
      setFailedAttempts(newAttempts);

      if (newAttempts >= SECURITY_CONFIG.MAX_ATTEMPTS) {
        const lockUntil =
          Date.now() + SECURITY_CONFIG.LOCK_TIME_MINUTES * 60 * 1000;
        setIsLocked(true);
        setLockTime(lockUntil);

        localStorage.setItem(
          "pac_security_lock",
          JSON.stringify({
            attempts: newAttempts,
            lockUntil,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        localStorage.setItem(
          "pac_security_lock",
          JSON.stringify({
            attempts: newAttempts,
            lockUntil: null,
            timestamp: new Date().toISOString(),
          })
        );
      }
    },
    [failedAttempts]
  );

  // 🎯 FUNÇÃO PRINCIPAL DE LOGIN - MODIFICADA
  const handleSubmit = async (data: LoginFormData) => {
    if (isLocked) {
      showAlert("error", "Acesso temporariamente bloqueado por segurança");
      return;
    }

    setLoading(true);
    setAgentStatus(null);
    console.log("🚀 Iniciando processo de login...");

    try {
      const matriculaLimpa = data.matricula.replace(/\D/g, "");
      console.log("📝 Matrícula processada:", matriculaLimpa);

      // 🔍 PASSO 1: Buscar perfil via API
      console.log("🌐 Consultando API de autenticação...");
      const apiResponse = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matricula: matriculaLimpa }),
      });

      // Primeiro verifica o status HTTP
      if (!apiResponse.ok) {
        if (apiResponse.status === 404) {
          updateSecurityLock();
          setAgentStatus("not_found");
          showAlert(
            "error",
            "Matrícula não encontrada, você não faz parte da PAC - Patrulha Aérea Civil."
          );
          setLoading(false);
          return;
        }

        // Outros erros HTTP
        updateSecurityLock();
        showAlert("error", `Erro na API (${apiResponse.status})`);
        setLoading(false);
        return;
      }

      const apiResult = await apiResponse.json();
      console.log("📊 Resposta completa da API:", apiResult);

      if (!apiResult.success) {
        updateSecurityLock();

        // A API pode retornar erro mesmo para inativos (se ainda estiver bloqueando)
        if (apiResult.error === "PROFILE_NOT_FOUND") {
          setAgentStatus("not_found");
          showAlert(
            "error",
            "Matrícula não encontrada, você não faz parte da PAC - Patrulha Aérea Civil."
          );
        } else if (apiResult.error === "IP_BLOCKED") {
          showAlert(
            "error",
            apiResult.message || "IP temporariamente bloqueado"
          );
        } else {
          showAlert(
            "error",
            apiResult.message || "Erro ao verificar matrícula"
          );
        }

        setLoading(false);
        return;
      }

      // ✅ PERFIL ENCONTRADO (ativo ou inativo)
      const {
        email,
        id: profileId,
        status: profileStatus,
        role: profileRole,
      } = apiResult.data;

      const senhaPadrao = apiResult.security.default_password;
      console.log("✅ Credenciais encontradas:", {
        email,
        profileId,
        status: profileStatus,
        statusType: typeof profileStatus,
        role: profileRole,
      });

      // 🔐 Determinar status REAL do agente
      const isActive = isProfileActive(profileStatus);
      const isAdmin = profileRole === "admin";

      if (!isActive) {
        setAgentStatus("inactive");
        showAlert(
          "warning",
          "Sua conta está inativa. Acesso limitado ao perfil."
        );
      } else {
        setAgentStatus("active");
      }

      // 🔐 PASSO 2: Tentar login com Supabase Auth
      console.log("🔑 Autenticando com Supabase...");
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password: senhaPadrao,
        });

      if (authError) {
        updateSecurityLock();
        console.error("❌ Erro de autenticação:", authError);

        if (authError.message.includes("Invalid login credentials")) {
          showAlert("error", "Credenciais inválidas. Verifique sua matrícula.");
        } else {
          showAlert("error", `Erro de autenticação: ${authError.message}`);
        }
        return;
      }

      console.log("✅ Autenticação bem-sucedida");

      // 🔒 PASSO 3: Verificar consistência
      if (authData.user.id !== profileId) {
        console.error("❌ Inconsistência nos IDs");
        await supabase.auth.signOut();
        updateSecurityLock();
        showAlert("error", "Erro de verificação de segurança");
        return;
      }

      // 🎉 PASSO 4: Login bem-sucedido
      updateSecurityLock(false);

      // Salvar matrícula se solicitado
      if (data.rememberMe) {
        localStorage.setItem(
          "pac_remember_matricula",
          JSON.stringify({
            matricula: data.matricula,
            rememberMe: true,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        localStorage.removeItem("pac_remember_matricula");
      }

      // 📋 PASSO 5: Atualizar metadados do usuário
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role, avatar_url, graduacao, status")
          .eq("id", authData.user.id)
          .single();

        if (profile) {
          await supabase.auth.updateUser({
            data: {
              full_name: profile.full_name,
              role: profile.role,
              avatar_url: profile.avatar_url,
              graduacao: profile.graduacao,
              status: profile.status,
              isActive: isProfileActive(profile.status),
            },
          });
        }
      } catch (updateError) {
        console.warn("⚠️ Não foi possível atualizar metadados:", updateError);
      }

      // ✅ Mostrar mensagem baseada no status
      if (!isActive) {
        showAlert(
          "warning",
          "Login realizado! Sua conta está inativa. Acesso limitado ao perfil."
        );

        // 🔹 AGENTE INATIVO: Vai para perfil
        setTimeout(() => {
          window.location.href = "/perfil";
        }, 2000);
      } else {
        showAlert("success", "Login realizado com sucesso! Redirecionando...");

        // 🔹 VERIFICAÇÃO: Administrador tem acesso total?
        // Se quiser que admin tenha acesso total, mantenha esta lógica:
        if (isAdmin) {
          setTimeout(() => {
            window.location.href = "/admin/dashboard";
          }, 1500);
        } else {
          // 🔹 AGENTE ATIVO (não admin): Também vai apenas para perfil
          setTimeout(() => {
            window.location.href = "/perfil";
          }, 1500);
        }
      }
    } catch (error: unknown) {
      updateSecurityLock();
      console.error("💥 Erro geral no login:", error);
      showAlert("error", "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // 🕐 Gerenciar contador de bloqueio
  useEffect(() => {
    checkSecurityLock();

    if (isLocked && lockTime) {
      const timer = setInterval(() => {
        const remaining = lockTime - Date.now();
        if (remaining <= 0) {
          setIsLocked(false);
          setLockTime(null);
          setFailedAttempts(0);
          localStorage.removeItem("pac_security_lock");
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockTime, checkSecurityLock]);

  // 📝 Carregar matrícula lembrada
  useEffect(() => {
    try {
      const remembered = localStorage.getItem("pac_remember_matricula");
      if (remembered) {
        const { matricula, rememberMe } = JSON.parse(remembered);
        form.setValue("matricula", matricula);
        form.setValue("rememberMe", rememberMe);
      }
    } catch (error) {
      console.error("Erro ao carregar matrícula:", error);
    }
  }, [form]);

  // 🏠 Verificar sessão existente
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Verificar status do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("status, role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          // Redirecionar baseado no role
          if (profile.role === "admin") {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/perfil";
          }
        }
      }
    };

    checkSession();
  }, [supabase]);

  // Função para mostrar tempo restante do bloqueio
  const getRemainingTime = () => {
    if (!lockTime) return "";
    const remaining = Math.ceil((lockTime - Date.now()) / 1000 / 60);
    return `${remaining} minuto${remaining !== 1 ? "s" : ""}`;
  };

  // Renderização do componente
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-grid-blue-500/5 bg-[size:40px_40px] sm:bg-[size:60px_60px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/5 rounded-full blur-2xl sm:blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 bg-indigo-500/5 rounded-full blur-xl sm:blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="w-full max-w-sm sm:max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Header Centralizado */}
        <motion.div
          className="text-center mb-4 sm:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Link
            href="/"
            className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 mb-4 sm:mb-5 group"
          >
            {/* Logo */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex justify-center">
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                fill
                className="object-contain drop-shadow-lg"
                priority
                sizes="(max-width: 640px) 80px, 112px"
              />
            </div>

            {/* Textos */}
            <div className="text-center space-y-2 w-full">
              <div className="flex flex-col items-center justify-center space-y-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent tracking-tight sm:tracking-widest uppercase leading-tight font-bebas">
                  PATRULHA AÉREA CIVIL
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm font-medium leading-tight font-inter max-w-md mx-auto">
                  COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-4 sm:p-5 md:p-6">
              {/* Card Header */}
              <motion.div
                className="text-center mb-3 sm:mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 text-center mb-1 sm:mb-2 tracking-tight sm:tracking-wide whitespace-nowrap font-bebas">
                  ACESSO DO AGENTE
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm whitespace-nowrap font-inter">
                  Digite sua matrícula para acessar o sistema
                </p>
              </motion.div>

              {/* Status Indicator */}
              <AnimatePresence>
                {agentStatus && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-3 sm:mb-4"
                  >
                    {agentStatus === "inactive" && (
                      <Alert className="bg-amber-50 border-amber-200 text-amber-800 border-l-4 border-l-amber-500">
                        <div className="flex items-center gap-2">
                          <RiUserSharedLine className="w-4 h-4 flex-shrink-0" />
                          <AlertDescription className="text-sm font-medium">
                            Conta inativa - Acesso limitado ao perfil
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}
                    {agentStatus === "active" && (
                      <Alert className="bg-green-50 border-green-200 text-green-800 border-l-4 border-l-green-500">
                        <div className="flex items-center gap-2">
                          <RiCheckLine className="w-4 h-4 flex-shrink-0" />
                          <AlertDescription className="text-sm font-medium">
                            Conta ativa - Acesso completo
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Alerts */}
              <AnimatePresence>
                {alert && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-3 sm:mb-4"
                  >
                    <Alert
                      variant={
                        alert.type === "error"
                          ? "destructive"
                          : alert.type === "warning"
                          ? "warning"
                          : alert.type === "info"
                          ? "default"
                          : "default"
                      }
                      className={`border-l-4 rounded-lg text-sm shadow-sm ${
                        alert.type === "info"
                          ? "bg-blue-50 border-blue-200 text-blue-800 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {alert.type === "error" && (
                          <RiAlertLine className="w-4 h-4 flex-shrink-0" />
                        )}
                        {alert.type === "warning" && (
                          <RiAlertLine className="w-4 h-4 flex-shrink-0 text-yellow-600" />
                        )}
                        {alert.type === "success" && (
                          <RiCheckLine className="w-4 h-4 flex-shrink-0 text-green-600" />
                        )}
                        {alert.type === "info" && (
                          <RiShieldKeyholeLine className="w-4 h-4 flex-shrink-0 text-blue-600" />
                        )}
                        <AlertDescription className="font-medium font-inter break-words flex-1">
                          {alert.message}
                        </AlertDescription>
                      </div>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bloqueio de Segurança */}
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert variant="destructive" className="mb-3 sm:mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <RiLockLine className="w-4 h-4 flex-shrink-0" />
                      <AlertDescription className="break-words flex-1">
                        Acesso bloqueado por segurança. Tente novamente em{" "}
                        <strong>{getRemainingTime()}</strong>.
                      </AlertDescription>
                    </div>
                  </Alert>
                </motion.div>
              )}

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Matrícula Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <FormField
                      control={form.control}
                      name="matricula"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-inter">
                            Matrícula do Agente
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type="text"
                                placeholder="000.000.000-00"
                                maxLength={14}
                                onChange={(e) =>
                                  handleMatriculaChange(e.target.value)
                                }
                                className="text-sm sm:text-base py-2 sm:py-2.5 pl-3 sm:pl-4 pr-10 sm:pr-12 font-medium tracking-wider h-9 sm:h-11 transition-all duration-300 focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                                disabled={isLocked || loading}
                              />
                              <div className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <RiUserLine className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-colors duration-300" />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Remember Me */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 sm:p-2.5 hover:border-navy-300 transition-colors duration-300">
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <FormLabel className="text-xs sm:text-sm whitespace-nowrap font-inter">
                              Lembrar matrícula
                            </FormLabel>
                            <p className="text-xs text-gray-500 break-words font-inter">
                              Salvar matrícula neste dispositivo
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={loading}
                              className="scale-90 sm:scale-100 data-[state=checked]:bg-navy-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLocked || loading}
                      className="w-full group relative overflow-hidden bg-gradient-to-br from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-inter h-10 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Shine Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%]"
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                      />

                      <div className="flex items-center justify-center relative z-10">
                        {loading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2 sm:mr-3"
                            />
                            <span className="text-xs sm:text-sm font-inter">
                              Entrando...
                            </span>
                          </>
                        ) : (
                          <>
                            <RiLoginCircleLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 transition-transform duration-300 group-hover:scale-110" />
                            <span className="text-xs sm:text-sm whitespace-nowrap font-inter">
                              Acessar Sistema
                            </span>
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                </form>
              </Form>

              {/* Separator */}
              <motion.div
                className="relative my-3 sm:my-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/60"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 sm:px-3 text-gray-500 font-medium rounded-full border border-gray-200 font-inter text-xs sm:text-sm">
                    ou
                  </span>
                </div>
              </motion.div>

              {/* Back to Site */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full group bg-white/80 backdrop-blur-sm hover:bg-gray-50 border-2 border-gray-200 text-gray-600 hover:text-navy-600 hover:border-navy-600 font-medium py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-300 shadow-sm hover:shadow-md font-inter h-9 sm:h-10"
                  >
                    <RiHomeLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2 transition-transform duration-300 group-hover:scale-110" />
                    <span className="whitespace-nowrap font-inter">
                      Voltar para o Site
                    </span>
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-xs text-gray-500 font-inter">
            Sistema de Gerenciamento da Patrulha Aérea Civil
          </p>
          <p className="text-xs text-gray-400 mt-1 font-inter">
            v2.0 • Acesso seguro e criptografado
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
