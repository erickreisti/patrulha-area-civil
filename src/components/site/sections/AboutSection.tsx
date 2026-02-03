"use client";

import { Button } from "@/components/ui/button";
import {
  RiEyeLine,
  RiArrowRightLine,
  RiUserLine,
  RiHomeLine,
  RiBookLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiFlagLine,
  RiCrosshairLine,
  RiMapPinLine,
  RiTimeLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "react-icons/ri";
import Link from "next/link";
import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const STATS = [
  { number: "500+", label: "jovens impactados", icon: RiUserLine },
  { number: "200+", label: "pessoas abrigadas", icon: RiHomeLine },
  { number: "10+", label: "comunidades ativas", icon: RiBookLine },
  { number: "50+", label: "voluntários ativos", icon: RiTeamLine },
];

const ACCORDION_ITEMS = [
  {
    title: "Disciplina e Hierarquia",
    content:
      "Atuamos com estrutura organizacional definida e cadeia de comando clara, garantindo eficiência operacional e respeito à hierarquia.",
  },
  {
    title: "Preparação para Emergências",
    content:
      "Desenvolvemos protocolos e treinamentos específicos para atuação em situações de crise e desastres naturais.",
  },
  {
    title: "Serviço Voluntário",
    content:
      "Todos os membros atuam de forma voluntária, dedicando tempo e expertise para o bem da comunidade e da nação.",
  },
  {
    title: "Compromisso com a Pátria",
    content:
      "Nossa atuação é guiada pelo amor à pátria e pelo desejo de contribuir para o desenvolvimento e segurança nacional.",
  },
];

const AREAS_ATUACAO = [
  {
    icon: RiCrosshairLine,
    title: "Operações de Resgate",
    description:
      "Busca e salvamento aéreo e terrestre em situações de emergência",
  },
  {
    icon: RiUserLine,
    title: "Treinamento de Voluntários",
    description: "Capacitação técnica e operacional para atuação em campo",
  },
  {
    icon: RiShieldCheckLine,
    title: "Proteção Civil",
    description: "Preparação para emergências e desastres naturais",
  },
  {
    icon: RiBookLine,
    title: "Instrução e Doutrina",
    description: "Desenvolvimento de procedimentos e protocolos operacionais",
  },
];

const MISSION_VALUES = [
  {
    icon: RiCrosshairLine,
    title: "Missão",
    description:
      "Promover a segurança aérea e terrestre através de serviços voluntários, treinamentos especializados e operações de resgate, contribuindo para o bem-estar da sociedade.",
    badge: "Compromisso",
  },
  {
    icon: RiEyeLine,
    title: "Visão",
    description:
      "Ser referência nacional em voluntariado especializado, reconhecida pela excelência em operações de proteção civil e formação de cidadãos comprometidos.",
    badge: "Excelência",
  },
  {
    icon: RiShieldCheckLine,
    title: "Valores",
    description:
      "Honra, disciplina, lealdade, coragem e comprometimento. Atuamos com integridade em todas as missões, valorizando cada vida e promovendo o bem comum.",
    badge: "Honra",
  },
];

const SectionHeader = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="text-center mb-8 sm:mb-12 lg:mb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* ÍCONE REMOVIDO AQUI */}
      <h1
        className={cn(
          "font-extrabold text-gray-800 mb-4 sm:mb-6 uppercase mx-auto px-2", // font-extrabold
          "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
          "max-w-[90vw]",
        )}
      >
        SOBRE A <span className="text-pac-primary">PATRULHA</span>
      </h1>
      <p
        className={cn(
          "text-gray-700 mx-auto leading-relaxed font-medium px-2 sm:px-4",
          "text-sm xs:text-base sm:text-lg lg:text-xl",
          "max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-4xl",
        )}
      >
        Organização civil de voluntários comprometida com o serviço humanitário,
        preparação para emergências e desenvolvimento de capacidades na aviação
        civil.
      </p>
    </motion.div>
  );
};

const EmblemSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error("Erro ao carregar a imagem do emblema");
    setImageError(true);
  };

  return (
    <motion.div
      className="relative group flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="text-center">
        <div
          className={cn(
            "mx-auto mb-4 sm:mb-6 lg:mb-8 flex items-center justify-center",
            "w-32 h-32 xs:w-36 xs:h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64",
          )}
        >
          <div className="relative w-full h-full">
            {/* Fallback background */}
            {imageError && (
              <div className="absolute inset-0 bg-pac-primary/10 rounded-full flex items-center justify-center">
                <RiShieldCheckLine className="w-16 h-16 sm:w-20 sm:h-20 text-pac-primary/30" />
              </div>
            )}

            {!imageError && (
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                width={256}
                height={256}
                className="object-contain drop-shadow-2xl w-full h-full transition-opacity duration-500"
                priority
                onLoad={() => setIsLoaded(true)}
                onError={handleImageError}
                style={{
                  opacity: isLoaded ? 1 : 0,
                }}
                sizes="(max-width: 480px) 128px, (max-width: 640px) 144px, (max-width: 768px) 160px, (max-width: 1024px) 192px, (max-width: 1280px) 224px, 256px"
              />
            )}
          </div>
        </div>
        <div
          className={cn(
            "font-bold text-pac-primary uppercase tracking-wider mx-auto px-2",
            "text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl",
            "max-w-[90vw]",
          )}
        >
          Patrulha Aérea Civil
        </div>
      </div>
    </motion.div>
  );
};

