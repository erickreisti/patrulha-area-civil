"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FaArrowLeft,
  FaImages,
  FaVideo,
  FaCalendar,
  FaDownload,
  FaPlay,
  FaCamera,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Link from "next/link";

// Dados mock das categorias e itens
const categoriasGaleria = {
  "operacoes-resgate": {
    id: 1,
    titulo: "Operações de Resgate",
    descricao: "Registros das nossas operações de busca e salvamento",
    tipo: "fotos",
    itens: [
      {
        id: 1,
        titulo: "Resgate na Serra do Mar",
        descricao: "Operação de resgate de excursionistas em área montanhosa",
        imagem: "/images/gallery/operacao-1.jpg",
        tipo: "foto",
        data: "2024-01-15",
        local: "Serra do Mar, RJ",
      },
      {
        id: 2,
        titulo: "Busca em Área Florestal",
        descricao: "Equipe terrestre em operação de busca",
        imagem: "/images/gallery/operacao-2.jpg",
        tipo: "foto",
        data: "2024-01-10",
        local: "Mata Atlântica",
      },
      {
        id: 3,
        titulo: "Suporte Aéreo",
        descricao: "Helicóptero em operação de resgate",
        imagem: "/images/gallery/operacao-3.jpg",
        tipo: "foto",
        data: "2024-01-08",
        local: "Região Serrana",
      },
      {
        id: 4,
        titulo: "Equipe em Ação",
        descricao: "Agentes durante operação noturna",
        imagem: "/images/gallery/operacao-4.jpg",
        tipo: "foto",
        data: "2023-12-20",
        local: "Área Urbana",
      },
      {
        id: 5,
        titulo: "Resgate Aquático",
        descricao: "Operação em ambiente marítimo",
        imagem: "/images/gallery/operacao-5.jpg",
        tipo: "foto",
        data: "2023-12-15",
        local: "Litoral",
      },
      {
        id: 6,
        titulo: "Cooperação entre Equipes",
        descricao: "Integração entre grupamentos terrestre e aéreo",
        imagem: "/images/gallery/operacao-6.jpg",
        tipo: "foto",
        data: "2023-12-10",
        local: "Base Operacional",
      },
    ],
  },
  treinamentos: {
    id: 2,
    titulo: "Treinamentos",
    descricao: "Capacitação e exercícios práticos da nossa equipe",
    tipo: "fotos",
    itens: [
      {
        id: 1,
        titulo: "Treinamento de Primeiros Socorros",
        descricao: "Capacitação em técnicas de atendimento pré-hospitalar",
        imagem: "/images/gallery/treinamento-1.jpg",
        tipo: "foto",
        data: "2024-01-12",
        local: "Base Central",
      },
      {
        id: 2,
        titulo: "Exercício de Resgate em Altura",
        descricao: "Práticas de técnicas de rapel e resgate vertical",
        imagem: "/images/gallery/treinamento-2.jpg",
        tipo: "foto",
        data: "2024-01-08",
        local: "Área de Treinamento",
      },
    ],
  },
  equipamentos: {
    id: 3,
    titulo: "Equipamentos",
    descricao: "Nossa frota e equipamentos de última geração",
    tipo: "fotos",
    itens: [
      {
        id: 1,
        titulo: "Frota de Veículos",
        descricao: "Veículos equipados para resposta rápida",
        imagem: "/images/gallery/equipamento-1.jpg",
        tipo: "foto",
        data: "2024-01-05",
        local: "Garagem Principal",
      },
      {
        id: 2,
        titulo: "Equipamentos de Resgate",
        descricao: "Ferramentas e equipamentos especializados",
        imagem: "/images/gallery/equipamento-2.jpg",
        tipo: "foto",
        data: "2024-01-03",
        local: "Almoxarifado",
      },
    ],
  },
  "eventos-comunitarios": {
    id: 4,
    titulo: "Eventos Comunitários",
    descricao: "Participação em eventos e ações sociais",
    tipo: "fotos",
    itens: [
      {
        id: 1,
        titulo: "Feira de Prevenção",
        descricao: "Stand educativo sobre prevenção de acidentes",
        imagem: "/images/gallery/evento-1.jpg",
        tipo: "foto",
        data: "2023-12-18",
        local: "Praça Central",
      },
    ],
  },
  "patrulheiro-mirim": {
    id: 5,
    titulo: "Patrulheiro Mirim",
    descricao: "Atividades do projeto social para jovens",
    tipo: "fotos",
    itens: [
      {
        id: 1,
        titulo: "Formatura dos Jovens",
        descricao: "Cerimônia de formatura da turma 2023",
        imagem: "/images/gallery/mirim-1.jpg",
        tipo: "foto",
        data: "2023-12-15",
        local: "Auditório Principal",
      },
    ],
  },
  "videos-operacionais": {
    id: 6,
    titulo: "Vídeos Operacionais",
    descricao: "Registros em vídeo das nossas operações",
    tipo: "videos",
    itens: [
      {
        id: 1,
        titulo: "Operação de Resgate - Documentário",
        descricao: "Registro completo de uma operação de resgate",
        imagem: "/images/gallery/video-1.jpg",
        tipo: "video",
        data: "2024-01-12",
        local: "Serra do Mar",
      },
    ],
  },
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CategoriaGaleriaPage({ params }: PageProps) {
  const router = useRouter();
  const categoria =
    categoriasGaleria[params.slug as keyof typeof categoriasGaleria];

  if (!categoria) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/galeria")}
              className="mb-8 text-blue-400 hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Galeria
            </Button>

            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaCamera className="w-4 h-4 mr-2" />
              {categoria.tipo === "fotos"
                ? "Galeria de Fotos"
                : "Galeria de Vídeos"}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide leading-tight">
              {categoria.titulo}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl leading-relaxed">
              {categoria.descricao}
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo da Galeria */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Estatísticas da Categoria */}
          <Card className="border-gray-200 shadow-lg mb-8 border-2">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                  <div className="text-2xl font-bold text-gray-800 mb-1 font-bebas tracking-wide">
                    {categoria.itens.length}{" "}
                    {categoria.tipo === "fotos" ? "Fotos" : "Vídeos"}
                  </div>
                  <div className="text-gray-600 text-sm">nesta categoria</div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 px-6 transition-all duration-300"
                >
                  <Link href="/galeria">Explorar Outras Categorias</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Itens */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bebas tracking-wide text-gray-800 mb-4">
              {categoria.tipo === "fotos" ? "FOTOS" : "VÍDEOS"} DA GALERIA
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoria.itens.map((item) => (
              <Card
                key={item.id}
                className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 overflow-hidden h-full flex flex-col"
              >
                {/* Thumbnail do Item */}
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  <span className="text-gray-600">Imagem: {item.titulo}</span>
                  {item.tipo === "video" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <FaPlay className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <Badge
                    variant={item.tipo === "video" ? "default" : "secondary"}
                    className={`absolute top-3 right-3 ${
                      item.tipo === "video"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.tipo === "video" ? "Vídeo" : "Foto"}
                  </Badge>
                </div>

                <CardContent className="p-4 flex-grow flex flex-col">
                  <h3 className="font-bebas tracking-wide text-lg text-gray-800 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {item.titulo}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3 flex-grow">
                    {item.descricao}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                    <div className="flex items-center">
                      <FaCalendar className="h-3 w-3 mr-1" />
                      {new Date(item.data).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                      {item.local}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                    >
                      Visualizar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-10 h-10 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
                    >
                      <FaDownload className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bebas tracking-wide text-gray-800 mb-4">
            MAIS CONTEÚDO VISUAL
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            Explore nossas outras categorias e descubra mais sobre o trabalho da
            Patrulha Aérea Civil
          </p>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Link href="/galeria">
              <FaImages className="mr-2 h-4 w-4" />
              Ver Todas as Categorias
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
