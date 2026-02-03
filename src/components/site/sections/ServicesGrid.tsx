"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  RiCrosshairLine,
  RiShieldCheckLine,
  RiFocusLine,
  RiUserLine,
  RiMapPinLine,
  RiTimeLine,
  RiBroadcastLine,
  RiRadarLine,
  RiCheckboxCircleLine,
  RiPhoneLine,
} from "react-icons/ri";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type IconType = React.ComponentType<{ className?: string }>;

interface Service {
  icon: IconType;
  title: string;
  description: string;
  fullDescription: string;
  features: string[];
}

// Dados dos serviços
const SERVICES: Service[] = [
  {
    icon: RiCrosshairLine,
    title: "RESGATE AÉREO TÁTICO",
    description:
      "Operações de busca e salvamento em áreas hostis com equipe de elite.",
    fullDescription:
      "Executamos operações de busca e salvamento em ambientes de difícil acesso, utilizando aeronaves equipadas com tecnologia de ponta.",
    features: [
      "Equipe de elite",
      "Tecnologia de ponta",
      "Resposta 24/7",
      "Áreas difíceis",
    ],
  },
  {
    icon: RiShieldCheckLine,
    title: "PROTEÇÃO CIVIL",
    description:
      "Resposta estratégica a desastres naturais e situações críticas.",
    fullDescription:
      "Atuamos em cenários complexos com cobertura estratégica e suporte integrado para garantir o sucesso operacional.",
    features: [
      "Protocolos prontos",
      "Prevenção de desastres",
      "Coordenação ágil",
      "Planos de contingência",
    ],
  },
  {
    icon: RiFocusLine,
    title: "OPERAÇÕES ESPECIAIS",
    description:
      "Missões de alto risco com planejamento tático e execução precisa.",
    fullDescription:
      "Missões que exigem planejamento e execução precisos. Atuação em cenários complexos com suporte para o sucesso operacional.",
    features: [
      "Planejamento tático",
      "Execução precisa",
      "Cobertura estratégica",
      "Cenários complexos",
    ],
  },
  {
    icon: RiUserLine,
    title: "CAPACITAÇÃO",
    description: "Treinamento tático em procedimentos de emergência e resgate.",
    fullDescription:
      "Programas de capacitação em procedimentos de emergência, técnicas de resgate e resposta em crises.",
    features: [
      "Programas especializados",
      "Técnicas de resgate",
      "Resposta a crises",
      "Treinamento contínuo",
    ],
  },
  {
    icon: RiMapPinLine,
    title: "BUSCA TERRITORIAL",
    description: "Operações de localização e extração em terreno hostil.",
    fullDescription:
      "Operações de busca em terrenos hostis com tecnologia de geolocalização e equipes especializadas.",
    features: [
      "Geolocalização",
      "Terrenos hostis",
      "Reconhecimento",
      "Equipes especializadas",
    ],
  },
  {
    icon: RiTimeLine,
    title: "RESPOSTA RÁPIDA",
    description: "Equipe de prontidão imediata para emergências críticas.",
    fullDescription:
      "Equipes de prontidão para emergências críticas com tempo mínimo de resposta. Estrutura operacional ágil.",
    features: [
      "Prontidão imediata",
      "Tempo mínimo",
      "Estrutura operacional",
      "Situações urgentes",
    ],
  },
  {
    icon: RiBroadcastLine,
    title: "COMUNICAÇÕES",
    description:
      "Sistema integrado de comunicações para coordenação operacional.",
    fullDescription:
      "Sistemas de comunicação tática para coordenação eficiente e troca de informações em tempo real entre as equipes.",
    features: [
      "Sistemas integrados",
      "Coordenação eficiente",
      "Tempo real",
      "Infraestrutura robusta",
    ],
  },
  {
    icon: RiRadarLine,
    title: "VIGILÂNCIA AÉREA",
    description:
      "Monitoramento e reconhecimento aéreo para apoio às operações.",
    fullDescription:
      "Monitoramento aéreo para apoio às operações em solo, fornecendo informações estratégicas e suporte visual.",
    features: [
      "Monitoramento aéreo",
      "Reconhecimento",
      "Suporte visual",
      "Tomada de decisão",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Removido o prop 'index' que não estava sendo usado
const ServiceCard = ({ service }: { service: Service }) => {
  const IconComponent = service.icon;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-pac-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-pac-primary transition-colors duration-300">
          <IconComponent className="h-6 w-6 text-pac-primary group-hover:text-white transition-colors duration-300" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg leading-tight uppercase tracking-tight">
          {service.title}
        </h3>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
        {service.description}
      </p>

      <div className="pt-4 border-t border-gray-100 mt-auto">
        <ul className="space-y-2">
          {service.features.slice(0, 3).map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 text-xs text-gray-500 font-medium"
            >
              <RiCheckboxCircleLine className="text-pac-secondary w-4 h-4 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export function ServicesGrid() {
  return (
    <section
      id="services-section"
      className="w-full bg-white py-12 sm:py-16 lg:py-20 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h1
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
              "font-extrabold text-gray-800 mb-4 sm:mb-6 tracking-tight uppercase mx-auto px-2",
              "max-w-[90vw]",
            )}
          >
            NOSSOS <span className="text-pac-primary">SERVIÇOS</span>
          </h1>

          <p
            className={cn(
              // Corrigido conflito de classes: removido sm:text-lg duplicado
              "text-sm sm:text-base md:text-lg text-gray-600 mx-auto leading-relaxed font-medium px-3 sm:px-4",
              "max-w-2xl",
            )}
          >
            Conheça nossos serviços especializados executados com padrões
            operacionais e compromisso com a excelência em resgate e proteção.
          </p>
        </motion.div>

        {/* Grid de Serviços */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {SERVICES.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Precisa de apoio operacional?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Nossa equipe está pronta para atuar em situações de emergência ou
              para consultoria técnica especializada.
            </p>
            <Button
              className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold px-8 py-6 rounded-xl text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              asChild
            >
              <Link href="/contato" className="flex items-center gap-2">
                <RiPhoneLine className="w-5 h-5" />
                SOLICITAR ATENDIMENTO
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
