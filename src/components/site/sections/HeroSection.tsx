"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { RiArrowRightLine, RiAlarmWarningLine } from "react-icons/ri";

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

const BackgroundImage = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/images/site/hero-bg.webp")`,
          backgroundPosition: "center 50px",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-800/40 to-navy-900/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-navy-800/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/20 to-navy-900/20"></div>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse-gentle"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-float"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-ping-slow"></div>
        </div>
      </div>
    </div>
  );
};

const MainTitle = () => (
  <motion.div className="mb-2 xs:mb-3 sm:mb-4 md:mb-5" variants={itemVariants}>
    <h1
      className={cn(
        "font-bold text-white leading-tight",
        "drop-shadow-2xl font-bebas uppercase tracking-normal text-center",
        // 🔸 CORREÇÃO: Tamanhos otimizados para caber em uma linha
        "text-4xl", // Mobile base (320px+) - Quebra em duas linhas
        "xs:text-5xl", // Mobile pequeno (375px+) - Quebra em duas linhas
        "sm:text-5xl", // Tablet pequeno (640px+) - Quebra em duas linhas
        "md:text-5xl", // Tablet (768px+) - Tamanho menor para caber em uma linha
        "lg:text-6xl", // Desktop (1024px+) - Aumenta gradualmente
        "xl:text-6xl", // Desktop grande (1280px+)
        "2xl:text-7xl" // Desktop extra grande (1536px+)
      )}
    >
      {/* 🔸 MOBILE: Quebra em duas linhas (até 767px) */}
      <span className="block md:hidden">
        <span className="block">PATRULHA</span>
        <span
          className={cn(
            "block",
            "mt-0", // Reduzido do mt-1 original
            "xs:mt-1", // Reduzido do xs:mt-2 original
            "sm:mt-1" // Reduzido do sm:mt-2 original
          )}
        >
          AÉREA CIVIL
        </span>
      </span>

      {/* 🔸 TABLET/DESKTOP: Uma linha só (768px+) */}
      <span className="hidden md:block whitespace-nowrap">
        PATRULHA AÉREA CIVIL
      </span>
    </h1>
  </motion.div>
);

const Subtitle = () => (
  <motion.div className="mb-2 xs:mb-3 sm:mb-4 md:mb-5" variants={itemVariants}>
    <p
      className={cn(
        "font-medium text-white mb-0 xs:mb-1 leading-relaxed", // Reduzido mb
        "drop-shadow-lg font-roboto text-center",
        "text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl",
        "bg-gradient-to-r from-white via-offwhite-200 to-white bg-clip-text text-transparent"
      )}
    >
      Resgate Aéreo & Proteção Civil
    </p>
  </motion.div>
);

