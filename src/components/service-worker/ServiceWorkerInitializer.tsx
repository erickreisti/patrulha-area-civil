"use client";

import { useEffect } from "react";
import { serviceWorkerManager } from "@/lib/utils/service-worker";

export function ServiceWorkerInitializer() {
  useEffect(() => {
    // Inicializa o gerenciador de Service Workers
    serviceWorkerManager.initialize();

    // Adiciona listener para prevenir novo registro
    if ("serviceWorker" in navigator) {
      const controllerChangeHandler = () => {
        console.log(
          "Service Worker controller changed - preventing new registration"
        );
        serviceWorkerManager.unregisterAll();
      };

      navigator.serviceWorker.addEventListener(
        "controllerchange",
        controllerChangeHandler
      );

      return () => {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          controllerChangeHandler
        );
      };
    }
  }, []);

  return null;
}
