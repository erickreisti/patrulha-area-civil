"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, Variants } from "framer-motion"; // ADICIONADO: Tipo Variants
import { cn } from "@/lib/utils/cn"; // AGORA SENDO USADO
import {
  RiCrosshairLine,
  RiShieldCheckLine,
  RiFocusLine,
  RiUserLine,
  RiMapPinLine,
  RiTimeLine,
  RiBroadcastLine,
  RiRadarLine,
  RiCheckboxCircleFill,
  RiPhoneLine,
  RiArrowRightLine,
} from "react-icons/ri";

// --- TIPAGEM ---

type IconType = React.ComponentType<{ className?: string }>;

interface Service {
  icon: IconType;
  title: string;
  description: string;
  features: string[];
}

// --- DADOS ---

const SERVICES: Service[] = [
  {
    icon: RiCrosshairLine,
    title: "Resgate Aéreo Tático",
    description:
      "Operações de busca e salvamento em áreas hostis com equipe de elite e aeronaves especializadas.",
    features: ["Busca e Salvamento", "Áreas de Risco", "Resposta 24/7"],
  },
  {
    icon: RiShieldCheckLine,
    title: "Proteção Civil",
    description:
      "Resposta estratégica a desastres naturais, suporte logístico e gerenciamento de crises.",
    features: ["Gestão de Crises", "Apoio Logístico", "Prevenção"],
  },
  {
    icon: RiFocusLine,
    title: "Operações Especiais",
    description:
      "Missões de alto risco que exigem planejamento tático detalhado e execução cirúrgica.",
    features: ["Planejamento Tático", "Alta Precisão", "Sigilo Operacional"],
  },
  {
    icon: RiUserLine,
    title: "Capacitação & Treino",
    description:
      "Formação rigorosa em procedimentos de emergência, primeiros socorros e sobrevivência.",
    features: ["Cursos Técnicos", "Sobrevivência", "Primeiros Socorros"],
  },
  {
    icon: RiMapPinLine,
    title: "Busca e Localização",
    description:
      "Rastreamento e extração em terrenos de difícil acesso com tecnologia de geolocalização.",
    features: ["Varredura Terrestre", "Geolocalização", "Extração"],
  },
  {
    icon: RiTimeLine,
    title: "Prontidão Rápida",
    description:
      "Equipes em stand-by para acionamento imediato em situações críticas.",
    features: ["Tempo de Resposta", "Disponibilidade", "Agilidade"],
  },
  {
    icon: RiBroadcastLine,
    title: "Comunicações",
    description:
      "Estabelecimento de redes de comunicação tática em áreas remotas ou colapsadas.",
    features: ["Redes de Rádio", "Coordenação", "Áreas Remotas"],
  },
  {
    icon: RiRadarLine,
    title: "Vigilância Aérea",
    description:
      "Monitoramento e reconhecimento aéreo para suporte visual e inteligência.",
    features: ["Reconhecimento", "Apoio Visual", "Monitoramento"],
  },
];

// --- VARIANTES DE ANIMAÇÃO CORRIGIDAS ---

// Adicionada a tipagem ': Variants' para corrigir o erro de TypeScript
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// --- SUB-COMPONENTES ---

const SectionHeader = () => (
  <div className="text-center mb-16 space-y-4">
    {/* Badge Estático */}
    <div className="flex items-center justify-center gap-4 mb-2">
      <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/30" />
      <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
        Nossas Capacidades
      </span>
      <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/30" />
    </div>

    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight">
      Operações & <span className="text-pac-primary">Serviços</span>
    </h2>

    <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed">
      Atuamos com protocolos rigorosos e equipamentos de ponta para garantir a
      eficiência em missões de resgate e proteção à vida.
    </p>
  </div>
);

const ServiceCard = ({ service }: { service: Service }) => {
  const Icon = service.icon;

  return (
    <motion.div
      variants={cardVariants}
      // CORREÇÃO: Usando 'cn' para envelopar as classes
      className={cn(
        "group relative flex flex-col h-full bg-white rounded-2xl p-6 sm:p-8",
        "border border-slate-100 shadow-sm transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1 hover:border-pac-primary/20",
      )}
    >
      {/* Icon Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-pac-primary transition-colors duration-300">
          <Icon className="w-7 h-7 text-slate-500 group-hover:text-white transition-colors duration-300" />
        </div>
        {/* Decorative Line */}
        <div className="w-12 h-1 bg-slate-100 rounded-full mt-2 group-hover:bg-pac-primary/20 transition-colors" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight mb-3 group-hover:text-pac-primary transition-colors">
        {service.title}
      </h3>

      <p className="text-slate-500 leading-relaxed mb-6 flex-grow text-sm sm:text-base">
        {service.description}
      </p>

      {/* Features List */}
      <div className="pt-6 border-t border-slate-50 mt-auto">
        <ul className="space-y-2">
          {service.features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600"
            >
              <RiCheckboxCircleFill className="w-4 h-4 text-pac-primary/40 group-hover:text-pac-primary transition-colors" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export function ServicesGrid() {
  return (
    <section
      id="services-section"
      className="py-20 sm:py-24 lg:py-32 bg-slate-50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader />

        {/* Grid Principal */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16 lg:mb-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {SERVICES.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </motion.div>

        {/* CTA Card (Chamada para Ação) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl overflow-hidden text-center">
            {/* Efeito de Fundo do Card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pac-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-pac-primary/10 rounded-full flex items-center justify-center mb-6">
                <RiPhoneLine className="w-8 h-8 text-pac-primary" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 uppercase">
                Precisa de Apoio Operacional?
              </h3>

              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8">
                Nossa equipe está pronta para atuar em situações de emergência
                ou fornecer consultoria técnica especializada para sua
                organização.
              </p>

              <Button
                size="lg"
                className={cn(
                  "bg-pac-primary hover:bg-pac-primary-dark text-white rounded-full px-10 h-14",
                  "shadow-lg hover:shadow-pac-primary/30 transition-all font-bold tracking-wide text-base sm:text-lg group",
                )}
                asChild
              >
                <Link href="/contato">
                  Solicitar Atendimento
                  <RiArrowRightLine className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
