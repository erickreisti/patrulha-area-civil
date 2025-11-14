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
  FaBook,
  FaDownload,
  FaFileAlt,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import Link from "next/link";

const regulamentos = [
  {
    titulo: "Regulamento Interno da PAC",
    descricao: "Normas e procedimentos internos da Patrulha Aérea Civil",
    versao: "2.1",
    data: "15/03/2024",
    categoria: "Administrativo",
  },
  {
    titulo: "Manual de Procedimentos Operacionais",
    descricao: "Procedimentos padrão para operações de busca e resgate",
    versao: "3.0",
    data: "01/02/2024",
    categoria: "Operacional",
  },
  {
    titulo: "Código de Conduta e Ética",
    descricao: "Normas de conduta e princípios éticos dos membros da PAC",
    versao: "1.5",
    data: "10/01/2024",
    categoria: "Ético",
  },
  {
    titulo: "Protocolo de Segurança Operacional",
    descricao: "Medidas de segurança para todas as operações",
    versao: "2.2",
    data: "20/12/2023",
    categoria: "Segurança",
  },
  {
    titulo: "Manual de Treinamento Básico",
    descricao: "Programa de treinamento para novos voluntários",
    versao: "4.0",
    data: "05/11/2023",
    categoria: "Treinamento",
  },
  {
    titulo: "Procedimentos de Emergência Médica",
    descricao: "Protocolos para atendimento médico de emergência",
    versao: "3.1",
    data: "15/10/2023",
    categoria: "Médico",
  },
];

const RegulamentoCard = ({
  regulamento,
  index,
}: {
  regulamento: (typeof regulamentos)[0];
  index: number;
}) => (
  <Card
    key={index}
    className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <CardTitle className="text-gray-800 text-lg font-bebas tracking-wide">
                {regulamento.titulo}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                {regulamento.descricao}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              v{regulamento.versao}
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FaFileAlt className="h-4 w-4" />
              <span>{regulamento.data}</span>
            </div>
            <Badge variant="outline" className="border-blue-600 text-blue-600">
              {regulamento.categoria}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <FaFileAlt className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FaDownload className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function RegulamentosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaBook className="w-4 h-4 mr-2" />
              Documentos Internos
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              <span className="text-blue-400">REGULAMENTOS</span> INTERNOS
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Documentos e procedimentos internos da Patrulha Aérea Civil
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

          {/* Acesso Restrito */}
          <Card className="border-blue-200 bg-blue-50 shadow-lg mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-600 text-lg font-bebas tracking-wide flex items-center">
                <FaShieldAlt className="h-5 w-5 mr-2" />
                ACESSO RESTRITO
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                Alguns documentos podem ter acesso restrito a membros
                autorizados da PAC
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Regulamentos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {regulamentos.map((regulamento, index) => (
              <RegulamentoCard
                key={index}
                regulamento={regulamento}
                index={index}
              />
            ))}
          </div>

          {/* Membros Section */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800 text-lg font-bebas tracking-wide flex items-center">
                <FaUsers className="h-5 w-5 mr-2" />
                PARA MEMBROS DA PAC
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                Membros ativos da Patrulha Aérea Civil têm acesso a documentos
                adicionais através do sistema interno.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105"
              >
                <Link href="/login">Acessar Sistema Interno</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
