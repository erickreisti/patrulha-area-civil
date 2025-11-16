// src/app/(site)/noticias/[slug]/page.tsx - ATUALIZADO
"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter, useParams } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";
import { NoticiaWithAutor } from "@/types/noticias";

export default function NoticiaPage() {
  const router = useRouter();
  const params = useParams();
  const [noticia, setNoticia] = useState<NoticiaWithAutor | null>(null);
  const [noticiasRelacionadas, setNoticiasRelacionadas] = useState<
    NoticiaWithAutor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        setLoading(true);

        // Buscar notícia pelo slug
        const { data: noticiaData, error } = await supabase
          .from("noticias")
          .select(
            `
            *,
            autor:profiles(full_name, graduacao)
          `
          )
          .eq("slug", params.slug)
          .eq("status", "publicado") // Apenas notícias publicadas
          .single();

        if (error || !noticiaData) {
          notFound();
          return;
        }

        setNoticia(noticiaData);

        // Buscar notícias relacionadas (mesma categoria)
        const { data: relacionadasData } = await supabase
          .from("noticias")
          .select(
            `
            *,
            autor:profiles(full_name, graduacao)
          `
          )
          .eq("categoria", noticiaData.categoria)
          .eq("status", "publicado")
          .neq("id", noticiaData.id)
          .limit(2)
          .order("data_publicacao", { ascending: false });

        setNoticiasRelacionadas(relacionadasData || []);
      } catch (error) {
        console.error("Erro ao carregar notícia:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchNoticia();
    }
  }, [params.slug, supabase]);

  const handleShare = async () => {
    if (navigator.share && noticia) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!noticia) {
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
                <span className="font-medium">
                  {noticia.autor?.full_name || "Autor não definido"}
                </span>
              </div>
              <div className="flex items-center text-lg">
                <FaCalendar className="h-5 w-5 mr-2" />
                <span>
                  {new Date(noticia.data_publicacao).toLocaleDateString(
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
                <span>
                  {Math.ceil(noticia.conteudo.length / 1000)} min de leitura
                </span>
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
            {noticia.imagem && (
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-8 shadow-lg border border-gray-200 overflow-hidden">
                <img
                  src={noticia.imagem}
                  alt={noticia.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

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
