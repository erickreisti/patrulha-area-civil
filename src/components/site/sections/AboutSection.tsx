"use client";

import { Button } from "@/components/ui/button";
import {
  FaEye,
  FaArrowRight,
  FaUsers,
  FaHome,
  FaBook,
  FaHandshake,
  FaShieldAlt,
  FaFlag,
  FaCrosshairs,
  FaMapMarkerAlt,
  FaClock,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const STATS = [
  { number: "500+", label: "jovens impactados", icon: FaUsers },
  { number: "200+", label: "pessoas abrigadas", icon: FaHome },
  { number: "10+", label: "comunidades ativas", icon: FaBook },
  { number: "50+", label: "voluntários ativos", icon: FaHandshake },
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
    icon: FaCrosshairs,
    title: "Operações de Resgate",
    description:
      "Busca e salvamento aéreo e terrestre em situações de emergência",
  },
  {
    icon: FaUsers,
    title: "Treinamento de Voluntários",
    description: "Capacitação técnica e operacional para atuação em campo",
  },
  {
    icon: FaShieldAlt,
    title: "Proteção Civil",
    description: "Preparação para emergências e desastres naturais",
  },
  {
    icon: FaBook,
    title: "Instrução e Doutrina",
    description: "Desenvolvimento de procedimentos e protocolos operacionais",
  },
];

const MISSION_VALUES = [
  {
    icon: FaCrosshairs,
    title: "Missão",
    description:
      "Promover a segurança aérea e terrestre através de serviços voluntários, treinamentos especializados e operações de resgate, contribuindo para o bem-estar da sociedade.",
    badge: "Compromisso",
  },
  {
    icon: FaEye,
    title: "Visão",
    description:
      "Ser referência nacional em voluntariado especializado, reconhecida pela excelência em operações de proteção civil e formação de cidadãos comprometidos.",
    badge: "Excelência",
  },
  {
    icon: FaShieldAlt,
    title: "Valores",
    description:
      "Honra, disciplina, lealdade, coragem e comprometimento. Atuamos com integridade em todas as missões, valorizando cada vida e promovendo o bem comum.",
    badge: "Honra",
  },
];

const SectionHeader = () => {
  return (
    <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="w-16 h-1 bg-navy"></div>
        <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center shadow-lg">
          <FaShieldAlt className="h-6 w-6 text-white" />
        </div>
        <div className="w-16 h-1 bg-navy"></div>
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 tracking-normal uppercase">
        SOBRE A <span className="text-navy">PATRULHA</span>
      </h1>
      <p className="text-lg text-slate-700 max-w-4xl mx-auto leading-relaxed font-medium">
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
      viewport={{ once: true }}
    >
      <div className="text-center">
        <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 mx-auto mb-6 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src="/images/logos/logo.webp"
              alt="Patrulha Aérea Civil"
              width={320}
              height={320}
              className="object-contain drop-shadow-2xl w-full h-full"
            />
          </div>
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-navy uppercase tracking-wider">
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
      className="space-y-2 pt-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      viewport={{ once: true }}
    >
      {ACCORDION_ITEMS.map((item, index) => (
        <div
          key={index}
          className="border border-slate-200 rounded-lg bg-slate-50"
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-navy rounded-full"></div>
              <span className="font-semibold text-slate-800">{item.title}</span>
            </div>
            {openAccordion === index ? (
              <FaChevronUp className="h-4 w-4 text-navy" />
            ) : (
              <FaChevronDown className="h-4 w-4 text-navy" />
            )}
          </button>
          {openAccordion === index && (
            <div className="px-4 pb-3">
              <p className="text-slate-600 text-sm leading-relaxed">
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
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
    {MISSION_VALUES.map((item, index) => (
      <motion.div
        key={item.title}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center shadow-md">
            <item.icon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wide px-3 py-1 rounded-full bg-navy">
            {item.badge}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-3 uppercase tracking-wide">
          {item.title}
        </h3>
        <p className="text-slate-700 leading-relaxed text-sm">
          {item.description}
        </p>
      </motion.div>
    ))}
  </div>
);

const StatsGrid = () => (
  <motion.div
    className="grid grid-cols-2 gap-4 pt-6"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    viewport={{ once: true }}
  >
    {STATS.map((stat, index) => (
      <motion.div
        key={stat.label}
        className="text-center p-6 bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center shadow-md">
            <stat.icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-alert mb-2">
          {stat.number}
        </div>
        <div className="text-xs text-slate-600 uppercase font-bold tracking-wider">
          {stat.label}
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const AreasAtuacao = () => (
  <motion.div
    className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg"
    initial={{ opacity: 0, x: 30 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    viewport={{ once: true }}
  >
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
      <FaMapMarkerAlt className="h-6 w-6 text-navy" />
      <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
        Áreas de Atuação
      </h3>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {AREAS_ATUACAO.map((area, index) => (
        <motion.div
          key={index}
          className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-navy/50 transition-colors duration-300 group"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
            <area.icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 mb-2 text-lg">
              {area.title}
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
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
    <section id="about-section" className="w-full bg-offwhite py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <SectionHeader />

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <EmblemSection />

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
                <FaFlag className="h-5 w-5 text-white" />
              </div>
              <span className="text-navy font-bold tracking-wider uppercase text-sm">
                Nossa Identidade
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-snug">
              Serviço, <span className="text-navy">Honra</span> e{" "}
              <span className="text-navy-700">Compromisso</span>
            </h2>

            <div className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
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
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center">
                    <FaClock className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-navy font-bold tracking-wider uppercase text-sm">
                    Nossa História
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-snug">
                  Tradição de <span className="text-navy">Serviço</span>
                </h2>

                <div className="space-y-4">
                  <p className="text-slate-700 leading-relaxed">
                    Fundada por veteranos e entusiastas da aviação civil, a
                    Patrulha Aérea Civil nasceu do desejo de servir à comunidade
                    através de operações especializadas e voluntariado
                    organizado.
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    Nossa trajetória é marcada por operações de resgate,
                    treinamentos de preparação para emergências e
                    desenvolvimento de capacidades técnicas entre nossos
                    voluntários.
                  </p>
                </div>
              </div>

              <StatsGrid />

              <motion.div
                className="pt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <Button
                  asChild
                  className="bg-navy hover:bg-navy-700 text-white px-8 py-4 font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Link href="/sobre" className="flex items-center gap-3">
                    Conheça Nossa Organização
                    <FaArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
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
