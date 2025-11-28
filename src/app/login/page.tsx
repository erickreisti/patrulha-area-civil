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
import { FaUser, FaShieldAlt, FaHistory } from "react-icons/fa";

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

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    type: "error" | "success" | "warning";
    message: string;
  } | null>(null);

  const supabase = createClient();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      matricula: "",
      rememberMe: false,
    },
  });

  const showAlert = useCallback(
    (type: "error" | "success" | "warning", message: string) => {
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

  const checkExistingSession = useCallback(async () => {
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
  }, [supabase.auth]);

  const loadRememberedMatricula = useCallback(() => {
    try {
      const remembered = localStorage.getItem("pac_remember_matricula");
      if (remembered) {
        const { matricula, rememberMe } = JSON.parse(remembered);
        form.setValue("matricula", matricula);
        form.setValue("rememberMe", rememberMe);
      }
    } catch (error) {
      console.error("Erro ao carregar matrícula lembrada:", error);
    }
  }, [form]);

  const saveRememberedMatricula = useCallback(
    (matricula: string, rememberMe: boolean) => {
      if (rememberMe) {
        localStorage.setItem(
          "pac_remember_matricula",
          JSON.stringify({
            matricula,
            rememberMe: true,
          })
        );
      } else {
        localStorage.removeItem("pac_remember_matricula");
      }
    },
    []
  );

  const checkSecurityLock = useCallback(() => {
    const lockData = localStorage.getItem("pac_security_lock");
    if (lockData) {
      const { attempts, lockUntil } = JSON.parse(lockData);
      setFailedAttempts(attempts);

      if (lockUntil > Date.now()) {
        setIsLocked(true);
        setLockTime(lockUntil);
      } else {
        localStorage.removeItem("pac_security_lock");
      }
    }
  }, []);

  useEffect(() => {
    checkExistingSession();
    checkSecurityLock();
    loadRememberedMatricula();
  }, [checkExistingSession, checkSecurityLock, loadRememberedMatricula]);

  useEffect(() => {
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
  }, [isLocked, lockTime]);

  const updateSecurityLock = useCallback(
    (increment: boolean = true) => {
      const newAttempts = increment ? failedAttempts + 1 : 0;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        const lockUntil = Date.now() + 15 * 60 * 1000;
        setIsLocked(true);
        setLockTime(lockUntil);
        localStorage.setItem(
          "pac_security_lock",
          JSON.stringify({
            attempts: newAttempts,
            lockUntil,
          })
        );
      } else {
        localStorage.setItem(
          "pac_security_lock",
          JSON.stringify({
            attempts: newAttempts,
            lockUntil: null,
          })
        );
      }
    },
    [failedAttempts]
  );

  const handleSubmit = async (data: LoginFormData) => {
    if (isLocked) {
      showAlert("error", "Acesso temporariamente bloqueado por segurança");
      return;
    }

    setLoading(true);

    try {
      const matriculaLimpa = data.matricula.replace(/\D/g, "");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, status")
        .eq("matricula", matriculaLimpa)
        .single();

      if (profileError) {
        updateSecurityLock();
        showAlert("error", "Matrícula não encontrada no sistema");
        return;
      }

      if (!profile.status) {
        updateSecurityLock();
        showAlert("error", "Sua conta está inativa. Contate o administrador.");
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: matriculaLimpa,
      });

      if (authError) {
        updateSecurityLock();

        if (authError.message.includes("Invalid login credentials")) {
          showAlert("error", "Credenciais inválidas");
        } else {
          showAlert("error", "Erro ao fazer login");
        }
        return;
      }

      updateSecurityLock(false);
      saveRememberedMatricula(data.matricula, data.rememberMe);

      showAlert("success", `Bem-vindo, ${profile.full_name || "Agente"}!`);

      setTimeout(() => {
        window.location.href = "/perfil";
      }, 1000);
    } catch {
      updateSecurityLock();
      showAlert("error", "Erro inesperado ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const getRemainingTime = () => {
    if (!lockTime) return "";
    const remaining = Math.ceil((lockTime - Date.now()) / 1000 / 60);
    return `${remaining} minuto${remaining !== 1 ? "s" : ""}`;
  };

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

      <motion.div
        className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/5 rounded-full blur-2xl sm:blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="w-full max-w-sm sm:max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header TOTALMENTE CENTRALIZADO */}
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/"
            className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 mb-6 sm:mb-8 group"
          >
            {/* Logo Centralizada */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="relative w-24 h-24 sm:w-32 sm:h-32 flex justify-center"
            >
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                fill
                className="object-contain drop-shadow-lg"
                priority
                sizes="(max-width: 640px) 96px, 128px"
              />
            </motion.div>

            {/* Textos Centralizados */}
            <motion.div
              className="text-center space-y-3 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Título Principal */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tight sm:tracking-widest uppercase leading-tight font-sans">
                  PATRULHA AÉREA CIVIL
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm font-medium leading-tight font-sans max-w-md mx-auto">
                  COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
                </p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-8">
              {/* Card Header */}
              <motion.div
                className="text-center mb-4 sm:mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 text-center mb-1 sm:mb-2 tracking-tight sm:tracking-wide whitespace-nowrap font-sans">
                  ACESSO DO AGENTE
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm whitespace-nowrap font-sans">
                  Digite sua matrícula para acessar o sistema
                </p>
              </motion.div>

              {/* Alerts */}
              <AnimatePresence>
                {alert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 sm:mb-6"
                  >
                    <Alert
                      variant={
                        alert.type === "error" ? "destructive" : "default"
                      }
                      className="border-l-4 rounded-lg text-sm"
                    >
                      <AlertDescription className="font-medium font-sans break-words">
                        {alert.message}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLocked && (
                <Alert variant="destructive" className="mb-4 sm:mb-6 text-sm">
                  <AlertDescription className="break-words">
                    Acesso bloqueado por segurança. Tente novamente em{" "}
                    {getRemainingTime()}.
                  </AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Matrícula Field */}
                  <FormField
                    control={form.control}
                    name="matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
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
                              className="text-sm sm:text-base py-2.5 sm:py-3 pl-3 sm:pl-4 pr-10 sm:pr-12 font-medium tracking-wider h-10 sm:h-12"
                              disabled={isLocked || loading}
                            />
                            <div className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Remember Me */}
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2.5 sm:p-3">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <FormLabel className="text-xs sm:text-sm whitespace-nowrap">
                            Lembrar matrícula
                          </FormLabel>
                          <p className="text-xs text-gray-500 break-words">
                            Salvar matrícula neste dispositivo
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                            className="scale-90 sm:scale-100"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLocked || loading}
                      className="w-full group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 sm:py-3.5 text-sm sm:text-lg rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-sans h-11 sm:h-14"
                    >
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
                              className="rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"
                            />
                            <span className="text-sm sm:text-base">
                              Entrando...
                            </span>
                          </>
                        ) : (
                          <>
                            <FaShieldAlt className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                            <span className="text-sm sm:text-base whitespace-nowrap">
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
                className="relative my-4 sm:my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/60"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 sm:px-3 text-gray-500 font-medium rounded-full border border-gray-200 font-sans text-xs sm:text-sm">
                    ou
                  </span>
                </div>
              </motion.div>

              {/* Back to Site */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full group bg-white/80 backdrop-blur-sm hover:bg-gray-50 border-2 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 font-medium py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 shadow-sm hover:shadow-md font-sans h-11 sm:h-12"
                  >
                    <FaHistory className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="whitespace-nowrap">
                      Voltar para o Site
                    </span>
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-4 sm:mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
            <motion.div
              className="w-1 h-1 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-green-600 text-xs font-semibold font-sans whitespace-nowrap">
              Sistema Seguro
            </span>
            <motion.div
              className="w-1 h-1 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </div>
          <p className="text-gray-400 text-xs font-sans whitespace-nowrap">
            Autenticação Protegida • v2.4.1
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
