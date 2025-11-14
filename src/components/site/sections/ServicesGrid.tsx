"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  FaCrosshairs,
  FaShieldAlt,
  FaBullseye,
  FaUsers,
  FaMapMarkerAlt,
  FaClock,
  FaBroadcastTower,
  FaSatellite,
  FaCheckCircle,
  FaArrowRight,
  FaPhoneAlt,
} from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  icon: any;
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
    icon: FaCrosshairs,
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
    color: "bg-navy-light",
    bgColor: "bg-navy-light/10",
    borderColor: "border-navy-light/30",
  },
  {
    icon: FaShieldAlt,
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
    color: "bg-navy-light",
    bgColor: "bg-navy-light/10",
    borderColor: "border-navy-light/30",
  },
  {
    icon: FaBullseye,
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
    color: "bg-navy-light",
    bgColor: "bg-navy-light/10",
    borderColor: "border-navy-light/30",
  },
  {
    icon: FaUsers,
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
    color: "bg-navy-light",
    bgColor: "bg-navy-light/10",
    borderColor: "border-navy-light/30",
  },
  {
    icon: FaMapMarkerAlt,
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
    color: "bg-navy-light",
    bgColor: "bg-navy-light/10",
    borderColor: "border-navy-light/30",
  },
  {
    icon: FaClock,
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
    color: "bg-navy-light",
    bgColor: "bg-navy-light/10",
    borderColor: "border-navy-light/30",
  },
  {
    icon: FaBroadcastTower,
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
    color: "bg-navy-light",
    bgColor: "bg-navy-light/10",
    borderColor: "border-navy-light/30",
  },
  {
    icon: FaSatellite,
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
    color: "bg-navy-light",
    bgColor: "bg-navy-light/10",
    borderColor: "border-navy-light/30",
  },
];

// Hook simplificado
const useServiceNavigation = (servicesCount: number) => {
  const [activeService, setActiveService] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleServiceSelect = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setActiveService(index);
    },
    [isAnimating]
  );

  // Scroll no card de detalhes (DESKTOP)
  const handleDetailsScroll = useCallback(
    (e: WheelEvent) => {
      if (window.innerWidth < 1440 || isAnimating) return;

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

      setTimeout(() => setIsAnimating(false), 500);
    },
    [activeService, isAnimating, servicesCount]
  );

  // Event listener para scroll no card de detalhes
  useEffect(() => {
    const detailsElement = detailsRef.current;
    if (detailsElement && window.innerWidth >= 1440) {
      detailsElement.addEventListener("wheel", handleDetailsScroll, {
        passive: false,
      });
      return () =>
        detailsElement.removeEventListener("wheel", handleDetailsScroll);
    }
  }, [handleDetailsScroll]);

  return {
    activeService,
    handleServiceSelect,
    detailsRef,
    isAnimating,
  };
};

// Hook para observer mobile
const useMobileObserver = (onServiceChange: (index: number) => void) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastChangeTime = useRef(0);

  useEffect(() => {
    // Só executa em mobile/tablet
    if (window.innerWidth >= 1440) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      const now = Date.now();

      // Debounce para evitar mudanças muito rápidas
      if (now - lastChangeTime.current < 500) return;

      const visibleEntries = entries.filter(
        (entry) => entry.intersectionRatio > 0.5
      );

      if (visibleEntries.length > 0) {
        // Encontra o card mais visível
        const mostVisible = visibleEntries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        );

        const indexAttr = (mostVisible.target as HTMLElement).getAttribute(
          "data-index"
        );
        if (indexAttr) {
          const index = parseInt(indexAttr);
          lastChangeTime.current = now;
          onServiceChange(index);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: [0.3, 0.5, 0.7],
      rootMargin: "-10% 0px -10% 0px",
    });

    // Observar todos os cards de serviço
    const serviceCards = document.querySelectorAll("[data-service-card]");
    serviceCards.forEach((card) => {
      observerRef.current?.observe(card);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onServiceChange]);
};

