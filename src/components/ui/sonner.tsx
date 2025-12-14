// components/ui/sonner.tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <FaCheckCircle className="size-4" />,
        info: <FaInfoCircle className="size-4" />,
        warning: <FaExclamationTriangle className="size-4" />,
        error: <FaExclamationCircle className="size-4" />,
        loading: <FaSpinner className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          // Sucesso - usando suas cores
          success: "!bg-success-50 !text-success-700 !border-success-200",
          // Erro
          error: "!bg-error-50 !text-error-700 !border-error-200",
          // Aviso
          warning: "!bg-warning-50 !text-warning-700 !border-warning-200",
          // Informação
          info: "!bg-navy-50 !text-navy-700 !border-navy-200",
          // Loading
          loading: "!bg-navy-50 !text-slate-700 !border-navy-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
