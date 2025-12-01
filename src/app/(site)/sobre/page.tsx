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
  RiShieldCheckLine,
  RiAwardLine,
  RiHeartLine,
  RiTeamLine,
  RiMapPinLine,
  RiSparklingLine,
  RiFocusLine,
  RiEyeLine,
  RiPlaneLine,
  RiHistoryLine,
  RiFlagLine,
  RiUserStarLine,
  RiGlobalLine,
  RiMedalLine,
  RiArrowRightLine,
  RiMailLine,
  RiCalendarLine,
} from "react-icons/ri";
import Link from "next/link";

export default function SobrePage() {
  const valores = [
    {
      icon: RiShieldCheckLine,
      title: "Segurança",
      description:
        "Priorizamos a segurança em todas as operações e treinamentos",
      color: "from-navy-600 to-navy-700", // Atualizado para navy
    },
    {
      icon: RiAwardLine,
      title: "Excelência",
      description:
        "Buscamos a máxima qualidade em nossos serviços humanitários",
      color: "from-navy-600 to-navy-700", // Atualizado para navy
    },
    {
      icon: RiHeartLine,
      title: "Humanidade",
      description: "Agimos com compaixão e respeito em todas as situações",
      color: "from-navy-600 to-navy-700", // Atualizado para navy
    },
    {
      icon: RiTeamLine,
      title: "Trabalho em Equipe",
      description: "Valorizamos a colaboração e o espírito de união",
      color: "from-navy-600 to-navy-700", // Atualizado para navy
    },
    {
      icon: RiMapPinLine,
      title: "Compromisso Comunitário",
      description: "Servimos as comunidades com dedicação e responsabilidade",
      color: "from-navy-600 to-navy-700", // Atualizado para navy
    },
    {
      icon: RiSparklingLine,
      title: "Profissionalismo",
      description: "Atuamos com ética, competência e seriedade",
      color: "from-navy-600 to-navy-700", // Atualizado para navy
    },
  ];

  const estatisticas = [
    {
      numero: "50+",
      label: "Agentes Treinados",
      icon: RiUserStarLine,
      delay: 0,
    },
    {
      numero: "100+",
      label: "Operações Realizadas",
      icon: RiMedalLine,
      delay: 1,
    },
    { numero: "24/7", label: "Prontidão", icon: RiGlobalLine, delay: 2 },
    { numero: "5", label: "Anos de Serviço", icon: RiCalendarLine, delay: 3 },
  ];

  const timeline = [
    {
      year: "2019",
      title: "Fundação da PAC",
      description:
        "Criação da Patrulha Aérea Civil com foco em serviço humanitário",
      icon: RiFlagLine,
    },
    {
      year: "2020",
      title: "Primeiras Operações",
      description:
        "Início das operações de resgate e treinamentos especializados",
      icon: RiPlaneLine,
    },
    {
      year: "2022",
      title: "Expansão Nacional",
      description: "Ampliação das operações para todo o território nacional",
      icon: RiMapPinLine,
    },
    {
      year: "2024",
      title: "Excelência Consolidada",
      description:
        "Reconhecimento como referência em serviços aéreos humanitários",
      icon: RiAwardLine,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 text-white pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-navy-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-navy-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

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
                <RiSparklingLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Excelência em Serviço Humanitário
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 font-bebas tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-300 via-white to-blue-200 bg-clip-text text-transparent">
                SOBRE A PAC
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light px-2"
            >
              Organização civil dedicada ao serviço aéreo humanitário, resgate e
              proteção civil. Conheça nossa{" "}
              <span className="font-semibold text-white">missão, valores</span>{" "}
              e o <span className="font-semibold text-white">compromisso</span>{" "}
              que nos move.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 font-bebas tracking-wide">
              NOSSA ESSÊNCIA
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Os pilares que sustentam cada ação e decisão da Patrulha Aérea
              Civil
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-navy-600 to-blue-600 mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16"
          >
            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 group bg-white overflow-hidden h-full">
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="bg-gradient-to-br from-navy-600 to-navy-700 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <RiFocusLine className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <CardTitle className="text-gray-800 text-xl sm:text-2xl font-bebas tracking-wide">
                    MISSÃO
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6 pb-6">
                  <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Promover a segurança aérea e terrestre através de serviços
                    voluntários, treinamentos especializados e operações de
                    resgate humanitário com excelência e compromisso.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 group bg-white overflow-hidden h-full">
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="bg-gradient-to-br from-navy-600 to-navy-700 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <RiEyeLine className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <CardTitle className="text-gray-800 text-xl sm:text-2xl font-bebas tracking-wide">
                    VISÃO
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6 pb-6">
                  <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Ser referência nacional em serviços aéreos humanitários,
                    reconhecida pela excelência operacional, impacto social
                    positivo e inovação em proteção civil.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 group bg-white overflow-hidden h-full">
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="bg-gradient-to-br from-navy-600 to-navy-700 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <RiSparklingLine className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <CardTitle className="text-gray-800 text-xl sm:text-2xl font-bebas tracking-wide">
                    VALORES
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6 pb-6">
                  <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Segurança, Excelência, Humanidade, Trabalho em Equipe,
                    Compromisso Comunitário e Profissionalismo em todas as
                    nossas ações.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Estatísticas */}
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

      {/* Resto do código permanece igual... */}
      {/* História e Timeline */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 font-bebas tracking-wide">
              NOSSA HISTÓRIA
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Uma trajetória marcada por dedicação, crescimento e impacto social
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-navy-600 to-blue-600 mx-auto mt-4 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardContent className="p-6 sm:p-8">
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                    A{" "}
                    <strong className="text-navy-600 font-semibold">
                      Patrulha Aérea Civil
                    </strong>{" "}
                    foi fundada com o propósito de unir a paixão pela aviação
                    civil ao serviço humanitário, criando uma organização
                    dedicada à proteção e ao bem-estar das comunidades.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                    Nossa trajetória é marcada por operações bem-sucedidas,
                    treinamentos especializados e um compromisso inabalável com
                    a segurança e excelência em todos os serviços prestados.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    Acreditamos que a aviação civil pode ser uma poderosa
                    ferramenta de transformação social, levando esperança e
                    auxílio a todos os cantos do território nacional.
                  </p>
                </CardContent>
              </Card>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white font-semibold py-3 px-6 transition-all duration-300 hover:shadow-xl shadow-lg text-sm sm:text-base"
                  asChild
                >
                  <Link href="/servicos">
                    Conhecer Nossos Serviços
                    <RiArrowRightLine className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-navy-700 to-blue-800 text-white overflow-hidden">
                <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col items-center justify-center">
                  <RiPlaneLine className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-white/25 mx-auto" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 font-bebas tracking-wide">
                    SERVIÇO HUMANITÁRIO
                  </h3>
                  <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                    Comprometidos com a excelência em operações aéreas e
                    terrestres, levando auxílio onde é mais necessário
                  </p>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800 text-lg sm:text-xl">
                    <RiHistoryLine className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-navy-600" />
                    Linha do Tempo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {timeline.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-3"
                    >
                      <div className="bg-navy-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                        <item.icon className="w-4 h-4 text-navy-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-bold text-navy-600 text-sm">
                            {item.year}
                          </span>
                          <span className="font-semibold text-gray-800 text-sm">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores Detalhados */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 font-bebas tracking-wide">
              NOSSOS VALORES
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Princípios que guiam cada decisão e ação da Patrulha Aérea Civil
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-navy-600 to-blue-600 mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {valores.map((valor, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="h-full"
              >
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 group cursor-pointer h-full bg-white overflow-hidden">
                  <CardHeader className="text-center pb-3 pt-6">
                    <div
                      className={`bg-gradient-to-br ${valor.color} rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-500 shadow-lg`}
                    >
                      <valor.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <CardTitle className="text-gray-800 text-lg sm:text-xl font-bebas tracking-wide">
                      {valor.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center px-4 sm:px-6 pb-6">
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {valor.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-bebas tracking-wide">
              JUNTE-SE À NOSSA MISSÃO
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              Seja parte desta equipe dedicada ao serviço humanitário e à
              proteção civil. Juntos, podemos fazer a diferença.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 transition-all duration-300 hover:shadow-xl shadow-lg text-sm sm:text-base"
                  asChild
                >
                  <Link href="/contato">
                    <RiMailLine className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Entre em Contato
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 border-2 border-white/30 hover:border-white/50 text-white font-semibold py-3 px-6 transition-all duration-300 hover:shadow-xl shadow-lg text-sm sm:text-base backdrop-blur-sm"
                  asChild
                >
                  <Link href="/atividades">
                    <RiTeamLine className="mr-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110" />
                    Explorar Atividades
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