// Componentes
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
    <motion.div
      key={service.title}
      onClick={() => onSelect(index)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className={`
        cursor-pointer transition-all duration-300 rounded-xl p-4 border-2 h-32
        ${
          activeService === index
            ? "border-navy-light bg-navy-light/10 shadow-xl transform scale-105"
            : "border-gray-200 bg-white shadow-lg hover:shadow-xl"
        }
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`
              w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${
                activeService === index
                  ? "bg-navy-light text-white shadow-md"
                  : "bg-gray-100 text-navy"
              }
            `}
          >
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`
                font-bold text-xs leading-tight line-clamp-2
                ${activeService === index ? "text-navy-light" : "text-gray-800"}
              `}
            >
              {service.title}
            </h3>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto">
          <div
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${activeService === index ? "bg-navy-light scale-125" : "bg-gray-300"}
            `}
          />
          <span className="text-xs text-gray-500 font-medium">
            {index + 1}/{SERVICES.length}
          </span>
        </div>
      </div>
    </motion.div>
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
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header do Serviço */}
      <div className="flex items-center gap-4">
        <div
          className={`
            w-14 h-14 rounded-xl flex items-center justify-center
            ${service.bgColor} shadow-lg flex-shrink-0
          `}
        >
          <IconComponent className="h-7 w-7 text-navy-light" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight leading-tight">
            {service.title}
          </h2>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-2">
          Descrição do Serviço
        </h3>
        <p className="text-gray-800 leading-relaxed text-sm">
          {service.fullDescription}
        </p>
      </div>

      {/* Características */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3">
          Características Principais
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {service.features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <FaCheckCircle className="h-4 w-4 text-navy-light flex-shrink-0" />
              <span className="text-gray-800 text-sm font-medium leading-relaxed">
                {feature}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Button
              className="bg-navy hover:bg-navy-dark text-white font-bold px-4 py-2 shadow-lg flex-1 text-sm min-h-[44px] transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link
                href="/contato"
                className="flex items-center justify-center gap-2"
              >
                <FaPhoneAlt className="h-3 w-3" />
                SOLICITAR SERVIÇO
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Button
              variant="outline"
              className="border-2 border-navy-light text-navy-light hover:bg-navy-light hover:text-white font-bold px-4 py-2 flex-1 text-sm min-h-[44px] transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link
                href="/servicos"
                className="flex items-center justify-center gap-2"
              >
                SABER MAIS
                <FaArrowRight className="h-3 w-3" />
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
}: {
  service: Service;
  index: number;
  activeService: number;
  onSelect: (index: number) => void;
}) => {
  const IconComponent = service.icon;

  return (
    <motion.div
      data-service-card
      data-index={index}
      id={`service-${index}`}
      onClick={() => onSelect(index)}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`
        w-full text-left p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${
          activeService === index
            ? "border-navy-light bg-navy-light/10 shadow-xl"
            : "border-gray-200 bg-white shadow-lg hover:shadow-xl"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
            ${activeService === index ? "bg-navy-light text-white shadow-md" : "bg-gray-100 text-navy"}
          `}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`
              font-bold text-base mb-1 leading-tight
              ${activeService === index ? "text-navy-light" : "text-gray-800"}
            `}
          >
            {service.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>

        <div
          className={`
            w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300
            ${activeService === index ? "bg-navy-light scale-125" : "bg-gray-300"}
          `}
        />
      </div>

      <AnimatePresence>
        {activeService === index && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 text-base mb-2">
                Descrição Completa
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {service.fullDescription}
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 text-base mb-2">
                Características
              </h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                {service.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                  >
                    <FaCheckCircle className="h-3 w-3 text-navy-light flex-shrink-0" />
                    <span className="text-gray-700 text-xs">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-3">
              <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 justify-center items-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Button
                    className="flex-1 w-full sm:w-[280px] bg-navy hover:bg-navy-dark text-white text-sm h-12 transition-all duration-300 hover:scale-105 min-h-[48px]"
                    asChild
                  >
                    <Link
                      href="/contato"
                      className="flex items-center justify-center gap-2 py-2"
                    >
                      <FaPhoneAlt className="h-4 w-4" />
                      Contatar
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="flex-1 w-full sm:w-[280px] border-navy-light text-navy-light hover:bg-navy-light hover:text-white text-sm h-12 transition-all duration-300 hover:scale-105 min-h-[48px]"
                    asChild
                  >
                    <Link
                      href="/servicos"
                      className="flex items-center justify-center gap-2 py-2"
                    >
                      Detalhes
                      <FaArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
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
    className="flex justify-center gap-2 mt-4"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    viewport={{ once: true }}
  >
    {SERVICES.map((_, index) => (
      <button
        key={index}
        onClick={() => onSelect(index)}
        className={`
          w-2 h-2 rounded-full transition-all duration-300
          ${activeService === index ? "bg-navy-light w-6" : "bg-gray-300"}
        `}
        aria-label={`Ir para serviço ${index + 1}`}
      />
    ))}
  </motion.div>
);

const MobileCTASection = () => (
  <motion.div
    className="2xl:hidden mt-6 text-center"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    viewport={{ once: true }}
  >
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
      <h3 className="font-bold text-gray-800 text-base mb-1">
        Precisa de nossos serviços?
      </h3>
      <p className="text-gray-600 text-xs mb-3">
        Entre em contato para uma consultoria especializada
      </p>
      <Button
        className="bg-navy hover:bg-navy-dark text-white w-full sm:w-auto text-xs h-9 transition-all duration-300 hover:scale-105"
        asChild
      >
        <Link
          href="/contato"
          className="flex items-center justify-center gap-1"
        >
          <FaPhoneAlt className="h-3 w-3" />
          SOLICITAR ATENDIMENTO
        </Link>
      </Button>
    </div>
  </motion.div>
);

// Main Component
export function ServicesGrid() {
  const { activeService, handleServiceSelect, detailsRef } =
    useServiceNavigation(SERVICES.length);

  // Usar o observer mobile
  useMobileObserver(handleServiceSelect);

  return (
    <section
      id="services-section"
      className="w-full bg-offwhite py-16 lg:py-20"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-1 bg-navy-light"></div>
            <motion.div
              className="w-12 h-12 bg-navy-light rounded-full flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <FaBullseye className="h-6 w-6 text-white" />
            </motion.div>
            <div className="w-16 h-1 bg-navy-light"></div>
          </div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 tracking-normal uppercase"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            NOSSOS <span className="text-navy-dark">SERVIÇOS</span>
          </motion.h1>

          <motion.p
            className="text-lg text-gray-800 max-w-4xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Conheça nossos serviços especializados executados com padrões
            operacionais e compromisso com a excelência
          </motion.p>
        </motion.div>

        {/* === LAYOUT DESKTOP - LADO A LADO (acima de 1440px) === */}
        <motion.div
          className="hidden 2xl:flex gap-8 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Coluna Esquerda - Grid de Serviços */}
          <div className="flex-1 max-w-md">
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
                <FaCrosshairs className="h-5 w-5 text-white" />
              </div>
              <span className="text-navy font-bold tracking-wider uppercase text-sm">
                Nossas Especialidades
              </span>
            </motion.div>

            {/* Grid 2x2 */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* Indicador de Progresso */}
            <div className="flex justify-center gap-2 mt-6">
              {SERVICES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleServiceSelect(index)}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${activeService === index ? "bg-navy-light w-6" : "bg-gray-300 hover:bg-gray-400"}
                  `}
                  aria-label={`Ir para serviço ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Coluna Direita - Card de Detalhes */}
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
                className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg h-[600px] overflow-hidden"
              >
                <div className="overflow-y-auto h-full pr-2 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    <ServiceDetails service={SERVICES[activeService]} />
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Instruções de Scroll */}
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-sm text-gray-500 font-medium">
                <span className="block mb-1">🖱️ Use o scroll para navegar</span>
                <span className="text-xs text-gray-400">
                  Role para cima/baixo no card para ver outros serviços
                </span>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* === LAYOUT MOBILE & TABLET (até 1439px) === */}
        <motion.div
          className="2xl:hidden space-y-4 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Cards de Serviços Interativos */}
          <div className="space-y-4">
            {SERVICES.map((service, index) => (
              <MobileServiceCard
                key={service.title}
                service={service}
                index={index}
                activeService={activeService}
                onSelect={handleServiceSelect}
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
