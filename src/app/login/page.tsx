"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuthStore } from "@/lib/stores";
import { formatMatricula } from "@/lib/utils/auth-utils";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import {
  RiUserLine,
  RiAlertLine,
  RiCheckLine,
  RiLoginCircleLine,
  RiHomeLine,
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

export default function LoginPage() {
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    login,
    logout,
    user,
    isLoading,
    error: authError,
    isAuthenticated,
  } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      matricula: "",
      rememberMe: false,
    },
  });

  // Carregar matrícula lembrada
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removido form da dependência

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated() && user) {
      // Diferentes redirecionamentos baseados no status
      const redirectPath =
        user.status === "active" ? "/perfil" : "/perfil/inativo";
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1000);
    }
  }, [isAuthenticated, user]);

  const handleMatriculaChange = (value: string) => {
    const formatted = formatMatricula(value);
    form.setValue("matricula", formatted, { shouldValidate: true });
  };

  const handleSubmit = async (data: LoginFormData) => {
    const result = await login(data.matricula.replace(/\D/g, ""));

    if (result.success) {
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
    }
  };

  // Se já estiver autenticado, mostrar mensagem
  if (isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <RiCheckLine className="h-12 w-12 text-green-500 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Já autenticado</h2>
            <p className="text-gray-600 mb-4">
              Você já está logado como {user?.email}
            </p>
            <div className="space-y-2">
              <Button onClick={() => (window.location.href = "/perfil")}>
                Ir para o perfil
              </Button>
              <Button variant="outline" onClick={logout}>
                Sair e fazer novo login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-grid-blue-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Link href="/" className="flex flex-col items-center space-y-4">
            <div className="relative w-24 h-24">
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                width={96}
                height={96}
                className={`object-contain transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                priority
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
                PATRULHA AÉREA CIVIL
              </h1>
              <p className="text-gray-600 text-sm">
                COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Card de Login */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-center mb-4">
                ACESSO DO AGENTE
              </h2>

              {/* Alertas */}
              {authError && (
                <Alert variant="destructive" className="mb-4">
                  <RiAlertLine className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matrícula do Agente</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="000.000.000-00"
                              maxLength={14}
                              onChange={(e) =>
                                handleMatriculaChange(e.target.value)
                              }
                              disabled={isLoading}
                              className="pl-10"
                            />
                            <RiUserLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Lembrar matrícula</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <RiLoginCircleLine className="mr-2" />
                        Acessar Sistema
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Separador */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-gray-500 text-sm">
                    ou
                  </span>
                </div>
              </div>

              {/* Voltar para site */}
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <RiHomeLine className="mr-2" />
                  Voltar para o Site
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-xs text-gray-500">
            Sistema de Gerenciamento da Patrulha Aérea Civil
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Acesso seguro e criptografado
          </p>
        </motion.div>
      </div>
    </div>
  );
}
