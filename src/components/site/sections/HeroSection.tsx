"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 150,
      duration: 0.6,
    },
  },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 80,
      duration: 0.8,
    },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 150,
      duration: 0.5,
    },
  },
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
};

const BackgroundImage = () => {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url("/images/site/hero-bg.webp")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/25 to-slate-900/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/30 to-transparent"></div>
    </div>
  );
};

const MainTitle = () => (
  <motion.div className="mb-3 sm:mb-4 md:mb-5" variants={itemVariants}>
    <h1
      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
                   font-bold text-white mb-2 sm:mb-3 leading-tight 
                   drop-shadow-2xl font-bebas uppercase tracking-normal"
    >
      PATRULHA{" "}
      <span className="block text-white sm:inline sm:ml-3 md:ml-4 text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
        AÉREA CIVIL
      </span>
    </h1>
  </motion.div>
);

const Subtitle = () => (
  <motion.div className="mb-3 sm:mb-4 md:mb-5" variants={itemVariants}>
    <p
      className="text-xl sm:text-2xl md:text-3xl 
                 font-medium text-white mb-2 leading-relaxed 
                 drop-shadow-lg font-roboto"
    >
      Resgate Aéreo & Proteção Civil
    </p>
  </motion.div>
);

const Description = () => (
  <motion.div
    className="mb-6 sm:mb-8 
               max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 
               mx-auto px-4 sm:px-6"
    variants={scaleInVariants}
  >
    <p
      className="text-base sm:text-lg md:text-xl 
                 text-white leading-relaxed
                 bg-slate-900/60 backdrop-blur-sm 
                 rounded-xl lg:rounded-2xl 
                 p-4 sm:p-5 md:p-6 
                 border border-white/20 
                 shadow-xl lg:shadow-2xl 
                 font-roboto font-medium"
    >
      Operações especializadas em resgate aéreo, resposta a emergências e apoio
      humanitário. Atuamos com profissionalismo e compromisso na preservação de
      vidas.
    </p>
  </motion.div>
);

const ActionButtons = () => (
  <motion.div
    className="flex flex-col gap-3 sm:gap-4 md:gap-5 
               justify-center items-center 
               px-4 sm:px-6 
               w-full max-w-sm sm:max-w-md md:max-w-lg 
               mx-auto lg:max-w-xl xl:max-w-2xl
               lg:flex-row lg:items-stretch"
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
        className="w-full text-sm sm:text-base md:text-lg 
                   px-6 sm:px-8 
                   py-3 sm:py-4 
                   bg-navy hover:bg-navy-700 text-white font-bold uppercase 
                   tracking-wider transition-all duration-300 
                   hover:shadow-xl 
                   font-roboto border-0 group/button relative overflow-hidden 
                   shadow-lg 
                   min-h-[48px] sm:min-h-[52px]"
        asChild
      >
        <Link href="/sobre">
          <span className="relative z-10">INICIAR MISSÃO</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
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
        className="w-full text-sm sm:text-base md:text-lg 
                   px-6 sm:px-8 
                   py-3 sm:py-4 
                   border-2 border-white bg-white/10 backdrop-blur-sm 
                   text-white font-bold uppercase tracking-wider 
                   transition-all duration-300 
                   hover:bg-white hover:text-slate-900 hover:shadow-xl 
                   font-roboto group/outline relative overflow-hidden 
                   shadow-lg 
                   min-h-[48px] sm:min-h-[52px]"
        asChild
      >
        <Link href="/contato">
          <span className="relative z-10">EMERGÊNCIA</span>
          <div className="absolute inset-0 bg-white scale-x-0 group-hover/outline:scale-x-100 transition-transform duration-300 origin-left -z-10" />
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
      className="mt-2 sm:mt-3 md:mt-4 hidden sm:block cursor-pointer"
      variants={itemVariants}
      onClick={scrollToAbout}
    >
      <div className="flex flex-col items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm text-white/70 font-roboto uppercase tracking-wider">
          Saiba Mais
        </span>
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-2.5 bg-white/70 rounded-full mt-1.5 sm:mt-2 animate-bounce"></div>
        </div>
      </div>
    </motion.div>
  );
};

export function HeroSection() {
  return (
    <section className="relative bg-slate-800 text-white h-screen flex items-center justify-center overflow-hidden pt-16">
      <BackgroundImage />

      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
          <div className="text-center">
            <MainTitle />
            <Subtitle />
            <Description />
            <ActionButtons />
            <ScrollIndicator />
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 md:h-28 lg:h-32 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
    </section>
  );
}
