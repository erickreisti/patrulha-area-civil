"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaCalendar,
  FaMapMarkerAlt,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowLeft,
  FaBullseye,
  FaClock,
} from "react-icons/fa";

export default function OperacoesPage() {
  const operacoes = [
    {
      id: 1,
      titulo: "Operação Amazônia Sustentável",
      tipo: "Ambiental",
      status: "Concluída",
      data: "2024-01-15",
      local: "Floresta Amazônica - AM",
      equipe: 12,
      descricao:
        "Fiscalização de áreas de preservação ambiental e combate ao desmatamento ilegal.",
      resultado: "3 áreas protegidas, 15 autuações aplicadas",
    },
    {
      id: 2,
      titulo: "Patrulha Costeira - Verão 2024",
      tipo: "Marítima",
      status: "Em Andamento",
      data: "2024-01-20",
      local: "Litoral Nordeste",
      equipe: 8,
      descricao: "Operação de segurança nas praias durante temporada de verão.",
      resultado: "2.500 banhistas assistidos",
    },
    {
      id: 3,
      titulo: "Operação Estradas Seguras",
      tipo: "Terrestre",
      status: "Planejada",
      data: "2024-02-01",
      local: "BR-101 Sul",
      equipe: 6,
      descricao: "Fiscalização de trânsito e auxílio em rodovias federais.",
      resultado: "Em planejamento",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      Concluída: "bg-emerald-500 hover:bg-emerald-600",
      "Em Andamento": "bg-blue-600 hover:bg-blue-700",
      Planejada: "bg-amber-500 hover:bg-amber-600",
    };
    return variants[status as keyof typeof variants] || "bg-gray-600";
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      Ambiental: "bg-emerald-500 hover:bg-emerald-600",
      Marítima: "bg-cyan-500 hover:bg-cyan-600",
      Terrestre: "bg-amber-500 hover:bg-amber-600",
      Aérea: "bg-blue-500 hover:bg-blue-600",
    };
    return variants[tipo as keyof typeof variants] || "bg-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-6 text-blue-400 hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Atividades
            </Button>

            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaBullseye className="w-4 h-4 mr-2" />
              Operações em Tempo Real
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              OPERAÇÕES DA PAC
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl leading-relaxed">
              Acompanhe nossas operações em tempo real e o histórico de ações
              realizadas em prol da segurança e proteção ambiental.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                title: "Total de Operações",
                value: "156",
                change: "+12% este ano",
                icon: FaExclamationTriangle,
              },
              {
                title: "Em Andamento",
                value: "8",
                change: "Operações ativas",
                icon: FaClock,
              },
              {
                title: "Equipes Ativas",
                value: "42",
                change: "Agentes em campo",
                icon: FaUsers,
              },
              {
                title: "Taxa de Sucesso",
                value: "94%",
                change: "Objetivos alcançados",
                icon: FaCheckCircle,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="border-gray-200 shadow-lg border-2 text-center hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-xl font-bold text-gray-800 mb-1 font-bebas tracking-wide">
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-600">{stat.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Operações List */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bebas tracking-wide text-gray-800 mb-4">
              OPERAÇÕES EM DESTAQUE
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-4">
            {operacoes.map((operacao) => (
              <Card
                key={operacao.id}
                className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 border-2"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2 mb-2 font-bebas tracking-wide">
                        {operacao.titulo}
                        <Badge
                          className={`text-xs ${getTipoBadge(operacao.tipo)}`}
                        >
                          {operacao.tipo}
                        </Badge>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaCalendar className="h-4 w-4" />
                          {new Date(operacao.data).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="h-4 w-4" />
                          {operacao.local}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUsers className="h-4 w-4" />
                          {operacao.equipe} agentes
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={`text-white text-sm py-1 px-3 ${getStatusBadge(
                        operacao.status
                      )}`}
                    >
                      {operacao.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {operacao.descricao}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <span className="text-sm text-gray-800 font-medium">
                      <strong>Resultado:</strong> {operacao.resultado}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold transition-all duration-300"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Card className="border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl border-2">
              <CardContent className="p-8">
                <h3 className="text-xl md:text-2xl font-bold mb-3 font-bebas tracking-wide">
                  PARTICIPE DAS OPERAÇÕES
                </h3>
                <p className="opacity-90 mb-4 max-w-2xl mx-auto leading-relaxed text-sm">
                  Junte-se à nossa equipe e faça parte das operações de proteção
                  e segurança. Sua contribuição pode fazer a diferença.
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
        </div>
      </section>
    </div>
  );
}
