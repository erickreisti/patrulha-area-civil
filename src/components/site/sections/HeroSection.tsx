"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { RiArrowRightLine, RiAlarmWarningLine } from "react-icons/ri";
import Image from "next/image";

// --- VARIANTES DE ANIMAÇÃO ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, duration: 0.8 },
  },
};

// --- COMPONENTE PRINCIPAL ---

export function HeroSection() {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about-section");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full h-[calc(100vh-80px)] min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
      {/* 1. Imagem de Fundo */}
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src="/images/site/hero-bg.webp"
          alt="Operação da Patrulha Aérea Civil"
          fill
          priority
          className="object-cover object-center"
          quality={75}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-pac-primary/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

        {/* Grid CSS Puro */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
      </div>

      {/* 2. Conteúdo Central */}
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 mx-auto h-full flex flex-col justify-center">
        <motion.div
          className="w-full max-w-[95vw] xl:max-w-7xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* TÍTULO PRINCIPAL */}
          <motion.h1
            variants={fadeInUp}
            className={cn(
              "font-black text-white uppercase tracking-tighter leading-[1.1] mb-6 drop-shadow-2xl",
              "whitespace-nowrap text-[min(5.8vw,5.5rem)]",
            )}
          >
            PATRULHA{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
              AÉREA CIVIL
            </span>
          </motion.h1>

          {/* Descrição */}
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl md:text-2xl text-slate-200 font-medium leading-relaxed max-w-3xl mx-auto mb-10 text-shadow-sm px-4"
          >
            Atuando com excelência em operações aéreas de busca, resgate e apoio
            a desastres. O braço civil voluntário da aviação brasileira.
          </motion.p>

          {/* Botões de Ação */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full"
          >
            {/* Botão Primário */}
            <Button
              size="lg"
              className={cn(
                "group bg-pac-primary text-white border-0",
                "hover:bg-pac-primary-light hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1",
                "font-bold uppercase tracking-wider h-14 px-10 rounded-full",
                "transition-all duration-300 w-full sm:w-auto text-base sm:text-lg",
              )}
              asChild
            >
              <Link href="/sobre">
                <span>Conheça Nossa Missão</span>
                <RiArrowRightLine className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>

            {/* Botão Secundário */}
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "group border-2 border-white/30 bg-transparent text-white backdrop-blur-sm",
                "hover:bg-white hover:text-slate-900 hover:border-white hover:shadow-lg",
                "font-bold uppercase tracking-wider h-14 px-10 rounded-full",
                "transition-all duration-300 w-full sm:w-auto text-base sm:text-lg",
              )}
              asChild
            >
              <Link href="/contato">
                <RiAlarmWarningLine className="mr-2 w-5 h-5 text-red-500 transition-transform duration-300 group-hover:scale-110" />
                Emergência
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* 3. Indicador de Scroll Responsivo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-2 sm:bottom-10  -translate-x-1/2 z-20 cursor-pointer group p-4"
        onClick={scrollToAbout}
      >
        <div className="flex flex-col items-center gap-2 sm:gap-3 transition-transform duration-300 group-hover:translate-y-1">
          {/* Texto oculto no mobile para economizar espaço */}
          <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold group-hover:text-white transition-colors">
            Saiba Mais
          </span>

          {/* Mouse menor no mobile (w-22px), maior no desktop (w-26px) */}
          <div className="w-[22px] h-[36px] sm:w-[26px] sm:h-[44px] border-2 border-slate-400 rounded-full flex justify-center p-1 group-hover:border-white transition-colors bg-black/10 backdrop-blur-sm">
            <motion.div
              className="w-1 sm:w-1.5 h-2 sm:h-2.5 bg-white rounded-full"
              animate={{
                y: [0, 12, 0],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Gradiente de Fusão Inferior */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-white via-white/60 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
