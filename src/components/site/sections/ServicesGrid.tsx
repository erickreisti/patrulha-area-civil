"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  RiArrowRightLine,
  RiPhoneLine,
  RiSettingsLine,
  RiArrowLeftLine,
  RiArrowRightLine as RiArrowRight,
} from "react-icons/ri";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/utils";

type IconType = React.ComponentType<{ className?: string }>;

interface Service {
  icon: IconType;
  title: string;
  description: string;
  fullDescription: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

const SERVICES: Service[] = [
  {
    icon: RiCrosshairLine,
    title: "RESGATE AÉREO TÁTICO",
    description:
      "Operações de busca e salvamento em áreas hostis com equipe de elite",
    fullDescription:
      "Executamos operações de busca e salvamento em ambientes de difícil acesso, utilizando aeronaves equipadas com tecnologia de ponta. Nossa equipe de elite está preparada para atuar em situações críticas com máxima eficiência.",
    features: [
      "Equipe de elite especializada",
      "Tecnologia de ponta em aeronaves",
      "Resposta rápida 24/7",
      "Áreas de difícil acesso",
    ],
    color: "bg-navy",
    bgColor: "bg-navy/10",
    borderColor: "border-navy/30",
  },
  {
    icon: RiShieldCheckLine,
    title: "PROTEÇÃO CIVIL",
    description:
      "Resposta estratégica a desastres naturais e situações críticas",
    fullDescription:
      "Atuamos em cenários complexos com cobertura estratégica e suporte integrado para garantir o sucesso operacional em situações de desastres naturais e emergências civis.",
    features: [
      "Protocolos estabelecidos",
      "Prevenção de desastres",
      "Coordenação de emergências",
      "Planos de contingência",
    ],
    color: "bg-navy",
    bgColor: "bg-navy/10",
    borderColor: "border-navy/30",
  },
  {
    icon: RiFocusLine,
    title: "OPERAÇÕES ESPECIAIS",
    description:
      "Missões de alto risco com planejamento tático e execução precisa",
    fullDescription:
      "Missões que exigem planejamento e execução precisos. Atuação em cenários complexos com suporte para o sucesso operacional em ambientes hostis e de alto risco.",
    features: [
      "Planejamento tático detalhado",
      "Execução precisa",
      "Cobertura estratégica",
      "Cenários complexos",
    ],
    color: "bg-navy",
    bgColor: "bg-navy/10",
    borderColor: "border-navy/30",
  },
  {
    icon: RiUserLine,
    title: "CAPACITAÇÃO OPERACIONAL",
    description: "Treinamento tático em procedimentos de emergência e resgate",
    fullDescription:
      "Programas de capacitação em procedimentos de emergência, técnicas de resgate e resposta em crises. Desenvolvemos habilidades técnicas e táticas para atuação em cenários reais.",
    features: [
      "Programas especializados",
      "Técnicas de resgate",
      "Resposta a crises",
      "Treinamento contínuo",
    ],
    color: "bg-navy",
    bgColor: "bg-navy/10",
    borderColor: "border-navy/30",
  },
  {
    icon: RiMapPinLine,
    title: "BUSCA TERRITORIAL",
    description: "Operações de localização e extração em terreno hostil",
    fullDescription:
      "Operações de busca em terrenos hostis com tecnologia de geolocalização e equipes especializadas. Atuamos em áreas remotas e de difícil acesso com precisão e segurança.",
    features: [
      "Tecnologia de geolocalização",
      "Terrenos hostis",
      "Reconhecimento territorial",
      "Equipes especializadas",
    ],
    color: "bg-navy",
    bgColor: "bg-navy/10",
    borderColor: "border-navy/30",
  },
  {
    icon: RiTimeLine,
    title: "RESPOSTA RÁPIDA",
    description: "Equipe de prontidão imediata para emergências críticas",
    fullDescription:
      "Equipes de prontidão para emergências críticas com tempo mínimo de resposta. Estrutura operacional ágil e eficiente para atendimento imediato em situações de crise.",
    features: [
      "Prontidão imediata",
      "Tempo de resposta mínimo",
      "Estrutura operacional",
      "Situações urgentes",
    ],
    color: "bg-navy",
    bgColor: "bg-navy/10",
    borderColor: "border-navy/30",
  },
  {
    icon: RiBroadcastLine,
    title: "COMUNICAÇÕES TÁTICAS",
    description:
      "Sistema integrado de comunicações para coordenação operacional",
    fullDescription:
      "Sistemas de comunicação tática para coordenação eficiente e troca de informações em tempo real entre as equipes. Garantimos comunicação segura e ininterrupta em todas as operações.",
    features: [
      "Sistemas integrados",
      "Coordenação eficiente",
      "Comunicação em tempo real",
      "Infraestrutura robusta",
    ],
    color: "bg-navy",
    bgColor: "bg-navy/10",
    borderColor: "border-navy/30",
  },
  {
    icon: RiRadarLine,
    title: "VIGILÂNCIA AÉREA",
    description: "Monitoramento e reconhecimento aéreo para apoio às operações",
    fullDescription:
      "Monitoramento aéreo para apoio às operações em solo, fornecendo informações estratégicas e suporte visual em tempo real. Utilizamos tecnologia de ponta para vigilância e reconhecimento.",
    features: [
      "Monitoramento aéreo",
      "Reconhecimento estratégico",
      "Suporte visual",
      "Tomada de decisão",
    ],
    color: "bg-navy",
    bgColor: "bg-navy/10",
    borderColor: "border-navy/30",
  },
];

const useServiceNavigation = (servicesCount: number) => {
  const [activeService, setActiveService] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleServiceSelect = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setActiveService(index);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating]
  );

  // Touch handling for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Minimum swipe distance
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeService < servicesCount - 1) {
        handleServiceSelect(activeService + 1);
      } else if (diff < 0 && activeService > 0) {
        handleServiceSelect(activeService - 1);
      }
    }

    setTouchStart(null);
  };

  useEffect(() => {
    const detailsElement = detailsRef.current;
    if (detailsElement && window.innerWidth >= 1440) {
      const handleWheel = (e: WheelEvent) => {
        if (isAnimating) return;

        // Prevent default only if we're going to handle it
        if (Math.abs(e.deltaY) > 50) {
          e.preventDefault();
          setIsAnimating(true);

          const direction = e.deltaY > 0 ? 1 : -1;
          const newIndex = Math.max(
            0,
            Math.min(servicesCount - 1, activeService + direction)
          );

          if (newIndex !== activeService) {
            setActiveService(newIndex);
          }

          setTimeout(() => setIsAnimating(false), 300);
        }
      };

      detailsElement.addEventListener("wheel", handleWheel, { passive: false });
      return () => detailsElement.removeEventListener("wheel", handleWheel);
    }
  }, [activeService, isAnimating, servicesCount]);

  return {
    activeService,
    handleServiceSelect,
    detailsRef,
    isAnimating,
    handleTouchStart,
    handleTouchEnd,
  };
};

