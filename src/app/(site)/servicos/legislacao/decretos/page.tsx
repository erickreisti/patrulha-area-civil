import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FaArrowLeft,
  FaFileAlt,
  FaDownload,
  FaCalendar,
  FaBuilding,
} from "react-icons/fa";
import Link from "next/link";

const decretos = [
  {
    numero: "Decreto 10.593/2021",
    titulo: "Regulamentação do SAMU",
    descricao: "Regulamenta o Serviço de Atendimento Móvel de Urgência",
    data: "22/01/2021",
    categoria: "Federal",
    orgão: "Presidência da República",
  },
  {
    numero: "Decreto 7.257/2010",
    titulo: "Sistema Nacional de Defesa Civil",
    descricao: "Dispõe sobre a organização do Sistema Nacional de Defesa Civil",
    data: "04/08/2010",
    categoria: "Federal",
    orgão: "Presidência da República",
  },
  {
    numero: "Decreto 9.760/2019",
    titulo: "Governo Digital",
    descricao: "Estabelece normas para governo digital no âmbito federal",
    data: "11/04/2019",
    categoria: "Federal",
    orgão: "Presidência da República",
  },
  {
    numero: "Portaria 2.048/2002",
    titulo: "Normas do SAMU",
    descricao:
      "Aprova as Normas Técnicas do Serviço de Atendimento Móvel de Urgência",
    data: "05/11/2002",
    categoria: "Ministerial",
    orgão: "Ministério da Saúde",
  },
];

const DecretoCard = ({
  decreto,
  index,
}: {
  decreto: (typeof decretos)[0];
  index: number;
}) => (
  <Card
    key={index}
    className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="default" className="bg-blue-600 text-white">
              {decreto.numero}
            </Badge>
            <div className="flex items-center space-x-1 text-gray-600 text-sm">
              <FaCalendar className="h-4 w-4" />
              <span>{decreto.data}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 text-sm">
              <FaBuilding className="h-4 w-4" />
              <span>{decreto.orgão}</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {decreto.titulo}
          </h3>
          <p className="text-gray-600 mb-3">{decreto.descricao}</p>
          <Badge variant="outline" className="border-blue-600 text-blue-600">
            {decreto.categoria}
          </Badge>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <FaFileAlt className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FaDownload className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DecretosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaFileAlt className="w-4 h-4 mr-2" />
              Legislação Complementar
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              <span className="text-blue-400">DECRETOS</span> E PORTARIAS
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Legislação complementar que regulamenta as operações de emergência
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
                href="/servicos/legislacao"
                className="flex items-center text-blue-600"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Legislação
              </Link>
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge
              variant="default"
              className="bg-blue-600 text-white cursor-pointer"
            >
              Todos
            </Badge>
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200"
            >
              Federal
            </Badge>
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200"
            >
              Ministerial
            </Badge>
          </div>

          <div className="space-y-6">
            {decretos.map((decreto, index) => (
              <DecretoCard key={index} decreto={decreto} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
