"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// Importe suas Server Actions
import { loginWithMatricula, performLogin } from "@/app/actions/auth/login";
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
import { Toaster, toast } from "@/components/ui/sonner";
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

// Tipo para dados do usuário
interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "agent";
  status: boolean;
  matricula: string;
  avatar_url: string | null;
  graduacao: string | null;
  security: {
    default_password: string;
    requires_password_change: boolean;
  };
}

export default function LoginPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const router = useRouter();

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
  }, [form]);

  // Verificar se já está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("sb-auth-token");
      if (token) {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, []);

  const handleMatriculaChange = (value: string) => {
    const formatted = formatMatricula(value);
    form.setValue("matricula", formatted, { shouldValidate: true });
  };

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Buscar informações do usuário pela matrícula
      const formData = new FormData();
      formData.append("matricula", data.matricula.replace(/\D/g, ""));

      const userResult = await loginWithMatricula(formData);

      if (!userResult.success) {
        setError(userResult.error || "Matrícula não encontrada");
        setIsLoading(false);
        return;
      }

      const userData = userResult.data as UserData;

      // Salvar informações do usuário temporariamente
      setUserInfo(userData);

      // 2. Fazer login com email e senha padrão
      const loginFormData = new FormData();
      loginFormData.append("email", userData.email);
      loginFormData.append("password", userData.security.default_password);

      const loginResult = await performLogin(loginFormData);

      if (!loginResult.success) {
        setError(loginResult.error || "Erro ao fazer login");
        setIsLoading(false);
        return;
      }

      // 3. Sucesso - salvar matrícula se solicitado
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

      // 4. Mostrar mensagem de sucesso
      toast.success("Login realizado com sucesso!");

      // 5. Redirecionar baseado no role
      setTimeout(() => {
        if (userData.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/perfil");
        }
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro no login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Se já estiver autenticado, mostrar mensagem
  if (isAuthenticated && userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/30 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-blue-500/20 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <RiCheckLine className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2 text-blue-800">
              Já autenticado
            </h2>
            <p className="text-gray-600 mb-4">
              Você já está logado como{" "}
              <span className="font-medium text-blue-700">
                {userInfo.email}
              </span>
            </p>
            <div className="space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (userInfo.role === "admin") {
                    router.push("/admin/dashboard");
                  } else {
                    router.push("/perfil");
                  }
                }}
              >
                Ir para o perfil
              </Button>
              <Button
                variant="outline"
                className="w-full border-blue-200 hover:bg-blue-50 text-blue-700"
                onClick={() => {
                  localStorage.removeItem("sb-auth-token");
                  localStorage.removeItem("pac_remember_matricula");
                  setIsAuthenticated(false);
                  setUserInfo(null);
                }}
              >
                Sair e fazer novo login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-blue-200/10"
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
          <Link href="/" className="flex flex-col items-center space-y-4 group">
            <div className="relative w-28 h-28 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                fill
                className={`object-contain transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                priority
                onLoad={() => setImageLoaded(true)}
                sizes="112px"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-800">
                PATRULHA AÉREA CIVIL
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Comando Operacional no Estado do Rio de Janeiro
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
          <Card className="bg-white border-blue-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-blue-800 mb-1">
                  ACESSO DO AGENTE
                </h2>
                <p className="text-gray-500 text-sm">Sistema de Autenticação</p>
              </div>

              {/* Alertas */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <RiAlertLine className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
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
                        <FormLabel className="text-gray-700 font-medium">
                          Matrícula do Agente
                        </FormLabel>
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
                              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
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
                          <FormLabel className="text-gray-700 font-medium">
                            Lembrar matrícula neste dispositivo
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <RiLoginCircleLine className="mr-2 h-4 w-4" />
                        Acessar Sistema
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Separador */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-gray-500 text-sm">
                    ou
                  </span>
                </div>
              </div>

              {/* Voltar para site */}
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <RiHomeLine className="mr-2 h-4 w-4" />
                  Voltar para o Site Público
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-xs text-gray-500">
            Sistema de Gerenciamento da Patrulha Aérea Civil
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © {new Date().getFullYear()} - Todos os direitos reservados
          </p>
          <p className="text-[10px] text-gray-400/70 mt-1">
            Acesso seguro e criptografado
          </p>
        </motion.div>
      </div>
    </div>
  );
}
