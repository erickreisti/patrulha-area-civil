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
  FaUsers,
  FaShieldAlt,
  FaBook,
  FaHeart,
  FaBullseye,
} from "react-icons/fa";
import Link from "next/link";

export default function PatrulheiroMirimPage() {
  const atividades = [
    "Atendimento educativo e disciplinar",
    "Apoio pedagógico e psicológico",
    "Institucional e sócio familiar",
    "Despertar patriotismo e dever cívico",
    "Ensino de hierarquia e disciplina",
    "Preservação do meio ambiente",
    "Práticas de sustentabilidade",
    "Atividades esportivas",
    "Primeiros socorros básicos",
  ];

  const parceiros = [
    "Governos Estaduais e Municipais",
    "Conselhos Tutelares",
    "Secretárias de Ação Social",
    "Delegacias das Juntas Militares",
    "Instituições Privadas",
    "Subprefeituras Regionais",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaUsers className="w-4 h-4 mr-2" />
              Projeto Social
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              PATRULHEIRO <span className="text-blue-400">MIRIM</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Projeto educativo e disciplinar para jovens de 14 a 18 anos
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
                    SOBRE O PROJETO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    O Grupamento de Patrulheiro Mirim da PAC - CIERJ tem como
                    missão proporcionar atendimento educativo, disciplinar,
                    pedagógico, psicológico, institucional e sócio familiar a
                    crianças com idade entre 14 a 18 anos.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    O projeto desperta o patriotismo e o dever cívico e moral
                    dos jovens, ensinando os pilares da hierarquia e da
                    disciplina e a consciência da preservação do meio ambiente
                    através de práticas de sustentabilidade.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                    ATIVIDADES DESENVOLVIDAS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {atividades.map((atividade, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <FaBullseye className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600 text-sm">
                          {atividade}
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
                    PARCEIROS
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Instituições que apoiam o projeto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {parceiros.map((parceiro, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">{parceiro}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-600 text-lg font-bebas tracking-wide">
                    QUER PARTICIPAR?
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Entre em contato para inscrever jovens no projeto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105">
                    Inscrever no Projeto
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
