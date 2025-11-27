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
  FaBalanceScale,
  FaFileAlt,
  FaBook,
  FaArrowRight,
  FaDownload,
} from "react-icons/fa";
import Link from "next/link";

const legislacaoCategorias = [
  {
    icon: FaBalanceScale,
    title: "Leis Federais",
    description:
      "Leis que regulamentam o serviço de emergência e resgate no Brasil",
    count: "8 Leis",
    href: "/servicos/legislacao/leis",
    features: ["Lei do SAMU", "Lei de Emergências", "Lei do Voluntariado"],
  },
  {
    icon: FaFileAlt,
    title: "Decretos",
    description: "Decretos e portarias que complementam a legislação principal",
    count: "12 Decretos",
    href: "/servicos/legislacao/decretos",
    features: [
      "Decretos Estaduais",
      "Portarias Ministeriais",
      "Normas Técnicas",
    ],
  },
  {
    icon: FaBook,
    title: "Regulamentos",
    description: "Regulamentos internos e procedimentos operacionais da PAC",
    count: "15 Documentos",
    href: "/servicos/legislacao/regulamentos",
    features: ["Regulamento Interno", "Procedimentos OP", "Código de Conduta"],
  },
];

const leisPrincipais = [
  {
    numero: "Lei 13.425/2017",
    titulo: "Política Nacional de Proteção e Defesa Civil",
    descricao: "Dispõe sobre o Sistema Nacional de Proteção e Defesa Civil",
  },
  {
    numero: "Lei 12.608/2012",
    titulo: "Política Nacional de Proteção e Defesa Civil",
    descricao: "Institui a Política Nacional de Proteção e Defesa Civil",
  },
  {
    numero: "Lei 9.608/1998",
    titulo: "Lei do Voluntariado",
    descricao: "Dispõe sobre o serviço voluntário e sua regulamentação",
  },
];

const ServiceCard = ({
  service,
}: {
  service: (typeof legislacaoCategorias)[0];
}) => {
  const IconComponent = service.icon;

  return (
    <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <IconComponent className="h-10 w-10 text-blue-600 mb-3" />
        <CardTitle className="text-gray-800 text-lg font-bebas tracking-wide">
          {service.title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-4">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-gray-600 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
              {feature}
            </li>
          ))}
        </ul>
        <Button
          asChild
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105"
        >
          <Link href={service.href}>
            Acessar <FaArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default function LegislacaoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaBalanceScale className="w-4 h-4 mr-2" />
              Base Legal
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              <span className="text-blue-400">LEGISLAÇÃO</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Conheça a base legal que rege as operações da Patrulha Aérea Civil
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {legislacaoCategorias.map((service) => (
              <ServiceCard key={service.title} service={service} />
            ))}
          </div>

          {/* Leis Principais */}
          <Card className="border-gray-200 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                LEIS PRINCIPAIS
              </CardTitle>
              <CardDescription className="text-gray-600">
                Legislação federal mais relevante para nossas operações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leisPrincipais.map((lei, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge
                          variant="default"
                          className="bg-blue-600 text-white"
                        >
                          {lei.numero}
                        </Badge>
                        <h3 className="font-semibold text-gray-800">
                          {lei.titulo}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm">{lei.descricao}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <FaDownload className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-bebas tracking-wide">
              CONSULTORIA JURÍDICA
            </h2>
            <p className="text-lg mb-6 text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Precisa de orientação sobre aspectos legais das operações de
              resgate e emergência?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-800 font-semibold transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/contato">Consultar Jurídico</Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-800 hover:bg-white/90 font-semibold transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/servicos">Voltar aos Serviços</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
