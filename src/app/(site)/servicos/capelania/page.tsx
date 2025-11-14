import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaArrowLeft, FaCross, FaHeart, FaUsers, FaBook } from "react-icons/fa";
import Link from "next/link";

export default function CapelaniaPage() {
  const servicos = [
    "Atendimento diário diuturnamente leito a leito",
    "Cultos com pacientes e familiares e servidores",
    "Aconselhamento bíblico e estudos bíblicos",
    "Atendimento psicológico aos familiares",
    "Aconselhamento aos pacientes terminais",
    "Programação especial em datas comemorativas",
    "Palestras para profissionais voluntários",
  ];

  const apoioEspiritual = [
    {
      icon: FaCross,
      title: "Assistência Religiosa",
      description: "Conforme Constituição",
    },
    {
      icon: FaUsers,
      title: "Aconselhamento",
      description: "Pacientes e familiares",
    },
    {
      icon: FaBook,
      title: "Estudos Bíblicos",
      description: "Formação espiritual",
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
              <FaCross className="w-4 h-4 mr-2" />
              Serviço de Assistência
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              SERVIÇO DE <span className="text-blue-400">CAPELANIA</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Assistência religiosa e apoio espiritual para pacientes e
              familiares
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link
                href="/servicos"
                className="flex items-center text-blue-600"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Serviços
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                    SOBRE A CAPELANIA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    A Capelania é a assistência religiosa prestada por Ministro
                    religioso garantido por lei em entidades civis e militares
                    de internação coletiva, conforme dispositivo previsto na
                    Constituição Brasileira de 1988.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    É uma atividade cuja missão é colaborar na formação integral
                    do ser humano, oferecendo oportunidades de conhecimento,
                    reflexão, desenvolvimento e aplicação dos valores e
                    princípios ético-cristãos.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                    SERVIÇOS PRESTADOS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {servicos.map((servico, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <FaHeart className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-gray-600 text-sm">{servico}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-lg font-bebas tracking-wide">
                    APOIO ESPIRITUAL
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apoioEspiritual.map((apoio, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <apoio.icon className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {apoio.title}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {apoio.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-600 text-lg font-bebas tracking-wide">
                    PRECISA DE APOIO?
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Entre em contato para assistência espiritual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105">
                    Solicitar Capelania
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
