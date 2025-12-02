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
        // Garantir que body e html tenham scroll visível
        document.body.style.overflow = "auto";
        document.body.style.paddingRight = "0";
        document.documentElement.style.overflow = "auto";
        document.documentElement.style.paddingRight = "0";

        // Remover classes problemáticas do Radix
        document.body.classList.remove("radix-scroll-lock");
        document.documentElement.classList.remove("radix-scroll-lock");
      };

      // Aplicar imediatamente
      applyStyles();

      // Observer para bloquear alterações do Radix
      const observer = new MutationObserver((mutations) => {
        let needsFix = false;

        mutations.forEach((mutation) => {
          if (mutation.attributeName === "style") {
            const target = mutation.target as HTMLElement;

            if (
              target.style.overflow === "hidden" ||
              (target.style.paddingRight !== "" &&
                target.style.paddingRight !== "0")
            ) {
              needsFix = true;
            }
          }

          if (mutation.attributeName === "class") {
            const target = mutation.target as HTMLElement;
            if (target.classList.contains("radix-scroll-lock")) {
              needsFix = true;
            }
          }
        });

        if (needsFix) {
          applyStyles();
        }
      });

      // Observar apenas body e html
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      return () => {
        console.log("🧼 Limpando prevenção de scroll lock");
        observer.disconnect();
      };
    };

    const cleanup = preventScrollLock();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[90px] sm:pt-[100px] md:pt-[110px] lg:pt-[120px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
