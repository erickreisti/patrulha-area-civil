"use client";

import { useState, useEffect } from "react";
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
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { NoticiaWithAutor } from "@/types/noticias";

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<NoticiaWithAutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const supabase = createClient();

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("noticias")
          .select(
            `
            *,
            autor:profiles(full_name, graduacao)
          `
          )
          .eq("status", "publicado") // Apenas notícias publicadas
          .order("data_publicacao", { ascending: false });

        if (error) throw error;

        setNoticias(data || []);
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, [supabase]); // ✅ Corrigido: adicionado supabase como dependência

  // Extrair categorias únicas
  const categorias = [
    "Todas",
    ...new Set(noticias.map((noticia) => noticia.categoria)),
  ];

  // Filtrar notícias
  const noticiasFiltradas = noticias.filter((noticia) => {
    const matchesSearch =
      noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noticia.resumo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas" || noticia.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const noticiasDestaque = noticiasFiltradas.filter(
    (noticia) => noticia.destaque
  );
  const noticiasRecentes = noticiasFiltradas.filter(
    (noticia) => !noticia.destaque
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-gray-200">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {noticiasDestaque.length > 0 && (
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-bebas tracking-wide">
                  EM DESTAQUE
                </h2>
                <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {noticiasDestaque.map((noticia) => (
                  <Card
                    key={noticia.id}
                    className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 overflow-hidden"
                  >
                    <div className="h-64 bg-gray-200 flex items-center justify-center relative">
                      {noticia.imagem ? (
                        <Image
                          src={noticia.imagem}
                          alt={noticia.titulo}
                          width={600}
                          height={256}
                          className="w-full h-full object-cover"
                          priority
                        />
                      ) : (
                        <span className="text-gray-600">
                          Imagem: {noticia.titulo}
                        </span>
                      )}
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
                          {Math.ceil(noticia.conteudo.length / 1000)} min
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
                            {noticia.autor?.full_name || "Autor não definido"}
                          </div>
                          <div className="flex items-center">
                            <FaCalendar className="h-4 w-4 mr-1" />
                            {new Date(
                              noticia.data_publicacao
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
                TODAS AS NOTÍCIAS ({noticiasRecentes.length})
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            {noticiasRecentes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {noticiasRecentes.map((noticia) => (
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
                          {Math.ceil(noticia.conteudo.length / 1000)} min
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
                          {new Date(noticia.data_publicacao).toLocaleDateString(
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
                  {noticias.length === 0
                    ? "Nenhuma notícia publicada ainda."
                    : "Nenhuma notícia encontrada para os filtros selecionados."}
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
