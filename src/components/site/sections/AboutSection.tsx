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
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  return (
    <motion.div
      className="text-center mb-12 xs:mb-14 sm:mb-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="flex items-center justify-center gap-3 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
        <div className="w-12 xs:w-14 sm:w-16 h-0.5 xs:h-1 bg-navy"></div>
        <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-navy rounded-full flex items-center justify-center shadow-lg">
          <RiShieldCheckLine className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="w-12 xs:w-14 sm:w-16 h-0.5 xs:h-1 bg-navy"></div>
      </div>
      <h1
        className={cn(
          "font-bold text-slate-800 mb-4 xs:mb-5 sm:mb-6 tracking-normal uppercase",
          "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
        )}
      >
        SOBRE A <span className="text-navy">PATRULHA</span>
      </h1>
      <p
        className={cn(
          "text-slate-700 max-w-4xl mx-auto leading-relaxed font-medium px-4",
          "text-sm xs:text-base sm:text-lg",
          "max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl"
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
            "mx-auto mb-4 xs:mb-5 sm:mb-6 flex items-center justify-center",
            "w-32 h-32 xs:w-36 xs:h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
          )}
        >
          <div className="relative w-full h-full">
            <Image
              src="/images/logos/logo.webp"
              alt="Patrulha Aérea Civil"
              width={256}
              height={256}
              className="object-contain drop-shadow-2xl w-full h-full"
              priority
            />
          </div>
        </div>
        <div
          className={cn(
            "font-bold text-navy uppercase tracking-wider",
            "text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl"
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
      className="space-y-2 xs:space-y-3 pt-4 xs:pt-5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {ACCORDION_ITEMS.map((item, index) => (
        <div
          key={index}
          className="border border-slate-200 rounded-lg xs:rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-colors duration-200"
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full px-3 xs:px-4 py-2 xs:py-3 flex items-center justify-between text-left transition-colors duration-200"
          >
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-navy rounded-full flex-shrink-0"></div>
              <span
                className={cn(
                  "font-semibold text-slate-800",
                  "text-sm xs:text-base"
                )}
              >
                {item.title}
              </span>
            </div>
            {openAccordion === index ? (
              <RiArrowUpSLine className="w-3 h-3 xs:w-4 xs:h-4 text-navy flex-shrink-0" />
            ) : (
              <RiArrowDownSLine className="w-3 h-3 xs:w-4 xs:h-4 text-navy flex-shrink-0" />
            )}
          </button>
          {openAccordion === index && (
            <div className="px-3 xs:px-4 pb-3 xs:pb-4">
              <p
                className={cn(
                  "text-slate-600 leading-relaxed",
                  "text-xs xs:text-sm"
                )}
              >
                {item.content}
              </p>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
};

const MissionValuesGrid = () => (
  <div
    className={cn(
      "grid gap-4 xs:gap-5 sm:gap-6 max-w-6xl mx-auto mb-16 xs:mb-18 sm:mb-20",
      "grid-cols-1 md:grid-cols-3"
    )}
  >
    {MISSION_VALUES.map((item, index) => (
      <motion.div
        key={item.title}
        className="bg-white border border-slate-200 rounded-xl p-4 xs:p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="flex items-center justify-between mb-3 xs:mb-4">
          <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-navy rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <item.icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wide px-2 xs:px-3 py-1 rounded-full bg-navy">
            {item.badge}
          </span>
        </div>

        <h3
          className={cn(
            "font-bold text-slate-800 mb-2 xs:mb-3 uppercase tracking-wide",
            "text-lg xs:text-xl"
          )}
        >
          {item.title}
        </h3>
        <p
          className={cn("text-slate-700 leading-relaxed", "text-xs xs:text-sm")}
        >
          {item.description}
        </p>
      </motion.div>
    ))}
  </div>
);

const StatsGrid = () => (
  <motion.div
    className={cn("grid gap-3 xs:gap-4 pt-6", "grid-cols-2")}
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    viewport={{ once: true, margin: "-50px" }}
  >
    {STATS.map((stat, index) => (
      <motion.div
        key={stat.label}
        className="text-center p-4 xs:p-5 bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="flex justify-center mb-3 xs:mb-4">
          <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-navy rounded-xl flex items-center justify-center shadow-md">
            <stat.icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
        <div
          className={cn(
            "font-bold text-alert mb-1 xs:mb-2",
            "text-xl xs:text-2xl sm:text-3xl"
          )}
        >
          {stat.number}
        </div>
        <div
          className={cn(
            "text-slate-600 uppercase font-bold tracking-wider",
            "text-xs xs:text-xs"
          )}
        >
          {stat.label}
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const AreasAtuacao = () => (
  <motion.div
    className="bg-white border border-slate-200 rounded-xl p-4 xs:p-5 sm:p-6 shadow-lg"
    initial={{ opacity: 0, x: 30 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    viewport={{ once: true, margin: "-50px" }}
  >
    <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6 pb-3 xs:pb-4 border-b border-slate-200">
      <RiMapPinLine className="w-5 h-5 xs:w-6 xs:h-6 text-navy" />
      <h3
        className={cn(
          "font-bold text-slate-800 uppercase tracking-wide",
          "text-lg xs:text-xl"
        )}
      >
        Áreas de Atuação
      </h3>
    </div>

    <div className="grid grid-cols-1 gap-3 xs:gap-4">
      {AREAS_ATUACAO.map((area, index) => (
        <motion.div
          key={index}
          className="flex items-start gap-3 xs:gap-4 p-3 xs:p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-navy/50 transition-colors duration-300 group"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-navy rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
            <area.icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "font-bold text-slate-800 mb-1 xs:mb-2",
                "text-base xs:text-lg"
              )}
            >
              {area.title}
            </h4>
            <p
              className={cn(
                "text-slate-600 leading-relaxed",
                "text-xs xs:text-sm"
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

export function AboutSection() {
  return (
    <section
      id="about-section"
      className="w-full bg-offwhite py-12 xs:py-14 sm:py-16 lg:py-20"
    >
      <div className="container mx-auto px-3 xs:px-4 sm:px-5 lg:px-6">
        <SectionHeader />

        <motion.div
          className={cn(
            "grid gap-8 xs:gap-10 sm:gap-12 items-center max-w-6xl mx-auto mb-16 xs:mb-18 sm:mb-20",
            "grid-cols-1 lg:grid-cols-2"
          )}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <EmblemSection />

          <motion.div
            className="space-y-4 xs:space-y-5 sm:space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
              <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-navy rounded-lg flex items-center justify-center">
                <RiFlagLine className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-navy font-bold tracking-wider uppercase text-xs xs:text-sm">
                Nossa Identidade
              </span>
            </div>

            <h2
              className={cn(
                "font-bold text-slate-800 leading-snug",
                "text-2xl xs:text-3xl sm:text-4xl"
              )}
            >
              Serviço, <span className="text-navy">Honra</span> e{" "}
              <span className="text-navy-700">Compromisso</span>
            </h2>

            <div className="space-y-3 xs:space-y-4">
              <p
                className={cn(
                  "text-slate-700 leading-relaxed",
                  "text-sm xs:text-base"
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
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <div
            className={cn(
              "grid gap-8 xs:gap-10 sm:gap-12 items-start",
              "grid-cols-1 lg:grid-cols-2"
            )}
          >
            <motion.div
              className="space-y-6 xs:space-y-7 sm:space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div>
                <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
                  <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-navy rounded-lg flex items-center justify-center">
                    <RiTimeLine className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-navy font-bold tracking-wider uppercase text-xs xs:text-sm">
                    Nossa História
                  </span>
                </div>

                <h2
                  className={cn(
                    "font-bold text-slate-800 mb-4 xs:mb-5 sm:mb-6 leading-snug",
                    "text-2xl xs:text-3xl sm:text-4xl"
                  )}
                >
                  Tradição de <span className="text-navy">Serviço</span>
                </h2>

                <div className="space-y-3 xs:space-y-4">
                  <p
                    className={cn(
                      "text-slate-700 leading-relaxed",
                      "text-sm xs:text-base"
                    )}
                  >
                    Fundada por veteranos e entusiastas da aviação civil, a
                    Patrulha Aérea Civil nasceu do desejo de servir à comunidade
                    através de operações especializadas e voluntariado
                    organizado.
                  </p>
                  <p
                    className={cn(
                      "text-slate-700 leading-relaxed",
                      "text-sm xs:text-base"
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
                className="pt-4 xs:pt-5 sm:pt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <Button
                  asChild
                  className={cn(
                    "bg-navy hover:bg-navy-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl",
                    "px-6 xs:px-8 py-3 xs:py-4",
                    "text-sm xs:text-base"
                  )}
                >
                  <Link
                    href="/sobre"
                    className="flex items-center gap-2 xs:gap-3"
                  >
                    Conheça Nossa Organização
                    <RiArrowRightLine className="w-4 h-4 xs:w-5 xs:h-5 transition-transform duration-300 group-hover:translate-x-1" />
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
