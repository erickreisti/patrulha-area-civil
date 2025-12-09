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
  RiCalendarLine,
  RiFileTextLine,
  RiRunLine,
  RiArrowRightLine,
  RiSparklingLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiUserHeartLine,
  RiTimerLine,
  RiFlagLine,
  RiCheckboxCircleLine,
  RiMailLine,
  RiFireLine,
} from "react-icons/ri";
import Link from "next/link";

const ATIVIDADES = [
  {
    icon: RiRunLine,
    title: "Operações em Tempo Real",
    description:
      "Acompanhe nossas operações ativas e o histórico completo de ações realizadas em prol da segurança e proteção ambiental",
    features: [
      "Monitoramento 24/7",
      "Histórico de missões",
      "Status operacional",
    ],
    href: "/atividades/operacoes",
    color: "from-navy-600 to-blue-600",
  },
  {
    icon: RiFileTextLine,
    title: "Relatórios e Estatísticas",
    description:
      "Acesso transparente aos nossos relatórios operacionais, estatísticas detalhadas e métricas de desempenho",
    features: [
      "Relatórios mensais",
      "Dados estatísticos",
      "Indicadores de desempenho",
    ],
    href: "/atividades/relatorios",
    color: "from-navy-700 to-blue-700",
  },
  {
    icon: RiCalendarLine,
    title: "Calendário de Atividades",
    description:
      "Acompanhe nossa agenda completa de operações, treinamentos, eventos comunitários e atividades programadas",
    features: [
      "Eventos futuros",
      "Treinamentos agendados",
      "Atividades regulares",
    ],
    href: "/atividades/calendario",
    color: "from-navy-600 to-blue-600",
  },
];

const estatisticas = [
  {
    numero: "156+",
    label: "Operações Realizadas",
    icon: RiFlagLine,
    delay: 0,
  },
  {
    numero: "248+",
    label: "Agentes Ativos",
    icon: RiTeamLine,
    delay: 1,
  },
  {
    numero: "15.2K",
    label: "Pessoas Assistidas",
    icon: RiUserHeartLine,
    delay: 2,
  },
  {
    numero: "94%",
    label: "Taxa de Sucesso",
    icon: RiCheckboxCircleLine,
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

const AtividadeCard = ({
  atividade,
}: {
  atividade: (typeof ATIVIDADES)[0];
}) => {
  const IconComponent = atividade.icon;

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
      <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 group cursor-pointer h-full bg-white overflow-hidden">
        <CardHeader className="text-center pb-3 pt-6">
          <div
            className={`bg-gradient-to-br ${atividade.color} rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-500 shadow-lg`}
          >
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <CardTitle className="text-gray-800 text-lg sm:text-xl font-bebas tracking-wide">
            {atividade.title}
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            {atividade.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4">
            {atividade.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-gradient-to-br from-navy-600 to-blue-600 rounded-full mr-2"></div>
                {feature}
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:shadow-lg shadow-md py-2"
          >
            <Link
              href={atividade.href}
              className="flex items-center justify-center"
            >
              Acessar {atividade.title.split(" ")[0]}
              <RiArrowRightLine className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ActivitiesPage() {
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
                Atividades em Destaque
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 font-bebas tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-300 via-white to-blue-200 bg-clip-text text-transparent">
                NOSSAS ATIVIDADES
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light px-2"
            >
              Conheça em detalhes todas as nossas operações, relatórios e agenda
              de atividades.{" "}
              <span className="font-semibold text-white">Transparência</span> e{" "}
              <span className="font-semibold text-white">compromisso</span> com
              a sociedade em cada ação.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
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

      {/* Atividades Grid */}
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
              ÁREAS DE ATUAÇÃO
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Acompanhe nossas atividades operacionais e de transparência
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-navy-600 to-blue-600 mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
          >
            {ATIVIDADES.map((atividade, index) => (
              <AtividadeCard key={index} atividade={atividade} />
            ))}
          </motion.div>
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
                <RiTeamLine className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-bebas tracking-wide">
                FAÇA PARTE DA EQUIPE
              </h2>
              <p className="text-lg mb-6 text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Junte-se a nós como voluntário e participe ativamente das nossas
                operações e atividades de proteção ambiental e social
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
                    <RiMailLine className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Tornar-se Voluntário
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
                    href="/atividades/operacoes"
                    className="flex items-center justify-center"
                  >
                    <RiFireLine className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Ver Operações Ativas
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border border-gray-200 shadow-lg bg-white h-full">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 font-bebas tracking-wide flex items-center">
                    <RiTimerLine className="mr-2 w-6 h-6 text-navy-600" />
                    OPERAÇÕES EM TEMPO REAL
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                    Monitoramos constantemente nossas operações através de
                    sistemas de controle e comunicação avançados. Cada missão é
                    acompanhada em tempo real, garantindo segurança e eficiência
                    em todas as etapas.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    Nossa central de operações funciona 24 horas por dia, 7 dias
                    por semana, pronta para responder a qualquer emergência.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border border-gray-200 shadow-lg bg-gradient-to-br from-navy-600 to-blue-700 text-white h-full">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 font-bebas tracking-wide flex items-center">
                    <RiShieldCheckLine className="mr-2 w-6 h-6" />
                    TRANSPARÊNCIA TOTAL
                  </h3>
                  <p className="text-blue-100 leading-relaxed mb-4 text-sm sm:text-base">
                    Acreditamos que a transparência é fundamental para construir
                    confiança com a sociedade. Todos os nossos relatórios e
                    estatísticas são disponibilizados publicamente, permitindo
                    que qualquer pessoa acompanhe nosso trabalho.
                  </p>
                  <p className="text-blue-100 leading-relaxed text-sm sm:text-base">
                    Nossas métricas de desempenho são atualizadas mensalmente,
                    refletindo nosso compromisso com a melhoria contínua e a
                    excelência operacional.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
