"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FaCalendar,
  FaUser,
  FaArrowRight,
  FaClock,
  FaNewspaper,
  FaSearch,
} from "react-icons/fa";
import Link from "next/link";

// Dados mock das notícias
const noticias = [
  {
    id: 1,
    slug: "operacao-resgate-florestal",
    titulo: "Operação de Resgate em Área Florestal Concluída com Sucesso",
    resumo:
      "Equipe da PAC realiza resgate de excursionistas perdidos na Serra do Mar",
    conteudo:
      "A Patrulha Aérea Civil realizou com sucesso uma operação de resgate na Serra do Mar...",
    imagem: "/images/site/operacao-resgate.jpg",
    categoria: "Operações",
    autor: "Comandante Silva",
    dataPublicacao: "2024-01-15",
    tempoLeitura: "3 min",
    destaque: true,
  },
  {
    id: 2,
    slug: "treinamento-capacitacao",
    titulo: "Novo Programa de Treinamento para Agentes",
    resumo: "Capacitação em técnicas avançadas de busca e salvamento",
    conteudo:
      "A PAC iniciou um novo programa de capacitação para seus agentes...",
    imagem: "/images/site/treinamento.jpg",
    categoria: "Treinamento",
    autor: "Capitão Oliveira",
    dataPublicacao: "2024-01-10",
    tempoLeitura: "4 min",
    destaque: false,
  },
  {
    id: 3,
    slug: "parceria-folared",
    titulo: "PAC Fortalece Parceria com FOLARED",
    resumo: "Cooperação internacional para resposta a emergências",
    conteudo: "A Patrulha Aérea Civil reforçou sua participação na FOLARED...",
    imagem: "/images/site/folared-parceria.jpg",
    categoria: "Cooperação",
    autor: "Tenente Costa",
    dataPublicacao: "2024-01-05",
    tempoLeitura: "5 min",
    destaque: true,
  },
  {
    id: 4,
    slug: "patrulheiro-mirim-formatura",
    titulo: "Formatura da Turma 2023 do Patrulheiro Mirim",
    resumo: "Jovens concluem programa de formação cívica e disciplinar",
    conteudo:
      "Foi realizada no último sábado a formatura da turma 2023 do projeto Patrulheiro Mirim...",
    imagem: "/images/site/formatura-mirim.jpg",
    categoria: "Projetos Sociais",
    autor: "Sargento Santos",
    dataPublicacao: "2023-12-20",
    tempoLeitura: "3 min",
    destaque: false,
  },
  {
    id: 5,
    slug: "equipamentos-novos",
    titulo: "PAC Adquire Novos Equipamentos de Resgate",
    resumo: "Investimento em tecnologia para melhorar eficiência nas operações",
    conteudo:
      "A Patrulha Aérea Civil recebeu novos equipamentos de última geração...",
    imagem: "/images/site/equipamentos.jpg",
    categoria: "Equipamentos",
    autor: "Comandante Silva",
    dataPublicacao: "2023-12-15",
    tempoLeitura: "2 min",
    destaque: false,
  },
  {
    id: 6,
    slug: "operacao-inundacao",
    titulo: "Resposta Rápida a Inundações no Litoral",
    resumo:
      "Equipes terrestres e aéreas atuam no socorro a vítimas de enchentes",
    conteudo:
      "Diante das fortes chuvas que atingiram o litoral, a PAC mobilizou suas equipes...",
    imagem: "/images/site/inundacao.jpg",
    categoria: "Operações",
    autor: "Capitão Oliveira",
    dataPublicacao: "2023-12-10",
    tempoLeitura: "4 min",
    destaque: true,
  },
];

export default function NoticiasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const noticiasDestaque = noticias.filter((noticia) => noticia.destaque);
  const noticiasRecentes = noticias.filter((noticia) => !noticia.destaque);

  const categorias = [
    "Todas",
    ...new Set(noticias.map((noticia) => noticia.categoria)),
  ];

  const noticiasFiltradas = noticias.filter((noticia) => {
    const matchesSearch =
      noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noticia.resumo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas" || noticia.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const noticiasDestaqueFiltradas = noticiasFiltradas.filter(
    (noticia) => noticia.destaque
  );
  const noticiasRecentesFiltradas = noticiasFiltradas.filter(
    (noticia) => !noticia.destaque
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaNewspaper className="w-4 h-4 mr-2" />
              Últimas Atualizações
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              <span className="text-blue-400">NOTÍCIAS</span> DA PAC
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Fique por dentro das últimas operações, treinamentos, projetos
              sociais e novidades da Patrulha Aérea Civil
            </p>
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 py-2 rounded-lg transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categorias.map((categoria) => (
                <Button
                  key={categoria}
                  variant={
                    selectedCategory === categoria ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(categoria)}
                  className={`${
                    selectedCategory === categoria
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  } transition-all duration-300`}
                >
                  {categoria}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Notícias em Destaque */}
          {noticiasDestaqueFiltradas.length > 0 && (
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-bebas tracking-wide">
                  EM DESTAQUE
                </h2>
                <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {noticiasDestaqueFiltradas.map((noticia) => (
                  <Card
                    key={noticia.id}
                    className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 overflow-hidden"
                  >
                    <div className="h-64 bg-gray-200 flex items-center justify-center relative">
                      <span className="text-gray-600">
                        Imagem: {noticia.titulo}
                      </span>
                      <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
                        Destaque
                      </Badge>
                    </div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="default" className="bg-blue-600">
                          {noticia.categoria}
                        </Badge>
                        <div className="flex items-center text-gray-600 text-sm">
                          <FaClock className="h-4 w-4 mr-1" />
                          {noticia.tempoLeitura}
                        </div>
                      </div>
                      <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide leading-tight">
                        {noticia.titulo}
                      </CardTitle>
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {noticia.resumo}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaUser className="h-4 w-4 mr-1" />
                            {noticia.autor}
                          </div>
                          <div className="flex items-center">
                            <FaCalendar className="h-4 w-4 mr-1" />
                            {new Date(
                              noticia.dataPublicacao
                            ).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <Link href={`/noticias/${noticia.slug}`}>
                            Ler Mais <FaArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Notícias Recentes */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-bebas tracking-wide">
                TODAS AS NOTÍCIAS
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            {noticiasRecentesFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {noticiasRecentesFiltradas.map((noticia) => (
                  <Card
                    key={noticia.id}
                    className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 h-full flex flex-col"
                  >
                    <CardHeader className="pb-4 flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700"
                        >
                          {noticia.categoria}
                        </Badge>
                        <div className="flex items-center text-gray-600 text-xs">
                          <FaClock className="h-3 w-3 mr-1" />
                          {noticia.tempoLeitura}
                        </div>
                      </div>
                      <CardTitle className="text-gray-800 text-lg font-bebas tracking-wide leading-tight mb-3">
                        {noticia.titulo}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm leading-relaxed">
                        {noticia.resumo}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          {new Date(noticia.dataPublicacao).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Link href={`/noticias/${noticia.slug}`}>
                            Ler <FaArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Nenhuma notícia encontrada para os filtros selecionados.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="border-blue-600 bg-blue-600/5 border-2 shadow-xl max-w-4xl mx-auto">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-blue-600 text-2xl font-bebas tracking-wide">
                RECEBA NOSSAS NOTÍCIAS
              </CardTitle>
              <CardDescription className="text-gray-600">
                Cadastre-se para receber as últimas notícias e atualizações da
                PAC por email
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  className="flex-1 border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 py-2 px-4 rounded-lg transition-all duration-300"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 transition-all duration-300 hover:scale-105 shadow-lg">
                  Cadastrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
