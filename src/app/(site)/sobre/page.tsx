"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
  RiFlagLine,
  RiUserStarLine,
  RiMedalLine,
  RiArrowRightLine,
  RiMailLine,
  RiCalendarLine,
  RiLayoutGridLine,
} from "react-icons/ri";
import Link from "next/link";

// --- DADOS ---
const VALORES = [
  {
    icon: RiShieldCheckLine,
    title: "Segurança",
    description:
      "Priorizamos a segurança em todas as operações e treinamentos.",
  },
  {
    icon: RiAwardLine,
    title: "Excelência",
    description: "Buscamos a máxima qualidade em nossos serviços humanitários.",
  },
  {
    icon: RiHeartLine,
    title: "Humanidade",
    description: "Agimos com compaixão e respeito em todas as situações.",
  },
  {
    icon: RiTeamLine,
    title: "Trabalho em Equipe",
    description: "Valorizamos a colaboração e o espírito de união.",
  },
  {
    icon: RiMapPinLine,
    title: "Compromisso",
    description: "Servimos as comunidades com dedicação e responsabilidade.",
  },
  {
    icon: RiSparklingLine,
    title: "Profissionalismo",
    description: "Atuamos com ética, competência e seriedade.",
  },
];

const ESTATISTICAS = [
  { numero: "50+", label: "Agentes", icon: RiUserStarLine },
  { numero: "100+", label: "Operações", icon: RiMedalLine },
  { numero: "24/7", label: "Prontidão", icon: RiLayoutGridLine },
  { numero: "5", label: "Anos", icon: RiCalendarLine },
];

const TIMELINE = [
  {
    year: "2019",
    title: "Fundação da PAC",
    description:
      "Criação da Patrulha Aérea Civil com foco em serviço humanitário.",
    icon: RiFlagLine,
  },
  {
    year: "2020",
    title: "Primeiras Operações",
    description:
      "Início das operações de resgate e treinamentos especializados.",
    icon: RiPlaneLine,
  },
  {
    year: "2022",
    title: "Expansão Nacional",
    description: "Ampliação das operações para todo o território nacional.",
    icon: RiMapPinLine,
  },
  {
    year: "2024",
    title: "Excelência",
    description:
      "Reconhecimento como referência em serviços aéreos humanitários.",
    icon: RiAwardLine,
  },
];

// --- VARIANTES DE ANIMAÇÃO ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-24 border-b border-slate-100 overflow-hidden">
        {/* Pattern Background Sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Elementos Decorativos (Blobs suaves) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge Técnico */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
              <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
                Quem Somos
              </span>
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              SOBRE A <span className="text-pac-primary">PAC</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Organização civil dedicada ao serviço aéreo humanitário, resgate e
              proteção civil. Conheça nossa missão, valores e o compromisso que
              nos move.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {ESTATISTICAS.map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-pac-primary/10 transition-colors">
                  <stat.icon className="w-6 h-6 text-slate-400 group-hover:text-pac-primary transition-colors" />
                </div>
                <div className="text-3xl font-black text-slate-900 mb-1">
                  {stat.numero}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- MISSÃO, VISÃO E VALORES --- */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">
              Nossa Essência
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Os pilares fundamentais que sustentam cada decisão estratégica e
              operacional.
            </p>
          </div>

          {/* Cards Principais (Missão/Visão) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg bg-white overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1 h-full bg-pac-primary" />
              <CardHeader>
                <div className="w-14 h-14 bg-pac-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <RiFocusLine className="w-7 h-7 text-pac-primary" />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 uppercase">
                  Missão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Promover a segurança aérea e terrestre através de serviços
                  voluntários, treinamentos especializados e operações de
                  resgate humanitário com excelência e compromisso.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <CardHeader>
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <RiEyeLine className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 uppercase">
                  Visão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Ser referência nacional em serviços aéreos humanitários,
                  reconhecida pela excelência operacional, impacto social
                  positivo e inovação em proteção civil.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Grid de Valores */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {VALORES.map((valor, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border border-slate-200 hover:border-pac-primary/30 hover:shadow-lg transition-all duration-300 bg-white group">
                  <CardHeader>
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-pac-primary group-hover:text-white transition-colors duration-300">
                      <valor.icon className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800">
                      {valor.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      {valor.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- HISTÓRIA / TIMELINE --- */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Texto Descritivo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-[2px] bg-pac-primary" />
                <span className="text-pac-primary font-bold uppercase tracking-widest text-sm">
                  Nossa História
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">
                UMA TRAJETÓRIA DE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pac-primary to-blue-600">
                  IMPACTO E DEDICAÇÃO
                </span>
              </h2>
              <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                <p>
                  A <strong>Patrulha Aérea Civil</strong> foi fundada com o
                  propósito de unir a paixão pela aviação civil ao serviço
                  humanitário, criando uma organização dedicada à proteção e ao
                  bem-estar das comunidades.
                </p>
                <p>
                  Nossa trajetória é marcada por operações bem-sucedidas,
                  treinamentos especializados e um compromisso inabalável com a
                  segurança e excelência. Acreditamos que a aviação civil é uma
                  ferramenta poderosa de transformação social.
                </p>
              </div>

              <div className="mt-8">
                <Button
                  asChild
                  className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold rounded-full px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/servicos">
                    Conhecer Nossos Serviços{" "}
                    <RiArrowRightLine className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Timeline Vertical Clean */}
            <motion.div
              className="relative pl-8 border-l-2 border-slate-100 space-y-10"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {TIMELINE.map((item, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-slate-300 group-hover:bg-pac-primary group-hover:scale-125 transition-all shadow-sm" />

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-slate-900">
                      {item.year}
                    </span>
                    <span className="hidden sm:block text-slate-300">•</span>
                    <h3 className="font-bold text-lg text-pac-primary">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">
              JUNTE-SE À NOSSA MISSÃO
            </h2>
            <p className="text-slate-600 mb-10 text-lg">
              Seja parte desta equipe dedicada ao serviço humanitário e à
              proteção civil. Juntos, podemos fazer a diferença.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold rounded-full px-8 h-14 shadow-lg hover:-translate-y-1 transition-all"
              >
                <Link href="/contato">
                  <RiMailLine className="mr-2 w-5 h-5" /> Entre em Contato
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-pac-primary hover:border-pac-primary font-bold rounded-full px-8 h-14 transition-all"
              >
                <Link href="/atividades">
                  <RiTeamLine className="mr-2 w-5 h-5" /> Explorar Atividades
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
