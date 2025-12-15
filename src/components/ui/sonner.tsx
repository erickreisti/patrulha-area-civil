"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaSpinner,
  FaUserCheck,
  FaShieldAlt,
  FaBell,
  FaLock,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { cn } from "@/lib/utils";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      visibleToasts={3}
      duration={4000}
      offset={16}
      expand={false}
      closeButton={false} // REMOVIDO O BOTÃO DE FECHAR
      icons={{
        success: <FaCheckCircle className="size-4" />,
        info: <FaInfoCircle className="size-4" />,
        warning: <FaExclamationTriangle className="size-4" />,
        error: <FaExclamationCircle className="size-4" />,
        loading: <FaSpinner className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          // Container principal
          toast: cn(
            "group toast group-[.toaster]:pointer-events-auto",
            "w-full max-w-md rounded-lg border shadow-lg",
            "transition-all duration-300 ease-in-out",
            "relative top-4 right-4"
          ),

          // Estilos por tipo - CORES MAIS ESCURAS COM TEXTO BRANCO
          success: cn(
            "!bg-success-700 !text-white",
            "!border-success-600 !shadow-success/30",
            "[&>button]:!text-white [&>button:hover]:!text-success-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-success-600"
          ),

          error: cn(
            "!bg-error-700 !text-white",
            "!border-error-600 !shadow-error/30",
            "[&>button]:!text-white [&>button:hover]:!text-error-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-error-600"
          ),

          warning: cn(
            "!bg-warning-600 !text-white",
            "!border-warning-500 !shadow-warning/30",
            "[&>button]:!text-white [&>button:hover]:!text-warning-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-warning-500"
          ),

          info: cn(
            "!bg-navy-700 !text-white",
            "!border-navy-600 !shadow-navy/30",
            "[&>button]:!text-white [&>button:hover]:!text-navy-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-navy-600"
          ),

          loading: cn(
            "!bg-navy-700 !text-white",
            "!border-navy-600 !shadow-navy/30",
            "[&>button]:!text-white [&>button:hover]:!text-navy-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-navy-600"
          ),

          // Componentes internos (removido as classes para actionButton e cancelButton)
          content: "font-medium text-sm",
          description: "text-sm opacity-90 mt-1",
          icon: "mt-0.5",
          // Removido actionButton e cancelButton já que não tem botão de fechar
        },
        style: {
          // Garante que fique fixo no topo direito
          position: "fixed",
          zIndex: 9999,
          top: "0",
          right: "0",
          marginTop: "16px",
          marginRight: "16px",
        },
      }}
      {...props}
    />
  );
};

// Helper functions para toast com formatação específica do sistema
const toastHelpers = {
  // Feedback de autenticação
  login: {
    success: (mensagem?: string) => {
      toast.success("Login realizado com sucesso!", {
        description: mensagem || "Redirecionando para o portal...",
        icon: <FaUserCheck className="text-white" />,
        duration: 3000,
      });
    },
    error: (error?: string) => {
      toast.error("Falha no login", {
        description: error || "Verifique sua matrícula e tente novamente.",
        icon: <FaLock className="text-white" />,
        duration: 5000,
      });
    },
    loading: () => {
      return toast.loading("Autenticando...", {
        icon: <FaSpinner className="animate-spin text-white" />,
        duration: 8000,
      });
    },
  },

  // Feedback de logout
  logout: {
    success: () => {
      toast.success("Logout realizado", {
        description: "Você foi desconectado com sucesso.",
        icon: <FaSignOutAlt className="text-white" />,
        duration: 3000,
      });
    },
    error: () => {
      toast.error("Erro no logout", {
        description: "Tente novamente ou limpe o cache do navegador.",
        icon: <FaExclamationCircle className="text-white" />,
        duration: 5000,
      });
    },
  },

  // Feedback de sistema
  system: {
    info: (title: string, message?: string) => {
      toast.info(title, {
        description: message,
        icon: <FaInfoCircle className="text-white" />,
        duration: 4000,
      });
    },
    warning: (title: string, message?: string) => {
      toast.warning(title, {
        description: message,
        icon: <FaExclamationTriangle className="text-white" />,
        duration: 5000,
      });
    },
    error: (title: string, message?: string) => {
      toast.error(title, {
        description: message,
        icon: <FaExclamationCircle className="text-white" />,
        duration: 6000,
      });
    },
    success: (title: string, message?: string) => {
      toast.success(title, {
        description: message,
        icon: <FaCheckCircle className="text-white" />,
        duration: 4000,
      });
    },
  },

  // Feedback de perfil
  profile: {
    updated: () => {
      toast.success("Perfil atualizado", {
        description: "Suas informações foram salvas com sucesso.",
        icon: <FaUser className="text-white" />,
        duration: 4000,
      });
    },
    error: (message?: string) => {
      toast.error("Erro ao atualizar", {
        description: message || "Não foi possível salvar as alterações.",
        icon: <FaExclamationCircle className="text-white" />,
        duration: 5000,
      });
    },
  },

  // Feedback de segurança
  security: {
    warning: (message: string) => {
      toast.warning("Atenção de segurança", {
        description: message,
        icon: <FaShieldAlt className="text-white" />,
        duration: 6000,
      });
    },
    success: (message: string) => {
      toast.success("Segurança confirmada", {
        description: message,
        icon: <FaShieldAlt className="text-white" />,
        duration: 4000,
      });
    },
  },

  // Feedback de notificações
  notification: {
    new: (title: string, message?: string) => {
      toast.info(title, {
        description: message,
        icon: <FaBell className="text-white" />,
        duration: 5000,
      });
    },
  },

  // Funções genéricas (para compatibilidade)
  success: (message: string, description?: string) => {
    toastHelpers.system.success(message, description);
  },

  error: (message: string, description?: string) => {
    toastHelpers.system.error(message, description);
  },

  warning: (message: string, description?: string) => {
    toastHelpers.system.warning(message, description);
  },

  info: (message: string, description?: string) => {
    toastHelpers.system.info(message, description);
  },

  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
    });
  },

  // Versão simplificada para uso no login
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    description?: string
  ) => {
    const toastId = toast.loading(messages.loading, {
      description,
    });

    try {
      const result = await promise;
      toast.success(messages.success, {
        id: toastId,
        description,
        duration: 3000,
      });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(messages.error, {
        id: toastId,
        description: description || errorMessage,
        duration: 5000,
      });
      throw error;
    }
  },
};

export { Toaster, toast, toastHelpers };
