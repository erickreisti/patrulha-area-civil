"use client";

import { Button } from "@/components/ui/button";
import {
  RiCrosshairLine,
  RiUserLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiErrorWarningLine,
  RiArrowRightLine,
  RiFileListLine,
} from "react-icons/ri";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ACTIVITIES = [
  {
    title: "OPERAÇÕES",
    count: "50+",
    description: "Operações realizadas com sucesso em território nacional",
    icon: RiCrosshairLine,
  },
  {
    title: "TREINAMENTOS",
    count: "100+",
    description: "Horas de treinamento operacional especializado",
    icon: RiCrosshairLine,
  },
  {
    title: "COMUNIDADES",
    count: "25+",
    description: "Comunidades atendidas em situações críticas",
    icon: RiUserLine,
  },
];

const STATS = [
  {
    number: "24/7",
    label: "PRONTIDÃO",
    icon: RiTimeLine,
  },
  {
    number: "100%",
    label: "EFICIÊNCIA",
    icon: RiCrosshairLine,
  },
  {
    number: "0",
    label: "INCIDENTES",
    icon: RiErrorWarningLine,
  },
  {
    number: "50+",
    label: "EFETIVO",
    icon: RiUserLine,
  },
];

const SectionHeader = () => (
  <motion.div
    className="text-center mb-12 xs:mb-14 sm:mb-16"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true, margin: "-50px" }}
  >
    <div className="flex items-center justify-center gap-3 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
      <div className="w-12 xs:w-14 sm:w-16 h-0.5 xs:h-1 bg-navy"></div>
      <motion.div
        className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-navy rounded-full flex items-center justify-center shadow-lg"
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <RiFileListLine className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
      </motion.div>
      <div className="w-12 xs:w-14 sm:w-16 h-0.5 xs:h-1 bg-navy"></div>
    </div>

    <motion.h1
      className={cn(
        "font-bold text-slate-800 mb-4 xs:mb-5 sm:mb-6 tracking-normal uppercase",
        "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      NOSSAS <span className="text-navy">ATIVIDADES</span>
    </motion.h1>

    <motion.p
      className={cn(
        "text-slate-700 max-w-4xl mx-auto leading-relaxed font-medium px-4",
        "text-sm xs:text-base sm:text-lg",
        "max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl"
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      Registro operacional das principais atividades executadas pela Patrulha
      Aérea Civil
    </motion.p>
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
      className="text-center p-4 xs:p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="flex justify-center mb-3 xs:mb-4">
        <div className="w-12 h-12 xs:w-13 xs:h-13 sm:w-14 sm:h-14 bg-navy rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
          <IconComponent className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>

      <div
        className={cn(
          "font-bold text-alert mb-1 xs:mb-2 font-bebas tracking-tight",
          "text-xl xs:text-2xl sm:text-2xl"
        )}
      >
        {activity.count}
      </div>

      <h3
        className={cn(
          "font-bold text-slate-800 mb-2 xs:mb-3 font-roboto uppercase tracking-wide",
          "text-base xs:text-lg sm:text-lg"
        )}
      >
        {activity.title}
      </h3>

      <p
        className={cn(
          "text-slate-700 font-roboto leading-relaxed",
          "text-xs xs:text-sm"
        )}
      >
        {activity.description}
      </p>
    </motion.div>
  );
};

const ActivitiesGrid = () => (
  <div
    className={cn(
      "grid gap-3 xs:gap-4 max-w-5xl mx-auto mb-10 xs:mb-12",
      "grid-cols-1 md:grid-cols-3"
    )}
  >
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
    viewport={{ once: true, margin: "-50px" }}
  >
    <div className="bg-white border border-slate-200 rounded-xl p-4 xs:p-5 sm:p-6 shadow-lg">
      <div className="flex items-center justify-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
        <div className="w-7 h-7 xs:w-8 xs:h-8 bg-navy rounded-lg flex items-center justify-center">
          <RiShieldCheckLine className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
        </div>
        <h3
          className={cn(
            "font-bold text-slate-800 font-bebas uppercase tracking-wide",
            "text-lg xs:text-xl"
          )}
        >
          INDICADORES OPERACIONAIS
        </h3>
      </div>

      <div className={cn("grid gap-3 xs:gap-4", "grid-cols-2 md:grid-cols-4")}>
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="text-center p-2 xs:p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-navy/50 transition-colors duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="flex justify-center mb-1 xs:mb-2">
              <div className="w-7 h-7 xs:w-8 xs:h-8 bg-navy rounded-lg flex items-center justify-center">
                <stat.icon className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
              </div>
            </div>

            <div
              className={cn(
                "font-bold text-alert mb-1 font-bebas",
                "text-lg xs:text-xl"
              )}
            >
              {stat.number}
            </div>

            <div
              className={cn(
                "text-slate-800 font-roboto uppercase tracking-wide font-semibold",
                "text-xs xs:text-xs"
              )}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-4 xs:mt-5 sm:mt-6 pt-3 xs:pt-4 border-t border-slate-200"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <Button
          asChild
          className={cn(
            "bg-navy hover:bg-navy-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl",
            "px-4 xs:px-6 py-2 xs:py-3",
            "text-xs xs:text-sm"
          )}
        >
          <Link
            href="/atividades"
            className="flex items-center justify-center gap-1 xs:gap-2"
          >
            Ver Todas as Operações
            <RiArrowRightLine className="w-3 h-3 xs:w-4 xs:h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </motion.div>
    </div>
  </motion.div>
);

export function ActivitiesShowcase() {
  return (
    <section className="w-full bg-offwhite py-12 xs:py-14 sm:py-16 lg:py-20">
      <div className="container mx-auto px-3 xs:px-4 sm:px-5 lg:px-6">
        <SectionHeader />
        <ActivitiesGrid />
        <StatsSection />
      </div>
    </section>
  );
}
