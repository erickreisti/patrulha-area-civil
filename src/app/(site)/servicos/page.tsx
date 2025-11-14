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
  FaTree,
  FaMountain,
  FaPlane,
  FaShip,
  FaCross,
  FaUsers,
  FaShieldAlt,
  FaFileAlt,
  FaArrowRight,
  FaBullseye,
} from "react-icons/fa";
import Link from "next/link";

const SERVICES = [
  {
    icon: FaTree,
    title: "Operações Ambientais",
    description:
      "Busca, resgate e salvamento em ambientes naturais e áreas de difícil acesso",
    features: ["Combate a incêndios", "Resgate em matas", "Operações táticas"],
    href: "/servicos/operacoes-ambientais",
  },
  {
    icon: FaMountain,
    title: "Operações Terrestres",
    description: "Busca, resgate e salvamento em ambientes terrestres diversos",
    features: [
      "Incêndios florestais",
      "Áreas de difícil acesso",
      "Resgate em selva",
    ],
    href: "/servicos/operacoes-terrestres",
  },
  {
    icon: FaPlane,
    title: "Operações Aéreas",
    description:
      "Operações de resgate envolvendo aeronaves de asa rotativa e fixa",
    features: ["Busca e salvamento", "Fast rope", "Socorro pré-hospitalar"],
    href: "/servicos/operacoes-aereas",
  },
  {
    icon: FaShip,
    title: "Operações Marítimas",
    description: "Busca, resgate e salvamento em ambientes aquáticos",
    features: [
      "Operações navais",
      "Mergulho de resgate",
      "Recuperação subaquática",
    ],
    href: "/servicos/operacoes-maritimas",
  },
  {
    icon: FaCross,
    title: "Serviço de Capelania",
    description:
      "Assistência religiosa e apoio espiritual para pacientes e familiares",
    features: [
      "Atendimento leito a leito",
      "Aconselhamento",
      "Suporte psicológico",
    ],
    href: "/servicos/capelania",
  },
  {
    icon: FaUsers,
    title: "Patrulheiro Mirim",
    description: "Projeto educativo e disciplinar para jovens de 14 a 18 anos",
    features: [
      "Educação patriótica",
      "Primeiros socorros",
      "Atividades esportivas",
    ],
    href: "/servicos/patrulheiro-mirim",
  },
  {
    icon: FaShieldAlt,
    title: "FOLARED",
    description:
      "Federação de Organismos Latino Americanos de Resposta a Emergências",
    features: [
      "Cooperação internacional",
      "Troca de experiências",
      "Capacitação",
    ],
    href: "/servicos/folared",
  },
  {
    icon: FaFileAlt,
    title: "Legislação",
    description: "Base legal e normativa que rege nossas operações",
    features: ["Leis federais", "Decretos regulamentares", "Normas internas"],
    href: "/servicos/legislacao",
  },
];

const ServiceCard = ({ service }: { service: (typeof SERVICES)[0] }) => {
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
            Saiba Mais <FaArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default function ServicosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaBullseye className="w-4 h-4 mr-2" />
              Serviços Especializados
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              NOSSOS <span className="text-blue-400">SERVIÇOS</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Conheça todos os serviços especializados oferecidos pela Patrulha
              Aérea Civil e nossa base legal de atuação
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {SERVICES.map((service) => (
              <ServiceCard key={service.title} service={service} />
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-bebas tracking-wide">
              PRECISA DE NOSSOS SERVIÇOS?
            </h2>
            <p className="text-lg mb-6 text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Entre em contato conosco para saber mais sobre como podemos ajudar
              sua comunidade ou organização
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-800 font-semibold transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/contato">Solicitar Serviço</Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-800 hover:bg-white/90 font-semibold transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/servicos/legislacao">Conhecer a Legislação</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
