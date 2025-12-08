"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiPlaneLine,
  RiArrowLeftLine,
  RiSparklingLine,
  RiShieldCheckLine,
  RiHealthBookLine,
  RiGlobalLine,
  RiPhoneLine,
  RiFlightTakeoffLine,
} from "react-icons/ri";
import Link from "next/link";

const capacidades = [
  "Busca, Resgate e Salvamento",
  "Orientação e Busca Aérea",
  "Embarque e Desembarque em Movimento",
  "Fast Rope (Rapel Rápido)",
  "Combate a Incêndio Aéreo",
  "Operações Helitransportadas",
  "Sobrevivência no Mar",
  "Sobrevivência na Selva",
  "Socorro Pré-Hospitalar Militar",
];

const especialidades = [
  {
    icon: RiFlightTakeoffLine,
    title: "Asa Rotativa",
    description: "Helicópteros",
  },
  {
    icon: RiPlaneLine,
    title: "Asa Fixa",
    description: "Aviões",
  },
  {
    icon: RiHealthBookLine,
    title: "Socorro Médico",
    description: "Pré-hospitalar militar",
  },
];

const estatisticas = [
  {
    numero: "2",
    label: "Tipos de Aeronave",
    icon: RiPlaneLine,
    delay: 0,
  },
  {
    numero: "9",
    label: "Capacidades Operacionais",
    icon: RiShieldCheckLine,
    delay: 1,
  },
  {
    numero: "24/7",
    label: "Prontidão Aérea",
    icon: RiGlobalLine,
    delay: 2,
  },
  {
    numero: "Rápido",
    label: "Tempo de Resposta",
    icon: RiSparklingLine,
    delay: 3,
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
    transition: {
      duration: 0.6,
    },
  },
};

export default function OperacoesAereasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 text-white pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge className="mb-4 sm:mb-6 bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
                <RiPlaneLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Grupamento Aéreo
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 font-bebas tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-300 via-white to-blue-200 bg-clip-text text-transparent">
                OPERAÇÕES AÉREAS
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light px-2"
            >
              Operações de resgate envolvendo aeronaves de asa rotativa e fixa.{" "}
              <span className="font-semibold text-white">Velocidade</span>,{" "}
              <span className="font-semibold text-white">precisão</span> e{" "}
              <span className="font-semibold text-white">eficácia</span> em cada
              missão aérea.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              asChild
              className="text-navy-600 hover:text-navy-700 hover:bg-navy-50"
            >
              <Link href="/servicos" className="flex items-center">
                <RiArrowLeftLine className="mr-2 h-4 w-4" />
                Voltar para Serviços
              </Link>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
          >
            <AnimatePresence>
              {estatisticas.map((estatistica, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: estatistica.delay * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-white rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-200"
                >
                  <div className="bg-gradient-to-br from-navy-600 to-blue-600 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <estatistica.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-alert-600 mb-1 font-bebas tracking-wide">
                    {estatistica.numero}
                  </div>
                  <div className="text-gray-600 font-medium text-xs sm:text-sm">
                    {estatistica.label}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500">
                  <CardHeader className="pb-3 pt-6">
                    <CardTitle className="text-gray-800 text-xl sm:text-2xl font-bebas tracking-wide">
                      MISSÃO DO GRUPAMENTO AÉREO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      O Grupamento Aéreo tem como missão atuar em operações de
                      resgate envolvendo aeronaves a partir de asa rotativa e
                      fixa em operações de busca, resgate e salvamento.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      Nossas equipes são especializadas em diversas técnicas
                      aéreas avançadas, garantindo respostas rápidas e eficazes
                      em situações de emergência.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500">
                  <CardHeader className="pb-3 pt-6">
                    <CardTitle className="text-gray-800 text-xl sm:text-2xl font-bebas tracking-wide">
                      CAPACIDADES OPERACIONAIS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      variants={containerVariants}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {capacidades.map((capacidade, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-300"
                        >
                          <div className="bg-gradient-to-br from-navy-600 to-blue-600 rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <RiShieldCheckLine className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-gray-700 text-sm font-medium">
                            {capacidade}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 sm:space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500">
                  <CardHeader className="pb-3 pt-6">
                    <CardTitle className="text-gray-800 text-lg sm:text-xl font-bebas tracking-wide">
                      ESPECIALIDADES
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {especialidades.map((especialidade, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200"
                      >
                        <div className="bg-gradient-to-br from-navy-600 to-blue-600 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <especialidade.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {especialidade.title}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {especialidade.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="border border-alert-200 bg-gradient-to-br from-alert-50 to-red-50 shadow-lg hover:shadow-xl transition-all duration-500">
                  <CardHeader className="pb-3 pt-6">
                    <CardTitle className="text-alert-600 text-lg sm:text-xl font-bebas tracking-wide">
                      EMERGÊNCIA AÉREA?
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      Para situações que requerem resposta aérea
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-alert-600 to-red-600 hover:from-alert-700 hover:to-red-700 text-white font-semibold transition-all duration-300 hover:shadow-lg shadow-md py-3"
                    >
                      <Link
                        href="/contato"
                        className="flex items-center justify-center"
                      >
                        <RiPhoneLine className="mr-2 h-4 w-4" />
                        Acionar Resgate Aéreo
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white border border-white/10 shadow-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="bg-gradient-to-br from-navy-600 to-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <RiPlaneLine className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-bebas tracking-wide">
                DOMÍNIO DOS CÉUS PARA O RESGATE
              </h2>
              <p className="text-lg mb-6 text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Nossa frota aérea e equipes especializadas garantem respostas
                rápidas e precisas. Quando cada segundo conta, estamos prontos
                para decolar e salvar vidas.
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 transition-all duration-300 hover:shadow-xl shadow-lg text-sm sm:text-base"
                  asChild
                >
                  <Link
                    href="/contato"
                    className="flex items-center justify-center"
                  >
                    <RiPhoneLine className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Solicitar Serviço Aéreo
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-600 hover:to-navy-700 border-1 border-white/30 hover:border-white/50 text-white font-semibold py-3 px-6 transition-all duration-300 hover:shadow-xl shadow-lg text-sm sm:text-base backdrop-blur-sm"
                  asChild
                >
                  <Link
                    href="/servicos"
                    className="flex items-center justify-center"
                  >
                    <RiSparklingLine className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Ver Todos Serviços
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
