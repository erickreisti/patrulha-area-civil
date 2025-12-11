"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RiArrowRightLine, RiTeamLine, RiPhoneLine } from "react-icons/ri";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils/utils";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="w-full bg-gradient-to-br from-navy via-navy-600 to-navy-800 text-white py-12 sm:py-16 lg:py-20 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-navy-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-alert/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/10 rounded-full mb-4 sm:mb-6 backdrop-blur-sm border border-white/20"
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.2,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.3 },
            }}
          >
            <RiTeamLine className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
          </motion.div>

          <motion.h2
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 font-bebas tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Pronto para{" "}
            <motion.span
              className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Fazer a Diferença?
            </motion.span>
          </motion.h2>

          <motion.p
            className={cn(
              "text-white/90 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto font-roboto leading-relaxed px-4",
              "text-base sm:text-lg lg:text-xl"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Junte-se à Patrulha Aérea Civil e participe de operações que
            realmente{" "}
            <span className="font-semibold text-white">impactam vidas</span> e
            transformam comunidades.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Primary Button - Contact - CORRIGIDO */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full sm:w-auto relative"
            >
              <Button
                size="lg"
                className={cn(
                  "group relative bg-white text-navy hover:bg-white/95 font-roboto font-bold rounded-xl",
                  "px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5",
                  "text-sm sm:text-base lg:text-lg",
                  "w-full sm:min-w-[180px] lg:min-w-[200px]",
                  "border-2 border-white shadow-2xl hover:shadow-3xl",
                  "touch-optimize active:scale-95",
                  "overflow-hidden" // Adicionado
                )}
                asChild
              >
                <Link
                  href="/contato"
                  className="flex items-center justify-center gap-2 sm:gap-3 relative z-20" // z-index aumentado
                >
                  {/* Shine effect - CORRIGIDO */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000 z-10 pointer-events-none" />

                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-20"
                  >
                    <RiPhoneLine className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </motion.div>

                  <span className="relative z-20">Entre em Contato</span>

                  <motion.div
                    className="relative z-20"
                    initial={{ x: 0 }}
                    whileHover={{ x: 3 }}
                    transition={{
                      duration: 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 0.5,
                    }}
                  >
                    <RiArrowRightLine className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>

            {/* Secondary Button - Learn More - CORRIGIDO */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full sm:w-auto relative"
            >
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "group relative border-2 border-white/80 bg-transparent text-white hover:text-white hover:bg-white/10 hover:border-white",
                  "font-roboto font-bold rounded-xl backdrop-blur-sm shadow-2xl hover:shadow-3xl",
                  "px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5",
                  "text-sm sm:text-base lg:text-lg",
                  "w-full sm:min-w-[180px] lg:min-w-[200px]",
                  "touch-optimize active:scale-95",
                  "overflow-hidden" // Adicionado
                )}
                asChild
              >
                <Link
                  href="/sobre"
                  className="flex items-center justify-center gap-2 sm:gap-3 relative z-20"
                >
                  {/* Background shine - CORRIGIDO */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 z-10 pointer-events-none" />

                  <span className="relative z-20">Saiba Mais</span>

                  <motion.div
                    className="relative z-20"
                    initial={{ x: 0 }}
                    whileHover={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                  >
                    <RiArrowRightLine className="w-4 h-4 sm:w-5 sm:h-5" />

                    {/* Pulsing dot effect */}
                    <motion.div
                      className="absolute -right-1 -top-1 w-1.5 h-1.5 bg-white rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{
                        scale: [0, 1.2, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </section>
  );
}
