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
  FaTree,
  FaShieldAlt,
  FaUsers,
  FaBullseye,
} from "react-icons/fa";
import Link from "next/link";

export default function OperacoesAmbientaisPage() {
  const treinamentos = [
    "APH (Atendimento Pré-Hospitalar)",
    "RCP (Reanimação Cardiopulmonar)",
    "Ofidismo",
    "Treinamento Físico",
    "Ordem Unida",
    "Orientação na Mata com Bússola",
    "Cartas Topográficas",
    "Resgate em Áreas de Difícil Acesso",
    "Alfabético Fonético Mundial",
    "Sobrevivência",
    "Noções de Antiterrorismo",
    "Balizamento de Aeronaves",
    "ZPH (Zona de Pouso de Helicóptero)",
    "Rappel",
    "Busca e Salvamento em Ambientes de Selva",
  ];

  const capacidades = [
    {
      icon: FaShieldAlt,
      title: "Combate a Incêndios",
      description: "Florestais e urbanos",
    },
    {
      icon: FaUsers,
      title: "Resgate em Matas",
      description: "Áreas de difícil acesso",
    },
    {
      icon: FaTree,
      title: "Operações Táticas",
      description: "Ambientes hostis",
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
              <FaTree className="w-4 h-4 mr-2" />
              Grupamento Especializado
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              OPERAÇÕES <span className="text-blue-400">AMBIENTAIS</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Especialistas em busca, resgate e salvamento em ambientes naturais
              e áreas de difícil acesso
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
                    SOBRE O GRUPAMENTO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    O Grupamento de Operações Ambientais da PAC é composto por
                    integrantes com conhecimento especializado nas áreas
                    táticas, busca, resgate e salvamentos, combate a incêndio,
                    além de serem condicionados para o deslocamento em áreas de
                    matas fechadas e locais de difícil acesso em ambientes
                    hostis.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Nossos profissionais estão em constante treinamento para
                    aperfeiçoamento, garantindo a mais alta qualidade nos
                    serviços prestados à comunidade.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                    TREINAMENTOS ESPECIALIZADOS
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Nossos integrantes possuem formação completa em diversas
                    áreas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {treinamentos.map((treinamento, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <FaBullseye className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600 text-sm">
                          {treinamento}
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
                    CAPACIDADES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {capacidades.map((capacidade, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <capacidade.icon className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {capacidade.title}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {capacidade.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-600 text-lg font-bebas tracking-wide">
                    EMERGÊNCIA AMBIENTAL?
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Para situações de emergência em ambientes naturais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105">
                    Acionar Resgate
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