const ServiceCard = ({
  service,
  index,
  activeService,
  onSelect,
}: {
  service: Service;
  index: number;
  activeService: number;
  onSelect: (index: number) => void;
}) => {
  const IconComponent = service.icon;

  return (
    <motion.button
      key={service.title}
      onClick={() => onSelect(index)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "cursor-pointer transition-all duration-300 rounded-xl p-3 sm:p-4 border-2 h-28 sm:h-32 w-full text-left",
        "focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2",
        activeService === index
          ? "border-navy bg-navy/10 shadow-xl transform scale-105"
          : "border-slate-200 bg-white shadow-lg hover:shadow-xl"
      )}
      aria-label={`Selecionar serviço: ${service.title}`}
      aria-pressed={activeService === index}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div
            className={cn(
              "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
              activeService === index
                ? "bg-navy text-white shadow-md"
                : "bg-slate-100 text-navy"
            )}
          >
            <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-bold text-xs sm:text-sm leading-tight line-clamp-2",
                activeService === index ? "text-navy" : "text-slate-800"
              )}
            >
              {service.title}
            </h3>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto">
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              activeService === index ? "bg-navy scale-125" : "bg-slate-300"
            )}
          />
          <span className="text-xs text-slate-500 font-medium">
            {index + 1}/{SERVICES.length}
          </span>
        </div>
      </div>
    </motion.button>
  );
};

