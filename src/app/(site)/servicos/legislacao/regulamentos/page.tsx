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
  RiBookOpenLine,
  RiArrowLeftLine,
  RiDownloadLine,
  RiFileListLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiSparklingLine,
  RiMedalLine,
  RiScales3Line,
} from "react-icons/ri";
import Link from "next/link";

const regulamentos = [
  {
    titulo: "Regulamento Interno da PAC",
    descricao: "Normas e procedimentos internos da Patrulha Aérea Civil",
    versao: "2.1",
    data: "15/03/2024",
    categoria: "Administrativo",
  },
  {
    titulo: "Manual de Procedimentos Operacionais",
    descricao: "Procedimentos padrão para operações de busca e resgate",
    versao: "3.0",
    data: "01/02/2024",
    categoria: "Operacional",
  },
  {
    titulo: "Código de Conduta e Ética",
    descricao: "Normas de conduta e princípios éticos dos membros da PAC",
    versao: "1.5",
    data: "10/01/2024",
    categoria: "Ético",
  },
  {
    titulo: "Protocolo de Segurança Operacional",
    descricao: "Medidas de segurança para todas as operações",
    versao: "2.2",
    data: "20/12/2023",
    categoria: "Segurança",
  },
  {
    titulo: "Manual de Treinamento Básico",
    descricao: "Programa de treinamento para novos voluntários",
    versao: "4.0",
    data: "05/11/2023",
    categoria: "Treinamento",
  },
  {
    titulo: "Procedimentos de Emergência Médica",
    descricao: "Protocolos para atendimento médico de emergência",
    versao: "3.1",
    data: "15/10/2023",
    categoria: "Médico",
  },
];

const estatisticas = [
  {
    numero: "6",
    label: "Regulamentos Ativos",
    icon: RiBookOpenLine,
    delay: 0,
  },
  {
    numero: "Última 2024",
    label: "Atualização",
    icon: RiFileListLine,
    delay: 1,
  },
  {
    numero: "Restrito",
    label: "Acesso Controlado",
    icon: RiShieldCheckLine,
    delay: 2,
  },
  {
    numero: "Versão 4.0",
    label: "Mais Recente",
    icon: RiMedalLine,
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

const RegulamentoCard = ({
  regulamento,
  index,
}: {
  regulamento: (typeof regulamentos)[0];
  index: number;
}) => (
  <motion.div
    key={index}
    variants={itemVariants}
    whileHover={{ scale: 1.02, y: -5 }}
  >
    <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 group">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <CardTitle className="text-gray-800 text-lg sm:text-xl font-bebas tracking-wide mb-2">
                  {regulamento.titulo}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {regulamento.descricao}
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-gray-100 to-white text-gray-600 group-hover:scale-110 transition-transform duration-300"
              >
                v{regulamento.versao}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <RiFileListLine className="h-4 w-4" />
                <span>{regulamento.data}</span>
              </div>
              <Badge
                variant="outline"
                className="border-navy-600 text-navy-600"
              >
                {regulamento.categoria}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button
                variant="outline"
                size="sm"
                className="border-navy-600 text-navy-600 hover:bg-navy-600 hover:text-white transition-all duration-300"
              >
                <RiFileListLine className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white transition-all duration-300"
              >
                <RiDownloadLine className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function RegulamentosPage() {
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
                <RiBookOpenLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Documentos Internos
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 font-bebas tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-300 via-white to-blue-200 bg-clip-text text-transparent">
                REGULAMENTOS INTERNOS
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light px-2"
            >
              Documentos e procedimentos internos da Patrulha Aérea Civil.{" "}
              <span className="font-semibold text-white">Padronização</span>,{" "}
              <span className="font-semibold text-white">segurança</span> e{" "}
              <span className="font-semibold text-white">qualidade</span> em
              todas as operações.
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
              <Link href="/servicos/legislacao" className="flex items-center">
                <RiArrowLeftLine className="mr-2 h-4 w-4" />
                Voltar para Legislação
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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Acesso Restrito */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border border-navy-200 bg-gradient-to-br from-navy-50 to-blue-50 shadow-lg hover:shadow-xl transition-all duration-500 mb-8">
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="text-navy-600 text-lg sm:text-xl font-bebas tracking-wide flex items-center">
                    <RiShieldCheckLine className="h-5 w-5 mr-2" />
                    ACESSO RESTRITO
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Alguns documentos podem ter acesso restrito a membros
                    autorizados da PAC
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Regulamentos Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {regulamentos.map((regulamento, index) => (
                <RegulamentoCard
                  key={index}
                  regulamento={regulamento}
                  index={index}
                />
              ))}
            </motion.div>

            {/* Membros Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500">
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="text-gray-800 text-lg sm:text-xl font-bebas tracking-wide flex items-center">
                    <RiTeamLine className="h-5 w-5 mr-2" />
                    PARA MEMBROS DA PAC
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Membros ativos da Patrulha Aérea Civil têm acesso a
                    documentos adicionais através do sistema interno.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:shadow-lg shadow-md"
                    >
                      <Link href="/login">Acessar Sistema Interno</Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
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
                <RiBookOpenLine className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-bebas tracking-wide">
                PADRONIZAÇÃO PARA EXCELÊNCIA
              </h2>
              <p className="text-lg mb-6 text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Nossos regulamentos internos garantem que todas as operações
                sigam os mais altos padrões de qualidade, segurança e
                profissionalismo. Documentação completa para resultados
                consistentes.
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
                    href="/servicos/legislacao"
                    className="flex items-center justify-center"
                  >
                    <RiScales3Line className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Ver Toda Legislação
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
                    href="/sobre"
                    className="flex items-center justify-center"
                  >
                    <RiSparklingLine className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Conheça a PAC
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
