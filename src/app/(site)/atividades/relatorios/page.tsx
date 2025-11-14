"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState("relatorios");

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-6 text-blue-400 hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Atividades
            </Button>

            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaFileAlt className="w-4 h-4 mr-2" />
              Relatórios e Estatísticas
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              RELATÓRIOS E ESTATÍSTICAS
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl leading-relaxed">
              Acesso transparente aos nossos relatórios operacionais,
              estatísticas e métricas de desempenho.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {metricas.map((metrica, index) => (
              <Card
                key={index}
                className="border-gray-200 shadow-lg border-2 text-center hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="text-xl font-bold text-gray-800 mb-1 font-bebas tracking-wide">
                    {metrica.value}
                  </div>
                  <p className="text-gray-600 text-xs font-medium mb-1">
                    {metrica.label}
                  </p>
                  <div className="flex items-center justify-center">
                    <FaChartLine className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500 text-xs font-medium">
                      {metrica.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="relatorios"
                className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Relatórios
              </TabsTrigger>
              <TabsTrigger
                value="estatisticas"
                className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Estatísticas
              </TabsTrigger>
              <TabsTrigger
                value="transparencia"
                className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Transparência
              </TabsTrigger>
            </TabsList>

            {/* ABA: RELATÓRIOS */}
            <TabsContent value="relatorios" className="space-y-4">
              <div className="grid gap-4">
                {relatorios.map((relatorio) => (
                  <Card
                    key={relatorio.id}
                    className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 border-2"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2 mb-2 font-bebas tracking-wide">
                            <FaFileAlt className="h-5 w-5 text-blue-600" />
                            {relatorio.titulo}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <Badge variant="default" className="text-xs">
                              {relatorio.tipo}
                            </Badge>
                            <span>Período: {relatorio.periodo}</span>
                            <span>
                              Publicado:{" "}
                              {new Date(relatorio.data).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                            <span>{relatorio.tamanho}</span>
                            <span className="flex items-center gap-1">
                              <FaDownload className="h-3 w-3" />
                              {relatorio.downloads} downloads
                            </span>
                          </div>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 transition-all duration-300 hover:scale-105 shadow-lg">
                          <FaDownload className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {relatorio.resumo}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ABA: ESTATÍSTICAS */}
            <TabsContent value="estatisticas">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-gray-200 shadow-lg border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bebas tracking-wide">
                      <FaChartBar className="h-5 w-5 text-blue-600" />
                      Distribuição por Tipo de Operação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          tipo: "Operações Ambientais",
                          percentual: 35,
                          cor: "bg-emerald-500",
                        },
                        {
                          tipo: "Segurança Pública",
                          percentual: 28,
                          cor: "bg-blue-600",
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
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-800">{item.tipo}</span>
                            <span className="text-gray-600 font-medium">
                              {item.percentual}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${item.cor} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${item.percentual}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-lg border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bebas tracking-wide">
                      <FaUsers className="h-5 w-5 text-blue-600" />
                      Recursos Humanos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Agentes Ativos",
                          value: "248",
                          cor: "bg-blue-600",
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
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`${item.cor} rounded-full w-8 h-8 flex items-center justify-center`}
                              >
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-800">
                                {item.label}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-gray-800 font-bebas tracking-wide">
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
              <Card className="border-gray-200 shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bebas tracking-wide">
                    <FaShieldAlt className="h-5 w-5 text-blue-600" />
                    Transparência e Prestação de Contas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="font-bebas tracking-wide text-lg text-gray-800">
                        Documentos Institucionais
                      </h3>
                      <ul className="space-y-2">
                        {[
                          "Estatuto Social",
                          "Demonstrações Financeiras",
                          "Regulamento Interno",
                        ].map((doc, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300"
                          >
                            <FaFileAlt className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-800">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bebas tracking-wide text-lg text-gray-800">
                        Certificações
                      </h3>
                      <ul className="space-y-2">
                        {[
                          "Certificado de Entidade Beneficente",
                          "Registro no CMDCA",
                        ].map((cert, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300"
                          >
                            <FaCertificate className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm text-gray-800">
                              {cert}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-600/10 p-4 rounded-lg border-2 border-blue-600/20">
                    <h3 className="font-bebas tracking-wide text-lg text-gray-800 mb-2">
                      Política de Transparência
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      A PAC mantém compromisso com a transparência na gestão e
                      prestação de contas. Todos os relatórios são publicados
                      regularmente e estão disponíveis para consulta pública.
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
