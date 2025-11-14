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
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaExclamationTriangle,
  FaArrowLeft,
  FaBullseye,
} from "react-icons/fa";
import Link from "next/link";

export default function CalendarioPage() {
  const eventos = [
    {
      id: 1,
      titulo: "Treinamento de Resgate em Altura",
      tipo: "Treinamento",
      data: "2024-02-15",
      hora: "08:00 - 17:00",
      local: "Base Central - São Paulo",
      instrutor: "Cap. Silva",
      vagas: 20,
      inscritos: 15,
      status: "Inscrições Abertas",
      descricao:
        "Treinamento avançado de técnicas de resgate em altura para situações de emergência.",
    },
    {
      id: 2,
      titulo: "Operação Carnaval Seguro",
      tipo: "Operação",
      data: "2024-02-10",
      hora: "18:00 - 06:00",
      local: "Centro da Cidade",
      responsavel: "Ten. Oliveira",
      equipe: 25,
      status: "Confirmada",
      descricao:
        "Operação especial de segurança durante os festejos de carnaval.",
    },
    {
      id: 3,
      titulo: "Palestra Primeiros Socorros",
      tipo: "Educação",
      data: "2024-02-08",
      hora: "19:00 - 21:00",
      local: "Auditório Principal",
      palestrante: "Dr. Costa",
      vagas: 50,
      inscritos: 42,
      status: "Inscrições Abertas",
      descricao:
        "Palestra aberta ao público sobre técnicas básicas de primeiros socorros.",
    },
  ];

  const meses = [
    { mes: "Fevereiro 2024", eventos: 8 },
    { mes: "Março 2024", eventos: 12 },
    { mes: "Abril 2024", eventos: 6 },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      "Inscrições Abertas": "bg-emerald-500 hover:bg-emerald-600",
      Confirmada: "bg-navy-light hover:bg-navy",
      Agendada: "bg-amber-500 hover:bg-amber-600",
      Cancelada: "bg-red-500 hover:bg-red-600",
    };
    return variants[status as keyof typeof variants] || "bg-gray-600";
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      Treinamento: "bg-purple-500 hover:bg-purple-600",
      Operação: "bg-red-500 hover:bg-red-600",
      Educação: "bg-emerald-500 hover:bg-emerald-600",
      Manutenção: "bg-amber-500 hover:bg-amber-600",
      Reunião: "bg-blue-500 hover:bg-blue-600",
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
              <FaCalendarAlt className="w-4 h-4 mr-2" />
              Agenda de Atividades
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-bebas tracking-wide">
              CALENDÁRIO DE ATIVIDADES
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl leading-relaxed">
              Acompanhe nossa agenda de operações, treinamentos, eventos e
              atividades programadas.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-20 bg-white -mt-2 relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Overview */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-gray-200 shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bebas tracking-wide">
                    <FaCalendarAlt className="h-5 w-5 text-navy-light" />
                    Visão Geral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Eventos Este Mês",
                      value: "8",
                      color: "text-navy-light",
                      bg: "bg-navy-light/10",
                    },
                    {
                      label: "Treinamentos",
                      value: "3",
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "Operações",
                      value: "2",
                      color: "text-red-600",
                      bg: "bg-red-50",
                    },
                    {
                      label: "Vagas Disponíveis",
                      value: "13",
                      color: "text-purple-600",
                      bg: "bg-purple-50",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-4 ${item.bg} rounded-xl hover-lift transition-all duration-300`}
                    >
                      <span className="text-slate font-medium">
                        {item.label}
                      </span>
                      <span
                        className={`text-2xl font-bold ${item.color} font-bebas tracking-wide`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bebas tracking-wide">
                    Próximos Meses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {meses.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-offwhite rounded-xl hover:bg-gray-100 transition-all duration-300"
                    >
                      <span className="text-slate font-medium">{item.mes}</span>
                      <Badge variant="default">{item.eventos} eventos</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bebas tracking-wide">
                    <FaExclamationTriangle className="h-5 w-5 text-amber-500" />
                    Lembretes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-gray-600">
                    <p>• Inscrições abertas para treinamento de resgate</p>
                    <p>• Operação Carnaval - confirmar presença</p>
                    <p>• Palestra primeiros socorros - vagas limitadas</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Eventos */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-slate mb-4 sm:mb-0">
                  EVENTOS DE FEVEREIRO 2024
                </h2>
                <Button
                  variant="outline"
                  className="border-2 border-navy-light text-navy-light hover:bg-navy-light hover:text-white font-bold transition-all duration-300"
                >
                  <FaCalendarAlt className="h-5 w-5 mr-2" />
                  Adicionar ao Google Calendar
                </Button>
              </div>

              <div className="space-y-6">
                {eventos.map((evento) => (
                  <Card
                    key={evento.id}
                    className="border-gray-200 shadow-xl hover-lift border-2"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-2xl flex items-center gap-3 mb-3 font-bebas tracking-wide">
                            {evento.titulo}
                            <Badge className={getTipoBadge(evento.tipo)}>
                              {evento.tipo}
                            </Badge>
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-base text-gray-600">
                            <span className="flex items-center gap-2">
                              <FaCalendarAlt className="h-5 w-5" />
                              {new Date(evento.data).toLocaleDateString(
                                "pt-BR",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            <span className="flex items-center gap-2">
                              <FaClock className="h-5 w-5" />
                              {evento.hora}
                            </span>
                            <span className="flex items-center gap-2">
                              <FaMapMarkerAlt className="h-5 w-5" />
                              {evento.local}
                            </span>
                            {"vagas" in evento && (
                              <span className="flex items-center gap-2">
                                <FaUsers className="h-5 w-5" />
                                {evento.inscritos}/{evento.vagas} vagas
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={`text-white text-lg py-2 px-4 ${getStatusBadge(evento.status)}`}
                        >
                          {evento.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-gray-600 text-lg leading-relaxed mb-3">
                            {evento.descricao}
                          </p>
                          <div className="text-slate font-medium">
                            {"instrutor" in evento &&
                              `Instrutor: ${evento.instrutor}`}
                            {"responsavel" in evento &&
                              `Responsável: ${evento.responsavel}`}
                            {"palestrante" in evento &&
                              `Palestrante: ${evento.palestrante}`}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {evento.status === "Inscrições Abertas" && (
                            <Button
                              size="lg"
                              className="bg-navy-light hover:bg-navy text-white font-bold transition-all duration-300 hover:scale-105"
                            >
                              Inscrever-se
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="lg"
                            className="border-2 border-navy-light text-navy-light hover:bg-navy-light hover:text-white font-bold transition-all duration-300"
                          >
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA Section */}
              <Card className="mt-12 bg-gradient-to-r from-navy-light to-navy text-white shadow-2xl border-2 border-navy-light">
                <CardContent className="p-12 text-center">
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 font-bebas tracking-wide">
                    PARTICIPE DOS NOSSOS EVENTOS
                  </h3>
                  <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Quer participar de nossos treinamentos e eventos? Entre em
                    contato e saiba como se tornar um voluntário ou parceiro da
                    PAC.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white text-navy-light hover:bg-offwhite font-bold py-4 px-8 text-lg transition-all duration-300 hover:scale-105 shadow-xl"
                    >
                      <FaUsers className="mr-3 h-5 w-5" />
                      Tornar-se Voluntário
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-white border-white hover:bg-white hover:text-navy-light font-bold py-4 px-8 text-lg transition-all duration-300 hover:scale-105"
                    >
                      Entrar em Contato
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
