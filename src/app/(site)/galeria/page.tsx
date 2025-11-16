import { createClient } from "@/lib/supabase/server";
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
  FaFolder,
  FaImages,
  FaVideo,
  FaCalendar,
  FaArrowRight,
  FaCamera,
} from "react-icons/fa";
import Link from "next/link";
import { SearchAndFilter } from "./components/SearchAndFilter";

export default async function GaleriaPage({
  searchParams,
}: {
  searchParams: { search?: string; tipo?: string };
}) {
  const supabase = await createClient();

  // Buscar categorias ativas do banco
  const { data: categorias, error } = await supabase
    .from("galeria_categorias")
    .select(
      `
      *,
      galeria_itens(count)
    `
    )
    .eq("status", true)
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao carregar categorias:", error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erro ao carregar galeria
          </h1>
          <p className="text-gray-600">
            Tente recarregar a página ou volte mais tarde.
          </p>
        </div>
      </div>
    );
  }

  // Aplicar filtros do searchParams
  let categoriasFiltradas = categorias || [];

  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase();
    categoriasFiltradas = categoriasFiltradas.filter(
      (categoria) =>
        categoria.nome.toLowerCase().includes(searchTerm) ||
        categoria.descricao?.toLowerCase().includes(searchTerm)
    );
  }

  if (searchParams.tipo && searchParams.tipo !== "Todas") {
    const tipoFiltro = searchParams.tipo === "Fotos" ? "fotos" : "videos";
    categoriasFiltradas = categoriasFiltradas.filter(
      (categoria) => categoria.tipo === tipoFiltro
    );
  }

  // Calcular estatísticas reais
  const totalFotos =
    categorias
      ?.filter((cat) => cat.tipo === "fotos")
      .reduce((sum, cat) => sum + (cat.galeria_itens?.[0]?.count || 0), 0) || 0;

  const totalVideos =
    categorias
      ?.filter((cat) => cat.tipo === "videos")
      .reduce((sum, cat) => sum + (cat.galeria_itens?.[0]?.count || 0), 0) || 0;

  const totalItens = totalFotos + totalVideos;

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
      valor: categorias?.length || 0,
      label: "Categorias",
    },
    {
      icon: FaCalendar,
      valor: new Date().getFullYear(),
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
      <SearchAndFilter
        initialSearch={searchParams.search || ""}
        initialTipo={searchParams.tipo || "Todas"}
      />

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
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    <div className="text-center p-4">
                      <FaImages className="h-12 w-12 text-gray-800/50 mx-auto mb-3" />
                      <span className="text-gray-800 font-medium">
                        {categoria.nome}
                      </span>
                    </div>
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
                      {categoria.nome}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {categoria.descricao}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaImages className="h-4 w-4 mr-1" />
                        <span>
                          {categoria.galeria_itens?.[0]?.count || 0} itens
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaCalendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(categoria.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
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