const ServiceDetails = ({ service }: { service: Service }) => {
  const IconComponent = service.icon;

  return (
    <motion.div
      key={service.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center",
            service.bgColor,
            "shadow-lg flex-shrink-0"
          )}
        >
          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-navy" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 uppercase tracking-tight leading-tight">
            {service.title}
          </h2>
        </div>
      </div>

      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2">
          Descrição do Serviço
        </h3>
        <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
          {service.fullDescription}
        </p>
      </div>

      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2 sm:mb-3">
          Características Principais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
          {service.features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <RiCheckboxCircleLine className="h-3 w-3 sm:h-4 sm:w-4 text-navy flex-shrink-0" />
              <span className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
                {feature}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="pt-3 sm:pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="w-full"
          >
            <Button
              className="bg-navy hover:bg-navy-700 text-white font-bold px-3 sm:px-4 py-2 shadow-lg w-full text-xs sm:text-sm min-h-[40px] sm:min-h-[44px] transition-all duration-300 hover:scale-105 touch-optimize active:scale-95"
              asChild
            >
              <Link
                href="/contato"
                className="flex items-center justify-center gap-1 sm:gap-2"
              >
                <RiPhoneLine className="h-3 w-3 sm:h-3 sm:w-3" />
                SOLICITAR SERVIÇO
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="w-full"
          >
            <Button
              variant="outline"
              className="border-2 border-navy text-navy hover:bg-navy hover:text-white font-bold px-3 sm:px-4 py-2 w-full text-xs sm:text-sm min-h-[40px] sm:min-h-[44px] transition-all duration-300 hover:scale-105 touch-optimize active:scale-95"
              asChild
            >
              <Link
                href="/servicos"
                className="flex items-center justify-center gap-1 sm:gap-2"
              >
                SABER MAIS
                <RiArrowRightLine className="h-3 w-3 sm:h-3 sm:w-3" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const MobileServiceCard = ({
  service,
  index,
  activeService,
  onSelect,
  onTouchStart,
  onTouchEnd,
}: {
  service: Service;
  index: number;
  activeService: number;
  onSelect: (index: number) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}) => {
  const IconComponent = service.icon;

  return (
    <motion.div
      key={service.title}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "w-full text-left p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
        activeService === index
          ? "border-navy bg-navy/10 shadow-xl"
          : "border-slate-200 bg-white shadow-lg hover:shadow-xl"
      )}
    >
      <div
        className="flex items-center gap-2 sm:gap-3"
        onClick={() => onSelect(index)}
      >
        <div
          className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
            activeService === index
              ? "bg-navy text-white shadow-md"
              : "bg-slate-100 text-navy"
          )}
        >
          <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-bold text-sm sm:text-base mb-1 leading-tight",
              activeService === index ? "text-navy" : "text-slate-800"
            )}
          >
            {service.title}
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>

        <div
          className={cn(
            "w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300",
            activeService === index ? "bg-navy scale-125" : "bg-slate-300"
          )}
        />
      </div>

      <AnimatePresence>
        {activeService === index && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200"
          >
            <div className="mb-3 sm:mb-4">
              <h4 className="font-semibold text-slate-800 text-sm sm:text-base mb-2">
                Descrição Completa
              </h4>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                {service.fullDescription}
              </p>
            </div>

            <div className="mb-3 sm:mb-4">
              <h4 className="font-semibold text-slate-800 text-sm sm:text-base mb-2">
                Características
              </h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 sm:gap-2">
                {service.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    className="flex items-center gap-1 sm:gap-2 p-1.5 bg-slate-50 rounded"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: featureIndex * 0.1 }}
                  >
                    <RiCheckboxCircleLine className="h-3 w-3 text-navy flex-shrink-0" />
                    <span className="text-slate-700 text-xs">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center pt-2 sm:pt-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="w-full"
              >
                <Button
                  className="flex-1 w-full bg-navy hover:bg-navy-700 text-white text-xs sm:text-sm h-10 sm:h-12 transition-all duration-300 hover:scale-105 min-h-[40px] sm:min-h-[48px] touch-optimize active:scale-95"
                  asChild
                >
                  <Link
                    href="/contato"
                    className="flex items-center justify-center gap-1 sm:gap-2 py-2"
                  >
                    <RiPhoneLine className="h-3 w-3 sm:h-4 sm:w-4" />
                    Contatar
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="flex-1 w-full border-navy text-navy hover:bg-navy hover:text-white text-xs sm:text-sm h-10 sm:h-12 transition-all duration-300 hover:scale-105 min-h-[40px] sm:min-h-[48px] touch-optimize active:scale-95"
                  asChild
                >
                  <Link
                    href="/servicos"
                    className="flex items-center justify-center gap-1 sm:gap-2 py-2"
                  >
                    Detalhes
                    <RiArrowRightLine className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ServiceNavigation = ({
  activeService,
  onSelect,
}: {
  activeService: number;
  onSelect: (index: number) => void;
}) => (
  <motion.div
    className="flex justify-center items-center gap-4 mt-4"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    viewport={{ once: true }}
  >
    <button
      onClick={() => onSelect(Math.max(0, activeService - 1))}
      disabled={activeService === 0}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
        activeService === 0
          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
          : "bg-navy text-white hover:bg-navy-700"
      )}
      aria-label="Serviço anterior"
    >
      <RiArrowLeftLine className="w-4 h-4" />
    </button>

    <div className="flex gap-1 sm:gap-2">
      {SERVICES.map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            activeService === index
              ? "bg-navy w-4 sm:w-6"
              : "bg-slate-300 hover:bg-slate-400"
          )}
          aria-label={`Ir para serviço ${index + 1}`}
        />
      ))}
    </div>

    <button
      onClick={() => onSelect(Math.min(SERVICES.length - 1, activeService + 1))}
      disabled={activeService === SERVICES.length - 1}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
        activeService === SERVICES.length - 1
          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
          : "bg-navy text-white hover:bg-navy-700"
      )}
      aria-label="Próximo serviço"
    >
      <RiArrowRight className="w-4 h-4" />
    </button>
  </motion.div>
);

