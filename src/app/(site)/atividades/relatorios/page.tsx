import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaDownload,
  FaFileAlt,
  FaChartBar,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaArrowLeft,
  FaBullseye,
  FaCertificate,
} from "react-icons/fa";
import Link from "next/link";

export default function RelatoriosPage() {
  const relatorios = [
    {
      id: 1,
      titulo: "Relatório Anual 2023",
      tipo: "Anual",
      periodo: "2023",
      data: "2024-01-10",
      arquivo: "relatorio-anual-2023.pdf",
      tamanho: "4.2 MB",
      downloads: 156,
      resumo:
        "Relatório completo das atividades, operações e resultados alcançados pela PAC em 2023.",
    },
    {
      id: 2,
      titulo: "Operações Ambientais - Trimestre 4",
      tipo: "Trimestral",
      periodo: "Q4 2023",
      data: "2024-01-05",
      arquivo: "operacoes-ambientais-q4-2023.pdf",
      tamanho: "2.1 MB",
      downloads: 89,
      resumo:
        "Relatório detalhado das operações de proteção ambiental realizadas no último trimestre.",
    },
    {
      id: 3,
      titulo: "Estatísticas de Segurança Pública",
      tipo: "Mensal",
      periodo: "Dezembro 2023",
      data: "2024-01-02",
      arquivo: "estatisticas-seguranca-dez-2023.pdf",
      tamanho: "1.8 MB",
      downloads: 203,
      resumo:
        "Dados estatísticos sobre atuação em segurança pública e ocorrências atendidas.",
    },
  ];

  const metricas = [
    { label: "Operações Concluídas", value: "142", change: "+8%" },
    { label: "Áreas Protegidas", value: "45", change: "+12%" },
    { label: "Pessoas Assistidas", value: "15.2K", change: "+23%" },
    { label: "Treinamentos Realizados", value: "68", change: "+15%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate to-offwhite">
      {/* Hero Section */}
      <section className="relative bg-slate text-white pt-40 pb-24">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-8">
              <Link
                href="/atividades"
                className="flex items-center text-navy-light hover:text-white transition-colors"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Atividades
              </Link>
            </Button>

            <Badge className="mb-8 bg-navy-light hover:bg-navy text-white border-none text-sm py-2 px-4">
              <FaFileAlt className="w-4 h-4 mr-2" />
              Relatórios e Estatísticas
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-bebas tracking-wide">
              RELATÓRIOS E ESTATÍSTICAS
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl leading-relaxed">
              Acesso transparente aos nossos relatórios operacionais,
              estatísticas e métricas de desempenho.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-20 bg-white -mt-2 relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {metricas.map((metrica, index) => (
              <Card
                key={index}
                className="border-gray-200 shadow-xl border-2 text-center hover-lift"
              >
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-slate mb-2 font-bebas tracking-wide">
                    {metrica.value}
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">
                    {metrica.label}
                  </p>
                  <div className="flex items-center justify-center">
                    <FaChartLine className="h-5 w-5 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">
                      {metrica.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="relatorios" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-offwhite p-2 rounded-xl">
              <TabsTrigger
                value="relatorios"
                className="text-lg font-medium data-[state=active]:bg-navy-light data-[state=active]:text-white"
              >
                Relatórios
              </TabsTrigger>
              <TabsTrigger
                value="estatisticas"
                className="text-lg font-medium data-[state=active]:bg-navy-light data-[state=active]:text-white"
              >
                Estatísticas
              </TabsTrigger>
              <TabsTrigger
                value="transparencia"
                className="text-lg font-medium data-[state=active]:bg-navy-light data-[state=active]:text-white"
              >
                Transparência
              </TabsTrigger>
            </TabsList>

            {/* ABA: RELATÓRIOS */}
            <TabsContent value="relatorios" className="space-y-6">
              <div className="grid gap-6">
                {relatorios.map((relatorio) => (
                  <Card
                    key={relatorio.id}
                    className="border-gray-200 shadow-xl hover-lift border-2"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-2xl flex items-center gap-3 mb-3 font-bebas tracking-wide">
                            <FaFileAlt className="h-6 w-6 text-navy-light" />
                            {relatorio.titulo}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-base text-gray-600 mt-2">
                            <Badge variant="default">{relatorio.tipo}</Badge>
                            <span>Período: {relatorio.periodo}</span>
                            <span>
                              Publicado:{" "}
                              {new Date(relatorio.data).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                            <span>{relatorio.tamanho}</span>
                            <span className="flex items-center gap-1">
                              <FaDownload className="h-4 w-4" />
                              {relatorio.downloads} downloads
                            </span>
                          </div>
                        </div>
                        <Button className="bg-navy-light hover:bg-navy text-white font-bold py-3 px-6 text-lg transition-all duration-300 hover:scale-105 shadow-lg">
                          <FaDownload className="h-5 w-5 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {relatorio.resumo}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ABA: ESTATÍSTICAS */}
            <TabsContent value="estatisticas">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-gray-200 shadow-xl border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bebas tracking-wide">
                      <FaChartBar className="h-6 w-6 text-navy-light" />
                      Distribuição por Tipo de Operação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          tipo: "Operações Ambientais",
                          percentual: 35,
                          cor: "bg-emerald-500",
                        },
                        {
                          tipo: "Segurança Pública",
                          percentual: 28,
                          cor: "bg-navy-light",
                        },
                        {
                          tipo: "Operações Marítimas",
                          percentual: 20,
                          cor: "bg-cyan-500",
                        },
                        {
                          tipo: "Ações Sociais",
                          percentual: 12,
                          cor: "bg-amber-500",
                        },
                        {
                          tipo: "Treinamentos",
                          percentual: 5,
                          cor: "bg-purple-500",
                        },
                      ].map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-lg">
                            <span className="text-slate">{item.tipo}</span>
                            <span className="text-gray-600 font-medium">
                              {item.percentual}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`${item.cor} h-3 rounded-full transition-all duration-500`}
                              style={{ width: `${item.percentual}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-xl border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bebas tracking-wide">
                      <FaUsers className="h-6 w-6 text-navy-light" />
                      Recursos Humanos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          label: "Agentes Ativos",
                          value: "248",
                          cor: "bg-navy-light",
                          icon: FaShieldAlt,
                        },
                        {
                          label: "Voluntários",
                          value: "156",
                          cor: "bg-emerald-500",
                          icon: FaUsers,
                        },
                        {
                          label: "Horas de Treinamento",
                          value: "5.240h",
                          cor: "bg-amber-500",
                          icon: FaBullseye,
                        },
                        {
                          label: "Certificações",
                          value: "89",
                          cor: "bg-purple-500",
                          icon: FaFileAlt,
                        },
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={index}
                            className="flex justify-between items-center p-4 bg-offwhite rounded-xl hover-lift transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`${item.cor} rounded-full w-10 h-10 flex items-center justify-center`}
                              >
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-lg font-medium text-slate">
                                {item.label}
                              </span>
                            </div>
                            <span className="text-2xl font-bold text-slate font-bebas tracking-wide">
                              {item.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ABA: TRANSPARÊNCIA */}
            <TabsContent value="transparencia">
              <Card className="border-gray-200 shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-bebas tracking-wide">
                    <FaShieldAlt className="h-6 w-6 text-navy-light" />
                    Transparência e Prestação de Contas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bebas tracking-wide text-2xl text-slate">
                        Documentos Institucionais
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Estatuto Social",
                          "Demonstrações Financeiras",
                          "Regulamento Interno",
                        ].map((doc, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-3 p-3 bg-offwhite rounded-xl hover-lift transition-all duration-300"
                          >
                            <FaFileAlt className="h-5 w-5 text-navy-light" />
                            <span className="text-lg text-slate">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bebas tracking-wide text-2xl text-slate">
                        Certificações
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Certificado de Entidade Beneficente",
                          "Registro no CMDCA",
                        ].map((cert, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-3 p-3 bg-offwhite rounded-xl hover-lift transition-all duration-300"
                          >
                            <FaCertificate className="h-5 w-5 text-emerald-500" />
                            <span className="text-lg text-slate">{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-navy-light/10 p-8 rounded-2xl border-2 border-navy-light/20">
                    <h3 className="font-bebas tracking-wide text-2xl text-slate mb-4">
                      Política de Transparência
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      A PAC mantém compromisso com a transparência na gestão e
                      prestação de contas. Todos os relatórios são publicados
                      regularmente e estão disponíveis para consulta pública,
                      garantindo total acesso às informações sobre nossas
                      atividades e resultados.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
