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
import {
  FaCalendarAlt,
  FaFileAlt,
  FaRunning,
  FaArrowRight,
  FaBullseye,
  FaUsers,
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
      cor: "from-blue-600 to-blue-700",
    },
    {
      titulo: "Relatórios",
      descricao:
        "Acesso transparente aos nossos relatórios operacionais, estatísticas e métricas de desempenho.",
      icone: FaFileAlt,
      link: "/atividades/relatorios",
      cor: "from-blue-700 to-blue-800",
    },
    {
      titulo: "Calendário",
      descricao:
        "Acompanhe nossa agenda de operações, treinamentos, eventos e atividades programadas.",
      icone: FaCalendarAlt,
      link: "/atividades/calendario",
      cor: "from-blue-600 to-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaBullseye className="w-4 h-4 mr-2" />
              Nossas Atividades
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              <span className="text-blue-400">ATIVIDADES</span> DA PAC
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Conheça em detalhes todas as nossas operações, relatórios e agenda
              de atividades. Transparência e compromisso com a sociedade.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Grid de Atividades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {atividades.map((atividade, index) => {
              const Icone = atividade.icone;
              return (
                <Card
                  key={index}
                  className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 overflow-hidden h-full flex flex-col"
                >
                  <CardHeader
                    className={`bg-gradient-to-r ${atividade.cor} text-white pb-4 pt-6`}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bebas tracking-wide">
                        {atividade.titulo}
                      </CardTitle>
                      <Icone className="h-8 w-8 text-white/90" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow flex flex-col">
                    <CardDescription className="text-gray-600 leading-relaxed mb-4 flex-grow text-sm">
                      {atividade.descricao}
                    </CardDescription>
                    <Link href={atividade.link}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 transition-all duration-300 hover:scale-105 shadow-lg">
                        Acessar {atividade.titulo}
                        <FaArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Stats Section */}
          <Card className="border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl border-2">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 font-bebas tracking-wide">
                NOSSOS NÚMEROS
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1 font-bebas tracking-wide">
                    156
                  </div>
                  <div className="text-blue-200 text-sm">Operações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1 font-bebas tracking-wide">
                    248
                  </div>
                  <div className="text-blue-200 text-sm">Agentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1 font-bebas tracking-wide">
                    15.2K
                  </div>
                  <div className="text-blue-200 text-sm">
                    Pessoas Assistidas
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1 font-bebas tracking-wide">
                    94%
                  </div>
                  <div className="text-blue-200 text-sm">Taxa de Sucesso</div>
                </div>
              </div>
              <p className="text-blue-100 max-w-2xl mx-auto mb-6 leading-relaxed text-sm">
                Comprometidos com a excelência em todas as nossas operações e
                atividades. Nossos números refletem o trabalho dedicado de nossa
                equipe.
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-2 px-6 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                <FaUsers className="mr-2 h-4 w-4" />
                Tornar-se Voluntário
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
