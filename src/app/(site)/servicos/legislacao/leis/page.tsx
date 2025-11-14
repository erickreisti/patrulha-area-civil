import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FaArrowLeft,
  FaBalanceScale,
  FaDownload,
  FaFileAlt,
  FaCalendar,
} from "react-icons/fa";
import Link from "next/link";

const leis = [
  {
    numero: "Lei 13.425/2017",
    titulo: "Política Nacional de Proteção e Defesa Civil",
    descricao: "Dispõe sobre o Sistema Nacional de Proteção e Defesa Civil",
    data: "30/03/2017",
    categoria: "Federal",
  },
  {
    numero: "Lei 12.608/2012",
    titulo: "Política Nacional de Proteção e Defesa Civil",
    descricao: "Institui a Política Nacional de Proteção e Defesa Civil",
    data: "10/04/2012",
    categoria: "Federal",
  },
  {
    numero: "Lei 9.608/1998",
    titulo: "Lei do Serviço Voluntário",
    descricao: "Dispõe sobre o serviço voluntário e sua regulamentação",
    data: "18/02/1998",
    categoria: "Federal",
  },
  {
    numero: "Lei 8.080/1990",
    titulo: "Lei Orgânica da Saúde",
    descricao:
      "Dispõe sobre as condições para a promoção, proteção e recuperação da saúde",
    data: "19/09/1990",
    categoria: "Federal",
  },
];

const LeiCard = ({ lei, index }: { lei: (typeof leis)[0]; index: number }) => (
  <Card
    key={index}
    className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <FaBalanceScale className="h-5 w-5 text-blue-600" />
            <Badge variant="default" className="bg-blue-600 text-white">
              {lei.numero}
            </Badge>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <FaCalendar className="h-4 w-4" />
              <span>{lei.data}</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {lei.titulo}
          </h3>
          <p className="text-gray-600 mb-3">{lei.descricao}</p>
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            {lei.categoria}
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

export default function LeisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaBalanceScale className="w-4 h-4 mr-2" />
              Legislação Federal
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              <span className="text-blue-400">LEIS</span> FEDERAIS
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Legislação federal que rege as operações de emergência e resgate
              no Brasil
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

          <div className="space-y-6">
            {leis.map((lei, index) => (
              <LeiCard key={index} lei={lei} index={index} />
            ))}
          </div>

          {/* Aviso Legal */}
          <Card className="border-blue-200 bg-blue-50 shadow-lg mt-8">
            <CardContent className="p-6">
              <h3 className="text-blue-600 text-lg font-bebas tracking-wide mb-2">
                AVISO LEGAL
              </h3>
              <p className="text-gray-600 text-sm">
                As leis disponibilizadas aqui são para consulta e referência.
                Para questões jurídicas específicas, consulte um advogado.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
