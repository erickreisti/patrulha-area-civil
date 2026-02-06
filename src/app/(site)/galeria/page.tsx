"use client";

import { GaleriaContent } from "./components/GaleriaContent";
import { motion } from "framer-motion";
import { RiImage2Line } from "react-icons/ri";

export default function GaleriaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HERO SECTION (Consistente com o Header) --- */}
      <section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-24 border-b border-slate-100 overflow-hidden">
        {/* Background Grid Sutil (CSS Puro) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Elemento Decorativo (Blob Azul) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge Técnico */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
              <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm flex items-center gap-2">
                <RiImage2Line className="w-4 h-4" />
                Acervo Visual
              </span>
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              GALERIA DE <span className="text-pac-primary">IMAGENS</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Registros fotográficos de nossas operações, treinamentos e
              eventos. Acompanhe a atuação da Patrulha Aérea Civil através de
              nossas lentes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CONTEÚDO DA GALERIA --- */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <GaleriaContent />
        </div>
      </section>
    </div>
  );
}
