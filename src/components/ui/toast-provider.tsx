// src/components/ui/toast-provider.tsx
"use client";

import { useToast } from "@/hooks/useToast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function ToastProvider() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive";
      case "success":
        return "default";
      case "warning":
        return "default";
      case "info":
        return "default";
      default:
        return "default";
    }
  };

  const getAlertClassName = (type: string) => {
    const base =
      "shadow-lg border-l-4 animate-in slide-in-from-right-full duration-300";
    switch (type) {
      case "success":
        return `${base} border-green-500`;
      case "error":
        return `${base} border-red-500`;
      case "warning":
        return `${base} border-yellow-500`;
      case "info":
        return `${base} border-blue-500`;
      default:
        return `${base} border-gray-500`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          variant={getAlertVariant(toast.type)}
          className={getAlertClassName(toast.type)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {toast.title && (
                <h4 className="font-semibold mb-1">{toast.title}</h4>
              )}
              <AlertDescription>{toast.message}</AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissToast(toast.id)}
              className="ml-2 h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
