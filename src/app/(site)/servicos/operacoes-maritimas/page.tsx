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
  FaArrowLeft,
  FaShip,
  FaShieldAlt,
  FaBullseye,
  FaAnchor,
} from "react-icons/fa";
import Link from "next/link";

export default function OperacoesMaritimasPage() {
  const operacoes = [
    "Incêndios em Embarcações",
    "Acidentes com Naufrágios",
    "Afogamentos e Resgate Aquático",
    "Busca e Resgate Subaquáticos",
    "Recuperação de Objetos Submersos",
    "Desobstrução Submarina",
    "Operações de Mergulho",
    "Suporte a Embarcações",
  ];

  const especialidades = [
    {
      icon: FaShip,
      title: "Operações Navais",
      description: "Emergências em embarcações",
    },
    {
      icon: FaAnchor,
      title: "Mergulho",
      description: "Resgate e recuperação",
    },
    {
      icon: FaShieldAlt,
      title: "Resgate Aquático",
      description: "Afogamentos e emergências",
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
              <FaShip className="w-4 h-4 mr-2" />
              Grupamento Marítimo
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              OPERAÇÕES <span className="text-blue-400">MARÍTIMAS</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Especialistas em busca, resgate e salvamento em ambientes
              aquáticos
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
                    MISSÃO DO GRUPAMENTO MARÍTIMO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    O Grupamento Marítimo tem como missão operar em situações de
                    Busca, Resgate e Salvamento em ambientes líquidos, possuindo
                    em seu quadro especialistas em operações navais e de
                    mergulho.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Nossa equipe está preparada para atuar em diversas situações
                    marítimas, desde emergências em embarcações até operações de
                    resgate subaquático.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                    OPERAÇÕES ESPECIALIZADAS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {operacoes.map((operacao, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <FaBullseye className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600 text-sm">
                          {operacao}
                        </span>
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
                    ESPECIALIDADES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {especialidades.map((especialidade, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <especialidade.icon className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {especialidade.title}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {especialidade.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-600 text-lg font-bebas tracking-wide">
                    EMERGÊNCIA MARÍTIMA?
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Para situações de emergência em ambientes aquáticos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105">
                    Acionar Resgate Marítimo
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
