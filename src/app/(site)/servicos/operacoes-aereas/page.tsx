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
  FaPlane,
  FaShieldAlt,
  FaUsers,
  FaBullseye,
  FaHeart,
} from "react-icons/fa";
import Link from "next/link";

export default function OperacoesAereasPage() {
  const capacidades = [
    "Busca, Resgate e Salvamento",
    "Orientação e Busca Aérea",
    "Embarque e Desembarque em Movimento",
    "Fast Rope (Rapel Rápido)",
    "Combate a Incêndio Aéreo",
    "Operações Helitransportadas",
    "Sobrevivência no Mar",
    "Sobrevivência na Selva",
    "Socorro Pré-Hospitalar Militar",
  ];

  const especialidades = [
    {
      icon: FaPlane,
      title: "Asa Rotativa",
      description: "Helicópteros",
    },
    {
      icon: FaShieldAlt,
      title: "Asa Fixa",
      description: "Aviões",
    },
    {
      icon: FaHeart,
      title: "Socorro Médico",
      description: "Pré-hospitalar militar",
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
              <FaPlane className="w-4 h-4 mr-2" />
              Grupamento Aéreo
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              OPERAÇÕES <span className="text-blue-400">AÉREAS</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Operações de resgate envolvendo aeronaves de asa rotativa e fixa
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
                    MISSÃO DO GRUPAMENTO AÉREO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    O Grupamento Aéreo tem como missão atuar em operações de
                    resgate envolvendo aeronaves a partir de asa rotativa e fixa
                    em operações de busca, resgate e salvamento.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Nossas equipes são especializadas em diversas técnicas
                    aéreas avançadas, garantindo respostas rápidas e eficazes em
                    situações de emergência.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                    CAPACIDADES OPERACIONAIS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {capacidades.map((capacidade, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <FaBullseye className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600 text-sm">
                          {capacidade}
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
                    EMERGÊNCIA AÉREA?
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Para situações que requerem resposta aérea
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105">
                    Acionar Resgate Aéreo
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
