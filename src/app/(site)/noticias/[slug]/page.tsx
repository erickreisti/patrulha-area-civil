"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RiCalendarLine,
  RiUserLine,
  RiTimeLine,
  RiArrowLeftLine,
  RiShareLine,
  RiNewspaperLine,
  RiArrowRightLine,
  RiImageLine,
} from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

// Interfaces
export type NoticiaStatus = "rascunho" | "publicado" | "arquivado";

export interface NoticiaWithAutor {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  resumo: string;
  imagem: string | null;
  categoria: string;
  autor_id: string;
  destaque: boolean;
  data_publicacao: string;
  status: NoticiaStatus;
  created_at: string;
  updated_at: string;
  autor?: {
    full_name: string;
    graduacao: string;
    avatar_url?: string;
  };
}

export default function NoticiaPage() {
  const router = useRouter();
  const params = useParams();
  const [noticia, setNoticia] = useState<NoticiaWithAutor | null>(null);
  const [noticiasRelacionadas, setNoticiasRelacionadas] = useState<
    NoticiaWithAutor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        setLoading(true);
        setImageError(false);

        console.log("🔄 Buscando notícia com slug:", params.slug);

        // Buscar notícia - as políticas RLS já cuidam do acesso
        const { data: noticiaData, error } = await supabase
          .from("noticias")
          .select(
            `
            *,
            autor:profiles(full_name, graduacao, avatar_url)
          `
          )
          .eq("slug", params.slug)
          .single();

        if (error) {
          console.error("❌ Erro ao buscar notícia:", error);

          // Se for erro de não encontrado, mostrar página 404
          if (error.code === "PGRST116") {
            console.log("📭 Notícia não encontrada");
            notFound();
            return;
          }

          // Para outros erros, tentar fallback
          console.error("💥 Erro específico:", error);
          notFound();
          return;
        }

        if (!noticiaData) {
          console.log("📭 Notícia não encontrada (data vazia)");
          notFound();
          return;
        }

        console.log("✅ Notícia encontrada:", noticiaData.titulo);
        console.log("📊 Status da notícia:", noticiaData.status);
        setNoticia(noticiaData);

        // Buscar notícias relacionadas
        try {
          const { data: relacionadasData, error: relacionadasError } =
            await supabase
              .from("noticias")
              .select(
                `
              *,
              autor:profiles(full_name, graduacao, avatar_url)
            `
              )
              .eq("categoria", noticiaData.categoria)
              .neq("id", noticiaData.id)
              .limit(3)
              .order("data_publicacao", { ascending: false });

          if (relacionadasError) {
            console.error("❌ Erro ao buscar relacionadas:", relacionadasError);
          } else {
            console.log(
              "✅ Notícias relacionadas:",
              relacionadasData?.length || 0
            );
            setNoticiasRelacionadas(relacionadasData || []);
          }
        } catch (relError) {
          console.error("💥 Erro ao buscar notícias relacionadas:", relError);
        }
      } catch (error) {
        console.error("💥 Erro geral ao carregar notícia:", error);
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
        // Fallback para copiar link
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleImageError = () => {
    console.log("❌ Erro ao carregar imagem da notícia");
    setImageError(true);
  };

  // Função para corrigir URLs de imagem do Supabase
  const getImageUrl = (url: string | null) => {
    if (!url) return null;

    // Se já é uma URL completa, retornar como está
    if (url.startsWith("http")) return url;

    // Se é um caminho do Supabase Storage, construir URL
    if (url.startsWith("imagens-noticias/")) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      return `${supabaseUrl}/storage/v1/object/public/${url}`;
    }

    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-slate-200 rounded mb-8"></div>
            <div className="h-4 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!noticia) {
    notFound();
  }

  const imageUrl = getImageUrl(noticia.imagem);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/noticias")}
              className="mb-8 text-blue-300 hover:text-white hover:bg-blue-400/20 transition-colors hover:border-blue-300/50 px-4 py-2 rounded-lg"
            >
              <RiArrowLeftLine className="mr-2 h-4 w-4" />
              Voltar Para Notícias
            </Button>

            <Badge className="mb-6 bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 px-4 py-2 text-sm font-medium">
              <RiNewspaperLine className="w-4 h-4 mr-2" />
              {noticia.categoria}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide leading-tight">
              {noticia.titulo}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              <div className="flex items-center text-lg">
                <RiUserLine className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {noticia.autor?.full_name
                    ? noticia.autor.full_name
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")
                    : "Autor Não Definido"}
                </span>
              </div>
              <div className="flex items-center text-lg">
                <RiCalendarLine className="h-5 w-5 mr-2" />
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
                <RiTimeLine className="h-5 w-5 mr-2" />
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
            {imageUrl && !imageError ? (
              <div className="h-96 bg-slate-200 rounded-xl flex items-center justify-center mb-8 shadow-lg border border-slate-200 overflow-hidden">
                <Image
                  src={imageUrl || ""}
                  alt={noticia.titulo}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                  priority
                  onError={handleImageError}
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-8 shadow-lg border border-slate-200">
                <div className="text-center text-slate-400">
                  <RiImageLine className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm">Imagem não disponível</p>
                </div>
              </div>
            )}

            {/* Conteúdo */}
            <Card className="border-slate-200 shadow-lg mb-8 border-2 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-8">
                {noticia.resumo && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-navy-600 rounded-r">
                    <p className="text-slate-700 italic font-medium">
                      {noticia.resumo}
                    </p>
                  </div>
                )}
                <div
                  className="prose prose-lg max-w-none 
                    prose-headings:font-bebas prose-headings:tracking-wide prose-headings:text-slate-800 
                    prose-p:text-slate-600 prose-p:text-base prose-p:leading-relaxed
                    prose-strong:text-slate-800 prose-strong:font-bold
                    prose-li:text-slate-600 prose-li:text-base
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-a:text-navy-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-navy-600 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4
                    prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto"
                  dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
                />
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
              <Button
                variant="outline"
                onClick={() => router.push("/noticias")}
                className="border-2 border-navy-600 text-navy-600 hover:bg-navy-600 hover:text-white font-semibold py-3 px-6 transition-all duration-300 hover:scale-105"
              >
                <RiArrowLeftLine className="mr-2 h-4 w-4" />
                Ver Todas as Notícias
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-slate-600 font-medium">
                  Compartilhar:
                </span>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleShare}
                  className="rounded-full w-12 h-12 hover:bg-navy-600 hover:text-white transition-all duration-300 border border-slate-200"
                >
                  <RiShareLine className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Notícias Relacionadas */}
            {noticiasRelacionadas.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bebas tracking-wide text-slate-800 mb-4">
                    NOTÍCIAS RELACIONADAS
                  </h2>
                  <div className="w-20 h-1 bg-navy-600 mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {noticiasRelacionadas.map((noticiaRelacionada) => (
                    <Card
                      key={noticiaRelacionada.id}
                      className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 bg-white/60 backdrop-blur-sm hover:border-navy-300/50"
                    >
                      <CardContent className="p-6">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 mb-3 border-0"
                        >
                          <RiNewspaperLine className="w-3 h-3 mr-1" />
                          {noticiaRelacionada.categoria}
                        </Badge>
                        <h3 className="font-bebas tracking-wide text-lg text-slate-800 mb-2 leading-tight group-hover:text-navy-600 transition-colors">
                          {noticiaRelacionada.titulo}
                        </h3>
                        <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-2">
                          {noticiaRelacionada.resumo ||
                            noticiaRelacionada.conteudo.slice(0, 120) + "..."}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-navy-200 text-navy-700 hover:bg-navy-600 hover:text-white hover:border-navy-600 transition-all duration-300 group/btn"
                        >
                          <Link href={`/noticias/${noticiaRelacionada.slug}`}>
                            Continuar Lendo
                            <RiArrowRightLine className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
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
