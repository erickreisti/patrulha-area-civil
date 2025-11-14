"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FaCalendar,
  FaUser,
  FaClock,
  FaArrowLeft,
  FaShare,
  FaNewspaper,
} from "react-icons/fa";
import Link from "next/link";

// Dados mock COMPLETOS
const noticias = [
  {
    id: 1,
    slug: "operacao-resgate-florestal",
    titulo: "Operação de Resgate em Área Florestal Concluída com Sucesso",
    resumo:
      "Equipe da PAC realiza resgate de excursionistas perdidos na Serra do Mar",
    conteudo: `
      <p>A Patrulha Aérea Civil realizou com sucesso uma operação de resgate na Serra do Mar, onde dois excursionistas estavam desaparecidos há mais de 48 horas. A operação envolveu equipes terrestres e aéreas trabalhando em conjunto.</p>
      
      <h2>Detalhes da Operação</h2>
      <p>Os agentes do Grupamento de Operações Ambientais foram acionados na tarde de sexta-feira após receberem informações sobre dois excursionistas que não haviam retornado de uma trilha na região.</p>
      
      <p>As buscas iniciaram imediatamente com apoio de drones equipados com câmeras térmicas e uma equipe terrestre especializada em resgate em áreas de difícil acesso.</p>
      
      <h2>Resultado Positivo</h2>
      <p>Após 6 horas de buscas intensivas, os excursionistas foram localizados em bom estado de saúde em uma área remota da serra. Eles receberam atendimento médico inicial no local e foram transportados em segurança para a base operacional.</p>
      
      <h2>Cooperação entre Equipes</h2>
      <p>A operação contou com a integração perfeita entre as equipes terrestres e aéreas, demonstrando a eficiência do treinamento conjunto realizado pela PAC.</p>
    `,
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
    conteudo: `
      <p>A PAC iniciou um novo programa de capacitação para seus agentes, focando em técnicas avançadas de busca e salvamento em ambientes complexos.</p>
      
      <h2>Objetivos do Programa</h2>
      <p>O programa tem como objetivo principal aprimorar as habilidades dos nossos agentes em situações de alta complexidade, incluindo operações noturnas, condições climáticas adversas e ambientes de difícil acesso.</p>
      
      <h2>Módulos de Treinamento</h2>
      <p>O curso é dividido em módulos especializados que incluem navegação terrestre avançada, técnicas de rapel, primeiros socorros em ambiente hostil e comunicação tática.</p>
      
      <h2>Instrutores Especializados</h2>
      <p>Contamos com instrutores altamente qualificados, incluindo veteranos de forças especiais e especialistas em resgate em áreas remotas.</p>
    `,
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
    conteudo: `
      <p>A Patrulha Aérea Civil reforçou sua participação na FOLARED (Federação de Organismos Latino Americanos de Resposta a Emergências), ampliando a cooperação internacional em operações de resgate.</p>
      
      <h2>Expansão da Cooperação</h2>
      <p>A parceria permitirá o intercâmbio de conhecimentos, técnicas e melhores práticas entre as organizações membros, além de facilitar operações conjuntas em situações de desastres regionais.</p>
      
      <h2>Benefícios para a Comunidade</h2>
      <p>Esta cooperação trará benefícios diretos para as comunidades atendidas, com acesso a recursos e expertise internacional em resposta a emergências.</p>
      
      <h2>Treinamentos Conjuntos</h2>
      <p>Estão programados exercícios conjuntos e intercâmbios de equipes para compartilhar experiências e aprimorar os protocolos operacionais.</p>
    `,
    imagem: "/images/site/folared-parceria.jpg",
    categoria: "Cooperação",
    autor: "Tenente Costa",
    dataPublicacao: "2024-01-05",
    tempoLeitura: "5 min",
    destaque: true,
  },
];

interface PageProps {
  params: {
    slug: string;
  };
}

export default function NoticiaPage({ params }: PageProps) {
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);
  const noticia = noticias.find((n) => n.slug === params.slug);

  if (!noticia) {
    notFound();
  }

  const noticiasRelacionadas = noticias
    .filter((n) => n.id !== noticia.id && n.categoria === noticia.categoria)
    .slice(0, 2);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: noticia.titulo,
          text: noticia.resumo,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      setIsSharing(true);
      setTimeout(() => setIsSharing(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/noticias")}
              className="mb-8 text-blue-400 hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Notícias
            </Button>

            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaNewspaper className="w-4 h-4 mr-2" />
              {noticia.categoria}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide leading-tight">
              {noticia.titulo}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              <div className="flex items-center text-lg">
                <FaUser className="h-5 w-5 mr-2" />
                <span className="font-medium">{noticia.autor}</span>
              </div>
              <div className="flex items-center text-lg">
                <FaCalendar className="h-5 w-5 mr-2" />
                <span>
                  {new Date(noticia.dataPublicacao).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
              <div className="flex items-center text-lg">
                <FaClock className="h-5 w-5 mr-2" />
                <span>{noticia.tempoLeitura} de leitura</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo da Notícia */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            {/* Imagem de destaque */}
            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-8 shadow-lg border border-gray-200">
              <span className="text-gray-600 text-xl">
                Imagem: {noticia.titulo}
              </span>
            </div>

            {/* Conteúdo */}
            <Card className="border-gray-200 shadow-lg mb-8 border-2">
              <CardContent className="p-8">
                <div
                  className="prose prose-lg max-w-none 
                    prose-headings:font-bebas prose-headings:tracking-wide prose-headings:text-gray-800 
                    prose-p:text-gray-600 prose-p:text-base prose-p:leading-relaxed
                    prose-strong:text-gray-800 prose-strong:font-bold
                    prose-li:text-gray-600 prose-li:text-base
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3"
                  dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
                />
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
              <Button
                variant="outline"
                onClick={() => router.push("/noticias")}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 transition-all duration-300"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Ver Todas as Notícias
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">Compartilhar:</span>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleShare}
                  className="rounded-full w-12 h-12 hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <FaShare className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Notícias Relacionadas */}
            {noticiasRelacionadas.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bebas tracking-wide text-gray-800 mb-4">
                    NOTÍCIAS RELACIONADAS
                  </h2>
                  <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {noticiasRelacionadas.map((noticiaRelacionada) => (
                    <Card
                      key={noticiaRelacionada.id}
                      className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2"
                    >
                      <CardContent className="p-6">
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 mb-3"
                        >
                          {noticiaRelacionada.categoria}
                        </Badge>
                        <h3 className="font-bebas tracking-wide text-lg text-gray-800 mb-2 leading-tight">
                          {noticiaRelacionada.titulo}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {noticiaRelacionada.resumo}
                        </p>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Link href={`/noticias/${noticiaRelacionada.slug}`}>
                            Continuar Lendo
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
