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
    <section
      className={cn(
        "relative w-full flex items-center justify-center overflow-hidden bg-slate-900",
        // AJUSTE DE ALTURA RESPONSIVA (Viewport - Header - TopBar):
        "h-[calc(100vh-120px)]", // Mobile
        "xs:h-[calc(100vh-152px)]", // Mobile Grande
        "lg:h-[calc(100vh-170px)]", // Desktop
        "min-h-[550px] lg:min-h-[600px]",
      )}
    >
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
        <div className="absolute inset-0 bg-pac-primary/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
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
              "font-black text-white uppercase tracking-tighter leading-[1.1] mb-4 xs:mb-6 drop-shadow-2xl",
              "whitespace-nowrap text-[min(10vw,3rem)] xs:text-[min(6vw,4rem)] lg:text-[min(5.5vw,5.5rem)]",
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
            className="text-base xs:text-lg sm:text-xl md:text-2xl text-slate-200 font-medium leading-relaxed max-w-3xl mx-auto mb-8 xs:mb-10 text-shadow-sm px-2 xs:px-4"
          >
            Atuando com excelência em operações aéreas de busca, resgate e apoio
            a desastres. O braço civil voluntário da aviação brasileira.
          </motion.p>

          {/* Botões de Ação */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 xs:gap-5 justify-center items-center w-full"
          >
            <Button
              size="lg"
              className={cn(
                "group bg-pac-primary text-white border-0",
                "hover:bg-pac-primary-light hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1",
                "font-bold uppercase tracking-wider h-12 xs:h-14 px-8 xs:px-10 rounded-full",
                "transition-all duration-300 w-full sm:w-auto text-sm xs:text-base sm:text-lg",
              )}
              asChild
            >
              <Link href="/sobre">
                <span>Conheça Nossa Missão</span>
                <RiArrowRightLine className="ml-2 w-4 h-4 xs:w-5 xs:h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className={cn(
                "group border-2 border-white/30 bg-transparent text-white backdrop-blur-sm",
                "hover:bg-white hover:text-slate-900 hover:border-white hover:shadow-lg",
                "font-bold uppercase tracking-wider h-12 xs:h-14 px-8 xs:px-10 rounded-full",
                "transition-all duration-300 w-full sm:w-auto text-sm xs:text-base sm:text-lg",
              )}
              asChild
            >
              <Link href="/contato">
                <RiAlarmWarningLine className="mr-2 w-4 h-4 xs:w-5 xs:h-5 text-red-500 transition-transform duration-300 group-hover:scale-110" />
                Emergência
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* 3. Indicador de Scroll Responsivo & Centralizado */}
      {/* WRAPPER DE POSICIONAMENTO ESTÁTICO (Garante o centro perfeito) */}
      <div className="absolute bottom-4 sm:bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 z-20">
        {/* COMPONENTE DE ANIMAÇÃO (Apenas fade e slide, sem posição) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="cursor-pointer group p-2 xs:p-4"
          onClick={scrollToAbout}
        >
          <div className="flex flex-col items-center gap-2 transition-transform duration-300 group-hover:translate-y-1">
            <span className="hidden xs:block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold group-hover:text-white transition-colors text-center">
              Saiba Mais
            </span>

            <div className="w-[20px] h-[32px] xs:w-[26px] xs:h-[44px] border-2 border-slate-400 rounded-full flex justify-center p-1 group-hover:border-white transition-colors bg-black/10 backdrop-blur-sm">
              <motion.div
                className="w-1 xs:w-1.5 h-1.5 xs:h-2.5 bg-white rounded-full"
                animate={{
                  y: [0, 10, 0],
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
      </div>

      {/* Gradiente de Fusão Inferior */}
      <div className="absolute bottom-0 w-full h-24 xs:h-32 bg-gradient-to-t from-white via-white/60 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
