"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  RiCrosshairLine,
  RiUserLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiErrorWarningLine,
  RiArrowRightLine,
  RiCalendarCheckLine,
  RiMapPinLine,
} from "react-icons/ri";

// --- DADOS ---

const EVENTS = [
  // Renomeado de ACTIVITIES para EVENTS
  {
    title: "Operações Realizadas",
    count: "50+",
    description:
      "Missões de resgate e apoio cumpridas com êxito em território nacional.",
    icon: RiCrosshairLine,
  },
  {
    title: "Horas de Treino",
    count: "100+",
    description:
      "Carga horária de capacitação técnica e simulados operacionais.",
    icon: RiTimeLine,
  },
  {
    title: "Comunidades",
    count: "25+",
    description: "Localidades atendidas com suporte humanitário e logístico.",
    icon: RiMapPinLine,
  },
];

const STATS = [
  { number: "24/7", label: "Prontidão", icon: RiTimeLine },
  { number: "100%", label: "Eficiência", icon: RiShieldCheckLine },
  { number: "Zero", label: "Incidentes", icon: RiErrorWarningLine },
  { number: "50+", label: "Efetivo", icon: RiUserLine },
];

// --- VARIANTES DE ANIMAÇÃO ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// --- SUB-COMPONENTES ---

const SectionHeader = () => (
  <div className="text-center mb-16 space-y-4">
    {/* Badge Estático */}
    <div className="flex items-center justify-center gap-4 mb-2">
      <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/30" />
      <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
        Registro Operacional
      </span>
      <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/30" />
    </div>

    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight">
      Impacto & <span className="text-pac-primary">Eventos</span>
    </h2>

    <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed">
      Nossos números refletem o compromisso contínuo com a excelência, segurança
      e o bem-estar da sociedade civil.
    </p>
  </div>
);

const EventCard = ({ event }: { event: (typeof EVENTS)[0] }) => {
  // Renomeado de ActivityCard para EventCard
  const Icon = event.icon;

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "group relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm",
        "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-pac-primary/20",
        "flex flex-col items-center text-center h-full",
      )}
    >
      {/* Icon Circle */}
      <div className="mb-6 w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-pac-primary transition-colors duration-300">
        <Icon className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors duration-300" />
      </div>

      {/* Number (Big Impact) */}
      <div className="font-black text-4xl sm:text-5xl text-slate-900 mb-2 group-hover:text-pac-primary transition-colors">
        {event.count}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-slate-600 text-sm leading-relaxed">
        {event.description}
      </p>
    </motion.div>
  );
};

const StatItem = ({ stat }: { stat: (typeof STATS)[0] }) => {
  const Icon = stat.icon;
  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex items-center gap-2 mb-2 text-pac-primary/80">
        <Icon className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-widest">
          {stat.label}
        </span>
      </div>
      <span className="text-2xl sm:text-3xl font-black text-slate-800">
        {stat.number}
      </span>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export function EventsShowcase() {
  // Renomeado de ActivitiesShowcase para EventsShowcase
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="events-section" // Alterado ID
      className="w-full bg-white py-20 sm:py-24 lg:py-32 relative overflow-hidden"
      ref={ref}
    >
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.4] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader />

        {/* Grid de Eventos Principais */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {EVENTS.map((event, index) => (
            <EventCard key={index} event={event} />
          ))}
        </motion.div>

        {/* Painel de Indicadores (Stats) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {STATS.map((stat, index) => (
                <StatItem key={index} stat={stat} />
              ))}
            </div>

            {/* Divisor e Botão */}
            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col items-center">
              <p className="text-slate-500 text-sm mb-6 font-medium">
                Confira o cronograma completo de nossas ações
              </p>

              <Button
                size="lg"
                className={cn(
                  "bg-pac-primary hover:bg-pac-primary-dark text-white rounded-full px-8 h-12",
                  "shadow-lg hover:shadow-pac-primary/30 transition-all font-bold tracking-wide group",
                )}
                asChild
              >
                <Link href="/eventos" className="flex items-center gap-2">
                  {" "}
                  {/* Link atualizado */}
                  <RiCalendarCheckLine className="w-5 h-5" />
                  Ver Todas as Operações
                  <RiArrowRightLine className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
