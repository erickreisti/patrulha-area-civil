"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps, toast, ToastT } from "sonner";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";
import { cn } from "@/lib/utils/cn"; // <-- CORREÇÃO AQUI: aponta para o arquivo correto

// Tipos para as opções do toast
type ToastOptions = Omit<ToastT, "id" | "type" | "title"> & {
  description?: string;
  [key: string]: unknown;
};

type PromiseMessages = {
  loading: string;
  success: string;
  error: string;
};

type PromiseOptions = ToastOptions & {
  description?: string;
};

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
      closeButton={false}
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
            "relative top-4 right-4",
          ),

          // Estilos por tipo - CORES MAIS ESCURAS COM TEXTO BRANCO
          success: cn(
            "!bg-success-700 !text-white",
            "!border-success-600 !shadow-success/30",
            "[&>button]:!text-white [&>button:hover]:!text-success-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-success-600",
          ),

          error: cn(
            "!bg-error-700 !text-white",
            "!border-error-600 !shadow-error/30",
            "[&>button]:!text-white [&>button:hover]:!text-error-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-error-600",
          ),

          warning: cn(
            "!bg-warning-600 !text-white",
            "!border-warning-500 !shadow-warning/30",
            "[&>button]:!text-white [&>button:hover]:!text-warning-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-warning-500",
          ),

          info: cn(
            "!bg-navy-700 !text-white",
            "!border-navy-600 !shadow-navy/30",
            "[&>button]:!text-white [&>button:hover]:!text-navy-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-navy-600",
          ),

          loading: cn(
            "!bg-navy-700 !text-white",
            "!border-navy-600 !shadow-navy/30",
            "[&>button]:!text-white [&>button:hover]:!text-navy-100",
            "[&>button]:!border-white/20 [&>button:hover]:!bg-navy-600",
          ),

          // Componentes internos
          content: "font-medium text-sm",
          description: "text-sm opacity-90 mt-1",
          icon: "mt-0.5",
        },
        style: {
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

// Helper functions para facilitar o uso
const toastHelpers = {
  // Funções básicas
  success: (title: string, description?: string, options?: ToastOptions) => {
    return toast.success(title, { description, ...options });
  },

  error: (title: string, description?: string, options?: ToastOptions) => {
    return toast.error(title, { description, ...options });
  },

  warning: (title: string, description?: string, options?: ToastOptions) => {
    return toast.warning(title, { description, ...options });
  },

  info: (title: string, description?: string, options?: ToastOptions) => {
    return toast.info(title, { description, ...options });
  },

  loading: (title: string, description?: string, options?: ToastOptions) => {
    return toast.loading(title, { description, ...options });
  },

  // Promise helper
  promise: async <T,>(
    promise: Promise<T>,
    messages: PromiseMessages,
    options?: PromiseOptions,
  ) => {
    const toastId = toast.loading(messages.loading, {
      description: options?.description,
      ...options,
    });

    try {
      const result = await promise;
      toast.success(messages.success, {
        id: toastId,
        description: options?.description,
        ...options,
      });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(messages.error, {
        id: toastId,
        description: options?.description || errorMessage,
        ...options,
      });
      throw error;
    }
  },

  // Função para criar toasts customizados
  custom: (title: string, options?: ToastOptions) => {
    return toast(title, options);
  },

  // Função para dismiss
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

export { Toaster, toast, toastHelpers };
export type { ToastOptions, PromiseMessages, PromiseOptions };
