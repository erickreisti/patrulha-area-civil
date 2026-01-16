"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useRouter } from "next/navigation";
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
  RiEyeLine,
  RiEyeOffLine,
  RiStarFill,
} from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useNoticiasStore, NoticiaLista } from "@/lib/stores/useNoticiasStore";
import { getNewsBySlug, getNewsByCategory } from "@/app/actions/news/noticias";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function NoticiaPage({ params }: PageProps) {
  const router = useRouter();

  // Usar o store de notícias
  const {
    noticiaDetalhe,
    noticiasRelacionadas,
    loadingDetalhe,
    setNoticiaDetalhe,
    setNoticiasRelacionadas,
    setLoadingDetalhe,
    clearNoticiaDetalhe,
    clearNoticiasRelacionadas,
  } = useNoticiasStore();

  const [slug, setSlug] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);

  // Carregar parâmetros
  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  // Função para corrigir URL da imagem
  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;

    if (url.startsWith("http")) return url;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = "imagens-noticias";

    if (url.includes("/") && !url.startsWith("http")) {
      if (url.includes(bucket)) {
        return `${supabaseUrl}/storage/v1/object/public/${url}`;
      } else {
        return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
      }
    }

    return url;
  };

  // Função para buscar notícia por slug
  const fetchNoticiaPorSlug = useCallback(
    async (slugParam: string) => {
      setLoadingDetalhe(true);
      try {
        const result = await getNewsBySlug(slugParam);

        if (result.success && result.data) {
          setNoticiaDetalhe(result.data);
          return result.data;
        } else {
          setNotFoundError(true);
          return null;
        }
      } catch (error) {
        console.error("Erro ao buscar notícia:", error);
        setNotFoundError(true);
        return null;
      } finally {
        setLoadingDetalhe(false);
      }
    },
    [setLoadingDetalhe, setNoticiaDetalhe]
  );

  // Função para buscar notícias relacionadas
  const fetchNoticiasRelacionadas = useCallback(
    async (categoria: string | null, excludeId: string) => {
      if (!categoria) return;

      try {
        const result = await getNewsByCategory(categoria, 3);

        if (result.success && result.data) {
          const relacionadas = result.data.filter(
            (noticia: NoticiaLista) => noticia.id !== excludeId
          );
          setNoticiasRelacionadas(relacionadas);
        }
      } catch (error) {
        console.error("Erro ao buscar notícias relacionadas:", error);
      }
    },
    [setNoticiasRelacionadas]
  );

  // Carregar notícia e relacionadas
  useEffect(() => {
    let isMounted = true;

    if (!slug) return;

    const loadNoticia = async () => {
      try {
        const noticia = await fetchNoticiaPorSlug(slug);

        if (!isMounted) return;

        if (!noticia) {
          setNotFoundError(true);
          return;
        }

        // Carregar notícias relacionadas da mesma categoria
        if (noticia.categoria && noticia.id) {
          fetchNoticiasRelacionadas(noticia.categoria, noticia.id);
        }
      } catch (error) {
        console.error("Erro ao carregar notícia:", error);
        setNotFoundError(true);
      }
    };

    loadNoticia();

    return () => {
      isMounted = false;
      clearNoticiaDetalhe();
      clearNoticiasRelacionadas();
    };
  }, [
    slug,
    fetchNoticiaPorSlug,
    fetchNoticiasRelacionadas,
    clearNoticiaDetalhe,
    clearNoticiasRelacionadas,
  ]);

  // Redirecionar para 404 se notícia não for encontrada
  useEffect(() => {
    if (notFoundError && !loadingDetalhe) {
      notFound();
    }
  }, [notFoundError, loadingDetalhe]);

  const handleShare = async () => {
    if (navigator.share && noticiaDetalhe) {
      try {
        await navigator.share({
          title: noticiaDetalhe.titulo,
          text: noticiaDetalhe.resumo || "",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
        navigator.clipboard.writeText(window.location.href);
        alert("Link copiado para a área de transferência!");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  const handleImageError = () => {
    console.log("❌ Erro ao carregar imagem da notícia");
    setImageError(true);
  };

  // Função para formatar nome
  const formatName = (name: string | null | undefined): string => {
    if (!name) return "Autor Não Definido";

    return name
      .split(" ")
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  };

  if (loadingDetalhe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-200 rounded w-32"></div>
            <div className="h-12 bg-slate-200 rounded w-3/4 mb-6"></div>
            <div className="h-96 bg-slate-200 rounded mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!noticiaDetalhe) {
    return null; // O notFound() será chamado pelo useEffect
  }

  const imageUrl = getImageUrl(noticiaDetalhe.imagem);
  const readingTime = Math.ceil((noticiaDetalhe.conteudo?.length || 0) / 1000);
  const isPublished = noticiaDetalhe.status === "publicado";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-navy-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-navy-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/noticias")}
              className="mb-8 text-navy-200 hover:text-white hover:bg-navy-500/20 transition-colors hover:border-navy-300/50 px-4 py-2 rounded-lg border border-navy-300/20"
            >
              <RiArrowLeftLine className="mr-2 h-4 w-4" />
              Voltar Para Notícias
            </Button>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 px-4 py-2 text-sm font-medium">
                <RiNewspaperLine className="w-4 h-4 mr-2" />
                {noticiaDetalhe.categoria || "Geral"}
              </Badge>

              <Badge
                variant={isPublished ? "default" : "secondary"}
                className="backdrop-blur-sm text-sm"
              >
                {isPublished ? (
                  <RiEyeLine className="w-4 h-4 mr-1" />
                ) : (
                  <RiEyeOffLine className="w-4 h-4 mr-1" />
                )}
                {isPublished ? "Publicado" : "Rascunho"}
              </Badge>

              {noticiaDetalhe.destaque && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white backdrop-blur-sm text-sm">
                  <RiStarFill className="w-4 h-4 mr-1" />
                  Destaque
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide leading-tight">
              {noticiaDetalhe.titulo}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-navy-100">
              <div className="flex items-center text-lg">
                <RiUserLine className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {formatName(noticiaDetalhe.autor?.full_name)}
                  {noticiaDetalhe.autor?.graduacao &&
                    ` • ${noticiaDetalhe.autor.graduacao}`}
                </span>
              </div>
              <div className="flex items-center text-lg">
                <RiCalendarLine className="h-5 w-5 mr-2" />
                <span>
                  {new Date(noticiaDetalhe.data_publicacao).toLocaleDateString(
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
                <span>{readingTime} min de leitura</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conteúdo da Notícia */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            {/* Imagem de destaque */}
            {imageUrl && !imageError ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="h-96 bg-slate-200 rounded-xl flex items-center justify-center mb-8 shadow-lg border border-slate-200 overflow-hidden"
              >
                <Image
                  src={imageUrl}
                  alt={noticiaDetalhe.titulo}
                  fill
                  className="object-cover"
                  priority
                  onError={handleImageError}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                />
              </motion.div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-8 shadow-lg border border-slate-200">
                <div className="text-center text-slate-400">
                  <RiImageLine className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm">Imagem não disponível</p>
                </div>
              </div>
            )}

            {/* Conteúdo */}
            <Card className="border-2 border-slate-200 shadow-lg mb-8 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                {noticiaDetalhe.resumo && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-navy-50 to-blue-50 border-l-4 border-navy-600 rounded-r">
                    <p className="text-slate-700 italic font-medium">
                      {noticiaDetalhe.resumo}
                    </p>
                  </div>
                )}
                {noticiaDetalhe.conteudo ? (
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
                      prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:border prose-img:border-slate-200
                      prose-table:border prose-table:border-slate-300 prose-table:rounded-lg
                      prose-th:bg-slate-100 prose-th:p-3 prose-th:text-slate-700
                      prose-td:p-3 prose-td:border-t prose-td:border-slate-300"
                    dangerouslySetInnerHTML={{
                      __html: noticiaDetalhe.conteudo,
                    }}
                  />
                ) : (
                  <p className="text-slate-500 italic">
                    Conteúdo da notícia não disponível.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Ações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12"
            >
              <Button
                variant="outline"
                onClick={() => router.push("/noticias")}
                className="border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white font-semibold py-3 px-6 transition-all duration-300 hover:scale-105"
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
                  className="rounded-full w-12 h-12 hover:bg-navy-600 hover:text-white transition-all duration-300 border border-slate-200 hover:border-navy-600"
                >
                  <RiShareLine className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Notícias Relacionadas */}
            {noticiasRelacionadas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bebas tracking-wide text-slate-800 mb-4">
                    NOTÍCIAS RELACIONADAS
                  </h2>
                  <div className="w-20 h-1 bg-navy-600 mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {noticiasRelacionadas.map(
                    (noticiaRelacionada: NoticiaLista) => {
                      const isRelatedPublished =
                        noticiaRelacionada.status === "publicado";

                      return (
                        <Card
                          key={noticiaRelacionada.id}
                          className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white/60 backdrop-blur-sm hover:border-navy-300/50"
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge
                                variant="secondary"
                                className="bg-slate-100 text-slate-700 border-0"
                              >
                                <RiNewspaperLine className="w-3 h-3 mr-1" />
                                {noticiaRelacionada.categoria || "Geral"}
                              </Badge>

                              {noticiaRelacionada.destaque && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                  <RiStarFill className="w-3 h-3 mr-1" />
                                  Destaque
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-bebas tracking-wide text-lg text-slate-800 mb-2 leading-tight group-hover:text-navy-600 transition-colors line-clamp-2">
                              {noticiaRelacionada.titulo}
                            </h3>

                            <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3">
                              {noticiaRelacionada.resumo ||
                                "Leia mais sobre esta notícia..."}
                            </p>

                            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                              <div className="flex items-center">
                                <RiCalendarLine className="h-3 w-3 mr-1" />
                                <span>
                                  {new Date(
                                    noticiaRelacionada.data_publicacao
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {isRelatedPublished ? "Publicado" : "Rascunho"}
                              </Badge>
                            </div>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full border-navy-200 text-navy-700 hover:bg-navy-600 hover:text-white hover:border-navy-600 transition-all duration-300 group/btn"
                            >
                              <Link
                                href={`/noticias/${noticiaRelacionada.slug}`}
                                prefetch={true}
                                scroll={true}
                              >
                                Continuar Lendo
                                <RiArrowRightLine className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    }
                  )}
                </div>
              </motion.div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