const Description = () => (
  <motion.div
    className={cn(
      "mb-4 xs:mb-5 sm:mb-6 md:mb-8", // Reduzido margin-bottom
      "mx-auto px-3 xs:px-4 sm:px-5",
      "max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl"
    )}
    variants={scaleInVariants}
  >
    <div
      className={cn(
        "text-white leading-relaxed xs:leading-loose",
        "bg-slate-900/70 backdrop-blur-md",
        "rounded-xl lg:rounded-2xl",
        "border border-white/20 border-b-white/40",
        "shadow-xl lg:shadow-2xl",
        "font-roboto font-medium text-center",
        "text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl",
        "p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7", // Mantido padding interno
        "relative overflow-hidden"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-navy-400/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      Operações especializadas em resgate aéreo, resposta a emergências e apoio
      humanitário. Atuamos com profissionalismo e compromisso na preservação de
      vidas.
    </div>
  </motion.div>
);

const ActionButtons = () => (
  <motion.div
    className={cn(
      "flex flex-col gap-2 xs:gap-3 sm:gap-4 md:gap-5", // Reduzido gap
      "justify-center items-center",
      "px-3 xs:px-4 sm:px-5",
      "w-full mx-auto",
      "max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl",
      "lg:flex-row lg:items-stretch"
    )}
    variants={containerVariants}
  >
    <motion.div
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className="w-full lg:w-auto lg:flex-1"
    >
      <Button
        size="lg"
        className={cn(
          "w-full font-bold uppercase tracking-wider",
          "transition-all duration-300 font-roboto border-0",
          "relative overflow-hidden shadow-lg hover:shadow-xl",
          "group/button",
          "bg-navy hover:bg-navy-600 text-white",
          "text-sm xs:text-base sm:text-lg md:text-xl",
          "px-4 xs:px-5 sm:px-6 md:px-8",
          "py-2 xs:py-2.5 sm:py-3 md:py-4", // Reduzido padding vertical
          "min-h-[40px] xs:min-h-[44px] sm:min-h-[48px] md:min-h-[52px]" // Reduzido altura mínima
        )}
        asChild
      >
        <Link href="/sobre">
          <span className="relative z-10 flex items-center justify-center gap-2 xs:gap-3">
            <span>INICIAR MISSÃO</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center"
            >
              <RiArrowRightLine className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
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
      className="w-full lg:w-auto lg:flex-1"
    >
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "w-full font-bold uppercase tracking-wider",
          "transition-all duration-300 font-roboto",
          "relative overflow-hidden shadow-lg hover:shadow-xl",
          "group/outline",
          "border-2 border-white bg-white/10 backdrop-blur-sm",
          "text-white hover:bg-white hover:text-navy-800",
          "text-sm xs:text-base sm:text-lg md:text-xl",
          "px-4 xs:px-5 sm:px-6 md:px-8",
          "py-2 xs:py-2.5 sm:py-3 md:py-4", // Reduzido padding vertical
          "min-h-[40px] xs:min-h-[44px] sm:min-h-[48px] md:min-h-[52px]" // Reduzido altura mínima
        )}
        asChild
      >
        <Link href="/contato">
          <span className="relative z-10 flex items-center justify-center gap-2 xs:gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center text-alert-300"
            >
              <RiAlarmWarningLine className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
            </motion.div>
            <span>EMERGÊNCIA</span>
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
      className="mt-3 xs:mt-4 sm:mt-5 md:mt-6 hidden sm:block cursor-pointer group/scroll" // Reduzido margin-top
      variants={itemVariants}
      onClick={scrollToAbout}
      whileHover={{ y: 5 }}
    >
      <div className="flex flex-col items-center gap-1 xs:gap-2 sm:gap-3">
        <span className="text-xs xs:text-sm sm:text-base text-white/70 font-roboto uppercase tracking-wider group-hover/scroll:text-white transition-colors duration-300">
          Saiba Mais
        </span>
        <div className="w-5 h-8 xs:w-6 xs:h-10 sm:w-7 sm:h-12 border-2 border-white/50 rounded-full flex justify-center group-hover/scroll:border-white transition-colors duration-300">
          <motion.div
            className="w-1 h-2 xs:h-2.5 sm:h-3 bg-white/70 rounded-full mt-1.5 xs:mt-2 sm:mt-2.5"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export function HeroSection() {
  return (
    <section
      className="relative bg-slate-800 text-white h-screen flex items-center justify-center overflow-hidden"
      id="hero-section"
    >
      <BackgroundImage />

      <motion.div
        className="container mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className={cn(
            "mx-auto w-full",
            "max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl",
            "pt-8 xs:pt-10 sm:pt-12 md:pt-16" // 🔸 ADICIONADO: Padding top para subir o conteúdo
          )}
        >
          <div className="text-center">
            <MainTitle />
            <Subtitle />
            <Description />
            <ActionButtons />
            <ScrollIndicator />
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-16 xs:h-20 sm:h-24 md:h-28 lg:h-32 bg-gradient-to-t from-navy-900/80 via-navy-900/40 to-transparent pointer-events-none"></div>
    </section>
  );
}
