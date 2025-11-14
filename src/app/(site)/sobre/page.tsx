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
  FaShieldAlt,
  FaAward,
  FaHeart,
  FaUsers,
  FaMapMarkerAlt,
  FaGem,
  FaCrosshairs,
  FaEye,
  FaPlane,
} from "react-icons/fa";
import Link from "next/link";

export default function SobrePage() {
  const valores = [
    {
      icon: FaShieldAlt,
      title: "Segurança",
      description:
        "Priorizamos a segurança em todas as operações e treinamentos",
    },
    {
      icon: FaAward,
      title: "Excelência",
      description:
        "Buscamos a máxima qualidade em nossos serviços humanitários",
    },
    {
      icon: FaHeart,
      title: "Humanidade",
      description: "Agimos com compaixão e respeito em todas as situações",
    },
    {
      icon: FaUsers,
      title: "Trabalho em Equipe",
      description: "Valorizamos a colaboração e o espírito de união",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Compromisso Comunitário",
      description: "Servimos as comunidades com dedicação e responsabilidade",
    },
    {
      icon: FaGem,
      title: "Profissionalismo",
      description: "Atuamos com ética, competência e seriedade",
    },
  ];

  const estatisticas = [
    { numero: "50+", label: "Agentes Treinados" },
    { numero: "100+", label: "Operações Realizadas" },
    { numero: "24/7", label: "Prontidão" },
    { numero: "5", label: "Anos de Serviço" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaPlane className="w-4 h-4 mr-2" />
              Excelência em Serviço Humanitário
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              SOBRE A{" "}
              <span className="text-blue-400">PATRULHA AÉREA CIVIL</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Organização civil dedicada ao serviço aéreo humanitário, resgate e
              proteção civil. Conheça nossa missão, valores e o compromisso que
              nos move.
            </p>
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2">
              <CardHeader className="text-center pb-4 pt-6">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaCrosshairs className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                  MISSÃO
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 pb-6">
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  Promover a segurança aérea e terrestre através de serviços
                  voluntários, treinamentos especializados e operações de
                  resgate.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2">
              <CardHeader className="text-center pb-4 pt-6">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaEye className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                  VISÃO
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 pb-6">
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  Ser referência nacional em serviços aéreos humanitários,
                  reconhecida pela excelência e impacto positivo.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2">
              <CardHeader className="text-center pb-4 pt-6">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaGem className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                  VALORES
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 pb-6">
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  Segurança, Excelência, Humanidade, Trabalho em Equipe e
                  Profissionalismo.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {estatisticas.map((estatistica, index) => (
              <div
                key={index}
                className="text-center bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow duration-300 border border-gray-200"
              >
                <div className="text-2xl font-bold text-blue-600 mb-1 font-bebas tracking-wide">
                  {estatistica.numero}
                </div>
                <div className="text-gray-600 font-medium text-xs">
                  {estatistica.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* História */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-bebas tracking-wide">
              NOSSA HISTÓRIA
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Card className="border-gray-200 shadow-lg border-2">
                <CardContent className="p-6">
                  <p className="text-gray-600 leading-relaxed mb-3 text-sm">
                    A{" "}
                    <strong className="text-blue-600">
                      Patrulha Aérea Civil
                    </strong>{" "}
                    foi fundada com o propósito de unir a paixão pela aviação
                    civil ao serviço humanitário.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-3 text-sm">
                    Nossa trajetória é marcada por operações bem-sucedidas,
                    treinamentos especializados e um compromisso inabalável com
                    a segurança.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Acreditamos que a aviação civil pode ser uma poderosa
                    ferramenta de transformação social em todo o território
                    nacional.
                  </p>
                </CardContent>
              </Card>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 transition-all duration-300 hover:scale-105 shadow-lg"
                asChild
              >
                <Link href="/servicos">
                  Conhecer Nossos Serviços
                  <FaPlane className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <Card className="border-blue-600 bg-blue-600/5 border-2 shadow-xl">
              <CardContent className="p-8 text-center h-64 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-blue-600/[0.03] bg-[size:40px_40px]"></div>
                <div className="relative z-10">
                  <FaPlane className="h-12 w-12 mb-3 text-blue-600 opacity-25 mx-auto" />
                  <h3 className="text-xl font-bold mb-2 font-bebas tracking-wide text-blue-600">
                    SERVIÇO HUMANITÁRIO
                  </h3>
                  <p className="text-blue-600 text-sm">
                    Comprometidos com a excelência em operações aéreas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Valores Detalhados */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-bebas tracking-wide">
              NOSSOS VALORES
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-2 text-sm">
              Princípios que guiam cada decisão e ação da Patrulha Aérea Civil
            </p>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {valores.map((valor, index) => (
              <Card
                key={index}
                className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer h-full border-2"
              >
                <CardHeader className="text-center pb-3 pt-4">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors duration-300">
                    <valor.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-gray-800 text-lg font-bebas tracking-wide">
                    {valor.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-3 pb-4">
                  <CardDescription className="text-gray-600 text-xs leading-relaxed">
                    {valor.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-bebas tracking-wide">
            JUNTE-SE À NOSSA MISSÃO
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto leading-relaxed text-sm">
            Seja parte desta equipe dedicada ao serviço humanitário e à proteção
            civil
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 transition-all duration-300 hover:scale-105 shadow-xl"
              asChild
            >
              <Link href="/contato">
                Entre em Contato
                <FaUsers className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold py-2 px-6 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/atividades">Ver Atividades</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
