"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RiArrowRightLine, RiPhoneLine } from "react-icons/ri";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="w-full bg-white py-20 sm:py-24 lg:py-32 relative overflow-hidden border-t border-slate-100"
    >
      {/* Background Decorativo (Grid Sutil) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Elementos Decorativos de Fundo (Bolhas Suaves) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pac-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {/* Badge Estático e Sutil (Substituído pelo padrão de linhas) */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
            <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
              Faça Parte da Missão
            </span>
            <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
          </div>

          {/* Título Principal */}
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            PRONTO PARA FAZER <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pac-primary to-blue-600">
              A DIFERENÇA?
            </span>
          </motion.h2>

          {/* Descrição */}
          <motion.p
            className="text-slate-600 mb-10 sm:mb-12 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed font-medium px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Junte-se à Patrulha Aérea Civil e participe de operações que
            realmente impactam vidas e transformam comunidades em todo o Brasil.
          </motion.p>

          {/* Botões de Ação */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Botão Primário */}
            <Button
              asChild
              size="lg"
              className={cn(
                "group bg-pac-primary hover:bg-pac-primary-dark text-white rounded-full px-8 h-14",
                "shadow-xl shadow-pac-primary/20 hover:shadow-pac-primary/30 transition-all hover:-translate-y-1",
                "font-bold text-base sm:text-lg w-full sm:w-auto min-w-[200px]",
              )}
            >
              <Link href="/contato" className="flex items-center gap-2">
                <RiPhoneLine className="w-5 h-5" />
                Entre em Contato
                <RiArrowRightLine className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            {/* Botão Secundário */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className={cn(
                "group border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-pac-primary hover:border-pac-primary/30 rounded-full px-8 h-14",
                "font-bold text-base sm:text-lg w-full sm:w-auto min-w-[200px] transition-all",
              )}
            >
              <Link href="/sobre">Saiba Mais</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
