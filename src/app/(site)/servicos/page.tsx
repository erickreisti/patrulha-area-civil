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
  RiTreeLine,
  RiMapPinLine,
  RiPlaneLine,
  RiShipLine,
  RiHeartLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiFileTextLine,
  RiArrowRightLine,
  RiSparklingLine,
  RiMailLine,
  RiMedalLine,
  RiGlobalLine,
  RiCalendarLine,
} from "react-icons/ri";
import Link from "next/link";

const SERVICES = [
  {
    icon: RiTreeLine,
    title: "Operações Ambientais",
    description:
      "Busca, resgate e salvamento em ambientes naturais e áreas de difícil acesso",
    features: ["Combate a incêndios", "Resgate em matas", "Operações táticas"],
    href: "/servicos/operacoes-ambientais",
    color: "from-navy-600 to-navy-700", // PADRÃO NAVY (igual à página Sobre)
  },
  {
    icon: RiMapPinLine,
    title: "Operações Terrestres",
    description: "Busca, resgate e salvamento em ambientes terrestres diversos",
    features: [
      "Incêndios florestais",
      "Áreas de difícil acesso",
      "Resgate em selva",
    ],
    href: "/servicos/operacoes-terrestres",
    color: "from-navy-600 to-navy-700", // PADRÃO NAVY (igual à página Sobre)
  },
  {
    icon: RiPlaneLine,
    title: "Operações Aéreas",
    description:
      "Operações de resgate envolvendo aeronaves de asa rotativa e fixa",
    features: ["Busca e salvamento", "Fast rope", "Socorro pré-hospitalar"],
    href: "/servicos/operacoes-aereas",
    color: "from-navy-600 to-navy-700", // PADRÃO NAVY (igual à página Sobre)
  },
  {
    icon: RiShipLine,
    title: "Operações Marítimas",
    description: "Busca, resgate e salvamento em ambientes aquáticos",
    features: [
      "Operações navais",
      "Mergulho de resgate",
      "Recuperação subaquática",
    ],
    href: "/servicos/operacoes-maritimas",
    color: "from-navy-600 to-navy-700", // PADRÃO NAVY (igual à página Sobre)
  },
  {
    icon: RiHeartLine,
    title: "Serviço de Capelania",
    description:
      "Assistência religiosa e apoio espiritual para pacientes e familiares",
    features: [
      "Atendimento leito a leito",
      "Aconselhamento",
      "Suporte psicológico",
    ],
    href: "/servicos/capelania",
    color: "from-navy-600 to-navy-700", // PADRÃO NAVY (igual à página Sobre)
  },
  {
    icon: RiTeamLine,
    title: "Patrulheiro Mirim",
    description: "Projeto educativo e disciplinar para jovens de 14 a 18 anos",
    features: [
      "Educação patriótica",
      "Primeiros socorros",
      "Atividades esportivas",
    ],
    href: "/servicos/patrulheiro-mirim",
    color: "from-navy-600 to-navy-700", // PADRÃO NAVY (igual à página Sobre)
  },
  {
    icon: RiShieldCheckLine,
    title: "FOLARED",
    description:
      "Federação de Organismos Latino Americanos de Resposta a Emergências",
    features: [
      "Cooperação internacional",
      "Troca de experiências",
      "Capacitação",
    ],
    href: "/servicos/folared",
    color: "from-navy-600 to-navy-700", // PADRÃO NAVY (igual à página Sobre)
  },
  {
    icon: RiFileTextLine,
    title: "Legislação",
    description: "Base legal e normativa que rege nossas operações",
    features: ["Leis federais", "Decretos regulamentares", "Normas internas"],
    href: "/servicos/legislacao",
    color: "from-navy-600 to-navy-700", // PADRÃO NAVY (igual à página Sobre)
  },
];

const estatisticas = [
  {
    numero: "8",
    label: "Serviços Especializados",
    icon: RiShieldCheckLine,
    delay: 0,
  },
  {
    numero: "50+",
    label: "Operações Realizadas",
    icon: RiMedalLine,
    delay: 1,
  },
  {
    numero: "24/7",
    label: "Prontidão Operacional",
    icon: RiGlobalLine,
    delay: 2,
  },
  {
    numero: "5",
    label: "Anos de Experiência",
    icon: RiCalendarLine,
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

const ServiceCard = ({ service }: { service: (typeof SERVICES)[0] }) => {
  const IconComponent = service.icon;

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
      <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 group cursor-pointer h-full bg-white overflow-hidden">
        <CardHeader className="text-center pb-3 pt-6">
          <div
            className={`bg-gradient-to-br ${service.color} rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-500 shadow-lg`}
          >
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <CardTitle className="text-gray-800 text-lg sm:text-xl font-bebas tracking-wide">
            {service.title}
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            {service.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4">
            {service.features.map((feature, idx) => (
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
              href={service.href}
              className="flex items-center justify-center"
            >
              Saiba Mais
              <RiArrowRightLine className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ServicosPage() {
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
                Serviços Especializados
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 font-bebas tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-300 via-white to-blue-200 bg-clip-text text-transparent">
                NOSSOS SERVIÇOS
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light px-2"
            >
              Conheça todos os serviços especializados oferecidos pela Patrulha
              Aérea Civil e nossa base legal de atuação.{" "}
              <span className="font-semibold text-white">Excelência</span> e{" "}
              <span className="font-semibold text-white">compromisso</span> em
              cada missão.
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

      {/* Services Grid */}
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
              SERVIÇOS ESPECIALIZADOS
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Operações especializadas em diversos ambientes e situações
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-navy-600 to-blue-600 mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {SERVICES.map((service, index) => (
              <ServiceCard key={index} service={service} />
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
                <RiShieldCheckLine className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-bebas tracking-wide">
                PRECISA DE NOSSOS SERVIÇOS?
              </h2>
              <p className="text-lg mb-6 text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Entre em contato conosco para saber mais sobre como podemos
                ajudar sua comunidade ou organização
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
                    Solicitar Serviço
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
                    href="/servicos/legislacao"
                    className="flex items-center justify-center"
                  >
                    <RiSparklingLine className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Conhecer a Legislação
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
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 font-bebas tracking-wide">
                    COMPROMISSO COM A EXCELÊNCIA
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                    Cada serviço da Patrulha Aérea Civil é executado com o mais
                    alto padrão de qualidade e segurança, seguindo protocolos
                    internacionais e adaptando-se às necessidades específicas de
                    cada situação.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    Nossos agentes passam por treinamentos constantes e
                    reciclagens periódicas para garantir que estejam sempre
                    preparados para qualquer desafio.
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
                    <RiTeamLine className="mr-2 w-6 h-6" />
                    TRABALHO EM EQUIPE
                  </h3>
                  <p className="text-blue-100 leading-relaxed mb-4 text-sm sm:text-base">
                    A sinergia entre nossos agentes é fundamental para o sucesso
                    de nossas operações. Cada membro tem um papel específico e
                    complementar, garantindo eficiência e segurança em todas as
                    missões.
                  </p>
                  <p className="text-blue-100 leading-relaxed text-sm sm:text-base">
                    Nossa equipe multidisciplinar inclui especialistas em
                    diversas áreas, desde operações táticas até suporte médico e
                    psicológico.
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
