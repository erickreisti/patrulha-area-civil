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
  RiCalendarCheckLine,
} from "react-icons/ri";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef } from "react";

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

const SectionHeader = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      className="text-center mb-8 sm:mb-12 lg:mb-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-8 sm:w-12 lg:w-16 h-0.5 sm:h-1 bg-navy"></div>
        <motion.div
          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-navy rounded-full flex items-center justify-center shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <RiFileListLine className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </motion.div>
        <div className="w-8 sm:w-12 lg:w-16 h-0.5 sm:h-1 bg-navy"></div>
      </div>

      <motion.h1
        className={cn(
          "font-bold text-slate-800 mb-4 sm:mb-6 tracking-normal uppercase mx-auto px-2",
          "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
          "max-w-[90vw]"
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
      >
        NOSSAS <span className="text-navy">ATIVIDADES</span>
      </motion.h1>

      <motion.p
        className={cn(
          "text-slate-700 mx-auto leading-relaxed font-medium px-2 sm:px-4",
          "text-sm xs:text-base sm:text-lg lg:text-xl",
          "max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-4xl"
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        Registro operacional das principais atividades executadas pela Patrulha
        Aérea Civil
      </motion.p>
    </motion.div>
  );
};

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
      className="text-center p-4 sm:p-6 lg:p-8 bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-center mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-navy rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
      </div>

      <div
        className={cn(
          "font-bold text-alert mb-1 sm:mb-2 font-bebas tracking-tight",
          "text-xl sm:text-2xl lg:text-3xl"
        )}
      >
        {activity.count}
      </div>

      <h3
        className={cn(
          "font-bold text-slate-800 mb-2 sm:mb-3 font-roboto uppercase tracking-wide",
          "text-base sm:text-lg lg:text-xl"
        )}
      >
        {activity.title}
      </h3>

      <p
        className={cn(
          "text-slate-700 font-roboto leading-relaxed",
          "text-xs sm:text-sm lg:text-base"
        )}
      >
        {activity.description}
      </p>
    </motion.div>
  );
};

const ActivitiesGrid = () => {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12",
        "grid-cols-1 md:grid-cols-3"
      )}
    >
      {ACTIVITIES.map((activity, index) => (
        <ActivityCard key={activity.title} activity={activity} index={index} />
      ))}
    </div>
  );
};

const StatsSection = () => {
  return (
    <motion.div
      className="max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-navy rounded-lg flex items-center justify-center">
            <RiShieldCheckLine className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <h3
            className={cn(
              "font-bold text-slate-800 font-bebas uppercase tracking-wide",
              "text-lg sm:text-xl lg:text-2xl"
            )}
          >
            INDICADORES OPERACIONAIS
          </h3>
        </div>

        <div
          className={cn("grid gap-3 sm:gap-4", "grid-cols-2 md:grid-cols-4")}
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-navy/50 transition-colors duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-center mb-1 sm:mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-navy rounded-lg flex items-center justify-center">
                  <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
              </div>

              <div
                className={cn(
                  "font-bold text-alert mb-1 font-bebas",
                  "text-lg sm:text-xl lg:text-2xl"
                )}
              >
                {stat.number}
              </div>

              <div
                className={cn(
                  "text-slate-800 font-roboto uppercase tracking-wide font-semibold",
                  "text-xs sm:text-sm"
                )}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button
            asChild
            className={cn(
              "bg-navy hover:bg-navy-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl",
              "px-4 sm:px-6 lg:px-8 py-2 sm:py-3",
              "text-xs sm:text-sm lg:text-base touch-optimize active:scale-95"
            )}
          >
            <Link
              href="/atividades"
              className="flex items-center justify-center gap-1 sm:gap-2"
            >
              <RiCalendarCheckLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Ver Todas as Operações
              <RiArrowRightLine className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export function ActivitiesShowcase() {
  return (
    <section className="w-full bg-offwhite py-8 sm:py-12 lg:py-16 xl:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        <ActivitiesGrid />
        <StatsSection />
      </div>
    </section>
  );
}
