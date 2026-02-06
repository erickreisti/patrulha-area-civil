"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  RiCalendarLine,
  RiFileTextLine,
  RiRunLine,
  RiArrowRightLine,
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

// --- DADOS ---
const ATIVIDADES = [
  {
    icon: RiRunLine,
    title: "Operações em Tempo Real",
    description:
      "Acompanhe nossas operações ativas e o histórico completo de ações em prol da segurança.",
    features: [
      "Monitoramento 24/7",
      "Histórico de missões",
      "Status operacional",
    ],
    href: "/atividades/operacoes",
  },
  {
    icon: RiFileTextLine,
    title: "Relatórios e Estatísticas",
    description:
      "Acesso transparente aos nossos relatórios operacionais e métricas de desempenho.",
    features: [
      "Relatórios mensais",
      "Dados estatísticos",
      "Indicadores de desempenho",
    ],
    href: "/atividades/relatorios",
  },
  {
    icon: RiCalendarLine,
    title: "Calendário de Atividades",
    description:
      "Agenda completa de operações, treinamentos e eventos comunitários.",
    features: [
      "Eventos futuros",
      "Treinamentos agendados",
      "Atividades regulares",
    ],
    href: "/atividades/calendario",
  },
];

const ESTATISTICAS = [
  { numero: "156+", label: "Operações", icon: RiFlagLine },
  { numero: "248+", label: "Agentes", icon: RiTeamLine },
  { numero: "15K+", label: "Assistidos", icon: RiUserHeartLine },
  { numero: "94%", label: "Êxito", icon: RiCheckboxCircleLine },
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

// --- SUB-COMPONENTES ---
const AtividadeCard = ({
  atividade,
}: {
  atividade: (typeof ATIVIDADES)[0];
}) => {
  const IconComponent = atividade.icon;

  return (
    <motion.div variants={itemVariants} className="h-full">
      <Card className="h-full border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer bg-white overflow-hidden flex flex-col hover:-translate-y-1">
        <CardHeader className="text-center pb-2 pt-6 px-6">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-pac-primary/10 transition-colors duration-300">
            <IconComponent className="w-7 h-7 text-slate-500 group-hover:text-pac-primary transition-colors duration-300" />
          </div>
          <CardTitle className="text-slate-900 text-xl font-bold tracking-tight mb-2 group-hover:text-pac-primary transition-colors">
            {atividade.title}
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm leading-relaxed">
            {atividade.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 flex-grow flex flex-col justify-end">
          <div className="border-t border-slate-100 my-4" />

          <ul className="space-y-2 mb-5">
            {atividade.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center text-slate-500 text-xs font-medium"
              >
                <div className="w-1.5 h-1.5 bg-pac-primary/60 rounded-full mr-2" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            asChild
            variant="outline"
            className="w-full border-slate-200 text-slate-600 hover:text-pac-primary hover:border-pac-primary/30 hover:bg-pac-primary/5 font-semibold text-sm transition-all"
          >
            <Link
              href={atividade.href}
              className="flex items-center justify-center"
            >
              Acessar
              <RiArrowRightLine className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ActivitiesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-24 border-b border-slate-100 overflow-hidden">
        {/* Pattern Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Elemento Decorativo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge Técnico */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
              <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
                Transparência Operacional
              </span>
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              NOSSAS <span className="text-pac-primary">ATIVIDADES</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Conheça em detalhes todas as nossas operações, relatórios e agenda
              de atividades. Transparência e compromisso com a sociedade em cada
              ação.
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

      {/* --- GRID DE ATIVIDADES --- */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">
              Áreas de Atuação
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Acompanhe de perto o impacto das nossas ações.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {ATIVIDADES.map((atividade, index) => (
              <AtividadeCard key={index} atividade={atividade} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- INFORMAÇÕES ADICIONAIS --- */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            {/* Bloco 1: Tempo Real */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-pac-primary/10 rounded-lg flex items-center justify-center">
                      <RiTimerLine className="w-5 h-5 text-pac-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Operações em Tempo Real
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4 text-lg">
                    Monitoramos constantemente nossas operações através de
                    sistemas de controle e comunicação avançados. Cada missão é
                    acompanhada em tempo real, garantindo segurança e
                    eficiência.
                  </p>
                  <p className="text-slate-500 text-sm font-medium">
                    Central de operações ativa 24/7.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bloco 2: Transparência */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <RiShieldCheckLine className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Transparência Total
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4 text-lg">
                    Acreditamos que a transparência é fundamental para construir
                    confiança. Todos os nossos relatórios e estatísticas são
                    disponibilizados publicamente.
                  </p>
                  <p className="text-slate-500 text-sm font-medium">
                    Métricas de desempenho auditadas mensalmente.
                  </p>
                </CardContent>
              </Card>
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
              FAÇA PARTE DA EQUIPE
            </h2>
            <p className="text-slate-600 mb-10 text-lg leading-relaxed">
              Junte-se a nós como voluntário e participe ativamente das nossas
              operações e atividades de proteção ambiental e social.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold rounded-full px-8 h-14 shadow-lg hover:-translate-y-1 transition-all"
              >
                <Link href="/contato">
                  <RiMailLine className="mr-2 w-5 h-5" /> Tornar-se Voluntário
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-pac-primary hover:border-pac-primary font-bold rounded-full px-8 h-14 transition-all"
              >
                <Link href="/atividades/operacoes">
                  <RiFireLine className="mr-2 w-5 h-5" /> Ver Operações
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
