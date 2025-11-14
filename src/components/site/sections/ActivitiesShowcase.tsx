"use client";

import { Button } from "@/components/ui/button";
import {
  FaCrosshairs,
  FaUsers,
  FaShieldAlt,
  FaClock,
  FaExclamationTriangle,
  FaArrowRight,
} from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

const ACTIVITIES = [
  {
    title: "OPERAÇÕES",
    count: "50+",
    description: "Operações realizadas com sucesso em território nacional",
    icon: FaCrosshairs,
  },
  {
    title: "TREINAMENTOS",
    count: "100+",
    description: "Horas de treinamento operacional especializado",
    icon: FaCrosshairs,
  },
  {
    title: "COMUNIDADES",
    count: "25+",
    description: "Comunidades atendidas em situações críticas",
    icon: FaUsers,
  },
];

const STATS = [
  {
    number: "24/7",
    label: "PRONTIDÃO",
    icon: FaClock,
  },
  {
    number: "100%",
    label: "EFICIÊNCIA",
    icon: FaCrosshairs,
  },
  {
    number: "0",
    label: "INCIDENTES",
    icon: FaExclamationTriangle,
  },
  {
    number: "50+",
    label: "EFETIVO",
    icon: FaUsers,
  },
];

const SectionHeader = () => (
  <motion.div
    className="text-center mb-12"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
  >
    <div className="flex items-center justify-center gap-4 mb-4">
      <div className="w-12 h-1 bg-navy-light"></div>
      <div className="w-10 h-10 bg-navy-light rounded-full flex items-center justify-center shadow-lg">
        <FaCrosshairs className="h-5 w-5 text-white" />
      </div>
      <div className="w-12 h-1 bg-navy-light"></div>
    </div>

    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 tracking-normal uppercase">
      NOSSAS <span className="text-navy-dark">ATIVIDADES</span>
    </h1>

    <p className="text-base text-gray-800 max-w-4xl mx-auto leading-relaxed font-medium">
      Registro operacional das principais atividades executadas pela Patrulha
      Aérea Civil
    </p>
  </motion.div>
);

const ActivityCard = ({
  activity,
  index,
}: {
  activity: (typeof ACTIVITIES)[0];
  index: number;
}) => {
  const IconComponent = activity.icon;

  return (
    <motion.div
      className="text-center p-6 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 bg-navy rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
          <IconComponent className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="text-2xl font-bold text-alert mb-2 font-bebas tracking-tight">
        {activity.count}
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-3 font-roboto uppercase tracking-wide">
        {activity.title}
      </h3>

      <p className="text-gray-800 font-roboto text-xs leading-relaxed">
        {activity.description}
      </p>
    </motion.div>
  );
};

const ActivitiesGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
    {ACTIVITIES.map((activity, index) => (
      <ActivityCard key={activity.title} activity={activity} index={index} />
    ))}
  </div>
);

const StatsSection = () => (
  <motion.div
    className="max-w-6xl mx-auto"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    viewport={{ once: true }}
  >
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
          <FaShieldAlt className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 font-bebas uppercase tracking-wide">
          INDICADORES OPERACIONAIS
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-navy/50 transition-colors duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="text-xl font-bold text-alert mb-1 font-bebas">
              {stat.number}
            </div>

            <div className="text-xs text-gray-800 font-roboto uppercase tracking-wide font-semibold">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-6 pt-4 border-t border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <Button
          asChild
          className="bg-navy hover:bg-navy-dark text-white px-6 py-3 font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm"
        >
          <Link
            href="/atividades"
            className="flex items-center justify-center gap-2"
          >
            Ver Todas as Operações
            <FaArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </motion.div>
    </div>
  </motion.div>
);

export function ActivitiesShowcase() {
  return (
    <section className="w-full bg-offwhite py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <SectionHeader />
        <ActivitiesGrid />
        <StatsSection />
      </div>
    </section>
  );
}
