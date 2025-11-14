"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaArrowRight, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="w-full bg-gradient-to-br from-navy to-navy-dark text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FaUsers className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h2
            className="text-4xl font-bold mb-6 font-bebas tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Pronto para Fazer a Diferença?
          </motion.h2>

          <motion.p
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-roboto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Junte-se à Patrulha Aérea Civil e participe de operações que
            realmente impactam vidas e transformam comunidades.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              variant="outline"
              className="text-lg border-2 border-white text-white hover:bg-white hover:text-navy font-roboto px-8 py-3 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/contato" className="flex items-center gap-2">
                Entre em Contato
                <FaArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="text-lg bg-white text-navy hover:bg-white/90 font-roboto px-8 py-3 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/sobre" className="flex items-center gap-2">
                Saiba Mais
                <FaArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