const Accordion = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <motion.div
      className="space-y-2 sm:space-y-3 pt-4 sm:pt-5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {ACCORDION_ITEMS.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors duration-200"
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left transition-colors duration-200 touch-optimize"
            aria-expanded={openAccordion === index}
            aria-controls={`accordion-content-${index}`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pac-primary rounded-full flex-shrink-0"></div>
              <span
                className={cn(
                  "font-semibold text-gray-800 text-left",
                  "text-sm sm:text-base",
                )}
              >
                {item.title}
              </span>
            </div>
            {openAccordion === index ? (
              <RiArrowUpSLine className="w-3 h-3 sm:w-4 sm:h-4 text-pac-primary flex-shrink-0" />
            ) : (
              <RiArrowDownSLine className="w-3 h-3 sm:w-4 sm:h-4 text-pac-primary flex-shrink-0" />
            )}
          </button>
          <div
            id={`accordion-content-${index}`}
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openAccordion === index ? "max-h-96" : "max-h-0",
            )}
          >
            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
              <p
                className={cn(
                  "text-gray-600 leading-relaxed",
                  "text-xs sm:text-sm",
                )}
              >
                {item.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const MissionValuesGrid = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16 lg:mb-20",
        "grid-cols-1 md:grid-cols-3",
      )}
    >
      {MISSION_VALUES.map((item, index) => (
        <motion.div
          key={item.title}
          className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-pac-primary rounded-lg flex items-center justify-center shadow-md transition-transform duration-300">
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wide px-2 sm:px-3 py-1 rounded-full bg-pac-primary">
              {item.badge}
            </span>
          </div>

          <h3
            className={cn(
              "font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide",
              "text-lg sm:text-xl lg:text-2xl",
            )}
          >
            {item.title}
          </h3>
          <p
            className={cn(
              "text-gray-700 leading-relaxed",
              "text-xs sm:text-sm lg:text-base",
            )}
          >
            {item.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

const StatsGrid = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={cn("grid gap-3 sm:gap-4 pt-6", "grid-cols-2")}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {STATS.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="text-center p-3 sm:p-4 lg:p-5 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex justify-center mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-pac-primary rounded-xl flex items-center justify-center shadow-md">
              <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            </div>
          </div>
          <div
            className={cn(
              "font-bold text-pac-alert mb-1 sm:mb-2",
              "text-xl sm:text-2xl lg:text-3xl",
            )}
          >
            {stat.number}
          </div>
          <div
            className={cn(
              "text-gray-600 uppercase font-bold tracking-wider",
              "text-xs sm:text-sm",
            )}
          >
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const AreasAtuacao = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg"
      initial={{ opacity: 0, x: 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8 pb-3 sm:pb-4 border-b border-gray-200">
        <RiMapPinLine className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-pac-primary flex-shrink-0" />
        <h3
          className={cn(
            "font-bold text-gray-800 uppercase tracking-wide",
            "text-lg sm:text-xl lg:text-2xl",
          )}
        >
          Áreas de Atuação
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-5">
        {AREAS_ATUACAO.map((area, index) => (
          <motion.div
            key={index}
            className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-pac-primary/50 transition-colors duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-pac-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-300">
              <area.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  "font-bold text-gray-800 mb-1 sm:mb-2",
                  "text-base sm:text-lg lg:text-xl",
                )}
              >
                {area.title}
              </h4>
              <p
                className={cn(
                  "text-gray-600 leading-relaxed",
                  "text-xs sm:text-sm lg:text-base",
                )}
              >
                {area.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about-section"
      className="w-full bg-white py-8 sm:py-12 lg:py-16 xl:py-20 overflow-hidden" // Cor de fundo padrão
      ref={ref}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        <motion.div
          className={cn(
            "grid gap-6 sm:gap-8 lg:gap-12 items-center max-w-6xl mx-auto mb-12 sm:mb-16 lg:mb-20",
            "grid-cols-1 lg:grid-cols-2",
          )}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <EmblemSection />

          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-pac-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <RiFlagLine className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span className="text-pac-primary font-bold tracking-wider uppercase text-xs sm:text-sm lg:text-base">
                Nossa Identidade
              </span>
            </div>

            <h2
              className={cn(
                "font-bold text-gray-800 leading-snug",
                "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl",
              )}
            >
              Serviço, <span className="text-pac-primary">Honra</span> e{" "}
              <span className="text-pac-primary-dark">Compromisso</span>
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <p
                className={cn(
                  "text-gray-700 leading-relaxed",
                  "text-sm sm:text-base lg:text-lg",
                )}
              >
                A Patrulha Aérea Civil é uma organização de voluntários dedicada
                à proteção civil, operações de resgate e desenvolvimento
                comunitário. Atuamos com disciplina, organização e
                comprometimento.
              </p>
              <Accordion />
            </div>
          </motion.div>
        </motion.div>

        <MissionValuesGrid />

        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div
            className={cn(
              "grid gap-6 sm:gap-8 lg:gap-12 items-start",
              "grid-cols-1 lg:grid-cols-2",
            )}
          >
            <motion.div
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-pac-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <RiTimeLine className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <span className="text-pac-primary font-bold tracking-wider uppercase text-xs sm:text-sm lg:text-base">
                    Nossa História
                  </span>
                </div>

                <h2
                  className={cn(
                    "font-bold text-gray-800 mb-4 sm:mb-6 leading-snug",
                    "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl",
                  )}
                >
                  Tradição de <span className="text-pac-primary">Serviço</span>
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <p
                    className={cn(
                      "text-gray-700 leading-relaxed",
                      "text-sm sm:text-base lg:text-lg",
                    )}
                  >
                    Fundada por veteranos e entusiastas da aviação civil, a
                    Patrulha Aérea Civil nasceu do desejo de servir à comunidade
                    através de operações especializadas e voluntariado
                    organizado.
                  </p>
                  <p
                    className={cn(
                      "text-gray-700 leading-relaxed",
                      "text-sm sm:text-base lg:text-lg",
                    )}
                  >
                    Nossa trajetória é marcada por operações de resgate,
                    treinamentos de preparação para emergências e
                    desenvolvimento de capacidades técnicas entre nossos
                    voluntários.
                  </p>
                </div>
              </div>

              <StatsGrid />

              <motion.div
                className="pt-4 sm:pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button
                  asChild
                  className={cn(
                    "bg-pac-primary hover:bg-pac-primary-dark text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl",
                    "px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4",
                    "text-sm sm:text-base lg:text-lg touch-optimize active:scale-95",
                  )}
                >
                  <Link
                    href="/sobre"
                    className="flex items-center gap-2 sm:gap-3 justify-center"
                  >
                    Conheça Nossa Organização
                    <RiArrowRightLine className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <AreasAtuacao />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
