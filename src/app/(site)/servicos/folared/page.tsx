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
  FaShieldAlt,
  FaUsers,
  FaGlobe,
  FaBullseye,
} from "react-icons/fa";
import Link from "next/link";

export default function FolaredPage() {
  const beneficios = [
    {
      icon: FaGlobe,
      title: "Cooperação Internacional",
      description: "Integração entre países",
    },
    {
      icon: FaUsers,
      title: "Troca de Experiências",
      description: "Conhecimento compartilhado",
    },
    {
      icon: FaBullseye,
      title: "Capacitação Contínua",
      description: "Aperfeiçoamento constante",
    },
    {
      icon: FaShieldAlt,
      title: "Padrões Regionais",
      description: "Protocolos unificados",
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
              <FaGlobe className="w-4 h-4 mr-2" />
              Cooperação Internacional
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              <span className="text-blue-400">FOLARED</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Federação de Organismos Latino Americanos de Resposta a
              Emergências e Desastres
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
                    SOBRE A FOLARED
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    A Patrulha Aérea Civil faz parte do maior grupo de socorro
                    da América Latina - FOLARED (Federação de Organismos Latino
                    Americanos de Resposta a Emergências e Desastres).
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    A FOLARED foi criada pelas organizações de mais vasto
                    conhecimento em área de socorro e resgate nos países da
                    América Latina, unindo esforços para melhor atender às
                    emergências e desastres na região.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Nos orgulhamos em trocar experiências com nossos irmãos das
                    áreas de resgates, buscando sempre o aperfeiçoamento para
                    melhor servir às comunidades.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                    BENEFÍCIOS DA COOPERAÇÃO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {beneficios.map((beneficio, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <beneficio.icon className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {beneficio.title}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {beneficio.description}
                          </p>
                        </div>
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
                    NOSSA PARTICIPAÇÃO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Integração
                    </p>
                    <p className="text-gray-600 text-xs">
                      Rede latino-americana
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Capacitação
                    </p>
                    <p className="text-gray-600 text-xs">
                      Treinamentos conjuntos
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Padronização
                    </p>
                    <p className="text-gray-600 text-xs">
                      Protocolos unificados
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-600 text-lg font-bebas tracking-wide">
                    MAIS INFORMAÇÕES
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Saiba mais sobre a cooperação internacional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105">
                    Contatar FOLARED
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
