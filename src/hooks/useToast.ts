// src/hooks/useToast.ts - VERSÃO CORRIGIDA
"use client";

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface UseToastReturn {
  toasts: Toast[];
  toast: (
    description: string,
    title?: string,
    type?: ToastType,
    duration?: number
  ) => void;
  success: (description: string, title?: string, duration?: number) => void;
  error: (description: string, title?: string, duration?: number) => void;
  warning: (description: string, title?: string, duration?: number) => void;
  info: (description: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (
      description: string,
      title: string = "Notificação",
      type: ToastType = "info",
      duration: number = 5000
    ) => {
      const id = Math.random().toString(36).substring(2, 9);

      const newToast: Toast = {
        id,
        type,
        title,
        description,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = useCallback(
    (
      description: string,
      title: string = "Notificação",
      type: ToastType = "info",
      duration: number = 5000
    ) => {
      return addToast(description, title, type, duration);
    },
    [addToast]
  );

  const success = useCallback(
    (
      description: string,
      title: string = "Sucesso",
      duration: number = 5000
    ) => {
      return addToast(description, title, "success", duration);
    },
    [addToast]
  );

  const error = useCallback(
    (description: string, title: string = "Erro", duration: number = 7000) => {
      return addToast(description, title, "error", duration);
    },
    [addToast]
  );

  const warning = useCallback(
    (description: string, title: string = "Aviso", duration: number = 6000) => {
      return addToast(description, title, "warning", duration);
    },
    [addToast]
  );

  const info = useCallback(
    (
      description: string,
      title: string = "Informação",
      duration: number = 5000
    ) => {
      return addToast(description, title, "info", duration);
    },
    [addToast]
  );

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    removeToast,
  };
}
