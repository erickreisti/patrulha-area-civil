// src/hooks/useToast.ts - VERSÃO CORRIGIDA
"use client";

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // CORREÇÃO: Usar a sintaxe correta de objeto
  const toast = {
    success: (message: string, title?: string) =>
      showToast("success", message, title),
    error: (message: string, title?: string) =>
      showToast("error", message, title),
    warning: (message: string, title?: string) =>
      showToast("warning", message, title),
    info: (message: string, title?: string) =>
      showToast("info", message, title),
  };

  return {
    toasts,
    toast,
    dismissToast,
  };
}
