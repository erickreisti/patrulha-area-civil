"use client";

import { Header } from "@/components/site/layout/Header";
import { Footer } from "@/components/site/layout/Footer";
import { useEffect } from "react";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("🛡️ Iniciando prevenção de scroll lock");

    const preventScrollLock = () => {
      // Aplicar estilos forçados
      const applyStyles = () => {
        // 🔥 CORREÇÃO: Usar estilos mais específicos
        document.body.style.cssText = `
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding-right: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        `;

        document.documentElement.style.cssText = `
          overflow-y: auto !important;
          padding-right: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          max-width: 100vw !important;
        `;

        // Remover classes problemáticas
        document.body.classList.remove(
          "radix-scroll-lock",
          "scroll-lock",
          "pointer-events-none",
          "overflow-hidden"
        );

        document.documentElement.classList.remove(
          "radix-scroll-lock",
          "scroll-lock",
          "pointer-events-none",
          "overflow-hidden"
        );

        // Remover atributos problemáticos
        document.body.removeAttribute("data-radix-scroll-lock");
        document.body.removeAttribute("data-scroll-locked");
        document.documentElement.removeAttribute("data-radix-scroll-lock");
        document.documentElement.removeAttribute("data-scroll-locked");
      };

      // Aplicar imediatamente
      applyStyles();

      // Observer para bloquear alterações do Radix
      const observer = new MutationObserver((mutations) => {
        let needsFix = false;

        mutations.forEach((mutation) => {
          if (mutation.attributeName === "style") {
            const target = mutation.target as HTMLElement;
            const style = getComputedStyle(target);

            // Verificar se há estilos problemáticos
            if (
              style.overflow === "hidden" ||
              style.overflowX === "hidden" ||
              style.overflowY === "hidden" ||
              style.paddingRight !== "0px" ||
              style.marginRight !== "0px" ||
              style.width !== "100%" ||
              style.maxWidth !== "100%"
            ) {
              needsFix = true;
            }
          }

          if (mutation.attributeName === "class") {
            const target = mutation.target as HTMLElement;
            const classList = Array.from(target.classList);

            // Verificar classes problemáticas
            const problematicClasses = [
              "radix-scroll-lock",
              "scroll-lock",
              "pointer-events-none",
              "overflow-hidden",
              "fixed",
              "relative",
            ];

            if (problematicClasses.some((cls) => classList.includes(cls))) {
              needsFix = true;
            }
          }

          if (
            mutation.attributeName === "data-radix-scroll-lock" ||
            mutation.attributeName === "data-scroll-locked"
          ) {
            needsFix = true;
          }
        });

        if (needsFix) {
          console.log("⚠️ Detected scroll lock attempt, fixing...");
          applyStyles();
        }
      });

      // Observar body e html
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: [
          "style",
          "class",
          "data-radix-scroll-lock",
          "data-scroll-locked",
        ],
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: [
          "style",
          "class",
          "data-radix-scroll-lock",
          "data-scroll-locked",
        ],
      });

      // 🔥 CORREÇÃO: Observar também adição de estilos inline
      const styleObserver = new MutationObserver(() => {
        if (document.querySelector("style[data-radix]")) {
          applyStyles();
        }
      });

      styleObserver.observe(document.head, {
        childList: true,
        subtree: true,
      });

      return () => {
        console.log("🧼 Limpando prevenção de scroll lock");
        observer.disconnect();
        styleObserver.disconnect();
      };
    };

    const cleanup = preventScrollLock();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      {/* 🔥 CORREÇÃO: Remover padding-top do main e garantir largura total */}
      <main className="flex-1 w-full">
        {/* 🔥 Container para garantir 100% width sem restrições */}
        <div className="w-full max-w-none">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
