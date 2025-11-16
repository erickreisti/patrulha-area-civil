import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CategoriaGaleriaPage({ params }: PageProps) {
  const supabase = await createClient();

  // Buscar categoria pelo slug
  const { data: categoria, error: categoriaError } = await supabase
    .from("galeria_categorias")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", true)
    .single();

  if (categoriaError || !categoria) {
    notFound();
  }

  // Buscar itens da categoria
  const { data: itens, error: itensError } = await supabase
    .from("galeria_itens")
    .select(
      `
      *,
      categoria:galeria_categorias(*)
    `
    )
    .eq("categoria_id", categoria.id)
    .eq("status", true)
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: false });

  if (itensError) {
    console.error("Erro ao buscar itens:", itensError);
  }

  const itensDaCategoria = itens || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              asChild
              className="mb-8 text-blue-400 hover:text-white transition-colors"
            >
              <Link href="/galeria">
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Galeria
              </Link>
            </Button>

            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaCamera className="w-4 h-4 mr-2" />
              {categoria.tipo === "fotos"
                ? "Galeria de Fotos"
                : "Galeria de Vídeos"}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide leading-tight">
              {categoria.nome}
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
                    {itensDaCategoria.length}{" "}
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

          {itensDaCategoria.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itensDaCategoria.map((item) => (
                <Card
                  key={item.id}
                  className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 overflow-hidden h-full flex flex-col"
                >
                  {/* Thumbnail do Item */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    {item.thumbnail_url ? (
                      // Se tiver thumbnail, mostrar imagem
                      <img
                        src={item.thumbnail_url}
                        alt={item.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Placeholder
                      <div className="text-center p-4">
                        {item.tipo === "video" ? (
                          <FaVideo className="h-12 w-12 text-gray-800/50 mx-auto mb-3" />
                        ) : (
                          <FaImages className="h-12 w-12 text-gray-800/50 mx-auto mb-3" />
                        )}
                        <span className="text-gray-800 font-medium">
                          {item.titulo}
                        </span>
                      </div>
                    )}

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

                    {item.descricao && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 flex-grow">
                        {item.descricao}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                      <div className="flex items-center">
                        <FaCalendar className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(item.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                      {item.tipo === "foto" && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                          <span>PAC</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                        asChild
                      >
                        {item.tipo === "video" ? (
                          <a
                            href={item.arquivo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Assistir
                          </a>
                        ) : (
                          <a
                            href={item.arquivo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visualizar
                          </a>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-10 h-10 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
                        asChild
                      >
                        <a href={item.arquivo_url} download>
                          <FaDownload className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <FaImages className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Nenhum item disponível
                </h3>
                <p className="text-yellow-700 text-sm">
                  Esta categoria ainda não possui{" "}
                  {categoria.tipo === "fotos" ? "fotos" : "vídeos"} publicados.
                </p>
              </div>
            </div>
          )}
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
