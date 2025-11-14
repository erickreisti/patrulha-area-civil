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
  FaFolder,
  FaImages,
  FaVideo,
  FaCalendar,
  FaArrowRight,
  FaCamera,
  FaSearch,
} from "react-icons/fa";
import Link from "next/link";

// Dados mock das categorias da galeria
const categoriasGaleria = [
  {
    id: 1,
    slug: "operacoes-resgate",
    titulo: "Operações de Resgate",
    descricao: "Registros das nossas operações de busca e salvamento",
    imagem: "/images/gallery/operacoes-thumb.jpg",
    quantidade: 24,
    tipo: "fotos",
    dataAtualizacao: "2024-01-15",
  },
  {
    id: 2,
    slug: "treinamentos",
    titulo: "Treinamentos",
    descricao: "Capacitação e exercícios práticos da nossa equipe",
    imagem: "/images/gallery/treinamentos-thumb.jpg",
    quantidade: 18,
    tipo: "fotos",
    dataAtualizacao: "2024-01-10",
  },
  {
    id: 3,
    slug: "equipamentos",
    titulo: "Equipamentos",
    descricao: "Nossa frota e equipamentos de última geração",
    imagem: "/images/gallery/equipamentos-thumb.jpg",
    quantidade: 12,
    tipo: "fotos",
    dataAtualizacao: "2024-01-08",
  },
  {
    id: 4,
    slug: "eventos-comunitarios",
    titulo: "Eventos Comunitários",
    descricao: "Participação em eventos e ações sociais",
    imagem: "/images/gallery/eventos-thumb.jpg",
    quantidade: 15,
    tipo: "fotos",
    dataAtualizacao: "2023-12-20",
  },
  {
    id: 5,
    slug: "patrulheiro-mirim",
    titulo: "Patrulheiro Mirim",
    descricao: "Atividades do projeto social para jovens",
    imagem: "/images/gallery/mirim-thumb.jpg",
    quantidade: 20,
    tipo: "fotos",
    dataAtualizacao: "2023-12-15",
  },
  {
    id: 6,
    slug: "videos-operacionais",
    titulo: "Vídeos Operacionais",
    descricao: "Registros em vídeo das nossas operações",
    imagem: "/images/gallery/videos-thumb.jpg",
    quantidade: 8,
    tipo: "videos",
    dataAtualizacao: "2024-01-12",
  },
];

export default function GaleriaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Todas");

  const tipos = ["Todas", "Fotos", "Vídeos"];

  const categoriasFiltradas = categoriasGaleria.filter((categoria) => {
    const matchesSearch =
      categoria.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "Todas" ||
      (selectedType === "Fotos" && categoria.tipo === "fotos") ||
      (selectedType === "Vídeos" && categoria.tipo === "videos");
    return matchesSearch && matchesType;
  });

  const totalFotos = categoriasGaleria
    .filter((cat) => cat.tipo === "fotos")
    .reduce((sum, cat) => sum + cat.quantidade, 0);

  const totalVideos = categoriasGaleria
    .filter((cat) => cat.tipo === "videos")
    .reduce((sum, cat) => sum + cat.quantidade, 0);

  const estatisticas = [
    {
      icon: FaImages,
      valor: totalFotos,
      label: "Fotos",
    },
    {
      icon: FaVideo,
      valor: totalVideos,
      label: "Vídeos",
    },
    {
      icon: FaFolder,
      valor: categoriasGaleria.length,
      label: "Categorias",
    },
    {
      icon: FaCalendar,
      valor: "2024",
      label: "Atualizado",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaCamera className="w-4 h-4 mr-2" />
              Registros Visuais
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              <span className="text-blue-400">GALERIA</span> DE MÍDIA
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Registros visuais das nossas operações, treinamentos, atividades
              comunitárias e projetos especiais da Patrulha Aérea Civil
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
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 py-2 rounded-lg transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tipos.map((tipo) => (
                <Button
                  key={tipo}
                  variant={selectedType === tipo ? "default" : "outline"}
                  onClick={() => setSelectedType(tipo)}
                  className={`${
                    selectedType === tipo
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  } transition-all duration-300`}
                >
                  {tipo}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {estatisticas.map((stat, index) => (
              <Card
                key={index}
                className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 border-2 text-center"
              >
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-800 mb-1 font-bebas tracking-wide">
                    {stat.valor}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grid de Categorias */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-bebas tracking-wide">
              CATEGORIAS DA GALERIA
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {categoriasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriasFiltradas.map((categoria) => (
                <Card
                  key={categoria.id}
                  className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 overflow-hidden h-full flex flex-col"
                >
                  {/* Thumbnail da Categoria */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                    <span className="text-gray-600">
                      Imagem: {categoria.titulo}
                    </span>
                    <Badge
                      variant={
                        categoria.tipo === "videos" ? "default" : "secondary"
                      }
                      className={`absolute top-3 right-3 ${
                        categoria.tipo === "videos"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {categoria.tipo === "videos" ? "Vídeos" : "Fotos"}
                    </Badge>
                  </div>

                  <CardHeader className="pb-4 flex-grow">
                    <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide group-hover:text-blue-600 transition-colors leading-tight">
                      {categoria.titulo}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {categoria.descricao}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaImages className="h-4 w-4 mr-1" />
                        <span>{categoria.quantidade} itens</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaCalendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(
                            categoria.dataAtualizacao
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Link href={`/galeria/${categoria.slug}`}>
                        Ver Galeria <FaArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Nenhuma categoria encontrada para os filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="border-blue-600 bg-blue-600/5 border-2 shadow-xl max-w-4xl mx-auto text-center">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-blue-600 text-2xl font-bebas tracking-wide">
                TEM FOTOS OU VÍDEOS PARA COMPARTILHAR?
              </CardTitle>
              <CardDescription className="text-gray-600">
                Entre em contato conosco para contribuir com nossa galeria e
                ajudar a documentar o importante trabalho da Patrulha Aérea
                Civil
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <Button
                asChild
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 transition-all duration-300 hover:scale-105"
              >
                <Link href="/contato">Enviar Material</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