const MobileCTASection = () => (
  <motion.div
    className="2xl:hidden mt-4 sm:mt-6 text-center"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    viewport={{ once: true }}
  >
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-slate-200">
      <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1">
        Precisa de nossos serviços?
      </h3>
      <p className="text-slate-600 text-xs mb-2 sm:mb-3">
        Entre em contato para uma consultoria especializada
      </p>
      <Button
        className="bg-navy hover:bg-navy-700 text-white w-full sm:w-auto text-xs h-8 sm:h-9 transition-all duration-300 hover:scale-105 touch-optimize active:scale-95"
        asChild
      >
        <Link
          href="/contato"
          className="flex items-center justify-center gap-1"
        >
          <RiPhoneLine className="h-3 w-3" />
          SOLICITAR ATENDIMENTO
        </Link>
      </Button>
    </div>
  </motion.div>
);

export function ServicesGrid() {
  const {
    activeService,
    handleServiceSelect,
    detailsRef,
    handleTouchStart,
    handleTouchEnd,
  } = useServiceNavigation(SERVICES.length);

  return (
    <section
      id="services-section"
      className="w-full bg-offwhite py-12 sm:py-16 lg:py-20 overflow-hidden"
    >
      <div className="container mx-auto px-3 sm:px-4">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-8 sm:w-12 lg:w-16 h-0.5 sm:h-1 bg-navy"></div>
            <motion.div
              className="w-10 h-10 sm:w-12 sm:h-12 bg-navy rounded-full flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <RiSettingsLine className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </motion.div>
            <div className="w-8 sm:w-12 lg:w-16 h-0.5 sm:h-1 bg-navy"></div>
          </div>

          <h1
            className={cn(
              "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
              "font-bold text-slate-800 mb-4 sm:mb-6 tracking-normal uppercase mx-auto px-2",
              "max-w-[90vw]"
            )}
          >
            NOSSOS <span className="text-navy">SERVIÇOS</span>
          </h1>

          <p
            className={cn(
              "text-sm xs:text-base sm:text-lg text-slate-700 mx-auto leading-relaxed font-medium px-3 sm:px-4",
              "max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl"
            )}
          >
            Conheça nossos serviços especializados executados com padrões
            operacionais e compromisso com a excelência
          </p>
        </motion.div>

        {/* Desktop Layout (2xl and above) */}
        <motion.div
          className="hidden 2xl:flex gap-6 sm:gap-8 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex-1 max-w-md">
            <motion.div
              className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-navy rounded-lg flex items-center justify-center">
                <RiCrosshairLine className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-navy font-bold tracking-wider uppercase text-xs sm:text-sm">
                Nossas Especialidades
              </span>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {SERVICES.map((service, index) => (
                <ServiceCard
                  key={service.title}
                  service={service}
                  index={index}
                  activeService={activeService}
                  onSelect={handleServiceSelect}
                />
              ))}
            </div>

            <div className="flex justify-center gap-1 sm:gap-2 mt-4 sm:mt-6">
              {SERVICES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleServiceSelect(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    activeService === index
                      ? "bg-navy w-4 sm:w-6"
                      : "bg-slate-300 hover:bg-slate-400"
                  )}
                  aria-label={`Ir para serviço ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 max-w-2xl">
            <motion.div
              className="sticky top-24"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div
                ref={detailsRef}
                className="bg-white border-2 border-slate-200 rounded-xl p-4 sm:p-6 shadow-lg h-[500px] sm:h-[600px] overflow-hidden"
              >
                <div className="overflow-y-auto h-full pr-2 scrollbar-thin">
                  <AnimatePresence mode="wait">
                    <ServiceDetails service={SERVICES[activeService]} />
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-3 sm:mt-4 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                <span className="block mb-1">🖱️ Use o scroll para navegar</span>
                <span className="text-xs text-slate-400">
                  Role para cima/baixo no card para ver outros serviços
                </span>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile/Tablet Layout (below 2xl) */}
        <motion.div
          className="2xl:hidden space-y-3 sm:space-y-4 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="space-y-3 sm:space-y-4">
            {SERVICES.map((service, index) => (
              <MobileServiceCard
                key={service.title}
                service={service}
                index={index}
                activeService={activeService}
                onSelect={handleServiceSelect}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
            ))}
          </div>

          <ServiceNavigation
            activeService={activeService}
            onSelect={handleServiceSelect}
          />
        </motion.div>

        <MobileCTASection />
      </div>
    </section>
  );
}
