// app/(site)/atividades/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaRunning,
  FaArrowRight,
  FaBullseye,
  FaUsers,
  FaShieldAlt,
  FaClock,
} from "react-icons/fa";
import Link from "next/link";

export default function ActivitiesPage() {
  const atividades = [
    {
      titulo: "Operações",
      descricao:
        "Acompanhe nossas operações em tempo real e o histórico de ações realizadas em prol da segurança e proteção ambiental.",
      icone: FaRunning,
      link: "/atividades/operacoes",
      cor: "from-navy-light to-navy",
    },
    {
      titulo: "Relatórios",
      descricao:
        "Acesso transparente aos nossos relatórios operacionais, estatísticas e métricas de desempenho.",
      icone: FaFileAlt,
      link: "/atividades/relatorios",
      cor: "from-navy to-navy-dark",
    },
    {
      titulo: "Calendário",
      descricao:
        "Acompanhe nossa agenda de operações, treinamentos, eventos e atividades programadas.",
      icone: FaCalendarAlt,
      link: "/atividades/calendario",
      cor: "from-navy-light to-navy",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate to-offwhite font-roboto">
      {/* Hero Section */}
      <section className="relative bg-slate text-white pt-40 pb-24">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-8 bg-navy-light hover:bg-navy text-white border-none text-sm py-2 px-4 font-roboto">
              <FaBullseye className="w-4 h-4 mr-2" />
              Nossas Atividades
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-bebas tracking-wide">
              <span className="text-navy-light">ATIVIDADES</span> DA PAC
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-roboto">
              Conheça em detalhes todas as nossas operações, relatórios e agenda
              de atividades. Transparência e compromisso com a sociedade.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-20 bg-white -mt-2 relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid de Atividades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {atividades.map((atividade, index) => {
              const Icone = atividade.icone;
              return (
                <Card
                  key={index}
                  className="border-gray-200 shadow-xl hover-lift group border-2 overflow-hidden font-roboto h-full flex flex-col"
                >
                  <CardHeader
                    className={`bg-gradient-to-r ${atividade.cor} text-white pb-6 pt-8`}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bebas tracking-wide">
                        {atividade.titulo}
                      </CardTitle>
                      <Icone className="h-10 w-10 text-white/90" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 flex-grow flex flex-col">
                    <CardDescription className="text-gray-600 text-lg leading-relaxed mb-6 flex-grow font-roboto">
                      {atividade.descricao}
                    </CardDescription>
                    <Link href={atividade.link}>
                      <Button className="w-full bg-navy-light hover:bg-navy text-white font-bold py-3 text-lg transition-all duration-300 hover:scale-105 shadow-lg font-roboto">
                        Acessar {atividade.titulo}
                        <FaArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Stats Section */}
          <Card className="border-navy-light bg-gradient-to-r from-navy-light to-navy text-white shadow-2xl border-2">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 font-bebas tracking-wide">
                NOSSOS NÚMEROS
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 font-bebas tracking-wide">
                    156
                  </div>
                  <div className="text-blue-200 text-lg font-roboto">
                    Operações
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 font-bebas tracking-wide">
                    248
                  </div>
                  <div className="text-blue-200 text-lg font-roboto">
                    Agentes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 font-bebas tracking-wide">
                    15.2K
                  </div>
                  <div className="text-blue-200 text-lg font-roboto">
                    Pessoas Assistidas
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 font-bebas tracking-wide">
                    94%
                  </div>
                  <div className="text-blue-200 text-lg font-roboto">
                    Taxa de Sucesso
                  </div>
                </div>
              </div>
              <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-roboto">
                Comprometidos com a excelência em todas as nossas operações e
                atividades. Nossos números refletem o trabalho dedicado de nossa
                equipe.
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-navy-light hover:bg-offwhite font-bold py-4 px-12 text-lg transition-all duration-300 hover:scale-105 shadow-xl font-roboto"
              >
                <FaUsers className="mr-3 h-5 w-5" />
                Tornar-se Voluntário
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
