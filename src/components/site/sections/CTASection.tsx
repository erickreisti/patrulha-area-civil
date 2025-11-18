"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaArrowRight, FaUsers, FaHandshake } from "react-icons/fa";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="w-full bg-gradient-to-br from-navy via-navy-600 to-navy-800 text-white py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-navy-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-alert/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              type: "spring",
              stiffness: 100,
            }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.3 },
            }}
          >
            <FaUsers className="h-8 w-8 text-white" />
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 font-bebas tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Pronto para{" "}
            <motion.span
              className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Fazer a Diferença?
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-roboto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Junte-se à Patrulha Aérea Civil e participe de operações que
            realmente{" "}
            <span className="font-semibold text-white">impactam vidas</span> e
            transformam comunidades.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Primary Button - Contact */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                size="lg"
                className="group relative text-lg bg-white text-navy hover:bg-white/95 font-roboto px-8 py-4 font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl min-w-[200px] overflow-hidden border-2 border-white"
                asChild
              >
                <Link
                  href="/contato"
                  className="flex items-center justify-center gap-3"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-1000" />

                  {/* Icon with animation */}
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaHandshake className="h-5 w-5" />
                  </motion.div>

                  <span className="relative z-10">Entre em Contato</span>

                  {/* Animated Arrow */}
                  <motion.div
                    className="relative"
                    initial={{ x: 0 }}
                    whileHover={{ x: 3 }}
                    transition={{
                      duration: 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 0.5,
                    }}
                  >
                    <FaArrowRight className="h-4 w-4" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>

            {/* Secondary Button - Learn More */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="group relative text-lg border-2 border-white/80 bg-transparent text-white hover:bg-white/10 hover:border-white font-roboto px-8 py-4 font-bold rounded-xl transition-all duration-300 backdrop-blur-sm shadow-2xl hover:shadow-3xl min-w-[200px] overflow-hidden"
                asChild
              >
                <Link
                  href="/sobre"
                  className="flex items-center justify-center gap-3"
                >
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Background shine */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />

                  <span className="relative z-10">Saiba Mais</span>

                  {/* Animated Arrow with enhanced animation */}
                  <motion.div
                    className="relative"
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
                    <FaArrowRight className="h-4 w-4" />

                    {/* Pulsing dot effect */}
                    <motion.div
                      className="absolute -right-1 -top-1 w-1 h-1 bg-white rounded-full"
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

          {/* Additional Info */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-alert rounded-full animate-pulse" />
              <span className="text-sm font-roboto">Plantão 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-roboto">Resposta Imediata</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-navy-400 rounded-full animate-pulse" />
              <span className="text-sm font-roboto">
                Profissionais Qualificados
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
