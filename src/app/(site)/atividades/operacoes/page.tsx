import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import Link from "next/link";

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
      "Em Andamento": "bg-navy-light hover:bg-navy",
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
    <div className="min-h-screen bg-gradient-to-b from-slate to-offwhite">
      {/* Hero Section */}
      <section className="relative bg-slate text-white pt-40 pb-24">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-8">
              <Link
                href="/atividades"
                className="flex items-center text-navy-light hover:text-white transition-colors"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Atividades
              </Link>
            </Button>

            <Badge className="mb-8 bg-navy-light hover:bg-navy text-white border-none text-sm py-2 px-4">
              <FaBullseye className="w-4 h-4 mr-2" />
              Operações em Tempo Real
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-bebas tracking-wide">
              OPERAÇÕES DA PAC
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl leading-relaxed">
              Acompanhe nossas operações em tempo real e o histórico de ações
              realizadas em prol da segurança e proteção ambiental.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-20 bg-white -mt-2 relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
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
                  className="border-gray-200 shadow-xl border-2 text-center hover-lift"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-5 w-5 text-navy-light" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate mb-2 font-bebas tracking-wide">
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-600">{stat.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Operações List */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-slate mb-6">
              OPERAÇÕES EM DESTAQUE
            </h2>
            <div className="w-32 h-1.5 bg-navy-light mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-8">
            {operacoes.map((operacao) => (
              <Card
                key={operacao.id}
                className="border-gray-200 shadow-xl hover-lift border-2"
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl flex items-center gap-3 mb-3 font-bebas tracking-wide">
                        {operacao.titulo}
                        <Badge className={getTipoBadge(operacao.tipo)}>
                          {operacao.tipo}
                        </Badge>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-base text-gray-600 mt-2">
                        <span className="flex items-center gap-2">
                          <FaCalendar className="h-5 w-5" />
                          {new Date(operacao.data).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-2">
                          <FaMapMarkerAlt className="h-5 w-5" />
                          {operacao.local}
                        </span>
                        <span className="flex items-center gap-2">
                          <FaUsers className="h-5 w-5" />
                          {operacao.equipe} agentes
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={`text-white text-lg py-2 px-4 ${getStatusBadge(operacao.status)}`}
                    >
                      {operacao.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {operacao.descricao}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-lg text-slate font-medium">
                      <strong>Resultado:</strong> {operacao.resultado}
                    </span>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-navy-light text-navy-light hover:bg-navy-light hover:text-white font-bold transition-all duration-300"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-r from-navy-light to-navy text-white shadow-2xl border-2 border-navy-light">
              <CardContent className="p-12">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 font-bebas tracking-wide">
                  PARTICIPE DAS OPERAÇÕES
                </h3>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Junte-se à nossa equipe e faça parte das operações de proteção
                  e segurança. Sua contribuição pode fazer a diferença.
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-navy-light hover:bg-offwhite font-bold py-4 px-12 text-lg transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  <FaUsers className="mr-3 h-5 w-5" />
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
