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
  RiScales3Line,
  RiFileListLine,
  RiBookOpenLine,
  RiArrowRightLine,
  RiDownloadLine,
  RiMedalLine,
} from "react-icons/ri";
import Link from "next/link";

const legislacaoCategorias = [
  {
    icon: RiScales3Line,
    title: "Leis Federais",
    description:
      "Leis que regulamentam o serviço de emergência e resgate no Brasil",
    count: "8 Leis",
    href: "/servicos/legislacao/leis",
    features: ["Lei do SAMU", "Lei de Emergências", "Lei do Voluntariado"],
  },
  {
    icon: RiFileListLine,
    title: "Decretos",
    description: "Decretos e portarias que complementam a legislação principal",
    count: "12 Decretos",
    href: "/servicos/legislacao/decretos",
    features: [
      "Decretos Estaduais",
      "Portarias Ministeriais",
      "Normas Técnicas",
    ],
  },
  {
    icon: RiBookOpenLine,
    title: "Regulamentos",
    description: "Regulamentos internos e procedimentos operacionais da PAC",
    count: "15 Documentos",
    href: "/servicos/legislacao/regulamentos",
    features: ["Regulamento Interno", "Procedimentos OP", "Código de Conduta"],
  },
];

const leisPrincipais = [
  {
    numero: "Lei 13.425/2017",
    titulo: "Política Nacional de Proteção e Defesa Civil",
    descricao: "Dispõe sobre o Sistema Nacional de Proteção e Defesa Civil",
  },
  {
    numero: "Lei 12.608/2012",
    titulo: "Política Nacional de Proteção e Defesa Civil",
    descricao: "Institui a Política Nacional de Proteção e Defesa Civil",
  },
  {
    numero: "Lei 9.608/1998",
    titulo: "Lei do Voluntariado",
    descricao: "Dispõe sobre o serviço voluntário e sua regulamentação",
  },
];

const estatisticas = [
  {
    numero: "3",
    label: "Categorias Legais",
    icon: RiScales3Line,
    delay: 0,
  },
  {
    numero: "8",
    label: "Leis Federais",
    icon: RiFileListLine,
    delay: 1,
  },
  {
    numero: "12",
    label: "Decretos Vigentes",
    icon: RiMedalLine,
    delay: 2,
  },
  {
    numero: "15+",
    label: "Documentos Internos",
    icon: RiBookOpenLine,
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

const ServiceCard = ({
  service,
}: {
  service: (typeof legislacaoCategorias)[0];
}) => {
  const IconComponent = service.icon;

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
      <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 group cursor-pointer h-full">
        <CardHeader className="text-center pb-3 pt-6">
          <div className="bg-gradient-to-br from-navy-600 to-blue-600 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-500 shadow-lg">
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
              Acessar
              <RiArrowRightLine className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function LegislacaoPage() {
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
                <RiScales3Line className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Base Legal
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 font-bebas tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-300 via-white to-blue-200 bg-clip-text text-transparent">
                LEGISLAÇÃO
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light px-2"
            >
              Conheça a base legal que rege as operações da Patrulha Aérea
              Civil.{" "}
              <span className="font-semibold text-white">Transparência</span>,{" "}
              <span className="font-semibold text-white">conformidade</span> e{" "}
              <span className="font-semibold text-white">legalidade</span> em
              todas as nossas ações.
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

      {/* Main Content */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Services Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {legislacaoCategorias.map((service) => (
                <ServiceCard key={service.title} service={service} />
              ))}
            </motion.div>

            {/* Leis Principais */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 mb-8">
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="text-gray-800 text-xl sm:text-2xl font-bebas tracking-wide">
                    LEIS PRINCIPAIS
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Legislação federal mais relevante para nossas operações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leisPrincipais.map((lei, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-navy-200 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <Badge
                              variant="default"
                              className="bg-gradient-to-r from-navy-600 to-blue-600 text-white"
                            >
                              {lei.numero}
                            </Badge>
                            <h3 className="font-semibold text-gray-800">
                              {lei.titulo}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {lei.descricao}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="mt-3 sm:mt-0"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-navy-600 text-navy-600 hover:bg-navy-600 hover:text-white transition-all duration-300"
                          >
                            <RiDownloadLine className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-navy-600 to-blue-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white shadow-xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <RiScales3Line className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-bebas tracking-wide">
                    CONSULTORIA JURÍDICA
                  </h2>
                  <p className="text-lg mb-6 text-blue-100 max-w-2xl mx-auto leading-relaxed">
                    Precisa de orientação sobre aspectos legais das operações de
                    resgate e emergência?
                  </p>
                </motion.div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-navy-800 font-semibold transition-all duration-300 hover:shadow-lg shadow-md"
                      asChild
                    >
                      <Link href="/contato">Consultar Jurídico</Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-white text-navy-800 hover:bg-white/90 font-semibold transition-all duration-300 hover:shadow-lg shadow-md"
                      asChild
                    >
                      <Link href="/servicos">Voltar aos Serviços</Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
