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
  RiTreeLine,
  RiMapPinLine,
  RiPlaneLine,
  RiShipLine,
  RiHeartLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiFileTextLine,
  RiArrowRightLine,
  RiMailLine,
  RiMedalLine,
  RiLayoutGridLine,
  RiCalendarLine,
} from "react-icons/ri";
import Link from "next/link";

// --- DADOS ---
const SERVICES = [
  {
    icon: RiTreeLine,
    title: "Operações Ambientais",
    description:
      "Busca, resgate e salvamento em ambientes naturais e áreas de difícil acesso.",
    features: ["Combate a incêndios", "Resgate em matas", "Operações táticas"],
    href: "/servicos/operacoes-ambientais",
  },
  {
    icon: RiMapPinLine,
    title: "Operações Terrestres",
    description:
      "Busca, resgate e salvamento em ambientes terrestres diversos.",
    features: [
      "Incêndios florestais",
      "Áreas de difícil acesso",
      "Resgate em selva",
    ],
    href: "/servicos/operacoes-terrestres",
  },
  {
    icon: RiPlaneLine,
    title: "Operações Aéreas",
    description:
      "Operações de resgate envolvendo aeronaves de asa rotativa e fixa.",
    features: ["Busca e salvamento", "Fast rope", "Socorro pré-hospitalar"],
    href: "/servicos/operacoes-aereas",
  },
  {
    icon: RiShipLine,
    title: "Operações Marítimas",
    description: "Busca, resgate e salvamento em ambientes aquáticos.",
    features: [
      "Operações navais",
      "Mergulho de resgate",
      "Recuperação subaquática",
    ],
    href: "/servicos/operacoes-maritimas",
  },
  {
    icon: RiHeartLine,
    title: "Capelania",
    description:
      "Assistência religiosa e apoio espiritual para pacientes e familiares.",
    features: [
      "Atendimento leito a leito",
      "Aconselhamento",
      "Suporte psicológico",
    ],
    href: "/servicos/capelania",
  },
  {
    icon: RiTeamLine,
    title: "Patrulheiro Mirim",
    description: "Projeto educativo e disciplinar para jovens de 14 a 18 anos.",
    features: [
      "Educação patriótica",
      "Primeiros socorros",
      "Atividades esportivas",
    ],
    href: "/servicos/patrulheiro-mirim",
  },
  {
    icon: RiShieldCheckLine,
    title: "FOLARED",
    description:
      "Federação de Organismos Latino Americanos de Resposta a Emergências.",
    features: [
      "Cooperação internacional",
      "Troca de experiências",
      "Capacitação",
    ],
    href: "/servicos/folared",
  },
  {
    icon: RiFileTextLine,
    title: "Legislação",
    description: "Base legal e normativa que rege nossas operações.",
    features: ["Leis federais", "Decretos regulamentares", "Normas internas"],
    href: "/servicos/legislacao",
  },
];

const ESTATISTICAS = [
  { numero: "8", label: "Serviços", icon: RiShieldCheckLine },
  { numero: "50+", label: "Operações", icon: RiMedalLine },
  { numero: "24/7", label: "Prontidão", icon: RiLayoutGridLine },
  { numero: "5", label: "Anos", icon: RiCalendarLine },
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
const ServiceCard = ({ service }: { service: (typeof SERVICES)[0] }) => {
  const IconComponent = service.icon;

  return (
    <motion.div variants={itemVariants} className="h-full">
      <Card className="h-full border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer bg-white overflow-hidden flex flex-col hover:-translate-y-1">
        <CardHeader className="text-center pb-2 pt-6 px-6">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-pac-primary/10 transition-colors duration-300">
            <IconComponent className="w-7 h-7 text-slate-500 group-hover:text-pac-primary transition-colors duration-300" />
          </div>
          <CardTitle className="text-slate-900 text-xl font-bold tracking-tight mb-2 group-hover:text-pac-primary transition-colors">
            {service.title}
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm leading-relaxed">
            {service.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 flex-grow flex flex-col justify-end">
          <div className="border-t border-slate-100 my-4" />

          <ul className="space-y-2 mb-5">
            {service.features.slice(0, 3).map((feature, idx) => (
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
              href={service.href}
              className="flex items-center justify-center"
            >
              Saiba Mais
              <RiArrowRightLine className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ServicosPage() {
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
                Áreas de Atuação
              </span>
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              NOSSOS <span className="text-pac-primary">SERVIÇOS</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Conheça todos os serviços especializados oferecidos pela Patrulha
              Aérea Civil e nossa base legal de atuação. Excelência e
              compromisso em cada missão.
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

      {/* --- GRID DE SERVIÇOS --- */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">
              Especialidades
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Operações técnicas e humanitárias em diversos ambientes e
              situações.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {SERVICES.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 bg-pac-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiShieldCheckLine className="w-8 h-8 text-pac-primary" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight">
              PRECISA DE NOSSOS SERVIÇOS?
            </h2>
            <p className="text-slate-600 mb-10 text-lg leading-relaxed">
              Entre em contato conosco para saber mais sobre como podemos ajudar
              sua comunidade ou organização com nossa expertise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold rounded-full px-8 h-14 shadow-lg hover:-translate-y-1 transition-all"
              >
                <Link href="/contato">
                  <RiMailLine className="mr-2 w-5 h-5" /> Solicitar Serviço
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-pac-primary hover:border-pac-primary font-bold rounded-full px-8 h-14 transition-all"
              >
                <Link href="/servicos/legislacao">
                  <RiFileTextLine className="mr-2 w-5 h-5" /> Ver Legislação
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
