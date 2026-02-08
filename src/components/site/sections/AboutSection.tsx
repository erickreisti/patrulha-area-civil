"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  RiUserLine,
  RiHomeLine,
  RiBookLine,
  RiTeamLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiFlagLine,
  RiGlobalLine,
  RiAddLine,
  RiSubtractLine,
} from "react-icons/ri";

// --- DADOS ---

const STATS = [
  { number: "500+", label: "Jovens Impactados", icon: RiUserLine },
  { number: "200+", label: "Atendimentos", icon: RiHomeLine },
  { number: "10+", label: "Bases Ativas", icon: RiFlagLine },
  { number: "50+", label: "Voluntários", icon: RiTeamLine },
];

const VALUES = [
  {
    title: "Missão",
    description:
      "Promover segurança e resgate voluntário com excelência técnica.",
    icon: RiGlobalLine,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Visão",
    description: "Ser referência nacional em proteção civil e cidadania.",
    icon: RiShieldCheckLine,
    color: "bg-red-50 text-red-700",
  },
  {
    title: "Valores",
    description: "Honra, Disciplina, Lealdade e Compromisso com a Pátria.",
    icon: RiBookLine,
    color: "bg-slate-100 text-slate-800",
  },
];

const FAQ_ITEMS = [
  {
    question: "Disciplina e Hierarquia",
    answer:
      "Nossa espinha dorsal. Mantemos uma cadeia de comando clara para garantir eficiência em operações críticas e formação de caráter.",
  },
  {
    question: "Prontidão Operacional",
    answer:
      "Equipes treinadas constantemente para resposta rápida em desastres naturais, busca e salvamento.",
  },
  {
    question: "Voluntariado Técnico",
    answer:
      "Não é apenas ajudar, é ajudar com técnica. Nossos membros recebem capacitação especializada.",
  },
];

// --- SUB-COMPONENTES ---

// ALTERADO: Badge minimalista e estático (Estilo Militar/Técnico)
const SectionBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-4 mb-6">
    {/* Linha decorativa estática */}
    <div className="w-12 h-[2px] bg-pac-primary" />
    <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-sm">
      {children}
    </span>
  </div>
);

const StatCard = ({
  stat,
  index,
}: {
  stat: (typeof STATS)[0];
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    viewport={{ once: true }}
    className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
  >
    <div className="w-10 h-10 mb-3 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-pac-primary/10 transition-colors">
      <stat.icon className="w-5 h-5 text-slate-400 group-hover:text-pac-primary transition-colors" />
    </div>
    <span className="text-2xl sm:text-3xl font-black text-slate-800 mb-1">
      {stat.number}
    </span>
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
      {stat.label}
    </span>
  </motion.div>
);

const AccordionItem = ({
  item,
  isOpen,
  onClick,
}: {
  item: (typeof FAQ_ITEMS)[0];
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <span
          className={cn(
            "font-bold text-sm sm:text-base transition-colors",
            isOpen
              ? "text-pac-primary"
              : "text-slate-700 group-hover:text-pac-primary",
          )}
        >
          {item.question}
        </span>
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
            isOpen
              ? "bg-pac-primary text-white rotate-180"
              : "bg-slate-100 text-slate-400 group-hover:bg-slate-200",
          )}
        >
          {isOpen ? (
            <RiSubtractLine className="w-3 h-3" />
          ) : (
            <RiAddLine className="w-3 h-3" />
          )}
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="pb-4 text-sm text-slate-500 leading-relaxed">
          {item.answer}
        </p>
      </motion.div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export function AboutSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about-section"
      className="py-20 sm:py-24 lg:py-32 bg-white overflow-hidden relative"
    >
      {/* Background Decorativo Sutil */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/4 -z-0" />

      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        ref={containerRef}
      >
        {/* HEADER DA SEÇÃO */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-16 lg:mb-24 items-center">
          {/* Lado Esquerdo: Texto */}
          <motion.div
            className="flex-1 w-full"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <SectionBadge>Quem Somos</SectionBadge>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
              TRADIÇÃO DE <span className="text-pac-primary">SERVIÇO</span> &
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-800">
                EXCELÊNCIA OPERACIONAL
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              A Patrulha Aérea Civil é uma organização de voluntários dedicada à
              proteção civil, operações de resgate e desenvolvimento de
              liderança jovem. Atuamos onde o Brasil precisa.
            </p>

            {/* Accordion */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 mb-8">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem
                  key={i}
                  item={item}
                  isOpen={openIndex === i}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>

            <Button
              size="lg"
              className="bg-pac-primary hover:bg-pac-primary-dark text-white rounded-full px-8 h-12 shadow-lg hover:shadow-pac-primary/30 transition-all font-bold tracking-wide group"
              asChild
            >
              <Link href="/sobre">
                Nossa História Completa
                <RiArrowRightLine className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {/* Lado Direito: Visual e Stats */}
          <motion.div
            className="flex-1 relative w-full flex flex-col items-center lg:items-end"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Grid de Cards de Valor */}
            <div className="grid grid-cols-1 w-full max-w-md gap-4 mb-8">
              {VALUES.map((val) => (
                <motion.div
                  key={val.title}
                  whileHover={{ y: -5 }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      val.color,
                    )}
                  >
                    <val.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                      {val.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-snug">
                      {val.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* BRASÃO (LOGO) AUMENTADO */}
            <div className="relative mt-8 lg:mt-12 flex justify-center lg:justify-end w-full">
              {/* Tamanho aumentado: Mobile (w-64) -> Desktop Grande (w-[420px]) */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px]">
                <div className="absolute inset-0 bg-pac-primary/20 blur-3xl rounded-full opacity-50" />
                <Image
                  src="/images/logos/logo.webp"
                  alt="Brasão Oficial"
                  fill
                  className="object-contain drop-shadow-2xl relative z-10"
                  sizes="(max-width: 768px) 256px, 420px"
                  priority={false}
                />
              </div>

              {/* Badge Flutuante "Desde..." */}
              <div className="absolute bottom-0 right-4 sm:right-12 lg:right-4 bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-20 hidden sm:block">
                <div className="flex items-center gap-3">
                  <RiShieldCheckLine className="w-8 h-8 text-pac-primary" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Atuação
                    </p>
                    <p className="text-lg font-black text-slate-800">
                      Nacional
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* STATS BAR (Bottom) */}
        <div className="border-t border-slate-100 pt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
