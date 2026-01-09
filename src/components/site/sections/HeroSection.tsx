// src/components/site/sections/HeroSection.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { RiArrowRightLine, RiAlarmWarningLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import Image from "next/image";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120,
      duration: 0.8,
    },
  },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 1,
    },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120,
      duration: 0.6,
    },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
};

// ✅ CORRIGIDO: BackgroundImage simplificado sem estado
const BackgroundImage = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Image with Next.js Image component */}
      <div className="absolute inset-0">
        <Image
          src="/images/site/hero-bg.webp"
          alt="Patrulha Aérea Civil - Operações Aéreas"
          fill
          priority
          quality={85}
          className="object-cover object-center"
          sizes="100vw"
          style={{
            objectPosition: "center 30%",
          }}
          // ✅ REMOVIDO: onLoad e loading state
          loading="eager"
          // ✅ ADICIONADO: Decoding async para melhor performance
          decoding="async"
        />
      </div>

      {/* Overlay gradients - sempre visíveis */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-800/50 to-navy-900/60"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-800/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/30 via-navy-800/20 to-navy-900/40"></div>

      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
      </div>
    </div>
  );
};

const Subtitle = () => (
  <motion.div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8" variants={itemVariants}>
    <p
      className={cn(
        "font-medium text-white mb-0 leading-relaxed drop-shadow-lg font-roboto text-center",
        "text-base sm:text-lg md:text-xl lg:text-2xl px-4 mx-auto max-w-3xl",
        "bg-gradient-to-r from-white via-offwhite-200 to-white bg-clip-text text-transparent"
      )}
    >
      Excelência em Resgate Aéreo & Proteção Civil
    </p>
  </motion.div>
);

const Description = () => (
  <motion.div
    className={cn(
      "mb-6 sm:mb-8 md:mb-10 lg:mb-12 mx-auto px-4 sm:px-6",
      "max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
    )}
    variants={scaleInVariants}
  >
    <div
      className={cn(
        "text-white leading-relaxed sm:leading-loose bg-slate-900/80 backdrop-blur-md",
        "rounded-xl lg:rounded-2xl border border-white/20 shadow-2xl",
        "font-roboto font-medium text-center text-sm sm:text-base md:text-lg",
        "p-4 sm:p-6 md:p-8 relative overflow-hidden"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-navy-400/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <p className="mb-0">
        Organização civil especializada em operações aéreas de resgate, busca e
        proteção civil. Comprometidos com a segurança e bem-estar da população,
        atuamos com profissionalismo e dedicação em situações de emergência.
      </p>
    </div>
  </motion.div>
);

const ActionButtons = () => (
  <motion.div
    className={cn(
      "flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-stretch",
      "px-4 sm:px-6 w-full mx-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl",
      "mb-4 sm:mb-6"
    )}
    variants={containerVariants}
  >
    <motion.div
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className="w-full sm:w-auto sm:flex-1 touch-optimize"
    >
      <Button
        size="lg"
        className={cn(
          "w-full font-bold uppercase tracking-wider transition-all duration-300 font-roboto border-0",
          "relative overflow-hidden shadow-lg hover:shadow-xl group/button",
          "bg-navy hover:bg-navy-600 text-white text-sm sm:text-base",
          "px-4 sm:px-6 md:px-8 py-3 sm:py-4 h-auto min-h-[48px] sm:min-h-[56px]",
          "active:scale-95"
        )}
        asChild
      >
        <Link href="/sobre">
          <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-sm sm:text-base md:text-lg">
              INICIAR MISSÃO
            </span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center"
            >
              <RiArrowRightLine className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700" />
        </Link>
      </Button>
    </motion.div>

    <motion.div
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className="w-full sm:w-auto sm:flex-1 touch-optimize"
    >
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "w-full font-bold uppercase tracking-wider transition-all duration-300 font-roboto",
          "relative overflow-hidden shadow-lg hover:shadow-xl group/outline",
          "border-2 border-white bg-white/10 backdrop-blur-sm",
          "text-white hover:bg-white hover:text-navy-800 text-sm sm:text-base",
          "px-4 sm:px-6 md:px-8 py-3 sm:py-4 h-auto min-h-[48px] sm:min-h-[56px]",
          "active:scale-95"
        )}
        asChild
      >
        <Link href="/contato">
          <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center text-alert-300"
            >
              <RiAlarmWarningLine className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
            <span className="text-sm sm:text-base md:text-lg">EMERGÊNCIA</span>
          </span>
          <div className="absolute inset-0 bg-white scale-x-0 group-hover/outline:scale-x-100 transition-transform duration-500 origin-left -z-10" />
        </Link>
      </Button>
    </motion.div>
  </motion.div>
);

const ScrollIndicator = () => {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about-section");
    if (aboutSection) {
      const offsetTop = aboutSection.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.div
      className="hidden sm:block cursor-pointer group/scroll mb-4 sm:mb-6"
      variants={itemVariants}
      onClick={scrollToAbout}
      whileHover={{ y: 5 }}
      aria-label="Role para baixo para saber mais"
    >
      <div className="flex flex-col items-center mt-8 sm:mt-10 gap-2 sm:gap-3">
        <span className="text-sm text-white/80 font-roboto uppercase tracking-wider group-hover/scroll:text-white transition-colors duration-300">
          Saiba Mais
        </span>
        <div className="w-6 h-10 sm:w-7 sm:h-12 border-2 border-white/50 rounded-full flex justify-center group-hover/scroll:border-white transition-colors duration-300">
          <motion.div
            className="w-1 h-3 sm:h-4 bg-white/70 rounded-full mt-2 sm:mt-3"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export function HeroSection() {
  // ✅ CORRIGIDO: Remover lógica de mounted - não é mais necessária
  const [height, setHeight] = useState("calc(100vh - 90px)");

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth < 640) {
        setHeight("calc(100vh - 90px)");
      } else if (window.innerWidth < 1024) {
        setHeight("calc(100vh - 100px)");
      } else {
        setHeight("calc(100vh - 120px)");
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <section
      className="relative bg-navy-800 text-white overflow-hidden ios-h-screen"
      style={{
        height,
        minHeight: "600px",
      }}
      id="hero-section"
      aria-label="Seção principal da Patrulha Aérea Civil"
    >
      <BackgroundImage />

      <motion.div
        className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className={cn(
            "mx-auto w-full h-full flex flex-col justify-end items-center",
            "pb-12 sm:pb-16 md:pb-20 lg:pb-24 pt-16 sm:pt-20",
            "min-h-[600px]"
          )}
        >
          <div className="text-center w-full">
            <motion.div
              className="mb-3 sm:mb-4 md:mb-5 lg:mb-6"
              variants={itemVariants}
            >
              <h1
                className={cn(
                  "font-bold text-white leading-tight drop-shadow-2xl font-bebas uppercase tracking-normal text-center",
                  "text-4xl xs:text-5xl leading-[0.9] px-2",
                  "sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
                  "mx-auto max-w-[90vw]"
                )}
              >
                PATRULHA AÉREA CIVIL
              </h1>
            </motion.div>
            <Subtitle />
            <Description />
            <ActionButtons />
            <ScrollIndicator />
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 md:h-28 lg:h-32 bg-gradient-to-t from-navy-900/80 via-navy-900/40 to-transparent pointer-events-none"></div>
    </section>
  );
}
