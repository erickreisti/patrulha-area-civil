"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";

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
      Confirmada: "bg-blue-600 hover:bg-blue-700",
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
              <FaCalendarAlt className="w-4 h-4 mr-2" />
              Agenda de Atividades
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              CALENDÁRIO DE ATIVIDADES
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl leading-relaxed">
              Acompanhe nossa agenda de operações, treinamentos, eventos e
              atividades programadas.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Overview */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="border-gray-200 shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bebas tracking-wide">
                    <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                    Visão Geral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "Eventos Este Mês",
                      value: "8",
                      color: "text-blue-600",
                      bg: "bg-blue-600/10",
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
                      className={`flex justify-between items-center p-3 ${item.bg} rounded-lg hover:shadow-md transition-all duration-300`}
                    >
                      <span className="text-gray-800 text-sm font-medium">
                        {item.label}
                      </span>
                      <span
                        className={`text-lg font-bold ${item.color} font-bebas tracking-wide`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bebas tracking-wide">
                    Próximos Meses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {meses.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                    >
                      <span className="text-gray-800 text-sm font-medium">
                        {item.mes}
                      </span>
                      <Badge variant="default" className="text-xs">
                        {item.eventos} eventos
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bebas tracking-wide">
                    <FaExclamationTriangle className="h-5 w-5 text-amber-500" />
                    Lembretes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-gray-600 text-sm">
                    <p>• Inscrições abertas para treinamento de resgate</p>
                    <p>• Operação Carnaval - confirmar presença</p>
                    <p>• Palestra primeiros socorros - vagas limitadas</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Eventos */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bebas tracking-wide text-gray-800 mb-3 sm:mb-0">
                  EVENTOS DE FEVEREIRO 2024
                </h2>
                <Button
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold transition-all duration-300 text-sm"
                >
                  <FaCalendarAlt className="h-4 w-4 mr-1" />
                  Adicionar ao Google Calendar
                </Button>
              </div>

              <div className="space-y-4">
                {eventos.map((evento) => (
                  <Card
                    key={evento.id}
                    className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 border-2"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2 mb-2 font-bebas tracking-wide">
                            {evento.titulo}
                            <Badge
                              className={`text-xs ${getTipoBadge(evento.tipo)}`}
                            >
                              {evento.tipo}
                            </Badge>
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="h-4 w-4" />
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
                            <span className="flex items-center gap-1">
                              <FaClock className="h-4 w-4" />
                              {evento.hora}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="h-4 w-4" />
                              {evento.local}
                            </span>
                            {"vagas" in evento && (
                              <span className="flex items-center gap-1">
                                <FaUsers className="h-4 w-4" />
                                {evento.inscritos}/{evento.vagas} vagas
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={`text-white text-sm py-1 px-3 ${getStatusBadge(
                            evento.status
                          )}`}
                        >
                          {evento.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-gray-600 text-sm leading-relaxed mb-2">
                            {evento.descricao}
                          </p>
                          <div className="text-gray-800 text-sm font-medium">
                            {"instrutor" in evento &&
                              `Instrutor: ${evento.instrutor}`}
                            {"responsavel" in evento &&
                              `Responsável: ${evento.responsavel}`}
                            {"palestrante" in evento &&
                              `Palestrante: ${evento.palestrante}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {evento.status === "Inscrições Abertas" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105"
                            >
                              Inscrever-se
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold transition-all duration-300"
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
              <Card className="mt-8 border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl border-2">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 font-bebas tracking-wide">
                    PARTICIPE DOS NOSSOS EVENTOS
                  </h3>
                  <p className="opacity-90 mb-4 max-w-2xl mx-auto leading-relaxed text-sm">
                    Quer participar de nossos treinamentos e eventos? Entre em
                    contato e saiba como se tornar um voluntário ou parceiro da
                    PAC.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-2 px-4 transition-all duration-300 hover:scale-105 shadow-xl"
                    >
                      <FaUsers className="mr-2 h-4 w-4" />
                      Tornar-se Voluntário
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white hover:bg-white hover:text-blue-600 font-semibold py-2 px-4 transition-all duration-300 hover:scale-105"
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
